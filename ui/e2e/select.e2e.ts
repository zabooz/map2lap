import {centre, expect, openEditor, scene, test} from "./fixtures";
import {findCar, findTree, stored} from "./edit-helpers";

test("Select uses the shared tool bar; Shift selects a whole sort and Ctrl adds another object", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await openEditor(page);
  const bar = page.locator("#edit-select-set");
  await expect(bar).toHaveAttribute("data-tool-options", "");
  await expect(bar).toContainText("Shift");
  await expect(bar).toContainText("Ctrl");
  await expect(bar.getByRole("button", {name: "Select all", exact: true})).toBeVisible();
  const tree = await findTree(page), car = await findCar(page);
  await page.keyboard.down("Shift");
  await page.mouse.click(tree.x, tree.y);
  await page.keyboard.up("Shift");
  await expect(page.locator("#edit-marked")).toContainText("All deciduous");
  await page.keyboard.down("Control");
  await page.mouse.click(car.x, car.y);
  await page.keyboard.up("Control");
  await expect(page.locator("#edit-marked")).toContainText("deciduous");
  await page.keyboard.press("Delete");
  await expect.poll(async () => (await stored(page)).sorts).toEqual(["deciduous"]);
  expect((await stored(page)).deleted.map(d => d.id)).toContain("t_0_0#0");
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await stored(page)).sorts).toEqual([]);
  expect((await stored(page)).deleted).toEqual([]);
});

test("Select all and Add buttons apply the same actions as their modifiers", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-select-set").getByRole("button", {name: "Select all", exact: true}).click();
  await expect(page.locator("#edit-marked")).toContainText("All deciduous");
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-marked")).toHaveCount(0);
  await expect(page.locator("#edit-select-set")).toBeVisible();
  const car = await findCar(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-select-set").getByRole("button", {name: "Add", exact: true}).click();
  await page.mouse.click(car.x, car.y);
  await expect(page.locator("#edit-picked")).toContainText("2 objects");
  await page.keyboard.press("Delete");
  await expect.poll(async () => (await stored(page)).deleted.length).toBe(2);
});

test("the bankett is a prepared material region: Delete takes its triangles, never the road under it, and Undo brings them back", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", verge: true, trees: false});
  await openEditor(page);
  const middle = await centre(scene(page));
  const at = {x: middle.x + 130, y: middle.y}; // inside the fixture's narrow verge, away from its boundary
  await page.mouse.move(at.x, at.y);
  await expect(page.locator("#hover-box h4").first()).toHaveText("Road edge");
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-surface")).toContainText("Road verge");
  await page.keyboard.press("Delete");
  await expect.poll(async () => (await stored(page)).surfaces).toEqual([{mesh: "nocol_road_edge_dirt_0_0", faces: [[0, 2]]}]);
  expect((await stored(page)).deleted).toEqual([]);
  await expect(page.locator("#edit-surface")).toHaveCount(0);
  await page.mouse.move(at.x, at.y + 1);
  await expect(page.locator("#hover-box h4").first()).not.toHaveText("Road edge");
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await stored(page)).surfaces).toEqual([]);
  await page.mouse.move(at.x, at.y);
  await expect(page.locator("#hover-box h4").first()).toHaveText("Road edge");
});

test("the Delete tool takes a clicked stretch of bankett", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", verge: true, trees: false});
  await openEditor(page);
  const middle = await centre(scene(page));
  const at = {x: middle.x + 130, y: middle.y};
  await page.keyboard.press("x");
  await page.mouse.click(at.x, at.y);
  await expect.poll(async () => (await stored(page)).surfaces).toEqual([{mesh: "nocol_road_edge_dirt_0_0", faces: [[0, 2]]}]);
});

test("Ctrl adds painted regions while Shift requests the whole connected road", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  const urls: string[] = [];
  page.on("request", r => { if (r.url().includes("/surface?")) urls.push(r.url()); });
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-surface")).toContainText("Asphalt");
  await page.keyboard.down("Control");
  await page.mouse.click(at.x + 20, at.y + 20);
  await page.keyboard.up("Control");
  await expect.poll(() => urls.length).toBe(2);
  expect(JSON.parse(new URL(urls[1]).searchParams.get("points")!)).toHaveLength(2);
  await page.keyboard.down("Shift");
  await page.mouse.click(at.x, at.y);
  await page.keyboard.up("Shift");
  await expect.poll(() => urls.length).toBe(3);
  expect(JSON.parse(new URL(urls[2]).searchParams.get("points")!)[0].whole).toBe(true);
});

test("the Select bar offers what can be done with the picked ground or object, Alt does its Alt place, and T smooths from the picked road", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await openEditor(page);
  const bar = page.locator("#edit-select-set"), library = page.getByRole("dialog", {name: "Asset library"});
  // The listed car stands in the middle of this fixture. Use and verify the exposed road beside it.
  const view = (await scene(page).boundingBox())!;
  const road = {x: view.x + view.width * .3, y: view.y + view.height * .65};
  await page.mouse.move(road.x, road.y);
  await expect(page.locator("#hover-box")).toContainText("1ROAD_ground_0_0");
  await page.mouse.click(road.x, road.y);
  await expect(page.locator("#edit-surface")).toContainText("Asphalt");
  await expect(bar.locator("#edit-select-texture")).toBeVisible();
  await expect(bar).toContainText("Alt");
  await expect(bar.locator("#edit-select-move")).toHaveCount(0);
  await bar.locator("#edit-select-texture").click();
  await expect(library).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(library).toBeHidden();
  await page.mouse.click(road.x, road.y);
  await page.keyboard.press("Alt");
  await expect(library).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.click(road.x, road.y);
  await page.keyboard.press("t");
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.keyboard.press("Escape");
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await expect(bar.locator("#edit-select-replace")).toBeVisible();
  await bar.locator("#edit-select-move").click();
  await expect(page.locator("#edit-move-set")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.mouse.click(tree.x, tree.y);
  await bar.locator("#edit-select-delete").click();
  await expect.poll(async () => (await stored(page)).deleted.length).toBe(1);
});
