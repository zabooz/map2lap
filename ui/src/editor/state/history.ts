// The Undo and Redo steps as the server keeps them beside the draft (src/app/trackhistory.py): each step and each object in it by a
// key, so a save sends only what the server does not hold yet. A reload or a server restart then still has them.

/** The parts of a step that are lists of objects, sent by item key (trackhistory.KEYED); the others go as they are. */
const KEYED = ["removed", "heights", "placed", "copies", "models", "surfaces", "trees", "walls", "kerbs", "stitches", "aiCorrections", "aiMargins"] as const;
const PLAIN = ["objectSorts", "paints", "treeSpacing", "carDensity", "aiLine"] as const;
export const HISTORY_BYTES = 10 * 1024 * 1024;   // (trackhistory.MAX_BYTES)

/** A draft at one point, as edits.ts keeps its steps. */
export type Snapshot = {[K in typeof KEYED[number]]: object[]} & {objectSorts: string[]; paints: string[]; treeSpacing?: unknown; carDensity?: unknown; aiLine?: string | null};

type Entry = Record<string, unknown>;

/** What the server is sent of the steps (trackhistory.problem): their order now, and the steps and items it does not hold. */
export interface HistoryChange {past: string[]; future: string[]; entries: Record<string, Entry>; items: Record<string, unknown>}

/** One change made (change) and what confirm takes in once the server kept it. */
export interface Sent {change: HistoryChange}

export class HistoryKeys {
  private keys = new WeakMap<object, string>();
  private next = 0;
  private known = new Set<string>();           // keys the server holds: its steps and the items they name (trackhistory.merged keeps no more)
  private named = new Map<string, string[]>();  // each step's item keys
  private order: string | null = null;          // the order of steps it holds, null: not known

  constructor(private prefix = Math.random().toString(36).slice(2, 6)) {}

  private keyOf(value: object) {
    let key = this.keys.get(value);
    if (key === undefined) { key = this.prefix + (this.next++).toString(36); this.keys.set(value, key); }
    return key;
  }

  private orderOf(past: Snapshot[], future: Snapshot[]) {
    return JSON.stringify([past.map(s => this.keyOf(s)), future.map(s => this.keyOf(s))]);
  }

  /** Whether the server holds these steps in this order. */
  saved(past: Snapshot[], future: Snapshot[]) {
    return this.order === this.orderOf(past, future);
  }

  /** The change that brings the server to these steps. Over limit bytes, only the newest steps that fit go, at least one. */
  change(past: Snapshot[], future: Snapshot[], limit = HISTORY_BYTES): Sent {
    // (as the server, trackhistory.merged: the oldest Undo steps first, down to one, then the farthest Redo steps)
    let from = 0, farthest = 0, sent = this.build(past, future);
    while (JSON.stringify(sent.change).length > limit && (from < past.length - 1 || farthest < future.length)) {
      if (from < past.length - 1) from++;
      else farthest++;
      sent = this.build(past.slice(from), future.slice(farthest));
    }
    return sent;
  }

  private build(past: Snapshot[], future: Snapshot[]): Sent {
    const entries: Record<string, Entry> = {}, items: Record<string, unknown> = {};
    for (const step of [...past, ...future]) {
      const key = this.keyOf(step);
      if (this.known.has(key) || entries[key]) continue;
      const entry: Entry = {};
      for (const part of KEYED) entry[part] = (step[part] ?? []).map(item => {
        const k = this.keyOf(item);
        if (!this.known.has(k)) items[k] = item;
        return k;
      });
      for (const part of PLAIN) entry[part] = step[part] ?? null;
      entries[key] = entry;
      this.named.set(key, KEYED.flatMap(part => entry[part] as string[]));
    }
    const change = {past: past.map(s => this.keyOf(s)), future: future.map(s => this.keyOf(s)), entries, items};
    return {change};
  }

  /** The server kept sent, of its steps the newest past and nearest future (its answer, trackhistory.merged). */
  confirm({change}: Sent, past = change.past.length, future = change.future.length) {
    const steps = [...change.past.slice(change.past.length - past), ...change.future.slice(change.future.length - future)];
    // (as the server: what no step it keeps names is gone there, an item only the draft still holds too)
    this.known = new Set(steps.flatMap(key => [key, ...this.named.get(key) ?? []]));
    this.named = new Map(steps.filter(key => this.named.has(key)).map(key => [key, this.named.get(key)!]));
    this.order = JSON.stringify([change.past.slice(change.past.length - past), change.future.slice(change.future.length - future)]);
  }

  /** The server holds nothing known: all goes again. */
  forget() {
    this.known.clear();
    this.order = null;
  }

  /** The server has no steps: an empty list is what it holds. */
  none() {
    this.order = this.orderOf([], []);
  }

  /** The steps the server handed back (trackhistory.page_form) for the draft current: each step, and current with the items it shares
      with them, the very same objects, so nothing the server holds goes again. */
  restore<T extends Snapshot>(page: Omit<HistoryChange, "entries"> & {entries: Record<string, Entry>}, current: T) {
    const items = new Map<string, object>(), byContent = new Map<string, object>();
    for (const [key, content] of Object.entries(page.items)) {
      const item = content as object;
      items.set(key, item);
      this.keys.set(item, key);
      this.known.add(key);
      byContent.set(JSON.stringify(item), item);
    }
    const step = (key: string) => {
      const entry = page.entries[key], snapshot = {} as Record<string, unknown>;
      for (const part of KEYED) snapshot[part] = ((entry[part] ?? []) as string[]).map(k => items.get(k)!);
      for (const part of PLAIN) snapshot[part] = entry[part] ?? (part === "objectSorts" || part === "paints" ? [] : null);
      const restored = snapshot as T;
      this.keys.set(restored, key);
      this.known.add(key);
      this.named.set(key, KEYED.flatMap(part => (entry[part] ?? []) as string[]));
      return restored;
    };
    const past = page.past.map(step), future = page.future.map(step);
    const shared = {...current} as Record<string, unknown>;
    for (const part of KEYED) shared[part] = current[part].map(item => byContent.get(JSON.stringify(item)) ?? item);
    this.order = this.orderOf(past, future);
    return {past, future, current: shared as T};
  }
}
