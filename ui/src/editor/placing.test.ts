import {expect, test} from "bun:test";
import {between, isUnplaced, nudged, nudgeVertices, STILL, unplaced} from "./placing";

test("nudged adds the way and the turn, multiplies the size, within what the draft holds", () => {
  const p = nudged(nudged(unplaced("t#1"), {x: 2, z: -1, turn: 170, scale: 2}), {y: 0.25, turn: 20, scale: 1.5});
  expect(p).toEqual({id: "t#1", x: 2, y: 0.25, z: -1, turn: -170, scale: 3});
  expect(nudged(unplaced("t#1"), {x: 3000, y: -500, scale: 0.01})).toEqual({id: "t#1", x: 1000, y: -100, z: 0, turn: 0, scale: 0.1});
  expect(nudged(unplaced("t#1"), {turn: -180}).turn).toBe(180);
  expect(nudged(unplaced("t#1"), {x: 1 / 3}).x).toBe(0.333);
});

test("between is the nudge that leads from one to the other", () => {
  const from = nudged(unplaced("t#1"), {x: 1, turn: 30, scale: 2}), to = nudged(from, {z: 4, turn: 15, scale: 1.5});
  expect(between(from, to)).toEqual({x: 0, y: 0, z: 4, turn: 15, scale: 1.5});
  expect(isUnplaced(unplaced("t#1"))).toBe(true);
  expect(isUnplaced(nudged(unplaced("t#1"), {turn: 360}))).toBe(true);
  expect(isUnplaced(from)).toBe(false);
});

test("a vertex turned counter-clockwise from above around its pivot, scaled, moved; its normal and tangent turned; the rest as it was", () => {
  const stride = 11, was = new Float32Array(stride), out = new Float32Array(3 * stride).fill(7);
  was.set([12, 100, 10, 0, 1, 0, 0.5, 0.5, 1, 0, 0]);
  nudgeVertices(was, out, [1], stride, [10, 100, 10], {...STILL, turn: 90, scale: 2, y: 1});
  expect([...out.subarray(stride, 2 * stride)].map(v => Math.round(v * 1e5) / 1e5)).toEqual([10, 101, 6, 0, 1, 0, 0.5, 0.5, 0, 0, -1]);
  expect([...out.subarray(0, stride)]).toEqual(Array(stride).fill(7));
});
