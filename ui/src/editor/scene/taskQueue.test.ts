import {expect, test} from "bun:test";
import {oneByOne} from "./taskQueue";

test("original textures take the next free slot before queued masks", async () => {
  const queue = oneByOne(1), order: string[] = [];
  let release!: () => void;
  const first = queue(() => new Promise<void>(resolve => { release = resolve; }));
  const mask = queue(async () => { order.push("mask"); });
  const original = queue(async () => { order.push("original"); }, true);
  release();
  await Promise.all([first, mask, original]);
  expect(order).toEqual(["original", "mask"]);
});

test("a rejected job releases its slot so the next queued job completes", async () => {
  const queue = oneByOne(1), order: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const failed = queue(async () => { await gate; throw new Error("transfer failed"); });
  void failed.catch(() => {});
  const next = queue(async () => { order.push("next"); });
  release();
  await expect(failed).rejects.toThrow("transfer failed");
  await next;
  expect(order).toEqual(["next"]);
});

test("a new arrival cannot steal a slot already handed to a waiting job", async () => {
  const queue = oneByOne(1), order: string[] = [];
  let release!: () => void;
  const first = queue(() => new Promise<void>(resolve => { release = resolve; }));
  const waiting = queue(async () => { order.push("waiting"); });
  const arrival = first.then(() => queue(async () => { order.push("arrival"); }));
  release();
  await Promise.all([first, waiting, arrival]);
  expect(order).toEqual(["waiting", "arrival"]);
});
