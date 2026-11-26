/* Stock AC and CSP both dispatch the invalid-state PIT through CarAvatar::goToSpawnPosition.
   Keep CSP's wheel-load test and deadline. Set AC's ordinary physics retirement
   when the PIT request is inside RaceManager's actual recovery call. */
enum { SPAWN_MOVE = 0x0d3b34, RECOVER_CALL = 0x141656, FORCE_POSITION = 0x0d2f30,
       IGNORE_FUEL_LAP = 0x28d350, AI_RETIRE = 0x29c1a6 };
static const unsigned char spawn_move[] = {
    0x48,0x8b,0x8f,0x68,0x11,0x00,0x00, 0x48,0x85,0xc9, 0x74,0x0e,
    0x48,0x81,0xc1,0xf8,0x3a,0x00,0x00, 0xb2,0x01, 0xe8,0x02,0x98,0x1b,0x00,
    0x48,0x8d,0x54,0x24,0x20, 0x48,0x8b,0xcf, 0xe8,0xd5,0xf3,0xff,0xff
};
static unsigned char *rollover_base;
static unsigned char installed_spawn[sizeof(spawn_move)];

// MSVC's short wstring stores three UTF-16 units inline, followed by size and capacity.
typedef struct { uint16_t chars[8]; size_t length, capacity; } SpawnName;

static bool recover_opponent(const unsigned char *avatar, const unsigned char *car, const SpawnName *name) {
    if (!car || !avatar[0xdec] || !*(const uint32_t *)(car + 0x3238)) return false;
    if (name->length != 3 || name->capacity != 7 ||
        name->chars[0] != 'P' || name->chars[1] != 'I' || name->chars[2] != 'T') return false;
    // Follow Windows unwind records. An unrelated pit stop or an unrecognised call chain
    // must run the original spawn code, including CSP's stuck/damage and finisher moves.
    void *frames[32];
    unsigned count = RtlCaptureStackBackTrace(0, COUNT(frames), frames, NULL);
    for (unsigned i = 0; i < count; ++i)
        if (frames[i] == rollover_base + RECOVER_CALL + 5) return true;
    return false;
}

static void spawn_or_retire(unsigned char *avatar, const void *matrix, const SpawnName *name) {
    unsigned char *car = *(unsigned char **)(avatar + 0x1168);
    if (recover_opponent(avatar, car, name)) {
        car[0xf0] = 1;  // Car::isRetired, consumed by AIDriver::acquireControls on the physics step.
        // CSP can deactivate a retired car immediately. Complete this PIT move so the track
        // script sees isRetired + isInPit and can transfer it to its TIME_ATTACK parking node.
    }
    if (car) ((void (*)(void *, bool))(rollover_base + IGNORE_FUEL_LAP))(car + 0x3af8, true);
    ((void (*)(void *, const void *))(rollover_base + FORCE_POSITION))(avatar, matrix);
}

static const wchar_t *rollover_gate(void) { return race_gate(true); }

static const wchar_t *rollover_start(unsigned char *base) {
    static const unsigned char recovery[] = {0xe8,0xe5,0xec,0xff,0xff};
    static const unsigned char retire[] = {0xc6,0x80,0xf0,0,0,0,1};
    unsigned char call[sizeof(recovery)], flag[sizeof(retire)];
    if (!read_bytes(base + RECOVER_CALL, call, sizeof(call)) ||
        !read_bytes(base + AI_RETIRE, flag, sizeof(flag))) return L"off: recovery differs";
    for (size_t i = 0; i < sizeof(call); ++i) if (call[i] != recovery[i]) return L"off: recovery differs";
    for (size_t i = 0; i < sizeof(flag); ++i) if (flag[i] != retire[i]) return L"off: retirement differs";
    // Same Win64 frame, shadow space and original epilogue. Pass the avatar (rdi), the spawn
    // matrix on the stack and the spawn name (rbx). The DLL can load anywhere under ASLR.
    static const unsigned char args[] = {0x48,0x89,0xf9, 0x48,0x8d,0x54,0x24,0x20, 0x49,0x89,0xd8, 0x48,0xb8};
    uintptr_t handler = (uintptr_t)spawn_or_retire;
    size_t n = 0;
    for (; n < sizeof(args); ++n) installed_spawn[n] = args[n];
    for (size_t i = 0; i < sizeof(handler); ++i) installed_spawn[n++] = (unsigned char)(handler >> (8*i));
    installed_spawn[n++] = 0xff; installed_spawn[n++] = 0xd0;
    while (n < sizeof(spawn_move)) installed_spawn[n++] = 0x90;
    rollover_base = base;
    if (change_instructions(base + SPAWN_MOVE, spawn_move, installed_spawn, sizeof(spawn_move))) return L"active";
    rollover_base = NULL;
    return L"off: spawn differs/write";
}

static bool rollover_stop(void) {
    if (rollover_base && !change_instructions(rollover_base + SPAWN_MOVE, installed_spawn,
                                              spawn_move, sizeof(spawn_move))) return false;
    rollover_base = NULL;
    return true;
}
