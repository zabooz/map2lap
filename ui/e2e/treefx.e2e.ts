// TreeFX trees (CSP's 3D trees, as builds make all trees) in the Editor: pointed at, picked, deleted, moved and copied as other objects;
// Save writes the track's trees.txt from its source and the draft, reopening shows the trees as saved.
import {centre, dragMouse, expect, openEditor, scene, test} from "./fixtures";
import {box, saved, saveTrack as save, stored} from "./edit-helpers";
import type {Page} from "@playwright/test";

interface Tree {id: string; model: string; pos: number[]; angle: number; size: number; width: number}

const draft = async (page: Page) => (await stored(page)) as unknown as
  {deleted: {id: string; kind: string}[]; placed: {id: string; x: number; z: number}[]; trees: Tree[]};

/** Save, and the track written: its dialog closes at once, the writing goes on behind. */
async function saveTrack(page: Page) {
  await save(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
}

/** Where the spruce trees#1 stands on the road ahead, as the hover box says: up the view's middle, as findTree does. */
async function findSpruce(page: Page) {
  const c = await centre(scene(page));
  for (let up = 40; up < c.y - 10; up += 12) {
    await page.mouse.move(c.x - 1, c.y - up);
    await page.mouse.move(c.x, c.y - up);
    if (await expect(box(page)).toContainText("trees#1", {timeout: 300}).then(() => true, () => false)) return {x: c.x, y: c.y - up};
  }
  throw new Error("no 3D tree found");
}

/** The trees AC gets: the track's trees.txt, each line read (treefx.parse). */
const treesTxt = async (page: Page) => (await (await page.request.get("/__test/trees?name=alpha")).json()) as Omit<Tree, "id">[];

test("a 3D tree is pointed at by its id and model, picked, deleted and back by Undo; Save writes trees.txt without it", async ({page}) => {
  await openEditor(page);
  const at = await findSpruce(page);
  await expect(box(page)).toContainText("Tree");
  await expect(box(page)).toContainText("spruce");
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await saved(page);
  expect((await draft(page)).deleted.map(d => [d.id, d.kind])).toEqual([["trees#1", "treefx"]]);
  await page.keyboard.press("Control+z");
  await saved(page);
  expect((await draft(page)).deleted).toEqual([]);
  await page.keyboard.press("Control+Shift+z");
  await saved(page);
  await saveTrack(page);
  expect((await treesTxt(page)).map(t => t.model)).toEqual(["spruce"]);
  await openEditor(page);
  expect((await draft(page)).deleted.map(d => d.id)).toEqual(["trees#1"]);     // (reopened: the source still has it, the draft leaves it out)
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
});

test("a 3D tree dragged by Move is placed where it is let go; Save moves it in trees.txt, reopened it is moved once", async ({page}) => {
  await openEditor(page);
  const at = await findSpruce(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("t");
  await expect(page.locator("#edit-move-set")).toBeVisible();
  await dragMouse(page, at, {x: at.x + 80, y: at.y});
  await expect(page.locator("#edit-placed")).toHaveText("1 object moved");
  await saved(page);
  const [moved] = (await draft(page)).placed;
  expect(moved.id).toBe("trees#1");
  expect(moved.x).toBeGreaterThan(1);
  await saveTrack(page);
  const once = (await treesTxt(page))[1];        // (trees#1: trees.txt in the order of the numbers)
  expect(once.pos[0]).toBeCloseTo(128 + moved.x, 1);
  await openEditor(page);
  expect((await draft(page)).placed).toEqual([moved]);      // (reopened: the source and the move, not the move twice)
  await findSpruce(page).then(() => { throw new Error("the spruce stands where it was"); }, () => {});
});

test("Copy of a 3D tree places new trees under numbers never given; Undo takes one back, its number is not given again", async ({page}) => {
  await openEditor(page);
  const at = await findSpruce(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page));
  await page.mouse.click(c.x + 120, c.y + 100);
  await expect.poll(async () => (await draft(page)).trees.map(t => t.id)).toEqual(["trees#2"]);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await draft(page)).trees).toEqual([]);
  await page.mouse.move(at.x, at.y);
  await expect(box(page)).toContainText("trees#1");
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  await page.mouse.click(c.x + 120, c.y + 100);
  await expect.poll(async () => (await draft(page)).trees.map(t => t.id)).toEqual(["trees#3"]);
  await saved(page);
  await page.keyboard.press("Escape");
  await saveTrack(page);
  expect((await treesTxt(page)).map(t => t.model)).toEqual(["spruce", "spruce", "spruce"]);
});

test("Delete's brush takes the 3D trees its stroke passes over, as one Undo, and they stay deleted when it ends", async ({page}) => {
  await openEditor(page);
  await scene(page).focus();
  await page.keyboard.press("x");
  const bar = page.locator("#edit-delete-set");
  await bar.getByRole("button", {name: "Brush", exact: true}).click();
  await bar.getByLabel("Radius").fill("200");
  await scene(page).focus();
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y + 40);
  await page.mouse.down(); await page.mouse.move(c.x + 30, c.y + 45, {steps: 5}); await page.mouse.up();
  await expect(page.locator("#edit-count")).toHaveText("2 objects deleted");
  await saved(page);
  expect((await draft(page)).deleted.map(d => d.id).sort()).toEqual(["trees#0", "trees#1"]);
  await findSpruce(page).then(() => { throw new Error("the spruce is still shown"); }, () => {});
  await page.keyboard.press("Control+z");
  await saved(page);
  expect((await draft(page)).deleted).toEqual([]);
});
