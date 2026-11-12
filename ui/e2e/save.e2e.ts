// Save in the Editor: in its place or as a new track, Play, what stands under Edited in My tracks.
import {button, card, expect, openEditor, scene, test} from "./fixtures";
import {deleteTree, findTree, picture, saveTrack, saved, stored, treeCount} from "./edit-helpers";

test("File keeps save status and Undo, without a Revert action", async ({page}) => {
  await openEditor(page);
  await expect(page.getByRole("button", {name: "Revert to saved", exact: true})).toHaveCount(0);
  const status = page.locator("#edit-status").locator("..");
  await expect(status.locator("#edit-saved")).toHaveCount(1);
  await deleteTree(page); await saved(page);
  await expect(status.locator("#edit-saved")).toHaveText("Not saved");
  await page.getByRole("button", {name: /Undo/}).click(); await saved(page);
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await page.getByRole("button", {name: /Redo/}).click(); await saved(page);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
});

test("Delete track in the Save popup asks first, then the open track is gone from Assetto Corsa and the Editor's list", async ({page}) => {
  await openEditor(page);
  const file = page.locator("#editor section").filter({has: page.getByRole("heading", {name: "File", exact: true})});
  await expect(file.getByRole("button", {name: "Delete track", exact: true})).toHaveCount(0);
  await page.locator("#edit-save-more").click();
  const popup = page.locator("#save-dialog");
  const remove = popup.getByRole("button", {name: "Delete track", exact: true});
  await expect(popup.getByRole("button")).toHaveText(["Delete track", "Cancel", "Overwrite", "Save as new track"]);
  const copy = popup.getByRole("button", {name: "Save as new track", exact: true});
  expect(await copy.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(
    await popup.getByRole("button", {name: "Overwrite", exact: true}).evaluate(el => getComputedStyle(el).backgroundColor));
  page.removeAllListeners("dialog");
  const asked = page.waitForEvent("dialog");
  const firstClick = remove.click();
  const question = await asked;
  expect(question.type()).toBe("confirm");
  expect(question.message()).toContain("cannot be undone");
  await question.dismiss();
  await firstClick;
  await expect(page.locator('#edit-track option[value="alpha"]')).toHaveCount(1);
  page.once("dialog", d => void d.accept());
  await remove.click();
  await expect(page.locator('#edit-track option[value="alpha"]')).toHaveCount(0);
});

test("Save: asked once, then written at once; the trees AC gets are without the tree, the work stays shown; Play saves first", async ({page}) => {
  await openEditor(page);
  const trees = (await treeCount(page));
  await expect(page.locator("#edit-saved")).toHaveText("");      // (nothing changed: nothing to say)
  await expect(page.locator("#edit-save")).toBeDisabled();       // (nothing to save)
  await deleteTree(page);
  const preview = await picture(page);
  await expect(page.locator("#edit-kept")).toHaveCount(0);       // (the changes kept in the background: nothing to see)
  await page.locator("#edit-save").click();     // (the first time: asked)
  await expect(page.locator("#save-name")).toHaveValue("Alpha Test");
  await page.locator("#save-dialog").getByRole("button", {name: "Overwrite"}).click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect(page.locator("#edit-save")).toBeDisabled();       // (saved: nothing more to save)
  expect((await treeCount(page))).toBe(trees - 1);
  expect((await picture(page)).equals(preview)).toBe(true);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");

  await page.reload();                          // (back from AC: the work as left)
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect.poll(async () => (await picture(page)).equals(preview)).toBe(true);
  // A restored source tree is saved by Play after reopening an unsaved draft.
  const draft = await stored(page);
  const restored = await page.request.put("/api/editor/alpha/edits", {data: {...draft, id: "unsaved-restore", deleted: []}});
  await expect(restored).toBeOK();
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-saved")).toHaveText("Not saved");
  await page.locator("#edit-play").click();     // (Play: saved first, at once now, then AC)
  await expect(page.locator("#save-dialog")).toBeHidden();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect((await treeCount(page))).toBe(trees);
  await expect.poll(async () => (await (await page.request.get("/__test/calls")).json()) as unknown[][]).toContainEqual(["play", "alpha"]);
  await scene(page).focus();
  await deleteTree(page);
  await page.keyboard.press("Control+s");       // (Ctrl+S: Save)
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect((await treeCount(page))).toBe(trees - 1);
});

test("Save as new track: only under a new name, shown with the work and its undo, its name in the track field; the track itself as it was", async ({page}) => {
  await openEditor(page);
  const whole = await picture(page);
  const trees = (await treeCount(page));
  await deleteTree(page);
  const preview = await picture(page);
  await page.locator("#edit-play").click();     // (never saved: Play asks first, Cancel starts nothing)
  await expect(page.locator("#save-dialog")).toBeVisible();
  await page.locator("#save-dialog").getByRole("button", {name: "Cancel"}).click();
  expect((await (await page.request.get("/__test/calls")).json()) as unknown[][]).not.toContainEqual(["play", "alpha"]);
  await page.locator("#edit-save-more").click();
  await expect(page.locator("#save-name")).toHaveValue("Alpha Test");
  const go = page.locator("#save-dialog").getByRole("button", {name: "Save as new track"});
  const overwrite = page.locator("#save-dialog").getByRole("button", {name: "Overwrite"});
  await expect(page.locator("#save-taken")).toContainText("makes “Alpha Test (copy)”");
  await expect(overwrite).toBeEnabled();
  await page.locator("#save-name").fill("Beta Test");
  await expect(page.locator("#save-taken")).toContainText("Another track is called “Beta Test”");
  await expect(go).toBeDisabled();
  await expect(overwrite).toBeDisabled();         // (another name: a new track only)
  await page.locator("#save-name").fill("Alpha Edit");
  await expect(go).toBeEnabled();
  await go.click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_edit");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect.poll(async () => (await picture(page)).equals(preview)).toBe(true);
  expect((await treeCount(page, "alpha_edit"))).toBe(trees - 1);
  expect((await treeCount(page))).toBe(trees);
  await scene(page).focus();
  await page.keyboard.press("Control+z");       // (undo came along)
  await expect.poll(async () => (await picture(page)).equals(whole)).toBe(true);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await expect(page.locator("#edit-saved")).toHaveText("");
  await page.locator("#edit-save-more").click();    // (Cancel writes nothing)
  await page.locator("#save-dialog").getByRole("button", {name: "Cancel"}).click();
  await expect(page.locator("#save-dialog")).toBeHidden();
  await expect(page.locator('#edit-track option[value="alpha_edit_2"]')).toHaveCount(0);
});

test("the first Save and a subsequent copy retain the saved edits", async ({page}) => {
  await openEditor(page);
  const trees = (await treeCount(page));
  await deleteTree(page);
  await page.locator("#edit-save").click();
  await page.locator("#save-name").fill("Alpha Edit");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_edit");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  expect((await treeCount(page, "alpha_edit"))).toBe(trees - 1);
  expect((await treeCount(page))).toBe(trees);

  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await deleteTree(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await page.locator("#edit-save-more").click();
  await page.locator("#save-name").fill("Alpha Saved Copy");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track"}).click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha_saved_copy");
  expect((await treeCount(page, "alpha_saved_copy"))).toBe(trees - 1);
  expect((await treeCount(page))).toBe(trees - 1);
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
});

test("a new track under a name another tab took meanwhile, or none: the server refuses it too", async ({page}) => {
  await openEditor(page);
  const {revision} = await stored(page);
  for (const title of ["Beta Test", "Alpha Test", " "]) {
    const r = await page.request.post("/api/editor/alpha/save", {data: {copy: true, title, revision}});
    expect(r.status()).toBe(409);
  }
  await expect(page.locator('#edit-track option[value="beta_test"]')).toHaveCount(0);
  const r = await page.request.post("/api/editor/alpha/save", {data: {copy: true, title: "Alpha New", revision}});
  expect(((await r.json()) as {name: string}).name).toBe("alpha_new");
});

test("the name left as it is, a new track gets its (copy) by itself", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  await page.locator("#edit-save").click();
  await page.locator("#save-name").press("Enter");
  await expect(page.locator("#edit-track")).toHaveValue("alpha_test_copy");
  await expect(page.locator("#edit-track option:checked")).toHaveText(/Alpha Test \(copy\)/);
  await page.locator("#t-mine").click();
  const list = page.locator("#pane-mine button");
  await expect(list.filter({hasText: "Alpha Test"})).toHaveText([/^Alpha Test(?! \(copy\))/]);     // (the original is still a build)
  await button(page, "Edited").click();
  await list.filter({hasText: "Alpha Test (copy)"}).click();
  await card(page).getByRole("button", {name: "Delete track"}).click();
  await expect(list).toHaveCount(0);
  await expect(card(page)).toContainText("No edited tracks yet");
});

test("nothing changed: Play starts the track at once, nothing asked", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-play").click();
  await expect(page.locator("#save-dialog")).toBeHidden();
  await expect.poll(async () => (await (await page.request.get("/__test/calls")).json()) as unknown[][]).toContainEqual(["play", "alpha"]);
});

test("Play starts Assetto Corsa at the hour the Editor's clock shows", async ({page}) => {
  await openEditor(page);
  await page.getByRole("complementary", {name: "Inspector"}).getByRole("tab", {name: "Properties", exact: true}).click();
  await page.locator("#sun-clock").getByRole("slider", {name: "Time of day"}).fill("1110");
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  expect((await started).postDataJSON()).toEqual({name: "alpha", clock: 18.5,
    weather: {kind: "dry", intensity: "light", windDirection: -1, windSpeed: 0, fog: false, windscreenSnow: true, season: "summer"}});
});

test("while the track is written nothing changes: Saved means what was written, and undo works afterwards", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  let write = () => {};
  const held = new Promise<void>(ok => { write = ok; });
  await page.route("**/api/editor/alpha/save", async route => {
    await held;
    await route.continue();
  });
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText("Saving …");
  await page.keyboard.press("Control+z");       // (the view has the keys again after the dialog)
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  write();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await expect(page.locator("#edit-saved")).toHaveText("Not saved");
});

test("in the dialog's name field the keys are the field's: Delete and Ctrl+Z leave the track alone", async ({page}) => {
  await openEditor(page);
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.locator("#edit-save-more").click();
  await expect(page.locator("#save-name")).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("Delete");
  await expect(page.locator("#save-name")).toHaveValue("lpha Test");
  await expect(page.locator("#edit-count")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Delete");          // (the view has the keys again: the tree still picked)
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  await saved(page);
  await page.locator("#edit-save-more").click();
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
});

test("a change that can't be kept: Save says so and writes nothing", async ({page, faultsAllowed}) => {
  faultsAllowed.on = true;
  await openEditor(page);
  const trees = (await treeCount(page));
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() === "PUT") await route.fulfill({status: 500, json: {error: "disk full"}});
    else await route.continue();
  });
  const at = await findTree(page);
  await page.mouse.click(at.x, at.y);
  await page.keyboard.press("Delete");
  await expect(page.locator("#edit-kept")).toContainText("Changes not kept: trying again");
  await saveTrack(page);
  await expect(page.locator("#edit-made")).toContainText("could not be kept");
  expect((await treeCount(page))).toBe(trees);
});

test("a track saved in the Editor stands under Edited: it opens and can be copied, no build replaces it", async ({page, backend}) => {
  await openEditor(page);
  await deleteTree(page);
  await saveTrack(page);
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved \d/);
  await expect(page.locator('#edit-track optgroup[label="Edited"] option')).toHaveText(["Alpha Test"]);
  await Promise.all([page.waitForResponse("**/api/tracks"), page.locator("#t-mine").click()]);
  const alpha = page.locator("#pane-mine button", {hasText: "Alpha Test"});
  await expect(alpha).toHaveCount(0);
  await button(page, "Edited").click();
  await alpha.click();
  await expect(card(page)).toContainText("then edited");
  await expect(card(page).getByRole("textbox", {name: "Track code"})).toHaveCount(0);     // (a code builds the track without its edits)
  await expect(card(page).getByRole("button", {name: "Delete track"})).toBeVisible();
  await expect(page.locator("#go")).toHaveText("Edit");
  for (const data of [{name: "alpha"}, {name: "alpha", drop_edits: true}]) {     // (nor by asking the server)
    expect((await page.request.post("/api/rebuild", {data})).status()).toBe(409);
  }
  const same = await page.request.post("/api/build", {data: {name: "alpha", title: "Alpha", points: [[42.9, 9.36], [42.902, 9.36]], width: 100}});
  expect(same.status()).toBe(409);              // (a new track of the same name doesn't replace it)
  expect(((await same.json()) as {error: string}).error).toContain("choose another name");
  await page.locator("#go").click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);

  await page.locator("#t-mine").click();
  await alpha.click();
  await button(page, "Build as copy").click();
  await expect.poll(backend.calls).toContainEqual(["build", "alpha_2", "Alpha Test (2)"]);
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");
  await expect(page.locator("#pane-mine button", {hasText: "Alpha Test (2)"})).toBeVisible();      // (a build: under Built)
  await expect(page.locator("#go")).toHaveText("Rebuild");
});

test("a track with unsaved changes stays under Built, and warns before a build", async ({page}) => {
  await openEditor(page, "beta");
  await deleteTree(page);
  const asked: string[] = [];
  page.removeAllListeners("dialog");
  page.on("dialog", d => { asked.push(d.message()); void d.dismiss(); });
  await Promise.all([page.waitForResponse("**/api/tracks"), page.locator("#t-mine").click()]);     // (the list with its count of changes)
  await page.locator("#pane-mine button", {hasText: "Beta Test"}).click();
  await page.locator("#go").click();
  await expect.poll(() => asked.length).toBe(1);
  expect(asked[0]).toContain("1 unsaved change");
});
