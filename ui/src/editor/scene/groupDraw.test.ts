import {expect, test} from "bun:test";
import * as THREE from "three";
import {GroupDraw} from "./groupDraw";
import type {LibraryModel} from "../library/ModelLibrary";

test("a locally frozen group stays through Esc and older indices until all canonical instances are drawn", async () => {
  const scene = new THREE.Scene(), source = new THREE.Group(); source.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  const draw = new GroupDraw(scene, () => true, async () => source);
  const model = {id: "tree", name: "Tree", anchor: [0, 1, 0], metres_per_unit: 2} as LibraryModel;
  await draw.show("stroke", [{model: "tree", at: [3, 5, 4], turn: 0, scale: 1}], [model]);
  const batch = scene.children[0] as THREE.InstancedMesh, matrix = new THREE.Matrix4(); batch.getMatrixAt(0, matrix);
  expect(new THREE.Vector3().setFromMatrixPosition(matrix).toArray()).toEqual([3, 3, 4]);
  draw.confirm("stroke", ["a", "b"], 3);
  await draw.settle(3, new Set(["a", "b"]), id => id === "a"); expect(scene.children).toHaveLength(1);
  await draw.settle(2, new Set(), () => false); expect(scene.children).toHaveLength(1);
  await draw.settle(4, new Set(["a", "b"]), () => true); expect(scene.children).toHaveLength(0);
  draw.dispose();
});
