import {expect, test} from "bun:test";
import {isCurrent, TrackEdits, type Removed} from "./edits";
import {tree, json, server, settle, started} from "./edits.fixture";
import type {SurfaceCut} from "../scene/surfaceCuts";
import {isChanged} from "./useSave";

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
