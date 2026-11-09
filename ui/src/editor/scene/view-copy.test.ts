import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

test("the Copy preview takes every member once, excludes a pole's wires, and uses only visible triangles", () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 1, 0, 1, 1, 0, 0, 2, 0, 0, 3, 0, 1, 3, 0, 0, 4, 0, 0, -10, 0, 1, -10, 0, 0, -9, 0], 3));
  geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.userData.indices = Uint16Array.from(geometry.getIndex()!.array);
  const scene = new THREE.Scene();
  const view = Object.create(TrackView.prototype) as TrackView;
  Object.assign(view, {
    scene, byNumber: new Map([[0, mesh]]), copyFoot: new THREE.Vector3(), copyPose: {turn: 0, y: 0, scale: 1}, placed: new Map(), pendingPivots: new Map(),
    mouse: null, belonging: new Map([["t_0_0#0", ["t_0_0#1", "t_0_0#2"]]]),
    data: {objects: {t_0_0: {kinds: ["house", "door", "power line"], parents: [-1, 0, 0], at: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      faces: [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]]}}},
  });
  view.setCopy("t_0_0#0", () => {});
  const group = scene.children[0] as THREE.Group;
  expect(group.children).toHaveLength(2);
  expect(new THREE.Box3().setFromObject(group).min.y).toBe(1);
  // A deleted child's triangles are collapsed in the displayed index; the preview must not resurrect its saved index.
  geometry.getIndex()!.array.set([3, 3, 3], 3);
  view.setCopy("t_0_0#0", () => {});
  const ghost = scene.children[0] as THREE.Group;
  expect(ghost.children).toHaveLength(1);
  Object.assign(view, {shown: true, camera: new THREE.PerspectiveCamera(), mouse: new THREE.Vector2(), groundVersion: 0, copyAt: () => [0, 20, 0]});
  // The server's anchor can include lower invisible collision that was never loaded into the view.
  view.setCopy("t_0_0#0", () => {}, [0, -4, 0]);
  view.setCopyPose({turn: 90, y: 2, scale: 2});
  expect(new THREE.Box3().setFromObject(scene.children[0]).min.y).toBe(32);
  view.setCopy(null, null);
  geometry.dispose(); mesh.material.dispose();
});

test("an idle Copy preview does no more ray queries or redraws until its inputs change", () => {
  const view = Object.create(TrackView.prototype) as {followCopy: () => void; dirty: boolean; mouse: THREE.Vector2; camera: THREE.PerspectiveCamera};
  let rays = 0;
  Object.assign(view, {copyGhost: new THREE.Group(), copyFoot: new THREE.Vector3(), copyPose: {turn: 0, y: 0, scale: 1}, copyStamp: [],
    camera: new THREE.PerspectiveCamera(), mouse: new THREE.Vector2(), shown: true, groundVersion: 0, held: false,
    copyAt: () => { rays++; return [1, 2, 3]; }});
  view.followCopy();
  view.dirty = false;
  for (let n = 0; n < 30; n++) view.followCopy();
  expect(rays).toBe(1);
  expect(view.dirty).toBe(false);
  view.mouse.x = 0.2; view.followCopy();
  expect(rays).toBe(2);
  view.camera.position.x = 1; view.followCopy();
  expect(rays).toBe(3);
});
