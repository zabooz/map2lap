import {card, clickMap, expect, openEditor, openSettings, scene, stillView, test} from "./fixtures";

const themeKey = "map2lap.theme";
const root = (page: import("@playwright/test").Page) => page.locator("html");
const chooser = (page: import("@playwright/test").Page) => page.getByRole("group", {name: "Appearance", exact: true});

for (const scheme of ["light", "dark"] as const) {
  test(`first visit uses the ${scheme} system appearance without storing a manual choice`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});
    await page.goto("/");
    const choices = chooser(page);
    await expect(choices.getByRole("button")).toHaveText(["Light", "Dark"]);
    await expect(choices.getByRole("button", {name: scheme === "light" ? "Light" : "Dark", exact: true})).toHaveAttribute("aria-pressed", "true");
    await expect(root(page)).toHaveAttribute("data-theme", scheme);
    expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBeNull();
    expect(await root(page).evaluate(el => getComputedStyle(el).colorScheme)).toBe(scheme);
  });

  test(`manual ${scheme} appearance survives reload and the opposite system setting`, async ({page}) => {
    const opposite = scheme === "light" ? "dark" : "light";
    await page.emulateMedia({colorScheme: opposite});
    await page.goto("/");
    await chooser(page).getByRole("button", {name: scheme === "light" ? "Light" : "Dark", exact: true}).click();
    await expect(root(page)).toHaveAttribute("data-theme", scheme);
    expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBe(scheme);
    await page.reload();
    await expect(root(page)).toHaveAttribute("data-theme", scheme);
    await page.emulateMedia({colorScheme: scheme});
    await page.emulateMedia({colorScheme: opposite});
    await expect(root(page)).toHaveAttribute("data-theme", scheme);
  });
}

test("system changes apply until a user explicitly chooses even the already active appearance", async ({page}) => {
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  await page.emulateMedia({colorScheme: "dark"});
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await chooser(page).getByRole("button", {name: "Dark", exact: true}).click();
  await page.emulateMedia({colorScheme: "light"});
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
});

test("invalid stored appearance falls back to the system", async ({page}) => {
  await page.addInitScript(key => localStorage.setItem(key, "broken"), themeKey);
  await page.emulateMedia({colorScheme: "dark"});
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await expect(chooser(page).getByRole("button", {name: "Dark", exact: true})).toHaveAttribute("aria-pressed", "true");
});

test("blocked appearance storage still allows switching for the current visit", async ({page}) => {
  await page.addInitScript(key => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key) throw new DOMException("Blocked", "SecurityError");
      return get.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Blocked", "SecurityError");
      set.call(this, name, value);
    };
  }, themeKey);
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  await chooser(page).getByRole("button", {name: "Dark", exact: true}).click();
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({colorScheme: "dark"});
  await page.emulateMedia({colorScheme: "light"});
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
});

test("saved appearance is applied before the app's JavaScript loads", async ({page}) => {
  await page.addInitScript(key => localStorage.setItem(key, "dark"), themeKey);
  await page.emulateMedia({colorScheme: "light"});
  await page.route(/\.js(?:\?|$)/, route => route.abort());
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
});

test("appearance stays reachable in a short window and the Editor and reaches Settings", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 640});
  await page.goto("/");
  const dark = chooser(page).getByRole("button", {name: "Dark", exact: true});
  await expect(dark).toBeInViewport();
  await dark.focus();
  await page.keyboard.press("Enter");
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await openSettings(page);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(26, 33, 35)");
  await page.getByRole("button", {name: "Close settings"}).click();
  await openEditor(page);
  await expect(dark).toBeInViewport();
  await chooser(page).getByRole("button", {name: "Light", exact: true}).click();
  await expect(root(page)).toHaveAttribute("data-theme", "light");
});

test("the appearance choice is shared between open tabs", async ({page, context}) => {
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  const other = await context.newPage();
  await other.route(/tile\.openstreetmap\.org/, route => route.fulfill({status: 204}));
  await other.goto("/");
  await chooser(page).getByRole("button", {name: "Dark", exact: true}).click();
  await expect(root(other)).toHaveAttribute("data-theme", "dark");
  await chooser(other).getByRole("button", {name: "Light", exact: true}).click();
  await expect(root(page)).toHaveAttribute("data-theme", "light");
  await other.close();
});

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme} actions stay readable and build errors keep their red meaning`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});
    await page.goto("/");
    await clickMap(page, .3, .3);
    await clickMap(page, .6, .6);
    await expect(page.locator("#go")).toBeEnabled();
    const contrast = await page.locator("#go").evaluate(el => {
      const style = getComputedStyle(el);
      const luminance = (color: string) => {
        const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return .2126 * r! + .7152 * g! + .0722 * b!;
      };
      const fg = luminance(style.color), bg = luminance(style.backgroundColor);
      return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    const route = page.locator("path.leaflet-interactive").last();
    expect(await route.evaluate(el => getComputedStyle(el).stroke)).toBe("rgb(27, 113, 106)");
    await page.screenshot({path: test.info().outputPath(`${scheme}-generator.png`)});
    await page.route("**/api/status", r => r.fulfill({json: {state: "error", log: ["A test build failed"], error: "A test build failed", started: 1, elapsed: 5}}));
    await page.reload(); // A new selection hides an older result until the page is reopened or another build starts.
    await expect(card(page)).toContainText("A test build failed");
    const [r, g, b] = await card(page).getByText("A test build failed", {exact: true}).evaluate(el => getComputedStyle(el).color.match(/\d+/g)!.map(Number));
    expect(r).toBeGreaterThan(g!);
    expect(r).toBeGreaterThan(b!);
  });
}

test("changing appearance leaves the rendered track unchanged", async ({page}) => {
  await page.emulateMedia({colorScheme: "light"});
  await openEditor(page);
  await page.mouse.move(10, 10);
  await page.screenshot({path: test.info().outputPath("light-editor.png")});
  // A canvas screenshot includes HTML drawn over it; exclude the same controls as the rendering reference tests.
  const hiddenControls = await page.addStyleTag({content: "[data-tool-options], #sun-clock { visibility: hidden; }"});
  const before = await stillView(page);
  await chooser(page).getByRole("button", {name: "Dark", exact: true}).click();
  await page.mouse.move(10, 10);
  await expect.poll(async () => (await scene(page).screenshot()).equals(before)).toBe(true);
  await hiddenControls.evaluate(el => el.parentNode?.removeChild(el));
  await page.screenshot({path: test.info().outputPath("dark-editor.png")});
  await openSettings(page);
  await page.getByRole("dialog").screenshot({path: test.info().outputPath("dark-settings.png")});
});

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme} secondary text remains readable on the page's surfaces`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});
    await page.goto("/");
    const contrasts = await root(page).evaluate(el => {
      const css = getComputedStyle(el);
      const luminance = (name: string) => {
        const hex = css.getPropertyValue(name).trim();
        const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(channel =>
          channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
        return .2126 * r! + .7152 * g! + .0722 * b!;
      };
      return ["--bg", "--panel", "--raised", "--line"].map(surface => {
        const fg = luminance("--muted"), bg = luminance(surface);
        return {surface, contrast: (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05)};
      });
    });
    for (const {surface, contrast} of contrasts) expect(contrast, surface).toBeGreaterThanOrEqual(4.5);
  });
}
