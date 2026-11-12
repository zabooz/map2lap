import type {SerializedBVH} from "three-mesh-bvh";
import type {MeshInfo} from "../types";

export interface RegionPiece {from: number; end: number; id: string}
export interface PreparedMesh {buffer: ArrayBuffer; regions?: Uint32Array; bvh?: SerializedBVH}
export interface PrepareJob {id: number; info: MeshInfo; buffer: ArrayBuffer; pieces: RegionPiece[] | null; ground: boolean}
interface Task {
  job: PrepareJob; signal: AbortSignal; abort: () => void;
  resolve(value: PreparedMesh): void; reject(error: unknown): void;
}
interface Slot {worker: Worker; task?: Task}

/** A bounded pool transfers source geometry to workers and back. Aborted results never enter a new track. */
export class MeshPreparer {
  private slots: Slot[] = [];
  private waiting: Task[] = [];
  private next = 0;

  constructor(private readonly create = () => new Worker("/src/editor/scene/geometry.worker.js", {type: "module"}),
              private readonly count = Math.max(1, Math.min(4, (globalThis.navigator?.hardwareConcurrency ?? 4) - 1))) {}

  prepare(info: MeshInfo, buffer: ArrayBuffer, pieces: RegionPiece[] | null, ground: boolean, signal: AbortSignal): Promise<PreparedMesh> {
    signal.throwIfAborted();
    if (!ground && pieces === null) return Promise.resolve({buffer});
    return new Promise((resolve, reject) => {
      const task: Task = {job: {id: ++this.next, info, buffer, pieces, ground}, signal, resolve, reject, abort: () => {}};
      task.abort = () => {
        const slot = this.slots.find(slot => slot.task === task);
        if (slot) { slot.task = undefined; slot.worker.terminate(); this.slots.splice(this.slots.indexOf(slot), 1); }
        this.waiting = this.waiting.filter(pending => pending !== task);
        this.finish(task, signal.reason);
        this.pump();
      };
      signal.addEventListener("abort", task.abort, {once: true});
      this.waiting.push(task);
      this.pump();
    });
  }

  private finish(task: Task, error?: unknown, result?: PreparedMesh) {
    task.signal.removeEventListener("abort", task.abort);
    if (error !== undefined) task.reject(error);
    else if (task.signal.aborted) task.reject(task.signal.reason);
    else task.resolve(result!);
  }

  private pump() {
    // An abort dispatch visits several tasks on the same signal. Remove all of its queued tasks before starting another.
    for (const task of this.waiting.filter(task => task.signal.aborted)) {
      this.waiting.splice(this.waiting.indexOf(task), 1); this.finish(task, task.signal.reason);
    }
    while (this.waiting.length) {
      let slot = this.slots.find(slot => !slot.task);
      if (!slot && this.slots.length >= this.count) return;
      if (!slot) {
        try {
          slot = {worker: this.create()};
          const own = slot;
          slot.worker.onmessage = ({data}: MessageEvent<{id: number; result?: PreparedMesh; error?: string}>) => {
            const task = own.task;
            if (!task || data.id !== task.job.id) return;
            own.task = undefined;
            if (data.error) { own.worker.terminate(); this.slots = this.slots.filter(slot => slot !== own); }
            this.finish(task, data.error ? new Error(data.error) : undefined, data.result);
            this.pump();
          };
          slot.worker.onerror = event => {
            event.preventDefault();
            const task = own.task; own.task = undefined; own.worker.terminate();
            this.slots = this.slots.filter(slot => slot !== own);
            if (task) this.finish(task, new Error(event.message || "Geometry worker failed"));
            this.pump();
          };
          this.slots.push(slot);
        } catch (error) { this.finish(this.waiting.shift()!, error); continue; }
      }
      const task = this.waiting.shift()!;
      slot.task = task;
      try { slot.worker.postMessage(task.job, [task.job.buffer]); }
      catch (error) { slot.task = undefined; this.finish(task, error); }
    }
  }

  dispose() {
    const error = new DOMException("Track geometry preparation cancelled", "AbortError");
    const tasks = [...this.waiting, ...this.slots.flatMap(slot => slot.task ? [slot.task] : [])];
    for (const slot of this.slots) { slot.worker.terminate(); slot.task = undefined; }
    this.slots = []; this.waiting = [];
    for (const task of tasks) this.finish(task, error);
  }
}
