import {centre, expect, openEditor, scene, test} from "./fixtures";
import {saved} from "./edit-helpers";

const image = {name: "ground.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64")};

test("appearance and ground Edit open the same searchable material picker; Escape keeps the selection", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", ground_material: "gc_shrub", trees: false});
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  const panel = page.getByRole("complementary", {name: "Selection properties"});
  await expect(panel.locator("#inspect-selection")).toContainText("Shrubland");
  const thumbnail = panel.getByRole("img", {name: "Selected texture"});
  const originalThumbnail = await thumbnail.getAttribute("src");
  const originalBytes = await (await page.request.get(originalThumbnail!)).body();
  await panel.getByRole("button", {name: "Edit texture"}).click();
  const picker = page.getByRole("dialog", {name: "Asset library"});
  await expect(picker).toBeVisible();
  await expect(picker).toContainText("Shrubland");
  await picker.getByLabel("Search textures").fill("hello");
  await page.keyboard.press("Escape");
  await expect(picker).toBeHidden();
  await expect(panel.locator("#inspect-selection")).toContainText("Shrubland");
  await page.mouse.click(at.x, at.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Edit…"}).click();
  await expect(picker).toBeVisible();
  await expect(picker.getByLabel("Search textures")).toHaveValue("hello");
  await picker.getByLabel("Search textures").fill("");
  await picker.getByLabel('Texture file').setInputFiles(image);
  const importer = page.getByRole("dialog", {name: "Import texture"});
  await importer.getByLabel("Name", {exact: true}).fill("Test ground");
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(importer).toBeHidden();
  await expect(picker.getByRole("img", {name: "Texture preview", exact: true})).toBeVisible();
  await page.screenshot({path: test.info().outputPath("material-picker.png")});
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  await expect(page.locator("#edit-paints")).toContainText("1 material change");
  await expect(panel.locator("#inspect-selection")).toContainText("Shrubland");
  await expect(thumbnail).not.toHaveAttribute("src", originalThumbnail!);
  const firstThumbnail = (await thumbnail.getAttribute("src"))!;
  const appliedBytes = await (await page.request.get(firstThumbnail)).body();
  expect(appliedBytes.equals(originalBytes)).toBe(false);
  await scene(page).focus();
  await page.keyboard.press("Control+z"); await saved(page);
  await expect(thumbnail).toHaveAttribute("src", originalThumbnail!);
  await page.keyboard.press("Control+Shift+z"); await saved(page);
  await expect(thumbnail).toHaveAttribute("src", firstThumbnail);
  await panel.getByRole("button", {name: "Edit texture"}).click();
  await picker.getByLabel('Texture file').setInputFiles({name: "blue.png", mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYPgPAAEDAQAIicLsAAAAAElFTkSuQmCC", "base64")});
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await expect(thumbnail).not.toHaveAttribute("src", firstThumbnail);
  const secondBytes = await (await page.request.get((await thumbnail.getAttribute("src"))!)).body();
  expect(secondBytes.equals(appliedBytes)).toBe(false);
});

test("the right panel keeps technical mesh and pointer information in Details", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  const panel = page.getByRole("complementary", {name: "Selection properties"});
  await expect(panel.getByRole("tab", {name: "Properties", exact: true})).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByText("Under pointer", {exact: true})).toBeHidden();
  await panel.getByRole("tab", {name: "Details", exact: true}).click();
  await expect(panel.getByText("Under pointer", {exact: true})).toBeVisible();
  await expect(panel.getByText("Selected mesh details", {exact: true})).toBeVisible();
  await panel.getByRole("tab", {name: "Properties", exact: true}).click();
  await expect(panel.locator("#inspect-selection")).toContainText("Asphalt");
  await expect(panel.getByText("Browse library", {exact: true})).toHaveCount(0);
  await page.screenshot({path: test.info().outputPath("properties-panel.png")});
});

test("asphalt can use an imported material without changing its driving surface", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Edit…"}).click();
  const picker = page.getByRole("dialog", {name: "Asset library"});
  await expect(picker).toContainText("Asphalt");
  await picker.getByLabel('Texture file').setInputFiles(image);
  const importer = page.getByRole("dialog", {name: "Import texture"});
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  const index = await (await page.request.get("/api/editor/alpha/index")).json() as {meshes: {name: string}[]};
  expect(index.meshes.some(m => m.name === "1ROAD_ground_0_0")).toBe(true);
  await page.route("**/api/editor/alpha/paint-asset/*", route => route.fulfill({status: 400, body: "temporarily unavailable"}));
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-view-failed")).toBeVisible();
  await page.getByRole("button", {name: "Discard all", exact: true}).click();
  await saved(page);
  await expect(page.locator("#edit-paints")).toHaveCount(0);
});

test("an oversized combined ground selection explains its limit before Apply", async ({page}) => {
  await page.route("**/api/editor/alpha/surface?**", async route => {
    const response = await route.fetch();
    const data = await response.json() as {tiles: {tile: number[]; mask: string}[]};
    data.tiles = Array.from({length: 65}, (_, i) => ({...data.tiles[0], tile: [i, 0]}));
    await route.fulfill({response, json: data});
  });
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  await page.getByRole("button", {name: "Edit texture"}).click();
  const picker = page.getByRole("dialog", {name: "Asset library"});
  await expect(picker).toContainText("at most 64 ground tiles");
  await expect(picker.getByRole("button", {name: "Apply", exact: true})).toBeDisabled();
});
