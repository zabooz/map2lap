import {expect, test} from "bun:test";
import {TrackEdits, type HeightChange} from "../state/edits";
import {SeparationSession} from "./separation";
import type {Pin} from "./pins";

const height = (id: string): HeightChange => ({id, x: 0, z: 0, nx: 2, nz: 2, mm: [0, 10, 10, 0]});
const points: Pin[] = [[0, 0, 0], [100, 0, 0]];

async function setup(heights: HeightChange[] = []) {
  let revision = 0;
  const edits = new TrackEdits("test", async (_url, options) => new Response(JSON.stringify(options
    ? {revision: ++revision, meshes: []} : {base: "source", revision, deleted: [], outdated: 0, heights})));
  edits.bind("source"); await edits.start();
  return edits;
}

test("Bend road's first height adds one Undo step; later heights replace it in that step; zero removes it", async () => {
  const edits = await setup(), asked: {path: string; replace: string[]; delta?: number}[] = [];
  const session = new SeparationSession(edits, async (path, body) => {
    const b = body as {replace: string[]; delta?: number};
    asked.push({path, replace: b.replace, delta: b.delta});
    return {height: height(`bend-${asked.length}`)};
  });
  try {
    expect(await session.apply(points, 1, "road", 15, 0)).toBe("applied");
    expect(await session.apply(points, 2, "road", 15, 0)).toBe("applied");
    expect(asked).toEqual([{path: "bend", replace: [], delta: 1}, {path: "bend", replace: ["bend-1"], delta: 2}]);
    expect(edits.state().heights.map(h => h.id)).toEqual(["bend-2"]);
    expect(await session.apply(points, 0, "road", 15, 0)).toBe("reset");
    expect(edits.state().heights).toEqual([]);
    expect(edits.state().canUndo).toBe(false);          // (back where it began: no step left)
    expect(await session.apply(points, 0, "road", 15, 0)).toBe("cancelled");      // (the same settings ask nothing)
    expect(asked).toHaveLength(2);
  } finally { edits.stop(); }
});

test("an answer after cancel() is not put; an operation undone elsewhere ends the session", async () => {
  const edits = await setup();
  let answer: ((r: {height: HeightChange}) => void) | null = null;
  const session = new SeparationSession(edits, () => new Promise(resolve => { answer = resolve; }));
  try {
    const pending = session.apply(points, 1, "road", 15, 0);
    await new Promise(resolve => setTimeout(resolve, 0));
    session.cancel();
    answer!({height: height("late")});
    expect(await pending).toBe("cancelled");
    expect(edits.state().heights).toEqual([]);
    const next = session.apply(points, 1.5, "road", 15, 0);
    await new Promise(resolve => setTimeout(resolve, 0));
    answer!({height: height("kept")});
    expect(await next).toBe("applied");
    edits.undo();
    expect(await session.apply(points, 2, "road", 15, 0)).toBe("undone");
    expect(edits.state().heights).toEqual([]);
  } finally { edits.stop(); }
});

test("a refusal says why and leaves the draft; a railway gap at its measured minimum removes the correction", async () => {
  const edits = await setup(), paths: string[] = [];
  const session = new SeparationSession(edits, async path => {
    paths.push(path);
    return paths.length === 1 ? {error: "Too steep for the crossing"} : {height: height("rail")};
  });
  try {
    expect(await session.apply(points, 7, "rail", 2, 5)).toBe("Too steep for the crossing");
    expect(edits.state().heights).toEqual([]);
    expect(await session.apply(points, 7.5, "rail", 2, 5)).toBe("applied");
    expect(paths).toEqual(["separate", "separate"]);
    expect(await session.apply(points, 5, "rail", 2, 5)).toBe("reset");
    expect(edits.state().heights).toEqual([]);
  } finally { edits.stop(); }
});

test("a marked road's existing correction is adopted: the next height replaces it as a new Undo step", async () => {
  const edits = await setup([height("saved-bend")]), asked: string[][] = [];
  const session = new SeparationSession(edits, async (_path, body) => {
    asked.push((body as {replace: string[]}).replace);
    return {height: height("resumed")};
  });
  try {
    expect(edits.state().heights.map(h => h.id)).toEqual(["saved-bend"]);
    session.adopt(["saved-bend"]);
    expect(await session.apply(points, 3, "road", 15, 0)).toBe("applied");
    expect(asked).toEqual([["saved-bend"]]);
    expect(edits.state().heights.map(h => h.id)).toEqual(["resumed"]);
    edits.undo();
    expect(edits.state().heights.map(h => h.id)).toEqual(["saved-bend"]);
  } finally { edits.stop(); }
});

test("after returning to zero, the next height is its own Undo step and never joins an earlier, unrelated change", async () => {
  const edits = await setup();
  let n = 0;
  const session = new SeparationSession(edits, async () => ({height: height(`bend-${++n}`)}));
  try {
    edits.remove([{id: "trees#1", position: [0, 0, 0]}]);
    expect(await session.apply(points, 1, "road", 15, 0)).toBe("applied");
    expect(await session.apply(points, 0, "road", 15, 0)).toBe("reset");
    expect(await session.apply(points, 2, "road", 15, 0)).toBe("applied");
    edits.undo();
    expect(edits.state().heights).toEqual([]);
    expect(edits.state().removed.map(r => r.id)).toEqual(["trees#1"]);     // (the deletion is its own step)
  } finally { edits.stop(); }
});
