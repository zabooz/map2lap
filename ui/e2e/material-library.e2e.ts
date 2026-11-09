import {expect, openEditor, test} from "./fixtures";
import {createHash} from "node:crypto";

// A small PNG input; the importer prepares actual PNG and DDS files in the test server's private folders.
const image = {name: "summer-grass.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64")};
const normal = {name: "ground-normal.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGNsaPjPwMDAxAAGABefAgM45HnVAAAAAElFTkSuQmCC", "base64")};
const replacementNormal = {name: "replacement-normal.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGNsWPCVgYGBiQEMABixAhmSjJy8AAAAAElFTkSuQmCC", "base64")};
const roughness = {name: "ground-roughness.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAAAAABX3VL4AAAADklEQVR4nGMMYGBiYAAAAaIAVBelrcoAAAAASUVORK5CYII=", "base64")};

test("optional material maps keep original roles and settings after importing and reloading", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await panel.getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await dialog.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(normal);
  await dialog.getByLabel("Roughness map (optional)", {exact: true}).setInputFiles(roughness);
  await dialog.getByLabel("Name", {exact: true}).fill("Mapped meadow");
  await dialog.getByLabel("Width (m)").fill("2");
  await dialog.getByLabel("Height (m)").fill("3");
  await dialog.getByLabel("Break up texture repetition").uncheck();
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeEnabled();
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeInViewport();
  await page.screenshot({path: test.info().outputPath("material-maps-import.png")});
  await dialog.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(dialog).toBeHidden();
  await expect(panel).toContainText("Normal map: ground-normal.png");
  await expect(panel).toContainText("Roughness map: ground-roughness.png");
  const {items} = await (await page.request.get("/api/library/materials")).json();
  const id = items.find((value: {name: string}) => value.name === "Mapped meadow").id;
  const saved = await (await page.request.get(`/api/library/materials/${id}`)).json();
  expect(saved.repeat).toEqual([2, 3]);
  expect(saved.variation).toBe(false);
  for (const [role, original] of [["colour", image], ["normal", normal], ["roughness", roughness]] as const) {
    expect(saved.maps[role].filename).toBe(original.name);
    expect(saved.maps[role].sha256).toBe(createHash("sha256").update(original.buffer).digest("hex"));
  }
  await page.reload();
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  await panel.getByRole("button", {name: "Mapped meadow", exact: true}).click();
  await expect(panel).toContainText("Normal map: ground-normal.png");
  await expect(panel).toContainText("Roughness map: ground-roughness.png");
});

test("optional material maps prepare serially and discard a replaced pending map", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  await page.getByRole("dialog", {name: "Asset library"}).getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await expect(dialog.getByRole("img", {name: "Texture preview"})).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const uploads: string[] = [];
  await page.route("**/api/library/imports?**", async route => {
    const role = new URL(route.request().url()).searchParams.get("role");
    if (!role) return route.continue();
    uploads.push(role);
    if (uploads.length === 1) await gate;
    await route.fulfill({response: await route.fetch()});
  });
  try {
    await dialog.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(normal);
    await expect.poll(() => uploads.length).toBe(1);
    await dialog.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(replacementNormal);
    await dialog.getByLabel("Roughness map (optional)", {exact: true}).setInputFiles(roughness);
    await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeDisabled();
    expect(uploads).toEqual(["normal"]);
  } finally { release(); }
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeEnabled();
  expect(uploads).toEqual(["normal", "normal", "roughness"]);
  await dialog.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(dialog).toBeHidden();
  const {items} = await (await page.request.get("/api/library/materials")).json();
  const saved = await (await page.request.get(`/api/library/materials/${items[0].id}`)).json();
  expect(saved.maps.normal.filename).toBe(replacementNormal.name);
  expect(saved.maps.normal.sha256).toBe(createHash("sha256").update(replacementNormal.buffer).digest("hex"));
});

test("optional material maps reject invalid data until removed without importing a partial material", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  await page.getByRole("dialog", {name: "Asset library"}).getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await dialog.getByLabel("Normal map (optional)", {exact: true}).setInputFiles({name: "broken.png", mimeType: "image/png", buffer: Buffer.from("broken")});
  await expect(dialog.getByRole("alert")).toContainText("Normal map");
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeDisabled();
  expect((await (await page.request.get("/api/library/materials")).json()).total).toBe(0);
  await dialog.getByRole("button", {name: "Remove normal map", exact: true}).click();
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeEnabled();
  await dialog.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(dialog).toBeHidden();
  const {items} = await (await page.request.get("/api/library/materials")).json();
  const saved = await (await page.request.get(`/api/library/materials/${items[0].id}`)).json();
  expect(Object.keys(saved.maps)).toEqual(["colour"]);
});

test("optional material maps cancelled during preparation cannot enter the next import", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await panel.getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await expect(dialog.getByRole("img", {name: "Texture preview"})).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const uploads: string[] = [];
  await page.route("**/api/library/imports?**", async route => {
    const role = new URL(route.request().url()).searchParams.get("role")!;
    uploads.push(role);
    if (uploads.length === 1) await gate;
    await route.fulfill({response: await route.fetch()});
  });
  try {
    await dialog.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(normal);
    await expect.poll(() => uploads.length).toBe(1);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await panel.getByLabel('Texture file').setInputFiles({...image, name: "next-colour.png"});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeDisabled();
    expect(uploads).toEqual(["normal"]);
  } finally { release(); }
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeEnabled();
  await expect(dialog.getByRole("button", {name: "Remove normal map", exact: true})).toHaveCount(0);
  await dialog.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(dialog).toBeHidden();
  const {items} = await (await page.request.get("/api/library/materials")).json();
  expect(items).toHaveLength(1);
  const saved = await (await page.request.get(`/api/library/materials/${items[0].id}`)).json();
  expect(saved.maps.colour.filename).toBe("next-colour.png");
  expect(Object.keys(saved.maps)).toEqual(["colour"]);
});

test("import previews a material, keeps its settings and finds it after a reload", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await expect(panel).toContainText("No textures yet");
  await panel.getByLabel('Texture file').setInputFiles(image);
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
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await panel.getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await dialog.getByLabel("Name", {exact: true}).fill("xxx material");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
  expect((await (await page.request.get("/api/library/materials")).json()).total).toBe(0);
  await panel.getByLabel('Texture file').setInputFiles({name: "broken.png", mimeType: "image/png", buffer: Buffer.from("broken")});
  await expect(dialog).toContainText("Could not read this image");
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeDisabled();
});

test("library filters keep their keys instead of switching the active Editor tool", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Edit", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await panel.getByLabel("Filter textures").focus();
  await page.keyboard.press("m");
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
});
