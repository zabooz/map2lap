import {expect, test} from "bun:test";
import {HistoryKeys, type Snapshot} from "./history";

const NONE: Snapshot = {removed: [], objectSorts: [], heights: [], placed: [], copies: [], paints: [], models: [], surfaces: [], trees: [],
  walls: [], kerbs: [], stitches: [], aiCorrections: [], aiMargins: [], treeSpacing: null, carDensity: null};
const h = (id: string) => ({id, x: 0, z: 0, nx: 1, nz: 1, mm: [1]});

test("a step goes once, by keys; its items once, however many steps hold them", () => {
  const keys = new HistoryKeys("a");
  const a = h("a"), first = {...NONE, heights: [a]}, second = {...NONE, heights: [a, h("b")]};
  const one = keys.change([first], []);
  expect(Object.keys(one.change.items)).toHaveLength(1);
  keys.confirm(one);
  const two = keys.change([first, second], []);
  expect(Object.keys(two.change.entries)).toEqual([two.change.past[1]]);       // (only the new step)
  expect(Object.values(two.change.items)).toEqual([h("b")]);                 // (only its new height change)
  expect(two.change.entries[two.change.past[1]].heights).toEqual([...one.change.entries[one.change.past[0]].heights as string[], expect.any(String)]);
  expect(keys.saved([first, second], [])).toBe(false);
  keys.confirm(two);
  expect(keys.saved([first, second], [])).toBe(true);
  expect(keys.saved([first], [second])).toBe(false);                         // (an Undo: the order changed)
});

test("read back, the steps are what was sent and the draft's items are the very ones the steps hold", () => {
  const sender = new HistoryKeys("a");
  const a = h("a"), sorts = ["bench"], first: Snapshot = {...NONE, heights: [a], objectSorts: sorts}, redo: Snapshot = {...NONE, treeSpacing: {distance: 2, targets: null, hidden: []}};
  const sent = sender.change([first], [redo]);
  const reader = new HistoryKeys("b");
  const draft: Snapshot = {...NONE, heights: [h("a")]};
  const read = reader.restore({past: sent.change.past, future: sent.change.future, entries: sent.change.entries, items: sent.change.items}, draft);
  expect(read.past).toEqual([first]);
  expect(read.future).toEqual([redo]);
  expect(read.current.heights[0]).toBe(read.past[0].heights[0]);
  expect(reader.saved(read.past, read.future)).toBe(true);
  const next = reader.change([...read.past, read.current], []);
  expect(next.change.items).toEqual({});                                     // (nothing the server holds goes again)
});

test("forgotten, all goes again", () => {
  const keys = new HistoryKeys("a"), first = {...NONE, heights: [h("a")]};
  keys.confirm(keys.change([first], []));
  keys.forget();
  expect(Object.keys(keys.change([first], []).change.items)).toHaveLength(1);
});

test("more than the bytes the server keeps sends only the newest steps that fit, the newest however large", () => {
  const keys = new HistoryKeys("a");
  const big = (id: string) => ({...h(id), mm: new Array(400).fill(7)});
  const steps = [{...NONE, heights: [big("a")]}, {...NONE, heights: [big("b")]}, {...NONE, heights: [big("c")]}];
  expect(keys.change(steps, [], 2400).change.past).toHaveLength(2);
  expect(keys.change(steps, [], 10).change.past).toHaveLength(1);
});

test("an item only the draft still holds, gone from the server with the steps that held it, goes again when a step holds it", () => {
  // (place, Undo, Redo, change again: the server keeps only the items its steps name, trackhistory.merged)
  const keys = new HistoryKeys("a");
  const placed = h("tree"), before: Snapshot = {...NONE}, withTree: Snapshot = {...NONE, heights: [placed]};
  keys.confirm(keys.change([before], []));                // (placed)
  keys.confirm(keys.change([], [withTree]));              // (Undo)
  keys.confirm(keys.change([{...NONE}], []));             // (Redo: the tree is the draft's alone now)
  const next = keys.change([{...NONE}, {...NONE, heights: [placed]}], []);
  expect(Object.values(next.change.items)).toEqual([placed]);
});

test("over the bytes with few Undo steps, the farthest Redo steps go too, as on the server", () => {
  const keys = new HistoryKeys("a");
  const big = (id: string) => ({...h(id), mm: new Array(400).fill(7)});
  const step = (id: string): Snapshot => ({...NONE, heights: [big(id)]});
  const sent = keys.change([step("a")], [step("c"), step("b")], 2400).change;
  expect([sent.past.length, sent.future.length]).toEqual([1, 1]);
  expect(Object.values(sent.items)).toEqual([big("a"), big("b")]);
});
