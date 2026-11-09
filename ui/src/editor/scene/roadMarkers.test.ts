import {expect, test} from "bun:test";
import * as THREE from "three";
import {bandLines, RoadMarkers} from "./roadMarkers";
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
