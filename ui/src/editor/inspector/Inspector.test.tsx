import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {AppearanceCard, SelectionFacts} from "./Inspector";
import type {Hovered} from "../types";

test("Appearance shows the applied texture and scale, with technical source names kept out", () => {
  const html = renderToStaticMarkup(<AppearanceCard info={{name: "Fine asphalt", preview: "/retained-photo.png",
    repeat: [2, 3], variation: true, original: false, mixed: false}} onEdit={() => {}} />);
  expect(html).toContain("Fine asphalt");
  expect(html).toContain("/retained-photo.png");
  expect(html).toContain("2 × 3 m");
  expect(html).not.toContain("Shader");
  expect(html).not.toContain("Change material");
});

test("Appearance says Original once and offers to change the texture where it can be", () => {
  const info = {name: "Original ground", preview: "/thumbnail.png", repeat: null, variation: false, original: true, mixed: false};
  const html = renderToStaticMarkup(<AppearanceCard info={info} onEdit={() => {}} />);
  expect(html.match(/Original/g)).toHaveLength(1);
  expect(html).toContain("Change texture…");
  expect(renderToStaticMarkup(<AppearanceCard info={info} onEdit={null} />)).not.toContain("Change texture");
});

const hovered: Hovered = {id: null, kind: "Grass", sprite: null, sort: null, object: "1GRASS_ground_0_0", physics: "Grass", material: "gc_meadow",
  shader: "ksPerPixel", texture: "meadow.dds", textureBytes: 4096, vertices: 900, triangles: 1600, triangle: 12, uv: [0.1, 0.2], shownTo: 3000,
  billboard: null, at: [12.345, 3.2, -40.5], tile: [0, 0], route: {metre: 1234.4, off: 2.13}, latLon: [47.1, 11.2], distance: 80};

test("The selection's facts are a short list: mesh, physics and where it is on the route", () => {
  const html = renderToStaticMarkup(<SelectionFacts hovered={hovered} />);
  expect(html).toContain("1GRASS_ground_0_0");
  expect(html).toContain("Grass");
  expect(html).toContain("1234 m, 2.1 m off");
  expect(html).not.toContain("Shader");
  expect(html).not.toContain("Triangle");
  const off = renderToStaticMarkup(<SelectionFacts hovered={{...hovered, route: null}} />);
  expect(off).toContain("12.35, 3.20, -40.50");
});

test("An object's facts name its type and size", () => {
  const html = renderToStaticMarkup(<SelectionFacts hovered={{...hovered, id: "trees#4", kind: "Tree", sort: null, sprite: "Oak",
    billboard: {number: 4, height: 12.34, width: 6, foot: [1, 2]}}} />);
  expect(html).toContain("Oak");
  expect(html).toContain("12.3 m");
});

test("an applied texture shows its settings in place where they can change, else says which ones it uses", () => {
  const info = {name: "Meadow", preview: "/meadow.png", repeat: [2, 2] as [number, number], variation: false, original: false, mixed: true,
    paint: "a".repeat(64), look: {normal: false, normal_strength: 1, roughness_map: true, roughness_shift: .4},
    maps: {normal: true, roughness: true}, rectangular: false, tiles: 3};
  const shown = renderToStaticMarkup(<AppearanceCard info={info} onEdit={() => {}} settings={<p>Texture settings here</p>} />);
  expect(shown).toContain("Texture settings here");
  expect(shown).not.toContain("Normal map off · Roughness 40 % matter");
  expect(renderToStaticMarkup(<AppearanceCard info={info} onEdit={null} />)).toContain("Normal map off · Roughness 40 % matter");
});
