import {execFileSync} from "node:child_process";
import {join} from "node:path";
import {expect, openEditor, scene, test} from "./fixtures";
import {picture, saved} from "./edit-helpers";

async function prepare(page: import("@playwright/test").Page) {
  const repo = join(import.meta.dirname, "../.."), python = join(repo, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
  const raw = execFileSync(python, [join(repo, "ui/e2e/model_fixture.py")]);
  await page.evaluate(async base64 => {
    const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const prepared = await (await fetch("/api/library/model-imports?filename=group.glb", {method: "POST", headers: {"Content-Type": "application/x-map2lap-glb"}, body: raw})).json();
    for (const [name, category] of [["Group oak", "tree"], ["Group bush", "bush"]]) {
      const r = await fetch("/api/library/models", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({token: prepared.token, filename: "group.glb", name, category, collision: "none"})});
      if (!r.ok) throw new Error(await r.text());
    }
  }, raw.toString("base64"));
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  const library = page.getByRole("dialog", {name: "Asset library"});
  await library.getByRole("tab", {name: "GROUPS", exact: true}).click();
  await library.getByLabel("Group name", {exact: true}).fill("Waldrand");
  await library.getByRole("button", {name: "Add Group oak", exact: true}).click();
  await library.getByRole("button", {name: "Add Group bush", exact: true}).click();
  return library;
}

const draft = async (page: import("@playwright/test").Page) => (await page.request.get("/api/editor/alpha/edits")).json();
const preview = async (page: import("@playwright/test").Page) => page.evaluate(() => (performance.getEntriesByName("map2lap.groups.preview").at(-1) as PerformanceMark)?.detail);

test("a saved mixture paints locally before any placement request and commits one undoable stroke", async ({page}, info) => {
  await openEditor(page); const library = await prepare(page);
  await library.screenshot({path: info.outputPath("groups-library.png")});
  await library.getByRole("button", {name: "Save group", exact: true}).click();
  await expect.poll(async () => (await (await page.request.get("/api/library/groups")).json()).items.length).toBe(1);
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  await expect(library).toBeHidden();
  await expect(page.locator("#edit-group-set")).toBeVisible();
  const before = await picture(page), box = (await scene(page).boundingBox())!;
  let placements = 0, meshes = 0;
  const watch = (r: import("@playwright/test").Request) => {
    if (r.method() === "POST" && /\/api\/editor\/alpha\/model$/.test(r.url())) placements++;
    if (/\/api\/editor\/alpha\/mesh\//.test(r.url())) meshes++;
  };
  page.on("request", watch);
  await page.mouse.move(box.x + 600, box.y + 400); await page.mouse.down();
  await expect.poll(async () => (await preview(page))?.count ?? 0).toBeGreaterThan(2);
  expect(placements).toBe(0); expect(meshes).toBe(0); expect((await draft(page)).models ?? []).toHaveLength(0);
  const shown = await picture(page); expect(shown.equals(before)).toBe(false);
  await scene(page).screenshot({path: info.outputPath("groups-browser-preview.png")});
  await info.attach("group-preview-browser-only", {body: shown, contentType: "image/png"});
  await page.mouse.move(box.x + 630, box.y + 410, {steps: 6}); await page.mouse.up();
  await expect.poll(async () => (await draft(page)).models?.length ?? 0).toBeGreaterThan(2);
  await saved(page);
  const placed = await draft(page), count = placed.models.length;
  expect(placements).toBe(1); expect(placed.placed).toHaveLength(count);
  expect(new Set(placed.models.map((m: {asset: string}) => m.asset)).size).toBe(2);
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name: /Undo/}).click();
  await expect.poll(async () => (await draft(page)).models?.length ?? 0).toBe(0);
  await page.getByRole("button", {name: /Redo/}).click();
  await expect.poll(async () => (await draft(page)).models?.length).toBe(count);
  await saved(page); await picture(page); await openEditor(page);
  expect((await draft(page)).placed).toEqual(placed.placed);
  expect((await draft(page)).models).toEqual(placed.models);
});

test("Escape cancels a live browser preview; deleting the group keeps already placed models", async ({page}) => {
  await openEditor(page); const library = await prepare(page);
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  const box = (await scene(page).boundingBox())!;
  await page.mouse.move(box.x + 600, box.y + 400); await page.mouse.down();
  await expect.poll(async () => (await preview(page))?.count ?? 0).toBeGreaterThan(0);
  await page.keyboard.press("Escape"); await page.mouse.up();
  expect((await draft(page)).models ?? []).toHaveLength(0);
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await expect(library.getByRole("tab", {name: "GROUPS"})).toHaveAttribute("aria-selected", "true");
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  await scene(page).click({position: {x: 600, y: 400}});
  await expect.poll(async () => (await draft(page)).models?.length ?? 0).toBeGreaterThan(0);
  await page.keyboard.press("Escape"); await saved(page);
  const models = (await draft(page)).models;
  await page.getByRole("button", {name: "Library", exact: true}).click();
  await library.getByRole("button", {name: "Delete group", exact: true}).click();
  await expect.poll(async () => (await (await page.request.get("/api/library/groups")).json()).items.length).toBe(0);
  expect((await draft(page)).models).toEqual(models);
});

test("refused placement drops the local group and leaves the draft unchanged", async ({page}) => {
  await openEditor(page); const library = await prepare(page);
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  await page.route("**/api/editor/alpha/model", route => route.fulfill({status: 409, json: {error: "Group refused for test"}}));
  await scene(page).click({position: {x: 600, y: 400}});
  await expect(page.locator("#edit-group-set")).toContainText("Group refused for test");
  expect((await draft(page)).models ?? []).toHaveLength(0);
  await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.groups.resources").at(-1) as PerformanceMark)?.detail?.instances)).toBe(0);
});

for (const status of [400, 409]) test(`a failed draft write (${status}) after Esc removes the whole group and reports a persistent error`, async ({page}) => {
  await openEditor(page); const library = await prepare(page);
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  let reject!: () => void, reached!: () => void;
  const release = new Promise<void>(resolve => { reject = resolve; }), writing = new Promise<void>(resolve => { reached = resolve; });
  await page.route("**/api/editor/alpha/edits", async route => {
    if (route.request().method() !== "PUT" || !route.request().postDataJSON()?.models?.length) return route.continue();
    reached(); await release; await route.fulfill({status, json: {error: "Group draft rejected"}});
  });
  try {
    await scene(page).click({position: {x: 600, y: 400}}); await writing;
    await page.keyboard.press("Escape"); reject();
    await expect(page.locator("#edit-group-failed")).toContainText(status === 409 ? "This track was changed elsewhere" : "Group draft rejected");
    await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.groups.resources").at(-1) as PerformanceMark)?.detail?.instances)).toBe(0);
    expect((await draft(page)).models ?? []).toHaveLength(0);
  } finally { reject(); }
});

test("a completed click survives immediate Esc and renders many plants in a bounded number of batches", async ({page}, info) => {
  await openEditor(page); const library = await prepare(page);
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  await page.locator("#edit-group-set").getByRole("spinbutton", {name: /Density/}).fill("100");
  await page.locator("#edit-group-set").getByRole("spinbutton", {name: /Spacing/}).fill("0.5");
  const meshResponses: Promise<number>[] = [];
  page.on("response", response => {
    if (/\/api\/editor\/alpha\/mesh\//.test(response.url())) meshResponses.push(response.body().then(b => b.length));
  });
  // Fixed scatter seed makes the old/new transfer and resource measurements use the same plants.
  await page.evaluate(() => {
    const original = crypto.getRandomValues.bind(crypto);
    Object.defineProperty(crypto, "getRandomValues", {value: (array: Uint32Array) =>
      array instanceof Uint32Array && array.length === 1 ? array.fill(12345) : original(array)});
  });
  const started = Date.now();
  await scene(page).click({position: {x: 600, y: 400}}); await page.keyboard.press("Escape");
  await expect.poll(async () => (await draft(page)).models?.length ?? 0).toBeGreaterThan(100);
  await saved(page);
  await expect.poll(() => page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail?.instances ?? 0), {timeout: 30000}).toBeGreaterThan(100);
  const confirmedMs = Date.now() - started;
  await picture(page);
  const stats = await page.evaluate(() => (performance.getEntriesByName("map2lap.models.resources").at(-1) as PerformanceMark)?.detail);
  expect(stats.instances).toBeGreaterThan(100); expect(stats.renderBatches).toBeLessThan(20);
  expect(stats.shared).toHaveLength(2);
  const downloads = await Promise.all(meshResponses);
  const measurement = {instances: stats.instances, confirmedMs, meshDownloads: downloads.length,
    meshBytes: downloads.reduce((sum, n) => sum + n, 0), resources: stats};
  await info.attach("stroke-measurement", {body: JSON.stringify(measurement, null, 2), contentType: "application/json"});
  expect(downloads).toEqual([]);
  expect(stats.pickingGeometryBytes).toBe(0);
  await info.attach("group-render-resources", {body: JSON.stringify(stats, null, 2), contentType: "application/json"});
  await scene(page).screenshot({path: info.outputPath("group-instances.png")});
});

test("Undo pressed while the local models load waits for that completed stroke", async ({page}) => {
  await openEditor(page); const library = await prepare(page);
  await library.getByRole("button", {name: "Paint group", exact: true}).click();
  let release!: () => void, reached!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), started = new Promise<void>(resolve => { reached = resolve; });
  await page.route("**/api/library/models/*/original", async route => { reached(); await gate; await route.continue(); });
  const written = page.waitForResponse(r => r.url().endsWith("/api/editor/alpha/edits") && r.request().method() === "PUT" && r.request().postDataJSON()?.models?.length > 0);
  try {
    await scene(page).click({position: {x: 600, y: 400}}); await started;
    await page.keyboard.press("Control+z"); release(); await written;
    await expect.poll(async () => (await draft(page)).models?.length ?? 0).toBe(0);
    await saved(page);
    await page.getByRole("button", {name: /Redo/}).click();
    await expect.poll(async () => (await draft(page)).models?.length ?? 0).toBeGreaterThan(0);
  } finally { release(); }
});
