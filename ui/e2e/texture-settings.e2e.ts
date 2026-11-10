import {centre, expect, openEditor, scene, test} from "./fixtures";
import {saved} from "./edit-helpers";

const photo = {name: "grass.png", mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64")};

test("Edit changes repetition without reimport, and deleting its library entry preserves the painted track", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", grass: true, trees: false});
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  const properties = page.getByRole("complementary", {name: "Inspector"});
  await expect(page.locator("#edit-surface")).toHaveText("Meadow");
  await page.getByRole("button", {name: "Library", exact: true}).click();
  const picker = page.getByRole("dialog", {name: "Asset library", exact: true});
  await picker.getByLabel('Texture file').setInputFiles(photo);
  const importer = page.getByRole("dialog", {name: "Import texture", exact: true});
  await importer.getByLabel("Name", {exact: true}).fill("Retained meadow");
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(importer).toBeHidden();
  await picker.getByLabel("Break up texture repetition").uncheck();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  await expect(properties.locator("#inspect-appearance")).toContainText("Retained meadow");
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  expect(index.materials.some((m: {splat?: {images: {variation?: boolean}[]}}) => m.splat?.images.some(p => p.variation === false))).toBe(true);
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await picker.getByLabel("Break up texture repetition").check();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await picker.getByRole("button", {name: "Delete texture", exact: true}).click();
  await expect(picker).toContainText("Texture deleted from the library");
  await picker.getByRole("button", {name: "Cancel", exact: true}).click();
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const again = await centre(scene(page));
  await page.mouse.click(again.x, again.y);
  await expect(properties.locator("#inspect-appearance")).toContainText("Retained meadow");
  await expect(properties.getByRole("img", {name: "Selected texture"})).toBeVisible();
});
