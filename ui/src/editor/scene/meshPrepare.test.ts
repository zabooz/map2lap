import {expect, test} from "bun:test";
import {MeshPreparer} from "./meshPrepare";
import type {MeshInfo} from "../types";

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  jobs: {id: number; buffer: ArrayBuffer}[] = [];
  postMessage(job: {id: number; buffer: ArrayBuffer}) { this.jobs.push(job); }
  terminate() { this.terminated = true; }
  finish() { const job = this.jobs.shift()!; this.onmessage?.({data: {id: job.id, result: {buffer: job.buffer}}} as MessageEvent); }
}
const info = {vertices: 3, indices: 3} as MeshInfo;

test("changing tracks terminates old work, rejects queued work and ignores a late result", async () => {
  const workers: FakeWorker[] = [];
  const pool = new MeshPreparer(() => { const worker = new FakeWorker(); workers.push(worker); return worker as unknown as Worker; }, 1);
  const old = new AbortController();
  const first = pool.prepare(info, new ArrayBuffer(1), [], false, old.signal);
  const queued = pool.prepare(info, new ArrayBuffer(1), [], false, old.signal);
  const rejected = Promise.all([first.catch(error => error), queued.catch(error => error)]);
  old.abort();
  for (const error of await rejected) expect(error).toBeInstanceOf(DOMException);
  expect(workers[0].terminated).toBe(true);
  const next = pool.prepare(info, new ArrayBuffer(2), [], false, new AbortController().signal);
  workers[0].onmessage?.({data: {id: 1, result: {buffer: new ArrayBuffer(1)}}} as MessageEvent);
  expect(workers[1].jobs).toHaveLength(1);
  workers[1].finish();
  expect((await next).buffer.byteLength).toBe(2);
  pool.dispose();
});

test("a worker fault is reported and a later opening can start a fresh worker", async () => {
  const workers: FakeWorker[] = [];
  const pool = new MeshPreparer(() => { const worker = new FakeWorker(); workers.push(worker); return worker as unknown as Worker; }, 1);
  const pending = pool.prepare(info, new ArrayBuffer(1), [], true, new AbortController().signal);
  const refused = pending.catch(error => error);
  workers[0].onerror?.({message: "worker failed", preventDefault() {}} as ErrorEvent);
  expect((await refused).message).toBe("worker failed");
  const next = pool.prepare(info, new ArrayBuffer(2), [], true, new AbortController().signal);
  workers[1].finish();
  expect((await next).buffer.byteLength).toBe(2);
  pool.dispose();
});
