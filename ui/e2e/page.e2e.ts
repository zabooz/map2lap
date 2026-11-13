// The page's frame: tabs, the settings popup, what stays over a reload, low windows.
import {card, expect, test} from "./fixtures";

test("the three tabs and the gear", async ({page}) => {
  await page.goto("/");
  await expect(page.locator("nav button")).toHaveText(["New track", /My tracks/, "Editor"]);
  await expect(page.getByLabel("Settings", {exact: true})).toBeVisible();
  await expect(card(page)).toContainText("Set a route");
  await expect(page.getByText("Click to set start, finish")).toBeVisible();
  await expect(page.getByText(/v\d+\.\d+/).first()).toBeVisible();
});

test("the settings open as a popup and close by its x, Esc and beside it", async ({page}) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeHidden();
  await page.locator("#t-set").click();
  await expect(dialog).toBeVisible();
  await page.getByLabel("Close settings").click();
  await expect(dialog).toBeHidden();
  await page.locator("#t-set").click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.locator("#t-set").click();
  await page.mouse.click(1450, 450);
  await expect(dialog).toBeHidden();
});

test("the settings' three tabs hold their groups", async ({page}) => {
  await page.goto("/");
  await page.locator("#t-set").click();
  const dialog = page.getByRole("dialog");
  const panel = dialog.getByRole("tabpanel").locator("visible=true");
  await expect(panel.getByRole("heading")).toHaveText(["Installation", "Build speed", "Storage", "Testing"]);
  await dialog.getByRole("tab", {name: "Map2Lap"}).click();
  await expect(panel.getByRole("heading")).toHaveText(["Play", "Weather"]);
  await dialog.getByRole("tab", {name: "Editor"}).click();
  await expect(panel.getByRole("heading")).toHaveText(["Build files", "3D view", "Controls", "Keys and mouse"]);
});

test("a reload stays on its tab", async ({page}) => {
  await page.goto("/");
  await page.locator("#t-mine").click();
  await page.reload();
  await expect(page.locator("#pane-mine")).toBeVisible();
  await page.locator("#t-new").click();
  await page.reload();
  await expect(page.locator("#pane-mine")).toBeHidden();
  await expect(page.getByLabel("Track name")).toBeVisible();
});

test("a broken stored tab starts on New track", async ({page}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("map2lap.tab", "nonsense"));
  await page.reload();
  await expect(page.getByLabel("Track name")).toBeVisible();
});

const result = {name: "alpha", kn5_bytes: 1500000, seconds: 37, tiles: 2, area_m: null, length_m: 250};
const log = Array.from({length: 60}, (_, k) => `line ${k}`);
const STATES = {
  running: {state: "running", log, elapsed: 12, started: 1, progress: {phase: "scenery", done: 3, total: 6}},
  done: {state: "done", log, elapsed: 37, started: 1, result},
  error: {state: "error", log, elapsed: 5, started: 1, error: "The build failed for a long reason to say here"},
};

// A low window: here a place does matter. What it takes to go on must stay on the screen, whole (it used to be squeezed away).
for (const [name, status] of Object.entries(STATES)) {
  test(`a low window, ${name}: the card's content, the button and the log stay usable`, async ({page}) => {
    await page.setViewportSize({width: 1500, height: 560});
    await page.route("**/api/status", r => r.fulfill({json: status}));
    await page.goto("/");
    await expect(page.locator("#go")).toBeInViewport({ratio: 1});
    await expect(page.locator("#log")).toBeInViewport();
    await expect(page.locator("#log")).toContainText("line 59");
    if (name === "done") await expect(card(page).getByRole("button", {name: "▶ Play"})).toBeInViewport({ratio: 1});
    if (name === "running") await expect(card(page).getByText("3 / 6 parts")).toBeInViewport({ratio: 1});
    if (name === "error") await expect(card(page).getByText("Details in the log below.")).toBeInViewport({ratio: 1});
  });
}

test("a low window's form reaches its end by scrolling", async ({page}) => {
  await page.goto("/");
  await page.setViewportSize({width: 1500, height: 560});
  const corridor = page.getByLabel("Corridor each side");
  await corridor.scrollIntoViewIfNeeded();
  await expect(corridor).toBeInViewport({ratio: 1});
  await corridor.fill("200");
  await expect(page.getByText("±200 m")).toBeVisible();
});

test("a missing Assetto Corsa folder keeps Build off and its warning opens Settings", async ({page}) => {
  await page.route("**/api/settings", async route => {
    const real = await (await route.fetch()).json();
    await route.fulfill({json: {...real, ac_ok: false}});
  });
  await page.goto("/");
  const warning = page.getByRole("alert");
  await expect(warning).toContainText("Assetto Corsa folder not found");
  await expect(page.getByRole("dialog", {name: "Settings"})).toBeHidden();
  await expect(page.locator("#go")).toBeDisabled();
  await warning.getByRole("button", {name: "Choose folder"}).click();
  await expect(page.getByRole("dialog", {name: "Settings"})).toBeVisible();
  await expect(page.locator("#ac-status")).toContainText("No Assetto Corsa folder there");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("#go")).toBeDisabled();
});
