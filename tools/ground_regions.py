"""Measure local material-palette feasibility before changing the Editor renderer; no user track or library is modified."""
import argparse
import json
from pathlib import Path
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("out/analysis/ground-regions"), help="derived report and reproducible input fixtures")
    parser.add_argument("--size", type=int, default=512, help="pixels per 256 m tile (16–2048)")
    parser.add_argument("--materials", type=int, default=12, help="distinct materials in the tile (4–32)")
    args = parser.parse_args()
    try:
        report = run(args.output, args.size, args.materials)
    except ValueError as error:
        parser.error(str(error))
    for label, measured in report["runs"].items():
        print(f"{label}: {measured['regions']} regions, {measured['overflow_regions']} overflow, "
              f"{measured['required_capacity']} required slots, {measured['proposed_mask_bytes'] / 2**20:.2f} MiB masks, "
              f"{measured['cpu_seconds']:.3f} s CPU")
    print(f"Report: {args.output / 'report.json'}; GPU/AC rendering has not been verified.")


if __name__ == "__main__":
    main()
