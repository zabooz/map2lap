"""Assetto Corsa AI hints placed on the installed racing spline."""
import os
import re
from pathlib import Path
import tempfile
from typing import NamedTuple

import numpy as np

from track import aicorrections, aimargins
from track.aimargins import ScalarSpan, Span

FILE = Path("data/ai_hints.ini")


def _stations(points, circuit):
    """Cumulative 3D lane metres, including the circuit's closing chord. Pure."""
    xyz = points["pos"].astype(float)
    if circuit:
        xyz = np.vstack((xyz, xyz[0]))
    return np.r_[0., np.cumsum(np.linalg.norm(np.diff(xyz, axis=0), axis=1))]


def merge(spans: list[Span | ScalarSpan], default: tuple = (0., 0.)) -> list[tuple]:
    """Merge one type in recipe order. Each explicit value overrides its channel. Pure."""
    cuts = sorted({0., 1., *(s.start for s in spans), *(s.end for s in spans)})
    indices = {cut: i for i, cut in enumerate(cuts)}
    values = np.empty((len(cuts)-1, len(default)), dtype=object)
    values[:] = default
    for span in spans:
        settings = (span.value,) if isinstance(span, ScalarSpan) else (span.left, span.right)
        for a, b in aimargins.intervals(span.start, span.end, 1.):
            for channel, value in enumerate(settings):
                if value is not None:
                    values[indices[a]:indices[b], channel] = value
    result = []
    for a, b, row in zip(cuts, cuts[1:], values):
        settings = tuple(row)
        if settings == default:
            continue
        if result and result[-1][1] == a and result[-1][2:] == settings:
            result[-1] = (result[-1][0], b, *settings)
        else:
            result.append((a, b, *settings))
    return result


class Profile(NamedTuple):
    sections: list[tuple[float, float, float, float]]
    locations: dict[str, dict[str, float]]
    scalars: dict[str, list[tuple]]


class Hints(NamedTuple):
    data: bytes
    rejected: dict[str, str]
    unplaced: str | None
    spans: list[Span | ScalarSpan]


def render(lane: Path, circuit: bool, margins: list, placement: tuple[aicorrections.Route, np.ndarray] | None,
           unplaced: str | None) -> Hints:
    """Render the installed lane with the recipe's placeable AI hints and report rejected anchors."""
    hints, _ = render_profile(lane, circuit, margins, placement, unplaced)
    return hints


def render_profile(lane: Path, circuit: bool, margins: list, placement: tuple[aicorrections.Route, np.ndarray] | None,
                   unplaced: str | None) -> tuple[Hints, Profile]:
    """Calculate the INI and its Editor preview from a single placement and merge."""
    from track import fastlane, obj_to_kn5
    points, _, _ = fastlane.read_lane(lane)
    spans, rejected, locations = [], {}, {}
    if margins and placement is not None:
        route, metres = placement
        spans, rejected, locations = aimargins.placements(margins, route, metres, _stations(points, circuit),
                                                         points["pos"][:, 1], circuit, obj_to_kn5.LEVEL_GAP_M)
    scalars = {kind: merge([s for s in spans if s.kind == kind], (None,)) for kind in aimargins.SCALAR_SECTIONS}
    profile = Profile(merge([s for s in spans if s.kind == "danger"], (0., 0.)), locations, scalars)
    data = "".join(f"[DANGER_{i}]\n{OWNER}\nSTART={a:.9f}\nEND={b:.9f}\nLEFT={left:.2f}\nRIGHT={right:.2f}\n\n"
                   for i, (a, b, left, right) in enumerate(profile.sections))
    for kind, sections in scalars.items():
        prefix = aimargins.SCALAR_SECTIONS[kind]
        data += "".join(f"[{prefix}_{i}]\n{OWNER}\nSTART={a:.9f}\nEND={b:.9f}\nVALUE={value}\n\n"
                        for i, (a, b, value) in enumerate(sections))
    return Hints(data.encode("ascii"), rejected, unplaced if margins and placement is None else None, spans), profile


# New sections identify their writer. The legacy writer used a fixed field order
# and precision for all automatic and editor-authored DANGER sections.
OWNER = "; Map2Lap AI hint"
HEADER = re.compile(rb"^[ \t]*\[([^]\r\n]+)\][^\r\n]*", re.M)
NUMBERED = re.compile(rb"(HINT|BRAKEHINT|MAXSPEED|DANGER)_([0-9]+)", re.I)


LEGACY_DANGER = re.compile(rb"START=\d+\.\d{9}\nEND=\d+\.\d{9}\nLEFT=\d+\.\d{2}\nRIGHT=\d+\.\d{2}")


def _owned(name, lines):
    """Recognize marked sections and the previous writer's DANGER layout. Pure."""
    numbered = NUMBERED.fullmatch(name)
    if not numbered:
        return False
    if any(line.strip() == OWNER.encode() for line in lines):
        return True
    if numbered[1] != b"DANGER":
        return False
    fields = (re.split(rb"[;#]", line, maxsplit=1)[0].strip() for line in lines)
    return LEGACY_DANGER.fullmatch(b"\n".join(field for field in fields if field)) is not None


def _comments(block):
    """Keep full-line and trailing comments when replacing a generated INI section. Pure."""
    comments = []
    for line in block.splitlines(keepends=True):
        if line.strip() == OWNER.encode():
            continue
        match = re.search(rb"[;#]", line)
        if match:
            comments.append(line if not line[:match.start()].strip() else line[match.start():])
    return b"".join(comments)


def _foreign(existing):
    """Return foreign INI bytes and their occupied section names. Pure."""
    bom = b"\xef\xbb\xbf"
    kept = bytearray(bom if existing.startswith(bom) else b"")
    existing = existing.removeprefix(bom)
    headers = list(HEADER.finditer(existing))
    preamble = existing[:headers[0].start()] if headers else existing
    # With no sections, old files may contain only an obsolete status string.
    if headers or all(not line.strip() or line.lstrip().startswith((b";", b"#")) for line in preamble.splitlines()):
        kept.extend(preamble)
    else:
        kept.extend(_comments(preamble))
    names = set()
    for i, header in enumerate(headers):
        name = header[1].upper()
        block = existing[header.start():headers[i+1].start() if i+1 < len(headers) else None]
        if _owned(name, block.splitlines()[1:]):
            kept.extend(_comments(block))
        else:
            kept.extend(block)
            names.add(name)
    return bytes(kept), names


def compose(existing, generated):
    """Replace editor sections, allocating each type's first free indices around foreign hints. Pure."""
    kept, names = _foreign(existing)
    if not generated:
        return kept
    counters = {}

    def available(header):
        prefix = header[1].rsplit(b"_", 1)[0]
        number = counters.get(prefix, 0)
        while (name := prefix + b"_" + str(number).encode()) in names:
            number += 1
        counters[prefix] = number + 1
        return b"[" + name + b"]"

    if kept and not kept.endswith((b"\n", b"\r", b"\xef\xbb\xbf")):
        kept += b"\n"
    return kept + HEADER.sub(available, generated)


def install(folder, data):
    """Install editor hints alongside foreign sections. None retires an otherwise empty file."""
    path = folder / FILE
    existing = path.read_bytes() if path.is_file() else b""
    merged = compose(existing, data)
    replace(folder, merged if merged or data is not None else None)


def replace(folder, data):
    """Atomically write exact INI bytes for installation, deferred copies and rollback."""
    path = folder / FILE
    if data is None:
        path.unlink(missing_ok=True)
        return
    if path.is_file() and path.read_bytes() == data:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as stream:
        tmp = Path(stream.name)
        try:
            stream.write(data)
            stream.close()
            os.replace(tmp, path)
        finally:
            tmp.unlink(missing_ok=True)
