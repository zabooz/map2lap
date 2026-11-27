import {expect, openEditor, scene, test} from "./fixtures";
import {createHash} from "node:crypto";
import {PerspectiveCamera, Vector3} from "three";
import {saved} from "./edit-helpers";

test("a recording can finish and close when session storage is blocked", async ({page, backend}) => {
  await page.addInitScript(() => Object.defineProperty(window, "sessionStorage", {
    get() { throw new DOMException("Storage blocked", "SecurityError"); },
  }));
  await backend.post("/__test/recording-track", {stage: true});
  await openEditor(page);
  await page.getByRole("button", {name: "Record AI line", exact: true}).click();
  const dialog = page.getByRole("dialog", {name: "Record AI line"});
  await expect(dialog).toContainText("Recording practice is open");
  await backend.post("/__test/finish-recording", {});
  await expect(dialog.getByRole("img")).toBeVisible();
  await dialog.getByRole("button", {name: "Discard"}).click();
  await expect(dialog).toBeHidden();
});

for (const course of ["circuit", "A–B route"]) test(`recording on ${course} previews, discards, resets, and survives Save, Undo, Redo and Save as`, async ({page, backend}) => {
  await backend.post("/__test/recording-track", {stage:course === "A–B route"});
  await openEditor(page);
  const draft = async (name="alpha") => (await page.request.get(`/api/editor/${name}/edits`)).json();
  const installed = async (name="alpha") => {
    const url = `/api/editor/${name}/ai-line`;
    const meta = await (await page.request.get(url)).json();
    return (await page.request.get(url+"?r="+meta.revision)).body();
  };
  const before = await draft(), bytes = await installed();
  expect(before.aiMargins).toHaveLength(3); expect(before.aiCorrections).toHaveLength(1);
  const dialog = page.getByRole("dialog", {name:"Record AI line"});
  async function drive() {
    await page.getByRole("button",{name:"Record AI line",exact:true}).click();
    await expect(dialog).toContainText("Recording practice is open");
    await backend.post("/__test/finish-recording",{});
    await expect(dialog.getByRole("img")).toBeVisible();
    await expect(dialog.getByLabel("Reset AI hints (3)")).not.toBeChecked();
    await expect(dialog.getByLabel("Reset Move / Redraw corrections (1)")).not.toBeChecked();
    await expect(dialog.getByText(/Braking.*Applies to recording/)).toHaveCount(3);
  }
  if (course === "A–B route") {
    await page.getByRole("button",{name:"Record AI line",exact:true}).click();
    await expect(dialog).toContainText("finish B");
    await expect(dialog).toContainText("Recording practice is open");
    await backend.post("/__test/finish-recording",{partial:true});
    await expect(dialog.getByRole("alert")).toContainText("FINISH");
    await dialog.getByRole("button",{name:"Close"}).click();
    expect(await draft()).toEqual(before);
  }
  await drive();
  if (course === "A–B route") await expect(dialog.getByRole("img")).toHaveAccessibleName(/A–B/);
  await dialog.getByRole("button",{name:"Discard"}).click();
  expect(await draft()).toEqual(before);
  await drive();
  await dialog.getByLabel("Reset AI hints (3)").check();
  await dialog.getByLabel("Reset Move / Redraw corrections (1)").check();
  await dialog.getByRole("button",{name:"Accept recording"}).click();
  await saved(page);
  const selected = await draft();
  expect(selected.aiLine).toMatch(/^[a-f0-9]{64}$/);
  expect(selected.aiMargins).toEqual([]); expect(selected.aiCorrections).toEqual([]);
  expect(await installed()).toEqual(bytes);
  await page.keyboard.press("Control+z"); await saved(page);
  expect((await draft()).aiMargins).toEqual(before.aiMargins);
  expect((await draft()).aiCorrections).toEqual(before.aiCorrections);
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  await page.locator("#scene canvas").click({position:{x:10,y:10}});
  await page.keyboard.press("Control+y"); await saved(page);
  expect((await draft()).aiLine).toBe(selected.aiLine);
  await page.locator("#edit-save").click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved/);
  const chosen = await installed();
  expect(chosen.equals(bytes)).toBe(false);
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  const source = `/api/editor/alpha/ai-line/source/${selected.aiLine}`;
  const meta = await (await page.request.get(source)).json();
  expect(await (await page.request.get(source+"?r="+meta.revision)).body()).toEqual(chosen);
  const widths = new Float32Array(Uint8Array.from(chosen).buffer, meta.count*10*4, meta.count*2);
  expect(Math.min(...widths)).toBeGreaterThan(0);
  await page.getByRole("button",{name:/Undo/}).click(); await saved(page);
  expect((await draft()).aiMargins).toEqual(before.aiMargins);
  await page.locator("#edit-save-more").click();
  await page.locator("#save-dialog").getByRole("button",{name:"Save as new track"}).click();
  await expect(page.locator("#edit-track")).not.toHaveValue("alpha");
  const copy = await page.locator("#edit-track").inputValue();
  expect(await installed(copy)).toEqual(bytes);
  expect(await installed()).toEqual(chosen);
  await page.getByRole("button",{name:/Redo/}).click(); await saved(page);
  expect((await draft(copy)).aiLine).toEqual(selected.aiLine);
  await page.locator("#edit-save").click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved/);
  expect(await installed(copy)).toEqual(chosen);
});

for (const course of ["circuit", "A–B route"]) test(`kept hints on ${course} follow only verified stretches; a cancelled or invalid next drive leaves history alone`, async ({page, backend}) => {
  await backend.post("/__test/recording-track", {stage:course === "A–B route"});
  await openEditor(page);
  const dialog = page.getByRole("dialog", {name:"Record AI line"});
  const drive = async (result: object) => {
    await page.getByRole("button",{name:"Record AI line",exact:true}).click();
    await expect(dialog).toContainText("Recording practice is open");
    await backend.post("/__test/finish-recording",result);
  };
  await drive({detour:true});
  await expect(dialog.getByText(/Braking.*Applies to recording/)).toHaveCount(2);
  await expect(dialog.getByText(/Braking.*Stored only/)).toHaveCount(1);
  await dialog.getByRole("button",{name:"Accept recording"}).click(); await saved(page);
  await page.locator("#edit-save").click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved/);
  const read = async () => (await page.request.get("/api/editor/alpha/edits")).json();
  const kept = await read();
  expect(kept.aiCorrections).toHaveLength(1);
  expect(kept.aiMargins).toHaveLength(3);
  const status = await (await page.request.get("/api/editor/alpha/ai-line")).json();
  expect(Object.keys(status.hints.rejected)).toEqual(["brake1"]);
  for (const outcome of [{cancel:true}, {invalid:true}]) {
    await drive(outcome);
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(dialog.getByRole("button",{name:"Accept recording"})).toHaveCount(0);
    await dialog.getByRole("button",{name:"Close"}).click();
    expect(await read()).toEqual(kept);
  }
});

test("a braking zone colours the band beside the driven path on a recording without side limits", async ({page,backend}) => {
  await backend.post("/__test/recording-track", {});
  await openEditor(page);
  await page.getByRole("button",{name:"Record AI line",exact:true}).click();
  const dialog = page.getByRole("dialog",{name:"Record AI line"});
  await expect(dialog).toContainText("Recording practice is open");
  await backend.post("/__test/finish-recording",{});
  await dialog.getByLabel("Reset AI hints (3)").check();
  await dialog.getByRole("button",{name:"Accept recording"}).click();
  await saved(page);
  await page.getByRole("button",{name:"Braking",exact:true}).click();
  const bar = page.locator("#edit-ai-braking-set");
  await expect(bar).toContainText("Click A on the AI line");
  const bounds = (await scene(page).boundingBox())!;
  const camera = new PerspectiveCamera(55,bounds.width/bounds.height,.5,10000);
  camera.position.set(128,22,5); camera.lookAt(128,0,-40); camera.updateMatrixWorld();
  // Sample inside the band, one metre outside the 40 m radius of the recorded centreline.
  const point = (degrees: number): [number,number] => {
    const a = degrees * Math.PI/180;
    const p = new Vector3(129+41*Math.cos(a),.3,-96+41*Math.sin(a)).project(camera);
    return [bounds.x+(p.x+1)*bounds.width/2,bounds.y+(1-p.y)*bounds.height/2];
  };
  const [x,y] = point(90);
  const sample = () => page.screenshot({clip:{x:Math.round(x),y:Math.round(y),width:2,height:2}});
  const before = await sample();
  await page.mouse.click(...point(75));
  await expect(bar).toContainText("Click B on the AI line");
  await page.mouse.click(...point(105));
  await expect(bar.getByRole("spinbutton")).toBeEnabled();
  await expect.poll(async () => (await sample()).equals(before)).toBe(false);
  await page.getByRole("button",{name:"Corner speed",exact:true}).click();
  await page.mouse.click(x,y);
  await expect(page.locator("#edit-ai-braking")).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"Move line",exact:true}).click();
  await expect(page.locator("#edit-ai-line-set")).toContainText("Free");
  await page.getByRole("button",{name:"Redraw line",exact:true}).click();
  await expect(page.locator("#edit-ai-line-set")).toContainText("Free");
  await saved(page);
  const draft = async () => (await page.request.get("/api/editor/alpha/edits")).json();
  const {aiLine, aiCorrections, aiMargins} = await draft();
  const prepared = await (await page.request.post("/api/editor/alpha/ai-line/prepare", {
    data:{source:aiLine, aiCorrections},
  })).json();
  const recalculate = page.getByRole("button",{name:"Recalculate AI line"});
  await recalculate.click();
  await expect(recalculate).toBeDisabled();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved/);
  expect(await draft()).toMatchObject({aiLine, aiCorrections, aiMargins});
  const bytes = await (await page.request.get("/__test/fast-lane?name=alpha")).body();
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(prepared.file);
  expect(await (await page.request.get("/__test/ai-hints?name=alpha")).text()).toContain("[BRAKEHINT_0]");
});

for (const course of ["circuit", "A–B route"]) test(`Move and Redraw on ${course} edit the driven centreline and publish their geometry together`, async ({page,backend}) => {
  await backend.post("/__test/recording-track", {stage:course === "A–B route"});
  await openEditor(page);
  await page.getByRole("button",{name:"Record AI line",exact:true}).click();
  const dialog = page.getByRole("dialog",{name:"Record AI line"});
  await expect(dialog).toContainText("Recording practice is open");
  await backend.post("/__test/finish-recording",{});
  await dialog.getByLabel("Reset AI hints (3)").check();
  await dialog.getByLabel("Reset Move / Redraw corrections (1)").check();
  await dialog.getByRole("button",{name:"Accept recording"}).click();
  await saved(page);
  const read = async () => (await page.request.get("/api/editor/alpha/edits")).json();
  const source = (await read()).aiLine;
  const url = "/api/editor/alpha/ai-line";
  const base = await (await page.request.post(url+"/prepare",{data:{source,aiCorrections:[]}})).json();
  const bounds = (await scene(page).boundingBox())!;
  const camera = new PerspectiveCamera(55,bounds.width/bounds.height,.5,10000);
  camera.position.set(128,22,5); camera.lookAt(128,0,-40); camera.updateMatrixWorld();
  const onTrack = (degrees:number, offset=0): [number,number] => {
    const angle = degrees*Math.PI/180;
    const world = course === "A–B route" ? new Vector3(129+offset,.34,-degrees)
      : new Vector3(129+(40+offset)*Math.cos(angle),.34,-96+(40+offset)*Math.sin(angle));
    const p = world.project(camera);
    return [bounds.x+(p.x+1)*bounds.width/2,bounds.y+(1-p.y)*bounds.height/2];
  };
  await expect(page.locator("#edit-ai-move")).toHaveAttribute("aria-pressed","true");
  await expect.poll(async () => {
    await page.mouse.move(...onTrack(71.25));
    return scene(page).evaluate(el => getComputedStyle(el).cursor);
  }).toBe("grab");
  const movedBand = page.waitForResponse(r => r.url().includes("/ai-line/prepared/") && r.url().includes("?r="));
  await page.mouse.down(); await page.mouse.move(...onTrack(71.25,2),{steps:8}); await page.mouse.up();
  await expect.poll(async () => (await read()).aiCorrections).toMatchObject([{kind:"move"}]);
  await (await movedBand).finished();
  await page.getByRole("button",{name:"Redraw line",exact:true}).click();
  await expect.poll(async () => {
    await page.mouse.move(...onTrack(105));
    return scene(page).evaluate(el => getComputedStyle(el).cursor);
  }).toBe("crosshair");
  for (const at of [105,123.75]) {
    const xy = onTrack(at);
    expect(await page.evaluate(([x,y]) => document.elementFromPoint(x,y)?.tagName, xy)).toBe("CANVAS");
    await page.mouse.click(...xy);
  }
  await expect.poll(async () => (await read()).aiCorrections).toMatchObject([{kind:"move"},{kind:"redraw"}]);
  const moves = (await read()).aiCorrections;
  const chosen = await (await page.request.post(url+"/prepare",{data:{source,aiCorrections:moves}})).json();
  expect(chosen.skipped).toEqual({});
  expect(chosen.file).not.toBe(base.file);
  await page.locator("#edit-save").click();
  await expect(page.locator("#edit-saved")).toHaveText(/^Saved/);
  const binary = async (url:string) => {
    const meta = await (await page.request.get(url)).json();
    return (await page.request.get(url+"?r="+meta.revision)).body();
  };
  expect(await binary(url)).toEqual(await binary(url+"/prepared/"+chosen.file));
  await page.reload(); await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
  expect((await read()).aiCorrections).toEqual(moves);
});

test.describe("Recording controls with a German browser locale", () => {
  test.use({locale:"de-AT"});
  test("shows the English controls with both resets initially clear", async ({page, backend}) => {
    await backend.post("/__test/recording-track", {});
    await openEditor(page);
    await page.getByRole("button",{name:"Record AI line",exact:true}).click();
    const dialog = page.getByRole("dialog",{name:"Record AI line"});
    await expect(dialog).toContainText("Recording practice is open.");
    await backend.post("/__test/finish-recording",{});
    await expect(dialog.getByRole("button",{name:"Accept recording"})).toBeEnabled();
    await expect(dialog.getByLabel("Reset AI hints (3)")).not.toBeChecked();
    await expect(dialog.getByLabel("Reset Move / Redraw corrections (1)")).not.toBeChecked();
    await dialog.getByRole("button",{name:"Discard"}).click();
  });
});
