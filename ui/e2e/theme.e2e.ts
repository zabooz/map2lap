import {card, clickMap, expect, openEditor, openSettings, scene, stillView, test} from "./fixtures";

const themeKey = "map2lap.theme";
const root = (page: import("@playwright/test").Page) => page.locator("html");
/** The one appearance button in the workspace rail: pressed in dark mode, a click switches to the other mode. */
const toggle = (page: import("@playwright/test").Page) => page.getByTestId("nav-theme");

for (const scheme of ["light", "dark"] as const) {
  test(`first visit is dark under a ${scheme} system appearance without storing a choice`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});
    await page.goto("/");
    await expect(toggle(page)).toHaveAccessibleName("Dark mode");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await expect(root(page)).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBeNull();
    expect(await root(page).evaluate(el => getComputedStyle(el).colorScheme)).toBe("dark");
  });
}

test("light chosen by the button survives reload and system changes, and dark can be chosen back", async ({page}) => {
  await page.emulateMedia({colorScheme: "dark"});
  await page.goto("/");
  await toggle(page).click();
  await expect(root(page)).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBe("light");
  await page.reload();
  await expect(root(page)).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({colorScheme: "light"});
  await page.emulateMedia({colorScheme: "dark"});
  await expect(root(page)).toHaveAttribute("data-theme", "light");
  await toggle(page).click();
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBe("dark");
});

test("the system appearance never changes the page", async ({page}) => {
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  await page.emulateMedia({colorScheme: "dark"});
  await page.emulateMedia({colorScheme: "light"});
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
});

test("invalid stored appearance falls back to dark", async ({page}) => {
  await page.addInitScript(key => localStorage.setItem(key, "broken"), themeKey);
  await page.emulateMedia({colorScheme: "light"});
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
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
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await toggle(page).click();
  await expect(root(page)).toHaveAttribute("data-theme", "light");
});

for (const [saved, expected] of [["light", "light"], [null, "dark"]] as const) {
  test(`${saved ?? "no"} saved appearance gives ${expected} before the app's JavaScript loads`, async ({page}) => {
    if (saved) await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [themeKey, saved]);
    await page.emulateMedia({colorScheme: expected === "dark" ? "light" : "dark"});
    await page.route(/\.js(?:\?|$)/, route => route.abort());
    await page.goto("/");
    await expect(root(page)).toHaveAttribute("data-theme", expected);
  });
}

test("appearance sits in the rail between bug report and Settings, also in a short window and the Editor", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 640});
  await page.goto("/");
  const dark = toggle(page);
  expect(await page.getByTestId("workspace-nav").locator(":scope > button").evaluateAll(buttons => buttons.map(b => b.dataset.testid)))
    .toEqual(["report-bug", "nav-theme", "nav-settings"]);
  await expect(page.getByRole("group", {name: "Appearance", exact: true})).toHaveCount(0);
  await expect(dark).toBeInViewport();
  await openSettings(page);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(26, 33, 35)");
  await page.getByRole("button", {name: "Close settings"}).click();
  await dark.focus();
  await page.keyboard.press("Enter");
  await expect(root(page)).toHaveAttribute("data-theme", "light");
  await openEditor(page);
  await expect(dark).toBeInViewport();
  await expect(page.getByRole("group", {name: "Appearance", exact: true})).toHaveCount(0);
  await dark.click();
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
});

test("the appearance choice is shared between open tabs", async ({page, context}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.route(/tile\.openstreetmap\.org/, route => route.fulfill({status: 204}));
  await other.goto("/");
  await toggle(page).click();
  await expect(root(other)).toHaveAttribute("data-theme", "light");
  await toggle(other).click();
  await expect(root(page)).toHaveAttribute("data-theme", "dark");
  await other.close();
});

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme} actions stay readable and build errors keep their red meaning`, async ({page}) => {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [themeKey, scheme]);
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
  await openEditor(page);
  await page.mouse.move(10, 10);
  await page.screenshot({path: test.info().outputPath("dark-editor.png")});
  // A canvas screenshot includes HTML over the track. Only the 3D rendering should be theme-independent.
  const hiddenControls = await page.addStyleTag({content: '[data-tool-options], #sun-clock { visibility: hidden; }'});
  const before = await stillView(page);
  await toggle(page).click();
  await page.mouse.move(10, 10);
  await expect.poll(async () => (await scene(page).screenshot()).equals(before)).toBe(true);
  await hiddenControls.evaluate(el => el.parentNode?.removeChild(el));
  await page.screenshot({path: test.info().outputPath("light-editor.png")});
  await openSettings(page);
  await page.getByRole("dialog").screenshot({path: test.info().outputPath("light-settings.png")});
});

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme} secondary text remains readable on the page's surfaces`, async ({page}) => {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [themeKey, scheme]);
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
