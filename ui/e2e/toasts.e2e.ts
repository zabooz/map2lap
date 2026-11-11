import {expect, test} from "./fixtures";

const missing = {status: "missing", version: null, build: null, enabled: null, stage: "idle", done: 0,
  total: 0, busy: false, can_install: true, linux: false, website: "https://acstuff.club/patch/", error: null};

test("missing CSP slides down at the top, opens its settings and never installs without a click", async ({page}, testInfo) => {
  let installs = 0;
  await page.route("**/api/csp", route => route.fulfill({json: missing}));
  await page.route("**/api/csp/install", route => { installs++; return route.fulfill({status: 409, json: {error: "Test refused"}}); });
  await page.goto("/");
  const warning = page.getByRole("alert");
  await expect(warning).toContainText("CSP is not installed");
  await expect(warning.getByRole("button", {name: "Install CSP"})).toBeVisible();
  await expect(page.getByRole("dialog", {name: "Settings"})).toBeHidden();
  await page.screenshot({path: testInfo.outputPath("warning-toast.png"), animations: "disabled"});
  await expect(warning).toBeInViewport();
  await warning.getByRole("button", {name: "Install CSP"}).click();
  const dialog = page.getByRole("dialog", {name: "Settings"});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", {name: "Install CSP"})).toBeFocused();
  expect(installs).toBe(0);
  await dialog.getByRole("button", {name: "Install CSP"}).click();
  await expect(dialog.getByRole("alert")).toContainText("Test refused");
  expect(installs).toBe(1);
});

test("missing AC takes priority and its toast opens the folder field", async ({page}) => {
  let cspChecks = 0;
  await page.route("**/api/settings", async route => {
    const response = await route.fetch();
    await route.fulfill({response, json: {...await response.json(), ac_ok: false}});
  });
  await page.route("**/api/csp", route => { cspChecks++; return route.fulfill({json: missing}); });
  await page.goto("/");
  const warning = page.getByRole("alert");
  await expect(warning).toContainText("Assetto Corsa folder not found");
  await expect(page.getByRole("dialog", {name: "Settings"})).toBeHidden();
  await warning.getByRole("button", {name: "Choose folder"}).click();
  await expect(page.getByLabel("Assetto Corsa folder", {exact: true})).toBeFocused();
  expect(cspChecks).toBe(0);
});

test("dismissed warnings stay dismissed across checks; a resolved warning disappears", async ({page}) => {
  let checked = 0, installed = false;
  await page.route("**/api/csp", route => {
    checked++;
    return route.fulfill({json: installed ? {...missing, status: "installed", version: "0.2.11", enabled: true, can_install: false} : missing});
  });
  await page.goto("/");
  await page.getByRole("button", {name: "Dismiss notification"}).click();
  await expect(page.getByRole("alert")).toBeHidden();
  await expect.poll(() => checked).toBeGreaterThan(1);
  await expect(page.getByRole("alert")).toBeHidden();
  await page.reload();
  await expect(page.getByRole("alert")).toBeVisible();
  installed = true;
  await expect(page.getByRole("alert")).toBeHidden();
});

test("a failed CSP check offers retry without claiming it is missing", async ({page}) => {
  await page.route("**/api/csp", route => route.fulfill({status: 503, json: {error: "Unavailable"}}));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Could not check CSP");
  await expect(page.getByRole("button", {name: "Install CSP"})).toHaveCount(0);
});

test("an incomplete game folder warns even when content/tracks exists", async ({page}) => {
  await page.route("**/api/csp", route => route.fulfill({json: {...missing, status: "invalid", can_install: false}}));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Assetto Corsa folder not found");
  await page.getByRole("button", {name: "Choose folder"}).click();
  await expect(page.getByLabel("Assetto Corsa folder", {exact: true})).toBeFocused();
});

test("the warning fits a narrow dark window and respects reduced motion", async ({page}, testInfo) => {
  await page.setViewportSize({width: 390, height: 640});
  await page.emulateMedia({colorScheme: "dark", reducedMotion: "reduce"});
  await page.route("**/api/csp", route => route.fulfill({json: missing}));
  await page.goto("/");
  const warning = page.getByRole("alert");
  await expect(warning).toBeVisible();
  const bounds = (await warning.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(await warning.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await expect(warning.getByRole("button", {name: "Install CSP"})).toBeInViewport();
  await page.screenshot({path: testInfo.outputPath("warning-toast-mobile-dark.png")});
});
