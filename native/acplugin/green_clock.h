/* A-B finish timing, owned by this feature alone. */
enum { STEP = 0x2911f0, STEP_END = 0x2913cc, CLOCK = 0x29138f };
static bool stock_timer(const unsigned char *base) {
    // No relocations in this function. Defer if CSP or another mod owns these instructions.
    uint32_t h = 2166136261u;
    unsigned char bytes[STEP_END - STEP];
    if (!read_bytes(base + STEP, bytes, sizeof(bytes))) return false;
    for (size_t i = 0; i < sizeof(bytes); ++i) h = (h ^ bytes[i]) * 16777619u;
    return h == 0x459c574bu;
}

// AC increments t by 3 for every executed step. PhysicsDriveThread can advance
// physicsTime over an entire backlog, so derive the A-B race clock from the
// scheduled green and the current physics timestamp, both in milliseconds.
static const unsigned char tick_clock[25] = {
    0x8b,0x06,0x0f,0x57,0xc0,0xf2,0x48,0x0f,0x2a,0xc0,
    0xf2,0x0f,0x58,0x05,0x47,0x6d,0x23,0x00,0xf2,0x48,0x0f,0x2c,0xc0,0x89,0x06
};
static const unsigned char green_clock[25] = {
    0xf2,0x0f,0x10,0x41,0x20,                 // movsd xmm0, [rcx+20h]  physicsTime
    0xf2,0x0f,0x5c,0x81,0x78,0x01,0x00,0x00, // subsd xmm0, [rcx+178h] startTimeMS
    0xf2,0x0f,0x2c,0xc0,                      // cvttsd2si eax, xmm0
    0x89,0x06,                                // mov [rsi], eax
    0x66,0x0f,0x1f,0x44,0x00,0x00             // six-byte nop
};

static unsigned char *green_base;

static bool change_timer(unsigned char *base, bool enable) {
    unsigned char *site = base + CLOCK;
    unsigned char actual[sizeof(tick_clock)];
    const unsigned char *prior = enable ? tick_clock : green_clock;
    const unsigned char *next = enable ? green_clock : tick_clock;
    if (!read_bytes(site, actual, sizeof(actual))) return false;
    for (size_t i = 0; i < sizeof(actual); ++i)
        if (actual[i] != prior[i]) return false;
    unsigned long original, ignored;
    if (!VirtualProtect(site, sizeof(actual), 0x40, &original)) return false;
    for (size_t i = 0; i < sizeof(actual); ++i) site[i] = next[i];
    if (FlushInstructionCache(GetCurrentProcess(), site, sizeof(actual)) &&
        VirtualProtect(site, sizeof(actual), original, &ignored)) return true;
    for (size_t i = 0; i < sizeof(actual); ++i) site[i] = prior[i];
    FlushInstructionCache(GetCurrentProcess(), site, sizeof(actual));
    VirtualProtect(site, sizeof(actual), original, &ignored);
    return false;
}

static const wchar_t *green_gate(void) {
    wchar_t ini[320];
    if (SHGetFolderPathW(NULL, 5 /* documents */, NULL, 0, ini) != 0 ||
        !append(ini, COUNT(ini), L"\\Assetto Corsa\\cfg\\race.ini")) return L"off: race.ini";
    if (!setting(ini, L"SESSION_0", L"TYPE", L"3")) return L"off: session";
    // AC launchers can supply either lap count. Reject conflicting or missing counts.
    wchar_t laps[16], race_laps[16];
    GetPrivateProfileStringW(L"SESSION_0", L"LAPS", L"\x1f", laps, COUNT(laps), ini);
    GetPrivateProfileStringW(L"RACE", L"RACE_LAPS", L"\x1f", race_laps, COUNT(race_laps), ini);
    bool session_one = equal(laps, L"1"), race_one = equal(race_laps, L"1");
    if (!(session_one && (race_one || equal(race_laps, L"\x1f"))) &&
        !(race_one && equal(laps, L"\x1f"))) return L"off: laps";
    if (!setting(ini, L"REMOTE", L"ACTIVE", L"0")) return L"off: remote";
    if (!setting(ini, L"REPLAY", L"ACTIVE", L"0")) return L"off: replay";
    return track_metadata(ini) ? NULL : L"off: track";
}

static const wchar_t *green_start(unsigned char *base) {
    if (!stock_timer(base)) return L"off: timer differs";
    if (!change_timer(base, true)) return L"off: write failed";
    green_base = base;
    return L"active";
}

static bool green_stop(void) {
    if (green_base && !change_timer(green_base, false)) return false;
    green_base = NULL;
    return true;
}
