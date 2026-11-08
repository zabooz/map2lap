"""Measure local material-palette feasibility before changing the Editor renderer; no user track or library is modified."""
import argparse
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
import tracemalloc

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from app import groundregions
from track.textures import dds_size


def _weights(size, materials, junction=False):
    """Distinct strips with soft edges, optionally meeting in one dense junction. Pure."""
    labels = np.arange(size) * materials // size
    x = np.arange(size)
    centre = (size - 1) / 2
    distance = np.hypot(x[:, None] - centre, x[None, :] - centre)
    blend = np.clip((size / 6 - distance) / max(1, size / 32), 0, 1) if junction else 0
    weights = {}
    for k in range(materials):
        line = (labels == k).astype(np.float32)
        padded = np.pad(line, 1, mode="edge")
        line = .25 * padded[:-2] + .5 * padded[1:-1] + .25 * padded[2:]
        weights[f"material_{k:02}"] = np.array(np.broadcast_to(line, (size, size)) * (1 - blend) + blend / materials, np.float32)
    return weights


def _measure(weights, min_side, radius):
    """Time one planner run and account for its proposed mask allocation, without treating it as a GPU measurement."""
    started = time.perf_counter()
    plan = groundregions.plan(weights, capacity=3, min_side=min_side, filter_radius=radius)
    elapsed = time.perf_counter() - started
    mask_bytes, groups = 0, 0
    for region in plan["regions"]:
        x0, y0, x1, y1 = region["support"]
        # Each native palette uses one RGBA8 mask including mips. Overflow groups still need a separate blend strategy.
        count = max(1, (len(region["palette"]) + 2) // 3)
        groups += count
        mask_bytes += count * dds_size(x1 - x0, y1 - y0, uncompressed=True)
    return {"fits": not plan["overflow"], "cpu_seconds": elapsed, "regions": len(plan["regions"]),
            "overflow_regions": len(plan["overflow"]), "required_capacity": plan["required_capacity"],
            "palette_groups_lower_bound": groups, "proposed_mask_bytes": mask_bytes, "plan": plan}


def run(output, size=512, materials=12):
    """Write reproducible semantic-weight fixtures, derived plans and measured CPU/allocation results under output."""
    if not 16 <= size <= 2048 or not 4 <= materials <= min(32, size):
        raise ValueError("Use 16–2048 pixels and 4–32 materials, no more materials than pixels")
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    tracemalloc.start()
    try:
        weights = {"stripes": _weights(size, materials), "junction": _weights(size, materials, junction=True)}
        for label, source in weights.items():
            np.savez_compressed(output / (label + ".npz"), **source)
        runs = {}
        for label, source, radius in (("stripes_near", weights["stripes"], 1), ("junction_near", weights["junction"], 1),
                                      ("stripes_far", weights["stripes"], size)):
            runs[label] = _measure(source, max(1, size // 128), radius)
        _current, peak = tracemalloc.get_traced_memory()
    finally:
        tracemalloc.stop()
    report = {"profile": groundregions.PROFILE, "tile_metres": 256, "size": size, "materials": materials, "gpu_verified": False,
              "input_weight_bytes": sum(values.nbytes for source in weights.values() for values in source.values()),
              "python_numpy_peak_bytes": peak, "runs": runs,
              "limitation": "Spatial palettes alone cannot represent all dense or coarse-filtered mixtures with three replacement slots. "
                            "Overflow retains every material; a rendering strategy for these regions must be proved before integration."}
    (output / "report.json").write_text(json.dumps(report, indent=2, allow_nan=False), encoding="utf-8")
    return report


def webgl_fixture(output, view_size=256):
    """Write shader-independent material maps and full float weights for the browser probe, without reducing dense palettes."""
    output = Path(output)
    with np.load(output / "junction.npz", allow_pickle=False) as saved:
        ids = sorted(saved.files)
        fields = np.stack([saved[token] for token in ids]).astype("<f4") * np.float32(.8)
    _count, height, width = fields.shape
    if width != height or width & (width - 1) or not 16 <= view_size <= 2048:
        raise ValueError("The WebGL comparison uses power-of-two square weight fixtures and a 16–2048 pixel viewport")
    target = output / "webgl"
    target.mkdir(parents=True, exist_ok=True)
    fields.tofile(target / "weights.bin")
    layers = [{"id": token, "repeat": [2 + k, 3], "variation": k == 0,
               "colour": {"width": 1, "height": 1, "data": [200 + k % 3 * 15, 40 + k * 13 % 200, 20 + k * 19 % 220, 255]}}
              for k, token in enumerate(ids)]
    # Synthetic data maps exercise tangent-space normals and linear roughness without a shipped material collection.
    phase = np.arange(8) * (2 * np.pi / 8)
    nx = np.broadcast_to(.35 * np.sin(phase)[None, :], (8, 8))
    ny = np.broadcast_to(.35 * np.cos(phase)[:, None], (8, 8))
    normal = np.dstack(((nx + 1) * 127.5, (ny + 1) * 127.5, (np.sqrt(1 - nx * nx - ny * ny) + 1) * 127.5, np.full((8, 8), 255)))
    roughness = np.broadcast_to(100 + 70 * np.sin(phase)[None, :], (8, 8))
    roughness = np.dstack((roughness, roughness, roughness, np.full((8, 8), 255)))
    layers[0]["normal"] = {"width": 8, "height": 8, "data": np.rint(normal).astype(np.uint8).ravel().tolist()}
    layers[0]["roughness"] = {"width": 8, "height": 8, "data": np.rint(roughness).astype(np.uint8).ravel().tolist()}
    footprint = max(1., width / view_size)
    radius = int(2 ** (math.ceil(math.log2(footprint)) + 1))
    plan = groundregions.plan(dict(zip(ids, fields)), min_side=max(1, width // 16), filter_radius=radius)
    description = {"profile": 1, "width": width, "height": height, "weights_file": "weights.bin", "weights_format": "float32le",
                   "weight_order": "layer-major-bottom-first", "layers": layers, "extent": [256, 256], "origin": [-256, 512], "base": [.1, .2, .3],
                   "view_size": view_size, "regions": plan["regions"], "filter_radius": radius, "ac_verified": False}
    (target / "fixture.json").write_text(json.dumps(description, allow_nan=False), encoding="utf-8")
    return description


def webgl(output, browser="chrome", view_size=256, hardware=False):
    """Run the real browser shader and save its reference checks, images and measured allocations/draws."""
    webgl_fixture(output, view_size)
    bun = shutil.which("bun") or str(Path.home() / ".bun" / "bin" / ("bun.exe" if os.name == "nt" else "bun"))
    helper = Path(__file__).resolve().parents[1] / "ui" / "tools" / "ground_array.ts"
    subprocess.run([bun, "run", str(helper), str(Path(output).resolve() / "webgl"), browser, *(["--hardware"] if hardware else [])], check=True)
    report = json.loads(Path(output, "webgl/report.json").read_text(encoding="utf-8"))
    if not report.get("passed"):
        raise ValueError("The WebGL prototype failed conformance; inspect its saved report")
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("out/analysis/ground-regions"), help="derived report and reproducible input fixtures")
    parser.add_argument("--size", type=int, default=512, help="pixels per 256 m tile (16–2048)")
    parser.add_argument("--materials", type=int, default=12, help="distinct materials in the tile (4–32)")
    parser.add_argument("--gpu", action="store_true", help="also run the WebGL2 rendering/reference probe (requires Bun and a Playwright browser)")
    parser.add_argument("--browser", choices=("chrome", "edge", "firefox", "webkit"), default="chrome")
    parser.add_argument("--view-size", type=int, default=256, help="WebGL output size in pixels")
    parser.add_argument("--hardware", action="store_true", help="request the browser's default GPU backend instead of SwiftShader (actual renderer is reported)")
    args = parser.parse_args()
    try:
        report = run(args.output, args.size, args.materials)
    except ValueError as error:
        parser.error(str(error))
    for label, measured in report["runs"].items():
        print(f"{label}: {measured['regions']} regions, {measured['overflow_regions']} overflow, "
              f"{measured['required_capacity']} required slots, {measured['proposed_mask_bytes'] / 2**20:.2f} MiB masks, "
              f"{measured['cpu_seconds']:.3f} s CPU")
    if args.gpu:
        result = webgl(args.output, args.browser, args.view_size, args.hardware)
        print(f"WebGL: {result['renderer']}; conformance passed, {result['regions']['drawCalls']} region draws, "
              f"{result['regions']['textureBytes'] / 2**20:.2f} MiB textures. AC rendering has not been verified.")
    else:
        print(f"Report: {args.output / 'report.json'}; GPU/AC rendering has not been verified.")


if __name__ == "__main__":
    main()
