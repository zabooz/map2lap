import {expect, test} from "bun:test";
import * as THREE from "three";
import {pickedSurfaces, SurfaceOverlay, type SurfacePoint} from "./surfaces";

test("Select all and added ground seeds survive right-click and Edit as the full material target", () => {
  const point: SurfacePoint = {mesh: 0, u: .2, v: .3, revision: "source", whole: true};
  const other: SurfacePoint = {...point, mesh: 1, whole: false};
  const selected = pickedSurfaces([point], {surface: other, adding: true, left: true});
  const underMenu = {...point, u: .4, v: .5, whole: false};
  const rightClicked = pickedSurfaces(selected, {surface: underMenu, left: false});
  expect(rightClicked).toBe(selected);
  expect(pickedSurfaces(rightClicked, {surface: underMenu, left: false})).toBe(selected);
  expect(selected).toEqual([point, other]);
});

test("a context click without a ground selection selects its surface; a left click replaces and Escape clears it", () => {
  const point: SurfacePoint = {mesh: 0, u: .2, v: .3, revision: "source"};
  const selected = pickedSurfaces([], {surface: point, left: false});
  expect(selected).toEqual([point]);
  const next = {...point, mesh: 2};
  expect(pickedSurfaces(selected, {surface: next, left: true})).toEqual([next]);
  expect(pickedSurfaces(selected, null)).toEqual([]);
  expect(pickedSurfaces(selected, {left: true})).toEqual([]);
});

const mesh = (name: string) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
  m.name = name;
  return m;
};
const selection = {material: "gc_meadow", truncated: false, tiles: [{tile: [0, 0] as [number, number],
  mask: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII="}]};

test("selection masks clamp in tile-local world coordinates instead of wrapping the opposite edge", async () => {
  const scene = new THREE.Scene(), source = mesh("1GRASS_ground_16_-9"), texture = new THREE.Texture();
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const overlay = new SurfaceOverlay(scene, () => {}, () => true, () => {}, async () => texture);
  await overlay.set({...selection, tiles: [{...selection.tiles[0], tile: [16, -9]}]}, [source]);
  try {
    expect(Number(texture.wrapS)).toBe(THREE.ClampToEdgeWrapping);
    expect(Number(texture.wrapT)).toBe(THREE.ClampToEdgeWrapping);
    const material = (scene.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
    const shader = {uniforms: {}, vertexShader: "#include <common>\n#include <uv_vertex>", fragmentShader: ""};
    material.onBeforeCompile(shader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);
    const origin = (shader.uniforms as Record<string, {value: THREE.Vector2}>).m2lSurfaceOrigin.value;
    expect(origin.toArray()).toEqual([-16, -8]);
    expect(new THREE.Vector2(4096, 2048).divideScalar(256).add(origin).toArray()).toEqual([0, 0]);
    expect(new THREE.Vector2(4352, 2304).divideScalar(256).add(origin).toArray()).toEqual([1, 1]);
    expect(shader.vertexShader).toContain("vAlphaMapUv =");
  } finally { overlay.clear(); source.geometry.dispose(); (source.material as THREE.Material).dispose(); }
});

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

test("Smooth road can show orange masks independently of blue selection", async () => {
  const scene = new THREE.Scene(), ground = mesh("1ROAD_ground_0_0");
  const overlay = new SurfaceOverlay(scene, () => {}, () => true, () => {}, async () => new THREE.Texture(), 0xf39c35, .4);
  await overlay.set(selection, [ground]);
  const material = (scene.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>).material;
  expect(material.color.getHex()).toBe(0xf39c35);
  expect(material.opacity).toBe(.4);
  overlay.clear(); ground.geometry.dispose(); ground.material.dispose();
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
