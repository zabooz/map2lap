import * as THREE from "three";
import {FLOATS_PER_VERTEX, fitSphere} from "./geometry";
import type {MeshInfo} from "../types";

const FIELDS_PER_CHANGE = 4;

/** Owns temporary height/normal changes over canonical scene meshes. */
export class GeometryPreview {
  readonly changedMeshes = new Set<number>();    // the meshes that show a preview: fetched anew when it is taken over
  private underPreview = new Map<number, Map<number, [number, number, number, number]>>();  // per such mesh what its vertices were: y and normal
  private previewShown = new Map<number, {numbers: Uint32Array; values: Float32Array}>();   // the preview in place, per mesh: it goes on again over what is fetched

  constructor(private readonly meshAt: (i: number) => THREE.Mesh | undefined, private readonly changed: () => void) {}

  get active() { return this.previewShown.size > 0; }

  replaced(i: number) { this.underPreview.delete(i); }

  forget(i: number) { this.changedMeshes.delete(i); this.underPreview.delete(i); }

  /** The vertices a preview changed as they were. It can show less than the one before, so nothing of that may stay. */
  takeBackPreview() {
    for (const [i, vertices] of this.underPreview) {
      const m = this.meshAt(i);
      if (!m) continue;
      const data = (m.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data, array = data.array;
      for (const [number, was] of vertices) {
        const v = number * FLOATS_PER_VERTEX;
        array[v + 1] = was[0];
        array[v + 3] = was[1];
        array[v + 4] = was[2];
        array[v + 5] = was[3];
      }
      data.needsUpdate = true;
      fitSphere(m.geometry, m.userData.info as MeshInfo);
      m.geometry.boundsTree?.refit();
      this.changedMeshes.delete(i);
      this.changed();
    }
    this.underPreview.clear();
    this.previewShown.clear();
  }

  /** What a preview shows stays until the server hands out the meshes: it is being taken over. */
  keepPreview() {
    this.underPreview.clear();
    this.previewShown.clear();
  }

  /** What trackedits.preview answered into the meshes loaded, on the vertices it names, instead of the preview before. */
  showPreview(buf: ArrayBuffer) {
    this.takeBackPreview();
    const head = new Uint32Array(buf);
    let word = 1;
    for (let mesh = 0; mesh < head[0]; mesh++) {
      const i = head[word], count = head[word + 1];
      this.previewShown.set(i, {numbers: head.subarray(word + 2, word + 2 + count),
                                values: new Float32Array(buf, (word + 2 + count) * 4, count * FIELDS_PER_CHANGE)});
      word += 2 + count + count * FIELDS_PER_CHANGE;
      this.apply(i);
    }
    this.changed();
  }

  /** The preview in place, on mesh number i if it is loaded, noting what it covers. */
  apply(i: number) {
    const shown = this.previewShown.get(i), m = this.meshAt(i);
    if (!shown || !m) return;
    const {numbers, values} = shown;
    const data = (m.geometry.getAttribute("position") as THREE.InterleavedBufferAttribute).data, array = data.array;
    const under = new Map<number, [number, number, number, number]>();
    this.underPreview.set(i, under);
    for (let k = 0; k < numbers.length; k++) {
      const v = numbers[k] * FLOATS_PER_VERTEX, c = k * FIELDS_PER_CHANGE;
      under.set(numbers[k], [array[v + 1], array[v + 3], array[v + 4], array[v + 5]]);
      array[v + 1] = values[c];
      array[v + 3] = values[c + 1];
      array[v + 4] = values[c + 2];
      array[v + 5] = values[c + 3];
    }
    data.needsUpdate = true;
    fitSphere(m.geometry, m.userData.info as MeshInfo);
    m.geometry.boundsTree?.refit();
    this.changedMeshes.add(i);
  }
}
