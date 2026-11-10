import {expect, test} from "bun:test";
import * as THREE from "three";
import {footReach} from "./plantFoot";

test("a tree's foot is its trunk, not its crown", () => {
  const tree = new THREE.Group(), trunk = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 3, 12)), crown = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 8));
  trunk.position.y = 1.5; crown.position.y = 5; tree.add(trunk, crown);
  expect(footReach(tree, [0, 0, 0])).toBeCloseTo(.2, 2);
});

test("a rock's foot is its whole underside, measured from the anchor", () => {
  const rock = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2)); rock.position.set(5, .5, 0);
  const group = new THREE.Group(); group.add(rock);
  expect(footReach(group, [5, 0, 0])).toBeCloseTo(Math.SQRT2, 5);
});
