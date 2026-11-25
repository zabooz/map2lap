// The page's frame: tabs, the settings popup, what stays over a reload, low windows.
import {card, centre, expect, test} from "./fixtures";

test("the left navigation stacks three named icons and marks the current workspace", async ({page}) => {
  await page.emulateMedia({reducedMotion: "no-preference"});
  await page.goto("/");
  const nav = page.getByTestId("workspace-nav");
  await expect(nav).toHaveAccessibleName("Workspaces");
  const destinations = [
    ["nav-new-track", "New track"], ["nav-my-tracks", "My tracks"], ["nav-editor", "Editor"],
  ] as const;
  const boxes = [];
  for (const [id, name] of destinations) {
    const button = nav.getByTestId(id);
    await expect(button).toHaveAccessibleName(name);
    const icon = button.getByTestId("icon");
    await expect(icon).toBeVisible();
    expect((await icon.boundingBox())!.width).toBeGreaterThanOrEqual(26);
    boxes.push((await button.boundingBox())!);
  }
  const field = (await page.getByTestId("track-name").boundingBox())!;
  const logo = (await nav.getByTestId("nav-logo").boundingBox())!;
  expect(boxes[0].y - (logo.y + logo.height)).toBeGreaterThanOrEqual(36);
  for (const [i, box] of boxes.entries()) {
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(48);
    expect(box.x + box.width).toBeLessThanOrEqual(field.x);
    expect(box.x).toBe(boxes[0].x);
    if (i) expect(box.y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
  }
  await expect(nav.getByTestId("nav-new-track")).toHaveAttribute("aria-current", "page");
  const gear = nav.getByTestId("nav-settings");
  await expect(gear).toHaveAccessibleName("Settings");
  await expect(gear).toBeInViewport({ratio: 1});
  const gearBox = (await gear.boundingBox())!;
  const rail = (await nav.boundingBox())!;
  expect(rail.y + rail.height - gearBox.y - gearBox.height).toBeLessThan(gearBox.height);
  await nav.getByTestId("nav-my-tracks").press("Enter");
  await expect(nav.getByTestId("nav-my-tracks")).toHaveAttribute("aria-current", "page");
  await expect(nav.getByTestId("nav-new-track")).not.toHaveAttribute("aria-current", "page");
  const indicator = nav.getByTestId("nav-indicator");
  await expect(indicator).not.toHaveCSS("transition-duration", "0s");
  await expect.poll(async () => (await centre(indicator)).y).toBe(boxes[1].y + boxes[1].height / 2);
  await page.emulateMedia({reducedMotion: "reduce"});
  await expect(indicator).toHaveCSS("transition-duration", "0s");
  await nav.getByTestId("nav-new-track").click();
  expect((await centre(indicator)).y).toBe(boxes[0].y + boxes[0].height / 2);
});

test("the settings open as a popup and close by its x, Esc and beside it", async ({page}) => {
  await page.goto("/");
  const dialog = page.getByTestId("settings-dialog");
  await expect(dialog).toBeHidden();
  await page.getByTestId("nav-settings").click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveRole("dialog");
  await expect(dialog).toHaveAccessibleName("Settings");
  await dialog.getByTestId("settings-close").click();
  await expect(dialog).toBeHidden();
  await page.getByTestId("nav-settings").click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByTestId("nav-settings").click();
  await page.getByTestId("settings-backdrop").click({position: {x: 2, y: 2}});
  await expect(dialog).toBeHidden();
  await page.getByTestId("nav-settings").click();
  await dialog.getByTestId("settings-report-bug").click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("new-report")).toBeVisible();
});

test("a reload stays on its tab", async ({page}) => {
  await page.goto("/");
  await page.getByTestId("nav-my-tracks").click();
  await page.reload();
  await expect(page.getByTestId("my-tracks-list")).toBeVisible();
  await page.getByTestId("nav-new-track").click();
  await page.reload();
  await expect(page.getByTestId("my-tracks-list")).toBeHidden();
  await expect(page.getByTestId("track-name")).toBeVisible();
});

test("a broken stored tab starts on New track", async ({page}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("map2lap.tab", "nonsense"));
  await page.reload();
  await expect(page.getByTestId("track-name")).toBeVisible();
});

const result = {name: "alpha", kn5_bytes: 1500000, seconds: 37, tiles: 2, area_m: null, length_m: 250};
const log = Array.from({length: 60}, (_, k) => `line ${k}`);
const STATES = {
  running: {status: {state: "running", log, elapsed: 12, started: 1, progress: {phase: "scenery", done: 3, total: 6, step: 3, steps: 7}},
            id: "build-progress-note", text: "3 / 6 parts"},
  done: {status: {state: "done", log, elapsed: 37, started: 1, result}, id: "play-track", text: "▶ Play"},
  error: {status: {state: "error", log, elapsed: 5, started: 1, error: "The build failed for a long reason to say here"},
          id: "build-error-hint", text: "See the Build log."},
};

// A low window: here a place does matter. What it takes to go on must stay on the screen, whole (it used to be squeezed away).
for (const [name, {status, id, text}] of Object.entries(STATES)) {
  test(`a low window, ${name}: the card's content, the button and the log stay usable`, async ({page}) => {
    await page.setViewportSize({width: 1500, height: 560});
    await page.route("**/api/status", r => r.fulfill({json: status}));
    await page.goto("/");
    const buildLog = page.getByTestId("track-details").getByTestId("build-log");
    await expect(page.getByTestId("build-action")).toBeInViewport({ratio: 1});
    await expect(buildLog).toBeInViewport();
    await expect(buildLog).toContainText("line 59");
    const item = card(page).getByTestId(id);
    await expect(item).toHaveText(text);
    await expect(item).toBeInViewport({ratio: 1});
    if (name === "running") {
      await page.route("**/api/status", r => r.fulfill({json: {...status,
        progress: {phase: "ai_line", done: 0, total: 0, step: 6, steps: 7}}}));
      const phase = card(page).getByTestId("build-phase");
      await expect(phase).toHaveText("Generating AI line …step 6 of 7");
      await expect(phase).toBeInViewport({ratio: 1});
    }
  });
}

test("a low window's form reaches its end by scrolling", async ({page}) => {
  await page.goto("/");
  await page.setViewportSize({width: 1500, height: 560});
  const corridor = page.getByTestId("build-corridor");
  await corridor.scrollIntoViewIfNeeded();
  await expect(corridor).toBeInViewport({ratio: 1});
  await corridor.fill("200");
  const value = page.getByTestId("build-corridor-value");
  await expect(value).toBeVisible();
  await expect(value).toHaveText("±200 m");
});
