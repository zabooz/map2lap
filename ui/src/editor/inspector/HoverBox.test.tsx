import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {HoverBox} from "./HoverBox";
import type {Hovered} from "../types";

const hovered: Hovered = {id: null, kind: "Grass", sprite: null, sort: null, object: "1GRASS_ground_0_0", physics: "Grass", material: "gc_meadow",
  shader: "ksPerPixel", texture: "meadow.dds", textureBytes: 4096, vertices: 900, triangles: 1600, triangle: 12, uv: [0.1, 0.2], shownTo: 3000,
  billboard: null, at: [12.345, 3.2, -40.5], tile: [0, 0], route: null, latLon: null, distance: 80};

const labels = (html: string) => [...html.matchAll(/<dt>([^<]+)<\/dt>/g)].map(m => m[1]);

test("With nothing under the pointer the box keeps its rows, each a dash, so the panel does not jump", () => {
  const empty = renderToStaticMarkup(<HoverBox hovered={null} />), full = renderToStaticMarkup(<HoverBox hovered={hovered} />);
  expect(labels(empty)).toEqual(labels(full));
  expect(empty).toContain("data-empty");
  expect(empty).not.toContain("1GRASS");
  expect(empty).toContain("—");
  expect(full).not.toContain("data-empty");
});

test("A tree under the pointer fills the same rows a meadow has", () => {
  const tree = renderToStaticMarkup(<HoverBox hovered={{...hovered, id: "t#1", sprite: "Oak", billboard: {number: 1, height: 9, width: 4, foot: [1, 2]}}} />);
  expect(labels(tree)).toEqual(labels(renderToStaticMarkup(<HoverBox hovered={hovered} />)));
  expect(tree).toContain("9.0 m");
});
