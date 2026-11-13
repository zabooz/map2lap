import {expect, openEditor, test} from "./fixtures";
import {findTree, saveTrack, saved, stored} from "./edit-helpers";
import type {Page} from "@playwright/test";

const draft = async (page: Page) => await stored(page) as Awaited<ReturnType<typeof stored>> & {
  tree_spacing: {distance: number; targets: string[] | null; hidden: string[]} | null;
};
const trees = async (page: Page) => (await (await page.request.get('/__test/trees?name=alpha')).json()) as unknown[];
async function spacing(page: Page, value: number) {
  const slider = page.getByRole('slider', {name: 'Tree minimum spacing'});
  await slider.fill(String(value));
  await slider.dispatchEvent('pointerup');
  await expect.poll(async () => (await draft(page)).tree_spacing?.distance).toBe(value);
  await saved(page);
}

test('spacing survives Save and reopening; lowering restores thinned trees but keeps manual deletion', async ({page}) => {
  await openEditor(page);
  const before = await draft(page);
  const response = await page.request.put('/api/editor/alpha/edits', {data: {...before, id:'seed-spacing',
    deleted:[{id:'trees#0',position:[40,0,-200]}], trees:[2,3].map(i => ({id:`trees#${i}`,model:'spruce',
      pos:[128 + (i-1)*2,0,-130],angle:0,size:1,width:1}))}});
  expect(response.ok()).toBe(true);
  await openEditor(page);
  await page.getByRole('tab', {name:'Properties',exact:true}).click();
  await expect(page.getByText('Current trees: 3', {exact: true})).toBeVisible();
  await spacing(page, 5);
  await expect(page.getByText('Current trees: 1', {exact: true})).toBeVisible();
  const thinned = (await draft(page)).tree_spacing!.hidden;
  expect(thinned.length).toBe(2);
  expect((await draft(page)).deleted.map(d => d.id)).toEqual(['trees#0']);
  await page.getByRole('button', {name:/Undo$/}).click();
  await expect.poll(async () => (await draft(page)).tree_spacing).toBeNull();
  await expect(page.getByText('Current trees: 3', {exact: true})).toBeVisible();
  await page.getByRole('button', {name:/Redo$/}).click();
  await expect.poll(async () => (await draft(page)).tree_spacing?.hidden).toEqual(thinned);
  await saveTrack(page);
  await expect(page.locator('#edit-saved')).toHaveText(/^Saved /);
  expect(await trees(page)).toHaveLength(1);
  await openEditor(page);
  await page.getByRole('tab', {name:'Properties',exact:true}).click();
  await expect(page.getByRole('slider', {name:'Tree minimum spacing'})).toHaveValue('5');
  await expect(page.getByText('Current trees: 1', {exact: true})).toBeVisible();
  await spacing(page, 0);
  await expect(page.getByText('Current trees: 3', {exact: true})).toBeVisible();
  await saveTrack(page, false);
  await expect(page.locator('#edit-saved')).toHaveText(/^Saved /);
  expect(await trees(page)).toHaveLength(3);
  expect((await draft(page)).deleted.map(d => d.id)).toEqual(['trees#0']);
});

test('a failed preparation leaves the existing spacing and manual edits unchanged', async ({page}) => {
  await openEditor(page);
  await page.getByRole('tab', {name:'Properties',exact:true}).click();
  await page.route('**/tree-spacing', r => r.fulfill({status:200,json:{error:'Preparation refused'}}));
  const slider = page.getByRole('slider', {name:'Tree minimum spacing'});
  await slider.fill('8'); await slider.dispatchEvent('pointerup');
  await expect(page.getByRole('alert')).toContainText('Preparation refused');
  await expect(page.locator('#tree-spacing-toast').getByRole('progressbar')).toHaveCount(0);
  await expect(slider).toBeEnabled();
  await expect(slider).toHaveValue('0');
  expect((await draft(page)).tree_spacing).toBeNull();
});

test('tree spacing shows a running toast until the result is kept, then its hidden count', async ({page}) => {
  await openEditor(page);
  const before = await draft(page);
  const seed = await page.request.put('/api/editor/alpha/edits', {data: {...before, id: 'toast-trees',
    trees: [2, 3].map(i => ({id: `trees#${i}`, model: 'spruce', pos: [128 + (i - 1) * 2, 0, -130], angle: 0, size: 1, width: 1}))}});
  expect(seed.ok()).toBe(true);
  await openEditor(page);
  await page.getByRole('tab', {name: 'Properties', exact: true}).click();
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/tree-spacing', async route => { await waiting; await route.continue(); });
  const slider = page.getByRole('slider', {name: 'Tree minimum spacing'});
  await slider.fill('5'); await slider.dispatchEvent('pointerup');
  const toast = page.locator('#tree-spacing-toast');
  try {
    await expect(toast).toContainText('Adjusting trees');
    await expect(toast.getByRole('progressbar')).toBeVisible();
    await expect(toast.getByRole('button', {name: 'Dismiss notification'})).toHaveCount(0);
    await expect(slider).toBeDisabled();
  } finally { release(); }
  await expect(toast).toContainText('2 trees thinned');
  await expect(toast.getByRole('progressbar')).toHaveCount(0);
  await expect(slider).toBeEnabled();
  expect((await draft(page)).tree_spacing?.hidden).toHaveLength(2);
  await expect(page.getByText('Current trees: 2', {exact: true})).toBeVisible();
  await expect(toast).toHaveCount(0);
  await expect(page.getByText('Current trees: 2', {exact: true})).toBeVisible();
  await spacing(page, 0);
  await expect(toast).toContainText('0 trees thinned');
  await page.locator('#edit-track').selectOption('beta');
  await expect(toast).toHaveCount(0);
});

test('selection scope stays adjustable after reloading without a live selection', async ({page}) => {
  await openEditor(page);
  const point = await findTree(page);
  await page.mouse.click(point.x, point.y);
  await page.getByRole('tab', {name:'Properties',exact:true}).click();
  await expect(page.getByRole('radio', {name:'All trees',exact:true})).toBeChecked();
  await expect(page.getByRole('radio', {name:'All trees',exact:true})).toBeEnabled();
  await page.getByRole('radio', {name:'Selection',exact:true}).check();
  await expect.poll(async () => (await draft(page)).tree_spacing?.targets).toEqual(['trees#1']);
  await spacing(page, 6);
  await openEditor(page);
  await page.getByRole('tab', {name:'Properties',exact:true}).click();
  await expect(page.getByRole('radio', {name:'Selection',exact:true})).toBeChecked();
  await spacing(page, 2);
  expect((await draft(page)).tree_spacing?.targets).toEqual(['trees#1']);
  await page.getByRole('radio', {name:'All trees',exact:true}).check();
  await expect(page.getByRole('radio', {name:'All trees',exact:true})).toBeChecked();
  await expect.poll(async () => (await draft(page)).tree_spacing?.targets).toBeNull();
});
