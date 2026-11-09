import {expect, test} from "bun:test";
import {TrackEdits, type Removed} from "./edits";
import {tree, json, server, settle, started} from "./edits.fixture";

test("a late answer never brings an older list back: the newer one follows with the new revision", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  expect(s.asked).toHaveLength(1);
  edits.remove([tree(2)]);
  edits.saveNow();                      // (one at a time: it waits for the answer)
  await settle();
  expect(s.asked).toHaveLength(1);
  s.asked[0].answer(json({revision: 4}));
  await settle();
  await settle();
  expect(s.asked).toHaveLength(2);
  expect(s.asked[1].body.revision).toBe(4);
  expect(s.asked[1].body.deleted).toHaveLength(2);
  s.asked[1].answer(json({revision: 5}));
  await settle();
  await settle();
  expect(edits.state().save).toBe("saved");
});

test("a conflict stops the saving and the changes until read again", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "changed"}, 409));
  await settle();
  await settle();
  expect(edits.state().save).toBe("stuck");
  expect(edits.canEdit()).toBe(false);
  edits.remove([tree(2)]);
  expect(edits.state().removed).toHaveLength(1);
  await edits.start();
  expect(edits.state().removed).toEqual([]);
  expect(edits.canEdit()).toBe(true);
});

test("a failed save stays to be saved", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "no disk"}, 500));
  await settle();
  await settle();
  expect(edits.state().save).toBe("failed");
  expect(edits.state().error).toBe("no disk");
  edits.saveNow();
  await settle();
  expect(s.asked).toHaveLength(2);
});

test("stopping saves what is left, and asks the browser to finish it", async () => {
  const seen: RequestInit[] = [];
  const edits = new TrackEdits("t", (_url, options) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 0, deleted: [], outdated: 0}));
    seen.push(options);
    return Promise.resolve(json({revision: 1}));
  });
  edits.bind("b");
  await edits.start();
  edits.remove([tree(1)]);
  edits.stop();
  await settle();
  expect(seen).toHaveLength(1);
  expect(seen[0].keepalive).toBe(true);
});

test("changes from an older build block editing until given up", async () => {
  const seen: RequestInit[] = [];
  const edits = new TrackEdits("t", (_url, options) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 2, deleted: [], outdated: 5}));
    seen.push(options);
    return Promise.resolve(json({revision: 3}));
  });
  edits.bind("b");
  await edits.start();
  expect(edits.state().outdated).toBe(5);
  edits.remove([tree(1)]);
  expect(edits.state().removed).toEqual([]);
  edits.discardOutdated();
  await settle();
  expect(JSON.parse(String(seen[0].body)).deleted).toEqual([]);
  expect(edits.canEdit()).toBe(true);
});

test("a list of another build than the view shows changes nothing, whichever came first", async () => {
  const late = server(), first = new TrackEdits("t", late.send);
  await first.start();                  // (the list is there, the view not yet)
  expect(first.canEdit()).toBe(false);
  first.remove([tree(1)]);
  expect(first.state().removed).toEqual([]);
  first.bind("older");
  expect(first.viewBehind()).toBe(true);
  expect(first.state().save).toBe("stuck");
  first.bind("b");                      // (the view loaded the track again)
  expect(first.state().save).toBe("saved");
  expect(first.state().error).toBeNull();
  first.remove([tree(1)]);
  expect(first.state().removed).toHaveLength(1);
});

test("a save sends the state of the file the view shows", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  expect((s.asked[0].body as unknown as {base: string}).base).toBe("b");
});

test("a page closing with a save under way doesn't wait: its save goes at once, naming the other", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  edits.remove([tree(2)]);
  edits.saveNow(true);
  await settle();
  expect(s.asked).toHaveLength(2);
  const [one, two] = s.asked.map(a => a.body as unknown as {id: string; unanswered: string[]; deleted: Removed[]});
  expect(two.unanswered).toEqual([one.id]);
  expect(two.deleted).toHaveLength(2);
});

test("an answer lost on the way: the next save names it, and goes through", async () => {
  const send = (_url: string, options?: RequestInit) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 3, deleted: [], outdated: 0}));
    bodies.push(JSON.parse(String(options.body)));
    return bodies.length === 1 ? Promise.reject(new Error("connection lost")) : Promise.resolve(json({revision: 5}));
  };
  const bodies: {id: string; unanswered: string[]; revision: number}[] = [];
  const edits = new TrackEdits("t", send);
  edits.bind("b");
  await edits.start();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  expect(edits.state().save).toBe("failed");
  edits.saveNow();
  await settle();
  await settle();
  expect(bodies[1].unanswered).toEqual([bodies[0].id]);
  expect(edits.state().save).toBe("saved");
});

test("what can't ever go through stops instead of trying for ever", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "no object to delete"}, 400));
  await settle();
  await settle();
  expect(edits.state().save).toBe("stuck");
  expect(edits.state().error).toBe("no object to delete");
});

test("the revision of what is saved, none while it can't get there", async () => {
  const {s, edits} = await started();
  expect(await edits.saved()).toBe(3);
  edits.remove([tree(1)]);
  edits.saveNow();
  await settle();
  s.asked[0].answer(json({error: "no disk"}, 500));
  await settle();
  await settle();
  expect(await edits.saved()).toBeNull();
});

test("a change undone before it went out is saved: nothing to send", async () => {
  const {s, edits} = await started();
  edits.remove([tree(1)]);
  edits.undo();
  expect(edits.state().save).toBe("waiting");
  edits.saveNow();
  await settle();
  expect(s.asked).toHaveLength(0);
  expect(edits.state().save).toBe("saved");
});
