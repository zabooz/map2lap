import {expect, test} from "bun:test";
import {groupCost, groupShares, patchPlants} from "./groupMix";
import type {TrackCost} from "./ModelCost";

const entry = (model: string, weight: number, minScale = 1, maxScale = 1) => ({model, weight, minScale, maxScale});
const cost = (triangles: number, none: number, mesh: number): TrackCost =>
  ({version: 1, triangles, bytes: {none, mesh}, warning_bytes: 1, heavy: {none: false, mesh: false}});

test("each object's share of the mixture follows its weight", () => {
  expect(groupShares([entry("a", 3), entry("b", 1), entry("c", 0)])).toEqual([.75, .25, 0]);
  expect(groupShares([entry("a", 0)])).toEqual([0]);
});

test("a group costs each object as often as its weight, the bytes of each object's own collision", () => {
  const costs = {a: cost(100, 1_000_000, 5_000_000), b: cost(1000, 2_000_000, 4_000_000)};
  expect(groupCost([entry("a", 3), entry("b", 1)], costs, {a: {collision: "none"}, b: {collision: "mesh"}}))
    .toEqual({objects: 4, triangles: 3 * 100 + 1000, bytes: 3 * 1_000_000 + 4_000_000});
  expect(groupCost([entry("a", 3), entry("b", 1)], {a: costs.a}, {})).toBeNull();
  expect(groupCost([], costs, {})).toBeNull();
});

test("the preview shows the group as it is: each object as often as its weight, the same each time", () => {
  const entries = [entry("tree", 2, .8, 1.2), entry("bush", 5), entry("never", 0)], widths = {tree: 6, bush: 2, never: 1};
  const plants = patchPlants(entries, widths, true);
  expect(plants.filter(p => p.model === "tree")).toHaveLength(2);
  expect(plants.filter(p => p.model === "bush")).toHaveLength(5);
  expect(plants.some(p => p.model === "never")).toBe(false);
  expect(patchPlants(entries, widths, true)).toEqual(plants);
  for (const p of plants.filter(p => p.model === "tree")) { expect(p.scale).toBeGreaterThanOrEqual(.8); expect(p.scale).toBeLessThanOrEqual(1.2); }
  for (let i = 0; i < plants.length; i++) for (let j = 0; j < i; j++)
    expect(Math.hypot(plants[i].x - plants[j].x, plants[i].z - plants[j].z)).toBeGreaterThan(.5);
});

test("without random position the group stands in rows at one spacing; without random an object is unturned at its one size", () => {
  const plants = patchPlants([entry("tree", 4), {...entry("bush", 5, .7, 1.3), random: false}], {tree: 2, bush: 2}, false);
  const xs = [...new Set(plants.map(p => p.x.toFixed(6)))], zs = [...new Set(plants.map(p => p.z.toFixed(6)))];
  expect(xs.length * zs.length).toBeLessThan(plants.length * 2);
  const step = Math.min(...plants.slice(1).map(p => Math.hypot(p.x - plants[0].x, p.z - plants[0].z)));
  for (const p of plants) { expect(Math.abs((p.x - plants[0].x) / step - Math.round((p.x - plants[0].x) / step))).toBeLessThan(1e-9); }
  for (const p of plants.filter(p => p.model === "bush")) expect([p.turn, p.scale]).toEqual([0, .7]);
});

test("a large weight keeps the preview bounded", () => {
  expect(patchPlants([entry("grass", 1000)], {grass: .05}, true).length).toBeLessThanOrEqual(400);
  expect(patchPlants([entry("grass", 1)], {}, true)).toHaveLength(1);
});
