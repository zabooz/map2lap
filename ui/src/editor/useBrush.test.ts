import {expect, test} from "bun:test";
import {MAX_RADIUS, MIN_RADIUS, RADIUS_STEP, stepped} from "./useBrush";

const radius = (value: number, by: number) => stepped(value, by, RADIUS_STEP, MIN_RADIUS, MAX_RADIUS);

test("a notch of the wheel moves a small radius by half a metre, down to the least", () => {
  expect(radius(5, 1)).toBe(5.5);
  expect(radius(2.5, -1)).toBe(2);
  expect(radius(2, -1)).toBe(2);
});

test("a big radius goes by its share, still in whole steps, up to the most", () => {
  expect(radius(200, 1)).toBe(220);
  expect(radius(13, 1)).toBe(14.5);       // (13 + 1.3, on the half metre)
  expect(radius(MAX_RADIUS, 1)).toBe(MAX_RADIUS);
});
