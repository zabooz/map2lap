import {expect, test} from "bun:test";
import {altAction, selectActions, smoothStart} from "./selectActions";

const ground = {mesh: 3, u: 0.2, v: 0.4, revision: "r"};

test("The Select bar offers what can be done with what is picked, never a tool that works on more than it", () => {
  expect(selectActions(null)).toEqual([]);
  expect(selectActions({id: "trees#4", road: null, surface: undefined})).toEqual(["replace", "move", "copy", "delete"]);
  // (Smooth road and Elevation work on the ground around too: the picked surface would look like all they change)
  expect(selectActions({id: null, road: [10, 20], surface: ground})).toEqual(["texture"]);
  expect(selectActions({id: null, road: null, surface: ground})).toEqual(["texture"]);
  // (a material area of a separate mesh can't be painted yet)
  expect(selectActions({id: null, road: null, surface: {...ground, face: 7}})).toEqual([]);
  expect(selectActions({id: null, road: null, surface: undefined})).toEqual([]);
});

test("Alt changes the picked ground's texture or replaces the picked objects", () => {
  expect(altAction(["texture"])).toBe("texture");
  expect(altAction(["replace", "move", "copy", "delete"])).toBe("replace");
  expect(altAction([])).toBeNull();
});

test("Smooth road taken up from Select starts at the picked road point", () => {
  expect(smoothStart("select", "smooth", {road: [10, 20]})).toEqual([10, 20]);
  expect(smoothStart("select", "smooth", {road: null})).toBeNull();
  expect(smoothStart("move", "smooth", {road: [10, 20]})).toBeNull();
  expect(smoothStart("select", "elevation", {road: [10, 20]})).toBeNull();
  expect(smoothStart("select", "smooth", null)).toBeNull();
});
