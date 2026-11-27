/* AI spacing: lets race opponents use the room that is physically there.
   Stock AC keeps two references in carHalfWidth units (half the wider axle track + 0.30 m):
   - SIDE, 3.0 in AIDriver::getEngagedDesiredOffset: the lateral gap held alongside a car
     (3.06 m centre to centre, about 1.34 m air, for the BMW M3 E30 DTM);
   - PASS, 2.5 in AIDriver::stepCarsAwareness2: the base of every passing distance. It sets the room
     needed beside a car ahead (x 1.2 with one car ahead), the passing target (x 1.5), the clearance to a
     neighbour (x 2) and the lateral overlap that counts a car ahead as in the way (x 1.5).
   Both constants live in .rdata pools that dozens of other instructions share, so the two multiplies are
   redirected to our own floats instead. race.ini [MAP2LAP_AI] SIDE= / PASS= request a value; a missing
   key keeps that instruction stock. CSP hooks only the entries of these functions (measured with the
   probe), not these instructions. */
API void *VirtualAlloc(void *, size_t, unsigned long, unsigned long);

enum { SIDE_SITE = 0x29d44e, PASS_SITE = 0x29f983 };
// mulss xmm1, [rip+disp32] -> 3.0 and mulss xmm0, [rip+disp32] -> 2.5; only disp32 changes.
static const unsigned char side_stock[8] = {0xf3,0x0f,0x59,0x0d,0xa2,0xc2,0x17,0x01};
static const unsigned char pass_stock[8] = {0xf3,0x0f,0x59,0x05,0x75,0xee,0x20,0x00};

static unsigned char *spacing_base;
static float *spacing_values;  // [0] SIDE, [1] PASS, in a page within rel32 reach of acs.exe
static unsigned char side_patch[8], pass_patch[8];
static bool side_on, pass_on;

/* Parse a plain decimal like "2.2" into *out. Pure. */
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

/* Read [MAP2LAP_AI] key. Below 1.5 half widths two cars' bodies overlap for any car, above 5 the value is
   no longer a spacing experiment. Returns false when the key is absent or invalid. */
static bool spacing_value(const wchar_t *ini, const wchar_t *key, float *out) {
    wchar_t text[32];
    GetPrivateProfileStringW(L"MAP2LAP_AI", key, L"", text, COUNT(text), ini);
    return text[0] && decimal(text, out) && *out >= 1.5f && *out <= 5.f;
}

static const wchar_t *spacing_gate(void) {
    wchar_t ini[320];
    float v;
    const wchar_t *reason = race_gate(true);
    if (reason) return reason;
    if (!race_ini(ini)) return L"off: race.ini";
    if (!spacing_value(ini, L"SIDE", &v) && !spacing_value(ini, L"PASS", &v)) return L"off: not requested";
    return NULL;
}

/* Reserve one page below the image, 64 KiB aligned, so that rel32 from both sites reaches it. */
static float *page_near(unsigned char *base) {
    for (uintptr_t step = 1; step < 0x7000; ++step) {
        uintptr_t at = ((uintptr_t)base & ~(uintptr_t)0xffff) - step * 0x10000;
        void *page = VirtualAlloc((void *)at, 4096, 0x3000 /* MEM_COMMIT|MEM_RESERVE */, 0x04 /* PAGE_READWRITE */);
        if (page) return page;
    }
    return NULL;
}

static bool redirect(unsigned char *site, const unsigned char stock[8], unsigned char patch[8], const float *target) {
    int64_t disp = (int64_t)((intptr_t)target - (intptr_t)(site + 8));
    if (disp < INT32_MIN || disp > INT32_MAX) return false;
    for (size_t i = 0; i < 4; ++i) patch[i] = stock[i];
    for (size_t i = 0; i < 4; ++i) patch[4+i] = (unsigned char)((uint64_t)disp >> (8*i));
    return change_instructions(site, stock, patch, 8);
}

static const wchar_t *spacing_start(unsigned char *base) {
    wchar_t ini[320];
    float side = 0, pass = 0;
    if (!race_ini(ini)) return L"off: race.ini";
    bool want_side = spacing_value(ini, L"SIDE", &side), want_pass = spacing_value(ini, L"PASS", &pass);
    // The page stays allocated for the process: AC threads may still be inside these functions at shutdown.
    if (!spacing_values && !(spacing_values = page_near(base))) return L"off: no page";
    spacing_values[0] = side;
    spacing_values[1] = pass;
    spacing_base = base;
    side_on = want_side && redirect(base + SIDE_SITE, side_stock, side_patch, spacing_values);
    pass_on = want_pass && redirect(base + PASS_SITE, pass_stock, pass_patch, spacing_values + 1);
    if ((want_side && !side_on) || (want_pass && !pass_on)) {
        if (side_on) side_on = !change_instructions(base + SIDE_SITE, side_patch, side_stock, 8);
        if (pass_on) pass_on = !change_instructions(base + PASS_SITE, pass_patch, pass_stock, 8);
        return L"off: code differs/write";
    }
    return L"active";
}

static bool spacing_stop(void) {
    if (side_on && change_instructions(spacing_base + SIDE_SITE, side_patch, side_stock, 8)) side_on = false;
    if (pass_on && change_instructions(spacing_base + PASS_SITE, pass_patch, pass_stock, 8)) pass_on = false;
    return !side_on && !pass_on;
}
