import {expect, test} from "bun:test";
import {CtrlAlone, AltAlone, heldOf, ShiftAlone} from "./held";

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

const key = (k: string, more: Partial<KeyboardEvent> = {}) => ({key: k, ctrlKey: false, shiftKey: false, metaKey: false, repeat: false, ...more});

test("Alt counts when it was pressed and let go by itself", () => {
  const alt = new AltAlone();
  alt.down(key("Alt"));
  expect(alt.up(key("Alt"))).toBe(true);
  expect(alt.up(key("Alt"))).toBe(false);     // (once)
});

test("Alt with another key, a click, the wheel, AltGr or a window switch does not count", () => {
  const alt = new AltAlone();
  alt.down(key("Alt")); alt.down(key("Tab")); expect(alt.up(key("Alt"))).toBe(false);
  alt.down(key("Alt")); alt.other(); expect(alt.up(key("Alt"))).toBe(false);
  alt.down(key("Alt", {ctrlKey: true})); expect(alt.up(key("Alt"))).toBe(false);      // (AltGr arrives as Ctrl and Alt)
  alt.down(key("Alt")); alt.down(key("Alt", {repeat: true})); expect(alt.up(key("Alt"))).toBe(true);
  alt.down(key("Alt")); expect(alt.up(key("Shift"))).toBe(false); expect(alt.up(key("Alt"))).toBe(true);
});

test("Shift pressed and let go by itself switches a tool's mode once", () => {
  const shift = new ShiftAlone();
  shift.down(key("Shift"));
  expect(shift.up(key("Shift"))).toBe(true);
  expect(shift.up(key("Shift"))).toBe(false);
  shift.down(key("Shift")); shift.down(key("Shift", {repeat: true}));
  expect(shift.up(key("Shift"))).toBe(true);
});

test("Shift with another key (Ctrl+Shift+Z), a click, the wheel or typed in a field does not switch", () => {
  const shift = new ShiftAlone();
  shift.down(key("Shift")); shift.down(key("Z", {ctrlKey: true, shiftKey: true})); expect(shift.up(key("Shift"))).toBe(false);
  shift.down(key("Shift")); shift.other(); expect(shift.up(key("Shift"))).toBe(false);
  shift.down({...key("Shift"), inField: true}); expect(shift.up(key("Shift"))).toBe(false);
});

test("Ctrl alone switches once, shortcuts, other modifiers, fields, clicks and wheel do not", () => {
  const ctrl = new CtrlAlone();
  ctrl.down(key("Control")); expect(ctrl.up(key("Control"))).toBe(true);
  expect(ctrl.up(key("Control"))).toBe(false);
  for (const other of ["z", "y", "s", "Shift", "Alt"]) {
    ctrl.down(key("Control")); ctrl.down(key(other)); expect(ctrl.up(key("Control"))).toBe(false);
  }
  ctrl.down(key("Control")); ctrl.other(); ctrl.down(key("Control",{repeat:true}));
  expect(ctrl.up(key("Control"))).toBe(false);
  ctrl.down({...key("Control"), inField:true}); expect(ctrl.up(key("Control"))).toBe(false);
});
