import {expect, openEditor, test} from "./fixtures";
import {findCar, meshes, saved, saveTrack, stored} from "./edit-helpers";
import type {Page} from "@playwright/test";

const density = async (page: Page) => (await stored(page) as Awaited<ReturnType<typeof stored>> & {
  car_density: {percent: number; targets: string[] | null; hidden: string[]} | null;
}).car_density;

async function change(page: Page, value: number) {
  const slider = page.getByRole('slider', {name: 'Parked car density', exact: true});
  await slider.fill(String(value)); await slider.dispatchEvent('pointerup');
  await expect.poll(async () => (await density(page))?.percent).toBe(value);
  await saved(page);
}

test('car density previews, undoes, saves and restores after reopening without changing parking or terrain', async ({page, backend}) => {
  await backend.post('/__test/rebuild', {name: 'alpha', title: 'Cars', car: 'listed'});
  await openEditor(page);
  const before = await meshes(page);
  await page.getByRole('tab', {name: 'Properties', exact: true}).click();
  const scenery = page.getByRole('region', {name: 'Scenery', exact: true});
  await expect(scenery.getByRole('heading', {name: 'Cars: 1', exact: true})).toBeVisible();
  await expect(scenery.getByRole('radio')).toHaveCount(0);
  await change(page, 0);
  await expect(scenery.getByRole('heading', {name: 'Cars: 0', exact: true})).toBeVisible();
  expect((await stored(page)).deleted).toEqual([]);
  await page.getByRole('button', {name: /Undo$/}).click();
  await expect.poll(async () => density(page)).toBeNull();
  await page.getByRole('button', {name: /Redo$/}).click();
  await expect.poll(async () => (await density(page))?.percent).toBe(0);
  await saveTrack(page);
  await expect(page.locator('#edit-saved')).toHaveText(/^Saved /);
  expect(await meshes(page)).not.toHaveProperty('1WALL_cars_0_0');
  expect((await meshes(page))['1ROAD_ground_0_0']).toBe(before['1ROAD_ground_0_0']);
  await openEditor(page);
  await page.getByRole('tab', {name: 'Properties', exact: true}).click();
  await expect(page.getByRole('slider', {name: 'Parked car density', exact: true})).toHaveValue('0');
  await change(page, 100);
  await saveTrack(page, false);
  await expect(page.locator('#edit-saved')).toHaveText(/^Saved /);
  expect((await meshes(page))['1WALL_cars_0_0']).toBe(before['1WALL_cars_0_0']);
});

test('a selected car automatically scopes density and a preparation failure preserves it', async ({page, backend}) => {
  await backend.post('/__test/rebuild', {name: 'alpha', title: 'Cars', car: 'listed'});
  await openEditor(page);
  const point = await findCar(page); await page.mouse.click(point.x, point.y);
  await page.getByRole('tab', {name: 'Properties', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Cars: 1 (selected)', exact: true})).toBeVisible();
  await change(page, 0);
  expect((await density(page))?.targets).toEqual(['t_0_0#0']);
  await expect(page.getByRole('heading', {name: 'Cars: 0 (selected)', exact: true})).toBeVisible();
  await page.route('**/car-density', r => r.fulfill({status: 400, json: {error: 'Density refused'}}));
  const slider = page.getByRole('slider', {name: 'Parked car density', exact: true});
  await slider.fill('100'); await slider.dispatchEvent('pointerup');
  await expect(page.getByRole('alert')).toContainText('Density refused');
  await expect(slider).toHaveValue('0');
  expect((await density(page))?.percent).toBe(0);
});

test('a track built without parked cars cannot regain any through density', async ({page, backend}) => {
  await backend.post('/__test/rebuild', {name: 'alpha', title: 'No cars', car: 'listed', parked_cars: false});
  await openEditor(page);
  await page.getByRole('tab', {name: 'Properties', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Cars: 0', exact: true})).toBeVisible();
  await expect(page.getByRole('slider', {name: 'Parked car density', exact: true})).toBeDisabled();
});
