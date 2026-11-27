/* Read-only AI probe for tools/ai_race.py --dll-probe. It changes no instruction.
   It writes Documents/Assetto Corsa/logs/map2lap_probe.txt:
   - site lines: 16 live bytes at stock AI function entries and at candidate AI constants, compared with
     the stock executable, so CSP's or another mod's hooks show up as DIFF;
   - car lines: per car, whether its controls provider is a stock AIDriver, CSP's byte in the AIDriver
     padding at 0x384 (suspected AI caution) and the AIDriver values the awareness code reads.
   Offsets come from the matching Kunos acs.pdb (docs/ac-plugins.md). */
enum { AIDRIVER_VTABLE = 0x4fbfd0 };

typedef struct { const char *name; uint32_t rva; unsigned char stock[16]; } ProbeSite;

static const ProbeSite probe_sites[] = {
    { "aware.entry", 0x29f8d0, {0xf3,0x0f,0x11,0x4c,0x24,0x10,0x55,0x56,0x41,0x54,0x41,0x56,0x48,0x8d,0xac,0x24} },
    { "engaged.entry", 0x29d3e0, {0xf3,0x0f,0x11,0x5c,0x24,0x20,0x55,0x48,0x8b,0xec,0x48,0x83,0xec,0x30,0xf3,0x0f} },
    { "gasbrake.entry", 0x2a08e0, {0x48,0x8b,0xc4,0x48,0x89,0x58,0x18,0x48,0x89,0x70,0x20,0x55,0x57,0x41,0x56,0x48} },
    { "steer.entry", 0x2a2630, {0x48,0x8b,0xc4,0x48,0x89,0x58,0x10,0x48,0x89,0x78,0x18,0x55,0x48,0x8d,0x68,0xd8} },
    { "push.entry", 0x29dd10, {0x83,0x79,0x68,0x01,0xf3,0x0f,0x10,0x0d,0xd4,0xb9,0x17,0x01,0x0f,0x28,0xd1,0x75} },
    { "acquire.entry", 0x29baa0, {0x48,0x8b,0xc4,0x55,0x56,0x41,0x56,0x48,0x8d,0x68,0xc8,0x48,0x81,0xec,0x20,0x01} },
    { "sides.entry", 0x29c4f0, {0x48,0x8b,0xc4,0x48,0x89,0x58,0x10,0x48,0x89,0x70,0x18,0x57,0x48,0x83,0xec,0x70} },
    { "apex.entry", 0x29d130, {0x40,0x53,0x48,0x81,0xec,0x80,0x00,0x00,0x00,0x0f,0x29,0x74,0x24,0x70,0x0f,0x29} },
    { "engagement.entry", 0x270660, {0x4c,0x8b,0xdc,0x49,0x89,0x5b,0x20,0xf3,0x0f,0x11,0x4c,0x24,0x10,0x55,0x41,0x54} },
    { "speed.entry", 0x272160, {0x48,0x83,0xec,0x18,0x8b,0x81,0x90,0x3e,0x00,0x00,0xc7,0x04,0x24,0x00,0x00,0x00} },
    { "halfwidth", 0x26d66a, {0xf3,0x0f,0x59,0x05,0x7a,0xc0,0x1a,0x01,0xf3,0x0f,0x58,0x05,0xda,0x03,0x24,0x00} },
    { "engaged.0_03", 0x29d43e, {0xf3,0x0f,0x59,0x15,0x3a,0xb9,0x25,0x00,0xf3,0x0f,0x10,0x88,0xe8,0x00,0x00,0x00} },
    { "engaged.3", 0x29d44e, {0xf3,0x0f,0x59,0x0d,0xa2,0xc2,0x17,0x01,0xf3,0x0f,0x58,0x15,0x92,0xc2,0x17,0x01} },
    { "rate.3", 0x29f94e, {0xf3,0x0f,0x10,0x0d,0xa2,0x9d,0x17,0x01,0x48,0x89,0x9c,0x24,0x10,0x02,0x00,0x00} },
    { "pass.2_5", 0x29f983, {0xf3,0x0f,0x59,0x05,0x75,0xee,0x20,0x00,0x4c,0x89,0xbc,0x24,0xf8,0x01,0x00,0x00} },
    { "tti.6", 0x29fe15, {0xf3,0x0f,0x5c,0x05,0xbb,0x45,0x21,0x00,0xf3,0x0f,0x5e,0xd1,0x41,0x0f,0x28,0xc8} },
    { "rate.4", 0x2a00a8, {0xf3,0x0f,0x10,0x05,0xb8,0x67,0x20,0x00,0xf3,0x0f,0x11,0x44,0x24,0x70,0x44,0x0f} },
    { "clear.2", 0x2a010a, {0xf3,0x44,0x0f,0x10,0x35,0x51,0x67,0x20,0x00,0xf3,0x0f,0x10,0x35,0xf1,0x95,0x17} },
    { "target.1_5", 0x2a0168, {0xf3,0x44,0x0f,0x10,0x3d,0x77,0x3e,0x21,0x00,0xf3,0x0f,0x10,0xb5,0x58,0x01,0x00} },
    { "tti.3", 0x2a0394, {0x0f,0x2f,0x15,0x5d,0x93,0x17,0x01,0x0f,0x82,0x3a,0x02,0x00,0x00,0xe9,0xf0,0x01} },
    { "target.mul", 0x2a0427, {0xf3,0x45,0x0f,0x59,0xdf,0x76,0x13,0xf3,0x44,0x0f,0x10,0x53,0x08,0xf3,0x0f,0x10} },
    { "apex.200", 0x2a0477, {0x0f,0x2f,0x05,0x2e,0x16,0x21,0x00,0x77,0x05,0x45,0x32,0xf6,0xeb,0x03,0x41,0xb6} },
    { "room.0_2", 0x2a04d7, {0xf3,0x0f,0x59,0x05,0x69,0xd5,0x20,0x00,0xf3,0x41,0x0f,0x58,0xc5,0xf3,0x0f,0x59} },
    { "room.mul", 0x2a04e4, {0xf3,0x0f,0x59,0xc6,0x44,0x0f,0x2f,0xe0,0x76,0x23,0x44,0x0f,0x2f,0x4b,0x14,0x73} },
    { "tti.2", 0x2a056e, {0x44,0x0f,0x2f,0x73,0x14,0x0f,0x87,0xd3,0x00,0x00,0x00,0x84,0xc0,0x0f,0x85,0xcb} },
    { "brake.8", 0x2a05e9, {0xf3,0x0f,0x5c,0x05,0x13,0xe2,0x20,0x00,0x48,0x89,0x5d,0x80,0xf3,0x0f,0x11,0x44} },
    { "brake.7", 0x2a065a, {0xf3,0x0f,0x5c,0x05,0xfe,0x9b,0x21,0x00,0x48,0x89,0x5d,0x80,0xf3,0x0f,0x11,0x44} },
};

// Seconds after the first update. Late samples catch hooks and caution values set after Init.
static const float probe_times[] = {0.f, 3.f, 15.f, 45.f, 90.f};

static void *probe_file;
static unsigned char *probe_base;
static float probe_clock;
static size_t probe_next;

typedef struct { char text[600]; size_t n; } Line;

static void put(Line *l, const char *s) {
    while (*s && l->n + 2 < sizeof(l->text)) l->text[l->n++] = *s++;
}

static void put_uint(Line *l, uint64_t v) {
    char digits[24];
    size_t n = 0;
    do { digits[n++] = (char)('0' + v % 10); v /= 10; } while (v);
    while (n && l->n + 2 < sizeof(l->text)) l->text[l->n++] = digits[--n];
}

static void put_hex(Line *l, uint64_t v, int width) {
    for (int i = width - 1; i >= 0 && l->n + 2 < sizeof(l->text); --i)
        l->text[l->n++] = "0123456789abcdef"[(v >> (4*i)) & 15];
}

static void put_float(Line *l, float v) {
    if (v != v) { put(l, "nan"); return; }
    if (v < 0) { put(l, "-"); v = -v; }
    if (v >= 1e9f) { put(l, "big"); return; }
    uint64_t milli = (uint64_t)(v * 1000.f + 0.5f);
    put_uint(l, milli / 1000);
    put(l, ".");
    char frac[4] = {(char)('0' + milli / 100 % 10), (char)('0' + milli / 10 % 10), (char)('0' + milli % 10), 0};
    put(l, frac);
}

static void emit(Line *l) {
    l->text[l->n++] = '\n';
    unsigned long wrote = 0;
    WriteFile(probe_file, l->text, (unsigned long)l->n, &wrote, NULL);
    l->n = 0;
}

static bool read_ptr(const void *at, const unsigned char **out) {
    return read_bytes(at, out, sizeof(*out));
}

static void put_field(Line *l, const unsigned char *at) {
    float v;
    put(l, ",");
    if (read_bytes(at, &v, sizeof(v))) put_float(l, v);
    else put(l, "?");
}

static void probe_log_sites(void) {
    Line l;
    l.n = 0;
    for (size_t i = 0; i < COUNT(probe_sites); ++i) {
        const ProbeSite *site = probe_sites + i;
        unsigned char live[16];
        bool ok = read_bytes(probe_base + site->rva, live, sizeof(live)), same = ok;
        for (size_t k = 0; ok && k < sizeof(live); ++k) same = same && live[k] == site->stock[k];
        put(&l, "site,"); put_float(&l, probe_clock); put(&l, ","); put(&l, site->name);
        put(&l, ",0x"); put_hex(&l, site->rva, 6);
        put(&l, !ok ? ",unreadable," : same ? ",stock," : ",DIFF,");
        for (size_t k = 0; ok && k < sizeof(live); ++k) put_hex(&l, live[k], 2);
        emit(&l);
    }
}

static void probe_log_cars(void) {
    // ACPlugin keeps the player's Car at +0x68 before it calls acpInit. Car::ksPhysics (+0x138) is the
    // PhysicsEngine, whose cars vector begins at +0x8. Every dereference goes through ReadProcessMemory.
    const unsigned char *player, *physics, *first, *last;
    Line l;
    l.n = 0;
    put(&l, "cars,"); put_float(&l, probe_clock);
    if (!acp_host || !read_ptr(acp_host + 0x68, &player) || !player ||
        !read_ptr(player + 0x138, &physics) || !physics ||
        !read_ptr(physics + 0x8, &first) || !read_ptr(physics + 0x10, &last) ||
        last < first || (size_t)(last - first) > 64 * sizeof(void *)) {
        put(&l, ",unreadable");
        emit(&l);
        return;
    }
    put(&l, ",count="); put_uint(&l, (size_t)(last - first) / sizeof(void *));
    emit(&l);
    put(&l, "car,t,index,vtable_rva,stock_ai,b384,aggression,aggressionHint,basePush,carHalfWidth,"
            "targetSpeed,desiredOffset,currentOffset,nextCarModifier,engagedPush,dynamicPush");
    emit(&l);
    for (size_t i = 0; first + i * sizeof(void *) < last; ++i) {
        const unsigned char *car, *driver, *vtable;
        put(&l, "car,"); put_float(&l, probe_clock); put(&l, ","); put_uint(&l, i);
        if (!read_ptr(first + i * sizeof(void *), &car) || !car ||
            !read_ptr(car + 0x3d80, &driver) || !driver || !read_ptr(driver, &vtable)) {
            put(&l, ",no-provider");
            emit(&l);
            continue;
        }
        put(&l, ",0x"); put_hex(&l, (uint64_t)(vtable - probe_base), 8);
        if (vtable != probe_base + AIDRIVER_VTABLE) {
            put(&l, ",0");
            emit(&l);
            continue;
        }
        unsigned char b384 = 0;
        put(&l, ",1,");
        if (read_bytes(driver + 0x384, &b384, 1)) put_uint(&l, b384);
        else put(&l, "?");
        static const unsigned short fields[] = {0x1c, 0x3e0, 0x28};
        for (size_t k = 0; k < COUNT(fields); ++k) put_field(&l, driver + fields[k]);
        put_field(&l, car + 0xe8);
        static const unsigned short more[] = {0x184, 0x23c, 0x238, 0x80, 0x37c, 0x19c};
        for (size_t k = 0; k < COUNT(more); ++k) put_field(&l, driver + more[k]);
        emit(&l);
    }
}

static const wchar_t *probe_gate(void) {
    wchar_t ini[320];
    const wchar_t *reason = race_gate(true);
    if (reason) return reason;
    if (!race_ini(ini) || !setting(ini, L"MAP2LAP_PROBE", L"ACTIVE", L"1")) return L"off: not requested";
    return NULL;
}

static const wchar_t *probe_start(unsigned char *base) {
    wchar_t path[320];
    if (SHGetFolderPathW(NULL, 5 /* documents */, NULL, 0, path) != 0 ||
        !append(path, COUNT(path), L"\\Assetto Corsa\\logs\\map2lap_probe.txt")) return L"off: log path";
    probe_file = CreateFileW(path, 0x40000000 /* GENERIC_WRITE */, 1 /* FILE_SHARE_READ */, NULL,
                             2 /* CREATE_ALWAYS */, 0, NULL);
    if (probe_file == (void *)(intptr_t)-1) { probe_file = NULL; return L"off: log file"; }
    probe_base = base;
    probe_clock = 0;
    probe_next = 0;
    Line l;
    l.n = 0;
    put(&l, "probe,host="); put(&l, acp_host ? "yes" : "no");
    emit(&l);
    put(&l, "site,t,name,rva,state,live16");
    emit(&l);
    probe_log_sites();
    return L"active";
}

static void probe_update(float dt) {
    if (!probe_file || probe_next >= COUNT(probe_times)) return;
    if (probe_next == 0) {
        Line l;
        l.n = 0;
        put(&l, "update,first_dt="); put_float(&l, dt);
        emit(&l);
    } else {
        probe_clock += dt;
    }
    if (probe_clock < probe_times[probe_next]) return;
    ++probe_next;
    probe_log_sites();
    probe_log_cars();
}

static bool probe_stop(void) {
    if (probe_file) CloseHandle(probe_file);
    probe_file = NULL;
    probe_base = NULL;
    return true;
}
