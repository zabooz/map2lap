import * as THREE from "three";
import {ModelDraw} from "./modelDraw";
import type {LibraryModel} from "../library/ModelLibrary";

export interface GroupPlant {model: string; at: [number, number, number]; turn: number; scale: number}
interface Shown {plants: GroupPlant[]; models: LibraryModel[]; canonical?: string[]; draft?: number}

/** Local stroke geometry stays visible until all server instances replace it, sharing resources between strokes. */
export class GroupDraw {
  private draw: ModelDraw;
  private groups = new Map<string, Shown>();
  constructor(scene: THREE.Scene, reserve: (bytes: number) => boolean, load?: (url: string) => Promise<THREE.Group>) {
    this.draw = new ModelDraw(scene, load, reserve, false);
  }
  environment(texture: THREE.Texture, power: number) { this.draw.setEnvironment(texture, power); }
  async show(key: string, plants: GroupPlant[], models: LibraryModel[]) {
    this.groups.set(key, {plants, models}); await this.sync();
  }
  confirm(key: string, ids: string[], draft: number) {
    const group = this.groups.get(key); if (group) Object.assign(group, {canonical: ids, draft});
  }
  async drop(key: string) { if (this.groups.delete(key)) await this.sync(); }
  async settle(draft: number, present: Set<string>, drawn: (id: string) => boolean) {
    let changed = false;
    for (const [key, g] of this.groups) if (g.canonical && ((draft > g.draft! && !g.canonical.every(id => present.has(id)))
      || (draft >= g.draft! && g.canonical.every(drawn)))) { this.groups.delete(key); changed = true; }
    if (changed) await this.sync();
  }
  private sync() {
    const bindings: {id: string; asset: string}[] = [], assets: Record<string, {url: string}> = {}, matrices: Record<string, number[]> = {};
    for (const [key, g] of this.groups) {
      const models = new Map(g.models.map(m => [m.id, m]));
      g.plants.forEach((p, i) => {
        const model = models.get(p.model); if (!model) throw new Error("An object in this group is missing.");
        const id = `${key}/${i}`, scale = model.metres_per_unit * p.scale;
        assets[p.model] = {...model, url: `/api/library/models/${p.model}/original`}; bindings.push({id, asset: p.model});
        matrices[id] = new THREE.Matrix4().makeTranslation(...p.at).multiply(new THREE.Matrix4().makeRotationY(p.turn * Math.PI / 180))
          .multiply(new THREE.Matrix4().makeScale(scale, scale, scale)).multiply(new THREE.Matrix4().makeTranslation(-model.anchor[0], -model.anchor[1], -model.anchor[2])).toArray();
      });
    }
    return this.draw.sync(bindings, assets, matrices).then(() => {
      performance.clearMarks("map2lap.groups.resources");
      performance.mark("map2lap.groups.resources", {detail: this.draw.stats()});
    });
  }
  dispose() { this.groups.clear(); this.draw.dispose(); }
}
