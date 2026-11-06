// Deleting in the Editor: trees, cars, houses and wires picked by a click, all of a sort, gone at once, back by undo.
import {button, centre, dragMouse, expect, openEditor, scene, test} from "./fixtures";
import {AWAY, FAR_TREE, NEAR_TREE, box, deleteAllOf, deleteTree, findCar, findPole, findTitled, findTree, findWire, meshes, picture, points, saveTrack, saved, stored, title} from "./edit-helpers";

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

test("the road can't be deleted: with click deletes it says so, Delete does nothing", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  const c = await centre(scene(page));
  await page.keyboard.press("x");
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
