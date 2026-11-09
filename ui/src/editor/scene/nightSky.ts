import * as THREE from "three";

// Inside the view's far plane (VIEW_M) and beyond all terrain of a track (it reaches 40 km around the route), so hills hide the sky.
const RADIUS = 250000;
const STARS = 1800;
const STAR_SEED = 271828;       // the same stars each time
const MOON_RADIUS_DEG = 1.1;    // twice the real one: at the real size it is a dot on the screen

/** Star positions on the upper half of a sphere around the origin, the same each time. Pure. */
function starField() {
  const out = new Float32Array(STARS * 3);
  let state = STAR_SEED;
  const random = () => {        // (mulberry32: Math.random would give other stars after each reload)
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < STARS; i++) {
    const up = random(), turn = random() * 2 * Math.PI, level = Math.sqrt(1 - up * up);
    out.set([RADIUS * level * Math.cos(turn), RADIUS * up, RADIUS * level * Math.sin(turn)], i * 3);
  }
  return out;
}

/** The stars and the moon, drawn only at night. It goes along with the camera, like the sky. */
export class NightSky {
  readonly group = new THREE.Group();
  readonly stars: THREE.Points;
  readonly moon: THREE.Mesh;

  constructor() {
    const field = new THREE.BufferGeometry();
    field.setAttribute("position", new THREE.BufferAttribute(starField(), 3));
    this.stars = new THREE.Points(field, new THREE.PointsMaterial({color: "#dfe6ff", size: 1.6, sizeAttenuation: false, transparent: true, depthWrite: false}));
    this.moon = new THREE.Mesh(new THREE.CircleGeometry(RADIUS * Math.tan(MOON_RADIUS_DEG * Math.PI / 180), 48),
      new THREE.MeshBasicMaterial({color: "#efe9d6", transparent: true, depthWrite: false}));
    for (const part of [this.stars, this.moon]) {
      part.frustumCulled = false;               // (the camera stands in its middle)
      part.raycast = () => {};                  // (a click means the track)
    }
    this.group.add(this.stars, this.moon);
    this.group.visible = false;
  }

  /** moon: unit vector toward the moon; night: how far they are out, 0..1. */
  set(moon: [number, number, number], night: number) {
    this.group.visible = night > 0;
    (this.stars.material as THREE.PointsMaterial).opacity = night;
    (this.moon.material as THREE.MeshBasicMaterial).opacity = night;
    this.moon.visible = moon[1] > 0;
    const toward = new THREE.Vector3(...moon);
    this.moon.position.copy(toward).multiplyScalar(RADIUS);
    this.moon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), toward.negate());
  }

  follow(camera: THREE.Vector3) { this.group.position.copy(camera); }

  dispose() {
    for (const part of [this.stars, this.moon]) { part.geometry.dispose(); (part.material as THREE.Material).dispose(); }
  }
}
