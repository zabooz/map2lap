import type {ScatterOptions, Scattered} from "./scatter";
import type {Sample} from "../types";

/** One worker per active brush; terminating it rejects pending work so stale previews cannot place plants. */
export class ScatterWorker {
  private worker = new Worker("/src/editor/tools/scatter.worker.js", {type: "module"});
  private next = 0;
  private closed = false;
  private pending = new Map<number, {resolve: (value: {plants: Scattered[]; limited: boolean}) => void; reject: (error: Error) => void}>();
  constructor() {
    this.worker.onmessage = event => {
      const {id, plants, limited, error} = event.data, task = this.pending.get(id); if (!task) return;
      this.pending.delete(id); if (error) task.reject(new Error(error)); else task.resolve({plants, limited});
    };
    this.worker.onerror = () => this.dispose();
  }
  run(samples: Sample[], options: ScatterOptions, existing: {x: number; z: number}[]) {
    return new Promise<{plants: Scattered[]; limited: boolean}>((resolve, reject) => {
      if (this.closed) { reject(new Error("Brush calculation ended.")); return; }
      const id = ++this.next; this.pending.set(id, {resolve, reject}); this.worker.postMessage({id, samples, options, existing});
    });
  }
  dispose() { this.closed = true; this.worker.terminate(); for (const task of this.pending.values()) task.reject(new Error("Brush calculation ended.")); this.pending.clear(); }
}
