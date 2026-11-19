import {expect, test} from "bun:test";
import {Latest} from "./latest";

test("only the newest request is current; drop() makes every earlier one stale", () => {
  const latest = new Latest();
  const first = latest.next(), second = latest.next();
  expect(latest.current(first)).toBe(false);
  expect(latest.current(second)).toBe(true);
  latest.drop();
  expect(latest.current(second)).toBe(false);
  expect(latest.current(latest.next())).toBe(true);
});
