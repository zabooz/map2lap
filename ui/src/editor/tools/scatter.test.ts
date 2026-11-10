import {expect, test} from "bun:test";
import {scatter, type ScatterOptions} from "./scatter";

const options: ScatterOptions = {radius: 8, spacing: 2, density: 30, seed: 42,
  entries: [{model: "oak", weight: 3, minScale: .8, maxScale: 1.2}, {model: "bush", weight: 1, minScale: .5, maxScale: .9}]};
test("a frozen stroke repeats its model choices, positions, turns and sizes", () => {
  const a = scatter([[0, 0, 0]], options);
  expect(a.length).toBeGreaterThan(5); expect(scatter([[0, 0, 9]], options)).toEqual(a);
  expect(scatter([[0, 0, 0]], {...options, seed: 43})).not.toEqual(a);
  for (const p of a) { const e = options.entries.find(e => e.model === p.model)!;
    expect(p.scale).toBeGreaterThanOrEqual(e.minScale); expect(p.scale).toBeLessThanOrEqual(e.maxScale);
    expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(options.radius);
  }
});
test("minimum spacing holds across overlapping brush stamps and existing plants", () => {
  const a = scatter([[0, 0, 0], [3, 0, 0], [6, 0, 0]], options, [{x: 0, z: 0}]);
  for (let i = 0; i < a.length; i++) {
    expect(Math.hypot(a[i].x, a[i].z)).toBeGreaterThanOrEqual(options.spacing);
    for (let j = 0; j < i; j++) expect(Math.hypot(a[i].x - a[j].x, a[i].z - a[j].z)).toBeGreaterThanOrEqual(options.spacing);
  }
});
test("stationary events never accumulate another forest; straight paths are resampled by distance", () => {
  expect(scatter([[0, 0, 0], [0, 0, 100]], options)).toEqual(scatter([[0, 0, 0]], options));
  expect(scatter([[0, 0, 0], [20, 0, 0]], options)).toEqual(scatter([[0, 0, 0], [10, 0, 0], [20, 0, 0]], options));
});
test("zero-weight entries never appear and malformed settings fail explicitly", () => {
  expect(scatter([[0, 0, 0]], {...options, entries: [{...options.entries[0], weight: 0}, options.entries[1]]}).every(p => p.model === "bush")).toBe(true);
  for (const change of [{density: NaN}, {spacing: 0}, {radius: Infinity}, {entries: []}, {entries: [{...options.entries[0], weight: -1}]}])
    expect(() => scatter([[0, 0, 0]], {...options, ...change})).toThrow();
});
test("dense brushes stop at a bounded count and disclose truncation", () => {
  const result = scatter([[0, 0, 0]], {...options, radius: 500, spacing: .1, density: 1000});
  expect(result.length).toBeLessThanOrEqual(2000); expect(result.limited).toBe(true);
});

test("mixture sizes stay within the ordinary Transform tool's 10–1000% range", () => {
  for (const change of [{minScale: .05}, {maxScale: 20}])
    expect(() => scatter([[0, 0, 0]], {...options, entries: [{...options.entries[0], ...change}]})).toThrow();
});

test("a stroke over the cap thins evenly over the whole brush instead of filling one side", () => {
  const result = scatter([[0, 0, 0]], {...options, radius: 100, spacing: .1, density: 10});
  expect(result.limited).toBe(true); expect(result.length).toBeLessThanOrEqual(2000);
  const east = result.filter(p => p.x > 0).length, west = result.length - east;
  expect(east / result.length).toBeGreaterThan(.4); expect(west / result.length).toBeGreaterThan(.4);
  expect(result.length).toBeGreaterThan(1500);
});
