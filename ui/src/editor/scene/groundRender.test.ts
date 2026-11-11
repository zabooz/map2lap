import {expect, spyOn, test} from "bun:test";
import * as THREE from "three";
import {GroundFrame, GroundLayer, groundRegionGeometry, groundRegionGeometries} from "./groundRender";
import type {ColourSplat, GroundPass} from "./colourBlend";

test("regional PBR uses physical materials for both the original tile and a colour-only photo", () => {
  const frame = new GroundFrame({} as THREE.WebGLRenderer, new THREE.Scene(), () => true, () => {});
  const pass: GroundPass = {image: -1, first: 0, bounds: [0, 0, 1, 1],
    frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}], weight: {name: "uniform", size: 0}};
  const layers: ColourSplat = {pbr: true, base: {name: "base"}, mask: {name: "unused"}, origin: [0, 0],
    images: [{name: "photo", scale: [128, 128], properties: {roughness: .6, normal_scale: 1}}],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0, passes: [pass, {...pass, image: 0}]}};
  const layer = new GroundLayer(frame, layers, new THREE.Texture(), [new THREE.Texture()], [null], [null, null], new THREE.Color());
  layer.attach(new THREE.Mesh(new THREE.PlaneGeometry(256, 256, 8, 8)));
  const materials = frame.scene.children[0].children.map(child => (child as THREE.Mesh).material as THREE.MeshStandardMaterial);
  expect(materials).toHaveLength(2);
  expect(materials.every(m => m instanceof THREE.MeshStandardMaterial)).toBe(true);
  expect(materials.map(m => m.roughness)).toEqual([221 / 255, .6]);
  layer.dispose(); frame.dispose();
});

/** The original per-region UV-box scan, independent of the spatial assignment. Pure. */
function originalIndices(source: THREE.BufferGeometry, bounds: number[], origin: number[]) {
  const indices = source.getIndex()!, uv = source.getAttribute("uv"), kept: number[] = [];
  for (let i = 0; i < indices.count; i += 3) {
    const triangle = [indices.getX(i), indices.getX(i + 1), indices.getX(i + 2)];
    const x = triangle.map(k => uv.getX(k) - origin[0]), y = triangle.map(k => uv.getY(k) - origin[1] + 1);
    if (Math.max(...x) <= bounds[0] || Math.min(...x) >= bounds[2] || Math.max(...y) <= bounds[1] || Math.min(...y) >= bounds[3]) continue;
    kept.push(...triangle);
  }
  return kept;
}

test("one assignment preserves original indices and order for overlapping, boundary and global UV regions", () => {
  const bounds = [[0, 0, .25, .5], [.25, 0, .5, .5], [.5, .5, 1, 1], [0, 0, 1, 1],
    [-1, -.25, .1, .1], [.13, .27, .84, .61], [2, 2, 3, 3], [.25, .25, .25, .5], [0, 0, .25, .5]];
  for (const origin of [[0, 1], [-123456.25, 98765.5]]) {
    const source = new THREE.PlaneGeometry(256, 256, 8, 8), uv = source.getAttribute("uv");
    const shift = origin[0] < 0 ? -.25 : 0;
    source.setAttribute("uv", new THREE.BufferAttribute(Float64Array.from(uv.array, (v, i) => v + shift + origin[i % 2] - (i % 2)), 2));
    if (shift) source.setIndex(Array.from(source.getIndex()!.array).reverse());
    const before = source.getIndex()!.array.slice();
    const regions = new Map(groundRegionGeometries(source, bounds, origin));
    expect(regions.size).toBe(bounds.length - 1);
    for (const box of bounds) {
      const geometry = regions.get(box.join(","))!;
      expect(Array.from(geometry.getIndex()!.array)).toEqual(originalIndices(source, box, origin));
      for (const [name, attribute] of Object.entries(source.attributes)) expect(geometry.getAttribute(name)).toBe(attribute);
    }
    expect(source.getIndex()!.array).toEqual(before);
  }
});

test("spatial assignment reads each triangle once and prunes distant region tests", () => {
  const source = new THREE.PlaneGeometry(256, 256, 32, 32), uv = source.getAttribute("uv");
  const readUV = spyOn(uv, "getX"), triangles = source.getIndex()!.count / 3;
  let regionReads = 0;
  const boxes = Array.from({length: 1024}, (_, i) => new Proxy(
    [i % 32 / 32, Math.floor(i / 32) / 32, (i % 32 + 1) / 32, (Math.floor(i / 32) + 1) / 32], {
      get(target, property, receiver) {
        if (["0", "1", "2", "3"].includes(String(property))) regionReads++;
        return Reflect.get(target, property, receiver);
      },
    }));
  try {
    const regions = new Map(groundRegionGeometries(source, boxes, [0, 1]));
    expect(regions.size).toBe(1024);
    expect(readUV).toHaveBeenCalledTimes(triangles * 3);
    // Includes tree construction and keys, as well as leaf tests: far below scanning every region per triangle.
    expect(regionReads).toBeLessThan(triangles * boxes.length / 4);
  } finally { readUV.mockRestore(); }
});

test("regional indices reserve CPU and GPU once per shared bounds, keep the old mesh on refusal and release only owned data", () => {
  let held = 0, limit = Infinity;
  const frame = new GroundFrame({} as THREE.WebGLRenderer, new THREE.Scene(), bytes => {
    if (held + bytes > limit) return false;
    held += bytes; return true;
  }, bytes => { held -= bytes; });
  const pass: GroundPass = {image: -1, first: 0, bounds: [.25, .25, .5, .5], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}], weight: {name: "uniform", size: 0}};
  const layers: ColourSplat = {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0,
      passes: [pass, pass, {...pass, bounds: [.5, .5, .75, .75]}]}};
  const source = new THREE.Mesh(new THREE.PlaneGeometry(256, 256, 8, 8));
  const originalPositions = source.geometry.getAttribute("position");
  const layer = new GroundLayer(frame, layers, new THREE.Texture(), [], [], [null, null, null], new THREE.Color());
  layer.attach(source);
  const old = frame.scene.children[0] as THREE.Mesh, oldRegion = (old.children[0] as THREE.Mesh).geometry;
  const bytes = [...(old.userData.regions as Map<string, THREE.BufferGeometry>).values()]
    .reduce((sum, geometry) => sum + geometry.getIndex()!.array.byteLength * 2, 0);
  expect(held).toBe(bytes);
  expect((old.children[1] as THREE.Mesh).geometry).toBe(oldRegion);
  source.geometry = new THREE.PlaneGeometry(256, 256, 16, 16);
  const firstReplacement = groundRegionGeometry(source.geometry, pass.bounds, [0, 1]);
  limit = held + firstReplacement.getIndex()!.array.byteLength * 2;
  const disposed = spyOn(THREE.BufferGeometry.prototype, "dispose");
  try {
    expect(() => layer.follow()).toThrow("memory");
    expect(disposed).toHaveBeenCalledTimes(2); // Includes the unreserved region after a successful first reservation.
  } finally { disposed.mockRestore(); }
  expect(frame.scene.children).toEqual([old]); expect(held).toBe(bytes);
  expect(oldRegion.getAttribute("position")).toBe(originalPositions);
  limit = Infinity; layer.follow();
  const next = frame.scene.children[0] as THREE.Mesh, nextRegion = (next.children[0] as THREE.Mesh).geometry;
  expect(next).not.toBe(old); expect(held).toBe(nextRegion.getIndex()!.array.byteLength * 4);
  layer.dispose(); expect(held).toBe(0); expect(frame.scene.children).toHaveLength(0);
  expect(source.geometry.getAttribute("position")).toBeDefined();
});

test("ground framebuffer resize accounts its allocation peak and never rebinds a disposed screen material", () => {
  let side = 10, held = 0, peak = 0, limit = 40_000;
  const renderer = {capabilities: {maxSamples: 4}, getDrawingBufferSize: (out: THREE.Vector2) => out.set(side, side)} as unknown as THREE.WebGLRenderer;
  const frame = new GroundFrame(renderer, new THREE.Scene(), bytes => {
    if (held + bytes > limit) return false;
    held += bytes; peak = Math.max(peak, held); return true;
  }, bytes => { held -= bytes; });
  const old = new THREE.MeshLambertMaterial(), active = new THREE.MeshLambertMaterial();
  frame.bind(old); frame.bind(active);
  expect(held).toBe(6000); // 100 pixels * (12 * 4 samples + 12 resolve/depth bytes).
  const original = old.map;
  old.dispose(); side = 20; frame.ensure();
  expect(held).toBe(24_000); expect(peak).toBe(30_000);
  expect(old.map).toBe(original); expect(active.map).not.toBe(original);
  const visible = active.map;
  side = 30; limit = 30_000;
  expect(() => frame.ensure()).toThrow("Not enough editor memory");
  expect(active.map).toBe(visible); expect(held).toBe(24_000);
  active.dispose(); frame.dispose(); expect(held).toBe(0);
});

test("a regional draw owns only intersecting indices and borrows unchanged source vertices", () => {
  const source = new THREE.PlaneGeometry(256, 256, 8, 8);
  const before = source.getIndex()!.array.slice();
  const geometry = groundRegionGeometry(source, [.25, .25, .5, .5], [0, 1]);
  expect(geometry.getIndex()!.count).toBeLessThan(source.getIndex()!.count / 4);
  expect(geometry.getAttribute("position")).toBe(source.getAttribute("position"));
  expect(source.getIndex()!.array).toEqual(before);
  expect(geometry.boundingSphere!.radius).toBeLessThan(source.boundingSphere?.radius ?? 181);
});

test("replacing source geometry at version zero rebuilds borrowed region attributes and preserves its world transform", () => {
  const frame = new GroundFrame({} as THREE.WebGLRenderer, new THREE.Scene(), () => true, () => {}), scene = frame.scene;
  const old = new THREE.PlaneGeometry(256, 256, 8, 8), next = new THREE.PlaneGeometry(128, 128, 2, 2);
  const source = new THREE.Mesh(old); source.position.set(17, 2, 30); source.updateMatrixWorld(true);
  const layer = new GroundLayer(frame, {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0,
      passes: [{image: -1, first: 0, bounds: [.25, .25, .5, .5], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}],
        weight: {name: "uniform", size: 0}}]}}, new THREE.Texture(), [], [], [null], new THREE.Color(1, 1, 1));
  layer.attach(source); layer.follow();
  const first = (scene.children[0].children[0] as THREE.Mesh).geometry;
  source.geometry = next; layer.follow(); scene.updateMatrixWorld(true);
  const depth = scene.children[0] as THREE.Mesh, region = (depth.children[0] as THREE.Mesh).geometry;
  expect(region).not.toBe(first);
  expect(region.getAttribute("position")).toBe(next.getAttribute("position"));
  expect(depth.matrixWorld.elements).toEqual(source.matrixWorld.elements);
  expect(old.getAttribute("position")).toBeDefined();
  layer.dispose(); expect(next.getAttribute("position")).toBeDefined();
});

test("painted ground takes shadows in each pass, and throws none", () => {
  const frame = new GroundFrame({} as THREE.WebGLRenderer, new THREE.Scene(), () => true, () => {});
  const layer = new GroundLayer(frame, {base: {name: "base"}, mask: {name: "unused"}, images: [], origin: [0, 0],
    ground: {dimensions: [256, 256], uv_origin: [0, 1], bytes: 0, split: 0,
      passes: [{image: -1, first: 0, bounds: [0, 0, 1, 1], frames: [{source: [0, 0], atlas: [0, 0, 0, 0], constant: 1}],
        weight: {name: "uniform", size: 0}}]}}, new THREE.Texture(), [], [], [null], new THREE.Color(1, 1, 1));
  layer.attach(new THREE.Mesh(new THREE.PlaneGeometry(256, 256, 2, 2)));
  const depth = frame.scene.children[0] as THREE.Mesh, pass = depth.children[0] as THREE.Mesh;
  expect(pass.receiveShadow).toBe(true);
  expect(pass.castShadow).toBe(false);
  expect(depth.castShadow).toBe(false);
  layer.dispose();
});

test("a guarded tile's triangles fall into the regions their whole-tile UVs reach", () => {
  // Guarded ground UVs cover only the inside of the tile texture (groundmaterial.UV_GUARD); masks and region bounds the whole tile.
  const guard = 1 / 8, inside = (u: number) => guard + u * (1 - 2 * guard);
  const source = new THREE.BufferGeometry();
  source.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
  source.setAttribute("uv", new THREE.BufferAttribute(Float32Array.from([inside(0), -inside(.5), inside(.1), -inside(.5), inside(0), -inside(.4)]), 2));
  source.setIndex([0, 1, 2]);
  const west = [0, 0, .11, 1];
  expect(Array.from(new Map(groundRegionGeometries(source, [west], [0, 0], guard)).get(west.join(","))!.getIndex()!.array)).toEqual([0, 1, 2]);
  expect(Array.from(new Map(groundRegionGeometries(source, [west], [0, 0])).get(west.join(","))!.getIndex()!.array)).toEqual([]);
});
