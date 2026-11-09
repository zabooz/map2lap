import {build} from "bun";
import {join} from "node:path";
import {expect, test} from "./fixtures";

let script = "";
test.beforeAll(async () => {
  const result = await build({entrypoints: [join(import.meta.dirname, "inspection-harness.tsx")], target: "browser"});
  if (!result.success) throw new Error(result.logs.join("\n"));
  script = await result.outputs[0].text();
});

test.beforeEach(async ({page, backend}) => {
  await page.route("**/inspection-harness", r => r.fulfill({contentType: "text/html", body: '<div id="root"></div>'}));
  await page.route("**/api/editor/alpha/surface?*", r => r.fulfill({json: {
    material: "gc_meadow", truncated: false, tiles: [],
  }}));
  await page.goto(backend.url + "/inspection-harness");
});

test("selection metadata appears while its overlay is still decoding", async ({page}) => {
  await page.route("**/api/editor/alpha/appearance?*", r => r.fulfill({json: {
    name: "Fine grass", preview: "", repeat: [2, 2], original: false, mixed: false, variation: false,
  }}));
  await page.addScriptTag({content: script});
  await expect(page.locator("#inspect-selection")).toContainText("Meadow selected", {timeout: 1500});
});

test("other tiles finishing cannot restart the selected texture request or erase its card", async ({page}) => {
  let requests = 0;
  await page.route("**/api/editor/alpha/appearance?*", async r => {
    if (++requests > 1) return; // A restart would leave the card reading again.
    await r.fulfill({json: {name: "Fine grass", preview: "", repeat: [2, 2], original: false, mixed: false, variation: false}});
  });
  await page.addScriptTag({content: script});
  await expect(page.locator("#inspect-appearance")).toContainText("Fine grass");
  await page.locator("#progress").click();
  await expect(page.locator("#progress")).toHaveText("Progress 1");
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(page.locator("#inspect-appearance")).toContainText("Fine grass", {timeout: 1500});
  expect(requests).toBe(1);
});
