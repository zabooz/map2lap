import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {expect, openEditor, test} from './fixtures';

test('import geometry levels preview and publish the measured canonical model', async ({page}, testInfo) => {
  // The shared Python fixture has independent wall/roof primitives, UVs and explicit normals.
  const repo = join(import.meta.dirname, '../..');
  const python = process.platform === 'win32' ? join(repo, '.venv/Scripts/python.exe') : join(repo, '.venv/bin/python');
  const buffer = execFileSync(python, ['-c', "import sys; sys.path[:0]=['engine/tests','src']; from test_modelsimplify import panel; sys.stdout.buffer.write(panel())"], {cwd: repo});
  await openEditor(page);
  await page.getByRole('button', {name: 'INSERT', exact: true}).click();
  await page.getByLabel('Model file').setInputFiles({name: 'house.glb', mimeType: 'model/gltf-binary', buffer});
  const dialog = page.getByRole('dialog', {name: 'Import object', exact: true});
  const geometry = dialog.getByRole('combobox', {name: 'Geometry', exact: true});
  await expect(geometry).toHaveValue('100');
  const facts = dialog.getByLabel('Track geometry cost');
  await expect(facts).toContainText('900 triangles');
  // The first level is held at the server: meanwhile the last preview, its cost and the dialog's height stay.
  let release = () => {};
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route(url => url.pathname.endsWith('/info') && url.searchParams.get('simplify_level') === '75',
    async route => { await held; await route.continue(); });
  const height = () => dialog.locator('form').evaluate(form => form.scrollHeight);
  const before = await height();
  for (const level of [75, 50, 25]) {
    const info = page.waitForResponse(r => r.url().includes('/info?') && r.url().includes(`simplify_level=${level}`));
    await geometry.selectOption(String(level));
    if (level === 75) {
      await expect(dialog.getByRole('status')).toHaveText('Preparing selected geometry…');
      await expect(dialog.getByLabel('Model preview').locator('canvas')).toBeVisible();
      await expect(facts).toContainText('900 triangles');
      expect(await height()).toBe(before);
      release();
    }
    const data = await (await info).json();
    expect(data.simplification).toBe('target_reached');
    expect(data.geometry.track_cost.triangles).toBeLessThanOrEqual(900 * level / 100);
    await expect(facts).toContainText(`${data.geometry.track_cost.triangles.toLocaleString('en-US')} triangles`);
    await expect(dialog.getByLabel('Model preview').locator('canvas')).toBeVisible();
  }
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
  await expect(dialog.getByRole('combobox', {name: 'Geometry', exact: true})).toHaveValue('100');
  await dialog.getByRole('combobox', {name: 'Geometry', exact: true}).selectOption('25');
  await expect(dialog.getByRole('status')).toHaveText('No further reduction possible.');
  await expect(dialog.getByLabel('Track geometry cost')).toContainText('1 triangles');
  await expect(dialog.getByRole('button', {name: 'Add to library', exact: true})).toBeEnabled();
});
