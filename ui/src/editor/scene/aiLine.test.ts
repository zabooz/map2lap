import {expect, test} from "bun:test";
import {Vector3} from "three";
import type {Place} from "../types";
import {brakeCrossbars, brakeStripes, laneBand, laneEdges, laneSpeedColour, pickLanePoint, SPEED_COLOURS} from "./aiLine";

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

test("braking paints both margins of the outgoing segment and leaves its centre clear", () => {
  const edges: [Place, Place][] = [[[0, 0, 0], [0, 0, 6.25]], [[10, 0, 0], [10, 0, 6.25]], [[20, 0, 0], [20, 0, 12.5]]];
  const samples = [{brake: 0}, {brake: 0.5}, {brake: 1}];
  const open = brakeStripes(edges, samples, false);
  expect(open).toEqual([
    10, 0, 0, 10, 0, 0.5, 20, 0, 0,
    10, 0, 0.5, 20, 0, 1, 20, 0, 0,
    10, 0, 6.25, 10, 0, 5.75, 20, 0, 12.5,
    10, 0, 5.75, 20, 0, 11.5, 20, 0, 12.5,
  ]);
  const circuit = brakeStripes(edges, samples, true);
  expect(circuit).toHaveLength(open.length * 2);
  expect(circuit.slice(open.length, open.length + 9)).toEqual([20, 0, 0, 20, 0, 1, 0, 0, 0]);
});

test("braking crossbars span the inner edges, keep their spacing across samples and mark short zones", () => {
  const xs = [0, 1, 5.45, 8, 9, 9.4];
  const edges = xs.map((x): [Place, Place] => [[x, 0, 0], [x, 0, 10]]);
  const samples = xs.map((x, i) => ({position: [x, 0, 5] as Place, brake: [1, 1, 1, 0, 1, 1][i]}));
  const bars = brakeCrossbars(edges, samples, false);
  expect(bars.slice(0, 9)).toEqual([0.35, 0, 0.8, 0.35, 0, 9.2, 0.65, 0, 0.8]);
  const spans = Array.from({length: bars.length / 18}, (_, i) => [bars[18 * i], bars[18 * i + 6]].map(n => Number(n.toFixed(2))));
  expect(spans).toEqual([[0.35, 0.65], [5.35, 5.45], [5.45, 5.65], [9.05, 9.35]]);
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
