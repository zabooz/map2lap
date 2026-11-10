import {expect, test} from "bun:test";
import {gridHeight, GRID_POINTS} from "./groundGrid";

test("nine ground points across the ring carry a slope to every plant between them", () => {
  // (a slope rising 0.5 m per metre eastwards, sampled on 3 × 3 points 10 m apart round 100, 200)
  const heights = GRID_POINTS.map(([u]) => 50 + .5 * u * 10);
  const at = gridHeight(heights, 100, 200, 10, 50);
  expect(at(100, 200)).toBeCloseTo(50);
  expect(at(106, 195)).toBeCloseTo(53);
  expect(at(92, 209)).toBeCloseTo(46);
  expect(at(130, 200)).toBeCloseTo(55);      // (beyond the outer points: their height, not a steeper guess)
});

test("a point off the ground takes the ring's own height", () => {
  const heights: (number | null)[] = GRID_POINTS.map(([u, v]) => u === 1 && v === 1 ? null : 10);
  expect(gridHeight(heights, 0, 0, 10, 4)(10, 10)).toBeCloseTo(4);
  expect(gridHeight(heights, 0, 0, 10, 4)(-10, -10)).toBeCloseTo(10);
});
