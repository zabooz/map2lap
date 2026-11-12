import * as THREE from "three";
import type {GroundMaterial} from "./colourBlend";

const FACADE = /^(fac|shp|off)_\d+_([0-2])$/;       // (make_obj.BLD_KINDS: <kind>_<colour>_<brightness>; those with windows: facades.GLOWING)
const ON_BELOW_DEG = 2;                             // the sun's height at which CSP's lamps come on (NIGHT_SMOOTH: 88 degrees from the zenith)
const WINDOW_COLOUR = "#d9a566", LAMP_COLOUR = "#fff0c0", CONE_COLOUR = new THREE.Color("#ffd9a0");
const SAME_HEAD_M = 2;                              // all glass within this is one lamp (the track's CLUSTER_THRESHOLD)
const CONE_HEIGHT_M = 10, CONE_RADIUS_M = 7;        // from a head down to the ground, and as wide as CSP's light falls there
const CONE_BRIGHTEST = 0.35;                        // at its tip: the road stays visible through it
const MOST_CONES = 1024;                            // (only tiles near enough to show their lamps count: a city's few hundred)

/** The file of the glow mask of a material, null for one with no windows. Pure. */
export function glowFile(material: string) {
  const match = FACADE.exec(material);
  return match ? `glow_${match[1]}_${match[2]}.png` : null;
}

/** Whether a material is the glass of a street lamp's head. Pure. */
export function isLampGlass(material: string) { return material === "lamp_glass"; }

/** Whether lamps and windows are on at a height of the sun in degrees. Pure. */
export function lampsOn(sunHeight: number) { return sunHeight < ON_BELOW_DEG; }

/** The windows and the lamps' glass glowing at night: nothing is fetched or changed by day. */
export class NightGlow {
  on = false;
  private materials = new Map<GroundMaterial, string | null>();     // (its mask's file; null: the glass, which needs none)
  private masks = new Map<string, Promise<THREE.Texture | null>>();
  private generation = 0;

  constructor(private load: (file: string) => Promise<THREE.Texture | null>, private changed: () => void = () => {}) {}

  /** Take a material on, by its name in the track; one that doesn't glow is left alone. */
  bind(material: GroundMaterial, name: string) {
    const file = glowFile(name);
    if (!file && !isLampGlass(name)) return;
    this.materials.set(material, file);
    material.emissiveIntensity = Number(this.on);
    if (this.on) this.light(material, file);
  }

  set(on: boolean) {
    if (on === this.on) return;
    this.on = on;
    for (const [material, file] of this.materials) {
      material.emissiveIntensity = Number(on);
      if (on) this.light(material, file);
    }
  }

  private light(material: GroundMaterial, file: string | null) {
    if (!file) { material.emissive.set(LAMP_COLOUR); return; }
    if (material.emissiveMap) return;
    void this.mask(file).then(mask => {
      if (!mask || !this.materials.has(material)) return;
      material.emissiveMap = mask;
      material.emissive.set(WINDOW_COLOUR);
      material.needsUpdate = true;
      this.changed();
    });
  }

  private mask(file: string) {
    let mask = this.masks.get(file);
    if (!mask) {
      const mine = this.generation;
      mask = this.load(file).catch(() => null).then(texture => {
        if (mine === this.generation) return texture;
        release(texture);
        return null;
      });
      this.masks.set(file, mask);
    }
    return mask;
  }

  /** The track is left: its masks go, what is still on its way too. */
  clear() {
    this.generation++;
    for (const mask of this.masks.values()) void mask.then(release);
    this.masks.clear();
    this.materials.clear();
  }
}

function release(texture: THREE.Texture | null) {
  if (!texture) return;
  texture.dispose();
  if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) texture.image.close();
}

/** [x, height, z] of the head of each lamp in a mesh of lamp glass, as it stands now: the triangles of one head follow each other,
 * a deleted lamp's are all 0 (view.leaveOutIn). Pure. */
export function lampHeads(mesh: THREE.Mesh) {
  const index = mesh.geometry.getIndex()!, position = mesh.geometry.getAttribute("position");
  const heads: [number, number, number][] = [];
  let n = 0, x = 0, z = 0, top = -Infinity;
  const finish = () => { if (n) heads.push([x / n, top, z / n]); n = 0; x = 0; z = 0; top = -Infinity; };
  for (let t = 0; t + 2 < index.count; t += 3) {
    const corners = [index.getX(t), index.getX(t + 1), index.getX(t + 2)];
    if (corners[0] === corners[1] && corners[1] === corners[2]) continue;
    if (n && Math.hypot(position.getX(corners[0]) - x / n, position.getZ(corners[0]) - z / n) > SAME_HEAD_M) finish();
    for (const corner of corners) {
      x += position.getX(corner); z += position.getZ(corner); n++;
      top = Math.max(top, position.getY(corner));
    }
  }
  finish();
  return heads;
}

function coneGeometry() {
  const geometry = new THREE.ConeGeometry(CONE_RADIUS_M, CONE_HEIGHT_M, 20, 1, true).translate(0, -CONE_HEIGHT_M / 2, 0);
  const position = geometry.getAttribute("position"), colours = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const share = 1 + position.getY(i) / CONE_HEIGHT_M, bright = CONE_BRIGHTEST * share * share;
    colours.set([CONE_COLOUR.r * bright, CONE_COLOUR.g * bright, CONE_COLOUR.b * bright], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
  return geometry;
}

/** A see-through cone under each lamp at night, in one draw. It shows where the light falls; the road itself stays unlit. */
export class LampCones {
  readonly mesh: THREE.InstancedMesh;
  private stamp = "";

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.InstancedMesh(coneGeometry(), new THREE.MeshBasicMaterial({vertexColors: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide}), MOST_CONES);
    this.mesh.count = 0;
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.raycast = () => {};
    scene.add(this.mesh);
  }

  /** Follow the lamps of the meshes of glass that are drawn now; on: whether it is night. */
  update(glass: THREE.Mesh[], on: boolean, extraHeads: [number, number, number][] = []) {
    this.mesh.visible = on;
    if (!on) return;
    const shown = glass.filter(mesh => mesh.visible);
    const stamp = shown.map(mesh => `${mesh.id}:${mesh.geometry.getIndex()!.version}:${version(mesh)}`).join() + ";" + extraHeads.join(";");
    if (stamp === this.stamp) return;
    this.stamp = stamp;
    const matrix = new THREE.Matrix4();
    let count = 0;
    for (const [x, y, z] of [...shown.flatMap(lampHeads), ...extraHeads].slice(0, MOST_CONES)) this.mesh.setMatrixAt(count++, matrix.makeTranslation(x, y, z));
    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.mesh.dispose();
  }
}

function version(mesh: THREE.Mesh) {
  const position = mesh.geometry.getAttribute("position");
  return "data" in position ? position.data.version : (position as THREE.BufferAttribute).version;
}
