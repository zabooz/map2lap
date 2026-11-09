// Read-only Editor loading requests: bounded retries, progress timeouts and on-demand diagnostics.
const FETCH_TRIES = 3, FETCH_WAIT_MS = 500;
// Local meshes and 22 MB masks normally arrive in seconds. Allow 30 seconds without headers or another chunk,
// rather than limiting total transfer time: large files on a slow disk can keep making useful progress.
const IDLE_MS = 30_000;

interface RequestOptions {
  tries?: number;
  idleMs?: number;
  retryMs?: number;
  init?: Omit<RequestInit, "signal">;
}

interface LoadingRequest {
  url: string;
  attempt: number;
  started: number;
  lastProgress: number;
  bytes: number;
}

const pending = new Set<LoadingRequest>();

/** Open transfers only; completed requests and their URLs are released. Pure. */
export function loadingRequests() {
  const now = performance.now();
  return [...pending].map(r => ({url: r.url, attempt: r.attempt, bytes: r.bytes,
    ageMs: Math.round(now - r.started), idleMs: Math.round(now - r.lastProgress)})).sort((a, b) => b.ageMs - a.ageMs);
}

declare global {
  interface Window { map2lapLoading: typeof loadingRequests }
}
if (typeof window !== "undefined") window.map2lapLoading = loadingRequests;

export class MeshFetchError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

async function readAttempt(url: string, parent: AbortSignal, attempt: number, options: RequestOptions) {
  parent.throwIfAborted();
  const controller = new AbortController(), signal = AbortSignal.any([parent, controller.signal]);
  const idleMs = options.idleMs ?? IDLE_MS, started = performance.now();
  const request = {url, attempt, started, lastProgress: started, bytes: 0};
  pending.add(request);
  let timer: ReturnType<typeof setTimeout> | undefined, reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let rejectAbort!: (reason: unknown) => void;
  const aborted = new Promise<never>((_resolve, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(signal.reason);
  signal.addEventListener("abort", onAbort, {once: true});
  const progress = () => {
    request.lastProgress = performance.now();
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(new DOMException(`No loading progress for ${idleMs / 1000} s: ${url}`, "TimeoutError")), idleMs);
  };
  let complete = false;
  try {
    progress();
    const response = await Promise.race([fetch(url, {...options.init, signal}), aborted]);
    progress();
    let buffer: ArrayBuffer;
    if (response.body) {
      reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const {done, value} = await Promise.race([reader.read(), aborted]);
        if (done) break;
        if (value.byteLength) { chunks.push(value); request.bytes += value.byteLength; progress(); }
      }
      const bytes = new Uint8Array(request.bytes);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      buffer = bytes.buffer;
    } else {
      buffer = await Promise.race([response.arrayBuffer(), aborted]);
      request.bytes = buffer.byteLength;
    }
    complete = true;
    if (!response.ok) {
      let message = `${url}: ${response.status}`;
      try { message = JSON.parse(new TextDecoder().decode(buffer))?.error ?? message; } catch { /* An HTTP error can have no JSON body. */ }
      throw new MeshFetchError(response.status, message);
    }
    return buffer;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
    if (reader) {
      if (!complete) void reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    pending.delete(request);
  }
}

async function retryPause(ms: number, signal: AbortSignal) {
  signal.throwIfAborted();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort!: () => void;
  try {
    await new Promise<void>((resolve, reject) => {
      onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, {once: true});
      timer = setTimeout(resolve, ms);
    });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

/** Read bytes with bounded connection retries. HTTP refusals and leaving the track never retry. */
export async function fetchBytes(url: string, signal: AbortSignal, options: RequestOptions = {}): Promise<ArrayBuffer> {
  const tries = options.tries ?? FETCH_TRIES;
  for (let attempt = 1; ; attempt++) {
    try { return await readAttempt(url, signal, attempt, options); }
    catch (error) {
      if (signal.aborted || error instanceof MeshFetchError || attempt >= tries) throw error;
      await retryPause(options.retryMs ?? FETCH_WAIT_MS, signal);
    }
  }
}

/** Read a loading manifest under the same timeout and diagnostics as its mesh/image bytes. */
export async function fetchJson<T>(url: string, signal: AbortSignal, init?: Omit<RequestInit, "signal">): Promise<T> {
  // The textures POST only reads a layout, but avoid repeating server work automatically after losing its response.
  const bytes = await fetchBytes(url, signal, {init, tries: init?.method && init.method !== "GET" ? 1 : undefined});
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
