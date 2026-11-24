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
  expect(laneEdges([10, 4, 30], [1, 0], [0, 1, 0.25], 2, 4))
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

test("installed band meets the measured boundaries and skips just the covered segments, including across the lap seam", async () => {
  const {remainingBand} = await import("./aiLine");
  const rows = Array.from({length:6}, (_,i) => ({at:[i,0,0] as Place, edges:[[i,0,-1],[i,0,1]] as [Place,Place], colour:[1,1,1]}));
  const start = {...rows[1], at:[1,0,.2] as Place}, end = {...rows[3], at:[3,0,.3] as Place};
  expect(remainingBand(rows, false, [[start,end]])).toEqual([[rows[0],start],[end,rows[4],rows[5]]]);
  expect(remainingBand(rows, true, [[end,start]])).toEqual([[start,rows[2],end]]);
});

test("a replacement within one long installed segment leaves both adjoining parts", async () => {
  const {remainingBand} = await import("./aiLine");
  const row = (x:number) => ({at:[x,0,0] as Place, edges:[[x,0,-1],[x,0,1]] as [Place,Place], colour:[1,1,1]});
  expect(remainingBand([row(0),row(10)], false, [[row(1),row(3)]]))
    .toEqual([[row(0),row(1)],[row(3),row(10)]]);
});

test("a wide hairpin preview stops at its centre and keeps the outer width and banking", async () => {
  const {previewBand} = await import("./aiPreviewBand");
  for (const turn of [-1, 1]) {
    const rows = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI].map((angle, i) => {
      const x = 10*Math.cos(angle), z = turn*10*Math.sin(angle);
      // The outside shoulder has zero width at entry. Both directions share this geometry.
      const outside = i ? 1.3 : 1;
      const inner = [-2*x, 8, -2*z], outer = [outside*x, 2, outside*z];
      return [x, 0, z, 0, ...(turn > 0 ? [...outer, ...inner] : [...inner, ...outer])];
    });
    const fill = previewBand(rows);
    const vertices = fill.geometry.getAttribute("position");
    for (let i=0; i<rows.length; i++) {
      const inside = 2*i + Number(turn > 0), outside = 2*i + Number(turn < 0);
      expect(Math.hypot(vertices.getX(inside), vertices.getZ(inside))).toBeCloseTo(0);
      expect(vertices.getY(inside)-vertices.getY(outside)).toBeCloseTo(8/3-2);
      expect(Math.hypot(vertices.getX(outside), vertices.getZ(outside))).toBeCloseTo(i ? 13 : 10);
    }
  }
});

test("a recorded zero-width endpoint opens to the next cross-section without a fold", async () => {
  const {previewBand} = await import("./aiPreviewBand");
  const band = previewBand([[0,0,0,0, 0,0,0, 0,0,0], [2,0,0,0, 2,0,-3, 2,0,4]]);
  const points = band.geometry.getAttribute("position");
  expect([0,1,2,3].map(i => [points.getX(i), points.getZ(i)])).toEqual([[0,0],[0,0],[2,-3],[2,4]]);
});
