// The Editor's tools: the sidebar's groups, one tool at a time, the bar's keys, picking more than one, Smooth road, Camera.
import type {Page} from "@playwright/test";
import {centre, expect, openEditor, openSettings, scene, startDriving, test, type Backend} from "./fixtures";
import {AWAY, NEAR_TREE, brushStroke, deleteTree, findCar, findTree, heights, picture, saveTrack, saved, stored} from "./edit-helpers";

const CAMERA_BAR = "#edit-camera-set";

const pressed = (page: Page, id: string) => page.locator(id).getAttribute("aria-pressed");

/** The keys over the view, the mouse on it. */
async function keysOnView(page: Page) {
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y);
  await scene(page).focus();
  return c;
}

async function wheelWith(page: Page, keys: string[], delta: number) {
  for (const key of keys) await page.keyboard.down(key);
  await page.mouse.wheel(0, delta);
  for (const key of [...keys].reverse()) await page.keyboard.up(key);
}

async function onHill(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  const c = await centre(scene(page));
  return {a: {x: c.x, y: c.y + 236}, b: {x: c.x, y: c.y - 261}, c};     // (as in band.e2e.ts: on the road, before and behind the hill)
}

test("the buttons stand in the sidebar, gone with its tab, back as they were; what a tool can be set to stands over the view", async ({page}) => {
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  const set = page.locator("#edit-elevation-set");
  await set.getByLabel("Radius").fill("7");
  await expect(page.locator("aside #edit-elevation")).toBeVisible();
  await expect(page.locator("#scene #edit-elevation-set")).toBeVisible();
  await page.getByTestId("nav-new-track").click();
  await expect(page.locator("#edit-elevation")).toBeHidden();
  await page.getByTestId("nav-editor").click();
  expect(await pressed(page, "#edit-elevation")).toBe("true");
  await expect(set.getByLabel("Radius")).toHaveValue("7");
});

test("Road has Smooth road, Bend road, Bank road, Racing kerb and Stitch road, while Terrain has Elevation", async ({page}) => {
  await openEditor(page);
  const bar = page.locator("#edit-bar");
  const road = bar.getByRole("heading", {name: "Road", exact: true}).locator("..");
  const terrain = bar.getByRole("heading", {name: "Terrain", exact: true}).locator("..");
  await expect(road.locator("button")).toHaveCount(5);
  await expect(road.locator("button").first()).toHaveAttribute("id", "edit-smooth");
  await expect(road.locator("button").nth(1)).toHaveAttribute("id", "edit-separate");
  await expect(road.locator("button").nth(2)).toHaveAttribute("id", "edit-bank");
  await expect(road.locator("button").nth(3)).toHaveAttribute("id", "edit-kerb");
  await expect(road.locator("button").last()).toHaveAttribute("id", "edit-stitch");
  await expect(terrain.locator("button")).toHaveCount(1);
  await expect(terrain.locator("button")).toHaveAttribute("id", "edit-elevation");
});

test("dragging the AI line produces one removable, undoable saved move", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", ai_moves: true, trees: false});
  const installed = await page.request.post(backend.url+"/api/editor/alpha/ai-line/recalculate",{data:{}});
  expect((await installed.json()).status).toBe("ready");
  await openEditor(page);
  await keysOnView(page);
  const guide = page.waitForResponse(r => r.url().endsWith("/ai-line/move-preview") && r.request().postDataJSON().guide);
  await page.keyboard.press("l");
  const result = await (await guide).json();
  expect(result.error).toBeUndefined();
  const bar = page.locator("#edit-ai-line-set");
  const range = bar.getByRole("spinbutton", {name: /Move range/});
  await expect(range).toHaveCount(0);
  await expect(bar.getByRole("button",{name:"Free",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.keyboard.press("Shift");
  await expect(bar.getByRole("button",{name:"Road",exact:true})).toHaveAttribute("aria-pressed","true");
  await wheelWith(page, ["Control"], -100);
  await expect(bar.getByRole("button",{name:"Move",exact:true})).toHaveAttribute("aria-pressed","true");
  const bounds = (await scene(page).boundingBox())!;
  const row = result.rows.find((r: number[]) => r[3] > 104);
  // Initial camera looks from 45 m behind and 22 m above AC_START_0.
  const three = await import("three");
  const camera = new three.PerspectiveCamera(55, bounds.width/bounds.height, .5, 10000);
  camera.position.set(128,22,5); camera.lookAt(128,0,-40); camera.updateMatrixWorld();
  const p = new three.Vector3(row[0],row[1]+.34,row[2]).project(camera);
  const x = bounds.x+(p.x+1)*bounds.width/2, y = bounds.y+(1-p.y)*bounds.height/2;
  const moves = async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).aiCorrections;
  const grid = result.rows.find((r: number[]) => r[8] && r[3] >= 39);
  const locked = new three.Vector3(grid[0], grid[1]+.34, grid[2]).project(camera);
  await page.mouse.move(bounds.x+(locked.x+1)*bounds.width/2, bounds.y+(1-locked.y)*bounds.height/2);
  await expect(scene(page)).toHaveCSS("cursor","not-allowed");
  await page.mouse.move(x,y);
  await expect(scene(page)).toHaveCSS("cursor","grab");
  await page.mouse.down();
  await expect(scene(page)).toHaveCSS("cursor","grabbing");
  await page.mouse.move(x+15,y,{steps: 4}); await page.mouse.up();
  await expect.poll(moves).toHaveLength(1);
  const [initial] = await moves();
  expect(initial.range).toBe(15);
  await page.mouse.move(x+15,y); await page.mouse.down(); await page.mouse.move(x+23,y); await page.mouse.up();
  await expect.poll(async () => (await moves())[0]?.routeOffset).not.toEqual(initial.routeOffset);
  expect(await moves()).toMatchObject([{id:initial.id}]);
  await page.keyboard.press("Control+z");
  await expect.poll(moves).toEqual([initial]);
  await page.keyboard.press("Control+z");
  await expect.poll(moves).toHaveLength(0);
  await page.keyboard.press("Control+y");
  await expect.poll(moves).toHaveLength(1);
  await page.mouse.click(x+15,y,{button: "right"});
  await expect.poll(moves).toHaveLength(0);
  await page.keyboard.press("Control+z");
  await expect.poll(moves).toHaveLength(1);
  const recalc = page.locator("#edit-bar").getByRole("button", {name: "Recalculate AI line"});
  await expect(recalc).toBeEnabled();
  await page.screenshot({path:"../out/ai-line-save/01-active.png"});
  await backend.post("/__test/hold-lane",{hold:true});
  await saveTrack(page);
  await expect(bar).toContainText("Outdated");
  await expect(page.getByRole("progressbar",{name:"Calculating AI line …"})).toBeVisible();
  await page.screenshot({path:"../out/ai-line-save/02-outdated-calculating.png"});
  await backend.post("/__test/hold-lane",{hold:false});
  await expect(page.getByText("AI line updated", {exact:true})).toBeVisible();
  await expect(recalc).toBeDisabled();
  await expect(bar).not.toContainText("Outdated");
  await page.screenshot({path:"../out/ai-line-save/03-updated.png"});
  await page.locator("#edit-ai-line-alpha").getByRole("button",{name:"Dismiss notification"}).click();
  await expect(scene(page)).toBeFocused();
  const patch = {x:Math.floor(bounds.x+bounds.width/2-30), y:Math.floor(bounds.y+bounds.height*.43), width:60, height:20};
  const before = await page.screenshot({clip:patch});
  const afterSave = await moves();
  let checks = 0;
  page.on("request", r => { if (r.url().endsWith("/move-preview")) checks++; });
  await page.getByTestId("nav-editor").focus();
  await page.keyboard.press("Control");
  await expect(bar.getByRole("button",{name:"Redraw",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect.poll(async () => (await page.screenshot({clip:patch})).equals(before)).toBe(true);
  await expect(bar).toContainText("Side limits");
  await page.screenshot({path:"../out/ai-line-save/04-redraw.png"});
  expect(checks).toBe(0);
  await page.mouse.move(x,y);
  await expect(scene(page)).toHaveCSS("cursor","crosshair");
  await page.keyboard.press("Control");
  await page.mouse.move(x+15,y); await page.mouse.down(); await page.mouse.move(x+20,y); await page.mouse.up();
  await expect.poll(async () => (await moves())[0]?.routeOffset).not.toBe(afterSave[0].routeOffset);
  expect(await moves()).toMatchObject([{id:initial.id}]);
  await page.getByTestId("nav-editor").focus();
  await page.keyboard.press("Escape");
  await expect(bar).toHaveCount(0);
  await expect(scene(page)).not.toHaveCSS("cursor","crosshair");
});

test("Redraw finishes on the line, Escape discards the stroke, and a saved free stroke reopens", async ({page,backend}) => {
  await backend.post("/__test/rebuild", {name:"alpha", title:"Alpha Test", ai_moves:true, trees:false});
  await openEditor(page); await keysOnView(page);
  const response = page.waitForResponse(r => r.url().endsWith("/ai-line/move-preview") && r.request().postDataJSON().guide);
  await page.keyboard.press("l");
  const guide = await (await response).json();
  const bar = page.locator("#edit-ai-line-set");
  await expect(bar.getByRole("button",{name:"Free",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.keyboard.press("Control");
  await expect(bar.getByRole("button",{name:"Redraw",exact:true})).toHaveAttribute("aria-pressed","true");
  const bounds=(await scene(page).boundingBox())!, three=await import("three");
  const camera=new three.PerspectiveCamera(55,bounds.width/bounds.height,.5,10000);
  camera.position.set(128,22,5); camera.lookAt(128,0,-40); camera.updateMatrixWorld();
  const position = (metre:number, off=0): [number,number] => {
    const row=guide.rows.find((r:number[])=>r[3]>=metre);
    const q=new three.Vector3(row[0]+off,row[1]+.38,row[2]).project(camera);
    return [bounds.x+(q.x+1)*bounds.width/2,bounds.y+(1-q.y)*bounds.height/2];
  };
  const click = (metre:number, off=0) => page.mouse.click(...position(metre,off));
  const moves=async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).aiCorrections;
  await click(105);
  await page.keyboard.press("Control"); await page.keyboard.press("Control");
  await click(105); await click(91);
  await expect(page.locator("#edit-ai-preview")).toContainText("End precedes the start");
  await page.keyboard.press("Escape");
  expect(await moves()).toHaveLength(0);
  await click(62); await click(125,3.5); await click(205);
  await expect.poll(moves).toHaveLength(1);
  const [stroke]=await moves();
  expect(stroke.kind).toBe("redraw"); expect(stroke.free).toBe(true);
  expect(stroke.points).toHaveLength(1);
  await page.getByRole("button",{name:"Recalculate AI line"}).click();
  await page.locator("#save-dialog").getByRole("button",{name:"Overwrite"}).click();
  await expect(page.getByText("AI line updated",{exact:true})).toBeVisible();
  await expect(bar).toContainText("Side limits");
  expect(await moves()).toEqual([stroke]);
  await bar.getByRole("button",{name:"Move",exact:true}).click();
  await page.mouse.move(...position(100));
  await expect(page.getByRole("region",{name:"AI line point"})).toContainText("Route metre");
});

test("Save reuses a tree-only change, and defers a road change until Save after AC closes", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name:"alpha",title:"Alpha Test",ai_moves:true});
  const url = backend.url + "/api/editor/alpha/ai-line";
  expect((await (await page.request.post(url+"/recalculate",{data:{}})).json()).status).toBe("ready");
  let requests=0;
  page.on("request", r => { if (r.url()===url+"/recalculate") requests++; });
  await openEditor(page);
  await deleteTree(page);
  await saveTrack(page);
  const recalc=page.getByRole("button",{name:"Recalculate AI line"});
  await expect(recalc).toBeDisabled();
  expect(requests).toBe(0);
  await page.locator("#edit-elevation").click();
  await brushStroke(page);
  await backend.post("/__test/ac-running",{running:true});
  await saveTrack(page,false);
  await expect(page.getByText("AI line update deferred",{exact:true})).toBeVisible();
  expect((await (await page.request.get(url)).json()).validity).toBe("pending");
  await backend.post("/__test/ac-running",{running:false});
  await page.locator("#edit-save").click();
  await expect(page.getByText("AI line updated",{exact:true})).toBeVisible();
  await expect(recalc).toBeDisabled();
});

test("Play saves a road change and Practice leaves its installed preview pending", async ({page,backend}) => {
  await backend.post("/__test/rebuild", {name:"alpha",title:"Alpha Test",ai_moves:true});
  const url=backend.url+"/api/editor/alpha/ai-line";
  expect((await (await page.request.post(url+"/recalculate",{data:{}})).json()).status).toBe("ready");
  let requests=0;
  page.on("request", r => { if (r.url()===url+"/recalculate") requests++; });
  await openEditor(page);
  await page.locator("#edit-elevation").click();
  await brushStroke(page);
  await page.locator("#edit-play").click();
  await startDriving(page);
  await expect.poll(backend.calls).toContainEqual(["play","alpha"]);
  expect((await (await page.request.get(url)).json()).validity).toBe("pending");
  expect(requests).toBe(0);
});

test("L shows the installed AI line", async ({page, backend}) => {
  let statusReads = 0, binaryReads = 0;
  page.on("request", request => {
    const url = new URL(request.url());
    if (url.pathname !== "/api/editor/alpha/ai-line") return;
    if (url.searchParams.has("r")) binaryReads++;
    else statusReads++;
  });
  await openEditor(page);
  const c = await keysOnView(page);
  await page.keyboard.press("l");
  const ai = page.getByRole("heading", {name: "AI", exact: true}).locator("..");
  await expect(ai.getByRole("button", {name: "AI line", exact: true})).toHaveAttribute("aria-pressed", "true");
  const bar = page.locator("#edit-ai-line-set");
  await expect(bar).toContainText("No AI line is installed");
  await page.keyboard.press("Escape");
  await deleteTree(page);
  await backend.post("/__test/ai-line", {name: "alpha"});
  await page.keyboard.press("l");
  await expect(bar).toContainText("Side limits");
  await expect(bar).not.toContainText("Braking");
  await expect(bar).toContainText("Line from the last build or save");
  await expect(ai.getByRole("button", {name: "Recalculate AI line"})).toBeEnabled();
  await expect(ai.getByText("Save first.", {exact: true})).toHaveCount(0);
  await page.mouse.move(c.x, c.y + 10);
  const point = page.getByRole("region", {name: "AI line point"});
  await expect(point).toContainText("Route metre");
  await expect(point).toContainText("km/h");
  await page.mouse.move(c.x + 100, c.y + 10);
  await expect(point).toHaveCount(0);
  await page.mouse.move(c.x + 30, c.y + 10);    // Over the band, outside the centre line's 8 px hover radius.
  await expect(point).toContainText("Route metre");
  await page.mouse.click(c.x + 30, c.y + 10);
  await expect(page.locator("#edit-count")).toHaveText("1 object deleted");
  const reads = statusReads;
  expect(binaryReads).toBe(1);
  await page.keyboard.press("l");
  await expect(bar).toHaveCount(0);
  await page.keyboard.press("l");
  await expect(bar).toContainText("Side limits");
  await expect(point).toContainText("Route metre");
  expect([statusReads, binaryReads]).toEqual([reads+1, 1]);

  await saveTrack(page);    // The fixture has no timing gates. The old line remains available as a preview.
  await expect(bar).toContainText("Outdated");
  await expect(bar).toContainText("Side limits");
  await expect(bar).not.toContainText("Line from the last build or save");

  await page.keyboard.press("Escape");
  await expect(bar).toHaveCount(0);
  await expect(point).toHaveCount(0);
});

test("each tool has its key, one is on at a time, Esc goes back to Select from each, fields keep their keys and sidebar buttons accept shortcuts", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  expect(await pressed(page, "#edit-select")).toBe("true");
  for (const [key, id] of [["t", "#edit-move"], ["x", "#edit-click-deletes"], ["k", "#edit-camera"], ["c", "#edit-copy"], ["h", "#edit-elevation"], ["r", "#edit-smooth"]]) {
    await page.keyboard.press(key);
    await expect(page.locator(id)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Escape");
    await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  }
  await page.keyboard.press("h");
  await page.locator("#edit-elevation-set").getByLabel("Height").press("Escape");
  await expect(page.locator("#edit-elevation")).toHaveAttribute("aria-pressed","true");
  await page.getByTestId("nav-editor").focus(); await page.keyboard.press("Escape");
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#edit-elevation").focus();
  await page.keyboard.press("x");
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "true");
});

test("Delete's brush frames what is under its ring and deletes it as one Undo; Shift switches between One and Brush", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("x");
  const bar = page.locator("#edit-delete-set"), one = bar.getByRole("button", {name: "One", exact: true}), brush = bar.getByRole("button", {name: "Brush", exact: true});
  await expect(one).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Shift");
  await expect(brush).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Control+Shift+z");     // (Redo: Shift with another key switches nothing)
  await expect(brush).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Shift");
  await expect(one).toHaveAttribute("aria-pressed", "true");
  await brush.click();
  await bar.getByLabel("Radius").fill("200");
  await keysOnView(page);
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y + 40);
  await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.delete.marks").at(-1) as PerformanceMark | undefined)?.detail?.framed ?? 0))
    .toBeGreaterThan(1);
  await page.mouse.down(); await page.mouse.move(c.x + 30, c.y + 45, {steps: 5}); await page.mouse.up();
  await expect(page.locator("#edit-count")).toHaveText(/^\d+ objects deleted$/);
  await saved(page);
  const deleted = (await stored(page)).deleted.map(d => d.id);
  expect(deleted).toContain(NEAR_TREE);
  expect(deleted.length).toBeGreaterThan(1);
  await keysOnView(page);
  await page.keyboard.press("Control+z");
  await saved(page);
  expect((await stored(page)).deleted).toEqual([]);
});

test("Help says how the Editor is worked and shows the keys of the tool that is on, changing with it", async ({page}) => {
  await openEditor(page);
  const help = page.locator("#edit-help");
  await help.locator("summary").click();
  await expect(help).toContainText("Esc ends a tool");
  await expect(help.getByRole("heading")).toHaveText("Select (V)");
  await scene(page).focus();
  await page.keyboard.press("t");
  await expect(help.getByRole("heading")).toHaveText("Transform (T)");
  await expect(help.locator("dl")).toContainText("Alt + wheelsize");
  await page.keyboard.press("h");
  await expect(help.locator("dl")).toContainText("Ctrl + Alt + wheelsoft edge");
  await page.keyboard.press("Escape");
  await expect(help.getByRole("heading")).toHaveText("Select (V)");
});

test("the bar's keys: the options reach Shift, Ctrl, Alt, Ctrl+Alt from left to right, what is held is lit", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("h");
  const set = page.locator("#edit-elevation-set"), keys = set.locator("kbd");
  await expect(keys).toHaveText(["Shift", "Ctrl", "Alt", "Ctrl+Alt"]);
  const lit = set.locator("[class*=held] kbd");
  await expect(lit).toHaveCount(0);
  await page.keyboard.down("Control");
  await expect(lit).toHaveText(["Ctrl"]);
  await page.keyboard.down("Alt");
  await expect(lit).toHaveText(["Ctrl+Alt"]);       // (the one thing, neither of the two)
  await page.keyboard.up("Control");
  await expect(lit).toHaveText(["Alt"]);
  await page.keyboard.up("Alt");
  await expect(lit).toHaveCount(0);
});

test("Shift shows the way Elevation goes as it is held, from either choice", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("h");
  const raise = page.getByRole("button", {name: "Raise"}), lower = page.getByRole("button", {name: "Lower"});
  await expect(raise).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.down("Shift");
  await expect(lower).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.up("Shift");
  await expect(raise).toHaveAttribute("aria-pressed", "true");
  await lower.click();
  await page.keyboard.down("Shift");
  await expect(raise).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.up("Shift");
  await expect(lower).toHaveAttribute("aria-pressed", "true");
});

test("Select: Ctrl adds to what is picked, again takes it out, X deletes all as one undo step, Esc lets go of them", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", car: "listed"});
  await openEditor(page);
  const tree = await findTree(page), car = await findCar(page);
  const picked = page.locator("#edit-picked");
  const ctrlClick = async (at: {x: number; y: number}) => {
    await page.keyboard.down("Control");
    await page.mouse.click(at.x, at.y);
    await page.keyboard.up("Control");
  };
  await page.mouse.click(tree.x, tree.y);
  await expect(picked).toContainText("Tree");
  await ctrlClick(car);
  await expect(picked).toHaveText("2 objects picked: X or Delete deletes them all.");
  await ctrlClick(car);
  await expect(picked).toContainText("Tree");
  await ctrlClick(car);
  await expect(picked).toContainText("2 objects picked");
  await page.keyboard.press("x");
  await expect(page.locator("#edit-count")).toHaveText("2 objects deleted");
  await expect(picked).toBeHidden();
  expect(await pressed(page, "#edit-click-deletes")).toBe("false");
  await page.keyboard.press("Control+z");
  await expect(page.locator("#edit-count")).toHaveCount(0);

  await page.mouse.click(tree.x, tree.y);
  await expect(picked).toContainText("Tree");
  await page.keyboard.press("Escape");
  await expect(picked).toBeHidden();
  await page.keyboard.press("x");                   // (nothing picked: its tool)
  await expect(page.locator("#edit-click-deletes")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-count")).toHaveCount(0);
});

test("Smooth road marks at zero through its key or the road context menu", async ({page, backend}) => {
  const {a, b} = await onHill(page, backend);
  await keysOnView(page);
  await page.keyboard.press("r");
  await expect(page.locator("#edit-road")).toHaveCount(0);
  await expect(page.locator("#edit-road-hint")).toContainText("click the road");
  await page.mouse.click(a.x, a.y);
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(b.x, b.y);
  await expect(page.locator("#edit-band").getByLabel("Transition")).toBeVisible();
  await expect(page.locator("#edit-band").getByLabel("Strength")).toHaveValue("0");
  expect(await heights(page)).toEqual([]);
  await scene(page).focus(); await page.keyboard.press("Escape");
  await page.mouse.click(a.x, a.y, {button: "right"});
  await page.getByRole("menuitem", {name: "Smooth road", exact: true}).click();
  await expect(page.locator("#edit-smooth")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-band")).toContainText("A is set");
  await page.mouse.click(b.x, b.y);
  await expect(page.locator("#edit-band").getByLabel("Transition")).toBeVisible();
  await expect(page.locator("#edit-band").getByLabel("Strength")).toHaveValue("0");
  await expect(page.locator("#edit-picked")).toHaveCount(0);
  expect(await heights(page)).toEqual([]);
});

test("Smooth road's left click picks no object; a right click on a tree still offers object actions", async ({page}) => {
  await openEditor(page);
  const tree = await findTree(page);
  await page.keyboard.press("r");
  await page.mouse.click(tree.x, tree.y);
  await expect(page.locator("#edit-picked")).toHaveCount(0);
  await page.mouse.click(tree.x, tree.y, {button: "right"});
  await expect(page.getByRole("menuitem", {name: "Delete", exact: true})).toBeEnabled();
  await expect(page.getByRole("menuitem", {name: "Smooth road", exact: true})).toHaveCount(0);
  await expect(page.locator("#edit-picked")).toContainText("Tree");
});

test("Camera: K shows its bar and moves nothing; Shift with the wheel goes along the track and back, Ctrl its height, Alt its speed", async ({page, backend}) => {
  await onHill(page, backend);
  await page.mouse.move(AWAY.x, AWAY.y);
  const first = await picture(page);
  await keysOnView(page);
  await page.keyboard.press("c");
  await expect(page.locator("#edit-copy")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(CAMERA_BAR)).toHaveCount(0);
  await page.keyboard.press("k");
  const bar = page.locator(CAMERA_BAR);
  await expect(bar).toContainText("Along the track");
  expect((await picture(page)).equals(first)).toBe(true);
  await keysOnView(page);
  const atMetres = (m: string) => expect(bar).toContainText(m);
  await wheelWith(page, ["Shift"], -100);
  await atMetres("20 m");
  await wheelWith(page, ["Shift"], -100);
  await atMetres("40 m");
  await wheelWith(page, ["Shift"], 100);
  await atMetres("20 m");
  expect((await picture(page)).equals(first)).toBe(false);
  await keysOnView(page);
  await wheelWith(page, ["Control"], -100);
  await expect(bar.getByLabel("Height")).toHaveValue("3.5");
  await wheelWith(page, ["Alt"], -100);
  await expect(bar.getByLabel("Speed")).toHaveValue("60");
});

test("Camera: Ride goes by itself and Pause stands, at the end it stops and starts over; Reset and Home give the first view", async ({page, backend}) => {
  await onHill(page, backend);
  await page.mouse.move(AWAY.x, AWAY.y);
  const first = await picture(page);
  await keysOnView(page);
  await page.keyboard.press("k");
  const bar = page.locator(CAMERA_BAR), ride = page.locator("#edit-ride");
  const metre = async () => Number(/(\d+) m/.exec(await bar.innerText())![1]);
  await ride.click();
  await expect(ride).toHaveText("Pause");
  await expect.poll(metre).toBeGreaterThan(5);
  await ride.click();
  await expect(ride).toHaveText("Ride");
  await page.waitForTimeout(200);       // (the last it has to say of where it is)
  const stood = await metre();
  await page.waitForTimeout(300);
  expect(await metre()).toBe(stood);

  await bar.getByLabel("Speed").fill("300");
  await ride.click();
  await expect(ride).toHaveText("Ride", {timeout: 30000});       // (the route's end)
  const end = await metre();
  expect(end).toBeGreaterThan(100);
  await ride.click();
  await expect(ride).toHaveText("Pause");
  await expect.poll(metre).toBeLessThan(end);       // (from the start)
  await ride.click();

  await page.locator("#edit-home").click();
  await expect(ride).toHaveText("Ride");
  await expect.poll(async () => (await picture(page)).equals(first)).toBe(true);
  await keysOnView(page);
  await wheelWith(page, ["Shift"], -100);
  await expect(bar).toContainText("20 m");
  await page.keyboard.press("Home");
  await expect.poll(async () => (await picture(page)).equals(first)).toBe(true);
});

test("Camera: W A S D, the plain wheel and the right button leave the track, Esc and another tool end it; the camera stays", async ({page, backend}) => {
  const {c} = await onHill(page, backend);
  await keysOnView(page);
  await page.keyboard.press("k");
  const ride = page.locator("#edit-ride"), bar = page.locator(CAMERA_BAR);
  const riding = async () => {
    await ride.click();
    await expect(ride).toHaveText("Pause");
    await keysOnView(page);
  };
  await riding();
  await page.keyboard.press("w");
  await expect(ride).toHaveText("Ride");
  await riding();
  await page.mouse.wheel(0, 100);
  await expect(ride).toHaveText("Ride");
  await riding();
  await page.mouse.click(c.x, c.y, {button: "right"});
  await expect(ride).toHaveText("Ride");
  await page.keyboard.press("Escape");
  await expect(bar).toBeHidden();

  await page.keyboard.press("k");
  await riding();
  await page.keyboard.press("Escape");
  await expect(bar).toBeHidden();
  await page.mouse.move(AWAY.x, AWAY.y);
  await scene(page).focus();
  const left = await picture(page);
  await page.waitForTimeout(400);
  expect((await picture(page)).equals(left)).toBe(true);

  await page.keyboard.press("k");
  await riding();
  await page.keyboard.press("h");
  await expect(bar).toBeHidden();
  await expect(page.locator("#edit-elevation-set")).toBeVisible();
});

test("Camera: a track with no route says so", async ({page}) => {
  await page.route("**/api/editor/alpha/index", async route => {
    const r = await route.fetch();
    return route.fulfill({response: r, json: {...await r.json(), route: []}});
  });
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("k");
  const bar = page.locator(CAMERA_BAR);
  await expect(bar).toContainText("no route");
  await wheelWith(page, ["Shift"], -100);
  await expect(page.locator("#edit-tool-note")).toHaveText("This track has no route to go along");
  await page.getByRole("tab", {name: "Details", exact: true}).click();
  await page.locator("#edit-tool-note").waitFor();
  await page.locator("#edit-ride").click();
  await expect(page.locator("#edit-tool-note")).toHaveText("This track has no route to go along");
  await expect(page.locator("#edit-ride")).toHaveText("Ride");
});

test("a small window: the buttons scroll, what is to be said stays in sight; Elevation's speed under Settings is what a stroke goes by", async ({page}) => {
  await page.setViewportSize({width: 1280, height: 420});
  await openEditor(page);
  await page.locator("#edit-smooth").scrollIntoViewIfNeeded();
  await page.locator("#edit-elevation").click();
  const c = await centre(scene(page));
  let sent: number | null = null;
  page.on("request", r => { if (r.url().endsWith("/brush")) sent = (r.postDataJSON() as {speed: number}).speed; });
  await page.mouse.click(c.x, c.y + 60);
  await page.getByRole("tab", {name: "Details", exact: true}).click();
  await page.locator("#edit-heights").scrollIntoViewIfNeeded();
  await expect(page.locator("#edit-heights")).toBeInViewport();
  expect(sent).toBe(300);
  await page.locator("#edit-help summary").scrollIntoViewIfNeeded();
  await page.locator("#edit-heights").scrollIntoViewIfNeeded();
  await expect(page.locator("#edit-heights")).toBeInViewport();

  await page.setViewportSize({width: 1280, height: 720});
  await openSettings(page, "Editor");
  await page.locator("#control-elevation-speed").fill("120");
  await expect(page.getByRole("dialog")).toContainText("120 cm/s");
  await page.keyboard.press("Escape");
  await page.mouse.click(c.x, c.y + 60);
  await expect(page.locator("#edit-heights")).toHaveText("2 height changes");
  expect(sent).toBe(1200);
});

test("AI line button reports a saved track's calculation error in the Editor", async ({page}) => {
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("l");
  const bar = page.locator("#edit-ai-line-set");
  const answer = page.waitForResponse("**/api/editor/alpha/ai-line/recalculate");
  await page.locator("#edit-bar").getByRole("button", {name: "Recalculate AI line"}).click();
  const {error} = await (await answer).json();
  expect(error).toBeTruthy();
  await expect(page.locator("#edit-ai-line-alpha")).toContainText(error);
  await expect(bar.getByRole("alert")).toHaveCount(0);
});
