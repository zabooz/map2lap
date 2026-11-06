// The settings: what is saved reaches the server, storage, updates, the controls.
import {expect, openSettings, test} from "./fixtures";

const saved = async (page: import("@playwright/test").Page) => (await page.request.get("/api/settings")).json();

test("the car is saved", async ({page}) => {
  await page.goto("/");
  await openSettings(page);
  await page.getByLabel("Car").selectOption({label: "Test Car"});
  await expect.poll(async () => (await saved(page)).car).toBe("car_a");
  await page.getByLabel("Car").selectOption("");
  await expect.poll(async () => (await saved(page)).car).toBe(null);
});

test("the Editor's keys and mouse are listed under Editor", async ({page}) => {
  await page.goto("/");
  await openSettings(page, "Editor");
  const keys = page.locator("#editor-keys");
  for (const row of ["W A S D Move over the ground, at the same height", "Right click Its menu: Mark all of its sort, Delete", "Ctrl+Z Undo", "Ctrl+S Save the track"]) {
    await expect(keys.getByRole("row", {name: row, exact: true})).toBeVisible();
  }
});

test("the CPU share is saved when let go, its line follows", async ({page}) => {
  await page.goto("/");
  await openSettings(page, "Map2Lap");
  const slider = page.getByLabel("CPU usage");
  await slider.focus();
  await page.keyboard.press("ArrowLeft");
  const value = Number(await slider.inputValue());
  await expect.poll(async () => (await saved(page)).cores).toBe(value);
  await expect(page.getByRole("dialog")).toContainText(`${value} %`);
  await expect(page.getByRole("dialog")).toContainText(/Up to \d+ of \d+ threads/);
});

test("the map data's limit is saved, Clear asks and clears", async ({page, backend}) => {
  await page.goto("/");
  await openSettings(page, "Map2Lap");
  await page.getByLabel("Map data limit").selectOption("50");
  await expect.poll(async () => (await saved(page)).cache_gb).toBe(50);
  await expect(page.getByRole("dialog")).toContainText("5 MB");
  await page.getByRole("button", {name: "Clear now"}).click();
  await expect.poll(backend.calls).toContainEqual(["map data cleared"]);
});

test("the debug app goes into the AC folder and out again", async ({page}) => {
  await page.goto("/");
  await openSettings(page, "Map2Lap");
  const box = page.getByLabel("Track Debug app in Assetto Corsa");
  await box.check();
  await expect.poll(async () => (await saved(page)).debug_app).toBe(true);
  await box.uncheck();
  await expect.poll(async () => (await saved(page)).debug_app).toBe(false);
});

test("build files: kept by default, the switch is saved, Delete empties them, a note says why they matter", async ({page}) => {
  await page.goto("/");
  await openSettings(page, "Editor");
  const box = page.getByLabel("Keep build files");
  await expect(box).toBeChecked();
  await expect(page.getByRole("dialog")).toContainText("The editing tools, coming step by step, will need");
  await box.uncheck();
  await expect.poll(async () => (await saved(page)).clean).toBe(true);
  await box.check();
  await expect(page.getByRole("dialog")).toContainText(/All build files: [1-9]\d* MB/);
  await page.getByRole("button", {name: "Delete"}).click();
  await expect(page.getByRole("dialog")).toContainText(/All build files: 0 MB/);
  const {tracks} = await (await page.request.get("/api/tracks")).json();
  expect(tracks.map((t: {build_files: boolean}) => t.build_files)).toEqual([false, false, false]);
});

test("the AC folder: a wrong one is refused and the one in use comes back", async ({page}) => {
  await page.goto("/");
  await openSettings(page);
  const field = page.getByLabel("Assetto Corsa folder");
  const before = await field.inputValue();
  await expect(page.locator("#ac-status")).toContainText("Assetto Corsa found");
  await field.fill("C:/no/such/folder");
  await field.press("Enter");
  await expect(page.locator("#ac-status")).toContainText("No Assetto Corsa folder there");
  await expect(page.locator("#ac-status")).toContainText("tracks still go to the folder above");
  await expect(page.getByLabel("Assetto Corsa folder")).toHaveValue(before);
});

test("updates: up to date, then a newer one shows in the head and links its notes", async ({page, backend}) => {
  await page.goto("/");
  await openSettings(page);
  await expect(page.locator("#upd-status")).toContainText("Up to date");
  await backend.post("/__test/release", {version: "99.0.0", url: "https://example.invalid/notes", archive: null});
  await page.getByRole("button", {name: "Check for updates"}).click();
  await expect(page.locator("#upd-status")).toContainText("Map2Lap 99.0.0 is out");
  await expect(page.locator("#upd-status").getByRole("link")).toHaveAttribute("href", "https://example.invalid/notes");
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name: "v99.0.0 available"}).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("the controls' sliders are kept over a reload, Reset brings the defaults", async ({page}) => {
  await page.goto("/");
  await openSettings(page, "Editor");
  const reset = page.getByRole("button", {name: "Reset to defaults"});
  await expect(reset).toBeDisabled();
  for (const label of ["Move (W A S D)", "Turn and tilt (hold the wheel)", "Zoom (wheel)"]) {
    await expect(page.getByLabel(label)).toHaveValue("50");
    await page.getByLabel(label).fill("80");
  }
  await page.getByLabel("Memory limit").fill("16");
  await page.getByLabel("Invert up and down").check();
  await page.reload();
  await openSettings(page, "Editor");
  await expect(page.getByLabel("Move (W A S D)")).toHaveValue("80");
  await expect(page.getByLabel("Memory limit")).toHaveValue("16");
  await expect(page.getByLabel("Invert up and down")).toBeChecked();
  await page.getByRole("button", {name: "Reset to defaults"}).click();
  await expect(page.getByLabel("Move (W A S D)")).toHaveValue("50");
  await expect(page.getByLabel("Memory limit")).toHaveValue("8");
  await expect(page.getByLabel("Invert up and down")).not.toBeChecked();
});

test("broken stored controls give the defaults", async ({page}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("map2lap.controls", "broken{"));
  await page.reload();
  await openSettings(page, "Editor");
  await expect(page.getByLabel("Move (W A S D)")).toHaveValue("50");
});
