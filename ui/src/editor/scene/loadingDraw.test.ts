import {expect, test} from "bun:test";
import {LoadingDraw} from "./loadingDraw";

test("arriving parts share a redraw during loading and the last arrival is not lost", () => {
  const draw = new LoadingDraw();
  draw.begin(1);
  draw.changed();
  expect(draw.due(0, false)).toBe(true);
  for (const now of [16, 32, 48, 64, 80, 96]) {
    draw.changed();
    expect(draw.due(now, false)).toBe(false);
  }
  expect(draw.due(100, false)).toBe(true);
  expect(draw.due(200, false)).toBe(false);
});

test("camera, selection and tool changes draw immediately between loading redraws", () => {
  const draw = new LoadingDraw();
  draw.begin(1);
  draw.changed();
  expect(draw.due(0, false)).toBe(true);
  draw.changed();
  expect(draw.due(16, true)).toBe(true);
  expect(draw.due(32, true)).toBe(true);
  expect(draw.due(48, false)).toBe(false);
});

test("completion or failure flushes the final frame and restores ordinary redraws", () => {
  const draw = new LoadingDraw();
  draw.begin(1);
  draw.changed();
  expect(draw.due(0, false)).toBe(true);
  draw.changed();
  expect(draw.end(1)).toBe(true);
  expect(draw.due(1, false)).toBe(true);
  draw.changed();
  expect(draw.due(2, false)).toBe(true);
});

test("an obsolete track cannot release the next track's redraw limit", () => {
  const draw = new LoadingDraw();
  draw.begin(1);
  draw.changed();
  draw.due(0, false);
  draw.begin(2);
  expect(draw.due(1, false)).toBe(false);
  draw.changed();
  expect(draw.due(2, false)).toBe(true);
  draw.changed();
  expect(draw.end(1)).toBe(false);
  expect(draw.due(16, false)).toBe(false);
  expect(draw.end(2)).toBe(true);
  expect(draw.due(17, false)).toBe(true);
});
