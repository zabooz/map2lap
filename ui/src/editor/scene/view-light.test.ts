import {expect, test} from "bun:test";
import * as THREE from "three";
import {TrackView} from "./view";
import {GroundFrame} from "./groundRender";
import {fakeTextures} from "./trackTextures.fixture";
import {ModelDraw} from "./modelDraw";
import {NightSky} from "./nightSky";
import {lightAt, moonDirection, sunDirection, sunHeight, type Place} from "./sun";
import {SunLight} from "three/addons/lights/SunLight.js";
import {sunLight} from "./sunShadows";
import {NightGlow, lampsOn} from "./nightGlow";
import {DEFAULT_WEATHER} from "./weather";

const RECHBERG: Place = {lat: 46.518829, lon: 14.57707, utcOffset: 1};

/** A view without a renderer, its lights in its scene. */
function bareView(extra = {}) {
  const view = Object.create(TrackView.prototype) as TrackView;
  const scene = new THREE.Scene(), ambient = new THREE.AmbientLight(), sun = new THREE.DirectionalLight(), moon = new THREE.DirectionalLight();
  scene.add(ambient, sun, moon);
  const fields = {scene, ambient, sun, moon, nightSky: new NightSky(), nightGlow: new NightGlow(async () => null), place: RECHBERG, clock: 10, dirty: false, textures: fakeTextures().textures,
    modelLight: null as {texture: THREE.Texture} | null, modelDraw: new ModelDraw(scene), ...extra};
  Object.assign(view, fields);
  return {view, state: view as unknown as typeof fields};
}

test("the clock sets sun, sky and ambient together", () => {
  const {view, state} = bareView();
  view.setClock(14);
  const light = lightAt(sunHeight(RECHBERG, 14)), toward = sunDirection(RECHBERG, 14);
  expect(state.ambient.intensity).toBeCloseTo(light.ambient, 6);
  expect(state.sun.intensity).toBeCloseTo(light.sun, 6);
  expect(state.sun.position.toArray()).toEqual(toward);
  expect((state.scene.background as THREE.Color).getHexString()).toBe(light.sky.slice(1));
  expect(state.dirty).toBe(true);
});

test("the view tells the hour it shows, for Play to start AC at", () => {
  const {view} = bareView();
  view.setClock(21.5);
  expect(view.clockHours()).toBe(21.5);
});

test("weather changes the sky, light and visibility together and restores clear weather", () => {
  const {view, state} = bareView();
  view.setClock(12);
  const sunny = state.sun.intensity;
  view.setWeather({...DEFAULT_WEATHER, kind: "snow", intensity: "heavy", windDirection: 90, windSpeed: 20});
  expect(state.sun.intensity).toBeLessThan(sunny);
  expect(state.scene.fog).toBeInstanceOf(THREE.FogExp2);
  expect(view.weatherOptions().kind).toBe("snow");
  view.setWeather({...DEFAULT_WEATHER, windSpeed: 0});
  expect(state.sun.intensity).toBe(sunny);
  expect(state.scene.fog).toBeNull();
});

test("at midnight there is no sun and the sky is dark", () => {
  const {view, state} = bareView();
  view.setClock(0);
  expect(state.sun.intensity).toBe(0);
  expect((state.scene.background as THREE.Color).r).toBeLessThan(0.1);
});

test("at midnight the moon lights the track from where it stands, and the night sky shows", () => {
  const {view, state} = bareView();
  view.setClock(0);
  expect(state.moon.intensity).toBeCloseTo(lightAt(sunHeight(RECHBERG, 0)).moon, 6);
  expect(state.moon.intensity).toBeGreaterThan(0);
  expect(state.moon.position.toArray()).toEqual(moonDirection(RECHBERG, 0));
  expect(state.nightSky.group.visible).toBe(true);
});

test("by day there is no moonlight and no night sky", () => {
  const {view, state} = bareView();
  view.setClock(10);
  expect(state.moon.intensity).toBe(0);
  expect(state.nightSky.group.visible).toBe(false);
});

test("edited ground gets the moon too", () => {
  const {textures, inside} = fakeTextures(), {view, state} = bareView({textures});
  const frame = new GroundFrame({} as THREE.WebGLRenderer, state.scene, () => true, () => {});
  inside.groundFrame = frame;
  view.setClock(1);
  const moon = frame.scene.children[2] as THREE.DirectionalLight;
  expect(moon.intensity).toBe(state.moon.intensity);
  expect(moon.position.toArray()).toEqual(state.moon.position.toArray());
  frame.dispose();
});

test("edited ground gets the same light as the rest", () => {
  const {textures, inside} = fakeTextures(), {view, state} = bareView({textures});
  const frame = new GroundFrame({} as THREE.WebGLRenderer, state.scene, () => true, () => {});
  inside.groundFrame = frame;
  view.setClock(17);
  const [ambient, sun] = frame.scene.children as [THREE.AmbientLight, THREE.DirectionalLight];
  expect(ambient.intensity).toBe(state.ambient.intensity);
  expect(ambient.color.getHex()).toBe(state.ambient.color.getHex());
  expect(sun.intensity).toBe(state.sun.intensity);
  expect(sun.color.getHex()).toBe(state.sun.color.getHex());
  expect(sun.position.toArray()).toEqual(state.sun.position.toArray());
  frame.dispose();
});

test("the clock turns the lamps and windows on and off, at the hour CSP does", () => {
  const {view, state} = bareView();
  view.setClock(12);
  expect(state.nightGlow.on).toBe(false);
  view.setClock(0);
  expect(state.nightGlow.on).toBe(true);
  expect(state.nightGlow.on).toBe(lampsOn(sunHeight(RECHBERG, 0)));
});

test("edited ground takes the shadow map the rest takes", () => {
  const {state} = bareView({sun: sunLight()}), sun = state.sun as unknown as SunLight;
  state.scene.add(sun);
  const frame = new GroundFrame({} as THREE.WebGLRenderer, state.scene, () => true, () => {});
  const copy = frame.scene.children.find(light => light instanceof SunLight) as SunLight;
  expect(copy.shadow).toBe(sun.shadow);
  expect(copy.castShadow).toBe(true);
  frame.dispose();
});

test("edited ground begun after the clock moved starts with the current light", () => {
  const {view, state} = bareView();
  view.setClock(22);
  const frame = new GroundFrame({} as THREE.WebGLRenderer, state.scene, () => true, () => {});
  expect((frame.scene.children[0] as THREE.AmbientLight).intensity).toBe(state.ambient.intensity);
  frame.dispose();
});

test("placed models' reflections fade with the sky, also those loaded later", () => {
  const texture = new THREE.Texture(), material = new THREE.MeshStandardMaterial();
  const draw = new ModelDraw(new THREE.Scene());
  (draw as unknown as {assets: Map<string, {materials: Set<THREE.Material>}>}).assets.set("a", {materials: new Set([material])});
  const {view} = bareView({modelLight: {texture}, modelDraw: draw});
  view.setClock(0);
  expect(material.envMap).toBe(texture);
  expect(material.envMapIntensity).toBeCloseTo(lightAt(sunHeight(RECHBERG, 0)).ambient / 2, 6);
  expect((draw as unknown as {power: number}).power).toBeCloseTo(material.envMapIntensity, 6);
});

test("moving the clock asks the server nothing and leaves the draft alone", () => {
  const {view} = bareView();
  const fetched: unknown[] = [], real = globalThis.fetch;
  globalThis.fetch = ((...args: unknown[]) => { fetched.push(args); return real(...(args as Parameters<typeof fetch>)); }) as typeof fetch;
  try { for (let hour = 0; hour < 24; hour++) view.setClock(hour); }
  finally { globalThis.fetch = real; }
  expect(fetched).toEqual([]);
});
