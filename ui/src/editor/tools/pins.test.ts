import {expect, test} from "bun:test";
import {onBand, withPin, type Pin} from "./pins";
import type {Place} from "../types";

const line: Place[] = Array.from({length: 51}, (_, k) => [k * 2, 0, 0]);    // (x 0 to 100)
const ab: Pin[] = [[0, 0], [100, 0]];

test("the first two pins are A and B, in the order clicked", () => {
  expect(withPin([], null, 5, 5)).toEqual([[5, 5]]);
  expect(withPin([[5, 5]], null, 9, 9)).toEqual([[5, 5], [9, 9]]);
});

test("a new pin goes where it lies along the band, whichever was clicked first", () => {
  const far = withPin(ab, line, 70, 1);
  expect(far).toEqual([[0, 0], [70, 1], [100, 0]]);
  expect(withPin(far, line, 30, 1)).toEqual([[0, 0], [30, 1], [70, 1], [100, 0]]);       // (before it)
  expect(withPin(far, line, 85, 1)).toEqual([[0, 0], [70, 1], [85, 1], [100, 0]]);       // (after it)
});

test("beyond an end the band grows that way", () => {
  expect(withPin(ab, line, 120, 0)).toEqual([[0, 0], [100, 0], [120, 0]]);
  expect(withPin(ab, line, -20, 0)).toEqual([[-20, 0], [0, 0], [100, 0]]);
});

test("on the band is within half its width of its line, between its ends too and not far beyond them", () => {
  expect(onBand(line, 8, 51, 3.9)).toBe(true);          // (between two points of the line)
  expect(onBand(line, 8, 51, 4.1)).toBe(false);
  expect(onBand(line, 8, 103, 0)).toBe(true);           // (the end's round cap)
  expect(onBand(line, 8, 105, 0)).toBe(false);
});

test("while there is no band yet it goes before the end", () => {
  expect(withPin(ab, null, 50, 0)).toEqual([[0, 0], [50, 0], [100, 0]]);
});
