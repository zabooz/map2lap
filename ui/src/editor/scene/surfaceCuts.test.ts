import {expect, test} from "bun:test";
import {cutsOf, isVerge, joinedCuts} from "./surfaceCuts";

test("selected triangles become sorted ranges per mesh, by its name", () => {
  const names = new Map([[3, "nocol_road_edge_dirt_0_0"], [5, "nocol_road_edge_dirt_1_0"]]);
  expect(cutsOf([{mesh: 3, faces: [7, 1, 2, 0, 9]}, {mesh: 5, faces: [4]}], names)).toEqual([
    {mesh: "nocol_road_edge_dirt_0_0", faces: [[0, 3], [7, 1], [9, 1]]}, {mesh: "nocol_road_edge_dirt_1_0", faces: [[4, 1]]}]);
});

test("a selection holding anything but the verge can't go by its triangles", () => {
  expect(cutsOf([{mesh: 3, faces: [0]}, {mesh: 4, faces: [0]}], new Map([[3, "nocol_road_edge_dirt_0_0"], [4, "nocol_bld_0_0"]]))).toBeNull();
  expect(cutsOf([], new Map())).toBeNull();
  expect(isVerge("nocol_road_edge_dirt_-1_2")).toBe(true);
  expect(isVerge("1ROAD_ground_0_0")).toBe(false);
});

test("ranges of the same mesh join, touching and overlapping ones as one", () => {
  expect(joinedCuts([{mesh: "a", faces: [[4, 2]]}], [{mesh: "a", faces: [[0, 4], [5, 3]]}, {mesh: "b", faces: [[1, 1]]}]))
    .toEqual([{mesh: "a", faces: [[0, 8]]}, {mesh: "b", faces: [[1, 1]]}]);
});
