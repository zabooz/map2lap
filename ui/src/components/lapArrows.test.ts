import {expect, test} from "bun:test";
import type {LatLon} from "../types";
import {arrowsAlong} from "./lapArrows";

const degPerMetre = 180 / (Math.PI * 6_371_000);
const east: LatLon[] = [[0, 0], [0, 1000 * degPerMetre]];

test("a 1 km line due east has arrows at 250, 500 and 750 m", () => {
  const arrows = arrowsAlong(east, 250, 12);
  expect(arrows).toHaveLength(3);
  arrows.forEach(({at: [lat, lon], deg}, i) => {
    expect(lat).toBeCloseTo(0);
    expect(lon / degPerMetre).toBeCloseTo((i + 1) * 250);
    expect(deg).toBeCloseTo(90);
  });
});

test("the arrow limit caps a long line", () => {
  expect(arrowsAlong(east, 250, 2)).toHaveLength(2);
});

test("spacing carries through corners and duplicate coordinates", () => {
  const corner: LatLon = [0, 400 * degPerMetre];
  const arrows = arrowsAlong([[0, 0], corner, corner, [400 * degPerMetre, corner[1]]], 250, 12);
  expect(arrows).toHaveLength(3);
  expect(arrows[1].at[0] / degPerMetre).toBeCloseTo(100);
  expect(arrows[1].at[1]).toBeCloseTo(corner[1], 9);
  expect(arrows[1].deg).toBeCloseTo(0);
});
