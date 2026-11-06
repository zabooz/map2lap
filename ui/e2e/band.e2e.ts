// Marking a stretch of road by two clicks, and what is done with it: Smooth, on a track with a real hill on the 2 m lattice.
import type {Page} from "@playwright/test";
import {button, centre, expect, openEditor, scene, test, type Backend} from "./fixtures";
import {AWAY, heights, picture, saved} from "./edit-helpers";

/** The hill track open, and the clicks that lie on the road before and behind the hill. */
async function onHill(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  const c = await centre(scene(page));
  return {a: {x: c.x, y: c.y + 236}, b: {x: c.x, y: c.y - 261}, c};     // (z -20 and -130 by the camera's view: the hill's top lies at -80)
}

const strength = (page: Page) => page.locator("#edit-band").getByLabel("Strength");

async function mark(page: Page, a: {x: number; y: number}, b: {x: number; y: number}) {
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(b.x, b.y);
  await expect(strength(page)).toBeVisible();
}

test("two clicks on the road mark a band, Smooth shows at once with its strength; Esc drops it all; nothing is changed", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  const before = await picture(page);
  await mark(page, a, b);
  await expect(strength(page)).toHaveValue("50");
  await expect(page.locator("#edit-band").getByLabel("Width")).not.toHaveValue("0");
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  expect(await heights(page)).toEqual([]);          // (only shown)
  await page.mouse.move(AWAY.x, AWAY.y);
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-band")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("Enter takes what is shown as one undo step; less strength shows less, and what it showed before goes", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  const before = await picture(page);
  await mark(page, a, b);
  await strength(page).fill("100");
  await page.waitForTimeout(300);
  const full = await picture(page);
  await strength(page).fill("0");
  await expect.poll(async () => (await picture(page)).equals(full)).toBe(false);
  await strength(page).fill("100");
  await expect.poll(async () => (await picture(page)).equals(full)).toBe(true);
  await strength(page).press("Enter");              // (from the field too)
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await expect(page.locator("#edit-band")).toBeHidden();
  await saved(page);
  expect(Math.min(...(await heights(page))[0].mm)).toBeLessThan(-2500);     // (the hill of 3 m goes)
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-heights")).toBeHidden();
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("what is shown follows the draft: an undo under a band reckons it again, Esc then goes back to the draft as it is", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  const before = await picture(page);
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("h");
  await page.locator("#edit-brush-set").getByLabel("Radius").fill("20");
  await page.locator("#edit-brush-set").getByLabel("Height").fill("200");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  await page.keyboard.press("h");
  let holding: (() => void) | null = null, held = false;
  await page.route("**/band/preview", async route => {
    if (!held) {
      held = true;
      const r = await route.fetch();
      await new Promise<void>(ok => { holding = ok; });
      return route.fulfill({response: r});
    }
    return route.continue();
  });
  await mark(page, a, b);
  await expect.poll(() => holding !== null).toBe(true);
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Control+z");           // (under the band, with its preview still on its way)
  await expect(page.locator("#edit-heights")).toBeHidden();
  await saved(page);
  holding!();
  await page.waitForTimeout(300);
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-band")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("a click on grass or the sky ends a marking, a click on the road with another tool on makes none", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toBeVisible();
  await scene(page).click({position: {x: 5, y: 5}});
  await expect(page.locator("#edit-band")).toBeHidden();
  await page.mouse.click(a.x, a.y);
  await page.mouse.click(b.x, b.y);
  await expect(strength(page)).toBeVisible();
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("h");                   // (a tool taken up ends it)
  await expect(page.locator("#edit-band")).toBeHidden();
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toBeHidden();
  await page.keyboard.press("h");
  await page.keyboard.press("x");
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toBeHidden();
  await expect(page.locator("#edit-picked")).toContainText("can't be deleted yet");
});

test("no road between the clicks: it says so, and A stays", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await page.route("**/band/way", r => r.fulfill({status: 409, json: {error: "No road found between these points"}}));
  await page.mouse.click(a.x, a.y);
  await page.mouse.click(b.x, b.y);
  await expect(page.locator("#edit-brush-note")).toContainText("No road found");
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.unroute("**/band/way");
  await page.mouse.click(b.x, b.y);
  await expect(strength(page)).toBeVisible();
  await expect(page.locator("#edit-brush-note")).toBeHidden();
});

test("a point in between that finds no road goes by itself: A and B stay", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  await mark(page, a, b);
  const asked: number[] = [];
  await page.route("**/band/way", r => {
    asked.push((r.request().postDataJSON() as {points: unknown[]}).points.length);
    return asked.length === 1 ? r.fulfill({status: 409, json: {error: "No road found"}}) : r.continue();
  });
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#edit-brush-note")).toContainText("No road found");
  await page.waitForTimeout(300);
  await expect(page.locator("#edit-brush-note")).toContainText("No road found");     // (it stays: back to A and B asks for nothing, which would clear it)
  expect(asked).toEqual([3]);
  let sent: number | null = null;
  page.on("request", r => { if (r.url().endsWith("/band/preview")) sent = (r.postDataJSON() as {points: unknown[]}).points.length; });
  await strength(page).fill("80");
  await expect.poll(() => sent).toBe(2);            // (A and B, not A and the point)
});

test("Enter goes from the draft with an undo on its way in it, not from before", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("h");
  await page.locator("#edit-brush-set").getByLabel("Radius").fill("20");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
  await saved(page);
  await page.keyboard.press("h");
  await mark(page, a, b);
  let letGo: () => void = () => {};
  const held = new Promise<void>(ok => { letGo = ok; });
  const order: string[] = [];
  await page.route("**/edits", async route => {
    if (route.request().method() === "PUT") await held;
    order.push("kept");
    return route.continue();
  });
  page.on("request", r => { if (r.url().endsWith("/band") && r.method() === "POST") order.push("reckoned"); });
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  expect(order).toEqual([]);                        // (it waits for the undo to be kept)
  letGo();
  await expect.poll(() => order[order.indexOf("kept") + 1]).toBe("reckoned");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
});

test("Enter while the way to a new pin is asked for takes nothing yet, and says so", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  await mark(page, a, b);
  let letGo: () => void = () => {};
  const held = new Promise<void>(ok => { letGo = ok; });
  await page.route("**/band/way", async route => {
    await held;
    return route.continue();
  });
  let taken = 0;
  page.on("request", r => { if (r.url().endsWith("/band") && r.method() === "POST") taken++; });
  await page.mouse.click(c.x, c.y);
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#edit-brush-note")).toContainText("still being found");
  await expect(strength(page)).toBeVisible();
  expect(taken).toBe(0);
  letGo();
  await expect(page.locator("#edit-brush-note")).toBeHidden();
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#edit-heights")).toHaveText("1 height change");
});

test("a preview the server can't answer takes back what was shown and says so", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await mark(page, a, b);
  await strength(page).fill("0");
  await expect(page.locator("#edit-brush-note")).toContainText("smooth here already");
  await page.waitForTimeout(300);
  const none = await picture(page);                 // (the band with no change shown)
  await strength(page).fill("100");
  await expect.poll(async () => (await picture(page)).equals(none)).toBe(false);
  await page.route("**/band/preview", r => r.abort());
  await strength(page).fill("50");
  await expect(page.locator("#edit-brush-note")).toContainText("No preview");
  await expect.poll(async () => (await picture(page)).equals(none)).toBe(true);
});

test("pins: a click adds one where it lies along the band, dragged it moves, a click on it adds none, a right click takes it away", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  await mark(page, a, b);
  const pointsSent: unknown[][] = [];
  page.on("request", r => { if (r.url().endsWith("/band/way")) pointsSent.push((r.postDataJSON() as {points: unknown[]}).points); });
  const last = () => pointsSent.at(-1) as [number, number][];
  await page.mouse.click(c.x, c.y);                 // (the second pin, between A and B)
  await expect.poll(() => pointsSent.length).toBe(1);
  const middle = last()[1];
  expect(last()).toHaveLength(3);

  await page.mouse.click(c.x, c.y);                 // (on it: nothing new)
  await page.waitForTimeout(300);
  expect(pointsSent).toHaveLength(1);

  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x, c.y + 60, {steps: 4});
  await page.mouse.up();
  await expect.poll(() => pointsSent.length).toBe(2);
  expect(last()).toHaveLength(3);
  expect(last()[1]).not.toEqual(middle);
  await expect(page.locator("#edit-brush-note")).toBeHidden();

  await page.mouse.click(c.x, c.y + 60, {button: "right"});
  await expect.poll(() => pointsSent.length).toBe(3);
  expect(last()).toHaveLength(2);
  await expect(page.locator("#edit-picked")).toBeHidden();
  await expect(strength(page)).toBeVisible();
});

test("a pin's drag the browser breaks off puts it back where the band goes by it, and a shaky click moves nothing", async ({page, backend}) => {
  const {a, b, c} = await onHill(page, backend);
  await mark(page, a, b);
  const sent: unknown[][] = [];
  page.on("request", r => { if (r.url().endsWith("/band/way")) sent.push((r.postDataJSON() as {points: unknown[]}).points); });
  await page.mouse.click(c.x, c.y);
  await expect.poll(() => sent.length).toBe(1);
  await expect(page.locator("#edit-brush-note")).toBeHidden();
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x, c.y + 60, {steps: 4});
  await page.locator("#scene canvas").evaluate(el => el.dispatchEvent(new PointerEvent("pointercancel", {bubbles: true})));
  await page.mouse.up();
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await page.mouse.move(c.x + 2, c.y, {steps: 2});
  await page.mouse.up();
  await page.waitForTimeout(300);
  expect(sent).toHaveLength(1);                     // (no new way: and neither is a moved pin to be seen)
  await page.mouse.click(c.x, c.y, {button: "right"});
  await expect.poll(() => sent.length).toBe(2);     // (it is still there, where it was)
  expect(sent[1]).toHaveLength(2);
});

test("where the mouse came to while a way was asked for is asked for next, even if it stays there", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toContainText("A is set");
  const asked: [number, number][][] = [];
  let letGo: () => void = () => {};
  const held = new Promise<void>(ok => { letGo = ok; });
  await page.route("**/band/way", async route => {
    asked.push((route.request().postDataJSON() as {points: [number, number][]}).points);
    if (asked.length === 1) await held;
    return route.continue();
  });
  await page.mouse.move(a.x, a.y - 40);
  await expect.poll(() => asked.length).toBe(1);
  await page.mouse.move(b.x, b.y, {steps: 6});
  await page.waitForTimeout(300);
  expect(asked).toHaveLength(1);
  letGo();
  await expect.poll(() => asked.length).toBeGreaterThan(1);
  expect(asked.at(-1)![1]).not.toEqual(asked[0][1]);
});

test("with the marking gone the pointer no longer says a pin can be taken", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await mark(page, a, b);
  const canvas = page.locator("#scene canvas");
  await page.mouse.move(a.x + 80, a.y);
  await page.mouse.move(a.x, a.y);
  await expect.poll(() => canvas.evaluate(el => (el as HTMLElement).style.cursor)).toBe("grab");
  await canvas.focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-band")).toBeHidden();
  await expect.poll(() => canvas.evaluate(el => (el as HTMLElement).style.cursor)).toBe("");
});

test("taking A or B away leaves the other as A, taking that too leaves nothing", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await mark(page, a, b);
  await page.mouse.click(b.x, b.y, {button: "right"});
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(a.x, a.y, {button: "right"});
  await expect(page.locator("#edit-band")).toBeHidden();
});

test("Ctrl and Alt with the wheel set a marked road's width and strength", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await mark(page, a, b);
  const band = page.locator("#edit-band");
  const width = Number(await band.getByLabel("Width").inputValue());
  await page.mouse.move(a.x, a.y);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, 100);
  await page.keyboard.up("Control");
  await expect(band.getByLabel("Width")).toHaveValue(String(width - 1));
  await page.keyboard.down("Alt");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Alt");
  await expect(strength(page)).toHaveValue("55");
});

test("the button says Elevation, and H is its key", async ({page}) => {
  await openEditor(page);
  await expect(button(page, "Elevation")).toBeVisible();
  await page.locator("#scene canvas").focus();
  await page.keyboard.press("h");
  await expect(page.locator("#edit-brush-set")).toBeVisible();
});
