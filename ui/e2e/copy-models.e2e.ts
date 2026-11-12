import {execFileSync} from "node:child_process";
import {join} from "node:path";
import * as THREE from "three";
import {centre, expect, openEditor, scene, test, type Backend} from "./fixtures";
import {findTitled, findTree, picture, saved, saveTrack} from "./edit-helpers";
import type {Page} from "@playwright/test";

/** A small track combining a generated tree (house: and a house, whose copies are meshes: a tree's are TreeFX trees) and one
    imported model, the layout of a large edited track. */
async function withModel(page: Page, backend: Backend, house = false) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", tree_height: 6, house});
  await openEditor(page);
  const repo = join(import.meta.dirname, "../..");
  const glb = execFileSync(join(repo, ".venv/Scripts/python.exe"), [join(repo, "ui/e2e/model_fixture.py")]);
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await page.getByLabel("Model file").setInputFiles({name: "copy-tree.glb", mimeType: "model/gltf-binary", buffer: glb});
  await page.getByLabel("Model name").fill("Copy tree");
  await page.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(page.getByLabel("Model preview")).toBeVisible();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}});
  await saved(page);
  await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances)).toBe(1);
  await page.keyboard.press("Escape");
}

const draft = async (page: Page) => (await page.request.get("/api/editor/alpha/edits")).json();

async function pickModel(page: Page) {
  const data = await (await page.request.get("/api/editor/alpha/index")).json();
  const bounds = (await scene(page).boundingBox())!, m = data.models[0];
  const camera = new THREE.PerspectiveCamera(55, bounds.width / bounds.height, .5, 10000), start = new THREE.Vector3(...data.start.pos);
  camera.position.copy(start).addScaledVector(new THREE.Vector3(...data.start.forward).normalize(), -45).add(new THREE.Vector3(0, 22, 0));
  camera.lookAt(start); camera.updateMatrixWorld();
  const p = new THREE.Vector3(.72, 4.05, .01).applyMatrix4(new THREE.Matrix4().fromArray(data.model_matrices[m.id])).project(camera);
  await page.mouse.click(bounds.x + (p.x + 1) * bounds.width / 2, bounds.y + (1 - p.y) * bounds.height / 2);
  await expect(page.locator("#edit-picked")).toContainText("Copy tree");
}

test("model Insert, Move, Undo and Redo do not download unchanged copy meshes", async ({page, backend}) => {
  await withModel(page, backend, true);
  const house = await findTitled(page, "Building"); await page.mouse.click(house.x, house.y); await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const copied = page.waitForResponse(r => r.url().includes("&c=") && r.ok());
  const c = await centre(scene(page)); await page.mouse.click(c.x - 250, c.y + 150);     // (left of the model: a house is large)
  await page.keyboard.press("Escape"); await saved(page); await (await copied).finished(); await picture(page);
  const before = await (await page.request.get("/api/editor/alpha/index")).json();
  const urls: string[] = [];
  page.on("request", r => { if (/\/mesh\/\d+\?/.test(r.url())) urls.push(r.url()); });
  const instances = () => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances);
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 400, y: 450}}); await saved(page);
  await expect.poll(instances).toBe(2); await page.keyboard.press("Escape"); await picture(page);
  expect(urls).toEqual([]);
  for (const [action, count] of [["Undo", 1], ["Redo", 2]] as const) {
    await page.getByRole("button", {name: new RegExp(action)}).click(); await saved(page);
    await expect.poll(instances).toBe(count); await picture(page);
  }
  await pickModel(page); await page.locator("#edit-move").click();
  await page.locator("#edit-move-set").getByLabel("Raise").fill("150"); await saved(page); await picture(page);
  for (const action of ["Undo", "Redo"]) {
    await page.getByRole("button", {name: new RegExp(action)}).click(); await saved(page); await picture(page);
  }
  expect(urls).toEqual([]);
  const after = await (await page.request.get("/api/editor/alpha/index")).json();
  expect(after.copy_revision).toBe(before.copy_revision);
  expect(after.meshes.filter((m: {copy?: boolean}) => m.copy)).toEqual(before.meshes.filter((m: {copy?: boolean}) => m.copy));
});

test("a late copied house cannot flash into view after Revert while the model layout is changing", async ({page, backend}) => {
  await withModel(page, backend, true);
  await saveTrack(page);
  const baseline = await picture(page);
  let releaseCopy!: () => void, releaseRevert!: () => void, gotCopy!: () => void, gotRevert!: () => void, copied!: () => void;
  const copyGate = new Promise<void>(ok => { releaseCopy = ok; }), revertGate = new Promise<void>(ok => { releaseRevert = ok; });
  const copyHeld = new Promise<void>(ok => { gotCopy = ok; }), revertHeld = new Promise<void>(ok => { gotRevert = ok; });
  const copyReleased = new Promise<void>(ok => { copied = ok; });
  let held = false;
  await page.route("**/mesh/*?*", async route => {
    if (held || !route.request().url().includes("&c=")) return route.continue();
    held = true;
    const response = await route.fetch(); gotCopy();
    await copyGate;
    await route.fulfill({response}).catch(() => {}); // The newer layout cancels the old consumer.
    copied();
  });
  try {
    const house = await findTitled(page, "Building"); await page.mouse.click(house.x, house.y); await page.keyboard.press("c");
    await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
    const c = await centre(scene(page)); await page.mouse.click(c.x + 130, c.y + 100);
    await copyHeld; await page.keyboard.press("Escape");
    await pickModel(page); await page.keyboard.press("c");
    await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
    await page.mouse.click(c.x + 230, c.y + 100); await page.keyboard.press("Escape");
    await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances)).toBe(2);
    const beforeRevert = await picture(page);
    await page.route("**/edits", async route => {
      if (route.request().method() === "PUT" && route.request().postDataJSON().copies?.length === 0) { gotRevert(); await revertGate; }
      await route.continue();
    });
    await page.getByRole("button", {name: "Revert to saved", exact: true}).click(); await revertHeld;
    releaseCopy(); await copyReleased;
    await page.evaluate(() => new Promise(ok => requestAnimationFrame(() => requestAnimationFrame(ok))));
    expect((await picture(page)).equals(beforeRevert)).toBe(true);
    releaseRevert(); await saved(page);
    await expect.poll(async () => (await picture(page)).equals(baseline)).toBe(true);
  } finally { releaseCopy(); releaseRevert(); }
});

test("generated copies stay visible alongside imported models through Save, Revert, Undo and reload", async ({page, backend}) => {
  await withModel(page, backend, true);
  await saveTrack(page);
  const before = await picture(page);
  for (let attempt = 0; attempt < 2; attempt++) {
    const house = await findTitled(page, "Building");
    await page.mouse.click(house.x, house.y);
    await page.keyboard.press("c");
    await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
    const c = await centre(scene(page));
    await page.mouse.click(c.x + 130, c.y + 100);
    await page.keyboard.press("Escape");
    await saved(page);
    await expect.poll(async () => (await draft(page)).copies.length).toBe(1);
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
    await page.getByRole("button", {name: "Revert to saved", exact: true}).click();
    await saved(page);
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  }
  await page.getByRole("button", {name: /Undo/}).click();
  await saved(page);
  await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
  await saveTrack(page, false);
  const kept = await picture(page);
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  await expect.poll(async () => (await picture(page)).equals(kept)).toBe(true);
});

test("a failed draft write drops a tree copy, and reload keeps the saved instances", async ({page, backend}) => {
  await withModel(page, backend);
  const tree = await findTree(page); await page.mouse.click(tree.x, tree.y);
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const before = await picture(page);
  let release!: () => void;
  const blocked = new Promise<void>(ok => { release = ok; });
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() !== "PUT") return route.continue();
    await blocked;
    await route.fulfill({status: 400, contentType: "application/json", body: JSON.stringify({error: "Draft copy refused"})});
  });
  try {
    const c = await centre(scene(page)); await page.mouse.click(c.x + 130, c.y + 100);
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
    release();
    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await expect(page.locator("#edit-copy-failed")).toContainText("Draft copy refused");
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
    expect((await draft(page)).copies).toHaveLength(0);
    await page.reload();
    await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  } finally { release(); }
});

for (const imported of [false, true]) test(`Copy shows a solid ${imported ? "imported model" : "tree"} before its request finishes, and removes a refused preview after Escape`, async ({page, backend}) => {
  await withModel(page, backend);
  if (imported) {
    await pickModel(page);
  } else {
    const tree = await findTree(page); await page.mouse.click(tree.x, tree.y);
  }
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  const before = await picture(page);
  let release!: () => void;
  const blocked = new Promise<void>(ok => { release = ok; });
  await page.route("**/api/editor/alpha/copy", async route => {
    await blocked;
    await route.fulfill({status: 400, contentType: "application/json", body: JSON.stringify({error: "Copy was refused for this test"})});
  });
  try {
    const c = await centre(scene(page));
    await page.mouse.click(c.x + 130, c.y + 100);
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(false);
    release();
    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await expect(page.locator("#edit-copy-failed")).toContainText("Copy was refused for this test");
    await expect.poll(async () => (await picture(page)).equals(before)).toBe(true);
  } finally { release(); }
});
