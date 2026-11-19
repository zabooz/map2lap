import {expect, test} from "bun:test";
import {overlapping, rangeAt, rangeParts, type EditRange} from "./editRanges";

// A banking on road "low" along x from 0 to 200 at height 10, fully banked from 50 to 150, 8 m wide.
const low: EditRange = {id: "low", roads: ["low"], line: [[0, 10, 0], [200, 10, 0]], a: 50, b: 150, before: 50, after: 50, half: 4};
// A bridge's banking crossing over it at x = 100, 7 m higher.
const bridge: EditRange = {id: "bridge", roads: ["bridge"], line: [[100, 17, -100], [100, 17, 100]], a: 80, b: 120, before: 80, after: 80, half: 4};

test("a click picks a range on its fully banked stretch and on a transition, not beside it", () => {
  expect(rangeAt([low], 100, 10, 2)?.id).toBe("low");
  expect(rangeAt([low], 20, 10, -3)?.id).toBe("low");            // (the transition before A)
  expect(rangeAt([low], 100, 10, 12)).toBeNull();
  expect(rangeAt([low], 220, 10, 0)).toBeNull();                 // (past where its transition ends)
  expect(rangeAt([low], 205, 10, 0)).toBeNull();                 // (5 m past its end, though within its half width of it)
  expect(rangeAt([low], 200.5, 10, 0)?.id).toBe("low");          // (at its end, within a hand's aim)
});

test("a click on a bridge does not pick the banking of the road below, nor the other way round", () => {
  expect(rangeAt([low, bridge], 100, 17, 1)?.id).toBe("bridge");
  expect(rangeAt([low, bridge], 100, 10, 1)?.id).toBe("low");
  expect(rangeAt([low], 100, 17, 1)).toBeNull();
});

test("a new range overlaps one on the same road, transitions included; another road or level never; the picked one is ignored", () => {
  const next = (from: number, to: number, roads = ["low"]): EditRange => ({...low, id: "new", roads, line: [[from, 10, 0], [to, 10, 0]]});
  expect(overlapping([low], next(190, 400))?.id).toBe("low");
  expect(overlapping([low], next(200, 400))).toBeNull();          // (end to end)
  expect(overlapping([low], next(0, 200, ["bridge"]))).toBeNull();
  expect(overlapping([low], next(0, 200), ["low"])).toBeNull();
});

test("a range splits into its transition before A, its fully banked stretch and its transition after B", () => {
  const parts = rangeParts(low);
  expect(parts.before).toEqual([[0, 10, 0], [50, 10, 0]]);
  expect(parts.core).toEqual([[50, 10, 0], [150, 10, 0]]);
  expect(parts.after).toEqual([[150, 10, 0], [200, 10, 0]]);
});
