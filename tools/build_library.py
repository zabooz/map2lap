r"""Build the Editor's shipped library, assets/library, from a curated library folder: every shown CC0 object simplified to one
geometry level, every texture as it is.

    .venv\Scripts\python.exe tools\build_library.py [--root <app folder>] [--level 25]

Reads <root>/library and writes <root>/assets/library new (the old one goes). An object package keeps its name, category, licence,
colour and surface choices, scale, anchor and collision; its GLB is simplified (meshoptimizer, the import's 1 % error budget) and
gets a new id. Not shipped: packages hidden by superseded.json (replaced ones) and ones without a CC0 licence. Textures are copied
unchanged. Placed copies in tracks keep their own snapshot, so no track depends on the old ids.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from app import materiallibrary, modeldata, modelimport, modelsimplify, objectlibrary  # noqa: E402

SIDE = 1024         # (images larger than this are reduced, as the import's default; the curated packages are no larger)
# what a package's description loses: the old GLB's facts, the upload it once kept, the import choices the new GLB replaces
DROPPED = ("id", "geometry", "model", "source", "warnings", "texture_side", "simplify_level", "simplify_error")


def _cc0(asset):
    """Whether asset may be shipped: a CC0 licence or tag. Pure."""
    return asset.get("license", "").upper().startswith("CC0") or "CC0" in asset.get("tags", [])


def _simplified(folder, level):
    """folder's GLB with its images at most SIDE and its geometry at level. Pure but for reading it."""
    return modelsimplify.simplify(modelimport.texture_size((folder / "original/model.glb").read_bytes(), SIDE), level)


def _object(folder, asset, raw, level, target):
    """Write folder's package with raw, its GLB at level, into target/<new id>; its new description."""
    model, sha = modeldata.load(raw), hashlib.sha256(raw).hexdigest()
    built = {**{k: v for k, v in asset.items() if k not in DROPPED}, "id": objectlibrary.identity(sha, asset),
             "geometry": objectlibrary._summary(model),
             "model": {"file": "original/model.glb", "filename": asset["model"]["filename"], "sha256": sha, "bytes": len(raw)},
             "texture_side": SIDE}
    if level != 100:
        built.update(simplify_level=level, simplify_error=modelsimplify.ERROR)
    out = target / built["id"]
    (out / "original").mkdir(parents=True)
    (out / "original/model.glb").write_bytes(raw)
    materiallibrary._write_json(out / "asset.json", built)
    if (folder / "LICENSE.txt").is_file():
        shutil.copyfile(folder / "LICENSE.txt", out / "LICENSE.txt")
    if (folder / "provenance.json").is_file():
        provenance = json.loads((folder / "provenance.json").read_text(encoding="utf-8"))
        provenance.update(id=built["id"], sha256=sha, bytes=len(raw), triangles=built["geometry"]["triangles"])
        provenance["processing"] = [*provenance.get("processing", []), f"Simplified to {level}% geometry (meshoptimizer, 1% error budget)."]
        materiallibrary._write_json(out / "provenance.json", provenance)
    return built


def build(root, level):
    """<root>/assets/library new from <root>/library: {"built": {old id: new description}, "skipped": {old id: why}}."""
    level = modelsimplify.level(level)
    source, assets = Path(root, "library"), Path(root, "assets")
    hidden = set(objectlibrary._superseded())
    built, skipped = {}, {}
    assets.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".library_", dir=assets) as temporary:
        ready = Path(temporary, "library")
        (ready / "objects").mkdir(parents=True)
        for folder in sorted((source / "objects").iterdir()) if (source / "objects").is_dir() else ():
            if not materiallibrary.KEY.fullmatch(folder.name):
                continue
            asset = objectlibrary.get(folder.name)
            if folder.name in hidden:
                skipped[folder.name] = "hidden"
                continue
            if not _cc0(asset):
                skipped[folder.name] = "no CC0 licence"
                continue
            raw = _simplified(folder, level)
            if (ready / "objects" / objectlibrary.identity(hashlib.sha256(raw).hexdigest(), asset)).exists():
                skipped[folder.name] = "the same as another"
            else:
                built[folder.name] = _object(folder, asset, raw, level, ready / "objects")
                print(f"{asset['name']}: {asset['geometry']['triangles']} -> {built[folder.name]['geometry']['triangles']} triangles", flush=True)
        if (source / "materials").is_dir():
            shutil.copytree(source / "materials", ready / "materials",
                            ignore=lambda folder, names: [n for n in names if folder == str(source / "materials") and not materiallibrary.KEY.fullmatch(n)])
        old = Path(temporary, "old")
        if (assets / "library").exists():
            (assets / "library").rename(old)
        ready.rename(assets / "library")
    return {"built": {k: v["model"] for k, v in built.items()}, "skipped": skipped}


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--root", default=str(ROOT), help="the app folder whose library/ is read (default: this one)")
    parser.add_argument("--level", type=int, default=25, help="the geometry level in percent: 100, 75, 50 or 25 (default 25)")
    args = parser.parse_args()
    for module in (materiallibrary, objectlibrary):
        module.ROOT = args.root
    report = build(args.root, args.level)
    print(f"{len(report['built'])} objects built, {len(report['skipped'])} skipped:")
    for id, why in report["skipped"].items():
        print(f"  {id[:12]} {why}")


if __name__ == "__main__":
    main()
