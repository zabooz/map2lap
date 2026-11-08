// The Editor's tools: the sidebar's groups, one tool at a time, the bar's keys, picking more than one, Smooth road, Camera.
import type {Page} from "@playwright/test";
import {centre, expect, openEditor, openSettings, scene, test, type Backend} from "./fixtures";
import {AWAY, findCar, findTree, heights, picture} from "./edit-helpers";

const CAMERA_BAR = "#edit-camera-set";

const pressed = (page: Page, id: string) => page.locator(id).getAttribute("aria-pressed");

/** The keys over the view, the mouse on it. */
async function keysOnView(page: Page) {
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y);
  await scene(page).focus();
  return c;
}

async function wheelWith(page: Page, keys: string[], delta: number) {
  for (const key of keys) await page.keyboard.down(key);
  await page.mouse.wheel(0, delta);
  for (const key of [...keys].reverse()) await page.keyboard.up(key);
}

async function onHill(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  const c = await centre(scene(page));
  return {a: {x: c.x, y: c.y + 236}, b: {x: c.x, y: c.y - 261}, c};     // (as in band.e2e.ts: on the road, before and behind the hill)
}

test("the buttons stand in the sidebar, gone with its tab, back as they were; what a tool can be set to stands over the view", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  const set = page.locator("#edit-elevation-set");
  await set.getByLabel("Radius").fill("7");
  await expect(page.locator("aside #edit-elevation")).toBeVisible();
  await expect(page.locator("#scene #edit-elevation-set")).toBeVisible();
  await page.locator("#t-new").click();
  await expect(page.locator("#edit-elevation")).toBeHidden();
  await page.locator("#t-edit").click();
  expect(await pressed(page, "#edit-elevation")).toBe("true");
  await expect(set.getByLabel("Radius")).toHaveValue("7");
});

test("each tool has its key, one is on at a time, Esc goes back to Select from each, from a number and a button of it too", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  expect(await pressed(page, "#edit-select")).toBe("true");
  for (const [key, id] of [["m", "#edit-move"], ["x", "#edit-click-deletes"], ["k", "#edit-camera"], ["c", "#edit-copy"], ["h", "#edit-elevation"], ["t", "#edit-smooth"]]) {
    await page.keyboard.press(key);
    await expect(page.locator(id)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Escape");
    await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  }
  await page.keyboard.press("h");
  await page.locator("#edit-elevation-set").getByLabel("Height").press("Escape");
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#edit-elevation").focus();
  await page.keyboard.press("x");
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "true");
});

test("the bar's keys: the options reach Shift, Ctrl, Alt, Ctrl+Alt from left to right, what is held is lit", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("h");
  const set = page.locator("#edit-elevation-set"), keys = set.locator("kbd");
  await expect(keys).toHaveText(["Shift", "Ctrl", "Alt", "Ctrl+Alt"]);
  const lit = set.locator("[class*=held] kbd");
  await expect(lit).toHaveCount(0);
  await page.keyboard.down("Control");
  await expect(lit).toHaveText(["Ctrl"]);
  await page.keyboard.down("Alt");
  await expect(lit).toHaveText(["Ctrl+Alt"]);       // (the one thing, neither of the two)
  await page.keyboard.up("Control");
  await expect(lit).toHaveText(["Alt"]);
  await page.keyboard.up("Alt");
  await expect(lit).toHaveCount(0);
});

test("Shift shows the way Elevation goes as it is held, from either choice", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("h");
  const raise = page.getByRole("button", {name: "Raise"}), lower = page.getByRole("button", {name: "Lower"});
  await expect(raise).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.down("Shift");
  await expect(lower).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.up("Shift");
  await expect(raise).toHaveAttribute("aria-pressed", "true");
  await lower.click();
  await page.keyboard.down("Shift");
  await expect(raise).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.up("Shift");
  await expect(lower).toHaveAttribute("aria-pressed", "true");
});

test("Select: Ctrl adds to what is picked, again takes it out, X deletes all as one undo step, Esc lets go of them", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await openEditor(page);
  const tree = await findTree(page), car = await findCar(page);
  const picked = page.locator("#edit-picked");
  const ctrlClick = async (at: {x: number; y: number}) => {
    await page.keyboard.down("Control");
    await page.mouse.click(at.x, at.y);
    await page.keyboard.up("Control");
  };
  await page.mouse.click(tree.x, tree.y);
  await expect(picked).toContainText("Tree");
  await ctrlClick(car);
  await expect(picked).toHaveText("2 objects picked: X or Delete deletes them all.");
  await ctrlClick(car);
  await expect(picked).toContainText("Tree");
  await ctrlClick(car);
  await expect(picked).toContainText("2 objects picked");
  await page.keyboard.press("x");
  await expect(page.locator("#edit-count")).toHaveText("2 objects deleted");
  await expect(picked).toBeHidden();
  expect(await pressed(page, "#edit-click-deletes")).toBe("false");
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toBeHidden();

  await page.mouse.click(tree.x, tree.y);
  await expect(picked).toContainText("Tree");
  await page.keyboard.press("Escape");
  await expect(picked).toBeHidden();
  await page.keyboard.press("x");                   // (nothing picked: its tool)
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-count")).toBeHidden();
});

test("Smooth road marks at zero through its key or the road context menu", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await keysOnView(page);
  await page.keyboard.press("t");
  await expect(page.locator("#edit-road")).toHaveCount(0);
  await expect(page.locator("#edit-road-hint")).toContainText("click the road");
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(b.x, b.y);
  await expect(page.locator("#edit-band").getByLabel("Transition")).toBeVisible();
  await expect(page.locator("#edit-band").getByLabel("Strength")).toHaveValue("0");
  expect(await heights(page)).toEqual([]);
  await scene(page).focus(); await page.keyboard.press("Escape");
  await page.mouse.click(a.x, a.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Smooth road", exact: true}).click();
  await expect(page.locator("#edit-smooth")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(b.x, b.y);
  await expect(page.locator("#edit-band").getByLabel("Transition")).toBeVisible();
  await expect(page.locator("#edit-band").getByLabel("Strength")).toHaveValue("0");
  await expect(page.locator("#edit-picked")).toBeHidden();
  expect(await heights(page)).toEqual([]);
});

test("Smooth road's left click picks no object; a right click on a tree still offers object actions", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.keyboard.press("t");
  await page.mouse.click(tree.x, tree.y);
  await expect(page.locator("#edit-picked")).toBeHidden();
  await page.mouse.click(tree.x, tree.y, {button: "right"});
  await expect(page.getByRole("menuitem", {name: "Delete", exact: true})).toBeEnabled();
  await expect(page.getByRole("menuitem", {name: "Smooth road", exact: true})).toHaveCount(0);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
});

test("Camera: K shows its bar and moves nothing; Shift with the wheel goes along the track and back, Ctrl its height, Alt its speed", async ({page, backend}) => {
  await onHill(page, backend);
  await page.mouse.move(AWAY.x, AWAY.y);
  const first = await picture(page);
  await keysOnView(page);
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(CAMERA_BAR)).toHaveCount(0);
  await page.keyboard.press("k");
  const bar = page.locator(CAMERA_BAR);
  await expect(bar).toContainText("Along the track");
  expect((await picture(page)).equals(first)).toBe(true);
  await keysOnView(page);
  const atMetres = (m: string) => expect(bar).toContainText(m);
  await wheelWith(page, ["Shift"], -100);
  await atMetres("20 m");
  await wheelWith(page, ["Shift"], -100);
  await atMetres("40 m");
  await wheelWith(page, ["Shift"], 100);
  await atMetres("20 m");
  expect((await picture(page)).equals(first)).toBe(false);
  await keysOnView(page);
  await wheelWith(page, ["Control"], -100);
  await expect(bar.getByLabel("Height")).toHaveValue("3.5");
  await wheelWith(page, ["Alt"], -100);
  await expect(bar.getByLabel("Speed")).toHaveValue("60");
});

test("Camera: Ride goes by itself and Pause stands, at the end it stops and starts over; Reset and Home give the first view", async ({page, backend}) => {
  await onHill(page, backend);
  await page.mouse.move(AWAY.x, AWAY.y);
  const first = await picture(page);
  await keysOnView(page);
  await page.keyboard.press("k");
  const bar = page.locator(CAMERA_BAR), ride = page.locator("#edit-ride");
  const metre = async () => Number(/(\d+) m/.exec(await bar.innerText())![1]);
  await ride.click();
  await expect(ride).toHaveText("Pause");
  await expect.poll(metre).toBeGreaterThan(5);
  await ride.click();
  await expect(ride).toHaveText("Ride");
  await page.waitForTimeout(200);       // (the last it has to say of where it is)
  const stood = await metre();
  await page.waitForTimeout(300);
  expect(await metre()).toBe(stood);

  await bar.getByLabel("Speed").fill("300");
  await ride.click();
  await expect(ride).toHaveText("Ride", {timeout: 30000});       // (the route's end)
  const end = await metre();
  expect(end).toBeGreaterThan(100);
  await ride.click();
  await expect(ride).toHaveText("Pause");
  await expect.poll(metre).toBeLessThan(end);       // (from the start)
  await ride.click();

  await page.locator("#edit-home").click();
  await expect(ride).toHaveText("Ride");
  expect((await picture(page)).equals(first)).toBe(true);
  await keysOnView(page);
  await wheelWith(page, ["Shift"], -100);
  await expect(bar).toContainText("20 m");
  await page.keyboard.press("Home");
  expect((await picture(page)).equals(first)).toBe(true);
});

test("Camera: W A S D, the plain wheel and the right button leave the track, Esc and another tool end it; the camera stays", async ({page, backend}) => {
  const {c} = await onHill(page, backend);
  await keysOnView(page);
  await page.keyboard.press("k");
  const ride = page.locator("#edit-ride"), bar = page.locator(CAMERA_BAR);
  const riding = async () => {
    await ride.click();
    await expect(ride).toHaveText("Pause");
    await keysOnView(page);
  };
  await riding();
  await page.keyboard.press("w");
  await expect(ride).toHaveText("Ride");
  await riding();
  await page.mouse.wheel(0, 100);
  await expect(ride).toHaveText("Ride");
  await riding();
  await page.mouse.click(c.x, c.y, {button: "right"});
  await expect(ride).toHaveText("Ride");
  await page.keyboard.press("Escape");
  await expect(bar).toBeHidden();

  await page.keyboard.press("k");
  await riding();
  await page.keyboard.press("Escape");
  await expect(bar).toBeHidden();
  await page.mouse.move(AWAY.x, AWAY.y);
  await scene(page).focus();
  const left = await picture(page);
  await page.waitForTimeout(400);
  expect((await picture(page)).equals(left)).toBe(true);

  await page.keyboard.press("k");
  await riding();
  await page.keyboard.press("h");
  await expect(bar).toBeHidden();
  await expect(page.locator("#edit-elevation-set")).toBeVisible();
});

test("Camera: a track with no route says so", async ({page}) => {
  await page.route("**/api/editor/alpha/index", async route => {
    const r = await route.fetch();
    return route.fulfill({response: r, json: {...await r.json(), route: []}});
  });
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("k");
  const bar = page.locator(CAMERA_BAR);
  await expect(bar).toContainText("no route");
  await wheelWith(page, ["Shift"], -100);
  await expect(page.locator("#edit-tool-note")).toHaveText("This track has no route to go along");
  await page.locator("#edit-tool-note").waitFor();
  await page.locator("#edit-ride").click();
  await expect(page.locator("#edit-tool-note")).toHaveText("This track has no route to go along");
  await expect(page.locator("#edit-ride")).toHaveText("Ride");
});

test("a small window: the buttons scroll, what is to be said stays in sight; Elevation's speed under Settings is what a stroke goes by", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 420});
  await openEditor(page);
  await page.locator("#edit-smooth").scrollIntoViewIfNeeded();
  await page.locator("#edit-elevation").click();
  const c = await centre(scene(page));
  let sent: number | null = null;
  page.on("request", r => { if (r.url().endsWith("/brush")) sent = (r.postDataJSON() as {speed: number}).speed; });
  await page.mouse.click(c.x, c.y + 60);
  await expect(page.locator("#edit-heights")).toBeInViewport();
  expect(sent).toBe(300);
  await page.locator("#edit-help summary").scrollIntoViewIfNeeded();
  await expect(page.locator("#edit-heights")).toBeInViewport();

  await page.setViewportSize({width: 1280, height: 720});
  await openSettings(page, "Editor");
  await page.locator("#control-elevation-speed").fill("120");
  await expect(page.getByRole("dialog")).toContainText("120 cm/s");
  await page.keyboard.press("Escape");
  await page.mouse.click(c.x, c.y + 60);
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
  expect(sent).toBe(1200);
});
