/* Read the root kind/area of data/map2lap.json. Older Routes omit kind and store area:null.
   Consume the complete document before granting the feature, including unrelated nested values. */
typedef struct {
    const unsigned char *p, *end;
    bool kind_seen, area_seen;
} Json;

static unsigned peek(const Json *j) {
    return j->p < j->end ? *j->p : 0;
}

static void whitespace(Json *j) {
    while (peek(j) == ' ' || peek(j) == '\t' || peek(j) == '\n' || peek(j) == '\r') ++j->p;
}

static bool take(Json *j, unsigned c) {
    if (peek(j) != c) return false;
    ++j->p;
    return true;
}

static bool literal(Json *j, const char *s) {
    while (*s) if (!take(j, (unsigned char)*s++)) return false;
    return true;
}

/* Decode escaped ASCII too, so an escaped key has exactly the same meaning.
   Non-ASCII values only need validation: no metadata discriminator contains one. */
static int character(Json *j) {
    unsigned c = *j->p++;
    if (c < ' ') return -1;
    if (c >= 0x80) {
        unsigned count = c < 0xe0 ? 1 : c < 0xf0 ? 2 : 3;
        unsigned first = peek(j);
        if (c < 0xc2 || c > 0xf4 || (c == 0xe0 && first < 0xa0) || (c == 0xed && first >= 0xa0) ||
            (c == 0xf0 && first < 0x90) || (c == 0xf4 && first >= 0x90)) return -1;
        while (count--) {
            if ((peek(j) & 0xc0) != 0x80) return -1;
            ++j->p;
        }
        return 0x80;
    }
    if (c != '\\') return (int)c;
    c = peek(j);
    if (!c) return -1;
    ++j->p;
    if (c == '"' || c == '\\' || c == '/') return (int)c;
    if (c == 'b' || c == 'f' || c == 'n' || c == 'r' || c == 't') return 0x80;
    if (c != 'u') return -1;
    unsigned code = 0;
    for (int i = 0; i < 4; ++i) {
        unsigned h = peek(j);
        if (h >= '0' && h <= '9') h -= '0';
        else if ((h | 32) >= 'a' && (h | 32) <= 'f') h = (h | 32) - 'a' + 10;
        else return -1;
        code = code * 16 + h;
        ++j->p;
    }
    return (int)code;
}

enum Word { OTHER, KIND, AREA, ROUTE };

static bool string(Json *j, enum Word *word) {
    static const char *const names[] = {"", "kind", "area", "route"};
    unsigned possible = (1 << KIND) | (1 << AREA) | (1 << ROUTE);
    if (!take(j, '"')) return false;
    size_t n = 0;
    while (j->p < j->end && peek(j) != '"') {
        int c = character(j);
        if (c < 0) return false;
        if (word) {
            for (int k = KIND; k <= ROUTE; ++k) {
                if ((possible & (1 << k)) && (!names[k][n] || names[k][n] != c)) possible &= ~(1 << k);
            }
        }
        ++n;
    }
    if (!take(j, '"')) return false;
    if (word) {
        *word = OTHER;
        for (int k = KIND; k <= ROUTE; ++k)
            if ((possible & (1 << k)) && !names[k][n]) *word = (enum Word)k;
    }
    return true;
}

static bool digits(Json *j) {
    const unsigned char *start = j->p;
    while (peek(j) >= '0' && peek(j) <= '9') ++j->p;
    return j->p != start;
}

static bool number(Json *j) {
    take(j, '-');
    if (!take(j, '0') && !digits(j)) return false;
    if (take(j, '.') && !digits(j)) return false;
    if (take(j, 'e') || take(j, 'E')) {
        if (!take(j, '-')) take(j, '+');
        return digits(j);
    }
    return true;
}

static bool value(Json *j, unsigned depth);

static bool members(Json *j, unsigned depth, bool object) {
    unsigned end = object ? '}' : ']';
    whitespace(j);
    if (take(j, end)) return true;
    do {
        whitespace(j);
        enum Word key = OTHER;
        if (object) {
            if (!string(j, depth == 0 ? &key : NULL)) return false;
            whitespace(j);
            if (!take(j, ':')) return false;
            whitespace(j);
        }
        if (key == KIND) {
            enum Word kind;
            if (j->kind_seen || !string(j, &kind) || kind != ROUTE) return false;
            j->kind_seen = true;
        } else if (key == AREA) {
            if (j->area_seen || !literal(j, "null")) return false;
            j->area_seen = true;
        } else if (!value(j, depth + 1)) return false;
        whitespace(j);
    } while (take(j, ','));
    return take(j, end);
}

static bool value(Json *j, unsigned depth) {
    // Generated metadata is shallow. Bound recursion on corrupt or hand-edited files.
    if (depth >= 64) return false;
    switch (peek(j)) {
        case '{': ++j->p; return members(j, depth, true);
        case '[': ++j->p; return members(j, depth, false);
        case '"': return string(j, NULL);
        case 't': return literal(j, "true");
        case 'f': return literal(j, "false");
        case 'n': return literal(j, "null");
        default: return number(j);
    }
}

static bool route_json(const unsigned char *bytes, size_t size) {
    Json j = {bytes, bytes + size, false, false};
    if (size >= 3 && bytes[0] == 0xef && bytes[1] == 0xbb && bytes[2] == 0xbf) j.p += 3;
    whitespace(&j);
    if (!take(&j, '{') || !members(&j, 0, true)) return false;
    whitespace(&j);
    return j.p == j.end;
}
