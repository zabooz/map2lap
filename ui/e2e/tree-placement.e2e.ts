import {test, expect, openEditor, scene} from "./fixtures";
import {saved} from "./edit-helpers";

test("repeated native tree insertion settles every solid preview", async ({page, backend}) => {
  await backend.post("/__test/builtin-models");
  await openEditor(page);
  const library = page.getByRole("dialog", {name: "Asset library"});
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await library.getByLabel("Search objects").fill("Spruce");
  await library.getByRole("button", {name: "Spruce", exact: true}).click();
  await library.getByRole("button", {name: "Place on ground", exact: true}).click();
  for (let n = 1; n <= 3; n++) {
    await scene(page).click({position: {x: 500 + n * 50, y: 400}});
    await saved(page);
    // A pose-only refresh used to cancel the binding reload at the second tree: its solid preview then stayed over TreeFX.
    await expect.poll(() => page.evaluate(() =>
      (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances)).toBe(n);
    await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/index")).json()).models.length).toBe(n);
  }
  await page.keyboard.press("Escape");
});
