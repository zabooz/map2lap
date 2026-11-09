import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {test, expect, openEditor} from './fixtures';

test('objects filter by their actual category and show creator credit beside clean object titles', async ({page, backend}, info) => {
  const repo = join(import.meta.dirname, '../..');
  const python = join(repo, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
  for (const [publisher, file, name, source, args] of [
    ['Kenney', 'kenney-flower_purpleB.glb', 'Flower Purple B', 'https://kenney.nl/assets/nature-kit', []],
    ['Quaternius', 'quaternius-Bush_Common.glb', 'Bush Common', 'https://quaternius.com/packs/stylizednaturemegakit.html', ['--default-material']],
  ] as const) {
    const raw = execFileSync(python, [join(repo, 'ui/e2e/model_fixture.py'), ...args]);
    const prepared = await page.request.post(`${backend.url}/api/library/model-imports?filename=${file}`, {
      headers: {Origin: backend.url, 'Content-Type': 'application/x-map2lap-glb'}, data: raw,
    });
    expect(prepared.ok()).toBe(true);
    const added = await page.request.post(`${backend.url}/api/library/models`, {headers: {Origin: backend.url},
      data: {token: (await prepared.json()).token, filename: file, name: `${publisher} - ${name}`, category: 'tree',
        source, license: 'CC0', tags: ['CC0', publisher]},
    });
    expect(added.ok()).toBe(true);
  }
  await openEditor(page);
  await page.getByRole('button', {name: 'INSERT', exact: true}).click();
  const library = page.getByRole('dialog', {name: 'Asset library'});
  const categories = library.getByLabel('Filter objects');
  await expect(categories.locator('option')).toHaveCount(10, {timeout: 5000});
  await categories.selectOption('flower');
  await expect(library.getByRole('button', {name: 'Flower Purple B', exact: true})).toBeVisible();
  await expect(library.getByRole('button', {name: 'Bush Common', exact: true})).toHaveCount(0);
  await expect(library.getByRole('button', {name: 'Kenney - Flower Purple B', exact: true})).toHaveCount(0);
  await library.getByRole('button', {name: 'Flower Purple B', exact: true}).click();
  const details = library.getByRole('region', {name: 'Object information'});
  await expect(details.getByText('Kenney', {exact: true})).toBeVisible();
  await expect(details.getByText('CC0', {exact: true})).toBeVisible();
  await expect(details.getByRole('link', {name: 'View source'})).toHaveAttribute('href', 'https://kenney.nl/assets/nature-kit');
  await categories.selectOption('bush');
  await library.getByRole('button', {name: 'Bush Common', exact: true}).click();
  await expect(details.getByText('Quaternius', {exact: true})).toBeVisible();
  await expect(details.getByRole('link', {name: 'View source'})).toHaveAttribute('href', 'https://quaternius.com/packs/stylizednaturemegakit.html');
  await expect(library.getByRole('button', {name: 'Quaternius - Bush Common', exact: true})).toHaveCount(0);
  await library.screenshot({path: info.outputPath('catalogue-credits.png')});
  await categories.selectOption('');
  await library.getByLabel('Search objects').fill('Kenney');
  await expect(library.getByRole('button', {name: 'Flower Purple B', exact: true})).toBeVisible();
  await expect(library.getByRole('button', {name: 'Bush Common', exact: true})).toHaveCount(0);
});
