import {expect, test} from "bun:test";
import {TrackEdits, type HeightChange} from "./edits";
import {SmoothSession} from "./smoothing";
import {TOOLS} from "./ToolPanel";

const height = (id: string): HeightChange => ({id, x: 0, z: 0, nx: 2, nz: 2, mm: [0, 10, 10, 0]});
const points: [number, number][] = [[0, 0], [100, 0]];

async function setup() {
  let revision = 0;
  const edits = new TrackEdits("test", async (_url, options) => new Response(JSON.stringify(options
    ? {revision: ++revision, meshes: []} : {base: "source", revision, deleted: [], outdated: 0})));
  edits.bind("source"); await edits.start();
  return edits;
}

test("Smooth road starts at zero without a request; later adjustments replace their own result", async () => {
  const edits = await setup(), calls: {replace?: string; strength: number}[] = [];
  const session = new SmoothSession(edits, async body => { calls.push(body); return {height: height(String(calls.length)), standing: 0}; });
  try {
    await session.update(points, 12, 0);
    expect(calls).toHaveLength(0);
    expect(edits.state().heights).toEqual([]);
    await session.update(points, 12, 40);
    await session.update(points, 12, 60);
    expect(calls.map(call => call.replace)).toEqual([undefined, "1"]);
    expect(edits.state().heights.map(h => h.id)).toEqual(["2"]);
    await session.update(points, 12, 0);
    expect(edits.state().heights).toEqual([]);
    await session.update(points, 12, 20);
    edits.undo();
    expect(edits.state().heights).toEqual([]);
    expect(edits.state().canUndo).toBe(false);
  } finally { edits.stop(); }
});

test("Escape cancellation discards a late smoothing response and Undo never reapplies it", async () => {
  const edits = await setup();
  let answer: ((r: {height: HeightChange; standing: number}) => void) | null = null;
  const session = new SmoothSession(edits, () => new Promise(resolve => { answer = resolve; }));
  try {
    const pending = session.update(points, 12, 50);
    await new Promise(resolve => setTimeout(resolve, 0));
    session.reset();
    answer!({height: height("late"), standing: 0});
    await pending;
    expect(edits.state().heights).toEqual([]);
    const next = session.update(points, 12, 50);
    await new Promise(resolve => setTimeout(resolve, 0));
    answer!({height: height("kept"), standing: 0});
    await next;
    edits.undo();
    const count = edits.state().heights.length;
    expect((await session.update(points, 12, 50)).state).toBe("undone");
    expect(edits.state().heights.length).toBe(count);
  } finally { edits.stop(); }
});

test("the tool list has Smooth road and Road camera without a separate Mark road tool", () => {
  expect(TOOLS.some(tool => tool.label === "Mark road")).toBe(false);
  expect(TOOLS.find(tool => tool.tool === "smooth")?.label).toBe("Smooth road");
  expect(TOOLS.find(tool => tool.tool === "camera")?.label).toBe("Road camera");
});
