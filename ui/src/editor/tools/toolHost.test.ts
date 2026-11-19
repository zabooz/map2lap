import {expect, test} from "bun:test";
import {editorKey, handOver, pickRoute, usable, type ToolController} from "./toolHost";
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

const key = (k: string) => ({key: k, ctrlKey: false, metaKey: false, shiftKey: false});

/** A tool with one of its own ranges picked, which records its removals. */
function ranged(picked: boolean) {
  const removed: string[] = [];
  const controller: ToolController = {removable: picked, remove: () => { if (!picked) return false; removed.push("range"); return true; }};
  return {removed, controller};
}

test("Delete deletes a picked range of the tool", () => {
  const {removed, controller} = ranged(true);
  expect(editorKey(key("Delete"), false, controller)).toBe("removed");
  expect(removed).toEqual(["range"]);
});

test("X deletes a picked range of the tool", () => {
  const {removed, controller} = ranged(true);
  expect(editorKey(key("x"), false, controller)).toBe("removed");
  expect(removed).toEqual(["range"]);
});

test("without a picked range Delete goes to the shared selection", () => {
  const {removed, controller} = ranged(false);
  expect(editorKey(key("Delete"), true, controller)).toBe("delete");
  expect(editorKey(key("Delete"), false, controller)).toBe("delete");
  expect(removed).toEqual([]);
});

test("without a picked range or selection X takes up the Delete tool; with a selection it deletes it", () => {
  const {controller} = ranged(false);
  expect(editorKey(key("x"), false, controller)).toEqual({tool: "delete"});
  expect(editorKey(key("x"), true, controller)).toBe("delete");
  expect(editorKey(key("x"), false, undefined)).toEqual({tool: "delete"});
});
