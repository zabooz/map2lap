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
  await panel.getByRole("tab", {name: "Properties", exact: true}).click();
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
