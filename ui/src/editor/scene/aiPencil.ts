import * as THREE from "three";
import {post} from "../../api";
import type {AiAnchor, AiCorrection, AiRedraw} from "../state/edits";
import {at, type Checked, type MoveGuide, type Row} from "./aiGuide";
import {disposeStroke, previewBand, PREVIEW_LIFT, previewColour, PreviewQueue} from "./aiPreviewBand";
import {editorInputBlocked} from "../tools/held";
import {screenPoint} from "./pointer";

import {backPoint, finishStroke, movePoint, openStroke, reconnect, removePoint} from "./redrawEdit";
import {markerSamples, redrawMarkers} from "./redrawMarkers";

type Stroke = {line: ReturnType<typeof stroke>; points: number[][]; from: number; to: number; item: AiRedraw; controls: number[][]; samples: number[]; markers: THREE.Group; basis?:number[][]; error?: string};
type Opening = {stroke: Stroke; gap: ReturnType<typeof openStroke>; rest: number};
type Drag = {stroke: Stroke; marker: number; pointer: number; target?: number[]};
type Site = {row: Row; tail: boolean};
const lift = PREVIEW_LIFT;

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
  const colors = points.flatMap(p => (error ? new THREE.Color(0xff3939) : previewColour(p[3])).toArray());
  const g = new THREE.BufferGeometry().setAttribute("position",new THREE.Float32BufferAttribute(positions,3))
    .setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  const line = new THREE.Line(g, dashed ? new THREE.LineDashedMaterial({dashSize: 1, gapSize: 1,color: 0xdde2e6})
                                       : new THREE.LineBasicMaterial({vertexColors:true}));
  if (dashed) line.computeLineDistances();
  const band = !dashed && !error && points.length > 1 && points.every(p => p.length === 10) ? previewBand(points) : null;
  if (band) line.add(band);
  line.renderOrder = 13;
  return Object.assign(line, {bandEnds:band?.ends ?? []});
}

/** Event and mesh lifetime of a single AI tool activation. Clicks are a draft until the end click succeeds. */
export class Pencil {
  private strokes = new Map<string, Stroke>();
  private draft: {start: Site; id: string; points: number[][]} | null = null;
  private opening: Opening | null = null;
  private drag: Drag | null = null;
  private remainder: THREE.Group | null = null;
  private hoverSite: Site | null = null;
  private ghost: ReturnType<typeof stroke> | null = null;
  private ghostEdges: number[][] = [];
  private extension: THREE.Line | null = null;
  private queue = new PreviewQueue();
  private serial = 0;
  private done = false;
  private finishing = false;
  private measuring = false;
  private pen = false;
  private free = true;
  private stop = new AbortController();

  constructor(private el: HTMLCanvasElement, private scene: THREE.Scene, private camera: THREE.PerspectiveCamera,
    private guide: MoveGuide, private edits: AiCorrection[],
    private url: string, private ground: (mouse: THREE.Vector2) => THREE.Vector3 | null,
    private depth: (mouse: THREE.Vector2) => number, private pick: (e: PointerEvent) => number,
    private add: (item: AiCorrection) => void, private remove: (id: string) => void,
    private note: (why: string) => void, private hint: (text: string) => void, private draw: () => void) {
    window.addEventListener("keydown", e => {
      if ((this.draft || this.drag) && e.key === "Escape" && !editorInputBlocked(e.target) && this.el.checkVisibility()) {
        e.stopImmediatePropagation(); e.preventDefault(); this.reset(); this.draw();
      }
    }, {capture:true,signal:this.stop.signal});
  }

  get engaged() { return !!this.draft || !!this.drag || this.finishing; }

  setMode(pen: boolean, free: boolean) {
    if (this.pen === pen && this.free === free) return;
    if (this.draft || this.drag) this.reset();
    this.pen = pen; this.free = free;
    for (const s of this.strokes.values()) s.markers.visible = pen;
    this.drop(this.extension); this.extension = null;
    if (pen && this.guide.tail?.length) {
      this.extension = stroke(this.guide.tail, undefined, true);
      this.scene.add(this.extension); this.extension.visible = free;
    }
  }
  private drop(line: THREE.Line | null) {
    if (!line) return;
    disposeStroke(line);
  }
  private reset() {
    if (this.drag && this.el.hasPointerCapture(this.drag.pointer)) this.el.releasePointerCapture(this.drag.pointer);
    const saved = this.opening?.stroke ?? this.drag?.stroke;
    if (saved) { saved.line.visible = true; saved.markers.visible = this.pen; }
    if (this.remainder) disposeStroke(this.remainder);
    this.opening = null; this.remainder = null; this.drag = null;
    if (this.extension) this.extension.visible = this.pen && this.free;
    ++this.serial; this.queue.clear(); this.finishing = this.measuring = false;
    this.drop(this.ghost); this.ghost = null; this.ghostEdges = []; this.draft = null; this.hoverSite = null;
    this.note(""); this.el.title = "";
  }
  dispose() {
    this.reset();
    this.done = true; this.stop.abort(); this.drop(this.extension);
    for (const s of this.strokes.values()) { this.drop(s.line); disposeStroke(s.markers); }
  }
  bandSpans() {
    const spans = [...this.strokes.values()].filter(s => s.line.visible && !s.error && s.line.bandEnds.length)
      .map(s => s.line.bandEnds);
    if (this.ghostEdges.length) spans.push(this.ghostEdges);
    return spans;
  }
  covers(metre: number) {
    for (const s of this.strokes.values()) if (s.line.visible && !s.error && metre > s.from && metre <= s.to) return true;
    return !!this.draft && !!this.hoverSite && metre > this.draft.start.row[3] && metre <= this.hoverSite.row[3];
  }
  showSaved(answer: Partial<Checked>) {
    for (const item of this.edits) {
      if (item.kind !== "redraw") continue;
      const why = answer.skipped?.[item.id];
      const controls = answer.controls?.[item.id];
      if (!controls) continue;
      const points = answer.ink?.[item.id] ?? controls;
      const markers = redrawMarkers(controls);
      this.scene.add(markers); markers.visible = this.pen;
      const line = stroke(points,why); this.scene.add(line);
      this.strokes.set(item.id,{line,points,item,controls,markers,samples:markerSamples(controls,points),basis:answer.toStored?.[item.id],error:why,from:answer.centres?.[item.id] ?? item.anchor.metre,
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
    if ((this.opening?.stroke.item.free ?? this.free) && this.guide.tail?.length) {
      const j=this.hit(e,this.guide.tail);
      if (j>=0) return {row:this.guide.tail[j],tail:true};
    }
    return null;
  }
  /** Convert one new ground hit to the original anchor frame, keeping untouched recipe points exact. */
  private stored(s: Stroke, q: number[]) {
    const b = s.basis;
    return b ? b[0].map((v,i) => v + q[0]*b[1][i] + q[1]*b[2][i] + q[2]*b[3][i]) : q;
  }
  private edit(site: Site, clicks = this.draft!.points): AiRedraw {
    const draft=this.draft!, end=anchor(this.guide,site.row), tail=site.tail ? site.row.slice(0,3) : undefined;
    if (this.opening) {
      const {gap,stroke} = this.opening;
      return finishStroke(gap,clicks.map(q => this.stored(stroke,q)),end,tail && this.stored(stroke,tail));
    }
    return {kind:"redraw",id:draft.id, free:this.free, anchor:anchor(this.guide,draft.start.row),
      end, points:clicks, ...(tail ? {tail} : {})};
  }
  private preview(points: number[][], why = "") {
    this.drop(this.ghost); this.ghost = stroke(points,why); this.scene.add(this.ghost);
    this.ghostEdges = this.ghost.bandEnds;
    this.el.title=why; this.note(why); this.draw();
  }
  private async check(edit: AiRedraw, fallback: number[][], commit: boolean) {
    const serial = ++this.serial, gesture = this.drag ?? this.draft;
    const answer = await post<Checked>(this.url,{aiCorrections:[...this.edits.filter(c => c.id !== edit.id),edit]});
    // Keep measured bands arriving during continuous pointer motion. After release or
    // a local error, only the final position of that same gesture may update the scene.
    if (this.done || gesture !== (this.drag ?? this.draft)) return;
    if (serial !== this.serial && (commit || !this.measuring)) return;
    this.finishing = false;
    const why = answer.error || answer.skipped?.[edit.id] || "";
    if (commit && !why && answer.ink?.[edit.id]) { this.reset(); this.add(edit); }
    else if (commit && this.drag) { this.reset(); this.note(why); this.draw(); }
    else this.preview(answer.ink?.[edit.id] ?? fallback,why);
  }
  private validate(edit: AiRedraw, fallback: number[][], commit: boolean) {
    ++this.serial; this.queue.clear(); this.finishing = commit; this.measuring = !commit;
    this.queue.put(() => this.check(edit,fallback,commit));
  }
  private prefix() {
    return this.opening ? this.opening.stroke.controls.slice(0,this.opening.gap.after+1) : [this.draft!.start.row.slice(0,3)];
  }
  private beginOpening(s: Stroke, after: number) {
    const row = this.guide.rows.reduce((a,b) => Math.abs(b[3]-s.from)<Math.abs(a[3]-s.from) ? b : a);
    this.draft = {start:{row,tail:false},id:s.item.id,points:[]};
    this.opening = {stroke:s,gap:openStroke(s.item,after),rest:after+1};
    this.remainder = redrawMarkers(s.controls.slice(after+1));
    this.remainder.add(stroke(s.points.slice(s.samples[after+1]),s.error));
    this.scene.add(this.remainder);
    s.line.visible = s.markers.visible = false;
    if (this.extension) this.extension.visible = s.item.free;
    this.preview(this.prefix(), s.error);
    this.hint("Click the ground to add points, then click a remaining marker or the AI line ahead to finish.");
  }
  /** Pick a piece of the sampled curve, including the space between projected samples. */
  private segment(e: PointerEvent, s: Stroke) {
    const mouse = screenPoint(e,this.el), box=this.el.getBoundingClientRect(), limit=this.depth(mouse)+.7;
    const p = new THREE.Vector3();
    let best = 8**2, segment = -1, last: {x:number;y:number;depth:number} | null = null;
    for (let i=0; i<s.points.length; i++) {
      const [x,y,z] = s.points[i]; p.set(x,y+lift,z);
      const depth = p.distanceTo(this.camera.position);
      p.project(this.camera);
      if (p.z < -1 || p.z > 1) { last=null; continue; }
      const px=(p.x-mouse.x)*box.width/2, py=(p.y-mouse.y)*box.height/2;
      if (last) {
        const dx=px-last.x, dy=py-last.y;
        const t=THREE.MathUtils.clamp(-(last.x*dx+last.y*dy)/(dx*dx+dy*dy || 1),0,1);
        const d=(last.x+t*dx)**2+(last.y+t*dy)**2;
        if (d<best && last.depth+t*(depth-last.depth)<=limit) { best=d; segment=i-1; }
      }
      last={x:px,y:py,depth};
    }
    return segment;
  }
  private savedPress(e: PointerEvent) {
    for (const s of this.strokes.values()) {
      if (this.pen) {
        const marker = this.hit(e,s.controls);
        if (marker>=0) {
          const endpoint = marker===0 || marker===s.controls.length-1;
          if (e.button===2) {
            if (endpoint) this.remove(s.item.id);
            else this.add(removePoint(s.item,marker));
          } else if (!endpoint) {
            this.drag = {stroke:s,marker,pointer:e.pointerId};
            this.el.setPointerCapture(e.pointerId);
          } else if (s.error) this.note(s.error);
          else this.hint("Click the line between markers to edit this stroke.");
          return true;
        }
      }
      const sample = this.pen ? this.segment(e,s) : this.hit(e,s.points);
      if (sample<0) continue;
      if (this.pen) this.beginOpening(s,s.samples.findIndex(index => index>sample)-1);
      else if (e.button===2) this.remove(s.item.id);
      else if (s.error) this.note(s.error);
      else this.hint("Press 2 to edit this redraw.");
      return true;
    }
    return false;
  }
  private back(e: PointerEvent) {
    const draft = this.draft!, remaining = backPoint(draft.points);
    if (remaining) draft.points = remaining;
    else if (this.opening && this.opening.gap.after>0)
      this.opening.gap = openStroke(this.opening.stroke.item,this.opening.gap.after-1);
    else { this.reset(); this.draw(); return; }
    this.hover(e);
  }
  press(e: PointerEvent) {
    if (e.button!==0 && e.button!==2) return false;
    if (!this.finishing && !this.drag && (this.draft || !this.savedPress(e))) {
      if (!this.pen) return false;
      if (e.button===2) { if (this.draft) this.back(e); }
      else if (!this.draft) {
        const site=this.site(e);
        if (site && !site.tail) this.draft={id:crypto.randomUUID(),start:site,points:[]};
      } else this.follow(e,true);
    }
    e.preventDefault(); e.stopImmediatePropagation();
    return true;
  }
  private dragPoint(q: number[], commit: boolean) {
    const {stroke:s,marker} = this.drag!;
    const controls=s.controls.map((p,i) => i===marker ? q : p);
    s.line.visible = s.markers.visible = false;
    if (!this.ghost) this.preview(controls);
    this.validate(movePoint(s.item,marker,this.stored(s,q)),controls,commit);
  }
  release(e: PointerEvent) {
    if (!this.drag || this.drag.pointer!==e.pointerId || e.button!==0) return false;
    if (this.el.hasPointerCapture(e.pointerId)) this.el.releasePointerCapture(e.pointerId);
    const q = this.ground(screenPoint(e,this.el))?.toArray();
    if (this.drag.target && q) this.dragPoint(q,true);
    else {
      const message = this.drag.stroke.error;
      this.reset();
      if (message) this.note(message);
      else this.hint("Drag this point to reshape the stroke.");
      this.draw();
    }
    return true;
  }
  cancelDrag() { if (this.drag) { this.reset(); this.draw(); } }
  hover(e: PointerEvent) {
    if (this.finishing) return true;
    if (this.drag) {
      const q=this.ground(screenPoint(e,this.el))?.toArray();
      if (q) { this.drag.target=q; this.dragPoint(q,false); }
      return true;
    }
    if (this.draft) { this.follow(e,false); return true; }
    for (const s of this.strokes.values()) if (s.error && this.hit(e,s.points)>=0) {
      this.el.title=s.error; return true;
    }
    return false;
  }
  private follow(e: PointerEvent, click: boolean) {
    ++this.serial; this.queue.clear(); this.measuring = false;
    const draft=this.draft!, opening=this.opening;
    const prefix=[...this.prefix(),...draft.points];
    if (opening) {
      const {stroke:s,gap,rest}=opening;
      const hit=this.hit(e,s.controls.slice(rest));
      if (hit>=0) {
        const marker=rest+hit;
        this.validate(reconnect(gap,draft.points.map(q => this.stored(s,q)),marker),
          [...prefix,...s.controls.slice(marker)],click);
        return;
      }
    }
    const site=this.site(e), start=draft.start.row;
    const q=site?.row.slice(0,3) ?? this.ground(screenPoint(e,this.el))?.toArray();
    this.hoverSite=site;
    if (!q) return;
    if (click && !site) { draft.points.push(q); this.follow(e,false); return; }
    const points=[...prefix,q];
    const startMetre=opening ? opening.stroke.from : start[3];
    if (site && site.row[3]<=startMetre) {
      this.preview(points,`End precedes the start at route metre ${site.row[3].toFixed(1)}`); return;
    }
    let end = site;
    if (!end) {
      let nearest=start, best=Infinity;
      for (const row of this.guide.rows) {
        const d=(row[0]-q[0])**2+(row[1]-q[1])**2+(row[2]-q[2])**2;
        if (d<best) { nearest=row; best=d; }
      }
      const row: Row = [...nearest];
      [row[0],row[1],row[2]]=q;
      end={row,tail:false};
    }
    if (!this.ghost || end.row[3]<=startMetre) this.preview(points);
    if (end.row[3]<=startMetre) return;
    const last=draft.points.at(-1);
    // A click and its immediate hover represent one ground point in a provisional curve.
    const clicks=!site && last && Math.hypot(last[0]-q[0],last[2]-q[2])<.01 ? draft.points.slice(0,-1) : draft.points;
    this.validate(this.edit(end,clicks),points,click);
  }
}
