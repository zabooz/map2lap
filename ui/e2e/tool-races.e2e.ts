// A tool's answer that arrives after the tool was left or reset must not reach the draft or the tool's next use.
import {centre, expect, openEditor, scene, test, type Backend} from "./fixtures";
import type {Page, Route} from "@playwright/test";
import {saved} from "./edit-helpers";

/** The hill track with its mapped road down the middle of the view: two points on that road. */
async function onRoad(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  const c = await centre(scene(page));
  return {a: {x: c.x, y: c.y + 236}, b: {x: c.x, y: c.y - 261}};
}

/** Requests to url held until release(); held() resolves once the first one waits. */
async function hold(page: Page, url: string) {
  let release!: (answer?: (route: Route) => Promise<void>) => void, mark!: () => void;
  const gate = new Promise<((route: Route) => Promise<void>) | undefined>(r => { release = r; });
  const held = new Promise<void>(r => { mark = r; });
  await page.route(url, async route => {
    mark();
    const answer = await gate;
    if (answer) await answer(route); else await route.continue();
  });
  return {held, release};
}

const draft = async (page: Page) => (await page.request.get("/api/editor/alpha/edits")).json();

test("a Road kerb whose end answer arrives after Esc adds no kerb", async ({page, backend}) => {
  const {a, b} = await onRoad(page, backend);
  const way = await hold(page, "**/api/editor/alpha/kerb/way");
  await page.keyboard.press("b");
  const options = page.locator("#edit-kerb-options");
  await page.mouse.click(a.x, a.y);
  await expect(options).toContainText("where this kerb ends");
  await page.mouse.click(b.x, b.y);
  await way.held;
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  const answered = page.waitForResponse("**/api/editor/alpha/kerb/way");
  way.release();
  await answered;
  await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  await saved(page);
  expect((await draft(page)).kerbs ?? []).toEqual([]);
  await page.keyboard.press("b");
  await expect(options).toContainText("road edge to start a kerb");
  await expect(options.locator("#edit-kerb-delete")).toHaveCount(0);
});

test("a Stitch proposal that arrives after the tool was left is not offered on its next use", async ({page, backend}) => {
  const {a, b} = await onRoad(page, backend);
  const way = await hold(page, "**/api/editor/alpha/stitch/way");
  await page.keyboard.press("n");
  const options = page.locator("#edit-stitch-set");
  await page.mouse.click(a.x, a.y);
  await expect(options).toContainText("Click B");
  await page.mouse.click(b.x, b.y);
  await way.held;
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  const answered = page.waitForResponse("**/api/editor/alpha/stitch/way");
  way.release(route => route.fulfill({json: {stitch: {road_ids: ["fixture-road"], rows: [[128, 0], [128, 10]], width: [8, 8], heights: [[0], [0]], marks: []},
    line: [[128, 0, 0], [128, 0, 10]], auto: [8, 8], reason: "mapped", marks: "no markings", deck_rows: 0, rows: 2, change: 0,
    overlap: {left: 0, right: 0}, replaces: []}}));
  await answered;
  await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  await page.keyboard.press("n");
  await expect(options).toContainText("Click A on a road");
  await expect(options.locator("#edit-stitch-apply")).toBeDisabled();
  // A new A must not be blocked by the abandoned request.
  await page.mouse.click(a.x, a.y);
  await expect(options).toContainText("Click B");
});

test("a free kerb answered after Esc adds no kerb", async ({page, backend}) => {
  const {a, b} = await onRoad(page, backend);
  await page.keyboard.press("b");
  await page.keyboard.press("Shift");
  const options = page.locator("#edit-kerb-options");
  await expect(options.getByRole("button", {name: "Free", exact: true})).toHaveAttribute("aria-pressed", "true");
  const way = await hold(page, "**/api/editor/alpha/kerb/way");
  await page.mouse.click(a.x, a.y);
  await page.mouse.click(b.x, b.y);
  await way.held;
  await page.keyboard.press("Escape");
  const answered = page.waitForResponse("**/api/editor/alpha/kerb/way");
  way.release();
  await answered;
  await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  await saved(page);
  expect((await draft(page)).kerbs ?? []).toEqual([]);
});
