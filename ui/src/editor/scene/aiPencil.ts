import * as THREE from "three";
import {post} from "../../api";
import type {AiAnchor, AiCorrection, AiRedraw} from "../state/edits";
import {at, type Checked, type MoveGuide, type Row} from "./aiGuide";
import {screenPoint} from "./pointer";

type Stroke = {line: THREE.Line; points: number[][]; from: number; to: number; id: string; error?: string};
type Site = {row: Row; tail: boolean};
const lift = .38;

function anchor(guide: MoveGuide, row: Row): AiAnchor {
  const metre = guide.closed ? row[3] % guide.length : Math.min(guide.length, row[3]);
  const context = [-5,0,5].map(d => at(guide, metre+d));
  const [[ax,az],[cx,cz],[bx,bz]] = context;
  const dx = bx-ax, dz = bz-az, len = Math.hypot(dx,dz);
  const fx = -row[5], fz = row[4];
  return {metre, level: row[1], context, origin: guide.origin, route: guide.key,
    lateral: ((row[0]-cx)*dz-(row[2]-cz)*dx)/len,
    along: ((row[0]-cx)*dx+(row[2]-cz)*dz)/len, after: Math.max(0,row[3]-guide.length),
    angle: Math.atan2(fx*dz-fz*dx,fx*dx+fz*dz)};
}

function stroke(points: number[][], error?: string, dashed = false) {
  const positions = points.flatMap(p => [p[0],p[1]+lift,p[2]]);
  const colors = points.flatMap(p => new THREE.Color(error ? 0xff3939 : p[3] ? 0xffd23b : 0x51de94).toArray());
  const g = new THREE.BufferGeometry().setAttribute("position",new THREE.Float32BufferAttribute(positions,3))
    .setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  const line = new THREE.Line(g, dashed ? new THREE.LineDashedMaterial({dashSize: 1, gapSize: 1,color: 0xdde2e6})
                                       : new THREE.LineBasicMaterial({vertexColors:true}));
  if (dashed) line.computeLineDistances();
  line.renderOrder = 13;
  return line;
}

/** Event and mesh lifetime of a single AI tool activation. Clicks are a draft until the end click succeeds. */
export class Pencil {
  private strokes = new Map<string, Stroke>();
  private draft: {start: Site; id: string; points: number[][]} | null = null;
  private hoverSite: Site | null = null;
  private ghost: THREE.Line | null = null;
  private extension: THREE.Line | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private serial = 0;
  private done = false;
  private finishing = false;
  private stop = new AbortController();

  constructor(private el: HTMLCanvasElement, private scene: THREE.Scene, private camera: THREE.PerspectiveCamera,
    private guide: MoveGuide, private edits: AiCorrection[], private free: boolean, private pen: boolean,
    private url: string, private ground: (mouse: THREE.Vector2) => THREE.Vector3 | null,
    private depth: (mouse: THREE.Vector2) => number, private pick: (e: PointerEvent) => number,
    private add: (item: AiCorrection) => void, private remove: (id: string) => void,
    private note: (why: string) => void, private draw: () => void) {
    if (pen && free && guide.tail?.length) {
      this.extension = stroke(guide.tail, undefined, true);
      scene.add(this.extension);
    }
    window.addEventListener("keydown", e => {
      if (this.draft && e.key === "Escape") {
        e.stopImmediatePropagation(); e.preventDefault(); this.reset(); this.draw();
      }
    }, {capture:true,signal:this.stop.signal});
  }

  private drop(line: THREE.Line | null) {
    if (!line) return;
    this.scene.remove(line); line.geometry.dispose();
    (line.material as THREE.Material).dispose();
  }
  private reset() {
    ++this.serial; clearTimeout(this.timer); this.finishing = false;
    this.drop(this.ghost); this.ghost = null; this.draft = null; this.hoverSite = null;
    this.note(""); this.el.title = "";
  }
  dispose() {
    this.done = true; this.stop.abort(); clearTimeout(this.timer);
    this.drop(this.ghost); this.drop(this.extension);
    for (const s of this.strokes.values()) this.drop(s.line);
  }
  covers(metre: number) {
    for (const s of this.strokes.values()) if (!s.error && metre > s.from && metre <= s.to) return true;
    return !!this.draft && !!this.hoverSite && metre > this.draft.start.row[3] && metre <= this.hoverSite.row[3];
  }
  showSaved(answer: Partial<Checked>) {
    for (const item of this.edits) {
      if (item.kind !== "redraw") continue;
      const why = answer.skipped?.[item.id];
      const points = answer.ink?.[item.id] ?? [
        [item.anchor.context[1][0],item.anchor.level,item.anchor.context[1][1]], ...item.points,
        item.tail ?? [item.end.context[1][0],item.end.level,item.end.context[1][1]]];
      const line = stroke(points,why); this.scene.add(line);
      this.strokes.set(item.id,{line,points,id:item.id,error:why,from:answer.centres?.[item.id] ?? item.anchor.metre,
        to:item.tail ? Infinity : (answer.ends?.[item.id] ?? item.end.metre)});
    }
  }
  private hit(e: PointerEvent, points: number[][]) {
    const mouse = screenPoint(e,this.el), box = this.el.getBoundingClientRect(), depth = this.depth(mouse)+.7;
    const p = new THREE.Vector3(); let best = 64, index = -1;
    for (let i=0; i<points.length; i++) {
      const [x,y,z] = points[i]; p.set(x,y+lift,z);
      if (p.distanceTo(this.camera.position)>depth) continue;
      p.project(this.camera);
      const d = ((mouse.x-p.x)*box.width/2)**2 + ((mouse.y-p.y)*box.height/2)**2;
      if (p.z>=-1 && p.z<=1 && d<best) { best=d; index=i; }
    }
    return index;
  }
  private site(e: PointerEvent): Site | null {
    const i = this.pick(e);
    if (i>=0) return {row:this.guide.rows[i],tail:false};
    if (this.free && this.guide.tail?.length) {
      const j=this.hit(e,this.guide.tail);
      if (j>=0) return {row:this.guide.tail[j],tail:true};
    }
    return null;
  }
  private edit(site: Site): AiRedraw {
    const draft=this.draft!;
    return {kind:"redraw",id:draft.id, free:this.free, anchor:anchor(this.guide,draft.start.row),
      end:anchor(this.guide,site.row), points:draft.points,
      ...(site.tail ? {tail:site.row.slice(0,3)} : {})};
  }
  private preview(points: number[][], why = "") {
    this.drop(this.ghost); this.ghost = stroke(points,why); this.scene.add(this.ghost);
    this.el.title=why; this.note(why); this.draw();
  }
  private async check(site: Site, commit: boolean) {
    const serial=++this.serial, edit=this.edit(site);
    const answer=await post<Checked>(this.url,{aiCorrections:[...this.edits,edit]});
    if (this.done || !this.draft || this.serial!==serial) return;
    this.finishing=false;
    const why=answer.error ?? answer.skipped?.[edit.id] ?? "";
    const points=answer.ink?.[edit.id] ?? [this.draft.start.row.slice(0,3),...edit.points,site.row.slice(0,3)];
    if (commit && !why && answer.ink?.[edit.id]) { this.reset(); this.add(edit); }
    else this.preview(points,why);
  }
  press(e: PointerEvent) {
    if (e.button===2 || e.button===0) for (const s of this.strokes.values()) {
      if (this.hit(e,s.points)<0) continue;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.button===2) this.remove(s.id);
      else this.note(s.error ?? `Overlapping correction at route metre ${s.from.toFixed(1)}`);
      return true;
    }
    if (!this.pen || e.button!==0) return false;
    const site=this.site(e);
    e.preventDefault(); e.stopImmediatePropagation();
    if (this.finishing) return true;
    if (!this.draft) {
      if (site && !site.tail) this.draft={id:crypto.randomUUID(),start:site,points:[]};
    } else if (site) {
      clearTimeout(this.timer);
      if (site.row[3] <= this.draft.start.row[3]) this.hover(e);
      else { this.finishing=true; void this.check(site,true); }
    } else {
      const q=this.ground(screenPoint(e,this.el));
      if (q) { this.draft.points.push(q.toArray()); this.hover(e); }
    }
    return true;
  }
  hover(e: PointerEvent) {
    if (!this.draft) {
      for (const s of this.strokes.values()) if (s.error && this.hit(e,s.points)>=0) {
        this.el.title=s.error; return true;
      }
      return false;
    }
    if (this.finishing) return true;
    ++this.serial; clearTimeout(this.timer);
    const site=this.site(e), start=this.draft.start.row;
    const q=site?.row.slice(0,3) ?? this.ground(screenPoint(e,this.el))?.toArray();
    this.hoverSite=site;
    if (q) {
      const why=site && site.row[3]<=start[3] ? `End precedes the start at route metre ${site.row[3].toFixed(1)}` : "";
      this.preview([start.slice(0,3),...this.draft.points,q],why);
      if (site && !why) this.timer=setTimeout(() => { void this.check(site,false); },80);
    }
    return true;
  }
}
