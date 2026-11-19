import {expect, test} from "bun:test";
import {handOver, pickRoute, usable, type ToolController} from "./toolHost";
import type {Tool} from "./toolDefs";
import type {Picked} from "../types";

/** Controllers that record what was called on them. */
function recorded(tools: Tool[]) {
  const calls: string[] = [];
  const controllers = Object.fromEntries(tools.map(tool => [tool, {
    clear: () => calls.push(`${tool}.clear`),
    activate: ({tool: from, picked}: {tool: Tool; picked: Picked | null}) => calls.push(`${tool}.activate from ${from} ${picked?.id ?? "-"}`),
  } satisfies ToolController]));
  return {calls, controllers};
}

const picked = {id: "trees#1", left: true} as Picked;

test("taking up a tool clears the one on and activates the new one with what was picked; nothing else is touched", () => {
  const {calls, controllers} = recorded(["select", "smooth", "kerb"]);
  handOver(controllers, "select", "smooth", picked);
  expect(calls).toEqual(["select.clear", "smooth.activate from select trees#1"]);
});

test("taking up the tool that is on again restarts it", () => {
  const {calls, controllers} = recorded(["select"]);
  handOver(controllers, "select", "select", null);
  expect(calls).toEqual(["select.clear", "select.activate from select -"]);
});

test("tools without lifecycle need no controller methods", () => {
  expect(() => handOver({}, "camera", "copy", null)).not.toThrow();
});

test("a tool that changes the track works only while it can be edited; Select and Road camera always", () => {
  expect(usable("kerb", false)).toBe(false);
  expect(usable("kerb", true)).toBe(true);
  expect(usable("select", false)).toBe(true);
  expect(usable("camera", false)).toBe(true);
});

test("a road tool's left pick is dropped; its right pick goes to the menu; other tools' picks go to the selection", () => {
  expect(pickRoute("smooth", true, {left: true})).toBe("drop");
  expect(pickRoute("smooth", true, {left: false})).toBe("select");
  expect(pickRoute("smooth", false, {left: true})).toBe("select");       // (not editable: the tool is off, a pick is a plain pick)
  expect(pickRoute("select", true, {left: true})).toBe("select");
  expect(pickRoute("delete", true, null)).toBe("select");
});
