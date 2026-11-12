// Regressions for asynchronous Copy/Move changes: delayed mesh loads, ready templates and failed drafts.
import {centre, dragMouse, expect, openEditor, scene, stillView, test} from "./fixtures";
import {findTree, findTitled, saved, stored, VIEW_ALONE} from "./edit-helpers";

async function heightFixture(page: Parameters<typeof openEditor>[0]) {
  await page.evaluate(async () => {
    const d = await (await fetch("/api/editor/alpha/edits")).json(), nx = 129, nz = 129;
    const mm = Array.from({length: nx * nz}, (_, k) => {
      const x = k % nx, z = Math.floor(k / nx);
      return x && z && x < nx - 1 && z < nz - 1 ? Math.round(3000 * Math.exp(-(((-256 + z * 2 + 80) / 25) ** 2))) : 0;
    });
    const r = await fetch("/api/editor/alpha/edits", {method: "PUT", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({...d, id: "terrain-fixture", heights: [{id: "slope", x: 0, z: -256, nx, nz, mm}]})});
    if (!r.ok) throw new Error(await r.text());
  });
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
}

test("an unrelated draft change does not reject a pending copy mesh", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});     // (a house's copy is a mesh; a tree's a TreeFX tree)
  await openEditor(page);
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  const firstCopy = Math.max(...index.meshes.map((m: {i: number}) => m.i)) + 1;
  let release!: () => void, mark!: () => void;
  const gate = new Promise<void>(r => { release = r; }), blocked = new Promise<void>(r => { mark = r; });
  await page.route("**/api/editor/alpha/mesh/*", async route => {
    const i = Number(new URL(route.request().url()).pathname.split("/").at(-1));
    if (i >= firstCopy) { mark(); await gate; }
    await route.continue();
  });
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y); await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const c = await centre(scene(page)); await page.mouse.click(c.x + 120, c.y + 100);
  await blocked;
  await page.evaluate(async () => {
    const d = await (await fetch("/api/editor/alpha/edits")).json();
    const r = await fetch("/api/editor/alpha/edits", {method: "PUT", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({...d, id: "unrelated-delete", deleted: [{id: "trees#0", position: [40, 0, -200]}]})});
    if (!r.ok) throw new Error(await r.text());
  });
  const answer = page.waitForResponse(r => r.url().includes(`/mesh/${firstCopy}?`));
  release();
  expect((await answer).status()).toBe(200);
  await expect(page.locator("#edit-view-failed")).toHaveCount(0);
});

test("right-click leaves a ready Copy source frozen until Duplicate explicitly chooses another", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y); await page.keyboard.press("c");
  const bar = page.locator("#edit-copy-set");
  await expect(bar).toContainText("Click to place tree");
  const house = await findTitled(page, "Building");
  await page.mouse.click(house.x, house.y, {button: "right"});
  // Read the current index and settle rendering before checking the unchanged template.
  await page.request.get("/api/editor/alpha/index");
  await scene(page).screenshot();
  await expect(bar).toContainText("Click to place tree");
  await page.getByRole("menuitem", {name: "Duplicate", exact: true}).click();
  await expect(bar).toContainText("Click to place house");
});

test("a move whose prerequisite draft fails restores the last kept geometry", async ({page}) => {
  await openEditor(page); await heightFixture(page);
  await page.locator("#edit-move").click();
  const tree = await findTree(page); await page.mouse.click(tree.x, tree.y);
  const picture = async () => { await stillView(page); return scene(page).screenshot({style: `${VIEW_ALONE.style} #hover-box {visibility:hidden}`}); };
  const before = await picture();
  let release!: () => void, mark!: () => void;
  const gate = new Promise<void>(r => { release = r; }), blocked = new Promise<void>(r => { mark = r; });
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() === "PUT") {
      mark(); await gate; await route.fulfill({status: 500, json: {error: "Injected save failure"}});
    } else await route.continue();
  });
  await page.locator("#edit-move-set").getByLabel("Raise").fill("100");
  await blocked;
  const at = await findTree(page);
  await dragMouse(page, at, {x: at.x + 80, y: at.y});
  release();
  await expect(page.locator("#edit-bar")).toHaveAttribute("data-kept", "failed");
  await expect.poll(async () => (await picture()).equals(before)).toBe(true);
  expect((await stored(page) as unknown as {placed: unknown[]}).placed).toEqual([]);
});

test("a second house drag while Move is pending retains clearance over edited terrain", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", house: true});
  await openEditor(page); await heightFixture(page);
  await page.locator("#edit-move").click();
  const house = await findTitled(page, "Building"); await page.mouse.click(house.x, house.y);
  let release!: () => void, mark!: () => void, calls = 0;
  const gate = new Promise<void>(r => { release = r; }), blocked = new Promise<void>(r => { mark = r; });
  await page.route("**/api/editor/alpha/move", async route => {
    if (++calls === 1) { mark(); await gate; }
    await route.continue();
  });
  await dragMouse(page, house, {x: house.x, y: house.y + 65}); await blocked;
  const again = await findTitled(page, "Building");
  await dragMouse(page, again, {x: again.x, y: again.y + 20});
  release();
  await expect.poll(() => calls).toBe(2); await saved(page);
  const [p] = (await stored(page) as unknown as {placed: {z: number; y: number}[]}).placed;
  // The ground mesh samples the field every 16 m; objects sample its original 2 m raster.
  const sample = (z: number) => Math.round(3000 * Math.exp(-(((z + 80) / 25) ** 2))) / 1000;
  const at = (z: number, step: number) => { const a = Math.floor(z / step) * step, t = (z - a) / step; return sample(a) * (1 - t) + sample(a + step) * t; };
  const z = -63 + p.z;
  expect(p.y).toBeCloseTo(at(z, 16) - at(-63, 16) - at(z, 2) + at(-63, 2), 2);
});
