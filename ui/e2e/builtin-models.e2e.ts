import {test, expect, openEditor, scene} from "./fixtures";
import {meshes, saved} from "./edit-helpers";

test("our parked car and fountain can be selected from the library, placed and saved with collision", async ({page, backend}, info) => {
  await backend.post("/__test/builtin-models");
  await openEditor(page);
  const library = page.getByRole("dialog", {name: "Asset library"});
  let placed = 0;
  for (const [query, name, x] of [["Parked saloon", "Parked saloon — red", 550], ["fountain", "Stone fountain", 720]] as const) {
    await page.getByRole("button", {name: "Insert", exact: true}).click();
    await library.getByLabel("Search objects").fill(query);
    await library.getByRole("button", {name, exact: true}).click();
    await library.getByRole("button", {name: "Place on ground", exact: true}).click();
    await scene(page).click({position: {x, y: 450}});
    await page.keyboard.press("Escape");
    // Model preparation answers before the queued draft write; wait for this placement to be retained.
    await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/index")).json()).models.length).toBe(++placed);
    await saved(page);
  }
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  expect(index.models).toHaveLength(2);
  expect(index.models.every((m: {collision: string}) => m.collision === "mesh")).toBe(true);
  await scene(page).screenshot({path: info.outputPath("placed-car-and-fountain.png")});
  await page.locator("#edit-save-more").click(); await page.locator("#save-name").fill("Cars and fountains");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  await expect(page.locator("#edit-track")).toHaveValue("cars_and_fountains");
  expect(Object.keys(await meshes(page, "cars_and_fountains")).some(name => name.startsWith("1WALL_m2l_model_"))).toBe(true);
});

test("a shipped native tree and street lamp place, Undo, Save and reopen without the library or caches", async ({page, backend}, info) => {
  await backend.post("/__test/builtin-models");
  await openEditor(page);
  const baseTrees = (await (await page.request.get("/api/editor/alpha/treefx")).json()).ids.length;
  const library = page.getByRole("dialog", {name: "Asset library"});
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await library.getByLabel("Search objects").fill("Spruce");
  await library.getByRole("button", {name: "Spruce", exact: true}).click();
  await library.getByRole("button", {name: "Place on ground", exact: true}).click();
  const native = page.waitForResponse(response => /\/treefx\/m2l_tree_[a-f0-9]+$/.test(new URL(response.url()).pathname));
  await scene(page).click({position: {x: 600, y: 400}});
  expect((await (await native).json()).lods).toHaveLength(3);
  await page.keyboard.press("Escape"); await saved(page);
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/treefx")).json()).ids.length).toBe(baseTrees + 1);
  await page.getByRole("button", {name: /Undo/}).click(); await saved(page);
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/treefx")).json()).ids.length).toBe(baseTrees);
  await page.getByRole("button", {name: /Redo/}).click(); await saved(page);
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/treefx")).json()).ids.length).toBe(baseTrees + 1);
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await library.getByLabel("Search objects").fill("Street lamp");
  await library.getByRole("button", {name: "Street lamp", exact: true}).click();
  await library.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 700, y: 450}});
  await page.keyboard.press("Escape"); await saved(page);
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/index")).json()).models.length).toBe(2);
  await scene(page).screenshot({path: info.outputPath("placed-tree-and-lamp.png")});
  await page.locator("#edit-save-more").click(); await page.locator("#save-name").fill("Built in scenery");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  await expect(page.locator("#edit-track")).toHaveValue("built_in_scenery");
  const before = await meshes(page, "built_in_scenery");
  await backend.post("/__test/cold-models");
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const index = await (await page.request.get("/api/editor/built_in_scenery/index")).json();
  expect(index.models).toHaveLength(2); expect(index.treefx).toBe(baseTrees + 1);
  expect(Object.values(index.model_assets).every((a: unknown) => (a as {license: string}).license === "MIT")).toBe(true);
  await page.locator("#edit-save-more").click(); await page.locator("#save-name").fill("Built in cold");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  await expect(page.locator("#edit-track")).toHaveValue("built_in_cold");
  expect(await meshes(page, "built_in_cold")).toEqual(before);
  expect((await (await page.request.get("/api/editor/built_in_cold/treefx")).json()).ids).toHaveLength(baseTrees + 1);
});
