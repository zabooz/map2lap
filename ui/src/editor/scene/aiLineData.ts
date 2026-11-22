import type {Place} from "../types";
import {fetchBytes, fetchJson} from "./requests";

/** One sample from the installed-line endpoint, in AC coordinates and units. */
export interface AiLinePoint {
  position: Place;
  distance: number;
  id: number;
  speed: number;
  gas: number;
  brake: number;
  lat_g: number;
  radius: number;
  left: number;
  right: number;
  camber: number;
  direction: number;
  normal: Place;
  segment_length: number;
  forward: Place;
  tag: number;
  grade: number;
}

export interface AiLineReady {status: "ready"; message: null; closed: boolean; revision: string; count: number}
interface AiLineUnavailable {status: "missing" | "invalid"; message: string; closed: null; revision: null; count: 0}
export interface AiLineHover {point: AiLinePoint; metre: number | null}
export type InstalledAiLine = ReturnType<typeof decodeAiLine>;

/** Views of the Editor endpoint's 23 little-endian columns (docs/editor-tools.md). Pure. */
export function decodeAiLine(status: AiLineReady, buffer: ArrayBuffer) {
  const {count} = status;
  if (!Number.isSafeInteger(count) || count < 2 || buffer.byteLength !== count * 92) throw new Error("Invalid AI line data");
  const words = new Float32Array(buffer);
  const column = (i: number) => words.subarray(i * count, (i + 1) * count);
  const speed = column(5);
  let slow = Infinity, fast = -Infinity;
  for (const v of speed) { slow = Math.min(slow, v); fast = Math.max(fast, v); }
  return {...status, speeds: {slow, fast}, x: column(0), y: column(1), z: column(2), distance: column(3),
    id: new Int32Array(buffer, 4 * count * Int32Array.BYTES_PER_ELEMENT, count), speed,
    gas: column(6), brake: column(7), lat_g: column(8), radius: column(9), left: column(10), right: column(11),
    camber: column(12), direction: column(13), normalX: column(14), normalY: column(15), normalZ: column(16),
    segmentLength: column(17), forwardX: column(18), forwardY: column(19), forwardZ: column(20), tag: column(21), grade: column(22)};
}

/** Read sample i from the columns for the hover box. Pure. */
export function aiLinePoint(lane: InstalledAiLine, i: number): AiLinePoint {
  return {position: [lane.x[i], lane.y[i], lane.z[i]], distance: lane.distance[i], id: lane.id[i], speed: lane.speed[i],
    gas: lane.gas[i], brake: lane.brake[i], lat_g: lane.lat_g[i], radius: lane.radius[i], left: lane.left[i], right: lane.right[i],
    camber: lane.camber[i], direction: lane.direction[i], normal: [lane.normalX[i], lane.normalY[i], lane.normalZ[i]],
    segment_length: lane.segmentLength[i], forward: [lane.forwardX[i], lane.forwardY[i], lane.forwardZ[i]], tag: lane.tag[i], grade: lane.grade[i]};
}

/** Read the installed revision. Reuse the decoded columns when the status still names the same bytes. */
export async function fetchAiLine(name: string, known: InstalledAiLine | null, signal: AbortSignal) {
  const url = `/api/editor/${encodeURIComponent(name)}/ai-line`;
  const status = await fetchJson<AiLineReady | AiLineUnavailable>(url, signal);
  if (status.status !== "ready") return status;
  if (known?.revision === status.revision && known.closed === status.closed) return known;
  const buffer = await fetchBytes(`${url}?r=${encodeURIComponent(status.revision)}`, signal);
  return decodeAiLine(status, buffer);
}
