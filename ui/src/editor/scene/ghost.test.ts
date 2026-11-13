import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {ghostOf, moverOf, objectsOf} from "./view.fixture";

test("the Copy preview takes every member once, excludes a pole's wires, and uses only visible triangles", () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 1, 0, 1, 1, 0, 0, 2, 0, 0, 3, 0, 1, 3, 0, 0, 4, 0, 0, -10, 0, 1, -10, 0, 0, -9, 0], 3));
  geometry.setIndex([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.userData.indices = Uint16Array.from(geometry.getIndex()!.array);
  const scene = new THREE.Scene();
  const view = Object.create(TrackView.prototype) as TrackView;
  Object.assign(view, {
    scene, byNumber: new Map([[0, mesh]]), mover: moverOf(view),
    mouse: null, objects: objectsOf(view, new Map([["t_0_0#0", ["t_0_0#1", "t_0_0#2"]]])), ghost: ghostOf(view),
    data: {objects: {t_0_0: {kinds: ["house", "door", "power line"], parents: [-1, 0, 0], at: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      faces: [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]]}}},
  });
  view.ghost.setCopy("t_0_0#0", () => {});
  const group = scene.children[0] as THREE.Group;
  expect(group.children).toHaveLength(2);
  expect(new THREE.Box3().setFromObject(group).min.y).toBe(1);
  // A deleted child's triangles are collapsed in the displayed index; the preview must not resurrect its saved index.
  geometry.getIndex()!.array.set([3, 3, 3], 3);
  view.ghost.setCopy("t_0_0#0", () => {});
  const ghost = scene.children[0] as THREE.Group;
  expect(ghost.children).toHaveLength(1);
  Object.assign(view, {shown: true, camera: new THREE.PerspectiveCamera(), mouse: new THREE.Vector2(), groundVersion: 0, copyAt: () => [0, 20, 0]});
  // The server's anchor can include lower invisible collision that was never loaded into the view.
  view.ghost.setCopy("t_0_0#0", () => {}, [0, -4, 0]);
  view.ghost.setPose({turn: 90, y: 2, scale: 2});
  expect(new THREE.Box3().setFromObject(scene.children[0]).min.y).toBe(32);
  const pending = view.ghost.addPending();
  expect(pending).not.toBeNull();
  const solid = scene.children.find(c => c.userData.pendingModel)!;
  expect(new THREE.Box3().setFromObject(solid).min.y).toBe(32);
  expect(((solid.children[0] as THREE.Group).children[0] as THREE.Mesh).material).toMatchObject({opacity: 1});
  const click = view.ghost.addPending([4, 30, 6])!;
  const clicked = scene.children.filter(c => c.userData.pendingModel).at(-1)!;
  expect(new THREE.Box3().setFromObject(clicked).min.y).toBe(42);
  view.ghost.setCopy(null, null);
  expect(new THREE.Box3().setFromObject(solid).min.y).toBe(32);
  view.ghost.dropPending(pending!);
  view.ghost.dropPending(click);
  geometry.dispose(); mesh.material.dispose();
});

test("an idle Copy preview does no more ray queries or redraws until its inputs change", () => {
  const view = {dirty: false, mouse: new THREE.Vector2(), camera: new THREE.PerspectiveCamera(), shown: true, groundVersion: 0, held: 0,
    objects: objectsOf({}), copyAt: () => { rays++; return [1, 2, 3] as [number, number, number]; }};
  let rays = 0;
  const ghost = ghostOf(view);
  Object.assign(ghost, {ghost: new THREE.Group()});
  ghost.follow();
  view.dirty = false;
  for (let n = 0; n < 30; n++) ghost.follow();
  expect(rays).toBe(1);
  expect(view.dirty).toBe(false);
  view.mouse.x = 0.2; ghost.follow();
  expect(rays).toBe(2);
  view.camera.position.x = 1; ghost.follow();
  expect(rays).toBe(3);
});


test("an imported Copy preview and its pending solid share the asset geometry and hold it through Escape", () => {
  const geometry = new THREE.PlaneGeometry(), material = new THREE.MeshBasicMaterial();
  const root = new THREE.Group(); root.add(new THREE.Mesh(geometry, material)); root.matrixAutoUpdate = false;
  root.matrix.makeTranslation(3, 4, 5);
  const scene = new THREE.Scene();
  let held = 0;
  const view = {scene, data: {objects: {}}, objects: objectsOf({}), byNumber: new Map(), pivotOf: () => [3, 4, 5],
    modelDraw: {instance: () => root, hold: () => { held++; return () => { held--; }; }}};
  const ghost = ghostOf(view);
  ghost.setCopy("instance_a#0", () => {});
  const preview = scene.children[0] as THREE.Group;
  let shown!: THREE.Mesh;
  preview.traverse(n => { if (n instanceof THREE.Mesh) shown = n; });
  expect(shown.geometry).toBe(geometry); expect(shown.material).not.toBe(material);
  expect((shown.material as THREE.Material).opacity).toBe(.5);
  expect(material.opacity).toBe(1); expect(held).toBe(1);
  const pending = ghost.addPending()!;
  ghost.setCopy(null, null); expect(held).toBe(1);
  ghost.dropPending(pending); expect(held).toBe(0);
  geometry.dispose(); material.dispose();
});

test("a native library tree's Copy preview and pending placement draw only the TreeFX geometry", () => {
  const geometry = new THREE.BoxGeometry(), material = new THREE.MeshLambertMaterial();
  const root = new THREE.Group(); root.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));
  root.matrixAutoUpdate = false; root.matrix.makeTranslation(10, 1, 5);
  const scene = new THREE.Scene();
  const view = {scene, objects: objectsOf({}), pivotOf: () => [10, 1, 5],
    modelDraw: {instance: () => root, hold: () => () => {}}};
  const ghost = ghostOf(view, {trees: () => ({parts: () => [{geometry, material, matrix: root.matrix}]})});
  ghost.setCopy("instance_a#0", () => {});
  const meshes = (object: THREE.Object3D) => {
    const result: THREE.Mesh[] = []; object.traverse(node => { if (node instanceof THREE.Mesh) result.push(node); }); return result;
  };
  expect(meshes(scene.children[0])).toHaveLength(1);
  const pending = ghost.addPending()!;
  ghost.setCopy(null, null);
  expect(meshes(scene.children[0])).toHaveLength(1);
  expect(meshes(scene.children[0])[0].material).toBe(material);
  ghost.dropPending(pending); expect(scene.children).toHaveLength(0);
});

test("a TreeFX tree's Copy preview shares its model's geometry at its matrix, its material translucent", () => {
  const geometry = new THREE.PlaneGeometry(2, 4).translate(0, 2, 0), material = new THREE.MeshLambertMaterial();
  const scene = new THREE.Scene(), view = Object.create(TrackView.prototype) as TrackView;
  const matrix = new THREE.Matrix4().makeTranslation(10, 1, 5);
  Object.assign(view, {scene, byNumber: new Map(), mouse: null, data: {objects: {}}});
  Object.assign(view, {mover: moverOf(view), objects: objectsOf(view)});
  Object.assign(view, {ghost: ghostOf(view, {trees: () => ({parts: (id: string) => id === "trees#4" ? [{geometry, material, matrix}] : null}),
                                              pivotOf: () => [10, 1, 5]})});
  view.ghost.setCopy("trees#4", () => {}, [10, 1, 5]);
  const group = scene.children[0] as THREE.Group, mesh = group.children[0] as THREE.Mesh;
  expect([group.children.length, mesh.geometry === geometry, (mesh.material as THREE.Material).opacity]).toEqual([1, true, 0.5]);
  expect(new THREE.Box3().setFromObject(group).min.y).toBe(1);
  view.ghost.setCopy(null, null);
  expect(geometry.getAttribute("position").count).toBeGreaterThan(0);     // (the model's own: not let go with the ghost)
});
