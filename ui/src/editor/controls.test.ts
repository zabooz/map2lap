import {expect, test} from "bun:test";
import {DEFAULT_CONTROLS, MEMORY_RANGE, parseControls, SPEED_RANGE} from "./controls";
import {decodedBytes, fits} from "./inspect";

test("nothing stored or something broken: the defaults", () => {
  expect(parseControls(null)).toEqual(DEFAULT_CONTROLS);
  expect(parseControls("not json")).toEqual(DEFAULT_CONTROLS);
  expect(parseControls("null")).toEqual(DEFAULT_CONTROLS);
  expect(parseControls('{"fly": "fast", "invertLook": 1}')).toEqual(DEFAULT_CONTROLS);
});

test("a stored value stays, the others take their defaults", () => {
  expect(parseControls('{"fly": 80, "invertLook": true}')).toEqual({...DEFAULT_CONTROLS, fly: 80, invertLook: true});
});

test("a value out of range comes back into it", () => {
  expect(parseControls('{"zoom": 100000}').zoom).toBe(SPEED_RANGE[1]);
  expect(parseControls('{"zoom": 0}').zoom).toBe(SPEED_RANGE[0]);
  expect(parseControls('{"memoryGb": 100000}').memoryGb).toBe(MEMORY_RANGE[1]);
  expect(parseControls('{"memoryGb": 0}').memoryGb).toBe(MEMORY_RANGE[0]);
  expect(parseControls('{"memoryGb": 8}').memoryGb).toBe(8);
});

test("a memory limit: what fits, and what is left once the limit is reached", () => {
  const gb = 1024 ** 3;
  expect(fits(0, gb, 1)).toBe(true);
  expect(fits(gb, 1, 1)).toBe(false);
  expect(fits(gb / 2, gb / 2, 1)).toBe(true);
  // 12 RGBA pixels: 48 bytes for the bitmap plus 64 for the GPU texture and its mipmaps.
  expect(decodedBytes(3, 4)).toBe(112);
});
