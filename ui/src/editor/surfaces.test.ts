import {expect, test} from "bun:test";
import * as THREE from "three";
import {SurfaceOverlay} from "./surfaces";

const mesh = (name: string) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
  m.name = name;
  return m;
};
const selection = {material: "gc_meadow", truncated: false, tiles: [{tile: [0, 0] as [number, number],
  mask: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII="}]};

test("surface highlighting follows all physics meshes of its tile, shares geometry, and leaves picking and geometry intact", async () => {
  const scene = new THREE.Scene(), a = mesh("1ROAD_ground_0_0"), b = mesh("1GRASS_ground_0_0_1"), tree = mesh("nocol_trees_0_0");
  let bytes = 0, decoded = 0, disposed = 0;
  const texture = new THREE.Texture();
  texture.addEventListener("dispose", () => disposed++);
  const overlay = new SurfaceOverlay(scene, () => {}, n => { bytes += n; return true; }, n => { bytes -= n; }, async () => { decoded++; return texture; });
  await overlay.set(selection, [a, b, tree]);
  expect(decoded).toBe(1);
  expect(scene.children).toHaveLength(2);
  expect((scene.children[0] as THREE.Mesh).geometry).toBe(a.geometry);
  expect((scene.children[1] as THREE.Mesh).geometry).toBe(b.geometry);
  a.visible = false;
  overlay.follow();
  expect(scene.children[0].visible).toBe(false);
  const c = mesh("1GRAVEL_ground_0_0");
  await overlay.add(c);
  expect(scene.children).toHaveLength(3);
  overlay.clear();
  expect(scene.children).toHaveLength(0);
  expect(disposed).toBe(1);
  expect(bytes).toBe(0);
  expect(a.geometry.getAttribute("position").count).toBe(4);
  for (const m of [a, b, c, tree]) { m.geometry.dispose(); m.material.dispose(); }
});

test("an old asynchronous mask cannot reappear after Escape or a new selection", async () => {
  const scene = new THREE.Scene(), a = mesh("1ROAD_ground_0_0");
  let release!: (t: THREE.Texture) => void, disposed = 0, bytes = 0;
  const texture = new THREE.Texture();
  texture.addEventListener("dispose", () => disposed++);
  const overlay = new SurfaceOverlay(scene, () => {}, n => { bytes += n; return true; }, n => { bytes -= n; }, () => new Promise(r => { release = r; }));
  const pending = overlay.set(selection, [a]);
  overlay.clear();
  expect(bytes).toBe(0);
  release(texture);
  await pending;
  expect(scene.children).toHaveLength(0);
  expect(disposed).toBe(1);
  expect(bytes).toBe(0);
  a.geometry.dispose(); a.material.dispose();
});

test("a prepared mesh-material region highlights only its faces and follows live vertices without disposing the source", async () => {
  const scene = new THREE.Scene(), source = mesh("nocol_road_edge_dirt_0_0");
  source.userData.info = {i: 0, vertices: 4};
  let bytes = 0;
  const overlay = new SurfaceOverlay(scene, () => {}, n => { bytes += n; return true; }, n => { bytes -= n; });
  await overlay.set({material: "edge_dirt", truncated: false, tiles: [], meshes: [{mesh: 0, faces: [0]}]}, [source]);
  expect(scene.children).toHaveLength(1);
  const highlighted = scene.children[0] as THREE.Mesh;
  expect(highlighted.geometry.getIndex()!.count).toBe(3);
  const position = source.geometry.getAttribute("position");
  position.setY(0, 10); position.needsUpdate = true;
  overlay.follow();
  expect(highlighted.geometry.getAttribute("position").getY(0)).toBe(10);
  overlay.clear();
  expect(source.geometry.getIndex()!.count).toBe(6);
  expect(bytes).toBe(0);
  source.geometry.dispose(); source.material.dispose();
});
