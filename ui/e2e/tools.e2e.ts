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
  const guide = guideResponse(page);
  await openEditor(page);
  await keysOnView(page);
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
  await expect(page.locator("#edit-ai-move")).toHaveAttribute("aria-pressed","true");
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
  await page.keyboard.press("Control");      // (Ctrl by itself switches nothing any more)
  await expect(page.locator("#edit-ai-move")).toHaveAttribute("aria-pressed","true");
  await page.keyboard.press("p");            // (Redraw line keeps the line shown and its guide: nothing is read again)
  await expect(page.locator("#edit-ai-redraw")).toHaveAttribute("aria-pressed","true");
  await expect(bar).toContainText("Redraw line");
  await expect.poll(async () => (await page.screenshot({clip:patch})).equals(before)).toBe(true);
  await expect(bar).toContainText("Side limits");
  await page.screenshot({path:"../out/ai-line-save/04-redraw.png"});
  expect(checks).toBe(0);
  await page.mouse.move(x,y);
  await expect(scene(page)).toHaveCSS("cursor","crosshair");
  await page.keyboard.press("l");
  await expect(page.locator("#edit-ai-move")).toHaveAttribute("aria-pressed","true");
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
  const response = guideResponse(page);
  await openEditor(page); await keysOnView(page);
  await page.keyboard.press("p");
  const guide = await (await response).json();
  const bar = page.locator("#edit-ai-line-set");
  await expect(bar.getByRole("button",{name:"Free",exact:true})).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("#edit-ai-redraw")).toHaveAttribute("aria-pressed","true");
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
  await page.keyboard.press("l"); await page.keyboard.press("p");     // (another tool discards the unfinished stroke)
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
  await page.locator("#edit-ai-move").click();
  await page.mouse.move(...position(100));
  await expect(page.getByRole("region",{name:"AI line point"})).toContainText("Route metre");
});

test("Redraw markers edit a saved stroke, reconnect a gap and undo once per gesture", async ({page,backend}) => {
  await backend.post("/__test/rebuild", {name:"alpha",title:"Alpha Test",ai_moves:true,trees:false});
  expect((await (await page.request.post("/api/editor/alpha/ai-line/recalculate",{data:{}})).json()).status).toBe("ready");
  const response = guideResponse(page);
  await openEditor(page); await keysOnView(page); await page.keyboard.press("p");
  const guide = await (await response).json();
  const bounds = (await scene(page).boundingBox())!, three = await import("three");
  const camera = new three.PerspectiveCamera(55,bounds.width/bounds.height,.5,10000);
  camera.position.set(128,22,5); camera.lookAt(128,0,-40); camera.updateMatrixWorld();
  const screen = ([x,y,z]:number[]): [number,number] => {
    const p = new three.Vector3(x,y+.38,z).project(camera);
    return [bounds.x+(p.x+1)*bounds.width/2,bounds.y+(1-p.y)*bounds.height/2];
  };
  const row = (m:number, off=0) => {
    const [x,y,z] = guide.rows.find((r:number[]) => r[3]>=m);
    return [x+off,y,z];
  };
  const click = (p:number[], right=false) => page.mouse.click(...screen(p),{button:right?"right":"left"});
  const edits = async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).aiCorrections;
  await expect(page.locator("#edit-ai-line-set")).toContainText("Side limits");
  const start=row(62), end=row(195);
  await click(start); await click(start,true); // Back up at A: the next line click starts a new stroke.
  await click(row(73)); await click(row(84,4)); await click(row(84,4),true); await click(start,true);
  expect(await edits()).toEqual([]);
  await click(start); await click(row(96,3.5)); await click(row(115,4));
  await click(row(115,4),true); await click(row(135,5)); await click(end);
  await expect.poll(edits).toHaveLength(1);
  const [original] = await edits();
  expect(original.points).toHaveLength(2);
  const [first,second] = original.points;
  expect(first[2]).toBeCloseTo(row(96)[2],-1);
  expect(second[2]).toBeCloseTo(row(135)[2],-1);
  // Compare the same marker pixels with the pen lifted and active. The measured band stays in both tools.
  const [mx,my] = screen(first);
  const patch = {x:Math.round(mx)-5,y:Math.round(my)-5,width:10,height:10};
  await page.keyboard.press("l");
  await expect(page.locator("#edit-ai-move")).toHaveAttribute("aria-pressed","true");
  const bare = await page.screenshot({clip:patch});
  await page.keyboard.press("p");
  await expect.poll(async () => (await page.screenshot({clip:patch})).equals(bare)).toBe(false);
  const marked = await page.screenshot({clip:patch});
  await page.mouse.move(bounds.x+20,bounds.y+20);
  await page.screenshot({path:test.info().outputPath("redraw-markers.png")});
  await page.mouse.move(...screen(first)); await page.mouse.down();
  await page.mouse.move(...screen(row(98,6)),{steps:4}); await page.mouse.up();
  await expect.poll(async () => (await edits())[0].points[0]).not.toEqual(first);
  expect((await edits())[0].id).toBe(original.id);
  const undo = async () => {
    const restored = page.waitForResponse(r => r.url().endsWith("/move-preview") &&
      JSON.stringify(r.request().postDataJSON()?.aiCorrections?.[0]?.points) === JSON.stringify(original.points));
    await page.keyboard.press("Control+z");
    await expect.poll(edits).toEqual([original]);
    await (await restored).finished();
    await expect.poll(async () => (await page.screenshot({clip:patch})).equals(marked)).toBe(true);
  };
  await undo();
  await page.mouse.move(...screen(first)); await page.mouse.down();
  const url="**/ai-line/move-preview", reason="Insufficient clearance at route metre 105.0";
  await page.route(url, route => route.fulfill({json:{skipped:{[original.id]:reason}}}));
  await page.mouse.move(...screen(row(105,5)));
  await expect(page.locator("#edit-ai-preview")).toContainText(reason);
  const rejected = page.waitForResponse(url);
  await page.mouse.up();
  await (await rejected).finished(); await page.unroute(url);
  await expect.poll(edits).toEqual([original]);
  await click(first,true);
  await expect.poll(edits).toEqual([{...original,points:[second]}]);
  await undo();
  const between = first.map((n:number,i:number) => (n+second[i])/2);
  await click(between,true); await click(row(114,6)); await page.keyboard.press("Escape");
  await expect(page.locator("#edit-ai-redraw")).toHaveAttribute("aria-pressed","true");
  expect(await edits()).toEqual([original]);
  await click(between,true); await click(row(114,6)); await click(second);
  await expect.poll(async () => (await edits())[0]?.points.length).toBe(3);
  const [joined] = await edits();
  expect(joined).toEqual({...original,points:[first,joined.points[1],second]});
  await undo();
  await click(between,true); await click(row(155));
  await expect.poll(async () => (await edits())[0]?.end.metre).not.toBe(original.end.metre);
  expect((await edits())[0]).toMatchObject({id:original.id,points:[first]});
  await undo();
  await click(start,true); await expect.poll(edits).toEqual([]); await undo();
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

test("L and P show the installed AI line", async ({page, backend}) => {
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
  await expect(ai.getByRole("button", {name: "AI line", exact: true})).toHaveCount(0);
  await expect(ai.getByRole("button", {name: "Move line", exact: true})).toHaveAttribute("aria-pressed", "true");
  const bar = page.locator("#edit-ai-line-set");
  await expect(bar).toContainText("No AI line is installed");
  await page.keyboard.press("p");
  await expect(ai.getByRole("button", {name: "Redraw line", exact: true})).toHaveAttribute("aria-pressed", "true");
  await expect(bar).toContainText("No AI line is installed");
  await page.keyboard.press("p");
  await expect(bar).toHaveCount(0);
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

const guideResponse = (page: Page) => page.waitForResponse(r =>
  r.url().endsWith("/api/editor/alpha/ai-line/move-preview") && r.request().postDataJSON()?.guide);

async function marginTrack(page: Page, backend: Backend, redraw = false) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, ai_moves: true,
    margin_profile: true, margin_redraw: redraw});
  const url = "/api/editor/alpha/ai-line";
  expect((await (await page.request.post(url + "/recalculate", {data: {}})).json()).status).toBe("ready");
  return url;
}

async function marginMarks(page: Page) {
  const response = guideResponse(page);
  await openEditor(page);
  await keysOnView(page);
  await page.keyboard.press("m");
  const bar = page.locator("#edit-ai-margin-set");
  await expect(bar).toBeVisible();
  const guide = await (await response).json();
  const bounds = (await scene(page).boundingBox())!;
  const three = await import("three");
  const camera = new three.PerspectiveCamera(55, bounds.width / bounds.height, .5, 10000);
  camera.position.set(128, 22, 5);
  camera.lookAt(128, 0, -40);
  camera.updateMatrixWorld();
  const screenRow = (metre: number, offsetX = 0) => {
    const row = guide.rows.find((r: number[]) => r[3] >= metre);
    const p = new three.Vector3(row[0] + offsetX, row[1] + .34, row[2]).project(camera);
    const x = bounds.x + (p.x + 1) * bounds.width / 2, y = bounds.y + (1 - p.y) * bounds.height / 2;
    return {x, y, snapped:row[3] as number};
  };
  const onRow = async (metre: number, click = true) => {
    const {x,y,snapped} = screenRow(metre);
    if (click) await page.mouse.click(x, y); else await page.mouse.move(x, y, {steps: 5});
    return snapped;
  };
  await expect(bar).not.toContainText("Preparing the AI line for editing …");
  const clickRow = (metre: number) => onRow(metre);
  const moveRow = (metre: number) => onRow(metre, false);
  const start = await clickRow(105);
  const end = await clickRow(185);
  const right = bar.getByRole("spinbutton", {name: "Right", exact: true});
  await expect(right).toBeEnabled();
  await right.fill("0.75");
  await right.press("Tab");
  await keysOnView(page);
  return {bar, start, end, clickRow, moveRow, screenRow, rows: guide.rows.length};
}

type Danger = {START: number; END: number; LEFT: number; RIGHT: number};

async function passingHints(page: Page): Promise<Danger[]> {
  const response = await page.request.get("/__test/ai-hints?name=alpha");
  expect(response.ok()).toBe(true);
  const ini = (await response.text()).trim();
  if (!ini) return [];
  return ini.split(/\r?\n\s*\r?\n/).map((block, i) => {
    const [header, ...fields] = block.split(/\r?\n/);
    expect(header).toBe(`[DANGER_${i}]`);
    return Object.fromEntries(fields.map(field => {
      const [key, value] = field.split("=");
      return [key, Number(value)];
    })) as Danger;
  });
}

test.describe("Side margin", () => {
  test("fixed and Auto strips resize before the margins reply", async ({page, backend}) => {
    await marginTrack(page, backend);
    const {bar} = await marginMarks(page);
    await expect(bar).toContainText("0.75 m · set");
    const left = bar.getByRole("spinbutton",{name:"Left"});
    await left.fill("0.25"); await left.press("Enter");
    await expect(bar).toContainText("0.25 m · set");
    await keysOnView(page);
    await wheelWith(page, ["Alt"], -100); // Centre the camera on the stretch.
    const middle = await centre(scene(page));
    const strip = () => page.screenshot({clip:{x:Math.floor(middle.x)-75,y:Math.floor(middle.y)-12,width:150,height:24}});
    const before = await strip();
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/ai-line/margins", async route => { await pending; await route.continue(); });
    try {
      await left.fill("0.75"); await left.press("Enter");
      await expect.poll(async () => (await strip()).equals(before)).toBe(false);
      const fixed = await strip();
      await bar.getByRole("group",{name:"Right"}).getByRole("button",{name:"Auto"}).click();
      await expect.poll(async () => (await strip()).equals(fixed)).toBe(false);
      const automatic = await strip();
      await keysOnView(page);
      await wheelWith(page, ["Control"], -100); // Auto to explicit 0 m.
      await expect.poll(async () => (await strip()).equals(automatic)).toBe(false);
      await bar.getByRole("group",{name:"Right"}).getByRole("button",{name:"Auto"}).click();
    } finally { release(); }
    await expect(bar).toContainText("0.25–0.50 m · Auto");
    const screenshot = test.info().outputPath("side-margin-left-075-right-auto.png");
    await page.screenshot({path:screenshot});
    await test.info().attach("Left 0.75 m and Right Auto", {path:screenshot,contentType:"image/png"});
  });

  test("a newly rejected stretch emits one tool toast and hovering keeps one explanation", async ({page, backend}) => {
    await marginTrack(page, backend);
    const {bar,clickRow,moveRow} = await marginMarks(page);
    await clickRow(80); await clickRow(80);
    const right = bar.getByRole("spinbutton",{name:"Right"});
    await right.fill("0.50"); await right.press("Enter");
    const message = /Empty side margin at route metre/;
    const toast = page.locator("#edit-tool-toasts p").filter({hasText:message});
    await expect(toast).toHaveCount(1);
    await moveRow(80);
    await expect(bar).toContainText("Left ");
    expect((await bar.innerText()).match(/Empty side margin/g)).toHaveLength(1);
    await expect(scene(page)).not.toHaveAttribute("title",message);
    await expect(toast).toHaveCount(0);
    await right.fill("0.55"); await right.press("Enter");
    await moveRow(100); await moveRow(80);
    await expect(bar).toContainText("Left ");
    await expect(toast).toHaveCount(0);
  });

  test("one Recalculate click places a first margin on an older line", async ({page, backend}) => {
    const url = await marginTrack(page, backend);
    await backend.post("/__test/ai-line-legacy", {name: "alpha"});
    const {bar} = await marginMarks(page);
    await expect(bar).toContainText("Recalculate the AI line to place side margins");
    let recalculations = 0;
    page.on("request", r => { if (r.url().endsWith(url + "/recalculate")) recalculations++; });
    await page.getByRole("button", {name: "Recalculate AI line"}).click();
    await page.locator("#save-dialog").getByRole("button", {name: "Overwrite"}).click();
    await expect(page.getByText("AI line updated", {exact: true})).toBeVisible();
    expect(recalculations).toBe(1);
    const sections = await passingHints(page);
    expect(sections.map(s => [s.LEFT, s.RIGHT])).toEqual([[.25, .25], [.25, .75], [.50, .75], [.50, .50]]);
    expect((await (await page.request.get(url)).json()).hints).toMatchObject({state: "current", unplaced: null});
  });

  test("Side margin overrides one side and reaches ai_hints.ini", async ({page, backend}) => {
    const url = await marginTrack(page, backend, true);
    const installed = await (await page.request.get(url)).json();
    const bytes = async () => (await page.request.get(url + "?r=" + (await (await page.request.get(url)).json()).revision)).body();
    const before = await bytes();
    const auto = await passingHints(page);
    const {bar, start, end, rows} = await marginMarks(page);
    expect(installed.count).toBeGreaterThan(rows);
    const margins = async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).aiMargins;
    await expect.poll(margins).toMatchObject([{left: null, right: .75}]);
    const [margin] = await margins();
    expect(margin.start.metre).toBeCloseTo(start, 2);
    expect(margin.end.metre).toBeCloseTo(end, 2);
    await expect(bar).toContainText("0.75 m · set");
    await expect(bar).toContainText("0.25–0.50 m · Auto");
    await page.keyboard.press("Control+z");
    await expect.poll(margins).toEqual([]);
    await page.keyboard.press("Control+y");
    await expect.poll(margins).toEqual([margin]);
    await page.keyboard.press("x");
    await expect.poll(margins).toEqual([]);
    await expect(bar).not.toContainText("0.75 m · set");
    await page.keyboard.press("Control+z");
    await expect.poll(margins).toEqual([margin]);
    await page.getByRole("button", {name: "Recalculate AI line"}).click();
    await expect.poll(async () => (await passingHints(page)).length).toBe(4);
    const sections = await passingHints(page);
    await test.info().attach("ai_hints.ini", {body: await (await page.request.get("/__test/ai-hints?name=alpha")).body(),
      contentType: "text/plain"});
    expect(sections.map(s => [s.LEFT, s.RIGHT])).toEqual([[.25, .25], [.25, .75], [.50, .75], [.50, .50]]);
    expect(sections.map(s => s.START)).toEqual([0, sections[0].END, auto[1].START, sections[2].END]);
    expect(sections[1].END).toBe(auto[0].END);
    expect(sections[3].END).toBe(1);
    // From route metre 105 onward the fixture is straight, so its remaining 3D distance equals the route distance.
    const count = installed.count;
    const x = (i: number) => before.readFloatLE(i * 4);
    const y = (i: number) => before.readFloatLE((count + i) * 4);
    const z = (i: number) => before.readFloatLE((2 * count + i) * 4);
    let length = 0;
    for (let i = 1; i < count; i++) length += Math.hypot(x(i)-x(i-1), y(i)-y(i-1), z(i)-z(i-1));
    expect(sections[0].END).toBeCloseTo(1 - (-z(count - 1) - start) / length, 5);
    expect(sections[2].END).toBeCloseTo(1 - (-z(count - 1) - end) / length, 5);
    expect(await bytes()).toEqual(before);
    expect(await (await page.request.get(url)).json()).toMatchObject({validity: "ready", hints: {state: "current"}});
  });

  test("an unapplied stretch is visible and pickable on a legacy line", async ({page, backend}) => {
    await marginTrack(page, backend);
    await backend.post("/__test/ai-line-legacy", {name:"alpha"});
    const automatic = await passingHints(page);
    const {bar, clickRow, moveRow, screenRow} = await marginMarks(page);
    await page.keyboard.press("Escape");
    await page.keyboard.press("m");
    await moveRow(145);
    await expect(scene(page)).toHaveAttribute("title", /not yet applied/i);
    await clickRow(145);
    await expect(bar.getByRole("spinbutton", {name:"Right"})).toHaveValue("0.75");
    await expect(bar).toContainText(/not yet applied/i);
    expect(await passingHints(page)).toEqual(automatic);
    await page.mouse.move(AWAY.x, AWAY.y);
    // This northbound section has a 3.1 m right half-width and a 0.75 m reserve.
    const {x,y} = screenRow(145, 2.8);
    const sample = () => page.screenshot({clip:{x:Math.floor(x)-2,y:Math.floor(y)-2,width:5,height:5}});
    const highlighted = await sample();
    await page.keyboard.press("x");
    await expect.poll(async () => (await sample()).equals(highlighted)).toBe(false);
    await page.keyboard.press("Control+z");
    await expect.poll(async () => (await sample()).equals(highlighted)).toBe(true);

    // Even a freshly marked pair, before the first manual value, is display-only here.
    await clickRow(65);
    await clickRow(95);
    await moveRow(80);
    await expect(scene(page)).toHaveAttribute("title", /not yet applied/i);
  });

  test("an open stretch marked backwards applies and cycles by its first metre", async ({page, backend}) => {
    await marginTrack(page, backend);
    const {bar,clickRow} = await marginMarks(page); // Right 0.75 on 106–185 m.
    const right = bar.getByRole("spinbutton",{name:"Right"});
    await clickRow(70); await clickRow(85);
    await right.fill("0.40"); await right.press("Enter");
    await expect(bar).toContainText("0.40 m · set");
    await clickRow(200); await clickRow(80);
    await right.fill("0.60"); await right.press("Enter");
    await expect(bar).toContainText("0.60 m · set");
    await keysOnView(page);
    await wheelWith(page, ["Alt"], -100);
    await expect(right).toHaveValue("0.75"); // In driving order the starts are 70, 80, 106 m.
  });

  test("dragging either margin endpoint makes one undo step on release", async ({page, backend}) => {
    await marginTrack(page, backend);
    const {bar, start, end, moveRow} = await marginMarks(page);
    const margins = async () => (await (await page.request.get("/api/editor/alpha/edits")).json()).aiMargins;
    for (const [key, from, to] of [["start", start, 80], ["end", end, 215]] as const) {
      await moveRow(from);
      await page.mouse.down();
      const snapped = await moveRow(to);
      expect((await margins())[0][key].metre).toBeCloseTo(from, 2);
      await page.mouse.up();
      await expect.poll(async () => (await margins())[0]?.[key].metre).toBeCloseTo(snapped, 2);
      await page.keyboard.press("Control+z");
      await expect.poll(async () => (await margins())[0]?.[key].metre).toBeCloseTo(from, 2);
    }
    await expect(bar.getByRole("spinbutton", {name:"Right"})).toHaveValue("0.75");
  });

  test("wheel edits and cycles overlapping stretches and saves the winning sides to the INI", async ({page, backend}) => {
    await marginTrack(page, backend);
    const {bar, clickRow} = await marginMarks(page);
    const left = bar.getByRole("spinbutton", {name:"Left", exact:true});
    const right = bar.getByRole("spinbutton", {name:"Right", exact:true});
    await expect(bar.getByRole("button", {name:"New stretch"})).toHaveCount(0);
    await expect(bar.getByRole("combobox")).toHaveCount(0);
    await clickRow(80);
    await clickRow(145);
    await wheelWith(page, ["Shift"], -100);
    await expect(left).toHaveValue("0");
    await wheelWith(page, ["Shift"], -100);
    await expect(left).toHaveValue("0.05");
    await right.fill("0.95"); await right.press("Tab");
    await keysOnView(page);
    await wheelWith(page, ["Control"], -100);
    await wheelWith(page, ["Control"], -100);
    await expect(right).toHaveValue("1");
    await wheelWith(page, ["Shift"], 100);
    await wheelWith(page, ["Shift"], 100);
    await expect(left).toHaveValue("");
    await clickRow(175);
    await expect(right).toHaveValue("0.75");
    await clickRow(115);
    await expect(right).toHaveValue("1");
    await wheelWith(page, ["Alt"], -100);
    await expect(right).toHaveValue("0.75");
    // The selected stretch is now under the camera's central ray.
    const middle = await centre(scene(page));
    await page.mouse.move(middle.x, middle.y);
    await expect(bar).toContainText("Left 0.50 m · Right 1.00 m");
    await wheelWith(page, ["Alt"], 100);
    await expect(right).toHaveValue("1");
    await page.getByRole("button", {name:"Recalculate AI line"}).click();
    await page.locator("#save-dialog").getByRole("button", {name:"Overwrite"}).click();
    const expected = [[.25,.25],[.25,1],[.50,1],[.50,.75],[.50,.50]];
    await expect.poll(async () => (await passingHints(page)).map(s => [s.LEFT,s.RIGHT])).toEqual(expected);
    await test.info().attach("overlap-ai_hints.ini", {body: await (await page.request.get("/__test/ai-hints?name=alpha")).body(), contentType:"text/plain"});
  });

  test("reopening a track saved while AC was open enables a hint-only Recalculate", async ({page, backend}) => {
    const url = await marginTrack(page, backend);
    const automatic = await passingHints(page);
    await marginMarks(page);
    await backend.post("/__test/ac-running", {running: true});
    await saveTrack(page);
    const meta = async () => (await page.request.get(url)).json();
    await expect.poll(meta).toMatchObject({validity: "ready", hints: {state: "stale"}});
    expect(await passingHints(page)).toEqual(automatic);
    await backend.post("/__test/ac-running", {running: false});
    await openEditor(page);
    const recalculate = page.getByRole("button", {name: "Recalculate AI line"});
    await expect(recalculate).toBeEnabled();
    await recalculate.click();
    await expect(recalculate).toBeDisabled();
    await expect.poll(meta).toMatchObject({validity: "ready", hints: {state: "current"}});
    expect((await passingHints(page)).map(s => s.RIGHT)).toEqual([.25, .75, .75, .50]);
  });

  test("a replacement from another editor refreshes the displayed lane before using new preview fractions", async ({page, backend}) => {
    const url = await marginTrack(page, backend);
    const installed = await (await page.request.get(url)).json();
    const {bar} = await marginMarks(page);
    await expect(bar).toContainText("0.25–0.50 m · Auto");
    await backend.post("/__test/ai-line", {name: "alpha"});
    const replacement = await (await page.request.get(url)).json();
    const replies: number[] = [], reads: string[] = [];
    page.on("response", response => {
      if (response.url().endsWith(url + "/margins") && response.request().postDataJSON()?.revision === installed.revision)
        replies.push(response.status());
      if (response.url().includes(url + "?r=")) reads.push(response.url());
    });
    const right = bar.getByRole("spinbutton", {name: "Right", exact: true});
    await right.fill("0.65");
    await right.press("Tab");
    await expect.poll(() => replies).toContain(409);
    await expect.poll(() => reads).toContain(backend.url + url + "?r=" + replacement.revision);
    await expect(bar).toContainText("Not applied: the AI line was replaced by hand");
  });

  test("shows a guide preparation error in the active AI tool", async ({page, backend}) => {
    await marginTrack(page, backend);
    const message = "No supported driving surface at route metre 70";
    await page.route("**/ai-line/move-preview", route =>
      route.fulfill({status: 400, json: {error: message}}));
    await openEditor(page);
    await keysOnView(page);
    for (const [key, id] of [["l", "line"], ["p", "line"], ["m", "margin"]]) {
      await page.keyboard.press(key);
      await expect(page.locator(`#edit-ai-${id}-set`)).toContainText(message);
    }
  });

  test("opens one guide in the background and shares its pending response across all AI tools", async ({page, backend}) => {
    await marginTrack(page, backend);
    await backend.post("/__test/hold-guide", {hold: true});
    const requests: string[] = [];
    page.on("request", r => {
      if (r.url().endsWith("/ai-line/move-preview") && r.postDataJSON()?.guide) requests.push(r.url());
    });
    const response = guideResponse(page);
    await openEditor(page);
    await expect.poll(() => requests.length).toBe(1);
    await keysOnView(page);
    for (const [key, id] of [["l", "line"], ["p", "line"], ["m", "margin"]]) {
      await page.keyboard.press(key);
      await expect(page.locator(`#edit-ai-${id}-set`)).toContainText("Preparing the AI line for editing …");
    }
    await backend.post("/__test/hold-guide", {hold: false});
    expect((await (await response).json()).rows.length).toBeGreaterThan(0);
    await expect(page.locator("#edit-ai-margin-set")).not.toContainText("Preparing the AI line for editing …");
    await page.keyboard.press("l");
    await expect(page.locator("#edit-ai-move")).toHaveAttribute("aria-pressed", "true");
    expect(requests).toHaveLength(1);
  });
});
