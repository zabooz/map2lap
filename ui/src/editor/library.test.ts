import {expect, test} from "bun:test";
import {repeatHeight, groundTextureProblem} from "./library";

test("changing import width keeps the unedited height proportional to the source image", () => {
  expect(repeatHeight("2", [2048, 1024])).toBe("1");
  expect(repeatHeight("4", [2048, 1024])).toBe("2");
  expect(repeatHeight("3", [1024, 1024])).toBe("3");
});

test("transparent textures stay in the library but cannot be applied to ground", () => {
  expect(groundTextureProblem({source: {alpha: true}}, null)).toContain("opaque");
  expect(groundTextureProblem({source: {alpha: false}}, null)).toBeNull();
  expect(groundTextureProblem(null, "Select ground")).toBe("Select ground");
});
