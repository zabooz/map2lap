import {expect, test} from "bun:test";
import {Vector3} from "three";
import type {Place} from "../types";
import {laneBand, laneEdges, laneSpeedColour, pickLanePoint, SPEED_COLOURS} from "./aiLine";

test("speed colours reach the ends of the legend and a constant speed has a defined colour", () => {
  expect(laneSpeedColour(3, 5, 25).getHexString()).toBe(SPEED_COLOURS[0].slice(1));
  expect(laneSpeedColour(25, 5, 25).getHexString()).toBe(SPEED_COLOURS[2].slice(1));
  expect(laneSpeedColour(15, 5, 25).getHexString()).toBe(SPEED_COLOURS[1].slice(1));
  expect(laneSpeedColour(5, 5, 5).getHexString()).toBe(SPEED_COLOURS[1].slice(1));
});

test("the lane sides use separate horizontal widths and follow a bank", () => {
  expect(laneEdges({position: [10, 4, 30], forward: [1, 0.1, 0], normal: [0, 1, 0.25], left: 2, right: 4}))
    .toEqual([[10, 4.5, 28], [10, 3, 34]]);
});

test("the speed band joins both side limits and closes only on a circuit", () => {
  const edges: [Place, Place][] = [[[0, 1, -2], [0, 0, 4]], [[5, 2, -1], [5, 1, 3]], [[7, 3, -1], [7, 1, 2]]];
  const colours = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const strip = laneBand(edges, colours, false);
  expect(Array.from(strip.getAttribute("position").array)).toEqual(edges.flat(2));
  expect(Array.from(strip.getAttribute("color").array)).toEqual(colours.flatMap(c => [...c, ...c]));
  expect(Array.from(strip.index!.array)).toEqual([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4]);
  expect(Array.from(laneBand(edges, colours, true).index!.array).slice(-6)).toEqual([4, 5, 0, 5, 1, 0]);
});

test("hover chooses the closest visible segment and its nearer endpoint, including the circuit seam", () => {
  const positions = [[0, 0, 0], [5, 0, 0], [0, 0, 5]] as [number, number, number][];
  const hit = (faceIndex: number, pointOnLine: Vector3, distance: number, offset: number) =>
    ({faceIndex, pointOnLine, distance, point: pointOnLine.clone().add(new Vector3(0, offset, 0))});
  const seam = hit(2, new Vector3(0, 0, 1), 3, 0.1);
  const other = hit(0, new Vector3(4, 0, 0), 2, 0.6);
  expect(pickLanePoint(positions, [other, seam])).toBe(0);
  expect(pickLanePoint(positions, [other, seam], 2)).toBe(1);
  expect(pickLanePoint(positions, [])).toBeNull();
});
