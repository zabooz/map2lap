// The terrain toggle belongs to the build, and options/log share one fixed panel.
import {card, clickMap, expect, openEditor, test} from "./fixtures";
import {deleteTree, meshes, saved, saveTrack, stored, treeCount} from "./edit-helpers";

test("terrain toggle follows codes, builds and rebuilds while the log remains accessible", async ({page, backend}) => {
  let allowDone = false;
  await page.route("**/api/status", async route => {
    const response = await route.fetch();
    const status = await response.json();
    if (!allowDone && status.state === "done") status.state = "running";
    await route.fulfill({response, json: status});
  });
  await page.goto("/");
  const options = page.getByRole("tab", {name: "Build options", exact: true});
  const log = page.getByRole("tab", {name: "Build log", exact: true});
  const toggle = page.getByRole("switch", {name: "1 m terrain grid"});
  await expect(options).toHaveAttribute("aria-selected", "true");
  await expect(toggle).not.toBeChecked();
  const panel = page.getByRole("tabpanel", {name: "Build options", exact: true});
  await expect(panel.getByLabel("Corridor each side")).toBeVisible();
  const details = (await page.getByRole("region", {name: "Build details", exact: true}).boundingBox())!;
  expect((await page.locator("#go").boundingBox())!.y).toBeGreaterThanOrEqual(details.y + details.height);
  const before = (await page.locator("#go").boundingBox())!;
  await log.click();
  await options.click();
  expect((await page.locator("#go").boundingBox())!.y).toBe(before.y);

  await toggle.click();
  await page.getByRole("switch", {name: "Parked cars", exact: true}).click();
  await page.getByRole("slider", {name: "Build tree minimum spacing"}).fill("5.5");
  await page.getByLabel("Track name").fill("Grid trial");
  await clickMap(page, .3, .3);
  await clickMap(page, .6, .6);
  await expect(card(page)).toContainText("1 m grid");
  await expect(card(page)).toContainText("Cars off");
  await expect(card(page)).toContainText("Trees min. 5.5 m");
  const code = page.getByRole("textbox", {name: "Track code"});
  await expect(code).toHaveValue(/^M2L2-/);
  const decoded = await page.request.post("/api/code", {data: {code: await code.inputValue()}});
  expect(await decoded.json()).toMatchObject({terrain_cell_m: 1, parked_cars: false, tree_spacing_m: 5.5});
  const requested = page.waitForRequest(r => r.url().endsWith("/api/build"));
  await page.locator("#go").click();
  expect((await requested).postDataJSON()).toMatchObject({terrain_cell_m: 1, parked_cars: false, tree_spacing_m: 5.5});
  await expect(log).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", {name: "Build log", exact: true})).toBeFocused();
  await expect(page.locator("#log")).toContainText("Terrain grid: 1 m");
  await options.click();
  await expect(toggle).toBeDisabled();
  await expect(page.locator("#go")).toHaveText("Stop build");
  allowDone = true;
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");
  await expect(toggle).toBeEnabled();

  await page.locator("#t-mine").click();
  await page.locator("#pane-mine").getByRole("button").filter({hasText: "Grid trial"}).click();
  await options.click();
  await expect(toggle).toBeChecked();
  await expect(page.getByRole("switch", {name: "Parked cars", exact: true})).not.toBeChecked();
  await expect(page.getByRole("slider", {name: "Build tree minimum spacing"})).toHaveValue("5.5");
  await toggle.click();
  const rebuilt = page.waitForRequest(r => r.url().endsWith("/api/rebuild"));
  await page.locator("#go").click();
  expect((await rebuilt).postDataJSON().terrain_cell_m).toBe(2);
  await expect.poll(backend.calls).toContainEqual(["scenery", "grid_trial", false, 5.5]);
  await expect.poll(backend.calls).toContainEqual(["terrain", "grid_trial", 2]);
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");
});

test("Editor tree spacing cannot restore trees removed during the build", async ({page, backend}) => {
  const distance = async () => (await stored(page) as Awaited<ReturnType<typeof stored>> & {tree_spacing?: {distance: number}}).tree_spacing?.distance;
  await backend.post("/__test/rebuild", {name: "alpha", title: "Sparse build", tree_spacing_m: 5,
    tree_positions: [[40, -200], [128, -130], [130, -130]]});
  expect(await treeCount(page)).toBe(2);
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await expect(page.getByText("Trees: 2", {exact: true})).toBeVisible();
  const slider = page.getByRole("slider", {name: "Tree minimum spacing", exact: true});
  await slider.fill("100");
  await slider.dispatchEvent("pointerup");
  await expect.poll(distance).toBe(100);
  await saved(page);
  await slider.fill("0");
  await slider.dispatchEvent("pointerup");
  await expect.poll(distance).toBe(0);
  await saved(page);
  await expect(page.getByText("Trees: 2", {exact: true})).toBeVisible();
  await saveTrack(page);
  expect(await treeCount(page)).toBe(2);
});

test("pasting a 1 m code selects 1 m and an older code resets it to 2 m", async ({page}) => {
  await page.goto("/");
  const toggle = page.getByRole("switch", {name: "1 m terrain grid"});
  const info = {title: "Shared grid", points: [[46, 14], [46.01, 14.01]], width: 100};
  for (const terrain_cell_m of [1, 2]) {
    const made = await page.request.post("/api/code", {data: {make: {...info, ...(terrain_cell_m === 1 ? {terrain_cell_m} : {})}}});
    await page.getByRole("textbox", {name: "Track code"}).fill((await made.json()).code);
    await page.getByRole("textbox", {name: "Track code"}).press("Enter");
    await expect(toggle).toBeChecked({checked: terrain_cell_m === 1});
  }
});

test("the Editor loads and saves a split 1 m terrain tile without dropping its geometry", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Fine terrain", terrain_cell_m: 1});
  await openEditor(page);
  const geometry = async () => {
    const data = await (await page.request.get("/api/editor/alpha/index")).json();
    return data.meshes.filter((m: {name: string}) => /^1ROAD_ground_0_0(?:_\d+)?$/.test(m.name))
      .map((m: {name: string; vertices: number; indices: number}) => [m.name, m.vertices, m.indices]);
  };
  const before = await geometry();
  const beforeInstalled = await meshes(page);
  expect(before.length).toBeGreaterThan(1);
  expect(before.reduce((sum: number, m: [string, number, number]) => sum + m[2], 0)).toBe(256 * 256 * 6);
  await deleteTree(page);
  await saved(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect(await geometry()).toEqual(before);
  const afterInstalled = await meshes(page);
  for (const [name, faces] of Object.entries(beforeInstalled)) {
    if (name.startsWith("1ROAD_ground_0_0")) expect(afterInstalled[name]).toBe(faces);
  }
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  expect(await geometry()).toEqual(before);
});
