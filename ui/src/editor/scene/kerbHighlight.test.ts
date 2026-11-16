import {expect, test} from "bun:test";
import * as THREE from "three";
import {KerbHighlight} from "./kerbHighlight";

test("the picked kerb tints its own complete mesh geometry and releases overlays when replaced", () => {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry(2, 0.1, 1);
  const make = (id: string) => {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: "white"}));
    mesh.userData.info = {kerb_id: id};
    return mesh;
  };
  const first = make("race"), second = make("race"), other = make("other");
  const highlight = new KerbHighlight(scene, () => {});
  highlight.set("race", [first, second, other]);
  expect(scene.children).toHaveLength(2);
  expect((scene.children[0] as THREE.Mesh).geometry).toBe(geometry);
  expect(scene.children.every(child => child instanceof THREE.Mesh && child.material !== first.material)).toBe(true);
  highlight.set(null, [first, second, other]);
  expect(scene.children).toHaveLength(0);
  highlight.set("race", [first]);
  highlight.add(second);
  expect(scene.children).toHaveLength(2);
  highlight.remove(first);
  expect(scene.children).toHaveLength(1);
  highlight.clear();
  expect(scene.children).toHaveLength(0);
  geometry.dispose();
});
