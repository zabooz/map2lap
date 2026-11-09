import {execFileSync} from "node:child_process";
import {join} from "node:path";
import {dragMouse, expect, openEditor, scene, test} from "./fixtures";
import {findTree, meshes, picture, saved} from "./edit-helpers";
import * as THREE from "three";

async function sample(page: import("@playwright/test").Page, png: Buffer, points: {x: number; y: number}[]) {
  return page.evaluate(async ({image, points}) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${image}`)).blob());
    const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext("2d")!; context.drawImage(bitmap, 0, 0); bitmap.close();
    return points.map(p => [...context.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data].slice(0, 3));
  }, {image: png.toString("base64"), points});
}

const delta = (a: number[], b: number[]) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));

function project(index: {start: {pos: number[]; forward: number[]}}, bounds: {width: number; height: number}, world: THREE.Vector3) {
  const camera = new THREE.PerspectiveCamera(55, bounds.width / bounds.height, .5, 10000), start = new THREE.Vector3(...index.start.pos);
  camera.position.copy(start).addScaledVector(new THREE.Vector3(...index.start.forward).normalize(), -45).add(new THREE.Vector3(0, 22, 0));
  camera.lookAt(start); camera.updateMatrixWorld();
  const point = world.clone().project(camera);
  return {x: (point.x + 1) * bounds.width / 2, y: (1 - point.y) * bounds.height / 2};
}

test("import a cutout GLB tree, place and replace, pose undo, save and cold reopen", async ({page, backend}, testInfo) => {
  const repo = join(import.meta.dirname, "../..");
  const python = join(repo, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
  const glb = execFileSync(python, [join(repo, "ui/e2e/model_fixture.py")]);
  await openEditor(page);
  const sourceTrees = (await meshes(page))["nocol_trees_0_0"];
  const before = await picture(page);
  await page.getByRole("button", {name: "Models", exact: true}).click();
  await page.getByLabel("Model file").setInputFiles({name: "cutout-tree.glb", mimeType: "model/gltf-binary", buffer: glb});
  await page.getByLabel("Model name").fill("Cutout test tree");
  await page.getByRole("button", {name: "Add to library", exact: true}).click();
  await expect(page.getByLabel("Model preview")).toBeVisible();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}});
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).models?.length).toBe(1);
  const modelResources = () => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail);
  await expect.poll(async () => (await modelResources())?.instances).toBe(1);
  const fresh = await (await page.request.get("/api/editor/alpha/index")).json(), first = fresh.models[0];
  const firstMatrix = new THREE.Matrix4().fromArray(fresh.model_matrices[first.id]);
  const viewport = (await scene(page).boundingBox())!;
  const points = [[.72, 4.05, .01], [-.9, 2.625, .01], [0, .6, 0], [-.972, 4.126, .01]].map(p => project(fresh, viewport, new THREE.Vector3(...p).applyMatrix4(firstMatrix)));
  const shown = await picture(page);
  const basePixels = await sample(page, before, points), shownPixels = await sample(page, shown, points);
  await testInfo.attach("fresh-model-before", {body: before, contentType: "image/png"});
  await testInfo.attach("fresh-model-after", {body: shown, contentType: "image/png"});
  expect(delta(basePixels[0], shownPixels[0])).toBeGreaterThan(15);
  expect(delta(basePixels[1], shownPixels[1])).toBeLessThanOrEqual(1);
  expect(delta(basePixels[2], shownPixels[2])).toBeGreaterThan(15);
  expect(shownPixels[0][1]).toBeGreaterThan(shownPixels[0][0] * 2);
  expect(shownPixels[3][0]).toBeGreaterThan(shownPixels[3][1] * 2);
  await page.getByRole("button", {name: /Undo/}).click();
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).models?.length ?? 0).toBe(0);
  await expect.poll(async () => (await modelResources())?.instances).toBe(0);
  const undone = await sample(page, await picture(page), points);
  expect(undone.map((p, i) => delta(p, basePixels[i]))).toEqual([0, 0, 0, 0]);
  await page.getByRole("button", {name: /Redo/}).click();
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).models?.length).toBe(1);
  await expect.poll(async () => (await modelResources())?.instances).toBe(1);
  const redone = await sample(page, await picture(page), points);
  expect(redone.map((p, i) => delta(p, shownPixels[i]))).toEqual([0, 0, 0, 0]);
  await page.keyboard.press("Escape");
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.getByRole("button", {name: "Models", exact: true}).click();
  await page.getByRole("button", {name: "Cutout test tree", exact: true}).click();
  await page.getByRole("button", {name: "Replace selected tree", exact: true}).click();
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).models?.length).toBe(2);
  await saved(page);
  await expect.poll(async () => (await modelResources())?.instances).toBe(2);
  const shared = (await modelResources()).shared;
  expect(shared).toHaveLength(1); expect(shared[0].geometries).toHaveLength(2); expect(shared[0].textures).toHaveLength(1);
  await page.getByRole("button", {name: /Undo/}).click();
  await expect.poll(async () => (await modelResources())?.instances).toBe(1);
  expect((await modelResources()).shared[0].geometries).toEqual(shared[0].geometries);
  await page.getByRole("button", {name: /Redo/}).click();
  await expect.poll(async () => (await modelResources())?.instances).toBe(2);
  expect((await modelResources()).shared[0].geometries).toEqual(shared[0].geometries);
  const draft = await (await page.request.get("/api/editor/alpha/edits")).json();
  const replacement = draft.models.find((m: {replaces: string | null}) => m.replaces);
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  const bounds = (await scene(page).boundingBox())!;
  const camera = new THREE.PerspectiveCamera(55, bounds.width / bounds.height, .5, 10000);
  const start = new THREE.Vector3(...index.start.pos);
  camera.position.copy(start).addScaledVector(new THREE.Vector3(...index.start.forward).normalize(), -45).add(new THREE.Vector3(0, 22, 0));
  camera.lookAt(start); camera.updateMatrixWorld();
  const point = new THREE.Vector3(...replacement.at).add(new THREE.Vector3(.8, 3.8, .005)).project(camera);
  await page.mouse.click(bounds.x + (point.x + 1) * bounds.width / 2, bounds.y + (1 - point.y) * bounds.height / 2);
  await expect(page.locator("#edit-picked")).toContainText("Cutout test tree");
  await page.locator("#edit-move").click();
  const beforeMove = await picture(page);
  await page.locator("#edit-move-set input").nth(0).fill("35");
  await page.locator("#edit-move-set input").nth(1).fill("150");
  await page.locator("#edit-move-set input").nth(2).fill("140");
  await saved(page);
  const posed = (await (await page.request.get("/api/editor/alpha/edits")).json()).placed.find((p: {id: string}) => p.id === replacement.id + "#0");
  expect(posed).toMatchObject({turn: 35, y: 1.5, scale: 1.4});
  const poseIndex = await (await page.request.get("/api/editor/alpha/index")).json();
  const crownPoint = (matrix: number[]) => project(poseIndex, bounds,
    new THREE.Vector3(.72, 4.05, .01).applyMatrix4(new THREE.Matrix4().fromArray(matrix)));
  const raisedPoint = crownPoint(poseIndex.model_matrices[replacement.id]);
  const raisedBefore = (await sample(page, beforeMove, [raisedPoint]))[0];
  const raisedImage = await picture(page), raisedAfter = (await sample(page, raisedImage, [raisedPoint]))[0];
  expect(delta(raisedBefore, raisedAfter)).toBeGreaterThan(15);
  expect(raisedAfter[1]).toBeGreaterThan(raisedAfter[0] * 2);
  await page.getByRole("button", {name: /Undo/}).click();
  await expect(page.locator("#edit-move-set input").nth(2)).toHaveValue("100");
  await saved(page);
  const raisedUndone = (await sample(page, await picture(page), [raisedPoint]))[0];
  expect(delta(raisedUndone, raisedBefore)).toBeLessThanOrEqual(1);
  await page.getByRole("button", {name: /Redo/}).click();
  await expect(page.locator("#edit-move-set input").nth(2)).toHaveValue("140");
  await saved(page);
  expect((await sample(page, await picture(page), [raisedPoint]))[0]).toEqual(raisedAfter);
  await dragMouse(page, {x: bounds.x + raisedPoint.x, y: bounds.y + raisedPoint.y},
    {x: bounds.x + raisedPoint.x + 65, y: bounds.y + raisedPoint.y + 4});
  await saved(page);
  const draggedPose = (await (await page.request.get("/api/editor/alpha/edits")).json()).placed.find((p: {id: string}) => p.id === replacement.id + "#0");
  expect(Math.hypot(draggedPose.x, draggedPose.z)).toBeGreaterThan(1);
  const draggedIndex = await (await page.request.get("/api/editor/alpha/index")).json();
  const draggedPoint = crownPoint(draggedIndex.model_matrices[replacement.id]);
  const draggedBefore = (await sample(page, raisedImage, [draggedPoint]))[0];
  const draggedAfter = (await sample(page, await picture(page), [draggedPoint]))[0];
  expect(delta(draggedBefore, draggedAfter)).toBeGreaterThan(15);
  expect(draggedAfter[1]).toBeGreaterThan(draggedAfter[0] * 2);
  await page.getByRole("button", {name: /Undo/}).click(); await saved(page);
  expect(delta((await sample(page, await picture(page), [draggedPoint]))[0], draggedBefore)).toBeLessThanOrEqual(1);
  await page.getByRole("button", {name: /Redo/}).click(); await saved(page);
  expect((await sample(page, await picture(page), [draggedPoint]))[0]).toEqual(draggedAfter);
  await scene(page).focus(); await page.keyboard.press("c");
  await expect(page.locator("#edit-copy-set")).toContainText("Click to place");
  await scene(page).click({position: {x: 650, y: 600}});
  await expect.poll(async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).models?.length).toBe(3);
  await expect.poll(async () => (await modelResources())?.instances).toBe(3);
  await page.keyboard.press("Escape"); await saved(page);
  await page.locator("#edit-save-more").click();
  await page.locator("#save-name").fill("Imported model copy");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  await expect(page.locator("#edit-track")).toHaveValue("imported_model_copy");
  const native = await meshes(page, "imported_model_copy");
  expect(Object.keys(native).filter(name => name.includes("m2l_model"))).toHaveLength(6);
  expect(native.nocol_trees_0_0).toBe(sourceTrees - 8);
  await backend.post("/__test/cold-models");
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await (await page.request.get("/api/editor/imported_model_copy/edits")).json()).models?.length).toBe(3);
  const coldIndex = await (await page.request.get("/api/editor/imported_model_copy/index")).json();
  expect(coldIndex.model_replacements).toEqual([]);
  await page.locator("#edit-save-more").click();
  await page.locator("#save-name").fill("Imported cold copy");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  await expect(page.locator("#edit-track")).toHaveValue("imported_cold_copy");
  expect(await meshes(page, "imported_cold_copy")).toEqual(native);
  await picture(page);
  const frame = await page.evaluate(() => (performance.getEntriesByName("map2lap.models.frame").at(-1) as PerformanceMark)?.detail);
  await testInfo.attach("model-workflow-evidence", {body: JSON.stringify({basePixels, shownPixels, undone, redone,
    points, shared: await modelResources(), frame, pose: posed, draggedPose,
    raisedPixels: {before: raisedBefore, after: raisedAfter, undone: raisedUndone}, draggedPixels: {before: draggedBefore, after: draggedAfter},
    nativeMeshes: native, coldReplacements: coldIndex.model_replacements}, null, 2), contentType: "application/json"});
});

test("Discard all and Undo refresh models together with source heights, source poses and ordinary copies", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true});
  await openEditor(page);
  const original = await picture(page);
  const now = await (await page.request.get("/api/editor/alpha/edits")).json();
  const template = await (await page.request.post("/api/editor/alpha/copy", {data: {base: now.base, revision: now.revision, object: "nocol_trees_0_0#0"}})).json();
  const copied = await (await page.request.post("/api/editor/alpha/copy", {data: {base: now.base, revision: now.revision, template: template.template, at: [180, 0, -100]}})).json();
  const nx = 65, nz = 65, mm = Array.from({length: nx * nz}, (_, i) => i % nx && i % nx < nx - 1 && Math.floor(i / nx) && Math.floor(i / nx) < nz - 1 ? 1500 : 0);
  const answer = await page.request.put("/api/editor/alpha/edits", {data: {base: now.base, revision: now.revision, id: "source-state", deleted: [], models: [],
    copies: [copied.copy], heights: [{id: "source-height", x: 64, z: -192, nx, nz, mm}],
    placed: [{id: "nocol_trees_0_0#1", x: 0, y: 2, z: 0, turn: 20, scale: 1.1}]}});
  expect(answer.ok()).toBe(true); await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  const repo = join(import.meta.dirname, "../.."), python = join(repo, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
  const glb = execFileSync(python, [join(repo, "ui/e2e/model_fixture.py")]);
  await page.getByRole("button", {name: "Models", exact: true}).click();
  await page.getByLabel("Model file").setInputFiles({name: "discard-tree.glb", mimeType: "model/gltf-binary", buffer: glb});
  await page.getByLabel("Model name").fill("Discard tree");
  await page.getByRole("button", {name: "Add to library", exact: true}).click();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}}); await saved(page);
  const count = () => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances);
  await expect.poll(count).toBe(1); await page.keyboard.press("Escape");
  const changed = await picture(page); expect(changed.equals(original)).toBe(false);
  await page.getByRole("button", {name: "Discard all", exact: true}).click(); await saved(page);
  await expect.poll(count).toBe(0);
  await expect.poll(async () => (await picture(page)).equals(original)).toBe(true);
  const discarded = await (await page.request.get("/api/editor/alpha/edits")).json();
  for (const role of ["models", "heights", "placed", "copies"]) expect(discarded[role]).toEqual([]);
  await page.getByRole("button", {name: /Undo/}).click(); await saved(page);
  await expect.poll(count).toBe(1);
  await expect.poll(async () => (await picture(page)).equals(changed)).toBe(true);
});

test("an omitted primitive material loads its independent opaque default in the real GLTF renderer", async ({page}) => {
  const repo = join(import.meta.dirname, "../.."), python = join(repo, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
  const glb = execFileSync(python, [join(repo, "ui/e2e/model_fixture.py"), "--default-material"]);
  await openEditor(page);
  await page.getByRole("button", {name: "Models", exact: true}).click();
  await page.getByLabel("Model file").setInputFiles({name: "default.glb", mimeType: "model/gltf-binary", buffer: glb});
  await page.getByLabel("Model name").fill("Default material");
  await page.getByRole("button", {name: "Add to library", exact: true}).click();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}}); await saved(page);
  await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances)).toBe(1);
});
