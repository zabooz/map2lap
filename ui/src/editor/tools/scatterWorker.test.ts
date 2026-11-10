import {expect, test} from "bun:test";
import {ScatterWorker} from "./scatterWorker";

test("closing a failed brush worker rejects queued and later calculations instead of hanging", async () => {
  const before = globalThis.Worker;
  class WorkerStub {onmessage = null; onerror = null; postMessage() {} terminate() {}}
  globalThis.Worker = WorkerStub as unknown as typeof Worker;
  try {
    const worker = new ScatterWorker(), options = {entries: [], radius: 1, spacing: 1, density: 1, seed: 1};
    const pending = worker.run([], options, []); worker.dispose();
    await expect(pending).rejects.toThrow("ended");
    const later = worker.run([], options, []);
    const outcome = await Promise.race([later.then(() => "resolved", () => "rejected"), new Promise(resolve => setTimeout(() => resolve("hung"), 20))]);
    expect(outcome).toBe("rejected");
  } finally { globalThis.Worker = before; }
});
