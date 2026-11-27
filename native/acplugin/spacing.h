/* AI spacing: lets race opponents use the room that is physically there.
   Stock AC measures AI distances in Car::carHalfWidth, which it derives per car from half the wider axle
   track + 0.30 m, so a factor scales with each car. The air between two equal cars alongside is
   SIDE x carHalfWidth - body width: for the BMW M3 E30 DTM (half width 1.02 m, body 1.72 m) the bodies touch
   near SIDE 1.7, and 2.0 leaves 0.32 m. Cars whose body is much wider than their track keep less air.

   Each value replaces one memory operand. The constants themselves live in .rdata pools shared by many other
   instructions, so only that instruction's rel32 is redirected to our own float. race.ini [MAP2LAP_AI]
   requests a value; a missing key keeps that instruction stock. CSP hooks only the entries of these
   functions (measured with the probe), not these instructions.

   SIDE    3.0  AIDriver::getEngagedDesiredOffset: lateral gap held alongside (3.06 m BMW centre to centre).
   PASS    2.5  stepCarsAwareness2: base of every passing distance. The room check asks for more than
                PASS x carHalfWidth x (1 + PER_CAR x cars ahead) beside the car ahead, measured from its centre
                to the AI side line; physically that room must hold its half body, our whole body and air
                (about 2.9 m for the BMW, so stock 2.5 with one car ahead is only 0.5 m above it).
   PER_CAR 0.2  stepCarsAwareness2: extra room per car within 20 m + 0.2 x km/h ahead. In a pack at 150 km/h
                three cars ahead turn 3.06 m into 4.3 m.
   TARGET  1.5  stepCarsAwareness2, loaded once into xmm15: the passing target beside the car ahead
                (TARGET x PASS x carHalfWidth, 3.83 m stock), the lateral overlap that makes a car ahead
                count as in the way (lift and brake obstacle), the alongside shift near a corner, and the
                1.5 s base of the time-to-impact that starts a passing check.
   APEX    200  stepCarsAwareness2: at equal speed a pass is only started when the next apex on that side
                is farther than this many metres, unless the car is held up or the car ahead nearly stopped. */
API void *VirtualAlloc(void *, size_t, unsigned long, unsigned long);

typedef struct {
    const wchar_t *key;
    uint32_t rva;
    unsigned char length, disp_at;  // instruction length; offset of its rel32
    unsigned char stock[9];
    float low, high;                // accepted range of the requested value
} SpacingSite;

static const SpacingSite spacing_sites[] = {
    { L"SIDE", 0x29d44e, 8, 4, {0xf3,0x0f,0x59,0x0d,0xa2,0xc2,0x17,0x01}, 1.8f, 5.f },      // mulss xmm1
    { L"PASS", 0x29f983, 8, 4, {0xf3,0x0f,0x59,0x05,0x75,0xee,0x20,0x00}, 2.f, 5.f },       // mulss xmm0
    { L"PER_CAR", 0x2a04d7, 8, 4, {0xf3,0x0f,0x59,0x05,0x69,0xd5,0x20,0x00}, 0.f, 1.f },    // mulss xmm0
    { L"TARGET", 0x2a0168, 9, 5, {0xf3,0x44,0x0f,0x10,0x3d,0x77,0x3e,0x21,0x00}, 1.f, 3.f }, // movss xmm15
    { L"APEX", 0x2a0477, 7, 3, {0x0f,0x2f,0x05,0x2e,0x16,0x21,0x00}, 0.f, 1000.f },         // comiss xmm0
};

static unsigned char *spacing_base;
static float *spacing_values;  // one float per site, in a page within rel32 reach of acs.exe
static unsigned char spacing_patch[COUNT(spacing_sites)][9];
static bool spacing_on[COUNT(spacing_sites)];

/* Parse a plain non-negative decimal like "2.2" into *out. Pure. */
static bool decimal(const wchar_t *s, float *out) {
    float v = 0, scale = 0;
    bool digits = false;
    for (; *s; ++s) {
        if (*s >= L'0' && *s <= L'9') {
            digits = true;
            if (scale) { v += (float)(*s - L'0') * scale; scale *= 0.1f; }
            else v = v * 10 + (float)(*s - L'0');
        } else if (*s == L'.' && !scale) scale = 0.1f;
        else if (*s != L' ') return false;
    }
    *out = v;
    return digits;
}

/* Read [MAP2LAP_AI] site->key within its range. False when absent or invalid. */
static bool spacing_value(const wchar_t *ini, const SpacingSite *site, float *out) {
    wchar_t text[32];
    GetPrivateProfileStringW(L"MAP2LAP_AI", site->key, L"", text, COUNT(text), ini);
    return text[0] && decimal(text, out) && *out >= site->low && *out <= site->high;
}

static const wchar_t *spacing_gate(void) {
    wchar_t ini[320];
    float v;
    const wchar_t *reason = race_gate(true);
    if (reason) return reason;
    if (!race_ini(ini)) return L"off: race.ini";
    for (size_t i = 0; i < COUNT(spacing_sites); ++i)
        if (spacing_value(ini, spacing_sites + i, &v)) return NULL;
    return L"off: not requested";
}

/* Reserve one page below the image, 64 KiB aligned, so that rel32 from every site reaches it. */
static float *page_near(unsigned char *base) {
    for (uintptr_t step = 1; step < 0x7000; ++step) {
        uintptr_t at = ((uintptr_t)base & ~(uintptr_t)0xffff) - step * 0x10000;
        void *page = VirtualAlloc((void *)at, 4096, 0x3000 /* MEM_COMMIT|MEM_RESERVE */, 0x04 /* PAGE_READWRITE */);
        if (page) return page;
    }
    return NULL;
}

static bool redirect(size_t i, const float *target) {
    const SpacingSite *site = spacing_sites + i;
    unsigned char *at = spacing_base + site->rva;
    int64_t disp = (int64_t)((intptr_t)target - (intptr_t)(at + site->length));
    if (disp < INT32_MIN || disp > INT32_MAX) return false;
    for (size_t k = 0; k < site->length; ++k) spacing_patch[i][k] = site->stock[k];
    for (size_t k = 0; k < 4; ++k) spacing_patch[i][site->disp_at + k] = (unsigned char)((uint64_t)disp >> (8*k));
    return change_instructions(at, site->stock, spacing_patch[i], site->length);
}

static bool spacing_stop(void) {
    bool ok = true;
    for (size_t i = 0; i < COUNT(spacing_sites); ++i) {
        const SpacingSite *site = spacing_sites + i;
        if (spacing_on[i] && change_instructions(spacing_base + site->rva, spacing_patch[i], site->stock, site->length))
            spacing_on[i] = false;
        ok = ok && !spacing_on[i];
    }
    return ok;
}

static const wchar_t *spacing_start(unsigned char *base) {
    wchar_t ini[320];
    if (!race_ini(ini)) return L"off: race.ini";
    // The page stays allocated for the process: AC threads may still be inside these functions at shutdown.
    if (!spacing_values && !(spacing_values = page_near(base))) return L"off: no page";
    spacing_base = base;
    for (size_t i = 0; i < COUNT(spacing_sites); ++i) {
        if (!spacing_value(ini, spacing_sites + i, spacing_values + i)) continue;
        if (!(spacing_on[i] = redirect(i, spacing_values + i))) {
            spacing_stop();
            return L"off: code differs/write";
        }
    }
    return L"active";
}
