import {expect, test} from "bun:test";
import * as THREE from "three";
import {Pointing, type PointingHost} from "./pointing";
import type {TrackIndex} from "../types";

test("a native library tree can be hovered without an invented KN5 mesh or material slot", () => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshLambertMaterial());
  mesh.userData.modelInstance = "instance_a";
  const data = {meshes: [], materials: [], textures: [], route: [], anchor: null,
    models: [{id: "instance_a", asset: "a"}], model_assets: {a: {url: "tree", name: "Spruce", native_tree: {file: "native/model.bin"}}},
    objects: {instance_a: {kinds: ["tree"], sorts: ["Spruce"], parents: [-1], at: [[0, 0, 0]], faces: [[]]}}} as unknown as TrackIndex;
  const pointing = new Pointing({data: () => data} as PointingHost);
  const hovered = pointing.describe({object: mesh, point: new THREE.Vector3(2, 3, 4), distance: 5, faceIndex: 0});
  expect(hovered.id).toBe("instance_a#0");
  expect(hovered.sort).toBe("Spruce");
  expect(hovered.shader).toBe("CSP TreeFX");
  expect(hovered.triangles).toBe(12);
  expect(hovered.at).toEqual([2, 3, 4]);
  mesh.geometry.dispose(); mesh.material.dispose();
});
