import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import type {Locator, Page} from '@playwright/test';
import {test, expect, openLibrary} from './library-fixtures';

async function pictureColours(page: Page, importer: Locator) {
  // (the level the dialog starts at is measured first: until then the preview is drawn anew when it arrives)
  await expect(importer.getByLabel('Track geometry cost')).toHaveAttribute('aria-busy', 'false');
  const screenshot = await importer.getByLabel('Model preview').locator('canvas').screenshot();
  return page.evaluate(async base64 => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
    const copy = document.createElement('canvas'); copy.width = image.width; copy.height = image.height;
    const ctx = copy.getContext('2d')!; ctx.drawImage(image, 0, 0); image.close();
    const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
    const sums = [0, 0, 0]; let count = 0;
    // Both uniform palette fixtures have a bright blue channel; the controlled dark background stays below 80.
    for (let i = 0; i < data.length; i += 4) if (data[i + 2] > 80) {
      count++; for (let c = 0; c < 3; c++) sums[c] += data[i + c];
    }
    return {count, rgb: sums.map(sum => sum / count)};
  }, screenshot.toString('base64'));
}

test('material colour choice updates the preview, matches a colour texture and is saved exactly as previewed', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});
  const repo = join(import.meta.dirname, '../..');
  const python = join(repo, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
  const model = (textured: boolean) => execFileSync(python, [join(repo, 'ui/e2e/model_fixture.py'), textured ? '--palette-texture' : '--palette-factor']);
  await openLibrary(page, "objects");
  const library = page.getByRole('dialog', {name: 'Asset library'});
  await library.getByLabel('Model file').setInputFiles({name: 'purple.glb', mimeType: 'model/gltf-binary', buffer: model(false)});
  const importer = page.getByRole('dialog', {name: 'Import object', exact: true});
  const choice = importer.getByRole('combobox', {name: 'Material colours', exact: true});
  await expect(choice).toHaveValue('linear', {timeout: 5000});
  const colours = () => pictureColours(page, importer);
  await expect.poll(async () => (await colours()).count).toBeGreaterThan(500);
  const before = await colours();
  const preview = page.waitForResponse(r => r.url().includes('/preview?material_colours=srgb'));
  await choice.selectOption('srgb');
  const adjustedBytes = await (await preview).body();
  await expect.poll(async () => before.rgb[1] - (await colours()).rgb[1]).toBeGreaterThan(15);
  const adjusted = await colours();
  await choice.selectOption('linear');
  await expect.poll(async () => Math.abs(before.rgb[1] - (await colours()).rgb[1])).toBeLessThan(1);
  await choice.selectOption('srgb');
  await expect.poll(async () => Math.abs(adjusted.rgb[1] - (await colours()).rgb[1])).toBeLessThan(1);
  const published = page.waitForResponse(r => new URL(r.url()).pathname === '/api/library/models' && r.request().method() === 'POST');
  await importer.getByRole('button', {name: 'Add to library', exact: true}).click();
  const asset = (await (await published).json()).model;
  expect(asset.material_colours).toBe('srgb');
  const original = await page.request.get(`/api/library/models/${asset.id}/original`);
  expect(await original.body()).toEqual(adjustedBytes);
  await expect(importer).toBeHidden();
  await library.getByLabel('Model file').setInputFiles({name: 'texture.glb', mimeType: 'model/gltf-binary', buffer: model(true)});
  await expect(choice).toHaveValue('linear');
  await expect.poll(async () => (await colours()).count).toBeGreaterThan(500);
  const textured = await colours();
  for (let c = 0; c < 3; c++) expect(Math.abs(textured.rgb[c] - adjusted.rgb[c])).toBeLessThan(1);
});

test('explicit matte colour changes the preview without changing the palette and publishes the same material', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});
  const repo = join(import.meta.dirname, '../..');
  const python = join(repo, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
  const raw = execFileSync(python, [join(repo, 'ui/e2e/model_fixture.py'), '--palette-grass']);
  await openLibrary(page, "objects");
  const library = page.getByRole('dialog', {name: 'Asset library'});
  await library.getByLabel('Model file').setInputFiles({name: 'teal.glb', mimeType: 'model/gltf-binary', buffer: raw});
  const importer = page.getByRole('dialog', {name: 'Import object', exact: true});
  const colours = () => pictureColours(page, importer);
  const surface = importer.getByRole('combobox', {name: 'Surface', exact: true});
  await expect(surface).toHaveValue('model', {timeout: 5000});
  await expect.poll(async () => (await colours()).count).toBeGreaterThan(500);
  const original = await colours();
  await importer.getByRole('combobox', {name: 'Material colours', exact: true}).selectOption('srgb');
  await expect.poll(async () => original.rgb[0] - (await colours()).rgb[0]).toBeGreaterThan(10);
  const before = await colours();
  const preview = page.waitForResponse(r => r.url().includes('material_lighting=matte'));
  await surface.selectOption('matte');
  const matteBytes = await (await preview).body();
  await expect.poll(async () => (await colours()).rgb[0]).toBeLessThan(before.rgb[0] / 2);
  const matte = await colours();
  expect(matte.rgb[1]).toBeGreaterThan(matte.rgb[2]);
  expect(matte.rgb[0]).toBeLessThan(matte.rgb[1] / 3);
  const document = JSON.parse(matteBytes.subarray(20, 20 + matteBytes.readUInt32LE(12)).toString());
  expect(document.materials[0].extras.map2lap.lighting).toBe('matte');
  await surface.selectOption('model');
  await expect.poll(async () => Math.abs((await colours()).rgb[0] - before.rgb[0])).toBeLessThan(1);
  await surface.selectOption('matte');
  await expect.poll(async () => Math.abs((await colours()).rgb[0] - matte.rgb[0])).toBeLessThan(1);
  const published = page.waitForResponse(r => new URL(r.url()).pathname === '/api/library/models' && r.request().method() === 'POST');
  await importer.getByRole('button', {name: 'Add to library', exact: true}).click();
  const asset = (await (await published).json()).model;
  expect(asset.material_lighting).toBe('matte');
  expect(await (await page.request.get(`/api/library/models/${asset.id}/original`)).body()).toEqual(matteBytes);
});
