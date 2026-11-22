import {expect, test} from "bun:test";
import {aiLinePoint, decodeAiLine, type AiLineReady} from "./aiLineData";

const status: AiLineReady = {status: "ready", message: null, count: 2, closed: true, revision: "v1-test"};

test("decode the little-endian columns without copying and read every field of a hovered point", () => {
  const buffer = new ArrayBuffer(2 * 92), words = new DataView(buffer);
  for (let i = 0; i < 23; i++) {
    words.setFloat32(i * 8, i + 1.25, true);
    words.setFloat32(i * 8 + 4, i + 1.5, true);
  }
  words.setInt32(32, 16_777_217, true);
  words.setInt32(36, -2, true);
  const lane = decodeAiLine(status, buffer);
  expect(lane.speed.buffer).toBe(buffer);
  expect(lane.id.buffer).toBe(buffer);
  expect(lane.id[1]).toBe(-2);
  expect(lane.count).toBe(2);
  expect(lane.revision).toBe("v1-test");
  expect(lane.closed).toBe(true);
  expect(aiLinePoint(lane, 0)).toEqual({
    position: [1.25, 2.25, 3.25], distance: 4.25, id: 16_777_217, speed: 6.25, gas: 7.25, brake: 8.25, lat_g: 9.25,
    radius: 10.25, left: 11.25, right: 12.25, camber: 13.25, direction: 14.25, normal: [15.25, 16.25, 17.25],
    segment_length: 18.25, forward: [19.25, 20.25, 21.25], tag: 22.25, grade: 23.25,
  });
  expect(() => decodeAiLine(status, buffer.slice(0, -4))).toThrow("Invalid AI line data");
});
