// Deleting trees and bushes in the Editor: picked by a click, gone at once, saved by itself, back by undo.
import type {Page} from "@playwright/test";
import {button, card, centre, dragMouse, expect, openEditor, scene, stillView, test} from "./fixtures";

const AWAY = {x: 100, y: 500};              // (the mouse off the view: no hover box in the picture)
const NEAR_TREE = "nocol_trees_0_0#1";
const FAR_TREE = "nocol_trees_0_0#0";
const box = (page: Page) => page.locator("#hover-box");
const saved = (page: Page) => expect(page.locator("#edit-bar")).toHaveAttribute("data-kept", "saved");     // (the changes kept in the background, not the track)
const VIEW_ALONE = {style: "#edit-bar, #edit-history { visibility: hidden; }"};

/** The picture of the view alone, once it stands still and the mouse is off it. */
async function picture(page: Page) {
  await page.mouse.move(AWAY.x, AWAY.y);
  await stillView(page);
  return scene(page).screenshot(VIEW_ALONE);
}

/** A point of the view that shows the near tree. */
async function findTree(page: Page) {
  const c = await centre(scene(page));
  for (let up = 40; up < c.y - 10; up += 12) {
    await page.mouse.move(c.x - 1, c.y - up);
    await page.mouse.move(c.x, c.y - up);
    if (await expect(box(page)).toContainText(NEAR_TREE, {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y - up};
  }
  throw new Error("no tree found");
}

async function points(page: Page, at: {x: number; y: number}) {
  await page.mouse.move(at.x - 1, at.y);
  await page.mouse.move(at.x, at.y);
}

/** The list as the server has it. */
async function stored(page: Page, name = "alpha") {
  return (await (await page.request.get(`/api/editor/${name}/edits`)).json()) as {base: string; revision: number; outdated: number;
    deleted: {id: string; kind: string; position: number[]}[]};
}

/** The near tree picked and deleted, and saved. */
async function deleteTree(page: Page) {
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await saved(page);
  return at;
}

test("a click picks a tree, Delete takes it away at once, the mouse finds what stood behind it", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree · ");
  await expect(button(page, "Delete")).toBeEnabled();
  await page.keyboard.press("Delete");
  await page.mouse.move(AWAY.x, AWAY.y);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await expect(page.locator("#edit-picked")).toBeHidden();
  await points(page, at);
  await expect(box(page)).not.toContainText(NEAR_TREE);
});

test("what is deleted is saved with the track and is gone after a reload, on this track only", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  const s = await stored(page);
  expect(s.deleted.map(d => d.id)).toEqual([NEAR_TREE]);
  expect(s.deleted[0].kind).toBe("tree");
  expect(s.deleted[0].position[0]).toBeCloseTo(128, 3);     // (the foot of the tree: server.py's make_track)
  expect(s.deleted[0].position[1]).toBeCloseTo(-0.2, 1);    // (trees.SINK_M: a billboard's foot lies in the ground)
  expect(s.deleted[0].position[2]).toBeCloseTo(-130, 3);
  const gone = await picture(page);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect.poll(async () => (await picture(page)).equals(gone)).toBe(true);
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toBeHidden();
  expect((await stored(page, "beta")).deleted).toEqual([]);
});

test("undo brings back the very same picture, redo takes it away again, by keys and buttons", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  await deleteTree(page);
  const gone = await picture(page);
  const c = await centre(scene(page));
  await page.mouse.click(AWAY.x, AWAY.y);       // (off the view: then the keys need the view's focus back)
  await scene(page).focus();
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  await saved(page);
  expect((await stored(page)).deleted).toEqual([]);
  await page.keyboard.press("Control+y");
  await expect.poll(async () => (await picture(page)).equals(gone)).toBe(true);
  await button(page, "↶ Undo").click();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  await button(page, "↷ Redo").click();
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect(scene(page)).toBeFocused();      // (after a button W A S D still fly)
  await button(page, "Discard").click();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  await expect(page.locator("#edit-count")).toBeHidden();
  await button(page, "↶ Undo").click();
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await page.mouse.move(c.x, c.y);
});

test("all trees deleted, the view is the same track built without trees, to the pixel", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "beta", title: "Beta Test", trees: false});
  await openEditor(page, "beta");
  const empty = await picture(page);
  const beta = await stored(page, "beta");
  const answer = await page.request.put("/api/editor/alpha/edits", {data: {base: beta.base, revision: 0, deleted: [], id: "a"}});
  expect(answer.status()).toBe(409);            // (the base of another track is no base)
  const alpha = await stored(page);
  await page.request.put("/api/editor/alpha/edits", {data: {base: alpha.base, revision: alpha.revision, id: "b", deleted: [
    {id: FAR_TREE, position: [40, 0, -200]}, {id: NEAR_TREE, position: [128, 0, -130]}]}});
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveText("2 objects deleted");
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
});

/** A point of the view that shows the parked car. */
async function findCar(page: Page) {
  const c = await centre(scene(page));
  for (let down = -60; down < 200; down += 12) {
    await page.mouse.move(c.x - 1, c.y + down);
    await page.mouse.move(c.x, c.y + down);
    if (await expect(box(page)).toContainText("Parked car", {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y + down};
  }
  throw new Error("no car found");
}

test("a parked car on a track built with the list: picked whole, all of it gone, only it, saved as a car", async ({page, backend}) => {
  await openEditor(page);
  const without = await picture(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const at = await findCar(page);
  await expect(box(page)).toContainText("t_0_0#0");
  await expect(box(page)).toContainText(/Physics\s*Wall/);
  const withCar = await picture(page);
  expect(withCar.equals(without)).toBe(false);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toHaveText("Parked car");
  await page.keyboard.press("Delete");
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(without)).toBe(true);    // (fronts and backs: not a triangle left)
  const s = await stored(page);
  expect(s.deleted.map(d => [d.id, d.kind])).toEqual([["t_0_0#0", "car"]]);
  expect(s.deleted[0].position[0]).toBeCloseTo(128, 1);
  expect(s.deleted[0].position[2]).toBeCloseTo(-40, 1);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await picture(page)).equals(without)).toBe(true);
  await scene(page).focus();
  await page.keyboard.press("Control+z");       // (a new page has nothing to undo: Discard brings it back)
  await button(page, "Discard").click();
  await expect.poll(async () => (await picture(page)).equals(withCar)).toBe(true);
});

/** A point of the middle of the view where the hover box's title is title. */
async function findTitled(page: Page, title: string) {
  const c = await centre(scene(page));
  for (let up = 200; up > -200; up -= 8) {
    await page.mouse.move(c.x - 1, c.y - up);
    await page.mouse.move(c.x, c.y - up);
    const h = page.locator("#hover-box h4").first();
    if (await expect(h).toHaveText(title, {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y - up};
  }
  throw new Error(`no ${title} found`);
}

test("a house and its sign: one by one, or the sign along with the house; undo in any order", async ({page, backend}) => {
  await openEditor(page);
  const empty = await picture(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const whole = await picture(page);
  expect(whole.equals(empty)).toBe(false);

  const sign = await findTitled(page, "Building sign");
  await expect(box(page)).toContainText("t_0_0#1");
  await page.mouse.click(sign.x, sign.y);
  await expect(page.locator("#edit-picked")).toHaveText("Building sign");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  const noSign = await picture(page);
  expect(noSign.equals(whole)).toBe(false);
  expect(noSign.equals(empty)).toBe(false);          // (the house still stands)

  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y);
  await expect(page.locator("#edit-picked")).toHaveText("Building");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("2 objects deleted");
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
  await saved(page);
  expect((await stored(page)).deleted.map(d => [d.id, d.kind])).toEqual([["t_0_0#1", "house sign"], ["t_0_0#0", "house"]]);

  await scene(page).focus();
  await page.keyboard.press("Control+z");            // (the house back: its sign, deleted by itself, stays out)
  await expect.poll(async () => (await picture(page)).equals(noSign)).toBe(true);
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);

  const again = await findTitled(page, "Building");  // (the house alone: its sign goes along)
  await page.mouse.click(again.x, again.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
  await saved(page);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
});

const title = (page: Page) => page.locator("#hover-box h4").first();

/** A point of the view near the wire: thinner than a pixel from here, the mouse only comes near it. */
async function findWire(page: Page) {
  const view = (await scene(page).boundingBox())!, x = view.x + view.width / 2;
  for (let y = view.y + 120; y < view.y + 500; y += 5) {
    await page.mouse.move(x - 1, y);
    await page.mouse.move(x, y);
    if (await expect(title(page)).toHaveText("Power line", {timeout: 250}).then(() => true, () => false)) return {x, y};
  }
  throw new Error("no wire found");
}

/** A point of the view on the pole at the wire's end, step by step along it from the point wire, a little below it (a wire is found
    within some pixels). */
async function findPole(page: Page, wire: {x: number; y: number}, step: number) {
  const view = (await scene(page).boundingBox())!;
  await points(page, wire);
  await expect(title(page)).toHaveText("Power line");       // (the box no more of a pole found before)
  for (let x = wire.x; x > view.x && x < view.x + view.width; x += step) {
    await page.mouse.move(x, wire.y + 14);
    await page.mouse.move(x + Math.sign(step), wire.y + 14);
    if (await expect(title(page)).toHaveText("Power pole", {timeout: 150}).then(() => true, () => false)) return {x: x + Math.sign(step), y: wire.y + 14};
  }
  throw new Error("no pole found");
}

test("a power pole takes its wires along; a wire alone can be found beside it and deleted by itself", async ({page, backend}) => {
  test.slow();                          // (the mouse feels its way along the view)
  await openEditor(page);
  const empty = await picture(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", pole: true});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const whole = await picture(page);
  expect(whole.equals(empty)).toBe(false);

  const at = await findWire(page);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toHaveText("Power line");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  const noWire = await picture(page);
  expect(noWire.equals(whole)).toBe(false);
  expect(noWire.equals(empty)).toBe(false);          // (the pole still stands)
  await scene(page).focus();
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);

  const pole = await findPole(page, at, -2);
  await page.mouse.click(pole.x, pole.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);    // (nothing left hanging in the air)

  await page.keyboard.press("Control+z");       // (all poles of its sort: the same, as a rule)
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);
  expect(await deleteAllOf(page, pole)).toBe("Mark all Power pole (1)");
  await expect(page.locator("#edit-count")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
  await saved(page);
  expect(((await (await page.request.get("/api/editor/alpha/edits")).json()) as {object_sorts: string[]}).object_sorts).toEqual(["pole"]);
});

test("two poles share a span: it stays out while one of them does, and comes back with the last", async ({page, backend}) => {
  test.slow();                          // (the mouse feels its way along the view)
  await openEditor(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", pole: "two"});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const whole = await picture(page);
  const wire = await findWire(page);
  const left = await findPole(page, wire, -2);
  const right = await findPole(page, wire, 2);
  await page.mouse.click(left.x, left.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  const oneOut = await picture(page);
  await points(page, wire);
  await expect(title(page)).not.toHaveText("Power line");
  await page.mouse.click(right.x, right.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("2 objects deleted");
  await page.keyboard.press("Control+z");       // (one pole back: the span still out, as with that one alone)
  await expect.poll(async () => (await picture(page)).equals(oneOut)).toBe(true);
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);
});

test("a parked car on an older build says a new build can delete it, a tree there can still be deleted", async ({page, backend}) => {
  await openEditor(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "older"});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const at = await findCar(page);
  await expect(box(page)).toContainText("no ID of its own");
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toHaveText("Parked car: only a new build can delete it");
  await expect(button(page, "Delete")).toBeDisabled();
  await deleteTree(page);
});

/** Right click at, then the menu's "Mark all …" (label: what it says, at its start), then Delete: all of that sort gone, as a rule. */
async function deleteAllOf(page: Page, at: {x: number; y: number}, label: RegExp | string = /^Mark all /) {
  await page.mouse.click(at.x, at.y, {button: "right"});
  const mark = page.getByRole("menuitem", {name: label});
  const text = await mark.innerText();
  await mark.click();
  await expect(page.locator("#edit-marked")).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-marked")).toBeHidden();
  return text;
}

/** The triangles of each mesh of the track's own kn5, as AC reads it. */
async function meshes(page: Page, name = "alpha") {
  return (await (await page.request.get(`/__test/meshes?name=${name}`)).json()) as Record<string, number>;
}

/** Save, as in a word processor: a track never saved here asks once (first), Overwrite; later it is written at once. */
async function saveTrack(page: Page, first = true) {
  await page.locator("#edit-save").click();
  if (first) await page.locator("#save-dialog").getByRole("button", {name: "Overwrite"}).click();
  await expect(page.locator("#save-dialog")).toBeHidden();
}

test("all of a sort: marked, then deleted, the same picture as a track without them, kept over a reload, back by undo", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "beta", title: "Beta Test", trees: false});
  await openEditor(page, "beta");
  const empty = await picture(page);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const whole = await picture(page);
  const at = await findTree(page);
  const label = await deleteAllOf(page, at);
  expect(label).toMatch(/\(loaded: 2\)$/);
  const sort = /Mark all (\w+)/.exec(label)![1];
  await expect(page.locator("#edit-sorts")).toHaveText(`All deleted: ${sort}`);
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
  await saved(page);
  const s = (await (await page.request.get("/api/editor/alpha/edits")).json()) as {sorts: string[]; deleted: unknown[]};
  expect(s.sorts).toEqual([sort]);
  expect(s.deleted).toEqual([]);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
  await button(page, "Discard").click();
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);
  await scene(page).focus();
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
});

test("the right-click menu: Replace and Edit greyed, Mark all frames and deletes nothing, Esc ends it; a right drag opens none", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y, {button: "right"});
  await expect(page.locator("#view-menu")).toBeVisible();
  await expect(page.getByRole("menuitem", {name: "Replace…"})).toBeDisabled();
  await expect(page.getByRole("menuitem", {name: "Edit…"})).toBeDisabled();
  await expect(page.getByRole("menuitem", {name: "Delete"})).toBeEnabled();
  await page.getByRole("menuitem", {name: /^Mark all /}).click();
  await expect(page.locator("#view-menu")).toBeHidden();
  await expect(page.locator("#edit-marked")).toContainText("marked: Delete deletes them all");
  await page.mouse.move(AWAY.x, AWAY.y);
  const framed = await picture(page);
  expect(framed.equals(before)).toBe(false);
  await scene(page).focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-marked")).toBeHidden();
  expect((await stored(page)).deleted).toEqual([]);
  const view = (await scene(page).boundingBox())!;
  await page.mouse.click(view.x + 200, view.y + 2);       // (the sky: nothing picked, no frame)
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  await page.mouse.click(at.x, at.y, {button: "right"});  // (the menu's own Delete: this one)
  await page.getByRole("menuitem", {name: "Delete"}).click();
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await page.locator("#edit-history").getByRole("button", {name: "↶ Undo"}).click();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  await page.locator("#edit-history").getByRole("button", {name: "↷ Redo"}).click();
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await page.locator("#edit-history").getByRole("button", {name: "↶ Undo"}).click();
  await dragMouse(page, at, {x: at.x + 60, y: at.y}, "right");     // (moves the view, asks for no menu)
  await expect(page.locator("#view-menu")).toBeHidden();
  const c = await centre(scene(page));          // (the road: away and back is a drag too)
  await page.mouse.move(c.x, c.y);
  await page.mouse.down({button: "right"});
  await page.mouse.move(c.x + 60, c.y, {steps: 4});
  await page.mouse.move(c.x, c.y, {steps: 4});
  await page.mouse.up({button: "right"});
  await expect(page.locator("#view-menu")).toBeHidden();
});

test("all parked cars: marked and deleted as a rule; saved, the track's own kn5 is without them, shown as before", async ({page, backend}) => {
  await openEditor(page);
  const without = await picture(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  expect((await meshes(page))["1WALL_cars_0_0"]).toBeGreaterThan(0);
  const at = await findCar(page);
  expect(await deleteAllOf(page, at)).toBe("Mark all Parked car (1)");
  await expect(page.locator("#edit-sorts")).toHaveText("All deleted: Parked car");
  await expect(page.locator("#edit-count")).toBeHidden();         // (a rule, no list of ids)
  await expect.poll(async () => (await picture(page)).equals(without)).toBe(true);
  await saved(page);
  const s = (await (await page.request.get("/api/editor/alpha/edits")).json()) as {object_sorts: string[]; deleted: unknown[]};
  expect([s.object_sorts, s.deleted]).toEqual([["car"], []]);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect(await meshes(page)).not.toHaveProperty("1WALL_cars_0_0");      // (what AC drives)
  await expect.poll(async () => (await picture(page)).equals(without)).toBe(true);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-sorts")).toHaveText("All deleted: Parked car");   // (the work, as left)
  await expect.poll(async () => (await picture(page)).equals(without)).toBe(true);
});

test("a house can't go all at once: no Mark all in its menu, the server refuses it too; its sign can", async ({page, backend}) => {
  await openEditor(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y, {button: "right"});
  await expect(page.locator("#view-menu")).toBeVisible();
  await expect(page.getByRole("menuitem", {name: /^Mark all /})).toHaveCount(0);
  await page.keyboard.press("Escape");
  const sign = await findTitled(page, "Building sign");
  await page.mouse.click(sign.x, sign.y, {button: "right"});
  await expect(page.getByRole("menuitem", {name: "Mark all Building sign (1)"})).toBeVisible();
  const s = await stored(page);
  const put = (sorts: string[]) => page.request.put("/api/editor/alpha/edits", {data: {base: s.base, revision: s.revision, id: sorts.join(),
                                                                                       deleted: [], object_sorts: sorts}});
  expect((await put(["house"])).status()).toBe(400);
  expect((await put(["bench"])).status()).toBe(400);           // (none on this track)
  expect((await put(["house sign"])).status()).toBe(200);
});

test("read again from a tree deleted alone to only its whole sort: the tree stays out", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "beta", title: "Beta Test", trees: false});
  await openEditor(page, "beta");
  const empty = await picture(page);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  const sort = /Tree · (\w+)/.exec(await page.locator("#edit-picked").innerText())![1];    // (both trees are of one sort: server.py)
  await page.keyboard.press("Delete");
  await saved(page);
  await page.keyboard.press("Control+z");
  await saved(page);
  const s = await stored(page);                 // (another tab: the tree back by its id, its sort gone whole)
  await page.request.put("/api/editor/alpha/edits", {data: {base: s.base, revision: s.revision, id: "other", deleted: [], sorts: [sort]}});
  await page.keyboard.press("Control+y");       // (the tree out by its id here: refused, the other tab's list is newer)
  await expect(page.locator("#edit-stuck")).toContainText("changed elsewhere");
  await page.getByRole("button", {name: "Read again"}).click();
  await expect(page.locator("#edit-sorts")).toHaveText(`All deleted: ${sort}`);
  await expect(page.locator("#edit-count")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(empty)).toBe(true);
});

test("a tree deleted by itself stays out when its sort comes back", async ({page}) => {
  test.slow();                          // (the mouse feels its way to the far tree)
  await openEditor(page);
  await deleteTree(page);
  const one = await picture(page);
  const c = await centre(scene(page));
  let far: {x: number; y: number} | null = null;       // (the far tree stands left of the road, high in the view)
  for (let x = c.x - 520; x < c.x - 200 && !far; x += 18) {
    for (let y = c.y - 370; y < c.y - 230 && !far; y += 18) {
      await page.mouse.move(x - 1, y);
      await page.mouse.move(x, y);
      if (await expect(box(page)).toContainText(FAR_TREE, {timeout: 150}).then(() => true, () => false)) far = {x, y};
    }
  }
  expect(far).not.toBeNull();
  await deleteAllOf(page, far!);
  await expect(page.locator("#edit-sorts")).toBeVisible();
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(one)).toBe(true);
});

test("Save: asked once, then written at once; the kn5 AC drives is without the tree, the work stays shown; Play saves first", async ({page}) => {
  await openEditor(page);
  const whole = await picture(page);
  const trees = (await meshes(page))["nocol_trees_0_0"];
  await expect(page.locator("#edit-saved")).toHaveText("");      // (nothing changed: nothing to say)
  await expect(page.locator("#edit-save")).toBeDisabled();       // (nothing to save)
  await deleteTree(page);
  const preview = await picture(page);
  await expect(page.locator("#edit-kept")).toHaveCount(0);       // (the changes kept in the background: nothing to see)
  await page.locator("#edit-save").click();     // (the first time: asked)
  await expect(page.locator("#save-name")).toHaveValue("Alpha Test");
  await page.locator("#save-dialog").getByRole("button", {name: "Overwrite"}).click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect(page.locator("#edit-save")).toBeDisabled();       // (saved: nothing more to save)
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees - 8);     // (one billboard: 8 triangles)
  expect((await picture(page)).equals(preview)).toBe(true);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");

  await page.reload();                          // (back from AC: the work as left)
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect.poll(async () => (await picture(page)).equals(preview)).toBe(true);
  await button(page, "Discard").click();        // (all back: the source still holds the tree)
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);
  await expect(page.locator("#edit-saved")).toHaveText("Not saved");
  await page.locator("#edit-play").click();     // (Play: saved first, at once now, then AC)
  await expect(page.locator("#save-dialog")).toBeHidden();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees);
  await expect.poll(async () => (await (await page.request.get("/__test/calls")).json()) as unknown[][]).toContainEqual(["play", "alpha"]);
  await scene(page).focus();
  await deleteTree(page);
  await page.keyboard.press("Control+s");       // (Ctrl+S: Save)
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees - 8);
});

test("Save as new track: only under a new name, shown with the work and its undo, its name in the track field; the track itself as it was", async ({page}) => {
  await openEditor(page);
  const whole = await picture(page);
  const trees = (await meshes(page))["nocol_trees_0_0"];
  await deleteTree(page);
  const preview = await picture(page);
  await page.locator("#edit-play").click();     // (never saved: Play asks first, Cancel starts nothing)
  await expect(page.locator("#save-dialog")).toBeVisible();
  await page.locator("#save-dialog").getByRole("button", {name: "Cancel"}).click();
  expect((await (await page.request.get("/__test/calls")).json()) as unknown[][]).not.toContainEqual(["play", "alpha"]);
  await page.locator("#edit-save-more").click();
  await expect(page.locator("#save-name")).toHaveValue("Alpha Test");
  const go = page.locator("#save-dialog").getByRole("button", {name: "Save as new track"});
  const overwrite = page.locator("#save-dialog").getByRole("button", {name: "Overwrite"});
  await expect(page.locator("#save-taken")).toContainText("makes “Alpha Test (copy)”");
  await expect(overwrite).toBeEnabled();
  await page.locator("#save-name").fill("Beta Test");
  await expect(page.locator("#save-taken")).toContainText("Another track is called “Beta Test”");
  await expect(go).toBeDisabled();
  await expect(overwrite).toBeDisabled();         // (another name: a new track only)
  await page.locator("#save-name").fill("Alpha Edit");
  await expect(go).toBeEnabled();
  await go.click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_edit");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect.poll(async () => (await picture(page)).equals(preview)).toBe(true);
  expect((await meshes(page, "alpha_edit"))["nocol_trees_0_0"]).toBe(trees - 8);
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees);
  await scene(page).focus();
  await page.keyboard.press("Control+z");       // (undo came along)
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toBeHidden();
  await expect(page.locator("#edit-saved")).toHaveText("");
  await page.locator("#edit-save-more").click();    // (Cancel writes nothing)
  await page.locator("#save-dialog").getByRole("button", {name: "Cancel"}).click();
  await expect(page.locator("#save-dialog")).toBeHidden();
  await expect(page.locator('#edit-track option[value="alpha_edit_2"]')).toHaveCount(0);
});

test("the first Save can make a new track too; a new track after Overwrite leaves the track as saved", async ({page}) => {
  await openEditor(page);
  const trees = (await meshes(page))["nocol_trees_0_0"];
  await deleteTree(page);
  await page.locator("#edit-save").click();
  await page.locator("#save-name").fill("Alpha Edit");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_edit");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect((await meshes(page, "alpha_edit"))["nocol_trees_0_0"]).toBe(trees - 8);
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees);

  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await deleteTree(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await button(page, "Discard").click();        // (the new track gets everything back, this one stays as saved)
  await saved(page);
  await page.locator("#edit-save-more").click();
  await page.locator("#save-name").fill("Alpha Whole");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_whole");
  expect((await meshes(page, "alpha_whole"))["nocol_trees_0_0"]).toBe(trees);
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees - 8);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
});

test("a new track under a name another tab took meanwhile, or none: the server refuses it too", async ({page}) => {
  await openEditor(page);
  const {revision} = await stored(page);
  for (const title of ["Beta Test", "Alpha Test", " "]) {
    const r = await page.request.post("/api/editor/alpha/save", {data: {copy: true, title, revision}});
    expect(r.status()).toBe(409);
  }
  await expect(page.locator('#edit-track option[value="beta_test"]')).toHaveCount(0);
  const r = await page.request.post("/api/editor/alpha/save", {data: {copy: true, title: "Alpha New", revision}});
  expect(((await r.json()) as {name: string}).name).toBe("alpha_new");
});

test("the name left as it is, a new track gets its (copy) by itself", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  await page.locator("#edit-save").click();
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_test_copy");
  await expect(page.locator("#edit-track option:checked")).toHaveText(/Alpha Test \(copy\)/);
  await page.locator("#t-mine").click();
  const list = page.locator("#pane-mine button");
  await expect(list.filter({hasText: "Alpha Test"})).toHaveText([/^Alpha Test(?! \(copy\))/]);     // (the original is still a build)
  await button(page, "Edited").click();
  await list.filter({hasText: "Alpha Test (copy)"}).click();
  await card(page).getByRole("button", {name: "Delete track"}).click();
  await expect(list).toHaveCount(0);
  await expect(card(page)).toContainText("No edited tracks yet");
});

test("nothing changed: Play starts the track at once, nothing asked", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-play").click();
  await expect(page.locator("#save-dialog")).toBeHidden();
  await expect.poll(async () => (await (await page.request.get("/__test/calls")).json()) as unknown[][]).toContainEqual(["play", "alpha"]);
});

test("while the track is written nothing changes: Saved means what was written, and undo works afterwards", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  let write = () => {};
  const held = new Promise<void>(ok => { write = ok; });
  await page.route("**/api/editor/alpha/save", async route => {
    await held;
    await route.continue();
  });
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText("Saving …");
  await page.keyboard.press("Control+z");       // (the view has the keys again after the dialog)
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  write();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toBeHidden();
  await expect(page.locator("#edit-saved")).toHaveText("Not saved");
});

test("in the dialog's name field the keys are the field's: Delete and Ctrl+Z leave the track alone", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-save-more").click();
  await expect(page.locator("#save-name")).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("Delete");
  await expect(page.locator("#save-name")).toHaveValue("lpha Test");
  await expect(page.locator("#edit-count")).toBeHidden();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Delete");          // (the view has the keys again: the tree still picked)
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await saved(page);
  await page.locator("#edit-save-more").click();
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
});

test("a change that can't be kept: Save says so and writes nothing", async ({page, faultsAllowed}) => {
  faultsAllowed.on = true;
  await openEditor(page);
  const trees = (await meshes(page))["nocol_trees_0_0"];
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() === "PUT") await route.fulfill({status: 500, json: {error: "disk full"}});
    else await route.continue();
  });
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-kept")).toHaveText("Changes not kept: trying again");
  await saveTrack(page);
  await expect(page.locator("#edit-made")).toContainText("could not be kept");
  expect((await meshes(page))["nocol_trees_0_0"]).toBe(trees);
});

test("a track saved in the Editor stands under Edited: it opens and can be copied, no build replaces it", async ({page, backend}) => {
  await openEditor(page);
  await deleteTree(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect(page.locator('#edit-track optgroup[label="Edited"] option')).toHaveText(["Alpha Test"]);
  await Promise.all([page.waitForResponse("**/api/tracks"), page.locator("#t-mine").click()]);
  const alpha = page.locator("#pane-mine button", {hasText: "Alpha Test"});
  await expect(alpha).toHaveCount(0);
  await button(page, "Edited").click();
  await alpha.click();
  await expect(card(page)).toContainText("then edited");
  await expect(card(page).getByRole("textbox", {name: "Track code"})).toHaveCount(0);     // (a code builds the track without its edits)
  await expect(card(page).getByRole("button", {name: "Delete track"})).toBeVisible();
  await expect(page.locator("#go")).toHaveText("Edit");
  for (const data of [{name: "alpha"}, {name: "alpha", drop_edits: true}]) {     // (nor by asking the server)
    expect((await page.request.post("/api/rebuild", {data})).status()).toBe(409);
  }
  const same = await page.request.post("/api/build", {data: {name: "alpha", title: "Alpha", points: [[42.9, 9.36], [42.902, 9.36]], width: 100}});
  expect(same.status()).toBe(409);              // (a new track of the same name doesn't replace it)
  expect(((await same.json()) as {error: string}).error).toContain("choose another name");
  await page.locator("#go").click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);

  await page.locator("#t-mine").click();
  await alpha.click();
  await button(page, "Build as copy").click();
  await expect.poll(backend.calls).toContainEqual(["build", "alpha_2", "Alpha Test (2)"]);
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");
  await expect(page.locator("#pane-mine button", {hasText: "Alpha Test (2)"})).toBeVisible();      // (a build: under Built)
  await expect(page.locator("#go")).toHaveText("Rebuild");
});

test("a track with unsaved changes stays under Built, and warns before a build", async ({page}) => {
  await openEditor(page, "beta");
  await deleteTree(page);
  const asked: string[] = [];
  page.removeAllListeners("dialog");
  page.on("dialog", d => { asked.push(d.message()); void d.dismiss(); });
  await Promise.all([page.waitForResponse("**/api/tracks"), page.locator("#t-mine").click()]);     // (the list with its count of changes)
  await page.locator("#pane-mine button", {hasText: "Beta Test"}).click();
  await page.locator("#go").click();
  await expect.poll(() => asked.length).toBe(1);
  expect(asked[0]).toContain("1 unsaved change");
});

test("the road can't be deleted: it says so, Delete does nothing", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  const c = await centre(scene(page));
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#edit-picked")).toContainText("Road surface: can't be deleted yet");
  await expect(button(page, "Delete")).toBeDisabled();
  await page.keyboard.press("Delete");
  await page.mouse.move(AWAY.x, AWAY.y);
  await expect(page.locator("#edit-count")).toBeHidden();
  expect((await picture(page)).equals(before)).toBe(true);
  expect((await stored(page)).revision).toBe(0);
});

test("dragging over a tree picks nothing; the sky ends a pick", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await dragMouse(page, at, {x: at.x + 60, y: at.y}, "left");
  await expect(page.locator("#edit-picked")).toBeHidden();
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const again = await findTree(page);
  await page.mouse.click(again.x, again.y);
  await expect(page.locator("#edit-picked")).toBeVisible();
  const view = (await scene(page).boundingBox())!;
  await page.mouse.click(view.x + 200, view.y + 2);
  await expect(page.locator("#edit-picked")).toBeHidden();
});

test("the frame around a picked tree goes when it is deleted, and it stands out in the picture", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  expect((await picture(page)).equals(before)).toBe(false);
  await page.keyboard.press("Delete");
  await saved(page);
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("built again, older changes stay but are not applied, and nothing is mixed with them", async ({page, backend}) => {
  await openEditor(page);
  const before = await picture(page);
  await deleteTree(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test"});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-outdated")).toContainText("1 older change belongs to an earlier build");
  await expect(page.locator("#edit-count")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await expect(button(page, "Delete")).toBeDisabled();
  expect((await stored(page)).outdated).toBe(1);
  await page.getByRole("button", {name: "Give up"}).click();
  await expect(page.locator("#edit-outdated")).toBeHidden();
  await saved(page);
  expect((await stored(page)).outdated).toBe(0);
  const next = await findTree(page);
  await page.mouse.click(next.x, next.y);
  await expect(button(page, "Delete")).toBeEnabled();
});

test("built again under an open view: nothing is saved for a track not shown; reading again brings the new build", async ({page, backend}) => {
  await openEditor(page);
  const at = await findTree(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test"});
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-stuck")).toContainText("changed elsewhere");
  expect((await stored(page)).deleted).toEqual([]);
  const asked = page.waitForRequest("**/api/editor/alpha/index");
  await page.getByRole("button", {name: "Read again"}).click();
  await asked;                                  // (the view loads the new build too)
  await expect(page.locator("#edit-stuck")).toBeHidden();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const next = await findTree(page);
  await page.mouse.click(next.x, next.y);
  await page.keyboard.press("Delete");
  await saved(page);
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([NEAR_TREE]);
});

test("two tabs: the second one's save is refused instead of overwriting the first's, reading again shows both", async ({page, context}) => {
  await openEditor(page);
  const other = await context.newPage();
  await openEditor(other);
  await page.bringToFront();                    // (a tab behind draws nothing and gets no keys)
  await deleteTree(page);
  await other.bringToFront();
  const at = await findTree(other);
  await other.mouse.click(at.x, at.y);
  await other.keyboard.press("Delete");
  await expect(other.locator("#edit-stuck")).toContainText("changed elsewhere");
  await expect(button(other, "Delete")).toBeDisabled();
  await other.getByRole("button", {name: "Read again"}).click();
  await expect(other.locator("#edit-stuck")).toBeHidden();
  await expect(other.locator("#edit-count")).toHaveText("1 object deleted");
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([NEAR_TREE]);
  await other.close();
});

test("a failed save says so and goes through by itself", async ({page, faultsAllowed}) => {
  faultsAllowed.on = true;
  await openEditor(page);
  let failing = true;
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() === "PUT" && failing) await route.fulfill({status: 500, json: {error: "disk full"}});
    else await route.continue();
  });
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-kept")).toHaveText("Changes not kept: trying again");
  failing = false;
  await expect(page.locator("#edit-bar")).toHaveAttribute("data-kept", "saved", {timeout: 10000});     // (edits.ts: RETRY_MS)
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([NEAR_TREE]);
});

test("leaving the track right after a change still saves it", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await page.locator("#edit-track").selectOption("beta");
  await expect.poll(async () => (await stored(page)).deleted.length).toBe(1);
});

test("the keys count only in the view: Delete in the settings' fields or the dropdown deletes nothing", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-track").focus();
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toBeHidden();
});
