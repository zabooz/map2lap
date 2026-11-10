import {expect, test} from "bun:test";
import * as THREE from "three";
import type {Picked} from "../types";
import {TrackView} from "./view";

test("right-clicking another tree of a marked sort keeps the entire existing selection for its menu", () => {
  const view = Object.create(TrackView.prototype) as Pick<TrackView, "setPick"> & {pick: (e: PointerEvent, el: HTMLElement) => Picked};
  const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 8, 1));
  const mesh = new THREE.Mesh(); mesh.userData.info = {i: 0};
  const source = {id: "trees#0", kind: "Tree", sprite: "deciduous", sort: null, position: [0, 0, 0]};
  let resets = 0;
  Object.assign(view, {data: {revision: "source", textures: [], objects: {}}, moveTool: false, adding: true,
    marked: [{tree: true, sort: "deciduous"}], picks: new Map([[source.id, {picked: source}]]),
    selectMode: {enabled: true, whole: true, add: false}, hit: () => ({object: mesh}),
    describe: () => ({...source, id: "trees#1", at: [1, 0, 0], object: "nocol_trees_0_0"}),
    boundsOf: () => bounds, frameOf: () => ({}), forgetPicks: () => { resets++; }});
  view.setPick(() => {});
  const picked = view.pick({button: 2, clientX: 10, clientY: 10} as PointerEvent,
    {getBoundingClientRect: () => ({left: 0, top: 0, width: 100, height: 100})} as HTMLElement);
  expect(picked.keeping).toBe(true);
  expect(picked.all.map(p => p.id)).toEqual(["trees#0", "trees#1"]);
  expect(resets).toBe(0);
});

test("replacement targets include every highlighted tree once and refuse a mixed object selection", () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  const mesh = new THREE.Mesh(); mesh.userData.info = {i: 0, base: "trees"};
  const selected = {id: "trees#0", kind: "Tree"};
  Object.assign(view, {data: {objects: {}}, picks: new Map([[selected.id, {picked: selected}]]),
    billboardMeshes: () => [mesh], billboardsOf: () => [[0, 0, 8], [1, 8, 16], [2, 16, 24]],
    spriteOf: (_mesh: THREE.Mesh, face: number) => face < 16 ? "deciduous" : "pine",
    removed: new Set(), modelDraw: {bounds: () => null}, piecesOf: () => [], shownBounds: () => new THREE.Box3()});
  expect(view.replacementTargets([{tree: true, sort: "deciduous"}])).toEqual(["trees#0", "trees#1"]);
  selected.kind = "Car";
  expect(view.replacementTargets([{tree: true, sort: "deciduous"}])).toBeNull();
  mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose();
});

test("whole-sort deletion omits redundant explicit members while keeping other picked objects", () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  Object.assign(view, {picks: new Map([
    ["trees#0", {picked: {id: "trees#0", sprite: "deciduous", sort: null, position: [0, 0, 0]}}],
    ["tile#0", {picked: {id: "tile#0", sprite: null, sort: "car", position: [1, 0, 0]}}],
    ["tile#1", {picked: {id: "tile#1", sprite: null, sort: "bench", position: [2, 0, 0]}}],
  ])});
  expect(view.selectedOutside([{tree: true, sort: "deciduous"}, {tree: false, sort: "bench"}])).toEqual([
    {id: "tile#0", position: [1, 0, 0]},
  ]);
});
