import {expect, test} from "bun:test";
import * as THREE from "three";
import {LampCones, NightGlow, glowFile, isLampGlass, lampHeads, lampsOn} from "./nightGlow";

function lambert() { return new THREE.MeshLambertMaterial(); }

/** A loader that answers when told, and notes what it was asked for. */
function loader(answer: (file: string) => THREE.Texture | null = () => new THREE.Texture()) {
  const asked: string[] = [];
  return {asked, load: async (file: string) => { asked.push(file); return answer(file); }};
}

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

/** The triangles of glass boxes around the given centres: as the build leaves them, one after the other. */
function glass(centres: number[][]) {
  const positions: number[] = [], index: number[] = [];
  for (const [x, y, z] of centres) {
    const from = positions.length / 3;
    positions.push(x - .25, y, z - .1, x + .25, y, z - .1, x + .25, y, z + .1, x - .25, y + .06, z + .1);
    index.push(from, from + 1, from + 2, from, from + 2, from + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index), 1));
  return new THREE.Mesh(geometry);
}

test("a facade's material tells its mask, by kind and brightness", () => {
  expect(glowFile("fac_03_1")).toBe("glow_fac_1.png");
  expect(glowFile("shp_00_0")).toBe("glow_shp_0.png");
  expect(glowFile("off_12_2")).toBe("glow_off_2.png");
  for (const name of ["sid_01_0", "props", "fac_03", "ground_1"]) expect(glowFile(name)).toBeNull();
});

test("the lamp's glass is known by its material", () => {
  expect(isLampGlass("lamp_glass")).toBe(true);
  expect(isLampGlass("props")).toBe(false);
});

test("the lamps come on when CSP's do: at a sun 2 degrees over the horizon", () => {
  expect(lampsOn(5)).toBe(false);
  expect(lampsOn(1.9)).toBe(true);
  expect(lampsOn(-30)).toBe(true);
});

test("by day no mask is fetched", async () => {
  const {asked, load} = loader(), glow = new NightGlow(load);
  glow.bind(lambert(), "fac_03_1");
  glow.set(false); await settle();
  expect(asked).toEqual([]);
});

test("at night a facade takes its mask, and shares it with its like", async () => {
  const {asked, load} = loader(), glow = new NightGlow(load), a = lambert(), b = lambert();
  glow.bind(a, "fac_03_1"); glow.bind(b, "fac_07_1");
  glow.set(true); await settle();
  expect(asked).toEqual(["glow_fac_1.png"]);
  expect(a.emissiveMap).toBe(b.emissiveMap!);
  expect(a.emissiveMap).not.toBeNull();
  expect(a.emissive.getHex()).not.toBe(0);
  expect(a.emissiveIntensity).toBe(1);
});

test("a material loaded at night glows at once", async () => {
  const {load} = loader(), glow = new NightGlow(load), a = lambert();
  glow.set(true);
  glow.bind(a, "off_00_2"); await settle();
  expect(a.emissiveMap).not.toBeNull();
});

test("by day again nothing glows, and the mask is not asked for twice", async () => {
  const {asked, load} = loader(), glow = new NightGlow(load), a = lambert();
  glow.bind(a, "fac_03_1");
  glow.set(true); await settle();
  glow.set(false);
  expect(a.emissiveIntensity).toBe(0);
  glow.set(true); await settle();
  expect(a.emissiveIntensity).toBe(1);
  expect(asked).toHaveLength(1);
});

test("a track built before has no masks: its houses stay dark", async () => {
  const {load} = loader(() => null), glow = new NightGlow(load), a = lambert();
  glow.bind(a, "fac_03_1");
  glow.set(true); await settle();
  expect(a.emissiveMap).toBeNull();
  expect(a.emissive.getHex()).toBe(0);
});

test("a mask arriving after another track was opened is dropped", async () => {
  let done: (texture: THREE.Texture) => void = () => {};
  const glow = new NightGlow(() => new Promise(resolve => { done = resolve; })), a = lambert(), texture = new THREE.Texture();
  let disposed = 0;
  texture.addEventListener("dispose", () => disposed++);
  glow.bind(a, "fac_03_1");
  glow.set(true);
  glow.clear();
  done(texture); await settle();
  expect(a.emissiveMap).toBeNull();
  expect(disposed).toBe(1);
});

test("the lamp's glass glows at night with no mask", async () => {
  const {asked, load} = loader(), glow = new NightGlow(load), a = lambert();
  glow.bind(a, "lamp_glass");
  glow.set(true); await settle();
  expect(asked).toEqual([]);
  expect(a.emissive.getHex()).not.toBe(0);
  glow.set(false);
  expect(a.emissiveIntensity).toBe(0);
});

test("other materials never glow", async () => {
  const {asked, load} = loader(), glow = new NightGlow(load), a = lambert();
  glow.bind(a, "props");
  glow.set(true); await settle();
  expect(asked).toEqual([]);
  expect(a.emissive.getHex()).toBe(0);
});

test("each lamp is one head, at the top of its glass", () => {
  const heads = lampHeads(glass([[10, 8, 20], [50, 7, 20]]));
  expect(heads).toHaveLength(2);
  expect(heads[0][0]).toBeCloseTo(10, 5);
  expect(heads[0][1]).toBeCloseTo(8.06, 5);
  expect(heads[0][2]).toBeCloseTo(20, 5);
  expect(heads[1][0]).toBeCloseTo(50, 5);
});

test("a deleted lamp has no head", () => {
  const mesh = glass([[10, 8, 20], [50, 7, 20]]), index = mesh.geometry.getIndex()!;
  (index.array as Uint16Array).fill(0, 0, 6);    // (view.leaveOutIn)
  const heads = lampHeads(mesh);
  expect(heads).toHaveLength(1);
  expect(heads[0][0]).toBeCloseTo(50, 5);
});

test("a cone hangs under each lamp, at night only", () => {
  const scene = new THREE.Scene(), cones = new LampCones(scene), mesh = glass([[10, 8, 20], [50, 7, 20]]);
  expect(scene.children).toContain(cones.mesh);
  cones.update([mesh], true);
  expect(cones.mesh.visible).toBe(true);
  expect(cones.mesh.count).toBe(2);
  const at = new THREE.Matrix4(); cones.mesh.getMatrixAt(1, at);
  expect(new THREE.Vector3().setFromMatrixPosition(at).x).toBeCloseTo(50, 5);
  cones.update([mesh], false);
  expect(cones.mesh.visible).toBe(false);
});

test("a cone follows its lamp, and goes with it", () => {
  const cones = new LampCones(new THREE.Scene()), mesh = glass([[10, 8, 20], [50, 7, 20]]);
  cones.update([mesh], true);
  const positions = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < 4; i++) positions.setX(i, positions.getX(i) + 100);
  positions.needsUpdate = true;
  cones.update([mesh], true);
  const at = new THREE.Matrix4(); cones.mesh.getMatrixAt(0, at);
  expect(new THREE.Vector3().setFromMatrixPosition(at).x).toBeCloseTo(110, 5);
  const index = mesh.geometry.getIndex()!;
  (index.array as Uint16Array).fill(0, 0, 6); index.needsUpdate = true;
  cones.update([mesh], true);
  expect(cones.mesh.count).toBe(1);
});

test("lamps too far off to be drawn have no cone", () => {
  const cones = new LampCones(new THREE.Scene()), mesh = glass([[10, 8, 20]]);
  mesh.visible = false;
  cones.update([mesh], true);
  expect(cones.mesh.count).toBe(0);
});

test("a cone can't be picked, hides nothing and darkens nothing", () => {
  const {mesh} = new LampCones(new THREE.Scene()), material = mesh.material as THREE.MeshBasicMaterial, hits: THREE.Intersection[] = [];
  mesh.raycast(new THREE.Raycaster(), hits);
  expect(hits).toEqual([]);
  expect(material.depthWrite).toBe(false);
  expect(material.blending).toBe(THREE.AdditiveBlending);
});
