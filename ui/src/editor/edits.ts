// What was changed on a track in the Editor, with undo, kept on the server a moment after each change (src/app/trackedits.py).
// No three.js, no React: the view and the toolbar each read it.
import {isUnplaced, type Placement} from "./placing";
import {copyKeys, type ObjectCopy} from "./copying";

export interface Removed {
  id: string;
  position: [number, number, number];
}

/** waiting: changed, to be saved in a moment. failed: tried again by itself. stuck: only a reload helps (another tab or a
    build changed it, or it can't be read). */
export type SaveState = "loading" | "saved" | "waiting" | "saving" | "failed" | "stuck";

/** What the track's last Save was made of (its recipe, src/app/trackcopy.py), while it counts. */
export interface Recipe {
  at: number;                   // (Unix time)
  deleted: string[];
  sorts: string[];
  objectSorts: string[];
  heights: string[];            // (the height changes' ids)
  placed: Placement[];
  copies?: ObjectCopy[];
}

/** A change of the ground's height, a raster of whole mm (src/app/trackheights.py). The server makes it: it isn't looked into here. */
export interface HeightChange {
  id: string;
  x: number;
  z: number;
  nx: number;
  nz: number;
  mm: number[];
}

export interface EditState {
  removed: Removed[];
  sorts: string[];              // whole sorts of trees and bushes left out: a rule, a long track's trees wouldn't fit a list of ids
  objectSorts: string[];        // whole sorts of listed objects left out (all parked cars, all benches), the same way
  heights: HeightChange[];
  placed: Placement[];          // single objects placed anew (src/app/placement.py), each once
  copies: ObjectCopy[];
  keptRevision: number;         // the list's revision on the server: a new one, what is reckoned from it holds no more
  recipe: Recipe | null;        // null: never saved, or built again since
  canUndo: boolean;
  canRedo: boolean;
  save: SaveState;
  outdated: number;             // changes kept from an older build of the track, not applied
  error: string | null;
}

const SAVE_AFTER_MS = 400;      // the changes of a quick series go in one save, a reload right after loses next to nothing
const RETRY_MS = 5000;
const HISTORY = 200;            // undo steps kept
const KEEPALIVE_BYTES = 60000;  // (what a browser still sends while a page closes)
const MAX_UNANSWERED = 64;      // (trackedits.MAX_UNANSWERED)
const JOIN_MS = 1000;           // notches of the wheel on the same thing this near each other are one step to undo: a turn by 90 degrees isn't 18
const CHANGED_ELSEWHERE = "This track was changed elsewhere: another tab or a build.";
const TRACK_CHANGED = "This track was built again: the view shows the build before.";

type Send = (url: string, options?: RequestInit) => Promise<Response>;

type Edits = Pick<EditState, "removed" | "sorts" | "objectSorts" | "heights" | "placed" | "copies">;
const NONE: Edits = {removed: [], sorts: [], objectSorts: [], heights: [], placed: [], copies: []};

const same = (a: Iterable<string>, b: Iterable<string>) => {
  const x = new Set(a), y = new Set(b);
  return x.size === y.size && [...x].every(v => y.has(v));
};

/** Placements by all they hold. Pure. */
const placedKeys = (placed: Placement[]) => placed.map(p => [p.id, p.x, p.y, p.z, p.turn, p.scale].join(" "));

/** Whether the track is as these edits say: saved, and nothing changed since. Pure. */
export function isCurrent(state: EditState) {
  const r = state.recipe;
  return !!r && same(state.removed.map(d => d.id), r.deleted) && same(state.sorts, r.sorts) && same(state.objectSorts, r.objectSorts)
    && same(state.heights.map(h => h.id), r.heights) && same(placedKeys(state.placed), placedKeys(r.placed))
    && same(copyKeys(state.copies), copyKeys(r.copies ?? []));
}

/** Undo and redo of a track saved as a copy, for the copy's edits to take over (handOver). */
let handed: {name: string; edits: Edits; past: Edits[]; future: Edits[]} | null = null;

const sameEdits = (a: Edits, b: Edits) =>
  same(a.removed.map(d => d.id), b.removed.map(d => d.id)) && same(a.sorts, b.sorts) && same(a.objectSorts, b.objectSorts)
  && same(a.heights.map(h => h.id), b.heights.map(h => h.id)) && same(placedKeys(a.placed), placedKeys(b.placed)) && same(copyKeys(a.copies), copyKeys(b.copies));

/** The edits of the track name. start() reads them, stop() saves what is left; subscribe and state as useSyncExternalStore wants
    them. bind() says which state of the track file the view shows: the numbers in a list only mean anything for one, so nothing can
    be changed while the two differ. */
export class TrackEdits {
  private now: EditState = {...NONE, keptRevision: 0, recipe: null, canUndo: false, canRedo: false, save: "loading", outdated: 0, error: null};
  private onMeshes: (meshes: number[], revision: number) => void = () => {};
  private turns: Promise<unknown> = Promise.resolve();
  private past: Edits[] = [];
  private future: Edits[] = [];
  private base: string | null = null;       // the state of the file the server's list is of
  private bound: string | null = null;      // the state of the file the view shows
  private revision = 0;
  private onServer: Edits | null = this.now;    // what the server holds (null: to be sent whatever it says)
  private timer: ReturnType<typeof setTimeout> | undefined;
  private sending = false;
  private stopped = false;
  private held = false;         // (the track is being written from these edits: hold)
  private asked = 0;            // a new number: what an older read still answers is dropped
  private sent = 0;             // the saves sent so far, and of them the last one answered
  private answered = 0;
  private unanswered: {id: string; number: number}[] = [];      // saves without an answer: one may have reached the file
  private joining: {key: string; at: number} | null = null;     // the last change, if one the next of its key joins (place)
  private listeners = new Set<() => void>();
  private url: string;
  private send: Send;

  private name: string;

  constructor(name: string, send: Send = (url, options) => fetch(url, options)) {
    this.name = name;
    this.url = `/api/editor/${encodeURIComponent(name)}/edits`;
    this.send = send;
  }

  /** The track was saved as these edits say. */
  markSaved() {
    const e = this.edits();
    this.set({recipe: {at: Date.now() / 1000, deleted: e.removed.map(d => d.id), sorts: e.sorts, objectSorts: e.objectSorts,
                       heights: e.heights.map(h => h.id), placed: e.placed, copies: e.copies}});
  }

  /** action once all before it are done. Strokes on their way to the server go on in the order they were made, and what comes after
      one waits for it: an undo takes back the stroke just made, a Save writes it, however late its answer comes. */
  inTurn(action: () => unknown) {
    this.turns = this.turns.then(action).catch(() => {});
    return this.turns;
  }

  /** Done when all that is in turn now is: from outside a turn only, a turn waiting for this would wait for itself. */
  settled() {
    return this.turns;
  }

  /** The state of the track file the view shows, null: none yet. */
  boundRevision() {
    return this.bound;
  }

  /** onMeshes gets each answer's meshes the server now hands out otherwise, and the revision of its list. Not state: two answers in a row must both arrive. */
  setOnMeshes(onMeshes: (meshes: number[], revision: number) => void) {
    this.onMeshes = onMeshes;
  }

  /** The track was saved as the copy name: its edits, read anew, take over undo and redo if they are these. */
  handOver(name: string) {
    handed = {name, edits: this.edits(), past: this.past, future: this.future};
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  state = () => this.now;

  private set(change: Partial<EditState>) {
    this.now = {...this.now, ...change};
    for (const listener of this.listeners) listener();
  }

  /** Whether changes can be made now. */
  canEdit() {
    return !this.held && !["loading", "stuck"].includes(this.now.save) && !this.now.outdated && this.bound === this.base && this.bound !== null;
  }

  /** While on, nothing changes: the track is being written from these edits, and "saved" is to mean these. */
  hold(on: boolean) {
    this.held = on;
    this.set({});
  }

  /** The view now shows this state of the track file (null: none yet). */
  bind(revision: string | null) {
    this.bound = revision;
    this.compare();
  }

  /** Whether the view must load the track again to fit the list. */
  viewBehind() {
    return this.base !== null && this.bound !== null && this.base !== this.bound;
  }

  private compare() {
    if (this.now.save === "loading") return;
    if (this.viewBehind()) this.set({save: "stuck", error: TRACK_CHANGED});
    else if (this.now.error === TRACK_CHANGED) this.set({save: "saved", error: null});
    else this.set({});
  }

  async start() {
    this.stopped = false;
    const asked = ++this.asked;
    clearTimeout(this.timer);
    this.set({save: "loading", error: null});
    try {
      const r = await this.send(this.url);
      const d = await r.json();
      if (asked !== this.asked) return;
      if (!r.ok) throw new Error(d.error ?? `${r.status}`);
      this.base = d.base;
      this.revision = d.revision;
      const edits = {removed: d.deleted as Removed[], sorts: (d.sorts ?? []) as string[], objectSorts: (d.object_sorts ?? []) as string[],
                     heights: (d.heights ?? []) as HeightChange[], placed: (d.placed ?? []) as Placement[], copies: (d.copies ?? []) as ObjectCopy[]};
      const taken = handed?.name === this.name && sameEdits(handed.edits, edits) ? handed : null;
      handed = null;
      this.past = taken?.past ?? [];
      this.future = taken?.future ?? [];
      this.onServer = edits;
      this.unanswered = [];
      const s = d.saved;
      const recipe = s ? {at: s.at, deleted: s.deleted, sorts: s.sorts, objectSorts: s.object_sorts, heights: s.heights ?? [], placed: s.placed ?? [], copies: s.copies ?? []} : null;
      this.set({...edits, keptRevision: d.revision, recipe, canUndo: this.past.length > 0, canRedo: this.future.length > 0, outdated: d.outdated, save: "saved"});
      this.compare();
    } catch (e) {
      if (asked === this.asked) this.set({save: "stuck", error: (e as Error).message});
    }
  }

  stop() {
    this.stopped = true;
    this.asked++;
    this.saveNow(true);
  }

  /** The revision on the server once the list as it is lies there, null if it can't get there now. */
  async saved() {
    while (!this.isSaved() && !["stuck", "failed"].includes(this.now.save)) await new Promise(ok => setTimeout(ok, 50));
    return this.isSaved() ? this.revision : null;
  }

  /** The list as it is goes to the server now, if it isn't there. leaving: the page closes: the request has to outlive it, and it
      can't wait for the answer to one under way. */
  saveNow(leaving = false) {
    clearTimeout(this.timer);
    void this.flush(leaving);
  }

  remove(items: Removed[]) {
    const have = new Set(this.now.removed.map(r => r.id));
    this.change({...this.edits(), removed: [...this.now.removed, ...items.filter(r => !have.has(r.id))]});
  }

  /** Explicit objects and any whole sorts selected together are one delete and one undo. */
  removeSelected(items: Removed[], groups: {tree: boolean; sort: string}[]) {
    const have = new Set(this.now.removed.map(r => r.id));
    this.change({...this.edits(), removed: [...this.now.removed, ...items.filter(r => !have.has(r.id))],
      sorts: [...new Set([...this.now.sorts, ...groups.filter(g => g.tree).map(g => g.sort)])],
      objectSorts: [...new Set([...this.now.objectSorts, ...groups.filter(g => !g.tree).map(g => g.sort)])]});
  }

  /** All trees or bushes of a sort, wherever they stand. */
  removeSort(sprite: string) {
    if (!this.now.sorts.includes(sprite)) this.change({...this.edits(), sorts: [...this.now.sorts, sprite]});
  }

  /** All listed objects of a sort (track/objectlist.py), wherever they stand. */
  removeObjectSort(sort: string) {
    if (!this.now.objectSorts.includes(sort)) this.change({...this.edits(), objectSorts: [...this.now.objectSorts, sort]});
  }

  /** A stroke of the brush, as the server made it. */
  addHeight(change: HeightChange) {
    this.change({...this.edits(), heights: [...this.now.heights, change]});
  }

  /** A new instance, as one undoable step; its source remains ready for the next click. */
  addCopy(copy: ObjectCopy) {
    this.change({...this.edits(), copies: [...this.now.copies, copy]});
  }

  /** Objects placed anew, each instead of how it was placed before; one placed as built is left out. join: a key, the change goes with the
      last one into one step to undo if that had the same key and came a moment ago (the notches of a wheel). */
  place(items: Placement[], join?: string) {
    const ids = new Set(items.map(p => p.id)), now = performance.now();
    const placed = [...this.now.placed.filter(p => !ids.has(p.id)), ...items.filter(p => !isUnplaced(p))];
    if (!!join && this.joining?.key === join && now - this.joining.at < JOIN_MS && this.past.length > 0 && this.canEdit()) this.past.pop();
    this.change({...this.edits(), placed}, join ? {key: join, at: now} : null);
  }

  /** How the object id is placed now, undefined: as built. */
  placementOf(id: string) {
    return this.now.placed.find(p => p.id === id);
  }

  /** Whether anything is changed. */
  changed() {
    return this.now.removed.length > 0 || this.now.sorts.length > 0 || this.now.objectSorts.length > 0 || this.now.heights.length > 0
      || this.now.placed.length > 0 || this.now.copies.length > 0;
  }

  /** All changes taken back, as one step that can be undone. */
  discard() {
    if (this.changed()) this.change(NONE);
  }

  private edits(): Edits {
    return {removed: this.now.removed, sorts: this.now.sorts, objectSorts: this.now.objectSorts, heights: this.now.heights, placed: this.now.placed, copies: this.now.copies};
  }

  /** The changes kept from an older build are given up. */
  discardOutdated() {
    this.onServer = null;
    this.set({outdated: 0, ...NONE});
    this.saveNow();
  }

  undo() {
    if (!this.canEdit()) return;
    this.joining = null;
    const last = this.past.pop();
    if (!last) return;
    this.future.push(this.edits());
    this.apply(last);
  }

  redo() {
    if (!this.canEdit()) return;
    this.joining = null;
    const next = this.future.pop();
    if (!next) return;
    this.past.push(this.edits());
    this.apply(next);
  }

  private change(edits: Edits, joining: {key: string; at: number} | null = null) {
    if (!this.canEdit()) return;
    this.joining = joining;
    this.past.push(this.edits());
    if (this.past.length > HISTORY) this.past.shift();
    this.future = [];
    this.apply(edits);
  }

  private apply(edits: Edits) {
    // (a height change or a placement at once: the view shows it by what the server hands out, deleting is shown here and can wait for more)
    const after = edits.heights === this.now.heights && edits.placed === this.now.placed && edits.copies === this.now.copies ? SAVE_AFTER_MS : 0;
    this.set({...edits, canUndo: this.past.length > 0, canRedo: this.future.length > 0, save: "waiting", error: null});
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), after);
  }

  private isSaved() {
    return this.now.removed === this.onServer?.removed && this.now.sorts === this.onServer?.sorts
      && this.now.objectSorts === this.onServer?.objectSorts && this.now.heights === this.onServer?.heights && this.now.placed === this.onServer?.placed && this.now.copies === this.onServer?.copies;
  }

  private async flush(leaving = false) {
    // (one save at a time, each from the answer of the one before: a late answer can't undo a newer list. Only a page closing can't
    // wait: its save goes along, naming the one under way as unanswered.)
    if (this.isSaved() && !this.sending && ["waiting", "failed"].includes(this.now.save)) {
      return this.set({save: "saved", error: null});    // (undone before it went out: what the server holds already)
    }
    if ((this.sending && !leaving) || this.now.save === "stuck" || this.isSaved() || this.bound === null) return;
    const edits = this.edits(), number = ++this.sent, id = `${Date.now()}-${number}-${Math.random().toString(36).slice(2, 10)}`;
    const body = JSON.stringify({base: this.bound, revision: this.revision, deleted: edits.removed, sorts: edits.sorts,
                                 object_sorts: edits.objectSorts, heights: edits.heights, placed: edits.placed, copies: edits.copies, id, unanswered: this.unanswered.map(u => u.id)});
    this.unanswered = [...this.unanswered, {id, number}].slice(-MAX_UNANSWERED);
    this.sending = true;
    this.set({save: "saving"});
    try {
      const r = await this.send(this.url, {method: "PUT", headers: {"Content-Type": "application/json"}, body,
                                           keepalive: leaving && body.length < KEEPALIVE_BYTES});
      const d = await r.json().catch(() => ({}));
      if (number >= this.sent) this.sending = false;
      if (number < this.answered) return;       // (a newer save got through already)
      if ([400, 404, 409, 413].includes(r.status)) {
        // (409: another tab or a build. 400, 404, 413: the same request can't ever go through, trying again helps nothing.)
        this.sending = false;
        return this.set({save: "stuck", error: r.status === 409 ? CHANGED_ELSEWHERE : (d.error ?? `${r.status}`)});
      }
      if (!r.ok) throw new Error(d.error ?? `${r.status}`);
      this.answered = number;
      this.revision = d.revision;
      this.onServer = edits;
      this.unanswered = this.unanswered.filter(u => u.number > number);
      this.onMeshes(d.meshes ?? [], d.revision);
      this.set({keptRevision: d.revision});
      if (!this.isSaved()) return void this.flush(leaving);
      if (!this.sending) this.set({save: "saved", error: null});
    } catch (e) {
      if (number >= this.sent) this.sending = false;
      this.set({save: "failed", error: (e as Error).message});
      if (!this.stopped) this.timer = setTimeout(() => void this.flush(), RETRY_MS);
    }
  }
}
