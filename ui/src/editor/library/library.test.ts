import {expect, test} from "bun:test";
import {repeatHeight, groundTextureProblem, prepareModelFile} from "./library";

test("cancelling a model import does not overlap server preparation with the next file", async () => {
  const before = globalThis.fetch, requests: RequestInit[] = [];
  let release!: (response: Response) => void, started!: () => void;
  const ready = new Promise<void>(resolve => { started = resolve; });
  globalThis.fetch = (async (_url, options) => {
    requests.push(options!);
    if (requests.length === 1) { started(); return new Promise<Response>(resolve => { release = resolve; }); }
    return Response.json({token: "second"});
  }) as typeof fetch;
  try {
    const cancelled = new AbortController();
    const first = prepareModelFile(new File(["first"], "first.glb"), cancelled.signal);
    await ready;
    cancelled.abort();
    const second = prepareModelFile(new File(["second"], "second.glb"), new AbortController().signal);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(requests).toHaveLength(1);
    release(Response.json({token: "first"}));
    await first;
    expect(await second).toMatchObject({token: "second"});
    expect(requests).toHaveLength(2);
  } finally { globalThis.fetch = before; release?.(Response.json({token: "cancelled"})); }
});

test("changing import width keeps the unedited height proportional to the source image", () => {
  expect(repeatHeight("2", [2048, 1024])).toBe("1");
  expect(repeatHeight("4", [2048, 1024])).toBe("2");
  expect(repeatHeight("3", [1024, 1024])).toBe("3");
});

test("transparent textures stay in the library but cannot be applied to ground", () => {
  expect(groundTextureProblem({source: {alpha: true}}, null)).toContain("opaque");
  expect(groundTextureProblem({source: {alpha: false}}, null)).toBeNull();
  expect(groundTextureProblem(null, "Select ground")).toBe("Select ground");
});
