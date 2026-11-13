import type {Page} from "@playwright/test";
import {writeFile} from "node:fs/promises";
import {expect, openEditor, scene, test} from "./fixtures";
import {picture, saved} from "./edit-helpers";

async function addMaterial(page: Page, name: string, normalY: number | null, roughness = 255, normalX = 128, colourValue = 130, rgbColour?: number[]) {
  return page.evaluate(async ({name, normalY, roughness, normalX, colourValue, rgbColour}) => {
    async function upload(role: string, rgb: number[]) {
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 16;
      const ctx = canvas.getContext("2d")!; ctx.fillStyle = `rgb(${rgb.join(",")})`; ctx.fillRect(0, 0, 16, 16);
      const blob = await new Promise<Blob>(ok => canvas.toBlob(value => ok(value!), "image/png"));
      const response = await fetch(`/api/library/imports?filename=${role}.png&role=${role}`, {
        method: "POST", headers: {"Content-Type": "application/x-map2lap-image"}, body: blob,
      });
      if (!response.ok) throw new Error(await response.text());
      return {token: (await response.json()).token, filename: `${role}.png`};
    }
    const colour = await upload("colour", rgbColour ?? [colourValue, colourValue, colourValue]);
    const maps = normalY === null ? {} : {
      normal: await upload("normal", [normalX, normalY, 218]),
      roughness: await upload("roughness", [roughness, roughness, roughness]),
    };
    const response = await fetch("/api/library/materials", {method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({...colour, name, category: "grass", repeat: [2, 3], variation: false,
        maps})});
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()).material.id as string;
  }, {name, normalY, roughness, normalX, colourValue, rgbColour});
}

async function rgb(page: Page, png: Buffer, x: number, y: number) {
  return page.evaluate(async ({raw, x, y}) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${raw}`)).blob());
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, Math.floor(bitmap.width * x), Math.floor(bitmap.height * y), 1, 1, 0, 0, 1, 1);
    bitmap.close();
    return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
  }, {raw: png.toString("base64"), x, y});
}

async function untouchedDelta(page: Page, before: Buffer, after: Buffer, x = .7, y = .65) {
  return page.evaluate(async ({images, x, y}) => {
    const crops: Uint8ClampedArray[] = [];
    for (const raw of images) {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${raw}`)).blob());
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, Math.floor(bitmap.width * x) - 16, Math.floor(bitmap.height * y) - 16, 32, 32, 0, 0, 32, 32);
      crops.push(ctx.getImageData(0, 0, 32, 32).data); bitmap.close();
    }
    let maximum = 0;
    for (let i = 0; i < crops[0].length; i++) if (i % 4 !== 3) maximum = Math.max(maximum, Math.abs(crops[0][i] - crops[1][i]));
    return maximum;
  }, {images: [before.toString("base64"), after.toString("base64")], x, y});
}

test("adding a mapped material to another material preserves the existing colour-only field on the same tile", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, grass: true, ground_split: true});
  await openEditor(page);
  await addMaterial(page, "Existing colour only", null, 255, 128, 0);
  await addMaterial(page, "Adjacent PBR", 38);
  const view = (await scene(page).boundingBox())!;
  async function apply(x: number, name: string) {
    await page.mouse.click(view.x + view.width * x, view.y + view.height * .65);
    await page.getByRole("complementary", {name: "Inspector"}).getByRole("button", {name: "Change texture…"}).click();
    const picker = page.getByRole("dialog", {name: "Asset library"});
    await picker.getByRole("button", {name, exact: true}).click();
    await picker.getByRole("button", {name: "Apply", exact: true}).click();
    await expect(picker).toBeHidden(); await saved(page);
    await scene(page).focus(); await page.keyboard.press("Escape");
    return picture(page);
  }
  const existing = await apply(.4, "Existing colour only");
  // This is the black field's interior, not the filtered transition to its neighbour.
  expect(Math.max(...await rgb(page, existing, .4, .65))).toBeLessThanOrEqual(1);
  const adjacent = await apply(.7, "Adjacent PBR");
  expect(await untouchedDelta(page, existing, adjacent, .4)).toBeLessThanOrEqual(1);
  expect(adjacent.equals(existing)).toBe(false);
});

test("four then six real mapped materials Apply and reopen with original soft junction weights", async ({page, backend}) => {
  test.slow();
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, grass: true, ground_materials: 6, ground_brightness: .7});
  await openEditor(page);
  const assets: string[] = [];
  const colours = [[200,40,40],[40,200,40],[40,40,200],[210,180,35],[180,35,210],[35,180,210]];
  for (let k = 0; k < 6; k++) assets.push(await addMaterial(page, `PBR field ${k}`, 90 + 12 * k, 40 + 35 * k, 128, 0, colours[k]));
  let last: {textures: {layers: {ground?: {bytes: number; passes: unknown[]}}}[]} | null = null;
  async function applyAPI(k: number, override?: string) {
    const answer = await page.evaluate(async ({k, material}) => {
      const now = await (await fetch("/api/editor/alpha/edits")).json();
      const response = await fetch("/api/editor/alpha/paint", {method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({base: now.base, revision: now.revision, material, points: [{mesh: 0, u: (k + .5) / 6, v: -.1, whole: true}]})});
      if (!response.ok) throw new Error(await response.text());
      const {paint} = await response.json();
      const kept = await fetch("/api/editor/alpha/edits", {method: "PUT", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({base: now.base, revision: now.revision, id: `six-${k}`, deleted: [], paints: [...now.paints, paint]})});
      if (!kept.ok) throw new Error(await kept.text());
      return kept.json();
    }, {k, material: override ?? assets[k]});
    last = answer;
  }
  for (let k = 0; k < 3; k++) await applyAPI(k);
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const before = await picture(page);
  const view = (await scene(page).boundingBox())!;
  await page.mouse.click(view.x + view.width * .7, view.y + view.height * .65);
  await page.getByRole("complementary", {name: "Inspector"}).getByRole("button", {name: "Change texture…"}).click();
  const picker = page.getByRole("dialog", {name: "Asset library"});
  await picker.getByRole("button", {name: "PBR field 3", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden(); await saved(page);
  await scene(page).focus(); await page.keyboard.press("Escape");
  const fourth = await picture(page);
  expect(fourth.equals(before)).toBe(false);
  const transitionRoiMax = await untouchedDelta(page, before, fourth, .4);
  expect(transitionRoiMax).toBeLessThanOrEqual(1);
  await page.keyboard.press("Control+z"); await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  await page.keyboard.press("Control+Shift+z"); await saved(page);
  await expect.poll(async () => (await picture(page)).equals(fourth)).toBe(true);
  for (let k = 4; k < 6; k++) await applyAPI(k);
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const six = await picture(page);
  const sixDescriptor = last;
  expect(six.equals(fourth)).toBe(false);
  const originalPaints = (await (await page.request.get("/api/editor/alpha/edits")).json()).paints as string[];
  const setPaints = async (paints: string[]) => {
    await page.evaluate(async paints => {
      const now = await (await fetch("/api/editor/alpha/edits")).json();
      const response = await fetch("/api/editor/alpha/edits", {method: "PUT", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({base: now.base, revision: now.revision, id: `proof-${now.revision}`, deleted: [], paints})});
      if (!response.ok) throw new Error(await response.text());
    }, paints);
    await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  };
  await page.getByRole("tab", {name: "Details", exact: true}).click();
  await page.mouse.move(view.x + view.width * .5, view.y + view.height * .213);
  await expect(page.locator("#hover-box")).toContainText("1GRASS_ground_0_0");
  const hit = (await page.locator("#hover-box").innerText()).match(/UV\s*(-?[\d.]+), (-?[\d.]+)/);
  expect(hit).not.toBeNull(); expect(Math.abs(Number(hit![1]) - .5)).toBeLessThan(.01);
  expect(Math.abs(Number(hit![2]) + .5)).toBeLessThan(.03);
  const canonical = await (await page.request.get("/__test/ground-weights")).json();
  expect(canonical.weights.filter((w: number) => w > 0).length).toBe(6);
  const centrePixel = await rgb(page, six, .5, .213), contributions: number[] = [];
  for (let k = 0; k < 6; k++) {
    await setPaints(originalPaints.filter((_p, i) => i !== k));
    const omitted = await rgb(page, await picture(page), .5, .213);
    contributions.push(Math.max(...centrePixel.map((c, i) => Math.abs(c - omitted[i]))));
  }
  await writeFile(test.info().outputPath("leave-out-pixels.json"), JSON.stringify({centrePixel, contributions, hit: hit?.slice(1), canonical}));
  expect(Math.min(...contributions), "all six materials must independently affect the same soft junction pixel").toBeGreaterThan(2);
  await setPaints(originalPaints);
  await expect.poll(async () => (await picture(page)).equals(six)).toBe(true);
  const normalAsset = await addMaterial(page, "Directed regional normal", 64, 110, 160, 0, colours[2]);
  await applyAPI(2, normalAsset); await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const normalPicture = await picture(page), originalNormal = await rgb(page, six, .4, .65), directedNormal = await rgb(page, normalPicture, .4, .65);
  expect(Math.max(...directedNormal.map((v, i) => Math.abs(v - originalNormal[i])))).toBeGreaterThan(4);
  const roughAsset = await addMaterial(page, "Directed regional roughness", 64, 35, 160, 0, colours[2]);
  await applyAPI(2, roughAsset); await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const roughPicture = await picture(page), directedRough = await rgb(page, roughPicture, .4, .65);
  // (this ground has no ksSpecular: a smoother map does not shine more, as in AC; gloss: "a smooth photo shines ...")
  expect(Math.max(...directedRough.map((v, i) => Math.abs(v - directedNormal[i])))).toBeLessThanOrEqual(1);
  await setPaints(originalPaints);
  await expect.poll(async () => (await picture(page)).equals(six)).toBe(true);
  const frame = await page.evaluate(() => { const measure = performance.getEntriesByName("map2lap.ground.draw").at(-1) as PerformanceMeasure;
    return {...measure.toJSON(), detail: measure.detail}; });
  await writeFile(test.info().outputPath("regional-descriptor.json"), JSON.stringify(sixDescriptor));
  await writeFile(test.info().outputPath("regional-frame.json"), JSON.stringify(frame));
  await writeFile(test.info().outputPath("six-materials.png"), six);
  await writeFile(test.info().outputPath("regional-pixels.json"), JSON.stringify({transitionRoiMax, centrePixel, contributions,
    originalNormal, directedNormal, directedRough}));
});

for (const regional of [false, true]) test(`${regional ? "regional" : "single"} painted ground keeps winter and autumn through Apply, Undo, Redo and ${regional ? "draft" : "saved"} reopening`, async ({page, backend}) => {
  test.slow();
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, grass: true, ground_split: true,
    ground_materials: regional ? 4 : 0});
  await openEditor(page);
  if (regional) {
    // Three existing replacements force the fourth Apply through regional rendering rather than the small splat shader.
    for (let k = 0; k < 3; k++) {
      const material = await addMaterial(page, `Earlier grass ${k}`, 128, 255, 128, 0, [60 + k * 10, 150, 40]);
      await page.evaluate(async ({k, material}) => {
        const now = await (await fetch("/api/editor/alpha/edits")).json();
        const response = await fetch("/api/editor/alpha/paint", {method: "POST", headers: {"Content-Type": "application/json"},
          body: JSON.stringify({base: now.base, revision: now.revision, material, points: [{mesh: 0, u: ((k < 2 ? k : 3) + .5) / 4, v: -.1, whole: true}]})});
        if (!response.ok) throw new Error(await response.text());
        const {paint} = await response.json();
        const kept = await fetch("/api/editor/alpha/edits", {method: "PUT", headers: {"Content-Type": "application/json"},
          body: JSON.stringify({base: now.base, revision: now.revision, id: `season-${k}`, deleted: [], paints: [...now.paints, paint]})});
        if (!kept.ok) throw new Error(await kept.text());
      }, {k, material});
    }
    await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  }
  await addMaterial(page, "Seasonal grass", 128, 255, 128, 0, [40, 150, 40]);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const season = page.getByRole("combobox", {name: "Season", exact: true});
  await season.selectOption("winter");
  const original = await picture(page);
  const view = (await scene(page).boundingBox())!;
  const sample = regional ? .7 : .4;
  await page.mouse.click(view.x + view.width * sample, view.y + view.height * .65);
  await page.getByRole("complementary", {name: "Inspector"}).getByRole("button", {name: "Change texture…"}).click();
  const picker = page.getByRole("dialog", {name: "Asset library"});
  await picker.getByRole("button", {name: "Seasonal grass", exact: true}).click();
  await picker.getByRole("button", {name: "Apply", exact: true}).click();
  await expect(picker).toBeHidden(); await saved(page);
  await scene(page).focus(); await page.keyboard.press("Escape");
  const winter = await picture(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await expect(season).toHaveValue("winter");
  await writeFile(test.info().outputPath("original-winter.png"), original);
  await writeFile(test.info().outputPath("painted-winter.png"), winter);
  const white = await rgb(page, winter, sample, .65);
  expect(white[0], "new grass must retain its snow cover immediately after Apply").toBeGreaterThan(white[1] * .8);
  await scene(page).focus(); await page.keyboard.press("Control+z"); await saved(page);
  await expect.poll(async () => (await picture(page)).equals(original)).toBe(true);
  await page.keyboard.press("Control+Shift+z"); await saved(page);
  await expect.poll(async () => (await picture(page)).equals(winter)).toBe(true);
  await season.selectOption("summer");
  const summer = await picture(page), green = await rgb(page, summer, sample, .65);
  expect(green[1]).toBeGreaterThan(green[0] * 1.5);
  expect(white[0] - green[0]).toBeGreaterThan(30);
  await season.selectOption("autumn");
  const autumn = await rgb(page, await picture(page), sample, .65);
  expect(autumn[0] - green[0]).toBeGreaterThan(15);
  await season.selectOption("winter");
  await expect.poll(async () => (await picture(page)).equals(winter)).toBe(true);
  if (!regional) {
    // The regional fixture's soft junction retains a fifth source contribution, beyond native Save's four-layer limit.
    // Its persistent draft still has to reopen with the same season rendering.
    await page.locator("#edit-save-more").click();
    await page.locator("#save-name").fill("Seasonal ground copy");
    await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
    await expect(page.locator("#edit-track")).toHaveValue("seasonal_ground_copy");
    await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  }
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await season.selectOption("winter");
  await expect.poll(async () => (await picture(page)).equals(winter)).toBe(true);
});

test("a mapped Apply preserves untouched source lighting and +Y normals follow the actual KN5 V direction through Undo/Redo/reopen", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, grass: true, ground_split: true});
  await openEditor(page);
  await addMaterial(page, "Normal positive Y", 218);
  await addMaterial(page, "Normal negative Y", 38);
  await addMaterial(page, "Rough aligned normal", 64, 255, 160);
  await addMaterial(page, "Smooth aligned normal", 64, 105, 160);
  const original = await picture(page);
  const view = (await scene(page).boundingBox())!;
  async function apply(name: string) {
    await page.mouse.click(view.x + view.width * .4, view.y + view.height * .65);
    await page.getByRole("complementary", {name: "Inspector"}).getByRole("button", {name: "Change texture…"}).click();
    const picker = page.getByRole("dialog", {name: "Asset library"});
    await picker.getByRole("button", {name, exact: true}).click();
    await picker.getByRole("button", {name: "Apply", exact: true}).click();
    await expect(picker).toBeHidden(); await saved(page);
    await scene(page).focus(); await page.keyboard.press("Escape");
    return picture(page);
  }
  const positive = await apply("Normal positive Y");
  expect(positive.equals(original)).toBe(false);
  const untouched = await rgb(page, original, .7, .65);
  const editedUntouched = await rgb(page, positive, .7, .65);
  expect(Math.max(...untouched.map((v, i) => Math.abs(v - editedUntouched[i])))).toBeLessThanOrEqual(1);
  expect(await untouchedDelta(page, original, positive)).toBeLessThanOrEqual(1);
  await page.keyboard.press("Control+z"); await saved(page);
  await expect.poll(async () => (await picture(page)).equals(original)).toBe(true);
  await page.keyboard.press("Control+Shift+z"); await saved(page);
  await expect.poll(async () => (await picture(page)).equals(positive)).toBe(true);
  const negative = await apply("Normal negative Y");
  // Increasing KN5 V points toward -Z. The Editor sun is at +Z, so -Y normals face its light.
  const plus = await rgb(page, positive, .4, .65), minus = await rgb(page, negative, .4, .65);
  expect(minus[0] - plus[0]).toBeGreaterThan(10);
  const rough = await apply("Rough aligned normal");
  const roughPixel = await rgb(page, rough, .4, .65);
  const smooth = await apply("Smooth aligned normal");
  const smoothPixel = await rgb(page, smooth, .4, .65);
  // (this ground has no ksSpecular: as in AC, a photo then does not shine, however smooth; gloss: the test below)
  expect(Math.max(...smoothPixel.map((v, i) => Math.abs(v - roughPixel[i]))), "no gloss without the ground's ksSpecular").toBeLessThanOrEqual(1);
  const smoothUntouched = await rgb(page, smooth, .7, .65);
  expect(Math.max(...untouched.map((v, i) => Math.abs(v - smoothUntouched[i])))).toBeLessThanOrEqual(1);
  const untouchedRoiMax = await untouchedDelta(page, original, smooth);
  expect(untouchedRoiMax).toBeLessThanOrEqual(1);
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await picture(page)).equals(smooth)).toBe(true);
  await page.locator("#edit-save-more").click();
  await page.locator("#save-name").fill("PBR editor copy");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
  await expect(page.locator("#edit-track")).toHaveValue("pbr_editor_copy");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect.poll(async () => (await picture(page)).equals(smooth)).toBe(true);
  const listing = await (await page.request.get("/api/library/materials")).json();
  for (const item of listing.items) await page.evaluate(async id => {
    const response = await fetch(`/api/library/materials/${id}/delete`, {method: "POST", headers: {"Content-Type": "application/json"}, body: "{}"});
    if (!response.ok) throw new Error(await response.text());
  }, item.id);
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await picture(page)).equals(smooth)).toBe(true);
  const report = JSON.stringify({positive: plus, negative: minus, rough: roughPixel, smooth: smoothPixel,
    untouched, editedUntouched, smoothUntouched, untouchedRoiMax});
  await writeFile(test.info().outputPath("directed-pixels.json"), report);
  await test.info().attach("directed-pixels.json", {body: report, contentType: "application/json"});
  await writeFile(test.info().outputPath("source.png"), original);
  await writeFile(test.info().outputPath("pbr-saved-reopened.png"), smooth);
});

test("a smooth photo shines on glossy ground, a rough one does not, and neither more than the ground's own gloss allows", async ({page, backend}) => {
  // The ground's ksSpecular is the most a photo shines (tracknative._photo_colour): a strong one here, so the highlight shows.
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, grass: true, ground_split: true, ground_specular: [1, 4]});
  await openEditor(page);
  await addMaterial(page, "Smooth flat", 128, 0, 128);
  await addMaterial(page, "Rough flat", 128, 255, 128);
  const view = (await scene(page).boundingBox())!;
  async function apply(name: string) {
    await page.mouse.click(view.x + view.width * .4, view.y + view.height * .65);
    await page.getByRole("complementary", {name: "Inspector"}).getByRole("button", {name: "Change texture…"}).click();
    const picker = page.getByRole("dialog", {name: "Asset library"});
    await picker.getByRole("button", {name, exact: true}).click();
    await picker.getByRole("button", {name: "Apply", exact: true}).click();
    await expect(picker).toBeHidden(); await saved(page);
    await scene(page).focus(); await page.keyboard.press("Escape");
    return picture(page);
  }
  const rough = await apply("Rough flat"), smooth = await apply("Smooth flat");
  const shine = await brighter(page, rough, smooth, .4, .65);
  await writeFile(test.info().outputPath("gloss.json"), JSON.stringify(shine));
  expect(shine.most, "a smooth photo shines where the rough one does not").toBeGreaterThan(6);
  expect(shine.least, "gloss only adds light").toBeGreaterThanOrEqual(-1);
});

/** How much brighter after is than before in a 64 px square around (x, y) of the picture: {most, least} of a channel. */
async function brighter(page: Page, before: Buffer, after: Buffer, x: number, y: number) {
  return page.evaluate(async ({images, x, y}) => {
    const crops: Uint8ClampedArray[] = [];
    for (const raw of images) {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${raw}`)).blob());
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, Math.floor(bitmap.width * x) - 32, Math.floor(bitmap.height * y) - 32, 64, 64, 0, 0, 64, 64);
      crops.push(ctx.getImageData(0, 0, 64, 64).data); bitmap.close();
    }
    let most = -255, least = 255;
    for (let i = 0; i < crops[0].length; i++) if (i % 4 !== 3) {
      most = Math.max(most, crops[1][i] - crops[0][i]); least = Math.min(least, crops[1][i] - crops[0][i]);
    }
    return {most, least};
  }, {images: [before.toString("base64"), after.toString("base64")], x, y});
}
