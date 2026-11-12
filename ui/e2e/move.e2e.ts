// Move in the Editor: an object dragged over the ground, turned, raised and sized by the wheel, kept in the draft, back by undo and Reset.
import {centre, dragMouse, expect, openEditor, scene, stillView, test} from "./fixtures";
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

test("Transform in the context menu keeps the clicked house picked and opens its controls", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Transform", exact: true}).click();
  await expect(page.locator("#view-menu")).toBeHidden();
  await expect(page.locator("#edit-move")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-move")).toContainText("Transform");
  await expect(page.locator("#edit-picked")).toContainText("Building");
  await expect(page.locator("#edit-move-set")).toBeVisible();
  await page.locator("#edit-move-set").getByLabel("Raise").fill("100");
  await saved(page);
  expect(await placed(page)).toEqual([{id: "t_0_0#0", x: 0, y: 1, z: 0, turn: 0, scale: 1}]);
  await page.mouse.click(house.x, house.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Transform", exact: true}).click();
  await expect(page.locator("#edit-move-set")).toBeVisible(); // Taking up Move again must not toggle it off.
});

test("terrain has Edit instead of object movement actions in its context menu", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y, {button: "right"});
  await expect(page.getByRole("menuitem", {name: "Transform", exact: true})).toHaveCount(0);
  await expect(page.getByRole("menuitem", {name: "Edit…"})).toBeEnabled();
});

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

test("Select then Transform keeps a tree under the mouse on the first drag", async ({page}) => {
  await openEditor(page);
  await scene(page).focus();
  await page.keyboard.press("v");
  const from = await findTree(page);
  await page.mouse.click(from.x, from.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("m");
  await expect(page.locator("#edit-move")).toHaveAttribute("aria-pressed", "true");
  const to = {x: from.x + 100, y: from.y};
  await dragMouse(page, from, to);
  await saved(page);
  await page.mouse.move(to.x + 1, to.y);
  await page.mouse.move(to.x, to.y);
  await expect(page.locator("#hover-box")).toContainText(NEAR_TREE);
  expect((await placed(page))[0].id).toBe(NEAR_TREE);
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
  for (const [key, label, value] of [["Shift", "Turn", "5"], ["Control", "Raise", "10"], ["Alt", "Size", "105"]] as const) {
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

test("a number typed in the inspector places the object picked with Select", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y);
  await page.locator("#inspect-transform").getByLabel("Turn").fill("90");
  await saved(page);
  expect((await placed(page))[0]).toMatchObject({id: "t_0_0#0", turn: 90});
});

test("Move follows a slope and keeps a raised object's clearance, including after another drag", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true});
  await openEditor(page);
  await page.locator("#edit-move").click();
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-move-set").getByLabel("Raise").fill("200");
  await scene(page).focus();
  await saved(page);
  const before = await picture(page);
  const raised = await findTree(page);
  await dragMouse(page, raised, {x: raised.x + 25, y: raised.y + 65});
  await saved(page);
  const hill = (z: number) => { // The fixture's ground is a 2 m grid; the hit is on its linear interpolation.
    const a = Math.floor(z / 2) * 2, t = (z - a) / 2;
    const h = (p: number) => 3 * Math.exp(-(((p + 80) / 18) ** 2));
    return h(a) * (1 - t) + h(a + 2) * t;
  };
  const [first] = await placed(page);
  expect(Math.abs(first.z)).toBeGreaterThan(5);
  expect(Math.abs(hill(-130 + first.z) - hill(-130))).toBeGreaterThan(0.1);
  expect(first.y).toBeCloseTo(2 + hill(-130 + first.z) - hill(-130), 2);
  // A second drag starts at the moved tree; scan its former screen position after the vertical shift.
  let again: {x: number; y: number} | undefined;
  for (let up = -30; up <= 120; up += 10) {
    const p = {x: raised.x + 25, y: raised.y + 65 - up};
    await page.mouse.move(p.x, p.y);
    if (await expect(page.locator("#hover-box")).toContainText(NEAR_TREE, {timeout: 200}).then(() => true, () => false)) { again = p; break; }
  }
  expect(again).toBeDefined();
  await dragMouse(page, again!, {x: again!.x + 20, y: again!.y + 20});
  await saved(page);
  const [second] = await placed(page);
  expect(second.y).toBeCloseTo(2 + hill(-130 + second.z) - hill(-130), 2);
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+z");
  await saved(page);
  expect((await placed(page))[0]).toMatchObject({y: 2, x: 0, z: 0});
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("Move over edited terrain keeps the preview's height when the server takes it over", async ({page}) => {
  const pictureOfDrag = async () => {
    await stillView(page);
    return scene(page).screenshot({style: `${VIEW_ALONE.style} #hover-box { visibility: hidden; }`});
  };
  await openEditor(page);
  // A planar height edit spans the entire drag, so its old and new heights are predictably different.
  await page.evaluate(async () => {
    const draft = await (await fetch("/api/editor/alpha/edits")).json();
    const nx = 129, nz = 129;
    const mm = Array.from({length: nx * nz}, (_, k) => {
      const x = k % nx, z = Math.floor(k / nx);
      return x && z && x < nx - 1 && z < nz - 1 ? z * 20 : 0;
    });
    const result = await fetch("/api/editor/alpha/edits", {method: "PUT", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({base: draft.base, revision: draft.revision, id: "terrain-fixture", deleted: [],
        heights: [{id: "slope", x: 0, z: -256, nx, nz, mm}]})});
    if (!result.ok) throw new Error(await result.text());
  });
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  await page.locator("#edit-move").click();
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.locator("#edit-move-set").getByLabel("Raise").fill("200");
  await scene(page).focus();
  await saved(page);
  const at = await findTree(page);
  await page.mouse.down();
  await page.mouse.move(at.x + 25, at.y + 65, {steps: 8});
  const preview = await pictureOfDrag();
  const answer = page.waitForResponse(r => r.url().endsWith("/api/editor/alpha/move") && r.request().method() === "POST");
  await page.mouse.up();
  const response = await answer;
  expect(response.ok()).toBe(true);
  const proposed = response.request().postDataJSON().placed[0];
  const actual = (await response.json()).placed[0];
  expect(Math.abs(proposed.y - actual.y)).toBeGreaterThan(0.1);
  expect(actual.y).toBeCloseTo(2, 2);
  await saved(page);
  try {
    await expect.poll(async () => {
      const after = await pictureOfDrag();
      return page.evaluate(async ([a, b]) => {
        const pixels = async (encoded: string) => {
          const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${encoded}`)).blob());
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width; canvas.height = bitmap.height;
          const context = canvas.getContext("2d")!;
          context.drawImage(bitmap, 0, 0); bitmap.close();
          return context.getImageData(0, 0, canvas.width, canvas.height).data;
        };
        const [before, after] = await Promise.all([pixels(a), pixels(b)]);
        let different = 0;
        for (let k = 0; k < before.length; k += 4) {
          if ([0, 1, 2].some(c => Math.abs(before[k + c] - after[k + c]) > 3)) different++;
        }
        return different / (before.length / 4);
      }, [preview.toString("base64"), after.toString("base64")]);
    }).toBeLessThanOrEqual(0.0001); // Placements round to mm: allow edge rounding in 0.01% of pixels (20x tighter than render references).
  } finally {
    await test.info().attach("drag-preview", {body: preview, contentType: "image/png"});
    await test.info().attach("after-move", {body: await pictureOfDrag(), contentType: "image/png"});
  }
});

test("a tool or Insert taken up in the sidebar closes the open context menu, so the next click in the view acts", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y, {button: "right"});
  await expect(page.locator("#view-menu")).toBeVisible();
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await expect(page.locator("#view-menu")).toBeHidden();
  await page.keyboard.press("Escape");
  await page.mouse.click(at.x, at.y, {button: "right"});
  await expect(page.locator("#view-menu")).toBeVisible();
  await page.locator("#edit-elevation").click();
  await expect(page.locator("#view-menu")).toBeHidden();
});
