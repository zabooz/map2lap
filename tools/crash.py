"""Where a native crash of Python happened (Windows): the last error reports of python.exe from the event log, each
faulting address placed in engine/earthfast.pyd (its section; in the import table, which import's slot and whether a
descriptor covers it), and the module's imports no descriptor covers.

    .venv\\Scripts\\python.exe tools\\crash.py               # the last report of python.exe
    .venv\\Scripts\\python.exe tools\\crash.py -n 3          # the last three
    .venv\\Scripts\\python.exe tools\\crash.py --rva 0x62ce50 [--dll path]

Python's faulthandler only says "access violation" with no C stack here; Windows' report ("Application Error", event
1000) has the faulting module and offset. A module "unknown" with a small offset is an address inside no module: a jump
through a pointer that was never filled, often an import slot (the offset is then the RVA of the import's name).
"""
import argparse
import os
import subprocess
import sys
import xml.etree.ElementTree as ET

from pe_imports import Image, orphan_imports

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DLL = os.path.join(HERE, "engine", "earthfast.pyd")
CODES = {0xC0000005: "access violation", 0xC00000FD: "stack overflow", 0xC0000409: "fail fast (a Rust abort, a "
         "stack buffer check)", 0xC000001D: "illegal instruction", 0x80000003: "breakpoint"}
NS = {"e": "http://schemas.microsoft.com/win/2004/08/events/event"}


def reports(n, app="python.exe"):
    """The last n "Application Error" reports of app, newest first: [{time, module, path, code, offset}]."""
    q = "*[System[Provider[@Name='Application Error'] and (EventID=1000)]]"
    r = subprocess.run(["wevtutil", "qe", "Application", f"/q:{q}", "/c:50", "/rd:true", "/f:xml"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    out = []
    for ev in ET.fromstring(f"<all>{r.stdout}</all>"):
        data = [d.text or "" for d in ev.findall("e:EventData/e:Data", NS)]
        if len(data) < 12 or data[0].lower() != app:
            continue
        out.append({"time": ev.find("e:System/e:TimeCreated", NS).get("SystemTime", "")[:19].replace("T", " "),
                    "module": data[3], "path": data[11], "code": int(data[6], 16), "offset": int(data[7], 16)})
        if len(out) == n:
            break
    return out


def place(img, rva):
    """Lines saying what lies at rva in the image img."""
    if rva >= img.size:
        return [f"  {rva:#x} is past the image's end ({img.size:#x}): not an RVA of {os.path.basename(img.path)}"]
    lines = [f"  RVA {rva:#x} is in section {img.section(rva) or '(none)'} of {os.path.basename(img.path)}"]
    slots = img.iat_slots()
    names = {img.name_at(img.u64(img.off(a))) for a, _, _ in slots}
    try:
        name = img.name_at(rva)
    except ValueError:
        name = None
    if name in names:
        lines.append(f"  it is the name entry of the import {name}: the call went through a slot holding it, unfilled")
        for a, n, dll in slots:
            if n == name:
                lines.append(f"    slot {a:#x}: " + (f"in {dll}'s table (Windows fills it)" if dll else
                                                     "in no descriptor's table: never filled"))
    for a, n, dll in slots:
        if a <= rva < a + 8:
            lines.append(f"  it is the import slot of {n} ({dll or 'no descriptor: never filled'})")
    return lines


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("-n", type=int, default=1, help="how many of the last reports")
    ap.add_argument("--rva", help="place this RVA (hex) instead of reading the reports")
    ap.add_argument("--dll", default=DLL, help="the module to place it in (default engine/earthfast.pyd)")
    a = ap.parse_args()
    img = Image(a.dll)
    if a.rva:
        print("\n".join(place(img, int(a.rva, 16))))
    else:
        got = reports(a.n)
        if not got:
            print("No error report of python.exe in the event log.")
        for r in got:
            what = CODES.get(r["code"], "")
            print(f"{r['time']} UTC: {r['code']:#010x} {what} in {r['module']}, offset {r['offset']:#x}")
            if r["module"].lower() == os.path.basename(a.dll).lower():
                print("\n".join(place(img, r["offset"])))
            elif r["module"].lower() == "unknown" and r["offset"] < img.size:
                print(f"  an address inside no module, small enough to be an RVA of {os.path.basename(a.dll)}:")
                print("\n".join(place(img, r["offset"])))
    orphans = orphan_imports(a.dll)
    print(f"{os.path.basename(a.dll)}: " + (f"{len(orphans)} imports no descriptor covers (they crash when called): "
                                            + ", ".join(orphans) if orphans else "every import is covered"))


if __name__ == "__main__":
    sys.exit(main())
