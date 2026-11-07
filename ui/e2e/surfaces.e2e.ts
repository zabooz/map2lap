import {centre, expect, openEditor, scene, stillView, test} from "./fixtures";
import {writeFile} from "node:fs/promises";

test("Select picks the painted surface, shows it without an edit, and Escape clears the highlight", async ({page}, testInfo) => {
  await openEditor(page);
  const at = await centre(scene(page));
  const before = await stillView(page);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-surface")).toContainText("Asphalt");
  await page.mouse.move(100, 500); // the hover information covers the canvas's screenshot rectangle
  expect((await stillView(page)).equals(before)).toBe(false);
  await expect(page.locator("#edit-saved")).toHaveText("");
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-surface")).toHaveCount(0);
  const restored = await stillView(page);
  await writeFile(testInfo.outputPath("before.png"), before);
  await writeFile(testInfo.outputPath("restored.png"), restored);
  await testInfo.attach("before", {body: before, contentType: "image/png"});
  await testInfo.attach("restored", {body: restored, contentType: "image/png"});
  expect(restored.equals(before)).toBe(true);
});

test("a late surface response is discarded after Escape", async ({page}) => {
  await openEditor(page);
  let release!: () => void, arrived!: () => void;
  const waiting = new Promise<void>(r => { release = r; });
  const started = new Promise<void>(r => { arrived = r; });
  await page.route("**/surface?*", async route => { arrived(); await waiting; await route.continue(); });
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  await started;
  await page.keyboard.press("Escape");
  release();
  await expect(page.locator("#edit-surface")).toHaveCount(0);
  await expect(page.locator("#edit-surface-error")).toHaveCount(0);
});

test("an older track explains that its painted ground needs a new build", async ({page}) => {
  await openEditor(page, "gamma");
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-surface-error")).toContainText("Build it again");
  await expect(page.locator("#edit-surface")).toHaveCount(0);
});
