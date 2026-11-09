import * as THREE from "three";
import {DEFAULT_CONTROLS, NORMAL_SPEED} from "./controls";
import {trackArea, routeMetre} from "./inspect";
import {placeOnRoute, routeMetres} from "./ride";
import type {TrackIndex} from "../types";
import {screenPoint, MIDDLE_BUTTON, MIDDLE_HELD, RIGHT_BUTTON, RIGHT_HELD, LEFT_BUTTON} from "./pointer";

const FLY_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);     // (by place on the keyboard: the same on every layout)

export interface NavigationTrack {
  meshes: Pick<TrackIndex["meshes"][number], "name" | "center" | "radius">[];
  start: TrackIndex["start"];
  route: number[][];
}

export const VIEW_M = 300000;              // far plane: the distant terrain reaches 40 km around a route of up to 500 km
const START_BACK_M = 45, START_UP_M = 22;   // the first view: behind and above the start
const FAR = /^nocol_far/;
const ABOVE_GROUND_M = 1.5;
const LOOK_RAD_PER_PX = 0.004;      // the wheel held: how far the view turns per pixel dragged
const LOOK_DOWN_MIN_RAD = 0.02;     // the view stays this far below the horizon and this far from straight down (there it would flip)
const TURN_REACH = 10;              // the wheel held turns around the ground in the view's middle, at most this many times the height away
const TURN_REACH_MIN_M = 200;       // (flat over a plain that is many km: the camera would sweep across the country)
const AREA_MARGIN_M = 1000;         // how far beyond the track's meshes the view's middle goes (the camera can stand further out, to look back)
// The wheel: one notch goes this share of the way to what the mouse points at, so it feels the same from 10 m and from 10 km.
const ZOOM_STEP = 0.15;
const NOTCH_PX = 100, NOTCH_LINES = 3, MOST_NOTCHES = 3;    // (a notch's deltaY in pixels, in lines; one event of a fast wheel at most)
const NEAREST_M = 1;                // the wheel goes no nearer than this
const ZOOM_REACH = 5;               // a notch counts from at most this many times the height: terrain far off at the horizon is no km's jump
const ZOOM_EASE_S = 0.1;            // a notch glides: most of its way within this time, the view doesn't jump
const ZOOM_DONE = 0.002;            // (notches left that no eye sees)
const HIGHEST_MIN_M = 1000;         // the highest the camera goes: the track as a whole in view, at least this
const HIGHEST_MAX_M = 80000;        // ... at most this: the distant terrain, shown up to about 100 km (obj_to_kn5.VIEW), stays in sight
// Moving: m/s per m above the ground, so a close look creeps and an overview crosses the track; within these limits.
const FLY_PER_M = 2.0, FLY_MIN_M_S = 24, FLY_MAX_M_S = 6000;
export const FLY_MAX_STEP_S = 0.1;         // (a slow frame moves no further than this)
const RIDE_AHEAD_M = 30, RIDE_TURN_S = 0.6;     // the ride looks at the route this far ahead and turns towards it this slowly: through a bend, not with each of its corners
const RIDE_TILT = 0.12;             // down from level by this share: the road ahead in the picture, and still the horizon
const RIDE_GLIDE_S = 0.15, RIDE_GLIDE_DONE_M = 0.05;      // a notch of the wheel along the route glides there this fast: no jump, and it can be followed
const RIDE_SETTLED = 1e-6, RIDE_SETTLED_M = 0.01;         // (its look, in the square of a unit vector's way, and its height: come to rest, under what can be seen)
const RIDE_TELL_EVERY_MS = 100;     // how often the page hears how far it is: a number to read, not to re-render with each frame
const FOLLOW_GROUND_S = 0.3;        // moving, the camera's height follows the ground this slowly: hills pass under it, no bumps

/** Owns camera movement and route riding; ground queries and redraw notifications belong to the scene. */
export class Navigation {
  private picker = new THREE.Raycaster();
  settings = DEFAULT_CONTROLS;
  data: NavigationTrack | null = null;
  height = 0;                   // m above the ground, from the last ground query
  private clearance = START_UP_M;       // m above the ground it was left at: moving keeps to it
  highest = HIGHEST_MIN_M;      // m above the ground it can go
  private area = trackArea([]);         // where the middle of its view can lie, x and z
  lastGround = 0;               // the height of the last ground found under it: where none is, that counts as the ground
  zoomLeft = 0;                 // notches of the wheel still to glide, towards zoomAim
  zoomAim = new THREE.Vector3();
  flying = new Set<string>();   // the fly keys held
  ride: {metre: number; metres: number[]; left: number; moving: boolean} | null = null;    // the camera on the route: how far it is, the metres still to glide, whether it rides by itself
  private rideSpeed = 0;                // m a second
  private rideHeight = 0;               // m above the ground
  private rideTold = 0;                 // when the page last heard how far it is
  private onRideMoving: (moving: boolean) => void = () => {};
  private onRideMetre: (metre: number | null) => void = () => {};

  constructor(readonly camera: THREE.PerspectiveCamera,
    private readonly groundAlong: (origin: THREE.Vector3, direction: THREE.Vector3) => THREE.Intersection | undefined,
    private readonly changed: () => void) {}

  /** The part of the notches left that falls into seconds, along the line to what they aim at: that stays under the mouse. */
  glideZoom(seconds: number) {
    if (this.zoomLeft > 0 && this.height >= this.highest) {      // (at the top: on, it would only slide sideways)
      this.zoomLeft = 0;
      return;
    }
    let notches = this.zoomLeft * (1 - Math.exp(-seconds / ZOOM_EASE_S));
    if (Math.abs(this.zoomLeft - notches) < ZOOM_DONE) notches = this.zoomLeft;
    this.zoomLeft -= notches;
    const c = this.camera.position, way = c.distanceTo(this.zoomAim);
    if (!way) return;
    const left = Math.max(Math.min(way, NEAREST_M), way * (1 - ZOOM_STEP) ** -notches);
    c.lerpVectors(this.zoomAim, c, left / way);
    this.settle();
    this.clearance = this.height;
    this.moved();
  }

  /** The camera moved seconds along the keys held, level however it looks: W, S the way it looks, A, D to its side. Its height over the
      ground stays, hills pass under it. */
  fly(seconds: number) {
    const c = this.camera.position;
    const look = this.camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    const side = new THREE.Vector3().crossVectors(look, this.camera.up).normalize();
    const way = new THREE.Vector3();
    if (this.flying.has("KeyW")) way.add(look);
    if (this.flying.has("KeyS")) way.sub(look);
    if (this.flying.has("KeyD")) way.add(side);
    if (this.flying.has("KeyA")) way.sub(side);
    if (!way.lengthSq()) return;
    // (the height from the last frame's query: one ground query a frame, the costliest thing here)
    const speed = Math.min(FLY_MAX_M_S, Math.max(FLY_MIN_M_S, this.height * FLY_PER_M));
    c.add(way.normalize().multiplyScalar(speed * this.settings.fly / NORMAL_SPEED * seconds));
    this.keepInArea();
    const ground = this.groundBelow();
    if (ground !== null) c.y += (ground + this.clearance - c.y) * (1 - Math.exp(-seconds / FOLLOW_GROUND_S));
    this.settle(ground);
    this.moved();
  }

  /** The camera reach away from pivot, its view turned by yaw to the left and tilted by pitch upwards (rad). It may stand beyond the
      area (pivot lies in it); where a height limit keeps it from going all the way the view still turns, pivot then off its middle. */
  private turn(pivot: THREE.Vector3, reach: number, yaw: number, pitch: number) {
    const look = this.camera.getWorldDirection(new THREE.Vector3());
    const s = new THREE.Spherical().setFromVector3(look);
    s.theta += yaw;
    s.phi = THREE.MathUtils.clamp(s.phi - pitch, Math.PI / 2 + LOOK_DOWN_MIN_RAD, Math.PI - LOOK_DOWN_MIN_RAD);
    look.setFromSpherical(s);
    const c = this.camera.position;
    c.copy(pivot).addScaledVector(look, -reach);
    this.keepHeight(this.groundBelow());
    this.clearance = this.height;
    this.camera.lookAt(c.clone().add(look));
    this.moved();
  }

  /** The height of the ground under the camera, null while none is loaded there. */
  private groundBelow() {
    const c = this.camera.position;
    return this.groundAlong(new THREE.Vector3(c.x, c.y + VIEW_M, c.z), new THREE.Vector3(0, -1, 0))?.point.y ?? null;
  }

  /** How far along direction, which goes down, the height of the last ground lies. */
  private wayDown(direction: THREE.Vector3) {
    return Math.max(this.camera.position.y - this.lastGround, 0) / -direction.y;
  }

  /** How far ahead the point counts that the view turns around: at a flat look over a plain that is many km. */
  private reachOfLook() {
    return Math.max(TURN_REACH_MIN_M, this.height * TURN_REACH);
  }

  /** point moved into the area, x and z. */
  private intoArea(point: THREE.Vector3) {
    const {minX, maxX, minZ, maxZ} = this.area;
    point.x = THREE.MathUtils.clamp(point.x, minX - AREA_MARGIN_M, maxX + AREA_MARGIN_M);
    point.z = THREE.MathUtils.clamp(point.z, minZ - AREA_MARGIN_M, maxZ + AREA_MARGIN_M);
  }

  /** The camera moved as far as the middle of its view lies beyond the area: that is what can't leave, not the camera, which may have
      to stand beyond it to look back at the track. */
  private keepInArea() {
    const c = this.camera.position, look = this.camera.getWorldDirection(new THREE.Vector3());
    const middle = c.clone().addScaledVector(look, Math.min(this.wayDown(look), this.reachOfLook())), within = middle.clone();
    this.intoArea(within);
    c.x += within.x - middle.x;
    c.z += within.z - middle.z;
  }

  /** The camera within the area and its heights over the ground, known or looked up. */
  settle(known?: number | null) {
    this.keepInArea();
    this.keepHeight(known === undefined ? this.groundBelow() : known);
  }

  /** The camera within its heights over the ground (from below, the ground is not drawn: a hillside would turn into empty sky). */
  private keepHeight(ground: number | null) {
    if (ground !== null) this.lastGround = ground;
    const c = this.camera.position;
    c.y = THREE.MathUtils.clamp(c.y, this.lastGround + ABOVE_GROUND_M, this.lastGround + this.highest);
    this.height = c.y - this.lastGround;
  }

  /** Back to the first view, behind the start. */
  home() {
    if (!this.data) return;
    this.ride = null;
    this.onRideMoving(false);
    this.placeCamera(this.data);
    this.moved();
    this.tellRideMetre();
  }

  /** How the camera goes along the route: in m a second when it rides by itself, m above the ground. */
  setRide(speed: number, height: number) {
    this.rideSpeed = speed;
    this.rideHeight = height;
  }

  /** onMoving gets whether it rides by itself now, onMetre how far along the route it or the place nearest it is, null: there is no route. */
  setRideWatch(onMoving: (moving: boolean) => void, onMetre: (metre: number | null) => void) {
    this.onRideMoving = onMoving;
    this.onRideMetre = onMetre;
  }

  /** Tells the metre of the place on the route nearest the camera. */
  tellRideMetre() {
    const c = this.camera.position;
    this.onRideMetre(routeMetre(this.data?.route ?? [], c.x, c.z)?.metre ?? null);
  }

  /** The way the camera looks at metre of the route: at the route ahead, at its end the way it came, a little down. */
  private rideLook(metre: number, metres: number[]) {
    const route = this.data!.route, [x, z] = placeOnRoute(route, metres, metre), [ax, az] = placeOnRoute(route, metres, metre + RIDE_AHEAD_M);
    const [bx, bz] = placeOnRoute(route, metres, metre - RIDE_AHEAD_M);
    const way = ax !== x || az !== z ? new THREE.Vector3(ax - x, 0, az - z) : new THREE.Vector3(x - bx, 0, z - bz);
    return way.normalize().setY(-RIDE_TILT).normalize();
  }

  /** The camera on the route, put at the place nearest it if it isn't, or null if there is none to go along (an area has none). */
  private onRoute() {
    if (this.ride) return this.ride;
    const route = this.data?.route ?? [], c = this.camera.position;
    const metres = routeMetres(route), metre = routeMetre(route, c.x, c.z)?.metre;
    if (metre === undefined || !metres[metres.length - 1]) return null;
    this.flying.clear();
    this.zoomLeft = 0;
    this.ride = {metre, metres, left: 0, moving: false};
    [c.x, c.z] = placeOnRoute(route, metres, metre);
    const ground = this.groundBelow();
    if (ground !== null) this.lastGround = ground;
    c.y = this.lastGround + this.rideHeight;
    this.keepHeight(ground);
    this.camera.lookAt(c.clone().add(this.rideLook(metre, metres)));
    this.moved();
    this.onRideMetre(metre);
    return this.ride;
  }

  /** The camera that many metres further along the route, gliding there; whether there is a route. */
  rideBy(metres: number) {
    const ride = this.onRoute();
    if (ride) ride.left += metres;
    return !!ride;
  }

  /** It rides by itself from where it is, from the start again if that is the route's end, or stops doing so, on the route; whether there is a route. */
  toggleRide() {
    const ride = this.onRoute();
    if (!ride) return false;
    if (!ride.moving && ride.metre >= ride.metres[ride.metres.length - 1]) ride.metre = 0;
    ride.moving = !ride.moving;
    this.onRideMoving(ride.moving);
    return true;
  }

  /** The camera is off the route, if it was on it: it stays where it is, at that height. */
  stopRide() {
    if (!this.ride) return;
    this.ride = null;
    this.clearance = this.height;
    this.onRideMoving(false);
    this.tellRideMetre();
  }

  /** The camera seconds further along the route, over hills as the keys do, its look coming round to the route ahead. Standing and settled nothing is asked of the ground. */
  rideOn(seconds: number) {
    const ride = this.ride!, {metres} = ride, end = metres[metres.length - 1], c = this.camera.position, now = performance.now();
    const glide = Math.abs(ride.left) < RIDE_GLIDE_DONE_M ? ride.left : ride.left * (1 - Math.exp(-seconds / RIDE_GLIDE_S));
    const was = ride.metre;
    ride.left -= glide;
    ride.metre = THREE.MathUtils.clamp(was + glide + (ride.moving ? this.rideSpeed * seconds : 0), 0, end);
    if (ride.metre <= 0 || ride.metre >= end) ride.left = 0;
    if (ride.moving && ride.metre >= end) {
      ride.moving = false;
      this.onRideMoving(false);
    }
    const look = this.camera.getWorldDirection(new THREE.Vector3()), wanted = this.rideLook(ride.metre, metres);
    const going = ride.metre !== was, turning = look.distanceToSquared(wanted) > RIDE_SETTLED, rising = Math.abs(c.y - this.lastGround - this.rideHeight) > RIDE_SETTLED_M;
    if (!going && !turning && !rising) return;
    if (going || rising) {
      [c.x, c.z] = placeOnRoute(this.data!.route, metres, ride.metre);
      const ground = this.groundBelow();
      if (ground !== null) c.y += (ground + this.rideHeight - c.y) * (1 - Math.exp(-seconds / FOLLOW_GROUND_S));
      this.keepHeight(ground);
    }
    this.camera.lookAt(c.clone().add(look.lerp(wanted, 1 - Math.exp(-seconds / RIDE_TURN_S))));
    this.moved();
    if (now - this.rideTold >= RIDE_TELL_EVERY_MS || !ride.left && !ride.moving) {     // (often enough to read, and the place it comes to rest at)
      this.rideTold = now;
      this.onRideMetre(ride.metre);
    }
  }

  placeCamera(data: NavigationTrack) {
    this.data = data;
    const at = new THREE.Vector3(), forward = new THREE.Vector3(0, 0, 1);
    if (data.start) {
      at.set(...data.start.pos);
      forward.set(...data.start.forward).normalize();
    } else if (data.meshes.length) {
      for (const m of data.meshes) at.add(new THREE.Vector3(...m.center));
      at.divideScalar(data.meshes.length);
    }
    this.camera.position.copy(at).addScaledVector(forward, -START_BACK_M).add(new THREE.Vector3(0, START_UP_M, 0));
    this.camera.lookAt(at);
    this.camera.updateMatrixWorld();
    this.clearance = this.height = START_UP_M;
    this.lastGround = at.y;
    this.zoomLeft = 0;
    this.area = trackArea(data.meshes.filter(m => !FAR.test(m.name)));
    const {minX, maxX, minZ, maxZ} = this.area;
    this.highest = Math.min(HIGHEST_MAX_M, Math.max(HIGHEST_MIN_M, maxX - minX, maxZ - minZ));
  }

  private moved() {
    this.camera.updateMatrixWorld();
    this.changed();
  }

  /** The wheel held and dragged turns and tilts the view around the ground in its middle, which stays there. Its point is found
      anew each time, so nothing old is kept that could lie far off. */
  turnAround(el: HTMLElement) {
    let last: {x: number; y: number} | null = null, pivot = new THREE.Vector3(), reach = 0;
    el.addEventListener("mousedown", e => {     // (else the browser's scrolling by wheel starts)
      if (e.button === MIDDLE_BUTTON) e.preventDefault();
    });
    el.addEventListener("pointerdown", e => {
      if (e.button !== MIDDLE_BUTTON) return;
      this.zoomLeft = 0;
      last = {x: e.clientX, y: e.clientY};
      const c = this.camera.position, look = this.camera.getWorldDirection(new THREE.Vector3());
      reach = Math.max(NEAREST_M, Math.min(this.reachOfLook(), this.groundAlong(c, look)?.distance ?? this.wayDown(look)));
      pivot = c.clone().addScaledVector(look, reach);
      this.intoArea(pivot);
    });
    el.addEventListener("pointermove", e => {
      if (!last) return;
      if (!(e.buttons & MIDDLE_HELD)) {
        last = null;
        return;
      }
      const {look, invertLook} = this.settings, rad = LOOK_RAD_PER_PX * look / NORMAL_SPEED;
      this.turn(pivot, reach, (last.x - e.clientX) * rad, (last.y - e.clientY) * rad * (invertLook ? -1 : 1));
      last = {x: e.clientX, y: e.clientY};
    });
    el.addEventListener("pointerup", e => {
      if (e.button === MIDDLE_BUTTON) last = null;
    });
  }

  /** Right drag: the ground under the mouse stays under it. The right click for the menu is clicks'. */
  grabGround(el: HTMLElement) {
    let plane: THREE.Plane | null = null;
    const at = new THREE.Vector3(), grabbed = new THREE.Vector3();
    el.addEventListener("pointerdown", e => {
      if (e.button !== RIGHT_BUTTON) return;
      this.zoomLeft = 0;
      this.picker.setFromCamera(screenPoint(e, el), this.camera);
      const {ray} = this.picker, height = this.groundAlong(ray.origin, ray.direction)?.point.y ?? this.lastGround;
      plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -height);
      if (!ray.intersectPlane(plane, grabbed)) plane = null;      // (the sky: nothing to take along)
    });
    const follow = (e: PointerEvent, on: THREE.Plane) => {
      this.picker.setFromCamera(screenPoint(e, el), this.camera);
      if (!this.picker.ray.intersectPlane(on, at) || at.distanceTo(this.camera.position) > 2 * this.highest) return;   // (at the horizon)
      this.camera.position.x += grabbed.x - at.x;
      this.camera.position.z += grabbed.z - at.z;
      this.settle();
      this.clearance = this.height;
      this.moved();
    };
    el.addEventListener("pointermove", e => {
      if (!plane) return;
      if (e.buttons & RIGHT_HELD) follow(e, plane);
      else plane = null;
    });
    el.addEventListener("pointerup", e => {
      if (e.button !== RIGHT_BUTTON) return;
      if (plane) follow(e, plane);      // (where it was let go: a browser under load merges the last moves into this)
      plane = null;
    });
  }

  /** W A S D, while the view has the focus: typing in a field or the settings moves nothing, and a key let go elsewhere
      doesn't keep it moving. */
  flyKeys(el: HTMLElement) {
    el.tabIndex = 0;
    el.addEventListener("pointerdown", e => {
      el.focus({preventScroll: true});
      if (e.button !== LEFT_BUTTON) this.stopRide();     // (the right button and the wheel held move the camera: a click can be made on the way)
    });
    el.addEventListener("keydown", e => {
      if (!FLY_KEYS.has(e.code) || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      this.stopRide();
      this.flying.add(e.code);
    });
    el.addEventListener("keyup", e => this.flying.delete(e.code));
    el.addEventListener("blur", () => this.flying.clear());
  }

  /** Aim one wheel event at the picked point or the ground below the look direction. */
  zoomAt(e: WheelEvent, hit: THREE.Intersection | undefined, direction: THREE.Vector3) {
    const c = this.camera.position;
    const toward = hit || direction.y < 0 ? direction : this.camera.getWorldDirection(new THREE.Vector3());
    const way = Math.min(hit?.distance ?? this.wayDown(toward), Math.max(this.height, NEAREST_M) * ZOOM_REACH);
    this.zoomAim.copy(c).addScaledVector(toward, Math.max(way, NEAREST_M));
    const px = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY / NOTCH_LINES * NOTCH_PX : e.deltaY;
    this.zoomLeft += THREE.MathUtils.clamp(px / NOTCH_PX, -MOST_NOTCHES, MOST_NOTCHES) * this.settings.zoom / NORMAL_SPEED;
  }
}
