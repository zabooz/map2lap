// Building and My tracks: progress, stop, result, error, Play, rebuild, copy, delete.
import {button, card, clickMap, expect, test} from "./fixtures";

async function route(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await page.getByLabel("Track name").fill(name);
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(page.locator("#go")).toBeEnabled();
}

test("a build shows its progress and ends with Play", async ({page, backend}) => {
  await route(page, "Fresh one");
  await page.locator("#go").click();
  await expect(card(page)).toContainText("Building");
  await expect(page.locator("#go")).toHaveText("Stop build");
  await expect(page.locator("#log")).toContainText("step");
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");
  await expect(card(page)).toContainText("Done");
  await card(page).getByRole("button", {name: "▶ Play"}).click();
  await expect.poll(backend.calls).toContainEqual(["play", "fresh_one"]);
  await expect(page.locator("#t-mine")).toContainText("4");
});

test("a build stopped", async ({page}) => {
  await route(page, "Stopped one");
  await page.locator("#go").click();
  await expect(page.locator("#go")).toHaveText("Stop build");
  await page.locator("#go").click();
  await expect(card(page)).toContainText("Build stopped");
  await expect(page.locator("#go")).toHaveText("Build track");
});

test("a failed build says so, a new selection takes the card back", async ({page}) => {
  await route(page, "Will fail");
  await page.locator("#go").click();
  await expect(card(page)).toContainText("exit code 1");
  await expect(card(page)).toContainText("Details in the log below.");
  await clickMap(page, 0.7, 0.3);
  await expect(card(page)).toContainText("2.00 km");
});

test("My tracks: the list, a picked track on the card, its code, old ones marked", async ({page}) => {
  await page.goto("/");
  await expect(page.locator("#t-mine")).toContainText("3");
  await page.locator("#t-mine").click();
  const list = page.locator("#pane-mine").getByRole("button");
  await expect(list).toHaveCount(3);
  await expect(card(page)).toContainText("Pick a track");
  await expect(list.filter({hasText: "Gamma Old"})).toContainText("old");
  await list.filter({hasText: "Alpha Test"}).click();
  await expect(card(page)).toContainText("Alpha Test");
  await expect(card(page)).toContainText("up to date");
  await expect(card(page).getByRole("textbox", {name: "Track code"})).toHaveValue(/^M2L1-/);
  await list.filter({hasText: "Gamma Old"}).click();
  await expect(card(page)).toContainText("Old version");
});

test("My tracks: rebuild, copy, Play and delete", async ({page, backend}) => {
  await page.goto("/");
  await page.locator("#t-mine").click();
  const list = page.locator("#pane-mine").getByRole("button");
  await expect(button(page, "Rebuild")).toBeDisabled();
  await list.filter({hasText: "Beta Test"}).click();

  await page.locator("#actions").getByRole("button", {name: "▶ Play"}).click();
  await expect.poll(backend.calls).toContainEqual(["play", "beta"]);

  await button(page, "Rebuild").click();
  await expect.poll(backend.calls).toContainEqual(["build", "beta", "Beta Test"]);
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");

  await button(page, "Build as copy").click();
  await expect.poll(backend.calls).toContainEqual(["build", "beta_2", "Beta Test (2)"]);
  await expect(list).toHaveCount(4);
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");

  await list.filter({hasText: "Beta Test (2)"}).click();
  await card(page).getByRole("button", {name: "Delete track"}).click();
  await expect(list).toHaveCount(3);
  await expect(list.filter({hasText: "Beta Test (2)"})).toHaveCount(0);
});

test("Settings' first: building without an Assetto Corsa folder opens them", async ({page}) => {
  await route(page, "No folder");
  await page.request.post("/api/settings", {data: {ac_path: ""}});
  await page.route("**/api/build", r => r.fulfill({status: 400, json: {error: "Assetto Corsa folder not found: set it in Settings"}}));
  await page.locator("#go").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(card(page)).toContainText("folder not found");
});
