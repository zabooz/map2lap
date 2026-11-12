// Copy keeps one source ready for repeated placement; every instance is an independent edit.
import {centre, expect, openEditor, scene, test} from "./fixtures";
import {box, findTree, findTitled, picture, saved, saveTrack, stored} from "./edit-helpers";

interface Copy {id: string; parts: {source: string; parent: number; matrix: number[]}[]}
interface Tree {id: string; model: string; pos: number[]; angle: number; size: number; width: number}
const copies = async (page: Parameters<typeof stored>[0]) => ((await stored(page)) as unknown as {copies: Copy[]}).copies;
/** The TreeFX trees Copy added to the draft (the trees are TreeFX trees: tracktrees.copied). */
const trees = async (page: Parameters<typeof stored>[0]) => ((await stored(page)) as unknown as {trees: Tree[]}).trees;

test("Copy releases the source selection; X switches to Delete and leaves the original intact", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  await expect(page.locator("#edit-picked")).toHaveCount(0);
  await page.keyboard.press("x");
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-copy-set")).toBeHidden();
  expect((await stored(page)).deleted).toEqual([]);
});

async function findCopy(page: Parameters<typeof stored>[0], id: string, at: {x: number; y: number}) {
  for (let up = 10; up < 250; up += 10) {
    await page.mouse.move(at.x, at.y - up);
    if (await expect(box(page)).toContainText(id, {timeout: 200}).then(() => true, () => false)) return {x: at.x, y: at.y - up};
  }
  throw new Error("The placed copy could not be picked");
}

test("Copy offers Turn, Raise and Size by number and modifier wheel, retained for repeated placements", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.keyboard.press("c");
  const bar = page.locator("#edit-copy-set");
  await expect(bar).toContainText("Click to place");
  for (const [key, label, value] of [["Shift", "Turn", "5"], ["Control", "Raise", "10"], ["Alt", "Size", "105"]] as const) {
    await page.keyboard.down(key);
    await page.mouse.wheel(0, -100);
    await page.keyboard.up(key);
    await expect(bar.getByLabel(label)).toHaveValue(value);
  }
  await bar.getByLabel("Turn").fill("90");
  await bar.getByLabel("Raise").fill("200");
  await bar.getByLabel("Size").fill("200");
  const c = await centre(scene(page));
  await page.mouse.click(c.x + 120, c.y + 100);
  await expect.poll(() => trees(page)).toHaveLength(1);
  await page.mouse.click(c.x + 200, c.y + 100);
  await expect.poll(() => trees(page)).toHaveLength(2);
  const source = (await (await page.request.get("/api/editor/alpha/treefx")).json()) as {ids: string[]; size: number[]};
  for (const tree of await trees(page)) {        // (the source turned by 90 degrees, twice as large, 2 m above the flat ground)
    expect([tree.angle, tree.pos[1]]).toEqual([90, 2]);
    expect(tree.size).toBeCloseTo(2 * source.size[source.ids.indexOf("trees#1")], 2);
  }
});

test("Copy C places the picked tree repeatedly; undo, redo, reload and Save retain independent copies", async ({page}) => {
  await openEditor(page);
  const before = await picture(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page));
  await page.mouse.click(c.x + 100, c.y + 100);
  await expect.poll(() => trees(page)).toHaveLength(1);
  await page.mouse.click(c.x + 200, c.y + 100);
  await expect.poll(() => trees(page)).toHaveLength(2);
  const made = await trees(page);
  expect(made.map(t => [t.id, t.model])).toEqual([["trees#2", "spruce"], ["trees#3", "spruce"]]);
  await page.keyboard.press("Control+z");
  await expect.poll(() => trees(page)).toHaveLength(1);
  await page.keyboard.press("Control+Shift+z");
  await expect.poll(() => trees(page)).toHaveLength(2);
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-copy-set")).toBeHidden();
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  const drawn = (await (await page.request.get("/api/editor/alpha/treefx")).json()) as {ids: string[]};
  for (const copy of made) expect(drawn.ids).toContain(copy.id);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved /);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  expect(await trees(page)).toEqual(made);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved /);

});

test("Copy in the panel can pick its source; a placed tree has its own pick, Move and Delete without changing the original", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-copy").click();
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page)), at = {x: c.x + 150, y: c.y + 100};
  await page.mouse.click(at.x, at.y);
  await expect.poll(() => trees(page)).toHaveLength(1);
  const [copy] = await trees(page);
  await page.keyboard.press("Escape");
  await findCopy(page, copy.id, at);
  await page.mouse.down();
  await page.mouse.up();
  await page.keyboard.press("t");
  await page.locator("#edit-move-set").getByLabel("Raise").fill("100");
  await saved(page);
  const draft = await (await page.request.get("/api/editor/alpha/edits")).json();
  expect(draft.placed).toMatchObject([{id: copy.id, y: 1}]);
  await scene(page).focus();
  await page.keyboard.press("Delete");
  await saved(page);
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([copy.id]);
  await page.keyboard.press("Escape");
});

test("a copied tree offers the same whole-sort deletion as its original", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page)), at = {x: c.x + 150, y: c.y + 100};
  await page.mouse.click(at.x, at.y);
  await expect.poll(() => trees(page)).toHaveLength(1);
  const [copy] = await trees(page);
  await page.keyboard.press("Escape");
  const hit = await findCopy(page, copy.id, at);
  await page.mouse.click(hit.x, hit.y, {button: "right"});
  await page.getByRole("menuitem", {name: /^Mark all /}).click();
  await page.keyboard.press("Delete");
  await saved(page);
  const draft = await (await page.request.get("/api/editor/alpha/edits")).json();
  expect(draft.object_sorts).toEqual(["spruce"]);
});

test("Duplicate in the context menu starts repeat placement of a house with its sign and collision", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Duplicate", exact: true}).click();
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page));
  await page.mouse.click(c.x + 180, c.y + 90);
  await expect.poll(() => copies(page)).toHaveLength(1);
  const [copy] = await copies(page);
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  expect(index.objects[copy.id].kinds).toContain("house");
  expect(index.objects[copy.id].kinds).toContain("house sign");
  await page.keyboard.press("Escape");
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved /);
  const meshes = await (await page.request.get("/__test/meshes?name=alpha")).json();
  expect(Object.keys(meshes).some(name => name.startsWith("1WALL_bld_copy_"))).toBe(true);
});
