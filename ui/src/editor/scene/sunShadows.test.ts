import {expect, test} from "bun:test";
import * as THREE from "three";
import {SunShadows, castsShadow, shadowRange, sunLight, takeShadows} from "./sunShadows";

/** A renderer that only notes what it was asked to draw, and whether the shadow pass was due then. */
function stubRenderer() {
  const drawn: {scene: THREE.Object3D; mask: number; due: boolean}[] = [];
  const shadowMap = {enabled: false, autoUpdate: true, needsUpdate: false};
  const renderer = {shadowMap, render(scene: THREE.Object3D, camera: THREE.Camera) {
    drawn.push({scene, mask: camera.layers.mask, due: shadowMap.needsUpdate}); shadowMap.needsUpdate = false;
  }} as unknown as THREE.WebGLRenderer;
  return {renderer, drawn, shadowMap};
}

function mesh(name: string) {
  const m = new THREE.Mesh(); m.name = name; return m;
}

test("in a shadow the sky's light is weaker too, for every material", () => {
  const begin = THREE.ShaderChunk.lights_fragment_begin, end = THREE.ShaderChunk.lights_fragment_end;
  expect(begin).toContain("m2lShade = 1.0 - ( 1.0 - m2lSunSeen )");
  expect(begin).not.toContain("directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow");   // (the map is read once)
  expect(end.indexOf("irradiance *= m2lShade")).toBeGreaterThanOrEqual(0);
  expect(end.indexOf("irradiance *= m2lShade")).toBeLessThan(end.indexOf("RE_IndirectDiffuse( irradiance"));
});

test("only where the sun would shine: the side turned away and the night stay as they were", () => {
  const begin = THREE.ShaderChunk.lights_fragment_begin;
  expect(begin).toContain("dot( geometryNormal, directLight.direction )");
  expect(begin).toContain("length( sunLight.color )");
});

test("houses throw a shadow, nothing else does", () => {
  for (const name of ["1WALL_bld_fac_00_1_0_0", "nocol_bld_roof_3_4_0", "1WALL_bld2_plaster_1_2"]) expect(castsShadow(name)).toBe(true);
  for (const name of ["nocol_trees_1_2_0", "1ROAD_ground_0_0", "1GRASS_ground_3_4", "1WALL_cars_1_1", "nocol_props_2_2", "1ROAD_deck_1", "1WALL_bldcol_1_2"]) expect(castsShadow(name)).toBe(false);
});

test("a house throws and takes shadow, all else only takes it", () => {
  const house = mesh("1WALL_bld_fac_00_1_0_0"), road = mesh("1ROAD_ground_0_0");
  takeShadows(house); takeShadows(road);
  expect([house.castShadow, house.receiveShadow]).toEqual([true, true]);
  expect([road.castShadow, road.receiveShadow]).toEqual([false, true]);
});

test("a house stays visible to the view's own camera", () => {
  const house = mesh("1WALL_bld_fac_00_1_0_0"), camera = new THREE.PerspectiveCamera();
  takeShadows(house);
  expect(house.layers.test(camera.layers)).toBe(true);
});

test("the range keeps the ground in it from any height", () => {
  expect(shadowRange(3)).toBeGreaterThanOrEqual(200);
  expect(shadowRange(500)).toBeGreaterThan(500 * 2);    // (the ground ahead, at a view 45 degrees down and at the picture's edge)
  expect(shadowRange(800)).toBeGreaterThan(shadowRange(500));
});

test("from very high the range stops growing", () => {
  expect(shadowRange(80000)).toBe(shadowRange(1000000));
  expect(shadowRange(80000)).toBeLessThanOrEqual(5000);
});

test("the shadow map is drawn when asked, not with each scene", () => {
  const {renderer, shadowMap} = stubRenderer(), sun = sunLight();
  new SunShadows(renderer, new THREE.Scene(), sun);
  expect(shadowMap.enabled).toBe(true);
  expect(shadowMap.autoUpdate).toBe(false);
});

test("a shadow pass draws no mesh in colour and gives the camera back as it was", () => {
  const {renderer, drawn} = stubRenderer(), sun = sunLight(), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera();
  sun.intensity = 1; scene.add(sun);
  const house = mesh("1WALL_bld_fac_00_1_0_0"); takeShadows(house); scene.add(house);
  new SunShadows(renderer, scene, sun).draw(camera, 20);
  expect(drawn).toHaveLength(1);
  expect(drawn[0].due).toBe(true);
  expect(drawn[0].scene).toBe(scene);
  const during = new THREE.Layers(); during.mask = drawn[0].mask;
  expect(house.layers.test(during)).toBe(false);
  expect(sun.layers.test(during)).toBe(true);
  expect(camera.layers.mask).toBe(new THREE.Camera().layers.mask);
});

test("the shadow pass reads only what throws a shadow", () => {
  const {renderer} = stubRenderer(), sun = sunLight();
  new SunShadows(renderer, new THREE.Scene(), sun);
  const house = mesh("1WALL_bld_fac_00_1_0_0"), road = mesh("1ROAD_ground_0_0");
  takeShadows(house); takeShadows(road);
  expect(house.layers.test(sun.shadow.camera.layers)).toBe(true);
  expect(road.layers.test(sun.shadow.camera.layers)).toBe(false);
  expect(sun.shadow.camera.layers.mask & ~1).not.toBe(0);    // (else three.js falls back to the view camera's layers)
});

test("the pass reaches as far as the height asks", () => {
  const {renderer} = stubRenderer(), sun = sunLight();
  sun.intensity = 1;
  new SunShadows(renderer, new THREE.Scene(), sun).draw(new THREE.PerspectiveCamera(), 600);
  expect(sun.shadow.camera.far).toBe(shadowRange(600));
});

test("with the sun down no shadow pass is drawn, and the sun stays set to throw", () => {
  const {renderer, drawn} = stubRenderer(), sun = sunLight();
  sun.intensity = 0;
  new SunShadows(renderer, new THREE.Scene(), sun).draw(new THREE.PerspectiveCamera(), 20);
  expect(drawn).toHaveLength(0);
  expect(sun.castShadow).toBe(true);    // (a change would rebuild every shader: the clock would stutter at dusk)
});
