// The Editor's draft: kept by itself, over a new build, in two tabs, when a save fails; where its keys count.
import {expect, openEditor, test} from "./fixtures";
import {NEAR_TREE, deleteTree, findTree, picture, saved, stored} from "./edit-helpers";

test("built again, older changes stay but are not applied, and nothing is mixed with them", async ({page, backend}) => {
  await openEditor(page);
  const before = await picture(page);
  await deleteTree(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test"});
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-outdated")).toContainText("1 older change not applied");
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await expect(page.locator("#edit-click-deletes")).toBeDisabled();
  expect((await stored(page)).outdated).toBe(1);
  await page.getByRole("tab", {name: "Details", exact: true}).click();
  await page.getByRole("button", {name: "Give up"}).click();
  await expect(page.locator("#edit-outdated")).toHaveCount(0);
  await saved(page);
  expect((await stored(page)).outdated).toBe(0);
  const next = await findTree(page);
  await page.mouse.click(next.x, next.y);
  await expect(page.locator("#edit-click-deletes")).toBeEnabled();
});

test("built again under an open view: nothing is saved for a track not shown; reading again brings the new build", async ({page, backend}) => {
  await openEditor(page);
  const at = await findTree(page);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test"});
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-stuck")).toContainText("changed elsewhere");
  expect((await stored(page)).deleted).toEqual([]);
  const asked = page.waitForRequest("**/api/editor/alpha/index");
  await page.getByRole("tab", {name: "Details", exact: true}).click();
  await page.getByRole("button", {name: "Read again"}).click();
  await asked;                                  // (the view loads the new build too)
  await expect(page.locator("#edit-stuck")).toHaveCount(0);
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const next = await findTree(page);
  await page.mouse.click(next.x, next.y);
  await page.keyboard.press("Delete");
  await saved(page);
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([NEAR_TREE]);
});

test("two tabs: the second one's save is refused instead of overwriting the first's, reading again shows both", async ({page, context}) => {
  await openEditor(page);
  const other = await context.newPage();
  await openEditor(other);
  await page.bringToFront();                    // (a tab behind draws nothing and gets no keys)
  await deleteTree(page);
  await other.bringToFront();
  const at = await findTree(other);
  await other.mouse.click(at.x, at.y);
  await other.keyboard.press("Delete");
  await expect(other.locator("#edit-stuck")).toContainText("changed elsewhere");
  await expect(other.locator("#edit-click-deletes")).toBeDisabled();
  await other.getByRole("tab", {name: "Details", exact: true}).click();
  await other.getByRole("button", {name: "Read again"}).click();
  await expect(other.locator("#edit-stuck")).toHaveCount(0);
  await expect(other.locator("#edit-count")).toHaveText("1 object deleted");
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([NEAR_TREE]);
  await other.close();
});

test("a failed save says so and goes through by itself", async ({page, faultsAllowed}) => {
  faultsAllowed.on = true;
  await openEditor(page);
  let failing = true;
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() === "PUT" && failing) await route.fulfill({status: 500, json: {error: "disk full"}});
    else await route.continue();
  });
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-kept")).toContainText("Changes not kept: trying again");
  failing = false;
  await expect(page.locator("#edit-bar")).toHaveAttribute("data-kept", "saved", {timeout: 10000});     // (edits.ts: RETRY_MS)
  expect((await stored(page)).deleted.map(d => d.id)).toEqual([NEAR_TREE]);
});

test("leaving the track right after a change still saves it", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await page.locator("#edit-track").selectOption("beta");
  await expect.poll(async () => (await stored(page)).deleted.length).toBe(1);
});

test("the keys count only in the view: Delete in the settings' fields or the dropdown deletes nothing", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-track").focus();
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-count")).toHaveCount(0);
});
