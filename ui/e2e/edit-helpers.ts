// What the tests of the Editor's editing share (delete, save, brush, draft).
import type {Page} from "@playwright/test";
import {centre, expect, scene, stillView} from "./fixtures";

export const AWAY = {x: 100, y: 500};              // (the mouse off the view: no hover box in the picture)

export const NEAR_TREE = "nocol_trees_0_0#1";

export const FAR_TREE = "nocol_trees_0_0#0";

export const box = (page: Page) => page.locator("#hover-box");

export const saved = (page: Page) => expect(page.locator("#edit-bar")).toHaveAttribute("data-kept", "saved");     // (the changes kept in the background, not the track)

export const VIEW_ALONE = {style: "[data-tool-options] { visibility: hidden; }"};

/** The picture of the view alone, once it stands still and the mouse is off it. */
export async function picture(page: Page) {
  await page.mouse.move(AWAY.x, AWAY.y);
  await stillView(page);
  return scene(page).screenshot(VIEW_ALONE);
}

/** A point of the view that shows the near tree. */
export async function findTree(page: Page) {
  const c = await centre(scene(page));
  for (let up = 40; up < c.y - 10; up += 12) {
    await page.mouse.move(c.x - 1, c.y - up);
    await page.mouse.move(c.x, c.y - up);
    if (await expect(box(page)).toContainText(NEAR_TREE, {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y - up};
  }
  throw new Error("no tree found");
}

export async function points(page: Page, at: {x: number; y: number}) {
  await page.mouse.move(at.x - 1, at.y);
  await page.mouse.move(at.x, at.y);
}

/** The list as the server has it. */
export async function stored(page: Page, name = "alpha") {
  return (await (await page.request.get(`/api/editor/${name}/edits`)).json()) as {base: string; revision: number; outdated: number; sorts: string[];
    deleted: {id: string; kind: string; position: number[]}[]};
}

/** The near tree picked and deleted, and saved. */
export async function deleteTree(page: Page) {
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await saved(page);
  return at;
}

/** A point of the view that shows the parked car. */
export async function findCar(page: Page) {
  const c = await centre(scene(page));
  for (let down = -60; down < 200; down += 12) {
    await page.mouse.move(c.x - 1, c.y + down);
    await page.mouse.move(c.x, c.y + down);
    if (await expect(box(page)).toContainText("Parked car", {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y + down};
  }
  throw new Error("no car found");
}

/** A point of the middle of the view where the hover box's title is title. */
export async function findTitled(page: Page, title: string) {
  const c = await centre(scene(page));
  for (let up = 200; up > -200; up -= 8) {
    await page.mouse.move(c.x - 1, c.y - up);
    await page.mouse.move(c.x, c.y - up);
    const h = page.locator("#hover-box h4").first();
    if (await expect(h).toHaveText(title, {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y - up};
  }
  throw new Error(`no ${title} found`);
}

export const title = (page: Page) => page.locator("#hover-box h4").first();

/** A point of the view near the wire: thinner than a pixel from here, the mouse only comes near it. */
export async function findWire(page: Page) {
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
export async function findPole(page: Page, wire: {x: number; y: number}, step: number) {
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

/** Right click at, then the menu's "Mark all …" (label: what it says, at its start), then Delete: all of that sort gone, as a rule. */
export async function deleteAllOf(page: Page, at: {x: number; y: number}, label: RegExp | string = /^Mark all /) {
  await page.mouse.click(at.x, at.y, {button: "right"});
  const mark = page.getByRole("menuitem", {name: label});
  const text = await mark.innerText();
  await mark.click();
  await page.getByRole("tab", {name: "Details", exact: true}).click();
  await expect(page.locator("#edit-marked")).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-marked")).toHaveCount(0);
  return text;
}

/** The triangles of each mesh of the track's own kn5, as AC reads it. */
export async function meshes(page: Page, name = "alpha") {
  return (await (await page.request.get(`/__test/meshes?name=${name}`)).json()) as Record<string, number>;
}

/** Save, as in a word processor: a track never saved here asks once (first), Overwrite; later it is written at once. */
export async function saveTrack(page: Page, first = true) {
  await page.locator("#edit-save").click();
  if (first) await page.locator("#save-dialog").getByRole("button", {name: "Overwrite"}).click();
  await expect(page.locator("#save-dialog")).toBeHidden();
}

/** A click of the brush, under the view's middle, on the road. */
export async function brushStroke(page: Page) {
  const c = await centre(scene(page));
  await page.mouse.click(c.x, c.y + 40);
}

export async function heights(page: Page) {
  return ((await stored(page)) as unknown as {heights: {id: string; mm: number[]}[]}).heights;
}
