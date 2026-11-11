import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {expect, openLibrary, test} from './library-fixtures';

test('import geometry levels preview and publish the measured canonical model', async ({page}, testInfo) => {
  // The shared Python fixture has independent wall/roof primitives, UVs and explicit normals.
  const repo = join(import.meta.dirname, '../..');
  const python = process.platform === 'win32' ? join(repo, '.venv/Scripts/python.exe') : join(repo, '.venv/bin/python');
  const buffer = execFileSync(python, ['-c', "import sys; sys.path[:0]=['engine/tests','src']; from test_modelsimplify import panel; sys.stdout.buffer.write(panel())"], {cwd: repo});
  await openLibrary(page, "objects");
  const half = page.waitForResponse(r => r.url().includes('/info?') && r.url().includes('simplify_level=50'));
  await page.getByLabel('Model file').setInputFiles({name: 'house.glb', mimeType: 'model/gltf-binary', buffer});
  const dialog = page.getByRole('dialog', {name: 'Import object', exact: true});
  await expect(dialog.getByRole('heading')).toHaveText('Import object: house.glb');
  // A slider from Original to 25 %, at 50 % first, the level beside its name as the clock's time: "Geometry: 50%"
  const geometry = dialog.getByRole('slider', {name: 'Geometry', exact: true});
  await expect(geometry).toHaveAttribute('aria-valuetext', '50%');
  await expect(dialog.getByText('Geometry: 50%')).toBeVisible();
  const halved = await (await half).json();
  expect(halved.simplification).toBe('target_reached');
  const halfCount = `${halved.geometry.track_cost.triangles.toLocaleString('en-US')} triangles`;
  for (const mark of ['Original', '75%', '50%', '25%']) await expect(dialog.locator('[data-marks]').getByText(mark, {exact: true})).toBeVisible();
  const facts = dialog.getByLabel('Track geometry cost');
  await expect(facts).toContainText(halfCount);
  await expect(facts).toHaveAttribute('aria-busy', 'false');
  // (only what helps choosing: no notes on headers, shared textures, kept originals, the anchor or the preview)
  for (const gone of ['Mesh headers', 'per instance', 'preview updates', 'stays in the library', 'ground anchor']) await expect(dialog).not.toContainText(gone);
  // The first level is held at the server: meanwhile the last preview, its cost and the dialog's height stay.
  let release = () => {};
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route(url => url.pathname.endsWith('/info') && url.searchParams.get('simplify_level') === '75',
    async route => { await held; await route.continue(); });
  const height = () => dialog.locator('form').evaluate(form => form.scrollHeight);
  const before = await height();
  for (const level of [75, 25]) {
    const info = page.waitForResponse(r => r.url().includes('/info?') && r.url().includes(`simplify_level=${level}`));
    await geometry.fill(String([100, 75, 50, 25].indexOf(level)));
    await expect(dialog.getByText(`Geometry: ${level}%`)).toBeVisible();
    if (level === 75) {
      // (meanwhile the cost's numbers turn into spinners where they stand, and the last preview stays)
      await expect(facts).toHaveAttribute('aria-busy', 'true');
      await expect(facts.getByRole('progressbar', {name: 'Preparing selected geometry'})).toHaveCount(3);
      await expect(facts).not.toContainText(halfCount);
      await expect(dialog.getByLabel('Model preview').locator('canvas')).toBeVisible();
      expect(await height()).toBe(before);
      release();
    }
    const data = await (await info).json();
    expect(data.simplification).toBe('target_reached');
    expect(data.geometry.track_cost.triangles).toBeLessThanOrEqual(900 * level / 100);
    await expect(facts).toContainText(`${data.geometry.track_cost.triangles.toLocaleString('en-US')} triangles`);
    await expect(facts).toHaveAttribute('aria-busy', 'false');
    await expect(dialog.getByLabel('Model preview').locator('canvas')).toBeVisible();
  }
  // (a level measured once is not asked again)
  await geometry.fill('2');
  await expect(facts).toHaveAttribute('aria-busy', 'false');
  await geometry.fill('3');
  await dialog.screenshot({path: testInfo.outputPath('simplify-dialog.png')});
  const stored = page.waitForResponse(r => new URL(r.url()).pathname === '/api/library/models' && r.request().method() === 'POST');
  await dialog.getByRole('button', {name: 'Add to library', exact: true}).click();
  const asset = (await (await stored).json()).model;
  expect(asset.simplify_level).toBe(25);
  const actual = await page.request.get(`/api/library/models/${asset.id}/cost`);
  expect(await actual.json()).toEqual(asset.geometry.track_cost);
  await expect(dialog).toBeHidden();
  const leaf = execFileSync(python, ['-c', "import sys; sys.path[:0]=['engine/tests','src']; from test_modeldata import encode,fixture; sys.stdout.buffer.write(encode(*fixture()))"], {cwd: repo});
  await page.getByLabel('Model file').setInputFiles({name: 'leaf.glb', mimeType: 'model/gltf-binary', buffer: leaf});
  await expect(geometry).toHaveAttribute('aria-valuetext', '50%');
  await geometry.fill('3');
  await expect(dialog.getByText('Geometry: 25% · no further reduction', {exact: true})).toBeVisible();
  await expect(dialog.getByLabel('Track geometry cost')).toContainText('1 triangles');
  await expect(dialog.getByRole('button', {name: 'Add to library', exact: true})).toBeEnabled();
});
