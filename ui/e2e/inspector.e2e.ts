import {centre, expect, openEditor, scene, test} from "./fixtures";
import {findCar, findTree, points} from "./edit-helpers";

test("the right inspector keeps the selected object while the pointer inspects the road", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await openEditor(page);
  const panel = page.getByRole("complementary", {name: "Inspector"});
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Nothing selected");
  const car = await findCar(page);
  await page.mouse.click(car.x, car.y);
  const selection = panel.locator("#inspect-selection");
  await expect(selection).toContainText("Parked car");
  await expect(selection).toContainText("t_0_0#0");
  await expect(panel.locator("#inspect-appearance")).not.toContainText("Shader");
  await expect(panel.getByRole("img", {name: "Selected texture"})).toBeVisible();
  await points(page, await centre(scene(page)));
  await expect(selection).toContainText("Parked car");
  await panel.getByRole("tab", {name: "Details", exact: true}).click();
  await panel.getByText("Object details", {exact: true}).click();
  await expect(panel.locator("#inspect-object")).toContainText("Object triangles");
  await expect(panel.locator("#inspect-object")).toContainText("Dimensions");
  await page.screenshot({path: test.info().outputPath("properties.png")});
  await panel.getByRole("tab", {name: "Selection", exact: true}).click();
  await page.locator("#edit-select").click();
  await page.keyboard.press("Escape");
  await expect(panel).toContainText("Nothing selected");
});

test("surface selection appears in the inspector and cannot turn into an object edit", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.click(at.x, at.y);
  const panel = page.getByRole("complementary", {name: "Inspector"});
  await expect(panel.locator("#inspect-selection")).toContainText("Asphalt");
  const tree = await findTree(page);
  await points(page, tree);
  await expect(panel.locator("#inspect-selection")).toContainText("Asphalt");
  await expect(panel.locator("#inspect-selection")).not.toContainText("Tree");
  await page.keyboard.press("Escape");
  await expect(panel).toContainText("Nothing selected");
});

test("the inspector can collapse, reopen and resize without losing the selection", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  const panel = page.getByRole("complementary", {name: "Inspector"});
  await expect(panel.locator("#inspect-selection")).toContainText("Tree");
  const before = (await scene(page).boundingBox())!.width;
  const divider = page.getByRole("separator", {name: "Inspector width"});
  await divider.focus();
  await divider.press("ArrowLeft");
  await expect.poll(async () => (await scene(page).boundingBox())!.width).toBeLessThan(before);
  await panel.getByRole("button", {name: "Hide inspector"}).click();
  await expect(panel).toBeHidden();
  await expect.poll(async () => (await scene(page).boundingBox())!.width).toBeGreaterThan(before);
  await page.getByRole("button", {name: "Show inspector"}).click();
  await expect(panel.locator("#inspect-selection")).toContainText("Tree");
  await page.locator("#edit-track").selectOption("beta");
  await expect(panel).toContainText("Nothing selected");
});

test("trees have a loaded appearance preview and object options follow it in Selection", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  const panel = page.getByRole("complementary", {name: "Inspector"});
  await expect(panel.getByRole("tab")).toHaveText(["Selection", "Properties", "Details"]);
  await expect(panel.locator("#inspector-selection > section > h3")).toHaveText(["Selection", "Appearance", "Options"]);
  const preview = panel.getByRole("img", {name: "Selected texture"});
  await expect(preview).toHaveAttribute("src", /\/treefx\/spruce\/.*\.png$/);
  await expect.poll(() => preview.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(panel.locator("#inspect-selection input")).toHaveCount(0);
  await expect(panel.locator("#inspect-options input")).toHaveCount(3);
  await expect(panel.locator("#sun-clock")).toBeHidden();
  await panel.getByRole("tab", {name: "Properties", exact: true}).click();
  await expect(panel.getByRole("slider", {name: "Time of day"})).toBeVisible();
  await expect(panel.locator("#inspect-selection")).toBeHidden();
  await panel.getByRole("tab", {name: "Selection", exact: true}).click();
  await expect(panel.locator("#inspect-selection")).toContainText("Tree");
});

test("pointer information floats left of the Inspector and collapses to coordinates", async ({page}) => {
  await openEditor(page);
  const at = await centre(scene(page));
  await page.mouse.move(at.x, at.y);
  const overlay = page.getByRole("complementary", {name: "Under pointer"});
  await expect(overlay).toBeVisible();
  const bounds = (await overlay.boundingBox())!;
  const panel = (await page.getByRole("complementary", {name: "Inspector"}).boundingBox())!;
  expect(bounds.x + bounds.width).toBeLessThan(panel.x);
  await overlay.getByLabel("Collapse pointer details").click();
  await expect(overlay.locator("dt")).toHaveText(["AC x, y, z", "Lat, lon"]);
  await expect(overlay).not.toContainText("Shader");
  await overlay.getByLabel("Expand pointer details").click();
  await expect(overlay).toContainText("Shader");
});

test("clicking a selection opens Selection from Properties or Details; hovering keeps the tab", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  const panel = page.getByRole("complementary", {name: "Inspector"});
  for (const name of ["Properties", "Details"]) {
    const tab = panel.getByRole("tab", {name, exact: true});
    await tab.click();
    await page.mouse.move(tree.x, tree.y);
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await page.mouse.click(tree.x, tree.y);
    await expect(panel.getByRole("tab", {name: "Selection", exact: true})).toHaveAttribute("aria-selected", "true");
    await expect(panel.locator("#inspect-selection")).toContainText("Tree");
  }
  await panel.getByRole("tab", {name: "Properties", exact: true}).click();
  const road = await centre(scene(page));
  await page.mouse.click(road.x, road.y);
  await expect(panel.getByRole("tab", {name: "Selection", exact: true})).toHaveAttribute("aria-selected", "true");
  await expect(panel.locator("#inspect-selection")).toContainText("Asphalt");
});

test("T transforms, R smooths and E inserts; bars and help show the same keys", async ({page}) => {
  await openEditor(page);
  await scene(page).focus();
  await page.keyboard.press("t");
  await expect(page.locator("#edit-move")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#edit-help summary").click();
  await expect(page.locator("#edit-help")).toContainText("Transform (T)");
  await scene(page).focus(); await page.keyboard.press("r");
  await expect(page.locator("#edit-smooth")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-help")).toContainText("Smooth road (R)");
  await scene(page).focus(); await page.keyboard.press("e");
  const library = page.getByRole("dialog", {name: "Asset library"});
  await expect(library).toBeVisible();
  await expect(library.getByRole("tab", {name: "OBJECTS", exact: true})).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
});
