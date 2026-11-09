interface Subscriber {resolve: (blob: Blob) => void; reject: (error: unknown) => void; cleanup: () => void}
interface Job {id: string; controller: AbortController; subscribers: Set<Subscriber>}

/** Visible cards share one renderer; cancellation removes abandoned pages from its queue. */
export class ModelThumbnailQueue {
  private jobs = new Map<string, Job>();
  private pending: Job[] = [];
  private memory = new Map<string, Blob>();
  private running = false;

  constructor(private read: (id: string) => Promise<Blob | null>,
    private render: (id: string, signal: AbortSignal) => Promise<Blob>,
    private write: (id: string, blob: Blob) => Promise<void>) {}

  get(id: string, signal: AbortSignal, priority = false): Promise<Blob> {
    if (signal.aborted) return Promise.reject(signal.reason);
    const cached = this.memory.get(id);
    if (cached) {
      this.memory.delete(id); this.memory.set(id, cached);
      return Promise.resolve(cached);
    }
    let job = this.jobs.get(id);
    if (!job) {
      job = {id, controller: new AbortController(), subscribers: new Set()};
      this.jobs.set(id, job); this.pending.push(job);
    }
    if (priority) {
      const position = this.pending.indexOf(job);
      if (position > 0) { this.pending.splice(position, 1); this.pending.unshift(job); }
    }
    const current = job;
    const result = new Promise<Blob>((resolve, reject) => {
      const abort = () => {
        current.subscribers.delete(subscriber); subscriber.cleanup(); reject(signal.reason);
        if (!current.subscribers.size) {
          current.controller.abort();
          if (this.jobs.get(id) === current) this.jobs.delete(id);
        }
      };
      const subscriber = {resolve, reject, cleanup: () => signal.removeEventListener("abort", abort)};
      current.subscribers.add(subscriber); signal.addEventListener("abort", abort, {once: true});
    });
    queueMicrotask(() => { void this.drain(); });
    return result;
  }

  private async drain() {
    if (this.running) return;
    this.running = true;
    try {
      let job: Job | undefined;
      while ((job = this.pending.shift())) {
        if (job.controller.signal.aborted) continue;
        try {
          let blob = await this.read(job.id).catch(() => null);
          job.controller.signal.throwIfAborted();
          if (!blob) {
            blob = await this.render(job.id, job.controller.signal);
            job.controller.signal.throwIfAborted();
            await this.write(job.id, blob).catch(() => {});
          }
          job.controller.signal.throwIfAborted();
          this.memory.set(job.id, blob);
          if (this.memory.size > 64) this.memory.delete(this.memory.keys().next().value!);
          for (const subscriber of job.subscribers) { subscriber.cleanup(); subscriber.resolve(blob); }
        } catch (error) {
          for (const subscriber of job.subscribers) { subscriber.cleanup(); subscriber.reject(error); }
        } finally {
          job.subscribers.clear();
          if (this.jobs.get(job.id) === job) this.jobs.delete(job.id);
        }
      }
    } finally { this.running = false; }
  }
}
