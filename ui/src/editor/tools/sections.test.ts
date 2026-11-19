import {expect, test} from "bun:test";
import {SECTION_TEXT, showSection, type Section} from "./sections";
import type {SurfaceSelection} from "../scene/surfaces";

const found: Section = {kind: "sidewalk", selection: {} as SurfaceSelection, cuts: [{mesh: "nocol_walk_0_0", faces: [[0, 1]]}], objects: []};

test("a shown section says so once its highlight is drawn", async () => {
  const notes: string[] = [];
  await showSection(found, {current: () => true, select: () => {}, highlight: async () => {}, note: text => notes.push(text)});
  expect(notes).toEqual([SECTION_TEXT.sidewalk.selected]);
});

test("a pick that takes over while the highlight is drawn keeps the old section's note away", async () => {
  const notes: string[] = [];
  let current = true;
  await showSection(found, {current: () => current, select: () => {},
    highlight: async () => { current = false; }, note: text => notes.push(text)});
  expect(notes).toEqual([]);
});

test("a failed highlight says why, while the pick is still current", async () => {
  const notes: string[] = [];
  await showSection(found, {current: () => true, select: () => {}, highlight: async () => { throw new Error("no texture"); },
    note: text => notes.push(text)});
  expect(notes).toEqual(["Error: no texture", SECTION_TEXT.sidewalk.selected]);
});
