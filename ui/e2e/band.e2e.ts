// Mapped road masks, automatic smoothing, pin editing and cancellation on a real 2 m height lattice.
import type {Page} from "@playwright/test";
import {centre, expect, openEditor, scene, test, type Backend} from "./fixtures";
import {heights, picture, saved} from "./edit-helpers";

async function onHill(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  await page.locator("#edit-smooth").click();
  const c = await centre(scene(page));
  return {a: {x: c.x, y: c.y + 236}, b: {x: c.x, y: c.y - 261}, c};
}
const strength = (page: Page) => page.locator("#edit-band").getByLabel("Strength");
const transition = (page: Page) => page.locator("#edit-band").getByLabel("Transition");
async function mark(page: Page, a: {x: number; y: number}, b: {x: number; y: number}) {
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(b.x, b.y);
  await expect(transition(page)).toBeVisible();
  await expect(page.locator("#edit-tool-note")).toHaveCount(0);
}
async function escape(page: Page) { await scene(page).focus(); await page.keyboard.press("Escape"); }

test("marking starts at zero, shows the road mask and Escape leaves the ground unchanged", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  const before = await picture(page);
  await mark(page, a, b);
  await expect(strength(page)).toHaveValue("0");
  await expect(transition(page)).toHaveValue("6");
  expect(await heights(page)).toEqual([]);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await escape(page);
  await expect(page.locator("#edit-band")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("strength applies automatically, zero restores this step, Escape keeps it and Undo restores the original", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  const before = await picture(page);
  await mark(page, a, b);
  await strength(page).fill("100");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  expect(Math.min(...(await heights(page))[0].mm)).toBeLessThan(-1000);
  await strength(page).fill("0");
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await strength(page).fill("70");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await strength(page).press("Enter");
  await expect(transition(page)).toBeVisible();
  await escape(page);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-heights")).toHaveCount(0);
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("smoothing is one undo step above an existing elevation edit", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  await scene(page).focus(); await page.keyboard.press("h");
  await page.locator("#edit-elevation-set").getByLabel("Radius").fill("20");
  await page.locator("#edit-elevation-set").getByLabel("Height").fill("20");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page); await page.keyboard.press("t");
  await mark(page, a, b); await strength(page).fill("80");
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
  await escape(page); await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-heights")).toHaveCount(0);
});

test("Escape ignores a smoothing response that arrives after cancellation", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend); await mark(page, a, b);
  let release: (() => void) | undefined;
  await page.route("**/alpha/band", async route => {
    const response = await route.fetch();
    await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({response});
  });
  await strength(page).fill("60");
  await expect.poll(() => !!release).toBe(true);
  await escape(page); release!();
  await page.unrouteAll({behavior: "wait"});
  await saved(page);
  expect(await heights(page)).toEqual([]);
});

test("a pending new pin delays automatic smoothing until its road area is ready", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend); await mark(page, a, b);
  let release: (() => void) | undefined, taken = 0;
  await page.route("**/band/way", async route => {
    await new Promise<void>(resolve => { release = resolve; }); await route.continue();
  });
  page.on("request", r => { if (r.url().endsWith("/alpha/band")) taken++; });
  await page.mouse.click(c.x, c.y);
  await expect.poll(() => !!release).toBe(true);
  await strength(page).fill("75"); await strength(page).press("Enter");
  expect(taken).toBe(0); release!();
  await page.unrouteAll({behavior: "wait"});
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
});

test("a refused road connection says why and keeps the first point for another attempt", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await page.route("**/band/way", r => r.fulfill({status: 409, json: {error: "No road found between these points"}}));
  await page.mouse.click(a.x, a.y); await page.mouse.click(b.x, b.y);
  await expect(page.locator("#edit-tool-note")).toContainText("No road found");
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.unroute("**/band/way"); await page.mouse.click(b.x, b.y);
  await expect(transition(page)).toBeVisible();
  await expect(page.locator("#edit-tool-note")).toHaveCount(0);
});

test("a refused additional pin leaves the two accepted points as the smoothing input", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend); await mark(page, a, b);
  await page.clock.install();
  await page.route("**/band/way", r => r.fulfill({status: 409, json: {error: "No road found"}}));
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#edit-tool-note")).toContainText("No road found");
  // Restoring the accepted points schedules an automatic zero-strength no-op; its completion must not dismiss the error.
  await page.clock.runFor(1000);
  await expect(page.locator("#edit-tool-note")).toContainText("No road found");
  let sent: number | null = null;
  page.on("request", r => { if (r.url().endsWith("/alpha/band")) sent = r.postDataJSON().points.length; });
  await strength(page).fill("80"); await page.clock.runFor(500); await expect.poll(() => sent).toBe(2);
});

test("failed smoothing preserves the draft and changing strength retries", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend); await mark(page, a, b);
  await page.route("**/alpha/band", r => r.fulfill({status: 409, json: {error: "Road unavailable"}}));
  await strength(page).fill("50");
  await expect(page.locator("#edit-tool-note")).toContainText("Not changed: Road unavailable");
  expect(await heights(page)).toEqual([]);
  await page.unroute("**/alpha/band"); await strength(page).fill("60");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
});

test("pins can be added, dragged and removed without duplicating them", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend); await mark(page, a, b);
  const sent: unknown[][] = [];
  page.on("request", r => { if (r.url().endsWith("/band/way")) sent.push(r.postDataJSON().points); });
  await page.mouse.click(c.x, c.y); await expect.poll(() => sent.length).toBe(1);
  const original = sent[0]; expect(original).toHaveLength(3);
  await expect(page.locator("#edit-tool-note")).toHaveCount(0);
  await page.mouse.click(c.x, c.y); await page.waitForTimeout(300); expect(sent).toHaveLength(1);
  await page.mouse.move(c.x, c.y); await page.mouse.down();
  await page.mouse.move(c.x, c.y + 60, {steps: 4}); await page.mouse.up();
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1]).toHaveLength(3); expect(sent[1]).not.toEqual(original);
  await expect(page.locator("#edit-tool-note")).toHaveCount(0);
  await page.mouse.click(c.x, c.y + 60, {button: "right"});
  await expect.poll(() => sent.length).toBe(3); expect(sent[2]).toHaveLength(2);
  await expect(transition(page)).toBeVisible();
});

test("a cancelled pin drag and a shaky click keep its original place", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend); await mark(page, a, b);
  const sent: unknown[][] = [];
  page.on("request", r => { if (r.url().endsWith("/band/way")) sent.push(r.postDataJSON().points); });
  await page.mouse.click(c.x, c.y); await expect.poll(() => sent.length).toBe(1);
  await expect(page.locator("#edit-tool-note")).toHaveCount(0);
  await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x, c.y + 60, {steps: 4});
  await scene(page).evaluate(el => el.dispatchEvent(new PointerEvent("pointercancel", {bubbles: true})));
  await page.mouse.up(); await page.mouse.move(c.x, c.y); await page.mouse.down();
  await page.mouse.move(c.x + 2, c.y, {steps: 2}); await page.mouse.up();
  await page.waitForTimeout(300); expect(sent).toHaveLength(1);
  await page.mouse.click(c.x, c.y, {button: "right"});
  await expect.poll(() => sent.length).toBe(2); expect(sent[1]).toHaveLength(2);
});

test("hover preview follows the latest stationary mouse position after a pending request", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await page.mouse.click(a.x, a.y); await expect(page.locator("#edit-band")).toContainText("A is set");
  const asked: [number, number][][] = []; let release: (() => void) | undefined;
  await page.route("**/band/way", async route => {
    asked.push(route.request().postDataJSON().points);
    if (asked.length === 1) await new Promise<void>(resolve => { release = resolve; });
    await route.continue();
  });
  await page.mouse.move(a.x, a.y - 40); await expect.poll(() => !!release).toBe(true);
  await page.mouse.move(b.x, b.y, {steps: 6}); await page.waitForTimeout(300);
  expect(asked).toHaveLength(1); release!();
  await expect.poll(() => asked.length).toBeGreaterThan(1);
  expect(asked.at(-1)![1]).not.toEqual(asked[0][1]);
});

test("Escape clears the pin cursor", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend); await mark(page, a, b);
  await page.mouse.move(a.x + 80, a.y); await page.mouse.move(a.x, a.y);
  await expect.poll(() => scene(page).evaluate(el => (el as HTMLElement).style.cursor)).toBe("grab");
  await escape(page);
  await expect.poll(() => scene(page).evaluate(el => (el as HTMLElement).style.cursor)).toBe("");
});

test("removing terminal points leaves the other as A, then returns to the marking hint", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend); await mark(page, a, b);
  await page.mouse.click(b.x, b.y, {button: "right"});
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(a.x, a.y, {button: "right"});
  await expect(page.locator("#edit-band")).toBeHidden();
  await expect(page.locator("#edit-road-hint")).toBeVisible();
});

test("Mark road keeps the completed change and begins a fresh zero-strength range", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend); await mark(page, a, b); await strength(page).fill("70");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await page.locator("#edit-band").getByRole("button", {name: "Mark road", exact: true}).click();
  await expect(page.locator("#edit-road-hint").getByLabel("Strength")).toHaveValue("0");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
});

test("Shift and Ctrl wheel change strength and terrain transition", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend); await mark(page, a, b);
  await page.mouse.move(a.x, a.y); await page.keyboard.down("Control"); await page.mouse.wheel(0, 100); await page.keyboard.up("Control");
  await expect(transition(page)).toHaveValue("5");
  await page.keyboard.down("Shift"); await page.mouse.wheel(0, -100); await page.keyboard.up("Shift");
  await expect(strength(page)).toHaveValue("5");
});
