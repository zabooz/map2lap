// Copy keeps one source ready for repeated placement; every instance is an independent edit.
import {centre, expect, openEditor, scene, test} from "./fixtures";
import {box, findTree, findTitled, NEAR_TREE, picture, saved, saveTrack, stored} from "./edit-helpers";

interface Copy {id: string; parts: {source: string; parent: number; matrix: number[]}[]}
const copies = async (page: Parameters<typeof stored>[0]) => ((await stored(page)) as unknown as {copies: Copy[]}).copies;

test("Copy releases the source selection; X switches to Delete and leaves the original intact", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  await expect(page.locator("#edit-picked")).toBeHidden();
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

test("Copy offers Turn, Height and Size by number and modifier wheel, retained for repeated placements", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.keyboard.press("c");
  const bar = page.locator("#edit-copy-set");
  await expect(bar).toContainText("Click to place");
  for (const [key, label, value] of [["Shift", "Turn", "5"], ["Control", "Height", "10"], ["Alt", "Size", "105"]] as const) {
    await page.keyboard.down(key);
    await page.mouse.wheel(0, -100);
    await page.keyboard.up(key);
    await expect(bar.getByLabel(label)).toHaveValue(value);
  }
  await bar.getByLabel("Turn").fill("90");
  await bar.getByLabel("Height").fill("200");
  await bar.getByLabel("Size").fill("200");
  const c = await centre(scene(page));
  await page.mouse.click(c.x + 120, c.y + 100);
  await expect.poll(() => copies(page)).toHaveLength(1);
  await page.mouse.click(c.x + 200, c.y + 100);
  await expect.poll(() => copies(page)).toHaveLength(2);
  for (const copy of await copies(page)) {
    const m = copy.parts[0].matrix;
    expect(m[0]).toBeCloseTo(0); expect(m[2]).toBeCloseTo(2);
    expect(m[5]).toBeCloseTo(2); expect(m[8]).toBeCloseTo(-2);
  }
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  for (const mesh of index.meshes.filter((m: {copy: boolean}) => m.copy)) {
    const bytes = await (await page.request.get(`/api/editor/alpha/mesh/${mesh.i}?r=${encodeURIComponent(index.revision)}&d=${index.draft}`)).body();
    let foot = Infinity;
    for (let k = 0; k < mesh.vertices; k++) foot = Math.min(foot, bytes.readFloatLE(k * 44 + 4));
    expect(foot).toBeCloseTo(2); // Tree billboards extend below their pivot: measure the actual foot above the flat ground.
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
  await expect.poll(() => copies(page)).toHaveLength(1);
  await page.mouse.click(c.x + 200, c.y + 100);
  await expect.poll(() => copies(page)).toHaveLength(2);
  const made = await copies(page);
  expect(made[0].id).not.toBe(made[1].id);
  expect(made.map(c => c.parts[0].source)).toEqual([NEAR_TREE, NEAR_TREE]);
  await page.keyboard.press("Control+z");
  await expect.poll(() => copies(page)).toHaveLength(1);
  await page.keyboard.press("Control+Shift+z");
  await expect.poll(() => copies(page)).toHaveLength(2);
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-copy-set")).toBeHidden();
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  for (const copy of made) expect(index.objects[copy.id].kinds).toEqual(["tree"]);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved /);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  expect(await copies(page)).toEqual(made);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved /);
  await page.getByRole("button", {name: "Discard all", exact: true}).click();
  await expect.poll(() => copies(page)).toEqual([]);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
});

test("Copy in the panel can pick its source; a placed tree has its own pick, Move and Delete without changing the original", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-copy").click();
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page)), at = {x: c.x + 150, y: c.y + 100};
  await page.mouse.click(at.x, at.y);
  await expect.poll(() => copies(page)).toHaveLength(1);
  const [copy] = await copies(page);
  await page.keyboard.press("Escape");
  await findCopy(page, copy.id, at);
  await page.mouse.down();
  await page.mouse.up();
  await page.keyboard.press("m");
  await page.locator("#edit-move-set").getByLabel("Height").fill("100");
  await saved(page);
  const draft = await (await page.request.get("/api/editor/alpha/edits")).json();
  expect(draft.placed).toMatchObject([{id: `${copy.id}#0`, y: 1}]);
  await scene(page).focus();
  await page.keyboard.press("Delete");
  await saved(page);
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([`${copy.id}#0`]);
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
  await expect.poll(() => copies(page)).toHaveLength(1);
  const [copy] = await copies(page);
  await page.keyboard.press("Escape");
  const hit = await findCopy(page, copy.id, at);
  await page.mouse.click(hit.x, hit.y, {button: "right"});
  await page.getByRole("menuitem", {name: /^Mark all /}).click();
  await page.keyboard.press("Delete");
  await saved(page);
  const draft = await (await page.request.get("/api/editor/alpha/edits")).json();
  expect(draft.sorts).toHaveLength(1);
  expect(draft.object_sorts).toEqual([]);
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
