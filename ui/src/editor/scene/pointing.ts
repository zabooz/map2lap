// What lies under the mouse in the view: the first solid thing a ray from it meets (the see-through parts of a tree's quad are
// nothing, a TreeFX tree's leaves alike), or a wire near it in front of that, and what the hover box and the inspector say about it.
import * as THREE from "three";
import type {Hovered, MeshInfo, TrackIndex} from "../types";
import {kindName, kindOf, latLonOf, physicsOf, routeMetre, sortOf, tileOf} from "./inspect";
import type {ModelDraw} from "./modelDraw";
import type {TreeFxDraw} from "./treeFx";
import {FAR_M} from "./treeFx";
import type {TrackObjects} from "./trackObjects";

const WIRE = /_wire_/;
const WIRE_REACH_PX = 6;            // a wire is thinner than a pixel from afar: the mouse this near it finds it
const FACES_PER_WIRE_SEGMENT = 8;   // (furniture.wire_mesh: two crossed ribbons, each side of each two triangles)

/** An image's pixels, to read. (A plain canvas: not every browser has OffscreenCanvas.) */
function pixelsOf(image: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const can = canvas.getContext("2d", {willReadFrequently: true});
  can?.drawImage(image, 0, 0);
  return can ? can.getImageData(0, 0, image.width, image.height) : null;
}

/** What Pointing needs of the view it serves. */
export interface PointingHost {
  camera: THREE.PerspectiveCamera;
  objects: TrackObjects;
  data(): TrackIndex | null;            // the track's index as the view has it now
  meshes(): THREE.Mesh[];               // the loaded meshes
  models(): ModelDraw;                  // the track's imported models
  trees(): TreeFxDraw;                  // the track's TreeFX trees
  height(): number;                     // the view's height in pixels
  take(bytes: number): void;            // memory a texture's alpha read for the mouse takes
  release(bytes: number): void;
}

/** What lies under the mouse in a view. */
export class Pointing {
  private picker = new THREE.Raycaster();
  private alphaOf = new Map<THREE.Texture, ImageData | null>();
  private host: PointingHost;

  constructor(host: PointingHost) {
    this.host = host;
  }

  /** The ray of the last hit. */
  get ray() { return this.picker.ray; }

  /** The first solid thing under mouse (-1 .. 1 over the view), or a wire near it in front of that. */
  hit(mouse: THREE.Vector2) {
    this.picker.setFromCamera(mouse, this.host.camera);
    const hits = [...this.picker.intersectObjects(this.host.meshes().filter(m => m.visible), false), ...this.host.models().intersections(this.picker),
                  ...this.host.trees().intersections(this.picker)];
    const solid = hits.sort((a, b) => a.distance - b.distance).find(h => this.solidAt(h));
    return this.wireNear(solid?.distance ?? Infinity) ?? solid;
  }

  /** The copy of texture's alpha read for the mouse goes (the texture changed), its memory with it. */
  forget(texture: THREE.Texture) {
    const alpha = this.alphaOf.get(texture);
    if (alpha) this.host.release(alpha.data.byteLength);
    this.alphaOf.delete(texture);
  }

  /** Another track: no texture's alpha is kept. */
  clear() {
    this.alphaOf.clear();
  }

  /** Whether a cut-out texture is solid at the hit's uv: its see-through parts are nothing to point at (a tree's leaf
      cards are mostly see-through). A compressed one can't be read here: solid. */
  private solidAt(hit: THREE.Intersection) {
    const m = (hit.object as THREE.Mesh).material as THREE.MeshLambertMaterial;
    if (!m.alphaTest || !m.map || !hit.uv) return true;
    let pixels = this.alphaOf.get(m.map);
    if (pixels === undefined) {
      pixels = m.map.image instanceof ImageBitmap ? pixelsOf(m.map.image) : null;
      this.alphaOf.set(m.map, pixels);
      if (pixels) this.host.take(pixels.data.byteLength);
    }
    if (!pixels) return true;
    const x = Math.floor((hit.uv.x - Math.floor(hit.uv.x)) * pixels.width);
    const y = Math.floor((hit.uv.y - Math.floor(hit.uv.y)) * pixels.height);
    return pixels.data[(y * pixels.width + x) * 4 + 3] / 255 >= m.alphaTest;
  }

  /** The wire nearest the mouse within WIRE_REACH_PX and closer than limit. */
  private wireNear(limit: number): THREE.Intersection | undefined {
    const {ray} = this.picker, height = this.host.height() || 1;
    const perM = 2 * Math.tan(THREE.MathUtils.degToRad(this.host.camera.fov) / 2) / height * WIRE_REACH_PX;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), onRay = new THREE.Vector3(), onWire = new THREE.Vector3();
    let best: THREE.Intersection | undefined, bestD = limit;
    for (const mesh of this.host.meshes()) {
      if (!mesh.visible || !WIRE.test(mesh.name)) continue;
      const sphere = mesh.geometry.boundingSphere!, along = ray.direction.dot(sphere.center.clone().sub(ray.origin));
      if (ray.distanceSqToPoint(sphere.center) > (sphere.radius + Math.max(along, 0) * perM) ** 2) continue;
      const index = mesh.geometry.getIndex()!.array, position = mesh.geometry.getAttribute("position");
      for (let f = 0; f * 3 < index.length; f += FACES_PER_WIRE_SEGMENT) {
        if (index[f * 3] === index[f * 3 + 1]) continue;       // (left out)
        a.fromBufferAttribute(position, index[f * 3]);
        b.fromBufferAttribute(position, index[f * 3 + 1]);
        const off = ray.distanceSqToSegment(a, b, onRay, onWire), d = onRay.distanceTo(ray.origin);
        if (d < bestD && off <= (d * perM) ** 2) {
          bestD = d;
          best = {distance: d, point: onWire.clone(), object: mesh, faceIndex: f} as THREE.Intersection;
        }
      }
    }
    return best;
  }

  /** What the hover box and the inspector say about hit. */
  describe(hit: THREE.Intersection): Hovered {
    const data = this.host.data()!, mesh = hit.object as THREE.Mesh;
    const tree = this.host.trees().idOf(hit);
    if (tree) return this.describeTree(data, tree, hit);
    const instance = mesh.userData.modelInstance as string | undefined;
    const materialNumber = (mesh.material as THREE.Material).userData.modelMaterial ?? -1;
    const modelMaterial = materialNumber < 0 ? null : materialNumber;
    const primitive = mesh.userData.modelPrimitive as number | undefined;
    const info = instance ? data.meshes.find(m => m.model?.instance === instance && m.model.material === modelMaterial
      && (primitive === undefined || m.model.primitive === primitive))! : mesh.userData.info as MeshInfo;
    const material = data.materials[info.material];
    const texture = data.textures.find(t => t.name === material.texture);
    const {x, y, z} = hit.point, face = hit.faceIndex ?? 0, uv = hit.uv ? ([hit.uv.x, hit.uv.y] as [number, number]) : null;
    const listed = instance ? instance + "#0" : this.host.objects.objectAt(info.i, face);
    const tile = listed ? data.objects[listed.slice(0, listed.lastIndexOf("#"))] : null;
    const k = listed ? Number(listed.slice(listed.lastIndexOf("#") + 1)) : -1;
    return {
      id: listed,
      kind: listed ? kindName(tile!.kinds[k]) : kindOf(info.name),
      sort: listed ? sortOf(tile!, k) : null,
      object: info.name,
      physics: physicsOf(info.name),
      material: material.name,
      shader: material.shader,
      texture: material.texture,
      textureBytes: texture?.size ?? null,
      vertices: info.vertices,
      triangles: info.indices / 3,
      triangle: face,
      uv,
      shownTo: info.lod_out,
      at: [x, y, z],
      tile: tileOf(x, z),
      route: routeMetre(data.route, x, z),
      latLon: data.anchor ? latLonOf(data.anchor, x, y, z) : null,
      distance: hit.distance,
    };
  }

  /** What the hover box says of a TreeFX tree: its model is its sort (all of a model go at once as a listed sort does). */
  private describeTree(data: TrackIndex, id: string, hit: THREE.Intersection): Hovered {
    const facts = this.host.trees().facts(id, hit)!, {x, y, z} = hit.point, file = `${facts.model}.bin`;
    return {
      id, kind: /shrub|bush/.test(facts.model) ? "Bush" : "Tree", sort: facts.model, object: `extension/trees/${file}`,
      physics: "None", material: file, shader: "CSP TreeFX", texture: facts.texture, textureBytes: null,
      vertices: facts.vertices, triangles: facts.triangles, triangle: hit.faceIndex ?? 0, uv: hit.uv ? [hit.uv.x, hit.uv.y] : null,
      shownTo: FAR_M,
      treefx: {model: facts.model, triangles: facts.triangles, height: facts.height, width: facts.width, foot: [facts.pos[0], facts.pos[2]]},
      at: [x, y, z], tile: tileOf(x, z), route: routeMetre(data.route, x, z), latLon: data.anchor ? latLonOf(data.anchor, x, y, z) : null,
      distance: hit.distance,
    };
  }
}
