import {expect, test} from "bun:test";
import {globalKey, TOOL_DEFS, TOOLS, toolDef, toolOfKey, type Tool} from "./toolDefs";

const ALL: Tool[] = ["select", "delete", "camera", "move", "copy", "elevation", "smooth", "separate", "bank", "kerb", "stitch", "ai-move", "ai-redraw", "ai-margin", "model", "group"];

test("each tool has one definition with its name, help and selection rule; keys are unique", () => {
  expect(TOOL_DEFS.map(t => t.tool).sort()).toEqual([...ALL].sort());
  for (const def of TOOL_DEFS) {
    expect(def.label.length).toBeGreaterThan(0);
    expect(def.help.length).toBeGreaterThan(0);
    expect(["select", "multi", "single", "delete", "none"]).toContain(def.selection);
  }
  const keys = TOOL_DEFS.flatMap(t => t.key ? [t.key.toLowerCase()] : []);
  expect(new Set(keys).size).toBe(keys.length);
});

test("the panel lists the keyed tools by group; Groups comes from the Library and has no key", () => {
  expect(TOOLS.map(t => t.tool)).not.toContain("group");
  expect(toolDef("group").key).toBeNull();
  expect(toolDef("model").library).toBe(true);
  expect(TOOLS.filter(t => t.group === "road").map(t => t.tool)).toEqual(["smooth", "separate", "bank", "kerb", "stitch"]);
  expect(TOOLS.filter(t => t.group === "ai").map(t => [t.tool, t.label, t.key])).toEqual([["ai-move", "Move line", "L"], ["ai-redraw", "Redraw line", "P"], ["ai-margin", "Side margin", "M"]]);
});

test("Select, Road camera and the AI line tools also work on a track that cannot be edited; Camera and Transform add with Ctrl; Delete deletes its pick; road tools take no left pick", () => {
  expect(TOOL_DEFS.filter(t => t.free).map(t => t.tool).sort()).toEqual(["ai-move", "ai-redraw", "camera", "select"]);
  expect(TOOL_DEFS.filter(t => t.selection === "select").map(t => t.tool)).toEqual(["select"]);
  expect(TOOL_DEFS.filter(t => t.selection === "multi").map(t => t.tool).sort()).toEqual(["camera", "move"]);
  expect(TOOL_DEFS.filter(t => t.selection === "delete").map(t => t.tool)).toEqual(["delete"]);
  expect(TOOL_DEFS.filter(t => t.selection === "none").map(t => t.tool).sort()).toEqual(["ai-margin", "ai-move", "ai-redraw", "bank", "kerb", "separate", "smooth", "stitch"]);
});

test("a key names its tool without Ctrl; Groups is never keyed", () => {
  expect(toolOfKey("b")?.tool).toBe("kerb");
  expect(toolOfKey("B")?.tool).toBe("kerb");
  expect(toolOfKey("L")?.tool).toBe("ai-move");
  expect(toolOfKey("m")?.tool).toBe("ai-margin");
  expect(toolOfKey("p")?.tool).toBe("ai-redraw");
  expect(toolOfKey("library")).toBeUndefined();
  expect(toolOfKey("q")).toBeUndefined();
});

test("no AI line tool switches with Ctrl: Move line and Redraw line are separate tools", () => {
  for (const tool of ["ai-move", "ai-redraw"] as const)
    expect(toolDef(tool).help.some(([keys]) => keys.startsWith("Ctrl"))).toBe(false);
});

test("U takes up Bank road", () => {
  expect(toolOfKey("u")?.tool).toBe("bank");
  expect(toolDef("bank").label).toBe("Bank road");
});

const press = (key: string, more: Partial<KeyboardEvent> = {}) => ({key, ctrlKey: false, metaKey: false, shiftKey: false, ...more});

test("global shortcuts come before a tool's own keys", () => {
  const none = {picked: false};
  expect(globalKey(press("Escape"), none)).toBe("escape");
  expect(globalKey(press("z", {ctrlKey: true}), none)).toBe("undo");
  expect(globalKey(press("Z", {ctrlKey: true, shiftKey: true}), none)).toBe("redo");
  expect(globalKey(press("y", {metaKey: true}), none)).toBe("redo");
  expect(globalKey(press("s", {ctrlKey: true}), none)).toBe("save");
  expect(globalKey(press("Delete"), none)).toBe("delete");
  expect(globalKey(press("Home"), none)).toBe("home");
  expect(globalKey(press("Backspace"), none)).toBeNull();      // (a tool's own: the free kerb's last point)
  expect(globalKey(press("ArrowUp"), none)).toBeNull();
});

test("X deletes what is picked, otherwise takes up Delete; E opens the Library; letters take up their tool", () => {
  expect(globalKey(press("x"), {picked: true})).toBe("delete");
  expect(globalKey(press("x"), {picked: false})).toEqual({tool: "delete"});
  expect(globalKey(press("b"), {picked: true})).toEqual({tool: "kerb"});
  expect(globalKey(press("e"), {picked: false})).toBe("library");
  expect(globalKey(press("b", {ctrlKey: true}), {picked: false})).toBeNull();
});
