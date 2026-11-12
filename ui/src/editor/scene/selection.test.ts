import {expect, test} from "bun:test";
import * as THREE from "three";
import type {Hovered, Picked} from "../types";
import {Selection} from "./selection";
import {objectsOf} from "./view.fixture";
import type {TrackObjects} from "./trackObjects";

/** A Selection over objects in a scene of its own, the track's index data. */
function selectionOf(objects: TrackObjects, data: unknown) {
  return new Selection({scene: new THREE.Scene(), objects, data: () => data as never, moveTool: () => false,
    materialArea: () => false, changed: () => {}});
}

/** Picks already made, each with a frame, inside selection. */
function picked(selection: Selection, picks: Partial<Picked>[]) {
  const inside = selection as unknown as {picks: Map<string, {box: THREE.Box3Helper; picked: Partial<Picked>}>};
  for (const p of picks) inside.picks.set(p.id!, {box: new THREE.Box3Helper(new THREE.Box3()), picked: p});
}

test("right-clicking another tree of a marked sort keeps the entire existing selection for its menu", () => {
  const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 8, 1));
  const mesh = new THREE.Mesh(); mesh.userData.info = {i: 0};
  const source = {id: "trees#0", kind: "Tree", sort: "broadleaf", position: [0, 0, 0] as [number, number, number]};
  const data = {revision: "source", textures: [], objects: {}};
  const selection = selectionOf(Object.assign(objectsOf({data}), {boundsOf: () => bounds}), data);
  selection.setAdding(true);
  selection.setSelectMode(true, true);
  selection.setMarked([{sort: "broadleaf"}]);
  picked(selection, [source]);
  const hovered = {...source, id: "trees#1", at: [1, 0, 0], object: "extension/trees/broadleaf.bin"} as unknown as Hovered;
  const pick = selection.pick({button: 2, clientX: 10, clientY: 10} as PointerEvent, {object: mesh} as unknown as THREE.Intersection, hovered)!;
  expect(pick.keeping).toBe(true);
  expect(pick.all.map(p => p.id)).toEqual(["trees#0", "trees#1"]);
  expect(selection.has("trees#0")).toBe(true);
});

test("replacement targets include every highlighted tree once and refuse a mixed object selection", () => {
  const selected = {id: "trees#0", kind: "Tree"};
  const objects = Object.assign(objectsOf({data: {objects: {}}}), {treesOfModel: (model: string) => model === "broadleaf" ? ["trees#0", "trees#1"] : [],
    shownObjectBounds: () => new THREE.Box3()});
  const selection = selectionOf(objects, {objects: {}});
  picked(selection, [selected]);
  expect(selection.replacementTargets([{sort: "broadleaf"}])).toEqual(["trees#0", "trees#1"]);
  selected.kind = "Car";
  expect(selection.replacementTargets([{sort: "broadleaf"}])).toBeNull();
});

test("whole-sort deletion omits redundant explicit members while keeping other picked objects", () => {
  const selection = selectionOf(objectsOf({}), null);
  picked(selection, [
    {id: "trees#0", sort: "broadleaf", position: [0, 0, 0]},
    {id: "tile#0", sort: "car", position: [1, 0, 0]},
    {id: "tile#1", sort: "bench", position: [2, 0, 0]},
  ]);
  expect(selection.selectedOutside([{sort: "broadleaf"}, {sort: "bench"}])).toEqual([
    {id: "tile#0", position: [1, 0, 0]},
  ]);
});
