import {afterEach, expect, test} from "bun:test";
import {fetchBytes, loadingRequests, MeshFetchError} from "./requests";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("stalled headers expose their URL and age, time out, and stop after bounded retries", async () => {
  const signals: AbortSignal[] = [];
  globalThis.fetch = ((_url: RequestInfo | URL, init?: RequestInit) => {
    signals.push(init!.signal!);
    return new Promise<Response>(() => {});
  }) as unknown as typeof fetch;
  const pending = fetchBytes("/api/editor/track/mesh/7?r=source", new AbortController().signal,
    {tries: 2, idleMs: 10, retryMs: 0});
  const [request] = loadingRequests();
  expect(request.url).toContain("/mesh/7");
  expect(request.ageMs).toBeGreaterThanOrEqual(0);
  expect(request.idleMs).toBeGreaterThanOrEqual(0);
  expect(request.bytes).toBe(0);
  await expect(pending).rejects.toThrow("No loading progress");
  expect(signals).toHaveLength(2);
  expect(signals.every(s => s.aborted)).toBe(true);
  expect(loadingRequests()).toEqual([]);
});

test("each arriving chunk resets the timeout; a transfer can outlast the idle limit", async () => {
  let timer: ReturnType<typeof setInterval>, count = 0;
  globalThis.fetch = (async () => new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      timer = setInterval(() => {
        controller.enqueue(Uint8Array.of(++count));
        if (count === 5) { clearInterval(timer); controller.close(); }
      }, 20);
    },
    cancel() { clearInterval(timer); },
  }))) as unknown as typeof fetch;
  const pending = fetchBytes("/texture", new AbortController().signal, {idleMs: 60});
  await new Promise(resolve => setTimeout(resolve, 35));
  expect(loadingRequests()[0].bytes).toBeGreaterThan(0);
  expect(new Uint8Array(await pending)).toEqual(Uint8Array.of(1, 2, 3, 4, 5));
  expect(loadingRequests()).toEqual([]);
});

test("a stalled response body times out and cancels its reader", async () => {
  let cancelled = false;
  globalThis.fetch = (async () => new Response(new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(Uint8Array.of(1)); },
    cancel() { cancelled = true; },
  }))) as unknown as typeof fetch;
  await expect(fetchBytes("/mask", new AbortController().signal, {tries: 1, idleMs: 10})).rejects.toThrow("No loading progress");
  expect(cancelled).toBe(true);
  expect(loadingRequests()).toEqual([]);
});

test("leaving the track cancels immediately without retrying", async () => {
  let asked = 0;
  globalThis.fetch = (() => { asked++; return new Promise<Response>(() => {}); }) as unknown as typeof fetch;
  const controller = new AbortController();
  const pending = fetchBytes("/mesh", controller.signal);
  controller.abort();
  await expect(pending).rejects.toMatchObject({name: "AbortError"});
  expect(asked).toBe(1);
  expect(loadingRequests()).toEqual([]);
  await expect(fetchBytes("/mesh", controller.signal)).rejects.toMatchObject({name: "AbortError"});
  expect(asked).toBe(1);
});

test("a refused mesh keeps its status for model refresh and is never retried", async () => {
  let asked = 0;
  globalThis.fetch = (async () => { asked++; return Response.json({error: "The models changed"}, {status: 409}); }) as unknown as typeof fetch;
  try {
    await fetchBytes("/mesh", new AbortController().signal);
    throw new Error("Expected a refusal");
  } catch (error) {
    expect(error).toBeInstanceOf(MeshFetchError);
    expect(error).toMatchObject({status: 409, message: "The models changed"});
  }
  expect(asked).toBe(1);
  expect(loadingRequests()).toEqual([]);
});
