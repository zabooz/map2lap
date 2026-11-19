import {expect, test} from "bun:test";
import {TrackEdits, type WallEdit} from "./edits";
import {serverEdit} from "./serverEdit";

const wall = (id: string): WallEdit => ({id, rise: 1, material: null});

/** A draft whose saves the server keeps (refuse(): the next save is refused as never possible). */
async function draft() {
  let revision = 0, refusing = false;
  const edits = new TrackEdits("test", async (_url, options) => {
    if (!options) return new Response(JSON.stringify({base: "source", revision, deleted: [], outdated: 0}));
    if (refusing) return new Response(JSON.stringify({error: "never possible"}), {status: 400});
    return new Response(JSON.stringify({revision: ++revision, meshes: []}));
  });
  edits.bind("source"); await edits.start();
  return {edits, refuse: () => { refusing = true; }};
}

test("the change is asked against the kept draft, put as one Undo step and confirmed", async () => {
  const {edits} = await draft();
  try {
    edits.remove([{id: "trees#1", position: [0, 0, 0]}]);
    const asked: [string, number][] = [];
    const result = await serverEdit(edits, {
      ask: async (base, revision) => { asked.push([base, revision]); return {walls: [wall("w")]}; },
      put: answer => { edits.setWalls(answer.walls); return true; }, failure: "Could not change the wall"});
    expect(result).toEqual({state: "applied", answer: {walls: [wall("w")]}});
    expect(asked).toEqual([["source", 1]]);            // (the deletion before it was kept first)
    expect(edits.state().walls).toEqual([wall("w")]);
    edits.undo();
    expect(edits.state().walls).toEqual([]);
    expect(edits.state().removed).toHaveLength(1);
  } finally { edits.stop(); }
});

test("an answer no longer wanted is not put", async () => {
  const {edits} = await draft();
  try {
    let wanted = true, put = 0;
    const result = await serverEdit(edits, {wanted: () => wanted,
      ask: async () => { wanted = false; return {walls: [wall("w")]}; },
      put: () => { put++; return true; }, failure: "x"});
    expect(result).toEqual({state: "cancelled"});
    expect(put).toBe(0);
    expect(edits.state().canUndo).toBe(false);
  } finally { edits.stop(); }
});

test("a refusal, a failed request or a draft that no longer fits leaves the draft unchanged and says why", async () => {
  const {edits} = await draft();
  try {
    expect(await serverEdit(edits, {ask: async () => ({error: "Too steep"}), put: () => true, failure: "x"}))
      .toEqual({state: "refused", message: "Too steep"});
    expect(await serverEdit(edits, {ask: async () => { throw new Error("offline"); }, put: () => true, failure: "x"}))
      .toEqual({state: "refused", message: "offline"});
    expect(await serverEdit(edits, {ask: async () => ({}), put: () => false, failure: "The operation changed"}))
      .toEqual({state: "refused", message: "The operation changed"});
    expect(edits.state().canUndo).toBe(false);
  } finally { edits.stop(); }
});

test("a change put but refused by the draft's save is reported as not kept, not as unchanged", async () => {
  const {edits, refuse} = await draft();
  try {
    refuse();
    const result = await serverEdit(edits, {ask: async () => ({walls: [wall("w")]}),
      put: answer => { edits.setWalls(answer.walls); return true; }, failure: "x", unkept: "The wall change could not be kept."});
    expect(result).toEqual({state: "unkept", answer: {walls: [wall("w")]}, message: "The wall change could not be kept."});
  } finally { edits.stop(); }
});

test("nothing is asked while the track cannot be edited", async () => {
  const {edits} = await draft();
  try {
    edits.hold(true);
    let asked = 0;
    const result = await serverEdit(edits, {ask: async () => { asked++; return {}; }, put: () => true, failure: "x",
      unsaved: "The current changes could not be kept."});
    expect(result).toEqual({state: "refused", message: "The current changes could not be kept."});
    expect(asked).toBe(0);
  } finally { edits.stop(); }
});

test("put can name why it did not put the answer", async () => {
  const {edits} = await draft();
  try {
    expect(await serverEdit(edits, {ask: async () => ({}), put: () => "The trees changed. Try again.", failure: "x"}))
      .toEqual({state: "refused", message: "The trees changed. Try again."});
  } finally { edits.stop(); }
});
