#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define API __declspec(dllimport)
#define EXPORT __declspec(dllexport)
API void *GetModuleHandleW(const wchar_t *);
API unsigned long GetModuleFileNameW(void *, wchar_t *, unsigned long);
API void *CreateFileW(const wchar_t *, unsigned long, unsigned long, void *, unsigned long, unsigned long, void *);
API unsigned long GetFileSize(void *, unsigned long *);
API int ReadFile(void *, void *, unsigned long, unsigned long *, void *);
API int CloseHandle(void *);
API void *GetProcessHeap(void);
API void *HeapAlloc(void *, unsigned long, size_t);
API int HeapFree(void *, unsigned long, void *);
API int ReadProcessMemory(void *, const void *, void *, size_t, size_t *);
API long SHGetFolderPathW(void *, int, void *, unsigned long, wchar_t *);
API unsigned long GetPrivateProfileStringW(const wchar_t *, const wchar_t *, const wchar_t *,
                                          wchar_t *, unsigned long, const wchar_t *);
API int VirtualProtect(void *, size_t, unsigned long, unsigned long *);
API int FlushInstructionCache(void *, const void *, size_t);
API void *GetCurrentProcess(void);

#define COUNT(a) (sizeof(a) / sizeof(*(a)))

static bool read_bytes(const void *src, void *out, size_t n) {
    size_t got = 0;
    return ReadProcessMemory(GetCurrentProcess(), src, out, n, &got) && got == n;
}

static bool append(wchar_t *out, size_t capacity, const wchar_t *suffix) {
    size_t n = 0;
    while (n < capacity && out[n]) ++n;
    while (*suffix && n + 1 < capacity) out[n++] = *suffix++;
    if (n >= capacity) return false;
    out[n] = 0;
    return !*suffix;
}

static bool equal(const wchar_t *a, const wchar_t *b) {
    while (*a && *a == *b) { ++a; ++b; }
    return *a == *b;
}

static bool setting(const wchar_t *ini, const wchar_t *section, const wchar_t *key,
                    const wchar_t *expected) {
    wchar_t value[80];
    GetPrivateProfileStringW(section, key, L"?", value, 80, ini);
    return equal(value, expected);
}

#include "route_json.h"

static bool route_file(const wchar_t *path) {
    void *file = CreateFileW(path, 0x80000000 /* GENERIC_READ */, 1 /* FILE_SHARE_READ */, NULL,
                             3 /* OPEN_EXISTING */, 0, NULL);
    if (file == (void *)(intptr_t)-1) return false;
    unsigned long high = 0, got = 0;
    unsigned long size = GetFileSize(file, &high);
    // Bound allocation inside AC. Even long generated Routes store a thinned line of at most 2000 points.
    void *heap = GetProcessHeap();
    unsigned char *bytes = !high && size && size <= 16 * 1024 * 1024 ? HeapAlloc(heap, 0, size) : NULL;
    bool ok = bytes && ReadFile(file, bytes, size, &got, NULL) && got == size && route_json(bytes, size);
    if (bytes) HeapFree(heap, 0, bytes);
    CloseHandle(file);
    return ok;
}

static bool track_metadata(const wchar_t *ini) {
    wchar_t track[256], path[640];
    unsigned long len = GetPrivateProfileStringW(L"RACE", L"TRACK", L"", track, COUNT(track), ini);
    if (!len || len >= COUNT(track)-1 || track[len-1] == L'.' || track[len-1] == L' ') return false;
    for (size_t i = 0; i < len; ++i) {
        if (track[i] < 32) return false;
        for (const wchar_t *p = L"<>:\"/\\|?*"; *p; ++p) if (*p == track[i]) return false;
    }
    len = GetModuleFileNameW(NULL, path, COUNT(path));
    if (!len || len >= COUNT(path)) return false;
    while (len && path[len-1] != L'\\' && path[len-1] != L'/') --len;
    if (!len) return false;
    path[len] = 0;
    if (!append(path, COUNT(path), L"content\\tracks\\") ||
        !append(path, COUNT(path), track) || !append(path, COUNT(path), L"\\data\\map2lap.json")) return false;
    return route_file(path);
}

static bool known_image(const unsigned char *base) {
    static const unsigned char rsds[] = {
        0x52,0x53,0x44,0x53,0x21,0x74,0xee,0x9b,0xfe,0x88,0xc4,0x47,
        0xb5,0x6c,0x15,0x49,0x64,0x09,0xa8,0xde,0x2f,0,0,0
    };
    uint32_t offset;
    unsigned char pe[0x54], codeview[sizeof(rsds)];
    if (!base || !read_bytes(base + 0x3c, &offset, sizeof(offset)) || offset != 0x148 ||
        !read_bytes(base + offset, pe, sizeof(pe))) return false;
    if (*(const uint32_t *)pe != 0x4550 || *(const uint32_t *)(pe+8) != 0x5a55e7a8 ||
        *(const uint32_t *)(pe+0x50) != 0x15e1000) return false;
    if (!read_bytes(base + 0x1419f20, codeview, sizeof(codeview))) return false;
    for (size_t i = 0; i < sizeof(rsds); ++i) if (codeview[i] != rsds[i]) return false;
    return true;
}

#include "green_clock.h"

typedef struct {
    const wchar_t *name;
    const wchar_t *(*gate)(void);
    const wchar_t *(*start)(unsigned char *);
    bool (*stop)(void);
    const wchar_t *status;
} Feature;

static Feature features[] = {
    { L" green=", green_gate, green_start, green_stop, NULL }
};

EXPORT bool acpInit(void *host) {
    (void)host;
    unsigned char *base = GetModuleHandleW(L"acs.exe");
    bool known = known_image(base);
    for (size_t i = 0; i < COUNT(features); ++i) {
        Feature *part = features + i;
        if (part->status) continue;
        const wchar_t *reason = part->gate();
        part->status = reason ? reason : known ? part->start(base) : L"off: unknown image";
    }
    return true;
}

EXPORT bool acpGetName(wchar_t *out) {
    if (!out) return false;
    *out = 0;
    // AC logs this before Init. Evaluate the gate read-only, then Init checks again.
    append(out, 80, L"Map2Lap");
    for (size_t i = 0; i < COUNT(features); ++i) {
        const Feature *part = features + i;
        const wchar_t *state = part->status ? part->status : part->gate();
        append(out, 80, part->name);
        append(out, 80, state ? state : L"pending");
    }
    return true;
}

EXPORT bool acpUpdate(const void *player, float dt) {
    (void)player; (void)dt;
    return true;
}

EXPORT bool acpShutdown(void) {
    bool ok = true;
    for (size_t i = COUNT(features); i > 0; --i) {
        Feature *part = features + i-1;
        if (part->stop()) part->status = NULL;
        else { part->status = L"restore failed"; ok = false; }
    }
    return ok;
}
