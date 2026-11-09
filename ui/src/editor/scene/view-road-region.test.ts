import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {RoadMarkers} from "./roadMarkers";
import {GeometryPreview} from "./geometryPreview";

test("receiving canonical ground geometry updates the road pins on that ground", () => {
  const view = Object.create(TrackView.prototype) as TrackView;
  const geometry = new THREE.BufferGeometry();
  const data = new THREE.InterleavedBuffer(new Float32Array(11), 11);
  geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(data, 3, 0));
  const ground = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial());
  ground.userData.info = {i: 0, name: "1ROAD_ground_0_0", vertices: 1, center: [0, 0, 0], radius: 1};
  const scene = new THREE.Scene();
  const roadMarkers = new RoadMarkers(scene, new THREE.PerspectiveCamera(), () => data.array[1], () => {}, () => new THREE.Texture());
  roadMarkers.drawPins([[0, 10, 0], [100, 10, 100]]);
  const markers = scene.children[0] as THREE.Points;
  const geometryPreview = new GeometryPreview(() => ground, () => {});
  Object.assign(view, {groundVersion: 0, geometryPreview, roadMarkers, reframePicks: () => {}});
  const bytes = new Float32Array(11); bytes[1] = 42;
  (view as unknown as {takeVertices: (mesh: THREE.Mesh, bytes: ArrayBuffer) => void}).takeVertices(ground, bytes.buffer);
  expect(markers.geometry.getAttribute("position").getY(0)).toBeCloseTo(42.3);
  expect(markers.geometry.getAttribute("position").getY(1)).toBeCloseTo(10.3);
  roadMarkers.dispose(); geometry.dispose(); ground.material.dispose();
});
