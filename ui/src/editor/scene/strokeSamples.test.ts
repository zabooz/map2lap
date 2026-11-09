import {expect, test} from "bun:test";
import {addSample} from "./strokeSamples";
import type {Sample} from "../types";

test("standing still keeps its time at its place, also at the first one and after a way", () => {
  const s: Sample[] = [[1, 2, 0]];
  addSample(s, 1, 2, 0.5);
  addSample(s, 1.1, 2, 0.5);
  expect(s).toEqual([[1, 2, 0], [1, 2, 1]]);          // (not on the press, which the server takes for no time)
  addSample(s, 11, 2, 0.5);
  expect(s).toEqual([[1, 2, 0], [1, 2, 1], [11, 2, 0.5]]);
  addSample(s, 11, 2, 2);
  addSample(s, 11, 2, 1);
  expect(s).toEqual([[1, 2, 0], [1, 2, 1], [11, 2, 0.5], [11, 2, 3]]);       // (not on the way there)
});
