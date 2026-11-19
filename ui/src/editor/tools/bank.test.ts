import {expect, test} from "bun:test";
import {TrackEdits, type HeightChange} from "../state/edits";
import {BankSession, bankRanges, bankValues, clampBanking, clampLimit, DEFAULT_LIMIT, estimateRamp, type BankFacts} from "./bank";
import type {Pin} from "./pins";

const height = (id: string): HeightChange => ({id, x: 0, z: 0, nx: 2, nz: 2, mm: [0, 10, 10, 0]});
const points: Pin[] = [[0, 0, 0], [100, 0, 0]];

async function setup(heights: HeightChange[] = []) {
  let revision = 0;
  const edits = new TrackEdits("test", async (_url, options) => new Response(JSON.stringify(options
    ? {revision: ++revision, meshes: []} : {base: "source", revision, deleted: [], outdated: 0, heights})));
  edits.bind("source"); await edits.start();
  return edits;
}

type Body = {replace: string[]; banking: number; side: number; limit: number};

test("the first banking is a new Undo step, later ones replace it in that step, Restore original removes it", async () => {
  const edits = await setup(), asked: Body[] = [];
  const session = new BankSession(edits, async body => { asked.push(body as Body); return {height: height(`bank-${asked.length}`)}; });
  try {
    expect(await session.apply(points, 0.04, 1, 0.005)).toBe("applied");
    expect(await session.apply(points, 0.04, -1, 0.005)).toBe("applied");
    expect(asked.map(b => [b.replace, b.banking, b.side, b.limit])).toEqual([[[], 0.04, 1, 0.005], [["bank-1"], 0.04, -1, 0.005]]);
    expect(session.applied()).toBe("bank-2");
    expect(edits.state().heights.map(h => h.id)).toEqual(["bank-2"]);
    expect(await session.restore(points)).toBe("reset");
    expect(session.applied()).toBeNull();
    expect(edits.state().heights).toEqual([]);
    expect(edits.state().canUndo).toBe(false);
  } finally { edits.stop(); }
});

test("0 % is applied as a level target, not a removal", async () => {
  const edits = await setup(), asked: Body[] = [];
  const session = new BankSession(edits, async body => { asked.push(body as Body); return {height: height("level")}; });
  try {
    expect(await session.apply(points, 0, 1, 0.005)).toBe("applied");
    expect(asked.map(b => b.banking)).toEqual([0]);
    expect(edits.state().heights.map(h => h.id)).toEqual(["level"]);
  } finally { edits.stop(); }
});

test("a picked banking is taken over: the next change replaces it as a new Undo step", async () => {
  const edits = await setup([height("saved")]), asked: string[][] = [];
  const session = new BankSession(edits, async body => { asked.push((body as Body).replace); return {height: height("again")}; });
  try {
    session.adopt(["saved"]);
    expect(session.applied()).toBe("saved");
    expect(await session.apply(points, 0.05, 1, 0.005)).toBe("applied");
    expect(asked).toEqual([["saved"]]);
    edits.undo();
    expect(edits.state().heights.map(h => h.id)).toEqual(["saved"]);
  } finally { edits.stop(); }
});

test("an answer after cancel() is not put; a refusal says why", async () => {
  const edits = await setup();
  let answer: ((r: {height?: HeightChange; error?: string}) => void) | null = null;
  const session = new BankSession(edits, () => new Promise(resolve => { answer = resolve; }));
  try {
    const pending = session.apply(points, 0.05, 1, 0.005);
    await new Promise(resolve => setTimeout(resolve, 0));
    session.cancel();
    answer!({height: height("late")});
    expect(await pending).toBe("cancelled");
    expect(edits.state().heights).toEqual([]);
    const refused = session.apply(points, 0.08, 1, 0.005);
    await new Promise(resolve => setTimeout(resolve, 0));
    answer!({error: "Only 2.5 % banking fits here"});
    expect(await refused).toBe("Only 2.5 % banking fits here");
  } finally { edits.stop(); }
});

test("banking is a magnitude within 0 to 20 %; the edge-ramp limit within 0.2 to 3 %", () => {
  expect(clampBanking(-0.02)).toBe(0);
  expect(clampBanking(0.3)).toBe(0.2);
  expect(clampBanking(0.2)).toBe(0.2);
  expect(clampBanking(0.04449)).toBe(0.044);
  expect(clampLimit(0.001)).toBe(0.002);
  expect(clampLimit(0.05)).toBe(0.03);
  expect(clampLimit(0.0061)).toBe(0.006);
});

test("the strip's estimate: 8 % on an 8 m road from level at 0.5 % takes 96 m; the side sets which way the change goes", () => {
  expect(estimateRamp(0, 0.08, 1, 4, 0.005)).toBe(96);
  expect(estimateRamp(0.08, 0.08, 1, 4, 0.005)).toBe(4);            // (already there: the shortest transition)
  expect(estimateRamp(0.08, 0.08, -1, 4, 0.005)).toBe(192);         // (from +8 % over to the other side)
});

test("a banking from the first version (target, transitions inside its line, no heights) is a range that can be picked", () => {
  const old = {id: "old", x: 0, z: 0, nx: 2, nz: 2, mm: [0, 0, 0, 0],
    bank: {points: [[0, 0, 100], [100, 0, 104]], target: -0.015, ramp: 17, half: 3, line: [[0, 0], [100, 0]], road_ids: ["r"]}};
  const [range] = bankRanges([old as unknown as HeightChange]);
  expect([range.a, range.b, range.before, range.after]).toEqual([17, 83, 17, 17]);
  expect(range.line.map(p => p[1])).toEqual([100, 104]);               // (its heights from its pins)
  expect(bankValues(old.bank as unknown as BankFacts)).toEqual({banking: 0.015, side: -1, limit: DEFAULT_LIMIT});
});
