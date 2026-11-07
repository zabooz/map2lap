// Move in the Editor: an object dragged over the ground, turned, raised and sized by the wheel, kept in the draft, back by undo and Reset.
import {dragMouse, expect, openEditor, scene, stillView, test} from "./fixtures";
import {NEAR_TREE, VIEW_ALONE, findTitled, findTree, picture, saved, stored} from "./edit-helpers";

interface Placed {
  id: string;
  x: number;
  y: number;
  z: number;
  turn: number;
  scale: number;
}

/** The view as it stands still, the mouse where it is (held, it drags). */
const asItIs = async (page: Parameters<typeof stored>[0]) => {
  await stillView(page);
  return scene(page).screenshot(VIEW_ALONE);
};

const placed = async (page: Parameters<typeof stored>[0]) => ((await stored(page)) as unknown as {placed: Placed[]}).placed;

test("M takes up Move; a tree dragged goes where it is let go, kept in the draft; undo puts it back to the pixel", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  await scene(page).focus();
  await page.keyboard.press("m");
  await expect(page.locator("#edit-move-set")).toBeVisible();
  const at = await findTree(page);
  await dragMouse(page, at, {x: at.x + 80, y: at.y});
  await expect(page.locator("#edit-placed")).toHaveText("1 object moved");
  await saved(page);
  const [tree] = await placed(page);
  expect(tree.id).toBe(NEAR_TREE);
  expect(tree.x).toBeGreaterThan(1);                    // (to the right, over the road ahead of the start: east)
  expect([tree.y, tree.turn, tree.scale]).toEqual([0, 0, 1]);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await page.keyboard.press("Control+z");
  await saved(page);
  expect(await placed(page)).toEqual([]);
  await page.keyboard.press("Escape");          // (Select again, nothing picked: no frame in the picture)
  await expect(page.locator("#edit-move-set")).toBeHidden();
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("a house picked is turned, raised and sized by the wheel with Shift, Ctrl and Alt, its sign with it; Reset puts it back", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  const before = await picture(page);
  await page.locator("#edit-move").click();
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y);
  await expect(page.locator("#edit-picked")).toContainText("Building");
  const bar = page.locator("#edit-move-set");
  for (const [key, label, value] of [["Shift", "Turn", "5"], ["Control", "Height", "10"], ["Alt", "Size", "105"]] as const) {
    await page.keyboard.down(key);
    await page.mouse.wheel(0, -100);
    await page.keyboard.up(key);
    await expect(bar.getByLabel(label)).toHaveValue(value);
  }
  await saved(page);
  expect(await placed(page)).toEqual([{id: "t_0_0#0", x: 0, y: 0.1, z: 0, turn: 5, scale: 1.05}]);       // (the house, not its sign: it goes along)
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await page.keyboard.press("Control+z");
  await saved(page);
  expect((await placed(page))[0].scale).toBe(1);
  await page.locator("#edit-move-reset").click();
  await saved(page);
  expect(await placed(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("the wheel while the mouse is held: raised where it is dragged to, no jump back; let go, the draft holds both", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  await page.locator("#edit-move").click();
  const house = await findTitled(page, "Building");
  await page.mouse.move(house.x, house.y);
  await page.mouse.down();
  await page.mouse.move(house.x + 60, house.y, {steps: 4});
  await page.keyboard.down("Control");
  for (let k = 0; k < 20; k++) await page.mouse.wheel(0, -100);         // (2 m up)
  await page.keyboard.up("Control");
  await saved(page);
  const raised = await asItIs(page);
  await page.mouse.move(house.x + 61, house.y);
  await page.mouse.move(house.x + 60, house.y);
  expect((await asItIs(page)).equals(raised)).toBe(true);       // (a move of the mouse shows what was there: not the house as it was before)
  await page.mouse.up();
  await saved(page);
  const [p] = await placed(page);
  expect(p.y).toBeCloseTo(2, 3);
  expect(p.x).toBeGreaterThan(1);
});

test("a number typed in the bar places what is picked at once", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  await page.locator("#edit-move").click();
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y);
  await page.locator("#edit-move-set").getByLabel("Turn").fill("90");
  await saved(page);
  expect((await placed(page))[0]).toMatchObject({id: "t_0_0#0", turn: 90});
});
