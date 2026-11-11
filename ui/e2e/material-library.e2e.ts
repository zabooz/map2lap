import {expect, openEditor, test} from "./fixtures";
import {openLibrary, test as libraryTest} from "./library-fixtures";
import {createHash} from "node:crypto";

// A small PNG input; the importer prepares actual PNG and DDS files in the test server's private folders.
const image = {name: "summer-grass.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVQIHWP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64")};
const normal = {name: "ground-normal.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGNsaPjPwMDAxAAGABefAgM45HnVAAAAAElFTkSuQmCC", "base64")};
const replacementNormal = {name: "replacement-normal.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGNsWPCVgYGBiQEMABixAhmSjJy8AAAAAElFTkSuQmCC", "base64")};
const roughness = {name: "ground-roughness.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAAAAABX3VL4AAAADklEQVR4nGMMYGBiYAAAAaIAVBelrcoAAAAASUVORK5CYII=", "base64")};

libraryTest("optional material maps keep original roles and settings after importing and reloading", async ({page}) => {
  await openLibrary(page);
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
  // (the texture's facts stand as the object's do: name, category, then Source, Licence and the maps in one table)
  const facts = panel.getByRole("tabpanel", {name: "Textures"}).locator("dl");
  await expect(facts).toContainText("Normal mapground-normal.png");
  await expect(facts).toContainText("Roughness mapground-roughness.png");
  await expect(facts).toContainText("Licence");
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
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await panel.getByRole("button", {name: "Mapped meadow", exact: true}).click();
  await expect(panel).toContainText("Normal mapground-normal.png");
  await expect(panel).toContainText("Roughness mapground-roughness.png");
});

libraryTest("optional material maps prepare serially and discard a replaced pending map", async ({page}) => {
  await openLibrary(page);
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
    // Resume the browser upload: WebKit does not expose File bodies for route.fetch() to replay.
    await route.continue();
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

libraryTest("optional material maps reject invalid data until removed without importing a partial material", async ({page}) => {
  await openLibrary(page);
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

libraryTest("optional material maps cancelled during preparation cannot enter the next import", async ({page}) => {
  await openLibrary(page);
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
    await route.continue();
  });
  try {
    await dialog.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(normal);
    await expect.poll(() => uploads.length).toBe(1);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(panel).toBeVisible();
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

libraryTest("import previews a material, keeps its settings and finds it after a reload", async ({page}) => {
  await openLibrary(page);
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
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await expect(panel).toContainText("Summer meadow");
  await panel.getByLabel("Search textures").fill("missing");
  await expect(panel).toContainText("No matching textures");
  await panel.getByLabel("Search textures").fill("summer");
  await expect(panel.getByRole("button", {name: "Summer meadow"})).toBeVisible();
});

test("cancelled and invalid imports leave the library unchanged and typing cannot edit the track", async ({page}) => {
  await openEditor(page);
  await page.getByRole("button", {name: "Library", exact: true}).click();
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await panel.getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await dialog.getByLabel("Name", {exact: true}).fill("xxx material");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
  expect((await (await page.request.get("/api/library/materials")).json()).total).toBe(0);
  await panel.getByLabel('Texture file').setInputFiles({name: "broken.png", mimeType: "image/png", buffer: Buffer.from("broken")});
  await expect(dialog).toContainText("Could not read this image");
  await expect(dialog.getByRole("button", {name: "Add to library", exact: true})).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await panel.getByLabel("Filter textures").focus();
  await page.keyboard.press("m");
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
});

test("a click beside the library closes it; a drag out of it or a click beside an import over it does not", async ({page}) => {
  await openEditor(page);
  const library = page.getByRole("button", {name: "Library", exact: true}), panel = page.getByRole("dialog", {name: "Asset library"});
  await library.click();
  const search = await panel.getByLabel("Search textures").boundingBox();
  await page.mouse.move(search!.x + 10, search!.y + 10);
  await page.mouse.down();
  await page.mouse.move(5, 5);
  await page.mouse.up();
  await expect(panel).toBeVisible();
  await panel.getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
  await expect(panel).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(panel).toBeHidden();
  await expect(page.locator("#edit-select")).toHaveClass(/on/);
});

libraryTest("the import dialog says what each map does and what the surface is without it", async ({page}) => {
  await openLibrary(page);
  await page.getByRole("dialog", {name: "Asset library"}).getByLabel('Texture file').setInputFiles(image);
  const dialog = page.getByRole("dialog", {name: "Import texture"});
  await expect(dialog).toContainText("Colour: the colour and pattern of the surface.");
  await expect(dialog).toContainText("changes neither the geometry nor the driving. Without one, the surface adds no bumps.");
  await expect(dialog).toContainText("Light is rough and matte, dark smooth and shiny. Without one, the surface is rough.");
});

libraryTest("Settings… choose the next Apply's maps and roughness: Cancel drops them, OK keeps them, the library stays", async ({page}) => {
  await openLibrary(page);
  const panel = page.getByRole("dialog", {name: "Asset library"});
  await panel.getByLabel('Texture file').setInputFiles(image);
  const importer = page.getByRole("dialog", {name: "Import texture"});
  await importer.getByLabel("Normal map (optional)", {exact: true}).setInputFiles(normal);
  await importer.getByLabel("Name", {exact: true}).fill("Glossy meadow");
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(importer).toBeHidden();
  const settings = page.getByRole("dialog", {name: "Texture settings"});
  await panel.getByRole("button", {name: "Settings…", exact: true}).click();
  await expect(settings.getByRole("switch", {name: "Use normal map"})).toBeChecked();
  await expect(settings.getByRole("switch", {name: "Use roughness map"})).toHaveCount(0);       // (none imported)
  await expect(settings).toContainText("No roughness map: the surface is rough.");
  await expect(settings.getByLabel("Break up texture repetition")).toHaveCount(0);              // (a square repeat)
  await settings.getByRole("slider", {name: "Roughness"}).fill("-40");
  await settings.getByRole("button", {name: "Cancel", exact: true}).click();
  await expect(settings).toBeHidden();
  await expect(panel).toContainText("As imported");
  await panel.getByRole("button", {name: "Settings…", exact: true}).click();
  await expect(settings.getByRole("slider", {name: "Roughness"})).toHaveValue("0");
  await settings.getByRole("switch", {name: "Use normal map"}).uncheck();
  await expect(settings.getByRole("slider", {name: "Normal strength"})).toBeDisabled();
  await settings.getByRole("slider", {name: "Roughness"}).fill("-40");
  await settings.getByRole("button", {name: "OK", exact: true}).click();
  await expect(panel).toContainText("Normal map off · Roughness 40 % smoother");
  await expect(panel).toBeVisible();                                                             // (Escape and keys stayed in the settings)
  const {items} = await (await page.request.get("/api/library/materials")).json();
  const id = items.find((value: {name: string}) => value.name === "Glossy meadow").id;
  expect((await (await page.request.get(`/api/library/materials/${id}`)).json()).look).toBeUndefined();
});
