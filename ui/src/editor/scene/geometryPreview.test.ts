import {expect, test} from "bun:test";
import * as THREE from "three";
import {GeometryPreview} from "./geometryPreview";

function fixture() {
  const data = new THREE.InterleavedBuffer(new Float32Array([0, 10, 0, 0, 1, 0, 0, 0, 0, 0, 0]), 11);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(data, 3, 0));
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.userData.info = {center: [0, 10, 0], radius: 1};
  const meshes = new Map([[7, mesh]]);
  const preview = new GeometryPreview(i => meshes.get(i), () => {});
  return {preview, mesh, data, meshes};
}

function answer(height: number) {
  const bytes = new ArrayBuffer(32);
  new Uint32Array(bytes).set([1, 7, 1, 0]);
  new Float32Array(bytes, 16).set([height, 0, 1, 0]);
  return bytes;
}

test("replacing a preview restores the original before applying it; Cancel restores that original", () => {
  const {preview, mesh, data} = fixture();
  preview.showPreview(answer(20));
  expect(data.array[1]).toBe(20);
  preview.showPreview(answer(30));
  expect(data.array[1]).toBe(30);
  preview.takeBackPreview();
  expect(data.array[1]).toBe(10);
  expect(preview.changedMeshes.size).toBe(0);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test("a preview received before its mesh loads is applied when the mesh arrives", () => {
  const {preview, mesh, data, meshes} = fixture();
  meshes.clear();
  preview.showPreview(answer(25));
  expect(data.array[1]).toBe(10);
  meshes.set(7, mesh);
  preview.apply(7);
  expect(data.array[1]).toBe(25);
  preview.keepPreview();
  preview.takeBackPreview();
  expect(data.array[1]).toBe(25);
  mesh.geometry.dispose(); mesh.material.dispose();
});

test("a canonical mesh update becomes the baseline under the retained preview", () => {
  const {preview, mesh, data} = fixture();
  preview.showPreview(answer(25));
  data.array[1] = 18;
  preview.replaced(7);
  preview.apply(7);
  expect(data.array[1]).toBe(25);
  preview.takeBackPreview();
  expect(data.array[1]).toBe(18);
  mesh.geometry.dispose(); mesh.material.dispose();
});
