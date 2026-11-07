import {expect, test} from "bun:test";
import {heldOf} from "./held";

const keys = (shiftKey: boolean, ctrlKey: boolean, altKey: boolean) => heldOf({shiftKey, ctrlKey, altKey});

test("Ctrl and Alt each mean their own, together the third thing and neither of them", () => {
  expect(keys(false, true, false)).toEqual({shift: false, ctrl: true, alt: false, ctrlAlt: false});
  expect(keys(false, false, true)).toEqual({shift: false, ctrl: false, alt: true, ctrlAlt: false});
  expect(keys(false, true, true)).toEqual({shift: false, ctrl: false, alt: false, ctrlAlt: true});
});

test("Shift stands by itself, with the others too", () => {
  expect(keys(true, false, false).shift).toBe(true);
  expect(keys(true, true, false)).toEqual({shift: true, ctrl: true, alt: false, ctrlAlt: false});
  expect(keys(false, false, false)).toEqual({shift: false, ctrl: false, alt: false, ctrlAlt: false});
});
