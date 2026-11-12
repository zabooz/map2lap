import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";

test("the overview keeps terrain, bridges and water beyond AC's draw distance, while props still fade out", () => {
  const names = ["1ROAD_ground_0_0", "1GRASS_ground_0_0", "1GRAVEL_ground_0_0", "nocol_far_0_0",
    "1ROAD_deck_0", "nocol_water_0", "nocol_props_0"];
  const meshes = names.map(name => {
    const geometry = new THREE.BufferGeometry();
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(9000, 0, 0), 100);
    const mesh = new THREE.Mesh(geometry);
    mesh.name = name; mesh.userData = {lodIn: 0, lodOut: 6000};
    return mesh;
  });
  const camera = new THREE.PerspectiveCamera(); camera.position.set(0, 8000, 0);
  const nothing = () => {};
  const view = Object.create(TrackView.prototype) as {frame: () => void};
  Object.assign(view, {shown: true, dirty: true, lastFrame: performance.now(), camera, meshes,
    navigation: {flying: new Set(), height: 8000}, ghost: {follow: nothing}, cullModels: nothing,
    brush: {goneNow: null}, treesGone: null, treeFx: {follow: nothing}, flushModels: nothing,
    nightSky: {follow: nothing}, lampCones: {update: nothing}, nightGlow: {on: false},
    sunShadows: {draw: nothing}, textures: {render: nothing}, renderer: {render: nothing}, selection: {follow: nothing}});
  view.frame();
  expect(meshes.map(mesh => mesh.visible)).toEqual([true, true, true, true, true, true, false]);
  for (const mesh of meshes) { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }
});
