import {expect, openEditor, openSettings, test} from "./fixtures";

const missing = {status: "missing", version: null, build: null, enabled: null, stage: "idle", done: 0,
  total: 0, busy: false, can_install: true, linux: false, website: "https://acstuff.club/patch/", error: null};

test("an untested preview warns without replacing CSP or blocking Play", async ({page}) => {
  let installs = 0;
  await page.route("**/api/csp", route => route.fulfill({json: {...missing, status: "installed", enabled: true,
    version: "0.3.1-preview1", can_install: false}}));
  await page.route("**/api/csp/install", route => { installs++; return route.abort(); });
  await openEditor(page);
  const warning = page.getByRole("alert");
  await expect(warning).toContainText("Untested CSP version");
  await expect(warning).toContainText("0.3.1-preview1");
  await expect(warning).toContainText("0.2.11");
  await expect(page.getByRole("button", {name: "Install CSP"})).toHaveCount(0);
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  await started;
  expect(installs).toBe(0);
  await warning.getByRole("button", {name: "Dismiss notification"}).click();
  await expect(warning).toBeHidden();
});

test("CSP is checked once at startup, manually and for another AC path; closing the server causes no periodic warning", async ({page}) => {
  await page.clock.install();
  let checks = 0, offline = false;
  const installed = {...missing, status: "installed", enabled: true, version: "0.2.11", can_install: false};
  await page.route("**/api/csp", route => {
    checks++;
    return offline ? route.abort("connectionrefused") : route.fulfill({json: installed});
  });
  await page.goto("/");
  await expect.poll(() => checks).toBe(1);
  await openSettings(page, "General");
  await page.getByRole("button", {name: "Check again", exact: true}).click();
  await expect.poll(() => checks).toBe(2);
  const path = page.getByLabel("Assetto Corsa folder", {exact: true});
  const originalPath = await path.inputValue();
  await path.fill(originalPath + "/.");
  await path.press("Enter");
  // The typed path is shown optimistically, then the server returns its canonical path.
  await expect(path).toHaveValue(originalPath);
  await expect.poll(() => checks).toBe(4);
  await expect(page.locator("#csp-settings").getByRole("status")).toContainText("CSP 0.2.11 installed");
  await page.getByRole("button", {name: "Close settings"}).click();
  offline = true;
  await page.clock.runFor(6500);
  expect(checks).toBe(4);
  await expect(page.getByRole("alert")).toBeHidden();
});

test("CSP polling follows an active installation and stops when it completes", async ({page}) => {
  await page.clock.install();
  let checks = 0, completed = false;
  await page.route("**/api/csp", route => {
    checks++;
    return route.fulfill({json: completed
      ? {...missing, status: "installed", enabled: true, version: "0.2.11", stage: "done", can_install: false}
      : {...missing, stage: "installing", busy: true, can_install: false}});
  });
  await page.goto("/");
  await expect.poll(() => checks).toBe(1);
  await openSettings(page, "General");
  await expect(page.locator("#csp-settings").getByRole("status")).toContainText("Installing CSP");
  await page.clock.runFor(1100);
  await expect.poll(() => checks).toBe(2);
  completed = true;
  await page.clock.runFor(1100);
  await expect.poll(() => checks).toBe(3);
  await expect(page.locator("#csp-settings").getByRole("status")).toContainText("CSP 0.2.11 installed");
  await page.clock.runFor(6500);
  expect(checks).toBe(3);
  await expect(page.getByRole("alert")).toBeHidden();
});

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
    return route.fulfill({json: installed ? {...missing, status: "installed", version: "0.2.11", enabled: true, can_install: false} : {...missing, can_install: false}});
  });
  await page.goto("/");
  await page.getByRole("button", {name: "Dismiss notification"}).click();
  await expect(page.getByRole("alert")).toBeHidden();
  await openSettings(page, "General");
  await page.getByRole("button", {name: "Check again", exact: true}).click();
  await expect.poll(() => checked).toBe(2);
  await page.getByRole("button", {name: "Close settings"}).click();
  await expect(page.getByRole("alert")).toBeHidden();
  await page.reload();
  await expect(page.getByRole("alert")).toBeVisible();
  installed = true;
  await openSettings(page, "General");
  await page.getByRole("button", {name: "Check again", exact: true}).click();
  await expect.poll(() => checked).toBe(4);
  await page.getByRole("button", {name: "Close settings"}).click();
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
