/* Linux test double for the Windows loader. No live process is accessed. */
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>
#define __declspec(x)
#include "../../native/acplugin/plugin.c"

static unsigned char image[0x15e1000];
static const wchar_t *track = L"drau_bruecke_test", *type = L"3";
static const wchar_t *remote = L"0", *replay = L"0";
static bool missing_file, short_read;
int ReadProcessMemory(void *process, const void *src, void *dest, size_t n, size_t *got) {
    (void)process; memcpy(dest,src,n); *got=n; return 1;
}
static unsigned protects;
static int deny_write, fail_flush;
void *GetModuleHandleW(const wchar_t *name) { (void)name; return image; }
unsigned long GetModuleFileNameW(void *module, wchar_t *out, unsigned long n) {
    (void)module; (void)n; wcscpy(out, L"C:\\AC\\acs.exe"); return wcslen(out);
}
static const char *metadata = "{\"area\":null}";
static const wchar_t *laps = L"1", *race_laps = L"1";

void *CreateFileW(const wchar_t *path, unsigned long access, unsigned long share, void *security,
                  unsigned long disposition, unsigned long flags, void *template) {
    (void)access; (void)share; (void)security; (void)disposition; (void)flags; (void)template;
    assert(!wcscmp(path, L"C:\\AC\\content\\tracks\\drau_bruecke_test\\data\\map2lap.json"));
    return missing_file ? (void *)(intptr_t)-1 : (void *)metadata;
}
unsigned long GetFileSize(void *file, unsigned long *high) {
    *high = 0; return (unsigned long)strlen(file);
}
int ReadFile(void *file, void *dest, unsigned long size, unsigned long *got, void *overlap) {
    (void)overlap; memcpy(dest, file, size); *got=short_read ? size - 1 : size; return 1;
}
int CloseHandle(void *handle) { (void)handle; return 1; }
void *GetProcessHeap(void) { return NULL; }
void *HeapAlloc(void *heap, unsigned long flags, size_t size) { (void)heap; (void)flags; return malloc(size); }
int HeapFree(void *heap, unsigned long flags, void *p) { (void)heap; (void)flags; free(p); return 1; }
long SHGetFolderPathW(void *h, int k, void *v, unsigned long n, wchar_t *out) {
    (void)h; (void)k; (void)v; (void)n; wcscpy(out, L"C:\\Docs"); return 0;
}
unsigned long GetPrivateProfileStringW(const wchar_t *sec, const wchar_t *key, const wchar_t *fallback,
                                        wchar_t *out, unsigned long n, const wchar_t *ini) {
    assert(!wcscmp(ini, L"C:\\Docs\\Assetto Corsa\\cfg\\race.ini"));
    const wchar_t *value = fallback;
    if (laps && !wcscmp(sec,L"SESSION_0") && !wcscmp(key,L"LAPS")) value=laps;
    if (race_laps && !wcscmp(sec,L"RACE") && !wcscmp(key,L"RACE_LAPS")) value=race_laps;
    assert(wcscmp(sec, L"MAP2LAP"));  // A launcher-specific section is irrelevant.
    if (!wcscmp(sec,L"RACE") && !wcscmp(key,L"TRACK")) value=track;
    if (!wcscmp(sec,L"SESSION_0") && !wcscmp(key,L"TYPE")) value=type;
    if (!wcscmp(sec,L"REMOTE") && !wcscmp(key,L"ACTIVE")) value=remote;
    if (!wcscmp(sec,L"REPLAY") && !wcscmp(key,L"ACTIVE")) value=replay;
    wcsncpy(out,value,n-1); out[n-1]=0; return wcslen(out);
}
int VirtualProtect(void *p, size_t n, unsigned long mode, unsigned long *old) {
    (void)p; (void)n; (void)mode; ++protects; *old=0x20; return !deny_write;
}
int FlushInstructionCache(void *p,const void *b,size_t n) {
    (void)p; (void)b; (void)n; if (fail_flush) { fail_flush=0; return 0; } return 1;
}
void *GetCurrentProcess(void) { return NULL; }

static void inactive(void) {
    wchar_t name[256];
    assert(acpGetName(name) && wcsstr(name,L"green=off"));
    assert(acpInit(NULL) && acpGetName(name) && wcsstr(name,L"green=off"));
    assert(acpShutdown() && !protects);
}
int main(int argc, char **argv) {
    wchar_t pending[80];
    assert(acpGetName(pending) && wcsstr(pending, L"green=pending"));
    metadata="{\"kind\":\"circuit\"}"; inactive();
    metadata="{\"kind\":\"area\"}"; inactive();
    metadata="{\"area\":[1,2,3,4]}"; inactive();
    metadata="{\"k\\u0069nd\":\"circuit\"}"; inactive();
    metadata="{\"area\":null,\"area\":[1]}"; inactive();
    metadata="{\"area\":null} trailing"; inactive();
    metadata="{\"broken\": [1,]}"; inactive();
    metadata="{\"area\":null,\"nested\":{\"kind\":\"circuit\"},\"title\":\"area\",\"kind\":\"route\"}";
    laps=L"2"; race_laps=L"2"; inactive(); race_laps=L"1"; inactive();
    laps=NULL; race_laps=NULL; inactive();
    laps=L"1"; assert(acpGetName(pending) && wcsstr(pending,L"green=pending"));
    laps=NULL; race_laps=L"1"; assert(acpGetName(pending) && wcsstr(pending,L"green=pending"));
    laps=L"1";
    type=L"4"; inactive(); type=L"1"; inactive(); type=L"3";
    remote=L"1"; inactive(); remote=L""; inactive(); remote=L"0";
    replay=L"1"; inactive(); replay=L"0";
    track=L"..\\outside"; inactive(); track=L"drau_bruecke_test";
    missing_file=true; inactive(); missing_file=false;
    short_read=true; inactive(); short_read=false;
    assert(argc==1 || argc==2);
    if (argc==1) return 0;
    FILE *f=fopen(argv[1],"rb");
    assert(f && fread(image,1,sizeof(image),f)==sizeof(image)); fclose(f);
    unsigned char original[0x1dc], expected[sizeof(original)];
    memcpy(original,image+0x2911f0,sizeof(original));
    memcpy(expected,original,sizeof(original));
    wchar_t name[256];
    image[0x1419f20]^=1; assert(acpInit(NULL)); assert(!protects); acpShutdown(); image[0x1419f20]^=1;
    image[0x29138f]^=1; assert(acpInit(NULL)); assert(!protects); acpShutdown(); image[0x29138f]^=1;
    deny_write=1; assert(acpInit(NULL)); assert(!memcmp(original,image+0x2911f0,sizeof(original)));
    assert(acpGetName(name) && wcsstr(name,L"failed")); acpShutdown(); deny_write=0;
    fail_flush=1; assert(acpInit(NULL)); assert(!memcmp(original,image+0x2911f0,sizeof(original)));
    assert(acpGetName(name) && wcsstr(name,L"failed")); acpShutdown();
    assert(acpInit(NULL) && acpGetName(name) && wcsstr(name,L"green=active"));
    memcpy(expected+0x29138f-0x2911f0,green_clock,sizeof(green_clock));
    assert(!memcmp(expected,image+0x2911f0,sizeof(expected)));
    assert(acpShutdown() && !memcmp(original,image+0x2911f0,sizeof(original)));
    puts("Gates, image and code mismatch, write failure, rollback, CLOCK only and shutdown passed.");
}
