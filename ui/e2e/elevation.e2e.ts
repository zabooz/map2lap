// Elevation, the Editor's brush: a click, held, its keys, strokes on their way; and X, where each click deletes.
import {button, centre, expect, openEditor, openSettings, scene, test} from "./fixtures";
import {box, brushStroke, deleteTree, findTree, heights, picture, saveTrack, saved} from "./edit-helpers";

test("the brush: a stroke raises the ground with what stands there, shows at once, Ctrl+Z takes it back whole", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  await page.locator("#edit-elevation").click();
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("40");
  await page.locator("#edit-elevation-set").getByLabel("Height").fill("300");
  await brushStroke(page);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  const h = await heights(page);
  expect(Math.max(...h[0].mm)).toBeGreaterThanOrEqual(3000);       // (a click: one height, a slow machine's a little more)
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await scene(page).click({position: {x: 5, y: 5}, button: "right"});
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await saved(page);
  expect(await heights(page)).toEqual([]);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("the brush: Shift or Lower goes down, Esc drops a stroke under way and ends the brush", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  await button(page, "Lower").click();
  await brushStroke(page);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  expect(Math.min(...(await heights(page))[0].mm)).toBeLessThanOrEqual(-50);
  await button(page, "Raise").click();
  await page.keyboard.down("Shift");
  await brushStroke(page);
  await page.keyboard.up("Shift");
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
  await saved(page);
  expect(Math.min(...(await heights(page))[1].mm)).toBeLessThanOrEqual(-50);

  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y + 60);
  await page.mouse.down();
  await page.mouse.move(c.x, c.y + 30);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
  await expect(page.locator("#edit-elevation-set")).toBeHidden();
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
});

test("the brush: keys in its numbers stay there, a click on the sky is no stroke, what it can't be is said", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  await page.locator("#edit-elevation").click();
  const radius = page.locator("#edit-elevation-set").getByLabel("Radius");
  await radius.fill("2");
  await radius.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await scene(page).click({position: {x: 5, y: 5}});        // (the sky, above the horizon)
  await page.waitForTimeout(100);
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await radius.fill("1");
  await brushStroke(page);
  await expect(page.locator("#edit-tool-note")).toContainText("Not changed: No brush of that size");
  await expect(page.locator("#edit-heights")).toHaveCount(0);
});

test("the brush: Save retains the stroke after reload and Discard removes only a later unsaved stroke", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("40");
  await page.locator("#edit-elevation-set").getByLabel("Height").fill("300");
  await brushStroke(page);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  const raised = await picture(page);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await expect.poll(async () => (await picture(page)).equals(raised)).toBe(true);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect.poll(async () => (await picture(page)).equals(raised)).toBe(true);
  await expect(button(page, "Revert to saved")).toBeDisabled();
  await page.locator("#edit-elevation").click();
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("40");
  await page.locator("#edit-elevation-set").getByLabel("Height").fill("300");
  await brushStroke(page); await saved(page);
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
  await expect(page.locator("#edit-saved")).toHaveText("Not saved");
  await button(page, "Revert to saved").click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await expect.poll(async () => (await picture(page)).equals(raised)).toBe(true);
});

test("the brush: a stroke on its way when Discard is pressed goes too, and strokes keep their order", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  await brushStroke(page);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  const first = (await heights(page))[0].id;
  let answer = 0;
  await page.route("**/brush", async route => {       // (the first of the two answered last)
    const wait = answer++ === 0 ? 400 : 0;
    const r = await route.fetch();
    await new Promise(ok => setTimeout(ok, wait));
    await route.fulfill({response: r});
  });
  await button(page, "Lower").click();
  await brushStroke(page);
  await button(page, "Raise").click();
  await brushStroke(page);
  await expect(page.locator("#edit-heights")).toHaveText("3 height changes");
  await saved(page);
  const made = await heights(page);
  expect(made[0].id).toBe(first);
  expect(Math.min(...made[1].mm)).toBeLessThan(0);    // (Lower first, as it was made)
  expect(Math.max(...made[2].mm)).toBeGreaterThan(0);

  answer = 0;
  await brushStroke(page);
  await button(page, "Revert to saved").click();
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await saved(page);
  expect(await heights(page)).toEqual([]);
});

test("the brush: a stroke on its way goes into a Save", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await page.route("**/brush", async route => {
    const r = await route.fetch();
    await new Promise(ok => setTimeout(ok, 400));
    await route.fulfill({response: r});
  });
  await page.locator("#edit-elevation").click();
  await brushStroke(page);
  await page.keyboard.press("Control+s");            // (as it looks now nothing is to be saved: the stroke is still on its way)
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await saved(page);
  const r = await (await page.request.get("/api/editor/alpha/edits")).json() as {saved: {heights: string[]}};
  expect(r.saved.heights.length).toBe(1);
});

test("the brush: Play waits for a stroke on its way, and saves it first", async ({page, backend}) => {
  await openEditor(page);
  await deleteTree(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await page.route("**/brush", async route => {
    const r = await route.fetch();
    await new Promise(ok => setTimeout(ok, 400));
    await route.fulfill({response: r});
  });
  await page.locator("#edit-elevation").click();
  await brushStroke(page);
  await page.locator("#edit-play").click();
  await expect.poll(backend.calls).toContainEqual(["play", "alpha"]);
  const r = await (await page.request.get("/api/editor/alpha/edits")).json() as {saved: {heights: string[]}};
  expect(r.saved.heights.length).toBe(1);
});

test("the brush: a stroke on its way when the track is left isn't lost", async ({page}) => {
  await openEditor(page);
  await page.route("**/brush", async route => {
    const r = await route.fetch();
    await new Promise(ok => setTimeout(ok, 400));
    await route.fulfill({response: r});
  });
  await page.locator("#edit-elevation").click();
  await brushStroke(page);
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await heights(page)).length).toBe(1);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
});

test("the brush: only what the server names is fetched again, and what can't be fetched is said", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  const asked: string[] = [];
  page.on("request", r => { if (/\/mesh\/\d+\?/.test(r.url())) asked.push(r.url()); });
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("3");
  await brushStroke(page);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  await expect.poll(() => asked.length).toBeGreaterThan(0);
  const index = await (await page.request.get("/api/editor/alpha/index")).json() as {meshes: unknown[]};
  expect(asked.length).toBeLessThan(index.meshes.length);

  await page.route(/\/mesh\/\d+\?/, r => r.fulfill({status: 503, json: {error: "no"}}));
  await brushStroke(page);
  await expect(page.locator("#edit-view-failed")).toContainText("doesn't show the last change");
  await page.unroute(/\/mesh\/\d+\?/);
  await page.locator("#edit-view-failed").getByRole("button", {name: "Load again"}).click();
  await expect(page.locator("#edit-view-failed")).toHaveCount(0);
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
});

test("the brush held: it grows while held and shows it, letting go is one undo step, Esc takes it all back", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  await openSettings(page, "Editor");
  await page.locator("#control-elevation-speed").fill("300");
  await page.keyboard.press("Escape");
  await page.locator("#edit-elevation").click();
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("60");
  await page.locator("#edit-elevation-set").getByLabel("Height").fill("500");
  const c = await centre(scene(page));
  const answers: number[] = [];
  page.on("response", r => { if (r.url().endsWith("/brush/preview")) answers.push(r.status()); });
  await page.mouse.move(c.x, c.y + 40);
  await page.mouse.down();
  await expect.poll(() => answers.length).toBeGreaterThan(0);       // (asked for while held)
  expect(answers[0]).toBe(200);
  await page.waitForTimeout(1000);
  await page.mouse.up();
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  // (a click's 5 m, and held without moving a second or more past the click's quarter: at 3 m a second, at least 2.25 m more)
  expect(Math.max(...(await heights(page))[0].mm)).toBeGreaterThan(7000);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await scene(page).click({position: {x: 5, y: 5}, button: "right"});
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);

  await page.mouse.move(c.x, c.y + 40);
  await page.mouse.down();
  const moves = answers.length;
  await expect.poll(() => answers.length).toBeGreaterThan(moves);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  expect(await heights(page)).toEqual([]);
});

test("the brush held on what can't be changed: it ends there and says why", async ({page}) => {
  await openEditor(page);
  await page.route("**/brush/preview", r => r.fulfill({status: 409, json: {error: "A bridge, a tunnel or a railway lies in the change"}}));
  await page.locator("#edit-elevation").click();
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y + 40);
  await page.mouse.down();
  await expect(page.locator("#edit-tool-note")).toContainText("A bridge, a tunnel or a railway");
  await page.mouse.up();
  await page.waitForTimeout(100);
  await expect(page.locator("#edit-heights")).toHaveCount(0);
});

test("the brush held: what a stroke that is over was refused says nothing about the next one", async ({page}) => {
  await openEditor(page);
  let first = true, holding: (() => void) | null = null;
  await page.route("**/brush/preview", async route => {
    if (first) {
      first = false;
      await new Promise<void>(ok => { holding = ok; });
      return route.fulfill({status: 409, json: {error: "A bridge"}});
    }
    return route.continue();
  });
  await page.locator("#edit-elevation").click();
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y + 40);
  await page.mouse.down();
  await expect.poll(() => holding !== null).toBe(true);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await page.keyboard.press("h");
  await page.mouse.down();
  holding!();
  await page.waitForTimeout(300);
  await page.mouse.up();
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await expect(page.locator("#edit-tool-note")).toHaveCount(0);
});

test("H turns the brush on and off, Ctrl and Alt with the wheel set its radius and height", async ({page}) => {
  await openEditor(page);
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y + 40);
  await page.keyboard.press("h");
  const set = page.locator("#edit-elevation-set");
  await expect(set).toBeVisible();
  await expect(set.getByLabel("Radius")).toHaveValue("5");
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Control");
  await expect(set.getByLabel("Radius")).toHaveValue("5.5");
  await page.keyboard.down("Control");
  for (let k = 0; k < 8; k++) await page.mouse.wheel(0, 100);
  await page.keyboard.up("Control");
  await expect(set.getByLabel("Radius")).toHaveValue("2");          // (no smaller: a ring could stand between the ground's points and move nothing)
  await page.keyboard.down("Alt");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Alt");
  await expect(set.getByLabel("Height")).toHaveValue("6");
  await expect(set.getByLabel("Soft edge")).toHaveValue("25");
  await page.keyboard.down("Control");
  await page.keyboard.down("Alt");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Alt");
  await page.keyboard.up("Control");
  await expect(set.getByLabel("Soft edge")).toHaveValue("30");
  const before = await picture(page);
  await page.mouse.move(c.x, c.y + 40);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -100);                                  // (the view doesn't zoom)
  await page.keyboard.up("Control");
  await page.keyboard.press("h");
  await expect(set).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("X: each click deletes what is under it, what can't go stays, a right click only asks, Esc ends it", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.keyboard.press("x");
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "true");
  await page.mouse.click(at.x, at.y, {button: "right"});
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await page.keyboard.press("Escape");                              // (the menu, and the tool)
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("x");
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect(page.locator("#edit-picked")).toHaveCount(0);
  const c = await centre(scene(page));
  await page.mouse.click(c.x, c.y);                                 // (the road)
  await expect(page.locator("#edit-picked")).toContainText("can't be deleted yet");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await page.keyboard.press("h");                                   // (one tool at a time)
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#edit-elevation")).toHaveAttribute("aria-pressed", "true");
});

test("the brush: while it is on, a click picks nothing", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.locator("#edit-elevation").click();
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("3");
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toHaveCount(0);
  await expect(box(page)).toBeHidden();
});
