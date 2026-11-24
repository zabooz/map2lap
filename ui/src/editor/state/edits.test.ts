import {expect, test} from "bun:test";
import {isCurrent, TrackEdits, type KerbEdit, type Removed, type StitchEdit} from "./edits";
import {tree, json, server, settle, started} from "./edits.fixture";
import type {SurfaceCut} from "../scene/surfaceCuts";
import {isChanged} from "./useSave";

test("car density alone enables Save on an otherwise unchanged track", async () => {
  const {edits} = await started();
  edits.setCarDensity({percent: 0, targets: null, hidden: ["t_0_0#0"]});
  expect(isChanged(edits.state())).toBe(true);
  edits.undo(); expect(isChanged(edits.state())).toBe(false);
  edits.stop();
});

test("car density is a separate undoable saved layer and reopens as current", async () => {
  const {edits, s} = await started();
  edits.remove([tree(0)]);
  const density = {percent: 50, targets: null, hidden: ["t_0_0#1"]};
  edits.setCarDensity(density);
  edits.undo(); expect(edits.state().carDensity).toBeNull();
  edits.redo(); expect(edits.state().carDensity).toEqual(density);
  expect(edits.state().removed).toEqual([tree(0)]);
  edits.saveNow(); await settle();
  expect((s.asked[0].body as unknown as {car_density: unknown}).car_density).toEqual(density);
  s.asked[0].answer(json({revision: 4, meshes: []})); await settle();
  edits.markSaved(); expect(isCurrent(edits.state())).toBe(true);
  const reopened = new TrackEdits("t", async () => json({base: "b", revision: 0, deleted: [tree(0)], car_density: density,
    saved: {at: 1, deleted: [tree(0).id], object_sorts: [], car_density: density}}));
  reopened.bind("b"); await reopened.start();
  expect(reopened.state().carDensity).toEqual(density);
  expect(isCurrent(reopened.state())).toBe(true);
  reopened.setCarDensity({percent: 100, targets: null, hidden: []});
  expect(isCurrent(reopened.state())).toBe(false);
  reopened.stop(); edits.stop();
});

test("tree spacing is independent of manual deletion, persistent and undoable", async () => {
  const {edits, s} = await started();
  edits.remove([tree(0)]);
  const spacing = {distance: 4, targets: null, hidden: ["trees#2"]};
  edits.setTreeSpacing(spacing);
  expect(edits.state().removed).toEqual([tree(0)]);
  edits.undo(); expect(edits.state().treeSpacing).toBeNull();
  edits.redo(); expect(edits.state().treeSpacing).toEqual(spacing);
  edits.saveNow(); await settle();
  expect((s.asked[0].body as unknown as {tree_spacing: unknown}).tree_spacing).toEqual(spacing);
  s.asked[0].answer(json({revision: 4, meshes: []})); await settle();
  edits.markSaved(); expect(isCurrent(edits.state())).toBe(true);
  const reopened = new TrackEdits("t", async () => json({base: "b", revision: 0, deleted: [tree(0)], tree_spacing: spacing,
    saved: {at: 1, deleted: [tree(0).id], object_sorts: [], tree_spacing: spacing}}));
  reopened.bind("b"); await reopened.start();
  expect(isCurrent(reopened.state())).toBe(true);
  reopened.setTreeSpacing({...spacing, distance: 0, hidden: []});
  expect(reopened.state().removed).toEqual([tree(0)]);
  expect(isCurrent(reopened.state())).toBe(false);
  reopened.undo(); expect(reopened.state().treeSpacing).toEqual(spacing);
  reopened.stop(); edits.stop();
});

test("wall height and texture change together in one Undo step and travel in the saved draft", async () => {
  const {edits, s} = await started();
  const walls = [{id: "t_0_0#4", rise: 1.2, material: "a".repeat(64)}];
  edits.setWalls(walls);
  expect(edits.state().walls).toEqual(walls);
  expect(isChanged(edits.state())).toBe(true);
  edits.undo(); expect(edits.state().walls).toEqual([]);
  edits.redo(); expect(edits.state().walls).toEqual(walls);
  edits.saveNow(); await settle();
  expect((s.asked[0].body as unknown as {walls: unknown}).walls).toEqual(walls);
  s.asked[0].answer(json({revision: 4, meshes: [-1]})); await settle();
  expect(edits.changed()).toBe(true);
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
});

test("a growing free kerb keeps its id and each new point is undoable", async () => {
  const {edits} = await started();
  const first: KerbEdit = {id: "free-one", line: [[0, 2, 0, 2], [2, 2, 0, 2]], road_ids: [], side: "left",
    centred: true, profile: "rounded", width: 0.4, height: 0.06};
  edits.addKerb(first);
  edits.replaceKerb(first.id, {...first, line: [...first.line, [4, 2, 1, 2]]});
  expect(edits.state().kerbs).toHaveLength(1);
  expect(edits.state().kerbs[0].id).toBe(first.id);
  edits.undo(); expect(edits.state().kerbs).toEqual([first]);
  edits.redo(); expect(edits.state().kerbs[0].line).toHaveLength(3);
  edits.stop();
});

test("a stitch growing over an older stitch replaces it in one Undo step and reaches the draft", async () => {
  const {edits, s} = await started();
  const old: StitchEdit = {id: "old", road_ids: ["main"], rows: [[0, 0], [10, 0]], width: [8, 8],
    heights: [[2], [2]], marks: []};
  const grown: StitchEdit = {...old, id: "grown", rows: [[0, 0], [20, 0]]};
  edits.addStitch(old);
  edits.addStitch(grown, [old.id]);
  expect(edits.state().stitches).toEqual([grown]);
  edits.undo(); expect(edits.state().stitches).toEqual([old]);
  edits.redo(); expect(edits.state().stitches).toEqual([grown]);
  edits.saveNow(); await settle();
  expect((s.asked[0].body as unknown as {stitches: StitchEdit[]}).stitches).toEqual([grown]);
  edits.stop();
});

test("changes still on their way are counted until each is done, a failed one too", async () => {
  const {edits} = await started(); let go = () => {};
  const gate = new Promise<void>(resolve => { go = resolve; });
  const first = edits.inTurn(() => gate), second = edits.inTurn(() => { throw new Error("refused"); });
  expect(edits.state().inTurn).toBe(2);
  go(); await first; await second; expect(edits.state().inTurn).toBe(0);
});

test("a refused group is removed from all history in one operation while unrelated edits survive", async () => {
  const {edits} = await started(); edits.remove([tree(0)]);
  const models = [1, 2].map(n => ({id: `instance_${n}`, asset: "tree", at: [n, 0, 0] as [number, number, number], replaces: null, collision: "none" as const}));
  edits.addModels(models, models.map(m => ({id: m.id + "#0", x: 0, y: 0, z: 0, turn: 0, scale: 1})));
  edits.rejectModels(models.map(m => m.id));
  expect(edits.state().models).toEqual([]); expect(edits.state().placed).toEqual([]);
  edits.undo(); expect(edits.state().removed).toEqual([]);
  edits.redo(); expect(edits.state().removed).toEqual([tree(0)]); expect(edits.state().models).toEqual([]);
});

test("a refused background copy is removed from the draft and history without losing unrelated edits", async () => {
  const {edits} = await started();
  edits.remove([tree(0)]);
  edits.addModel({id: "instance_failed", asset: "tree", at: [0, 0, 0], replaces: null, collision: "none"},
    [{id: "instance_failed#0", x: 0, y: 1, z: 0, turn: 20, scale: 1}]);
  edits.rejectCopy("instance_failed");
  expect(edits.state().models).toEqual([]);
  expect(edits.state().placed).toEqual([]);
  expect(edits.state().removed).toEqual([tree(0)]);
  edits.undo();
  expect(edits.state().removed).toEqual([]);
  edits.redo();
  expect(edits.state().removed).toEqual([tree(0)]);
  expect(edits.state().models).toEqual([]);
});

test("replacing multiple trees and their individual fitted poses is a single Undo step", async () => {
  const {edits} = await started();
  const models = [1, 2].map(i => ({id: `instance_${i}`, asset: "tree", at: [i, 0, 0] as [number, number, number],
    replaces: `trees#${i}`, collision: "none" as const, scale: i * 2}));
  const poses = models.map(m => ({id: m.id + "#0", x: 0, y: 2, z: 0, turn: 20, scale: 1}));
  edits.addModels(models, poses);
  expect(edits.state().models).toEqual(models);
  expect(edits.state().placed).toEqual(poses);
  edits.undo();
  expect(edits.state().models).toEqual([]);
  expect(edits.state().placed).toEqual([]);
  edits.redo();
  expect(edits.state().models).toEqual(models);
});

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
test("Revert to saved restores the last Save, keeps saved edits and is one undoable step", async () => {
  const {edits} = await started();
  edits.remove([tree(1)]);
  edits.addPaint("saved-paint");
  const model = {id: "saved-model", asset: "tree", at: [1, 0, 2] as [number, number, number], replaces: null, collision: "none" as const};
  edits.addModel(model);
  edits.markSaved();
  edits.addPaint("unsaved-paint");
  await edits.discard();
  expect(edits.state().removed).toEqual([tree(1)]);
  expect(edits.state().paints).toEqual(["saved-paint"]);
  expect(edits.state().models).toEqual([model]);
  expect(isCurrent(edits.state())).toBe(true);
  edits.undo();
  expect(edits.state().paints).toEqual(["saved-paint", "unsaved-paint"]);
  edits.redo();
  expect(edits.state().paints).toEqual(["saved-paint"]);
});

test("reopened unsaved drafts obtain full saved positions and heights only when discarded", async () => {
  const height = {id: "saved-height", x: 0, z: 0, nx: 1, nz: 1, mm: [100]};
  const requests: string[] = [];
  const edits = new TrackEdits("copy", async url => {
    requests.push(url);
    if (url.endsWith("/edits/saved")) return json({base: "b", deleted: [tree(1)], heights: [height], paints: ["saved-paint"]});
    return json({base: "b", revision: 3, deleted: [], paints: ["unsaved-paint"],
      saved: {at: 1, deleted: [tree(1).id], heights: [height.id], sorts: [], object_sorts: [], placed: [], paints: ["saved-paint"]}});
  });
  edits.bind("b");
  await edits.start();
  expect(requests).toHaveLength(1);
  await edits.discard();
  expect(edits.state().removed).toEqual([tree(1)]);
  expect(edits.state().heights).toEqual([height]);
  expect(edits.state().paints).toEqual(["saved-paint"]);
  expect(isCurrent(edits.state())).toBe(true);
  expect(requests).toHaveLength(2);
});

test("mixed selected objects and whole sorts delete as one undo step", async () => {
  const {edits} = await started();
  edits.removeSelected([tree(1)], [{sort: "olive"}, {sort: "bench"}]);
  expect(edits.state().removed).toEqual([tree(1)]);
  expect(edits.state().objectSorts).toEqual(["olive", "bench"]);
  edits.undo();
  expect(edits.state().removed).toEqual([]);
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
  await edits.discard();
  expect(edits.state().paints).toEqual(["first", "second"]);
  expect(isCurrent(edits.state())).toBe(true);
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

test("two previous crossing corrections can be replaced or removed in one Undo step", async () => {
  const {edits} = await started();
  const height = (id: string) => ({id, x: 0, z: 0, nx: 2, nz: 2, mm: [0, 10, 10, 0]});
  edits.addHeight(height("first"));
  edits.addHeight(height("second"));
  edits.addHeight(height("other"));
  expect(edits.replaceHeight(["first", "second"], height("merged"), false)).toBe(true);
  expect(edits.state().heights.map(h => h.id)).toEqual(["other", "merged"]);
  expect(edits.replaceHeight(["merged"], null, true)).toBe(true);
  expect(edits.state().heights.map(h => h.id)).toEqual(["other"]);
  edits.undo();
  expect(edits.state().heights.map(h => h.id)).toEqual(["first", "second", "other"]);
});

test("a whole sort is one step, once, saved as a rule beside the single ones", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.removeObjectSort("olive");
  edits.removeObjectSort("olive");
  expect(edits.state().objectSorts).toEqual(["olive"]);
  edits.saveNow();
  await settle();
  const body = s.asked[0].body as unknown as {object_sorts: string[]; deleted: Removed[]};
  expect(body.object_sorts).toEqual(["olive"]);
  expect(body.deleted).toHaveLength(1);
  edits.undo();
  expect(edits.state().objectSorts).toEqual([]);
  expect(edits.state().removed).toHaveLength(1);
  edits.redo();
  expect(edits.state().objectSorts).toEqual(["olive"]);
  edits.discard();
  expect(edits.state().objectSorts).toEqual([]);
  expect(edits.state().removed).toEqual([]);
});

test("saved: current while the edits are the recipe's, as sets; a change makes it not, undo makes it again", async () => {
  const {edits} = await started();
  expect(isCurrent(edits.state())).toBe(false);         // (never saved)
  edits.remove([tree(1), tree(2)]);
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
  edits.removeObjectSort("olive");
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
  edits.removeObjectSort("oak");
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

test("a stretch of road verge leaves by its triangles: joined with what went before, saved, one Undo", async () => {
  const {s, edits} = await started();
  const verge = "nocol_road_edge_dirt_0_0";
  edits.removeSurfaces([{mesh: verge, faces: [[4, 2]]}]);
  edits.removeSurfaces([{mesh: verge, faces: [[0, 4], [10, 1]]}, {mesh: "nocol_road_edge_dirt_1_0", faces: [[0, 3]]}]);
  expect(edits.state().surfaces).toEqual([{mesh: verge, faces: [[0, 6], [10, 1]]}, {mesh: "nocol_road_edge_dirt_1_0", faces: [[0, 3]]}]);
  expect(edits.changed()).toBe(true);
  await new Promise(ok => setTimeout(ok, 450));
  expect((s.asked[0].body as {surfaces?: unknown}).surfaces).toEqual(edits.state().surfaces);
  edits.undo();
  expect(edits.state().surfaces).toEqual([{mesh: verge, faces: [[4, 2]]}]);
  edits.markSaved();
  expect(isCurrent(edits.state())).toBe(true);
  edits.undo();
  expect(isCurrent(edits.state())).toBe(false);
});

test("the verge a draft or the last Save left out is read back", async () => {
  const surfaces: SurfaceCut[] = [{mesh: "nocol_road_edge_dirt_0_0", faces: [[0, 2]]}];
  const saved = {at: 1, deleted: [], sorts: [], object_sorts: [], surfaces};
  const edits = new TrackEdits("verge", async () => json({base: "b", revision: 0, deleted: [], surfaces, saved}));
  edits.bind("b");
  await edits.start();
  expect(edits.state().surfaces).toEqual(surfaces);
  expect(isCurrent(edits.state())).toBe(true);
});

test("other texture settings replace one paint in its place as one undo step, the others stay", async () => {
  const {edits} = await started();
  edits.addPaint("meadow");
  edits.addPaint("road");
  edits.addPaint("verge");
  edits.replacePaint("road", "matte road");
  expect(edits.state().paints).toEqual(["meadow", "matte road", "verge"]);
  edits.undo();
  expect(edits.state().paints).toEqual(["meadow", "road", "verge"]);
  edits.redo();
  expect(edits.state().paints).toEqual(["meadow", "matte road", "verge"]);
  const before = edits.state();
  edits.replacePaint("matte road", "matte road");
  expect(edits.state()).toBe(before);
});

test("a TreeFX tree Copy placed is one Undo step, goes to the server at once, and a refused one leaves the draft and history", async () => {
  const {s, edits} = await started();
  const added = {id: "trees#7", model: "spruce", pos: [1, 2, 3], angle: 10, size: 1.2, width: 0.9};
  edits.addTree(added);
  expect(edits.state().trees).toEqual([added]);
  await settle();
  expect((s.asked.at(-1)!.body as unknown as {trees: unknown}).trees).toEqual([added]);
  edits.undo(); expect(edits.state().trees).toEqual([]);
  edits.redo(); expect(edits.state().trees).toEqual([added]);
  edits.rejectCopy("trees#7");
  expect(edits.state().trees).toEqual([]);
  expect(edits.changed()).toBe(false);
});

type Sent = {history: {past: string[]; future: string[]; entries: Record<string, Record<string, unknown>>; items: Record<string, unknown>}};
const historyOf = (s: ReturnType<typeof server>, k: number) => (s.asked[k].body as unknown as Sent).history;

/** A reopened track whose server hands back these steps with the draft. */
async function reopened(deleted: ReturnType<typeof tree>[], history: Sent["history"]) {
  const s = server(deleted);
  const send = (url: string, options?: RequestInit) => options ? s.send(url, options) : Promise.resolve(json({base: "b", revision: 4, deleted, outdated: 0, history: {revision: 4, ...history}}));
  const edits = new TrackEdits("t", send);
  edits.bind("b");
  await edits.start();
  return {s, edits};
}

test("each save carries the steps the server does not hold, and a reload hands Undo and Redo back", async () => {
  const {edits, s} = await started();
  edits.remove([tree(1)]);
  edits.remove([tree(2)]);
  edits.undo();
  edits.saveNow(); await settle();
  const sent = historyOf(s, 0);
  expect([sent.past.length, sent.future.length]).toEqual([1, 1]);
  expect(Object.values(sent.items)).toEqual(expect.arrayContaining([tree(1), tree(2)]));
  s.asked[0].answer(json({revision: 4, meshes: [], history: {past: 1, future: 1, missing: false}})); await settle();
  const again = await reopened([tree(1)], sent);
  expect([again.edits.state().canUndo, again.edits.state().canRedo]).toEqual([true, true]);
  again.edits.redo();
  expect(again.edits.state().removed).toEqual([tree(1), tree(2)]);
  again.edits.undo(); again.edits.undo();
  expect(again.edits.state().removed).toEqual([]);
  again.edits.saveNow(); await settle();
  const after = historyOf(again.s, 0);
  expect(after.items).toEqual({});                              // (all of it the server holds already)
  expect([after.past.length, after.future.length]).toEqual([0, 2]);
  edits.stop(); again.edits.stop();
});

test("after a reload a new step cuts off what Redo had", async () => {
  const {edits, s} = await started();
  edits.remove([tree(1)]);
  edits.undo();
  edits.saveNow(); await settle();
  const again = await reopened([], historyOf(s, 0));
  expect(again.edits.state().canRedo).toBe(true);
  again.edits.remove([tree(3)]);
  again.edits.saveNow(); await settle();
  expect(historyOf(again.s, 0).future).toEqual([]);
  expect(historyOf(again.s, 0).past).toHaveLength(1);
  edits.stop(); again.edits.stop();
});

test("an Undo alone goes to the server: the step to redo, its items once", async () => {
  const {edits, s} = await started();
  edits.remove([tree(1)]);
  edits.saveNow(); await settle();
  s.asked[0].answer(json({revision: 4, meshes: []})); await settle();
  edits.undo();
  edits.saveNow(); await settle();
  const undone = historyOf(s, 1);
  expect([undone.past.length, undone.future.length, Object.values(undone.items)]).toEqual([0, 1, [tree(1)]]);    // (in the draft only till now)
  s.asked[1].answer(json({revision: 5, meshes: []})); await settle();
  edits.redo(); edits.undo();
  edits.saveNow(); await settle();
  expect(historyOf(s, 2).items).toEqual({});
  edits.stop();
});

test("the steps the server drops for room go from Undo too; a server that lost them is sent all again", async () => {
  const {edits, s} = await started();
  edits.remove([tree(1)]);
  edits.remove([tree(2)]);
  edits.saveNow(); await settle();
  s.asked[0].answer(json({revision: 4, meshes: [], history: {past: 1, future: 0, missing: false}})); await settle();
  edits.undo();
  expect(edits.state().canUndo).toBe(false);                    // (the oldest step went)
  edits.saveNow(); await settle();
  s.asked[1].answer(json({revision: 5, meshes: [], history: {past: 0, future: 1, missing: true}})); await settle();
  await settle();
  const resent = historyOf(s, 2);
  expect(Object.keys(resent.entries)).toHaveLength(1);          // (the Redo step again, with its items)
  expect(Object.values(resent.items)).toEqual(expect.arrayContaining([tree(1), tree(2)]));
  edits.stop();
});

test("a hundred steps are kept, as on the server", async () => {
  const {edits} = await started();
  for (let k = 0; k < 105; k++) edits.remove([tree(k)]);
  let undone = 0;
  while (edits.state().canUndo) { edits.undo(); undone++; }
  expect(undone).toBe(100);
  edits.stop();
});

test("saved as a copy: the steps taken over go to the copy's server by themselves", async () => {
  const {edits} = await started();
  edits.remove([tree(1)]);
  edits.handOver("t_2");
  const copy = server([tree(1)]), second = new TrackEdits("t_2", copy.send);
  second.bind("b");
  await second.start();
  await new Promise(ok => setTimeout(ok, 450));                 // (edits.ts SAVE_AFTER_MS)
  expect(copy.asked).toHaveLength(1);
  expect(historyOf(copy, 0).past).toHaveLength(1);
  edits.stop(); second.stop();
});

test("steps handed back for another draft revision than the one read are not taken", async () => {
  const {edits, s} = await started();
  edits.remove([tree(1)]);
  edits.saveNow(); await settle();
  const again = await reopened([tree(1)], {...historyOf(s, 0), revision: 5} as Sent["history"]);     // (reopened reads revision 4)
  expect(again.edits.state().canUndo).toBe(false);
  edits.stop(); again.edits.stop();
});

test("one AI line drag is a single undoable recipe edit", async () => {
  const {edits, s} = await started();
  const move = {id: "a", kind: "move" as const, range: 30, offset: 2, free: false,
    anchor: {metre: 20, level: 1, origin: [0, 0], context: [[15, 0], [20, 0], [25, 0]]}};
  edits.addAiCorrection(move);
  const replacement = {...move, routeOffset:4, range:26};
  edits.addAiCorrection(replacement);
  expect(edits.state().aiCorrections).toEqual([replacement]);
  edits.undo(); expect(edits.state().aiCorrections).toEqual([move]);
  edits.undo(); expect(edits.state().aiCorrections).toEqual([]);
  edits.redo(); expect(edits.state().aiCorrections).toEqual([move]);
  edits.saveNow(); await settle();
  expect(s.asked[0].body).toHaveProperty("aiCorrections", [move]);
  edits.removeAiCorrection("a");
  expect(edits.state().aiCorrections).toEqual([]);
  edits.stop();
});
