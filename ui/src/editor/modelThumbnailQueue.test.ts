import {expect, test} from "bun:test";
import {ModelThumbnailQueue} from "./modelThumbnailQueue";

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

test("visible cards share one sequential renderer, deduplicate a model, and reuse finished pictures", async () => {
  const calls: string[] = [], finishes: ((blob: Blob) => void)[] = [];
  const queue = new ModelThumbnailQueue(async () => null, async id => {
    calls.push(id); return new Promise<Blob>(resolve => finishes.push(resolve));
  }, async () => {});
  const a = queue.get("a", new AbortController().signal), again = queue.get("a", new AbortController().signal);
  const b = queue.get("b", new AbortController().signal);
  await tick(); expect(calls).toEqual(["a"]);
  const picture = new Blob(["a"], {type: "image/png"}); finishes.shift()!(picture);
  expect(await a).toBe(picture); expect(await again).toBe(picture);
  await tick(); expect(calls).toEqual(["a", "b"]);
  finishes.shift()!(new Blob(["b"])); await b;
  expect(await queue.get("a", new AbortController().signal)).toBe(picture);
  expect(calls).toHaveLength(2);
});

test("a closed or paged-away card cancels its work without cancelling another subscriber", async () => {
  const calls: string[] = [];
  let finish!: (blob: Blob) => void;
  const queue = new ModelThumbnailQueue(async () => null, async (id, signal) => {
    calls.push(id); signal.throwIfAborted(); return new Promise<Blob>(resolve => { finish = resolve; });
  }, async () => {});
  const first = new AbortController(), abandoned = new AbortController();
  const a = queue.get("a", first.signal).catch(error => error.name);
  const shared = queue.get("a", new AbortController().signal);
  const oldPage = queue.get("old-page", abandoned.signal).catch(error => error.name);
  await tick(); first.abort(); abandoned.abort();
  expect(await a).toBe("AbortError"); expect(await oldPage).toBe("AbortError");
  finish(new Blob(["kept"])); await shared; await tick();
  expect(calls).toEqual(["a"]);
});

test("a new page uses stored PNGs after a reload; blocked storage and a failed model do not stop the queue", async () => {
  const saved = new Blob(["saved"], {type: "image/png"});
  const store = new Map<string, Blob>([["stored", saved]]);
  const calls: string[] = [];
  const queue = new ModelThumbnailQueue(async id => store.get(id) ?? null, async id => {
    calls.push(id); if (id === "broken") throw new Error("bad model"); return new Blob([id]);
  }, async () => { throw new Error("storage disabled"); });
  expect(await queue.get("stored", new AbortController().signal)).toBe(saved);
  await expect(queue.get("broken", new AbortController().signal)).rejects.toThrow("bad model");
  expect((await queue.get("good", new AbortController().signal)).size).toBe(4);
  expect(calls).toEqual(["broken", "good"]);
});

test("the last subscriber aborts an active load, and the same model can be requested again", async () => {
  let attempts = 0, active = 0, peak = 0;
  const queue = new ModelThumbnailQueue(async () => null, async (_id, signal) => {
    attempts++; active++; peak = Math.max(peak, active);
    try {
      if (attempts === 1) await new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(signal.reason), {once: true}));
      return new Blob(["retry"]);
    } finally { active--; }
  }, async () => {});
  const controller = new AbortController();
  const old = queue.get("a", controller.signal).catch(error => error.name);
  await tick(); controller.abort();
  const retry = queue.get("a", new AbortController().signal);
  expect(await old).toBe("AbortError"); expect((await retry).size).toBe(5);
  expect(attempts).toBe(2); expect(peak).toBe(1);
});

test("selecting an object promotes its existing picture job ahead of the remaining cards", async () => {
  const calls: string[] = [], finishes: ((blob: Blob) => void)[] = [];
  const queue = new ModelThumbnailQueue(async () => null, async id => {
    calls.push(id); return new Promise<Blob>(resolve => finishes.push(resolve));
  }, async () => {});
  const first = queue.get("first", new AbortController().signal);
  const next = queue.get("next", new AbortController().signal);
  const card = queue.get("selected", new AbortController().signal);
  await tick();
  const preview = queue.get("selected", new AbortController().signal, true);
  finishes.shift()!(new Blob(["first"])); await first; await tick();
  expect(calls).toEqual(["first", "selected"]);
  const selected = new Blob(["selected"]); finishes.shift()!(selected);
  expect(await card).toBe(selected); expect(await preview).toBe(selected);
  await tick(); finishes.shift()!(new Blob(["next"])); await next;
  expect(calls).toEqual(["first", "selected", "next"]);
});
