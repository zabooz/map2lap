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

test('Library under Revert to saved opens the library where it was left, Insert always at OBJECTS', async ({page}) => {
  await openEditor(page);
  const library=page.getByRole('dialog',{name:'Asset library'}), open=page.getByRole('button',{name:'Library',exact:true});
  // (a full texture library has pages, a small object library none)
  await page.route(url => url.pathname === '/api/library/materials', async route => {
    const answer = await route.fetch();
    await route.fulfill({response: answer, json: {...await answer.json(), total: 100}});
  });
  await open.click();
  await expect(library.getByRole('tab',{name:'TEXTURES'})).toHaveAttribute('aria-selected','true');
  await expect(library.getByRole('button',{name:'Previous'})).toBeVisible();
  // (the pages stand centred under the grid they turn, not under the grid and the preview)
  const grid = (await library.locator('[data-library-browser]').filter({visible: true}).boundingBox())!;
  const pages = (await library.getByRole('button',{name:'Previous'}).locator('..').boundingBox())!;
  expect(Math.abs(pages.x + pages.width / 2 - (grid.x + grid.width / 2))).toBeLessThan(2);
  // (its size is the dialog's own, not its tab's: switching tabs moves nothing)
  const size = async () => { const box = (await library.boundingBox())!; return [box.y, box.height]; };
  const textures = await size();
  await library.getByRole('tab',{name:'OBJECTS'}).click();
  await expect(library.getByLabel('Search objects')).toBeVisible();
  expect(await size()).toEqual(textures);
  await page.keyboard.press('Escape');
  await expect(library).toBeHidden();
  await open.click();
  await expect(library.getByRole('tab',{name:'OBJECTS'})).toHaveAttribute('aria-selected','true');
  await library.getByRole('tab',{name:'TEXTURES'}).click();
  await page.keyboard.press('Escape');
  await scene(page).focus();
  await page.keyboard.press('i');
  await expect(library.getByRole('tab',{name:'OBJECTS'})).toHaveAttribute('aria-selected','true');
});

test('Insert shares one TEXTURES/OBJECTS library and places an imported tree', async ({page}, testInfo) => {
  const repo=join(import.meta.dirname,'../..');
  const python=join(repo,process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python');
  const glb=execFileSync(python,[join(repo,'ui/e2e/model_fixture.py'),'--metallic']);
  await openEditor(page);
  await expect(page.getByRole('button',{name:'Insert',exact:true})).toBeVisible({timeout:3000});
  const insert=page.getByRole('button',{name:'Insert',exact:true});
  expect(await insert.evaluate(button => button.parentElement === document.querySelector('#edit-click-deletes')?.parentElement)).toBe(true);
  await scene(page).focus();
  await page.keyboard.press('i');
  const library=page.getByRole('dialog',{name:'Asset library'});
  await expect(library).toBeVisible();
  await expect(library.getByRole('tab',{name:'OBJECTS'})).toHaveAttribute('aria-selected','true');
  await expect(library.getByLabel('Search objects')).toBeVisible();
  await expect(library.getByLabel('Filter objects')).toBeVisible();
  await expect(library.getByRole('button',{name:'Import…',exact:true})).toBeVisible();
  await library.getByRole('tab',{name:'TEXTURES'}).click();
  await expect(library.getByLabel('Search textures')).toBeVisible();
  await library.getByRole('tab',{name:'OBJECTS'}).click();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await library.getByLabel('Model file').setInputFiles({name:'insert-tree.glb',mimeType:'model/gltf-binary',buffer:glb});
  const importer = page.getByRole('dialog',{name:'Import object',exact:true});
  await expect(importer).toBeVisible();
  await importer.getByLabel('Model name').fill('Insert tree');
  await importer.getByLabel('Model name').press('i');
  await expect(importer.getByLabel('Model name')).toHaveValue('Insert treei');
  await importer.getByRole('button',{name:'Add to library',exact:true}).click();
  await expect(importer).toBeHidden();
  await expect(library.getByLabel('Model preview')).toBeVisible();
  await library.screenshot({path:testInfo.outputPath('insert-library-objects.png')});
  await library.getByRole('button',{name:'Place on ground',exact:true}).click();
  const before = await picture(page), viewport = (await scene(page).boundingBox())!;
  const index = await (await page.request.get('/api/editor/alpha/index')).json();
  await scene(page).hover({position:{x:600,y:400}});
  const ghost = () => page.evaluate(() => (performance.getEntriesByName('map2lap.models.ghost').at(-1) as PerformanceMark)?.detail);
  await expect.poll(async () => (await ghost())?.visible).toBe(true);
  const point = project(index, viewport, new THREE.Vector3(.72,4.05,.01).applyMatrix4(new THREE.Matrix4().fromArray((await ghost()).matrix)));
  const ghostPng = await scene(page).screenshot({style:'[data-tool-options] {visibility:hidden}'});
  const groundPixel = (await sample(page,before,[point]))[0], ghostPixel = (await sample(page,ghostPng,[point]))[0];
  expect(delta(groundPixel,ghostPixel)).toBeGreaterThan(10);
  expect((await (await page.request.get('/api/editor/alpha/edits')).json()).models ?? []).toHaveLength(0);
  await page.locator('#edit-insert-set').getByRole('spinbutton',{name:/Turn/}).fill('35');
  await page.locator('#edit-insert-set').getByRole('spinbutton',{name:/Raise/}).fill('150');
  await page.locator('#edit-insert-set').getByRole('spinbutton',{name:/Size/}).fill('140');
  await scene(page).click({position:{x:600,y:400}});
  await expect.poll(async()=>(await(await page.request.get('/api/editor/alpha/edits')).json()).models?.length).toBe(1);
  await page.keyboard.press('Escape');
  const posed = await (await page.request.get('/api/editor/alpha/index')).json(), instance = posed.models[0];
  const pose = (await (await page.request.get('/api/editor/alpha/edits')).json()).placed.find((p:{id:string})=>p.id===`${instance.id}#0`);
  expect([pose.turn,pose.y,pose.scale]).toEqual([35,1.5,1.4]);
  const shownPoint = project(posed,viewport,new THREE.Vector3(.72,4.05,.01).applyMatrix4(new THREE.Matrix4().fromArray(posed.model_matrices[instance.id])));
  const metallicPixel = (await sample(page,await picture(page),[shownPoint]))[0];
  expect(metallicPixel[1]).toBeGreaterThan(30);
  await page.getByRole('tab',{name:'Details',exact:true}).click();
  await expect(page.getByLabel('Track statistics')).toContainText('Current KN5');
  await expect(page.getByLabel('Track statistics')).toContainText('With draft (estimate)');
  await expect(page.locator('#inspector-details #edit-placed')).toHaveText('1 object moved');
  await testInfo.attach('insert-ghost',{body:ghostPng,contentType:'image/png'});
  await page.getByRole('tab',{name:'Properties',exact:true}).click();
  await scene(page).click({position:{x:200,y:500}});
  await page.getByRole('button',{name:'Edit texture',exact:true}).click();
  await expect(library.getByRole('tab',{name:'TEXTURES'})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await library.screenshot({path:testInfo.outputPath('insert-library-textures.png')});
});

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
  // Keep the fitted crown and its raised pose inside the reference camera's image.
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", tree_height: 6});
  await openEditor(page);
  const sourceTrees = (await meshes(page))["nocol_trees_0_0"];
  const before = await picture(page);
  await page.getByRole("button", {name: "Insert", exact: true}).click();
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
  // The red pigment must remain distinct; bright viewport lighting can clip its red channel.
  expect(shownPixels[3][0] - Math.max(shownPixels[3][1], shownPixels[3][2])).toBeGreaterThan(60);
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
  // Both draw and picking use the shared GLB: solid crown selects its binding; the cutout reaches the source behind it.
  for (const [point, solid] of [[points[0], true], [points[1], false]] as const) {
    await page.mouse.move(viewport.x + point.x - 1, viewport.y + point.y);
    await page.mouse.move(viewport.x + point.x, viewport.y + point.y);
    if (solid) await expect(page.locator("#hover-box")).toContainText(first.id + "#0");
    else await expect(page.locator("#hover-box")).not.toContainText(first.id + "#0");
  }
  const tree = await findTree(page);
  await page.mouse.click(tree.x, tree.y);
  await page.getByRole("button", {name: "Insert", exact: true}).click();
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
  expect(replacement.scale).toBeCloseTo(6 / 5, 5);
  const index = await (await page.request.get("/api/editor/alpha/index")).json();
  const bounds = (await scene(page).boundingBox())!;
  // Replacement preserves the source tree's height, so pick through its fitted instance transform.
  const point = project(index, bounds, new THREE.Vector3(.72, 4.05, .01)
    .applyMatrix4(new THREE.Matrix4().fromArray(index.model_matrices[replacement.id])));
  await page.mouse.click(bounds.x + point.x, bounds.y + point.y);
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
  const expectedModelIds = (await (await page.request.get("/api/editor/alpha/edits")).json()).models.map((model: {id: string}) => model.id).sort();
  await page.locator("#edit-save-more").click();
  await page.locator("#save-name").fill("Imported model copy");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  await expect(page.locator("#edit-track")).toHaveValue("imported_model_copy");
  const native = await meshes(page, "imported_model_copy");
  // Save bundles equal materials within a tile: three trees still contain all twelve triangles.
  const modelTriangles = Object.entries(native).filter(([name]) => name.includes("m2l_model")).map(([, triangles]) => triangles);
  expect(modelTriangles.reduce((sum, triangles) => sum + triangles, 0)).toBe(12);
  expect(native.nocol_trees_0_0).toBe(sourceTrees - 8);
  await backend.post("/__test/cold-models");
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect.poll(async () => (await (await page.request.get("/api/editor/imported_model_copy/edits")).json()).models?.length).toBe(3);
  const coldIndex = await (await page.request.get("/api/editor/imported_model_copy/index")).json();
  expect(coldIndex.models.map((model: {id: string}) => model.id).sort()).toEqual(expectedModelIds);
  expect(new Set(expectedModelIds).size).toBe(3);
  for (const id of expectedModelIds) {
    expect(coldIndex.objects[id].kinds).toEqual(["tree"]);
    expect(coldIndex.model_matrices[id]).toHaveLength(16);
  }
  // Original and compiled sources both reopen: the latter already removed the billboard. Count the visible result,
  // including each still-active replacement's eight billboard triangles, rather than assuming one source representation.
  const sourceTreeTriangles = coldIndex.meshes.filter((mesh: {name: string}) => mesh.name === "nocol_trees_0_0")
    .reduce((sum: number, mesh: {indices: number}) => sum + mesh.indices / 3, 0);
  expect(sourceTreeTriangles - coldIndex.model_replacements.length * 8).toBe(sourceTrees - 8);
  for (const id of coldIndex.model_replacements) expect(id).toBe(replacement.replaces);
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

test("Revert to saved and Undo refresh models together with source heights, source poses and ordinary copies", async ({page, backend}) => {
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
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await page.getByLabel("Model file").setInputFiles({name: "discard-tree.glb", mimeType: "model/gltf-binary", buffer: glb});
  await page.getByLabel("Model name").fill("Discard tree");
  await page.getByRole("button", {name: "Add to library", exact: true}).click();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}}); await saved(page);
  const count = () => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances);
  await expect.poll(count).toBe(1); await page.keyboard.press("Escape");
  const changed = await picture(page); expect(changed.equals(original)).toBe(false);
  await page.getByRole("button", {name: "Revert to saved", exact: true}).click(); await saved(page);
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
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await page.getByLabel("Model file").setInputFiles({name: "default.glb", mimeType: "model/gltf-binary", buffer: glb});
  await page.getByLabel("Model name").fill("Default material");
  await page.getByRole("button", {name: "Add to library", exact: true}).click();
  await page.getByRole("button", {name: "Place on ground", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}}); await saved(page);
  await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail.instances)).toBe(1);
});
