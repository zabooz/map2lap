import {expect, test} from "bun:test";
import {cursorFor, DELETE_CURSOR, type CursorState} from "./cursor";

const state = (tool: CursorState["tool"], more: Partial<CursorState> = {}): CursorState => ({tool, dragging: false, pin: false, aiming: false, ...more});
const tree = {object: true, movable: true, road: false}, wires = {object: true, movable: false, road: false};
const road = {object: false, movable: false, road: true}, meadow = {object: false, movable: false, road: false};

test("The pointer says what a click of the tool on does to what is under it", () => {
  expect(cursorFor(state("select"), tree)).toBe("pointer");
  expect(cursorFor(state("select"), road)).toBe("");
  expect(cursorFor(state("move"), tree)).toBe("grab");
  expect(cursorFor(state("move"), wires)).toBe("");
  expect(cursorFor(state("copy"), tree)).toBe("copy");
  expect(cursorFor(state("copy"), wires)).toBe("");
  expect(cursorFor(state("delete"), wires)).toBe(DELETE_CURSOR);
  expect(cursorFor(state("delete"), meadow)).toBe("");
  expect(cursorFor(state("smooth"), road)).toBe("crosshair");
  expect(cursorFor(state("smooth"), meadow)).toBe("");
  expect(cursorFor(state("camera"), tree)).toBe("");
  expect(cursorFor(state("select"), null)).toBe("");
});

test("A drag, a road pin and a brush's ring or a placement ghost come before what is under the mouse", () => {
  expect(cursorFor(state("move", {dragging: true}), meadow)).toBe("grabbing");
  expect(cursorFor(state("smooth", {pin: true}), meadow)).toBe("grab");
  expect(cursorFor(state("elevation", {aiming: true}), null)).toBe("crosshair");
  expect(cursorFor(state("copy", {aiming: true}), tree)).toBe("crosshair");
});

test("Delete's pointer is an image with its hot spot in the middle and a pointer where images are not drawn", () => {
  expect(DELETE_CURSOR).toMatch(/^url\("data:image\/svg\+xml,[^"]+"\) 12 12, pointer$/);
});
