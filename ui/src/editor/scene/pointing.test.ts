import {expect, test} from "bun:test";
import * as THREE from "three";
import {Pointing, sourceRoadId, type PointingHost} from "./pointing";
import type {TrackIndex} from "../types";

test("a road triangle resolves its mapped ID from compact build runs", () => {
  const runs: [string | null, number][] = [[null, 3], ["road-a", 2], ["road-b", 4]];
  expect(sourceRoadId(runs, 2)).toBeNull();
  expect(sourceRoadId(runs, 3)).toBe("road-a");
  expect(sourceRoadId(runs, 5)).toBe("road-b");
  expect(sourceRoadId(runs, 9)).toBeNull();
});

test("a native library tree can be hovered without an invented KN5 mesh or material slot", () => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial());
  mesh.userData.modelInstance = "instance_a";
  const data = {meshes: [], materials: [], textures: [], route: [], anchor: null,
    models: [{id: "instance_a", asset: "a"}], model_assets: {a: {url: "tree", name: "Spruce", native_tree: {file: "native/model.bin"}}},
    objects: {instance_a: {kinds: ["tree"], sorts: ["Spruce"], parents: [-1], at: [[0, 0, 0]], faces: [[]]}}} as unknown as TrackIndex;
  let nativeId: string | null = null;
  const pointing = new Pointing({data: () => data, trees: () => ({idOf: () => nativeId})} as unknown as PointingHost);
  const hovered = pointing.describe({object: mesh, point: new THREE.Vector3(2, 3, 4), distance: 5, faceIndex: 0});
  expect(hovered.id).toBe("instance_a#0");
  expect(hovered.sort).toBe("Spruce");
  expect(hovered.shader).toBe("CSP TreeFX");
  expect(hovered.triangles).toBe(12);
  expect(hovered.at).toEqual([2, 3, 4]);
  nativeId = "instance_a#0";
  expect(pointing.describe({object: mesh, point: new THREE.Vector3(2, 3, 4), distance: 5, faceIndex: 0}).id).toBe(nativeId);
  mesh.geometry.dispose(); mesh.material.dispose();
});
