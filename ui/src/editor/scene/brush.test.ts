import {expect, test} from "bun:test";
import {brushOf, objectsOf} from "./view.fixture";

test("pointer cancellation also releases the tool's local stroke preview", () => {
  let cancelled = 0, takenBack = 0;
  const brush = brushOf({objects: objectsOf({})}, {takeBackPreview: () => { takenBack++; }});
  Object.assign(brush, {stroke: {timer: setInterval(() => {}, 1000)}});
  brush.setStroke(() => {}, async () => null, () => {}, () => cancelled++);
  expect(brush.cancelStroke()).toBe(true); expect(cancelled).toBe(1); expect(takenBack).toBe(1);
  expect(brush.cancelStroke()).toBe(false); expect(cancelled).toBe(1);
});
