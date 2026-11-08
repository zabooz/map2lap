import {expect, openEditor, test} from "./fixtures";

// A small PNG input; the importer prepares actual PNG and DDS files in the test server's private folders.
const image = {name: "summer-grass.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64")};

test("import previews a material, keeps its settings and finds it after a reload", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Textures"});
  await expect(panel).toContainText("No textures yet");
  await panel.locator('input[type="file"]').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await expect(dialog.getByRole("img", {name: "Texture preview"})).toBeVisible();
  await dialog.getByLabel("Name", {exact: true}).fill("Summer meadow");
  await dialog.getByLabel("Category").selectOption("grass");
  await dialog.getByLabel("Width (m)").fill("3");
  await dialog.getByLabel("Height (m)").fill("2");
  await page.screenshot({path: test.info().outputPath("material-import.png")});
  await dialog.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(dialog).toBeHidden();
  await expect(panel).toContainText("Summer meadow");
  await expect(panel).toContainText("3 × 2 m");
  await page.screenshot({path: test.info().outputPath("material-library.png")});
  await page.reload();
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  await expect(panel).toContainText("Summer meadow");
  await panel.getByLabel("Search textures").fill("missing");
  await expect(panel).toContainText("No matching textures");
  await panel.getByLabel("Search textures").fill("summer");
  await expect(panel.getByRole("button", {name: "Summer meadow"})).toBeVisible();
});

test("cancelled and invalid imports leave the library unchanged and typing cannot edit the track", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Textures"});
  await panel.locator('input[type="file"]').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await dialog.getByLabel("Name", {exact: true}).fill("xxx material");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
  expect((await (await page.request.get("/api/library/materials")).json()).total).toBe(0);
  await panel.locator('input[type="file"]').setInputFiles({name: "broken.png", mimeType: "image/png", buffer: Buffer.from("broken")});
  await expect(dialog).toContainText("Could not read this image");
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeDisabled();
});

test("library filters keep their keys instead of switching the active Editor tool", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Textures"});
  await panel.getByLabel("Filter textures").focus();
  await page.keyboard.press("m");
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
});
