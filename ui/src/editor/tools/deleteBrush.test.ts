import {expect, test} from "bun:test";
import {alongStroke} from "./deleteBrush";
import {wheelTaken} from "./toolHost";

const at = (id: string, x: number, z: number) => ({id, position: [x, 7, z] as [number, number, number]});

test("a stroke takes what stands within its radius of the path, also between two far points of a fast drag", () => {
  const objects = [at("near", 1, 1), at("between", 50, 2), at("far", 50, 9), at("end", 103, 0)];
  expect(alongStroke(objects, [[0, 0, 0], [100, 0, 16]], 5).map(o => o.id)).toEqual(["near", "between", "end"]);
});

test("a click is a circle; nothing beside it goes, and each object once", () => {
  const objects = [at("in", 3, 4), at("edge", 5, 0), at("out", 5, 1)];
  expect(alongStroke(objects, [[0, 0, 0], [0, 0, 16], [0, 0, 32]], 5)).toEqual([at("in", 3, 4), at("edge", 5, 0)]);
  expect(alongStroke(objects, [], 5)).toEqual([]);
});

test("a tool that takes the wheel (Delete: Ctrl for its brush radius) gets it only while the track can be edited", () => {
  const controllers = {delete: {takesWheel: true}};
  expect(wheelTaken("delete", true, controllers)).toBe(true);
  expect(wheelTaken("delete", false, controllers)).toBe(false);
  expect(wheelTaken("select", true, controllers)).toBe(false);
});
