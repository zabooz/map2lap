import {centre, expect, openEditor, scene, test, type Backend} from "./fixtures";
import {saved, saveTrack} from "./edit-helpers";
import type {Page} from "@playwright/test";

const photo = {name: "grass.png", mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64")};
const normal = {name: "grass-normal.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGNsaPjPwMDAxAAGABefAgM45HnVAAAAAElFTkSuQmCC", "base64")};
const roughness = {name: "grass-roughness.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAAAAABX3VL4AAAADklEQVR4nGMMYGBiYAAAAaIAVBelrcoAAAAASUVORK5CYII=", "base64")};

const paints = async (page: Page) => ((await (await page.request.get("/api/editor/alpha/edits")).json()) as {paints: string[]}).paints;

/** The meadow in the view's middle selected, the Editor open on the test track with grass. */
async function meadow(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", grass: true, trees: false});
  await openEditor(page);
  await select(page);
}

async function select(page: Page) {
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-surface")).toHaveText("Meadow");
}

test("Settings change repetition of a rectangular texture without reimport, and deleting its library entry preserves the painted track", async ({page, backend}) => {
  await meadow(page, backend);
  const properties = page.getByRole("complementary", {name: "Inspector"});
  await page.getByRole("button", {name: "Library", exact: true}).click();
  const picker = page.getByRole("dialog", {name: "Asset library", exact: true});
  await picker.getByLabel('Texture file').setInputFiles(photo);
  const importer = page.getByRole("dialog", {name: "Import texture", exact: true});
  await importer.getByLabel("Name", {exact: true}).fill("Retained meadow");
  await importer.getByLabel("Height (m)").fill("3");
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(importer).toBeHidden();
  const settings = page.getByRole("dialog", {name: "Texture settings"});
  await picker.getByRole("button", {name: "Settings…", exact: true}).click();
  await settings.getByLabel("Break up texture repetition").uncheck();
  await settings.getByRole("button", {name: "OK", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  await expect(properties.locator("#inspect-appearance")).toContainText("Retained meadow");
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  expect(index.materials.some((m: {splat?: {images: {variation?: boolean}[]}}) => m.splat?.images.some(p => p.variation === false))).toBe(true);
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await picker.getByRole("button", {name: "Settings…", exact: true}).click();
  await settings.getByLabel("Break up texture repetition").check();
  await settings.getByRole("button", {name: "OK", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  await expect(properties.locator("#inspect-appearance")).toContainText("Repetition variation");
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await picker.getByRole("button", {name: "Delete texture", exact: true}).click();
  await expect(picker).toContainText("Texture deleted from the library");
  await picker.getByRole("button", {name: "Cancel", exact: true}).click();
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await select(page);
  await expect(properties.locator("#inspect-appearance")).toContainText("Retained meadow");
  await expect(properties.getByRole("img", {name: "Selected texture"})).toBeVisible();
});

test("the Inspector's Settings change one application's maps and roughness, with Undo, Redo, Revert, Save and reopen", async ({page, backend}) => {
  await meadow(page, backend);
  const appearance = page.getByRole("complementary", {name: "Inspector"}).locator("#inspect-appearance");
  await page.getByRole("button", {name: "Library", exact: true}).click();
  const picker = page.getByRole("dialog", {name: "Asset library", exact: true});
  await picker.getByLabel('Texture file').setInputFiles(photo);
  const importer = page.getByRole("dialog", {name: "Import texture", exact: true});
  await importer.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(normal);
  await importer.getByLabel("Roughness map (optional)", {exact: true}).setInputFiles(roughness);
  await importer.getByLabel("Name", {exact: true}).fill("Shiny meadow");
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(importer).toBeHidden();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();             // (as imported: the first application)
  await expect(picker).toBeHidden();
  await saved(page);
  await expect(appearance).toContainText("As imported");
  const [first] = await paints(page);
  await page.getByRole("button", {name: "Library", exact: true}).click();
  const settings = page.getByRole("dialog", {name: "Texture settings"});
  await picker.getByRole("button", {name: "Settings…", exact: true}).click();
  await settings.getByRole("slider", {name: "Roughness"}).fill("50");
  await settings.getByRole("button", {name: "OK", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();             // (matter over it: the second one)
  await expect(picker).toBeHidden();
  await saved(page);
  await expect(appearance).toContainText("Roughness 50 % matter");
  const [, second] = await paints(page);

  await appearance.getByRole("button", {name: "Settings…", exact: true}).click();
  await expect(settings).toContainText("Changes “Shiny meadow” where it was applied here");
  await expect(settings.getByRole("slider", {name: "Roughness"})).toHaveValue("50");
  await settings.getByRole("switch", {name: "Use normal map"}).uncheck();
  await settings.getByRole("slider", {name: "Roughness"}).fill("100");
  await settings.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(settings).toBeHidden();
  await saved(page);
  await expect(appearance).toContainText("Normal map off · Roughness 100 % matter");
  const restyled = await paints(page);
  expect(restyled[0]).toBe(first);                                                    // (the other application stays)
  expect(restyled[1]).not.toBe(second);
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  expect(index.materials.some((m: {splat?: {images: {properties?: {roughness_offset?: number}}[]}}) =>
    m.splat?.images.some(p => p.properties?.roughness_offset === 1))).toBe(true);

  await appearance.getByRole("button", {name: "Settings…", exact: true}).click();     // (a switched-off map comes back)
  await expect(settings.getByRole("switch", {name: "Use normal map"})).not.toBeChecked();
  await settings.getByRole("switch", {name: "Use normal map"}).check();
  await settings.getByRole("button", {name: "Apply", exact: true}).click();
  await saved(page);
  await expect(appearance).toContainText("Roughness 100 % matter");
  await expect(appearance).not.toContainText("Normal map off");

  await page.getByRole("button", {name: /Undo/}).click();
  await saved(page);
  await expect(appearance).toContainText("Normal map off · Roughness 100 % matter");
  expect(await paints(page)).toEqual(restyled);
  await page.getByRole("button", {name: /Redo/}).click();
  await saved(page);
  await expect(appearance).not.toContainText("Normal map off");

  await saveTrack(page);
  await appearance.getByRole("button", {name: "Settings…", exact: true}).click();
  await settings.getByRole("button", {name: "As imported", exact: true}).click();
  await settings.getByRole("button", {name: "Apply", exact: true}).click();
  await saved(page);
  await expect(appearance).toContainText("As imported");
  await page.getByRole("button", {name: "Revert to saved", exact: true}).click();
  await saved(page);
  await expect(appearance).toContainText("Roughness 100 % matter");

  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await select(page);
  await expect(appearance).toContainText("Roughness 100 % matter");
  await appearance.getByRole("button", {name: "Settings…", exact: true}).click();
  await expect(settings.getByRole("slider", {name: "Roughness"})).toHaveValue("100");
  await expect(settings.getByRole("switch", {name: "Use normal map"})).toBeChecked();
});

test("a refused settings change keeps the dialog open with its reason and leaves the draft as it was", async ({page, backend}) => {
  await meadow(page, backend);
  const appearance = page.getByRole("complementary", {name: "Inspector"}).locator("#inspect-appearance");
  await page.getByRole("button", {name: "Library", exact: true}).click();
  const picker = page.getByRole("dialog", {name: "Asset library", exact: true});
  await picker.getByLabel('Texture file').setInputFiles(photo);
  const importer = page.getByRole("dialog", {name: "Import texture", exact: true});
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(importer).toBeHidden();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden();
  await saved(page);
  const before = await paints(page);
  await page.route("**/api/editor/alpha/paint-settings", route => route.fulfill({status: 400, contentType: "application/json",
    body: JSON.stringify({error: "Settings refused for the test"})}));
  await appearance.getByRole("button", {name: "Settings…", exact: true}).click();
  const settings = page.getByRole("dialog", {name: "Texture settings"});
  await settings.getByRole("slider", {name: "Roughness"}).fill("30");
  await settings.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(settings.getByRole("alert")).toHaveText("Settings refused for the test");
  await settings.getByRole("button", {name: "Cancel", exact: true}).click();
  await expect(settings).toBeHidden();
  expect(await paints(page)).toEqual(before);
  await expect(appearance).toContainText("As imported");
});
