import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {expect, openEditor, scene, test} from './fixtures';
import {saved} from './edit-helpers';

const obj = Buffer.from('v -1 0 0\nv 1 0 0\nv 1 3 0\nv -1 3 0\nf 1 2 3 4\n');

for (const format of ['obj', 'fbx', 'zip'] as const) {
  test(`${format.toUpperCase()} import previews the converted model, places, saves and reopens`, async ({page, backend}) => {
    await openEditor(page);
    await page.getByRole('button', {name: 'INSERT', exact: true}).click();
    const library = page.getByRole('dialog', {name: 'Asset library'});
    const repo = join(import.meta.dirname, '../..');
    const buffer = format === 'obj' ? obj : format === 'fbx'
      ? readFileSync(join(repo, 'engine/tests/fixtures/model-import/blender_293_embedded_textures_7400_binary.fbx'))
      : execFileSync(join(repo, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python'), [join(repo, 'ui/e2e/model_fixture.py'), '--obj-zip']);
    const preparedResponse = page.waitForResponse(response => response.url().includes('/api/library/model-imports?') && response.request().method() === 'POST');
    const previewRequest = page.waitForResponse(response => /\/model-imports\/[a-f0-9]{64}\/preview/.test(response.url()));
    await library.getByLabel('Model file').setInputFiles({name: `sample.${format}`, mimeType: 'application/octet-stream', buffer});
    const response = await preparedResponse;
    expect(response.ok()).toBe(true);
    const prepared = await response.json();
    const previewResponse = await previewRequest;
    expect(previewResponse.url()).toContain(prepared.token);
    expect(previewResponse.ok()).toBe(true);
    expect(previewResponse.headers()['content-type']).toContain('model/gltf-binary');
    expect((await previewResponse.body()).subarray(0, 4).toString()).toBe('glTF');
    const importer = page.getByRole('dialog', {name: 'Import object', exact: true});
    await expect(importer.getByLabel('Model name')).toHaveValue('sample');
    await importer.getByLabel('Model name').fill(`${format.toUpperCase()} object`);
    await importer.getByRole('button', {name: 'Add to library', exact: true}).click();
    await expect(importer).toBeHidden();
    await expect(library.getByLabel('Model preview')).toBeVisible();
    await library.getByRole('button', {name: 'Place on ground', exact: true}).click();
    await scene(page).click({position: {x: 600, y: 400}});
    const edits = async () => (await (await page.request.get('/api/editor/alpha/edits')).json()).models ?? [];
    await expect.poll(async () => (await edits()).length).toBe(1);
    await page.keyboard.press('Escape');
    await saved(page);
    await page.locator('#edit-save').click();
    await page.locator('#save-dialog').getByRole('button', {name: 'Overwrite', exact: true}).click();
    await expect(page.locator('#edit-saved')).toHaveText(/^Saved \d/);
    await backend.post('/__test/cold-models');
    await page.reload();
    await openEditor(page);
    await expect.poll(async () => (await edits()).length).toBe(1);
    const index = await (await page.request.get('/api/editor/alpha/index')).json();
    expect(index.models).toHaveLength(1);
  });
}

test('an OBJ with missing MTL files explains how to include companion files', async ({page}) => {
  await openEditor(page);
  await page.getByRole('button', {name: 'INSERT', exact: true}).click();
  await page.getByLabel('Model file').setInputFiles({name: 'missing.obj', mimeType: 'text/plain', buffer: Buffer.concat([Buffer.from('mtllib missing.mtl\n'), obj])});
  const importer = page.getByRole('dialog', {name: 'Import object', exact: true});
  await expect(importer.getByRole('alert')).toContainText('Missing model file: missing.mtl');
  await expect(importer.getByRole('button', {name: 'Add to library', exact: true})).toBeDisabled();
});
