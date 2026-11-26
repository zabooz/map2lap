import {expect, test} from "bun:test";
import {needsAiUpdate} from "./useSave";

test("Recalculate after Save also places legacy margins or writes deferred hints", () => {
  for (const hints of [{state: "current", unplaced: "recalculate"}, {state: "stale", unplaced: null}]) {
    const line = {status: "ready", hints};
    expect(needsAiUpdate("recalculate", line)).toBe(true);
    expect(needsAiUpdate("save", line)).toBe(false);
    expect(needsAiUpdate("play", line)).toBe(false);
  }
  expect(needsAiUpdate("recalculate", {status: "ready", hints: {state: "current", unplaced: null}})).toBe(false);
  expect(needsAiUpdate("save", {status: "pending"})).toBe(true);
  expect(needsAiUpdate("save", {status: "manual", hints: {state: "current", unplaced: "manual"}})).toBe(false);
});
