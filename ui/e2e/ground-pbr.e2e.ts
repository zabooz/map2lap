import type {Page} from "@playwright/test";
import {writeFile} from "node:fs/promises";
import {expect, openEditor, scene, test} from "./fixtures";
import {picture, saved} from "./edit-helpers";

async function addMaterial(page: Page, name: string, normalY: number | null, roughness = 255, normalX = 128, colourValue = 130) {
  return page.evaluate(async ({name, normalY, roughness, normalX, colourValue}) => {
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
    const colour = await upload("colour", [colourValue, colourValue, colourValue]);
    const maps = normalY === null ? {} : {
      normal: await upload("normal", [normalX, normalY, 218]),
      roughness: await upload("roughness", [roughness, roughness, roughness]),
    };
    const response = await fetch("/api/library/materials", {method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({...colour, name, category: "grass", repeat: [2, 3], variation: false,
        maps})});
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()).material.id as string;
  }, {name, normalY, roughness, normalX, colourValue});
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

test("adding PBR to another material preserves the existing colour-only field on the same tile", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, grass: true, ground_split: true});
  await openEditor(page);
  await addMaterial(page, "Existing colour only", null, 255, 128, 0);
  await addMaterial(page, "Adjacent PBR", 38);
  const view = (await scene(page).boundingBox())!;
  async function apply(x: number, name: string) {
    await page.mouse.click(view.x + view.width * x, view.y + view.height * .65);
    await page.getByRole("complementary", {name: "Selection properties"}).getByRole("button", {name: "Edit texture"}).click();
    const picker = page.getByRole("dialog", {name: "Textures"});
    await picker.getByRole("button", {name, exact: true}).click();
    await picker.getByRole("button", {name: "Apply", exact: true}).click();
    await expect(picker).toBeHidden(); await saved(page);
    await scene(page).focus(); await page.keyboard.press("Escape");
    return picture(page);
  }
  const existing = await apply(.4, "Existing colour only");
  const adjacent = await apply(.7, "Adjacent PBR");
  expect(await untouchedDelta(page, existing, adjacent, .4)).toBeLessThanOrEqual(1);
  expect(adjacent.equals(existing)).toBe(false);
});

test("PBR Apply preserves untouched source lighting and +Y normals follow the actual KN5 V direction through Undo/Redo/reopen", async ({page, backend}) => {
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
    await page.getByRole("complementary", {name: "Selection properties"}).getByRole("button", {name: "Edit texture"}).click();
    const picker = page.getByRole("dialog", {name: "Textures"});
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
  expect(Math.abs(smoothPixel[0] - roughPixel[0]), "roughness changes the actual physical light response").toBeGreaterThan(4);
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
