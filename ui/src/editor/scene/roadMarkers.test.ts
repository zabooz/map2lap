import {expect, test} from "bun:test";
import * as THREE from "three";
import {bandLines, bankArrowLines, RANGE_COLOURS, rangeSegments, RoadMarkers} from "./roadMarkers";
import type {Place} from "../types";

test("updated ground moves nearby pins without replacing geometry or querying distant pins", () => {
  const scene = new THREE.Scene();
  let queries = 0, changes = 0;
  const markers = new RoadMarkers(scene, new THREE.PerspectiveCamera(), () => { queries++; return 42; },
    () => { changes++; }, () => new THREE.Texture());
  const pins: Place[] = [[0, 10, 0], [100, 10, 100]];
  markers.drawPins(pins);
  const mesh = scene.children[0] as THREE.Points, geometry = mesh.geometry;
  markers.followGround(new THREE.Box3(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 50, 1)));
  expect(pins[0][1]).toBe(42);
  expect(pins[1][1]).toBe(10);
  expect(queries).toBe(1);
  expect(mesh.geometry).toBe(geometry);
  expect(geometry.getAttribute("position").getY(0)).toBeCloseTo(42.3);
  expect(changes).toBeGreaterThan(0);
  markers.dispose();
  expect(scene.children).toHaveLength(0);
});

test("clearing markers releases their geometry and materials, and disposal releases the shared pin image once", () => {
  const scene = new THREE.Scene(), texture = new THREE.Texture();
  let images = 0, geometries = 0, materials = 0;
  texture.addEventListener("dispose", () => { images++; });
  const markers = new RoadMarkers(scene, new THREE.PerspectiveCamera(), () => null, () => {}, () => texture);
  markers.drawPins([[0, 0, 0]]);
  markers.drawBand([[0, 0, 0], [0, 0, 10]], 4);
  for (const mesh of scene.children as (THREE.Points | THREE.LineSegments)[]) {
    mesh.geometry.addEventListener("dispose", () => { geometries++; });
    (mesh.material as THREE.Material).addEventListener("dispose", () => { materials++; });
  }
  markers.drawPins([]);
  markers.drawBand(null, 0);
  expect(scene.children).toHaveLength(0);
  expect(geometries).toBe(2);
  expect(materials).toBe(2);
  expect(images).toBe(0);
  markers.dispose();
  markers.dispose();
  expect(images).toBe(1);
});

test("a band has its two edges along the line, at its width, and its ends across", () => {
  const lines = bandLines([[0, 10, 0], [10, 10, 0], [20, 12, 0]], 4);
  const points = [];
  for (let k = 0; k < lines.length; k += 3) points.push(lines.slice(k, k + 3));
  expect(points.length).toBe(2 * 2 * 2 + 4);
  expect(points.every(p => Math.abs(p[2]) === 2)).toBe(true);        // (2 m to each side of a line along x)
  expect(points[0][1]).toBeCloseTo(10.3);                             // (a little over the road)
});

test("Bank road's arrows: a chevron along A->B, an up arrow on the high edge and a down arrow on the low one", () => {
  const lines = bankArrowLines([[0, 0, 0], [40, 0, 0]], 4, 1);       // (+: left, -z, high)
  const pairs: number[][][] = [];
  for (let i = 0; i < lines.length; i += 6) pairs.push([lines.slice(i, i + 3), lines.slice(i + 3, i + 6)]);
  const vertical = pairs.filter(([a, b]) => a[0] === b[0] && a[2] === b[2]);
  const left = vertical.filter(([a]) => a[2] === -4), right = vertical.filter(([a]) => a[2] === 4);
  expect(left.length).toBeGreaterThan(0);
  expect(right.length).toBeGreaterThan(0);
  expect(left.every(([a, b]) => b[1] > a[1])).toBe(true);           // (drawn from foot to tip: up on the high edge)
  expect(right.every(([a, b]) => b[1] < a[1])).toBe(true);
  expect(bankArrowLines([[0, 0, 0], [40, 0, 0]], 4, 0).some((v, i) => i % 3 === 1 && v > 1)).toBe(false);   // (level: no edge arrows)
});

test("the entire banking is filled, with separate colours for the core, transitions and misfits", () => {
  const parts = {before: [[0, 0, 0], [10, 0, 0]] as Place[], core: [[10, 0, 0], [30, 0, 0]] as Place[], after: [[30, 0, 0], [40, 0, 0]] as Place[]};
  const saved = rangeSegments([{...parts, width: 8, picked: false, fits: true}]);
  const selected = rangeSegments([{...parts, width: 8, picked: true, fits: false}]);
  expect(saved.map(s => s.colour)).toEqual([RANGE_COLOURS.core, RANGE_COLOURS.transition, RANGE_COLOURS.transition]);
  expect(selected.map(s => s.colour)).toEqual([RANGE_COLOURS.picked, RANGE_COLOURS.misfit, RANGE_COLOURS.misfit]);
  for (const part of [...saved, ...selected]) {
    expect(part.lines.length).toBeGreaterThan(0);
    expect(part.fill).toHaveLength(18); // Two triangles span the road for each one-segment part.
  }
});
