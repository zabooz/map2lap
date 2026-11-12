import {expect, test} from "bun:test";
import {brushOf, objectsOf} from "./view.fixture";

test("pointer cancellation also releases the tool's local stroke preview", () => {
  let cancelled = 0, takenBack = 0;
  const brush = brushOf({objects: objectsOf({})}, {takeBackPreview: () => { takenBack++; }});
  Object.assign(brush, {stroke: {timer: setInterval(() => {}, 1000)}});
  brush.setStroke(() => {}, async () => null, () => {}, () => cancelled++);
  expect(brush.cancelStroke()).toBe(true); expect(cancelled).toBe(1); expect(takenBack).toBe(1);
  expect(brush.cancelStroke()).toBe(false); expect(cancelled).toBe(1);
});

test("Delete's brush takes the TreeFX trees whose foot its stroke passes, not those the draft leaves out already, alone or by model, but those its own stroke took", () => {
  const view = {data: {objects: {}}, pivotOf: () => [0, 0, 0]};
  const objects = objectsOf(view);
  const feet = [{id: "trees#1", model: "spruce", at: [2, 0, 0] as [number, number, number]},
                {id: "trees#2", model: "spruce", at: [3, 0, 1] as [number, number, number]},
                {id: "trees#4", model: "birch", at: [1, 0, 1] as [number, number, number]},
                {id: "trees#3", model: "spruce", at: [40, 0, 0] as [number, number, number]}];
  const brush = brushOf({...view, objects}, {trees: () => ({feet: (x0: number, z0: number, x1: number, z1: number) =>
    feet.filter(f => f.at[0] >= x0 && f.at[0] <= x1 && f.at[2] >= z0 && f.at[2] <= z1)})});
  objects.setRemoved(["trees#2"], [], ["birch"]);
  expect(brush.objectsAlong([[0, 0, 0]], 5).map(o => o.id)).toEqual(["trees#1"]);
  brush.showGone(["trees#1"]);                                    // (taken by the stroke under way: still taken when it ends)
  expect(brush.objectsAlong([[0, 0, 0]], 5).map(o => o.id)).toEqual(["trees#1"]);
});
