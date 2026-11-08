// Actual WebGL2 pixel checks for the material-array prototype, independent of the production Editor/AC renderers.
import {test, expect} from "@playwright/test";
import {execFileSync} from "node:child_process";
import {readFileSync, mkdtempSync, rmSync, existsSync} from "node:fs";
import {tmpdir, homedir} from "node:os";
import {join, resolve} from "node:path";

let script: string, temporary: string;
test.beforeAll(() => {
  temporary = mkdtempSync(join(tmpdir(), "map2lap-ground-array-"));
  const localBun = join(homedir(), ".bun", "bin", process.platform === "win32" ? "bun.exe" : "bun");
  const bun = existsSync(localBun) ? localBun : "bun";
  execFileSync(bun, ["build", resolve("tools/ground_array_browser.ts"), "--target=browser", `--outfile=${join(temporary, "probe.js")}`]);
  script = readFileSync(join(temporary, "probe.js"), "utf8");
});
test.afterAll(() => { if (temporary) rmSync(temporary, {recursive: true, force: true}); });

test.beforeEach(async ({page}) => {
  await page.setContent('<canvas id="ground"></canvas>');
  await page.addScriptTag({content: script});
});

test("all twelve materials contribute at a dense junction and survive a serialized reopen", async ({page}) => {
  const result = await page.evaluate(() => {
    // @ts-expect-error developer probe API, outside the product window
    return window.groundArrayProbe.denseCheck();
  });
  expect(result.error).toBeLessThanOrEqual(2);
  expect(result.materials).toBe(12);
  expect(result.reopenIdentical).toBe(true);
  expect(result.drawCalls).toBe(1);
  expect(result.minimumContribution).toBeGreaterThan(3);
});

test("soft masks and coarse filtering match all-material reference pixels", async ({page}) => {
  const result = await page.evaluate(() => {
    // @ts-expect-error developer probe API, outside the product window
    return window.groundArrayProbe.filterCheck();
  });
  expect(result.nearError).toBeLessThanOrEqual(2);
  expect(result.farError).toBeLessThanOrEqual(2);
  expect(result.regionsError).toBe(0);
});

test("normal and roughness maps change the light response; rectangular repeat and variation remain coherent", async ({page}) => {
  const result = await page.evaluate(() => {
    // @ts-expect-error developer probe API, outside the product window
    return window.groundArrayProbe.propertyCheck();
  });
  expect(result.normalDifference).toBeGreaterThan(4);
  expect(result.roughnessDifference).toBeGreaterThan(4);
  expect(result.repeatError).toBeLessThanOrEqual(2);
  expect(result.variationDifference).toBeGreaterThan(4);
  expect(result.variationRegionsError).toBe(0);
});

test("smaller local weight fields preserve the complete coarse tail and its fractional mip transition", async ({page}) => {
  const result=await page.evaluate(()=>{
    // @ts-expect-error developer probe API, outside the product window
    return window.groundArrayProbe.regionalCheck();
  });
  expect(result.nearDifference).toBe(0);
  expect(result.transitionDifference).toBeLessThanOrEqual(1);
  expect(result.farDifference).toBe(0);
  expect(result.regionalBytes).toBeLessThan(result.fullBytes);
  expect(result.regionalApplied).toBe(true);
});
