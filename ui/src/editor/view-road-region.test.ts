import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

test("a junction pin follows updated ground without recreating markers or querying distant pins", () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  const geometry = new THREE.BufferGeometry();
  const data = new THREE.InterleavedBuffer(new Float32Array(11), 11);
  geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(data, 3, 0));
  const ground = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
  ground.userData.info = {i: 0, name: "1ROAD_ground_0_0", vertices: 1, center: [0, 0, 0], radius: 1};
  const markerGeometry = new THREE.BufferGeometry();
  markerGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 10, 0, 100, 10, 100], 3));
  const markers = new THREE.Points(markerGeometry, new THREE.PointsMaterial());
  const pins = [[0, 10, 0], [100, 10, 100]];
  let queries = 0;
  Object.assign(view, {groundVersion: 0, underPreview: new Map(), pins, pinMarks: markers,
    groundAt: () => { queries++; return 42; }, laidOver: () => {}, reframePicks: () => {}});
  const bytes = new Float32Array(11); bytes[1] = 42;
  (view as unknown as {takeVertices: (mesh: THREE.Mesh, bytes: ArrayBuffer) => void}).takeVertices(ground, bytes.buffer);
  expect(pins[0][1]).toBe(42);
  expect(pins[1][1]).toBe(10);
  expect(queries).toBe(1);
  expect(markers.geometry).toBe(markerGeometry);
  expect(markers.geometry.getAttribute("position").getY(0)).toBeCloseTo(42.3);
  geometry.dispose(); ground.material.dispose(); markerGeometry.dispose(); markers.material.dispose();
});
