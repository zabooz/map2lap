import {expect, test} from "bun:test";
import {isCurrent, TrackEdits, type Removed} from "./edits";

const tree = (k: number): Removed => ({id: `nocol_trees_0_0#${k}`, position: [k, 0, 0]});
const json = (body: object, status = 200) => new Response(JSON.stringify(body), {status});

/** A server by hand: each request waits until answered, with what it asked for at hand. */
function server(deleted: Removed[] = []) {
  const asked: {method: string; body: {revision: number; deleted: Removed[]}; answer: (r: Response) => void}[] = [];
  const send = (_url: string, options?: RequestInit) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 3, deleted, outdated: 0}));
    return new Promise<Response>(answer => asked.push({method: options.method!, body: JSON.parse(String(options.body)), answer}));
  };
  return {send, asked};
}

const settle = () => new Promise(ok => setTimeout(ok, 0));

test("model bindings and their prepared poses are one undoable saved change, rebind keeps identity", async () => {
  const {edits} = await started();
  const model = {id: "instance_one", asset: "first", at: [1, 0, 2] as [number, number, number], replaces: null, collision: "none" as const};
  const pose = {id: "instance_one#0", x: 3, y: 2, z: 0, turn: 30, scale: 2};
  edits.addModel(model, [pose]);
  expect(edits.state().models).toEqual([model]);
  expect(edits.state().placed).toEqual([pose]);
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
  edits.addModel({...model, asset: "second"});
  expect(edits.state().models).toHaveLength(1);
  expect(edits.state().placed).toEqual([pose]);
  expect(isCurrent(edits.state())).toBe(false);
  edits.undo();
  expect(edits.state().models).toEqual([model]);
  edits.undo();
  expect(edits.state().models).toEqual([]);
  expect(edits.state().placed).toEqual([]);
  edits.redo();
  expect(edits.state().models).toEqual([model]);
});

test("older saved ground materials remain saveable until their native format is upgraded", async () => {
  const saved = {at: 1, deleted: [], sorts: [], object_sorts: [], paints: ["paint"], needs_save: true};
  const edits = new TrackEdits("upgrade", async () => json({base: "b", revision: 0, deleted: [], paints: ["paint"], saved}));
  edits.bind("b");
  await edits.start();
  expect(isCurrent(edits.state())).toBe(false);
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
});

/** Edits started on a fresh server, with one change saved at once. */
async function started(deleted: Removed[] = []) {
  const s = server(deleted), edits = new TrackEdits("t", s.send);
  edits.bind("b");
  await edits.start();
  return {s, edits};
}

test("mixed selected objects and whole sorts delete as one undo step", async () => {
  const {edits} = await started();
  edits.removeSelected([tree(1)], [{tree: true, sort: "olive"}, {tree: false, sort: "bench"}]);
  expect(edits.state().removed).toEqual([tree(1)]);
  expect(edits.state().sorts).toEqual(["olive"]);
  expect(edits.state().objectSorts).toEqual(["bench"]);
  edits.undo();
  expect(edits.state().removed).toEqual([]);
  expect(edits.state().sorts).toEqual([]);
  expect(edits.state().objectSorts).toEqual([]);
  expect(edits.state().canUndo).toBe(false);
});

test("material changes keep order, undo and discard and saved status", async () => {
  const {edits} = await started();
  edits.addPaint("first");
  edits.addPaint("second");
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
  edits.addPaint("first");
  expect(edits.state().paints).toEqual(["second", "first"]);
  expect(isCurrent(edits.state())).toBe(false);
  edits.undo();
  expect(edits.state().paints).toEqual(["first", "second"]);
  expect(isCurrent(edits.state())).toBe(true);
  edits.discard();
  expect(edits.state().paints).toEqual([]);
  expect(edits.changed()).toBe(false);
  edits.undo();
  expect(edits.state().paints).toEqual(["first", "second"]);
});

test("adjusting one smoothing operation replaces it, including zero, as one undo step", async () => {
  const {edits} = await started();
  const height = (id: string) => ({id, x: 0, z: 0, nx: 2, nz: 2, mm: [0, 10, 10, 0]});
  edits.replaceHeight(null, height("first"), false);
  edits.replaceHeight("first", height("second"), true);
  expect(edits.state().heights.map(h => h.id)).toEqual(["second"]);
  edits.replaceHeight("second", null, true);
  expect(edits.state().heights).toEqual([]);
  edits.replaceHeight(null, height("third"), false);
  edits.undo();
  expect(edits.state().heights).toEqual([]);
  expect(edits.state().canUndo).toBe(false);
  edits.redo();
  expect(edits.state().heights.map(h => h.id)).toEqual(["third"]);
  expect(edits.replaceHeight("missing", height("wrong"), true)).toBe(false);
  expect(edits.state().heights.map(h => h.id)).toEqual(["third"]);
});

test("a whole sort is one step, once, saved as a rule beside the single ones", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.removeSort("olive");
  edits.removeSort("olive");
  expect(edits.state().sorts).toEqual(["olive"]);
  edits.saveNow();
  await settle();
  const body = s.asked[0].body as unknown as {sorts: string[]; deleted: Removed[]};
  expect(body.sorts).toEqual(["olive"]);
  expect(body.deleted).toHaveLength(1);
  edits.undo();
  expect(edits.state().sorts).toEqual([]);
  expect(edits.state().removed).toHaveLength(1);
  edits.redo();
  expect(edits.state().sorts).toEqual(["olive"]);
  edits.discard();
  expect(edits.state().sorts).toEqual([]);
  expect(edits.state().removed).toEqual([]);
});

test("a whole sort of listed objects is one step too, saved as a rule of its own", async () => {
  const {s, edits} = await started();
  edits.removeObjectSort("car");
  edits.removeObjectSort("car");
  edits.removeSort("olive");
  expect(edits.state().objectSorts).toEqual(["car"]);
  edits.saveNow();
  await settle();
  const body = s.asked[0].body as unknown as {sorts: string[]; object_sorts: string[]};
  expect([body.sorts, body.object_sorts]).toEqual([["olive"], ["car"]]);
  edits.undo();
  edits.undo();
  expect(edits.state().objectSorts).toEqual([]);
  edits.redo();
  edits.discard();
  expect([edits.state().objectSorts, edits.state().canUndo]).toEqual([[], true]);
});

test("saved: current while the edits are the recipe's, as sets; a change makes it not, undo makes it again", async () => {
  const {edits} = await started();
  expect(isCurrent(edits.state())).toBe(false);         // (never saved)
  edits.remove([tree(1), tree(2)]);
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
  edits.removeSort("olive");
  expect(isCurrent(edits.state())).toBe(false);
  edits.undo();
  expect(isCurrent(edits.state())).toBe(true);
});

test("saved as a copy: the copy's edits take over undo and redo when their list is the same", async () => {
  const s = server([tree(1)]), first = new TrackEdits("t", s.send);
  first.bind("b");
  await first.start();
  first.remove([tree(2)]);
  first.undo();
  first.redo();                         // (one step back to undo, none to redo)
  const copy = server([tree(1), tree(2)]);
  first.handOver("t_2");
  const second = new TrackEdits("t_2", copy.send);
  second.bind("b");
  await second.start();
  expect([second.state().canUndo, second.state().canRedo]).toEqual([true, false]);
  second.undo();
  expect(second.state().removed).toEqual([tree(1)]);
  const other = new TrackEdits("t_3", server([tree(5)]).send);
  first.handOver("t_3");                // (another list: nothing taken over)
  other.bind("b");
  await other.start();
  expect(other.state().canUndo).toBe(false);
});

test("undo and redo walk the list, a new change ends redo", async () => {
  const {edits} = await started();
  edits.remove([tree(1)]);
  edits.remove([tree(2)]);
  edits.undo();
  expect(edits.state().removed.map(r => r.id)).toEqual([tree(1).id]);
  expect(edits.state().canRedo).toBe(true);
  edits.redo();
  expect(edits.state().removed).toHaveLength(2);
  edits.undo();
  edits.remove([tree(3)]);
  expect(edits.state().canRedo).toBe(false);
});

test("held while the track is written: nothing changes, and undo and redo keep their steps", async () => {
  const {edits} = await started();
  edits.remove([tree(1)]);
  edits.remove([tree(2)]);
  edits.undo();
  edits.hold(true);
  expect(edits.canEdit()).toBe(false);
  edits.remove([tree(3)]);
  edits.removeSort("oak");
  edits.discard();
  edits.undo();
  edits.redo();
  expect(edits.state().removed.map(r => r.id)).toEqual([tree(1).id]);
  edits.hold(false);
  edits.redo();
  expect(edits.state().removed).toHaveLength(2);
  edits.undo();
  edits.undo();
  expect(edits.state().removed).toHaveLength(0);
});

test("the same object twice counts once", async () => {
  const {edits} = await started();
  edits.remove([tree(1)]);
  edits.remove([tree(1), tree(2)]);
  expect(edits.state().removed.map(r => r.id)).toEqual([tree(1).id, tree(2).id]);
});

test("discarding is one step that can be undone", async () => {
  const {edits} = await started([tree(1), tree(2)]);
  edits.discard();
  expect(edits.state().removed).toEqual([]);
  edits.undo();
  expect(edits.state().removed).toHaveLength(2);
});

test("a late answer never brings an older list back: the newer one follows with the new revision", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  expect(s.asked).toHaveLength(1);
  edits.remove([tree(2)]);
  edits.saveNow();                      // (one at a time: it waits for the answer)
  await settle();
  expect(s.asked).toHaveLength(1);
  s.asked[0].answer(json({revision: 4}));
  await settle();
  await settle();
  expect(s.asked).toHaveLength(2);
  expect(s.asked[1].body.revision).toBe(4);
  expect(s.asked[1].body.deleted).toHaveLength(2);
  s.asked[1].answer(json({revision: 5}));
  await settle();
  await settle();
  expect(edits.state().save).toBe("saved");
});

test("a conflict stops the saving and the changes until read again", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "changed"}, 409));
  await settle();
  await settle();
  expect(edits.state().save).toBe("stuck");
  expect(edits.canEdit()).toBe(false);
  edits.remove([tree(2)]);
  expect(edits.state().removed).toHaveLength(1);
  await edits.start();
  expect(edits.state().removed).toEqual([]);
  expect(edits.canEdit()).toBe(true);
});

test("a failed save stays to be saved", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "no disk"}, 500));
  await settle();
  await settle();
  expect(edits.state().save).toBe("failed");
  expect(edits.state().error).toBe("no disk");
  edits.saveNow();
  await settle();
  expect(s.asked).toHaveLength(2);
});

test("stopping saves what is left, and asks the browser to finish it", async () => {
  const seen: RequestInit[] = [];
  const edits = new TrackEdits("t", (_url, options) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 0, deleted: [], outdated: 0}));
    seen.push(options);
    return Promise.resolve(json({revision: 1}));
  });
  edits.bind("b");
  await edits.start();
  edits.remove([tree(1)]);
  edits.stop();
  await settle();
  expect(seen).toHaveLength(1);
  expect(seen[0].keepalive).toBe(true);
});

test("changes from an older build block editing until given up", async () => {
  const seen: RequestInit[] = [];
  const edits = new TrackEdits("t", (_url, options) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 2, deleted: [], outdated: 5}));
    seen.push(options);
    return Promise.resolve(json({revision: 3}));
  });
  edits.bind("b");
  await edits.start();
  expect(edits.state().outdated).toBe(5);
  edits.remove([tree(1)]);
  expect(edits.state().removed).toEqual([]);
  edits.discardOutdated();
  await settle();
  expect(JSON.parse(String(seen[0].body)).deleted).toEqual([]);
  expect(edits.canEdit()).toBe(true);
});

test("a list of another build than the view shows changes nothing, whichever came first", async () => {
  const late = server(), first = new TrackEdits("t", late.send);
  await first.start();                  // (the list is there, the view not yet)
  expect(first.canEdit()).toBe(false);
  first.remove([tree(1)]);
  expect(first.state().removed).toEqual([]);
  first.bind("older");
  expect(first.viewBehind()).toBe(true);
  expect(first.state().save).toBe("stuck");
  first.bind("b");                      // (the view loaded the track again)
  expect(first.state().save).toBe("saved");
  expect(first.state().error).toBeNull();
  first.remove([tree(1)]);
  expect(first.state().removed).toHaveLength(1);
});

test("a save sends the state of the file the view shows", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  expect((s.asked[0].body as unknown as {base: string}).base).toBe("b");
});

test("a page closing with a save under way doesn't wait: its save goes at once, naming the other", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  edits.remove([tree(2)]);
  edits.saveNow(true);
  await settle();
  expect(s.asked).toHaveLength(2);
  const [one, two] = s.asked.map(a => a.body as unknown as {id: string; unanswered: string[]; deleted: Removed[]});
  expect(two.unanswered).toEqual([one.id]);
  expect(two.deleted).toHaveLength(2);
});

test("an answer lost on the way: the next save names it, and goes through", async () => {
  const send = (_url: string, options?: RequestInit) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 3, deleted: [], outdated: 0}));
    bodies.push(JSON.parse(String(options.body)));
    return bodies.length === 1 ? Promise.reject(new Error("connection lost")) : Promise.resolve(json({revision: 5}));
  };
  const bodies: {id: string; unanswered: string[]; revision: number}[] = [];
  const edits = new TrackEdits("t", send);
  edits.bind("b");
  await edits.start();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  expect(edits.state().save).toBe("failed");
  edits.saveNow();
  await settle();
  await settle();
  expect(bodies[1].unanswered).toEqual([bodies[0].id]);
  expect(edits.state().save).toBe("saved");
});

test("what can't ever go through stops instead of trying for ever", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "no object to delete"}, 400));
  await settle();
  await settle();
  expect(edits.state().save).toBe("stuck");
  expect(edits.state().error).toBe("no object to delete");
});

test("the revision of what is saved, none while it can't get there", async () => {
  const {s, edits} = await started();
  expect(await edits.saved()).toBe(3);
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "no disk"}, 500));
  await settle();
  await settle();
  expect(await edits.saved()).toBeNull();
});

test("a change undone before it went out is saved: nothing to send", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.undo();
  expect(edits.state().save).toBe("waiting");
  edits.saveNow();
  await settle();
  expect(s.asked).toHaveLength(0);
  expect(edits.state().save).toBe("saved");
});
