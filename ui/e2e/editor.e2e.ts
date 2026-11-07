// The Editor: a track in 3D, the camera, the hover box, loading and its faults.
import {centre, dragMouse, expect, openEditor, openSettings, scene, stillView, test} from "./fixtures";

const box = (page: import("@playwright/test").Page) => page.locator("#hover-box");

async function hoverCentre(page: import("@playwright/test").Page) {
  const c = await centre(scene(page));
  await page.mouse.move(c.x - 2, c.y);
  await page.mouse.move(c.x, c.y);
  return c;
}

test("a track chosen shows in 3D; the map comes back on New track", async ({page}) => {
  await openEditor(page);
  await expect(page.locator("#scene")).toBeVisible();
  await page.locator("#t-new").click();
  await expect(page.locator("#scene")).toBeHidden();
  await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("the dropdown lists the built tracks, Choose a track empties the view", async ({page}) => {
  await openEditor(page);
  await expect(page.locator("#edit-track option")).toHaveText(["Choose a track", "Alpha Test", "Beta Test", "Gamma Old"]);
  await page.locator("#edit-track").selectOption("");
  await expect(page.locator("#edit-status")).toHaveText("");
});

test("a reload keeps the tab and the track", async ({page}) => {
  await openEditor(page);
  await page.reload();
  await expect(page.locator("#edit-track")).toHaveValue("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(page.locator("#scene")).toBeVisible();
});

test("a stored track that is gone leaves the choice empty", async ({page}) => {
  await page.goto("/");
  await page.evaluate(() => { localStorage.setItem("map2lap.tab", "edit"); localStorage.setItem("map2lap.editTrack", "no_such"); });
  await page.reload();
  await expect(page.locator("#edit-track option")).toHaveCount(4);
  await expect(page.locator("#edit-track")).toHaveValue("");
});

test("a note only for a track without build files", async ({page}) => {
  await openEditor(page, "gamma");
  await expect(page.locator("#edit-note")).toContainText("build files are gone");
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-note")).toBeHidden();
});

test("the hover box: the road under the mouse with its data and place", async ({page}) => {
  await openEditor(page);
  await expect(box(page)).toBeHidden();
  await hoverCentre(page);
  await expect(box(page)).toContainText("Road surface");
  await expect(box(page)).toContainText("1ROAD_ground_0_0");
  await expect(box(page)).toContainText("ground_0_0.dds");
  await expect(box(page)).toContainText("ksPerPixel");
  await expect(box(page)).toContainText("Physics");
  await expect(box(page)).toContainText(/AC x, y, z\s*12[0-9]\.\d+, 0\.00, -[34]\d\.\d+/);
  await expect(box(page)).toContainText(/Tile\s*0, 0/);
  await expect(box(page)).toContainText(/Route\s*[34]\d m/);
  await expect(box(page)).toContainText(/Lat, lon\s*42\.90\d+, 9\.36\d+/);
  await expect(box(page)).toContainText("no ID of its own");
});

test("the hover box: a tree has its own id, kind and size; beside its crown the mouse sees what lies behind", async ({page}) => {
  await openEditor(page);
  const c = await centre(scene(page));
  let found = false;
  for (let up = 40; up < c.y - 10 && !found; up += 12) {
    await page.mouse.move(c.x - 1, c.y - up);
    await page.mouse.move(c.x, c.y - up);
    found = await expect(box(page)).toContainText("nocol_trees_0_0#1", {timeout: 300}).then(() => true, () => false);
  }
  expect(found).toBe(true);
  await expect(box(page)).toContainText("Tree · ");
  await expect(box(page)).toContainText(/Height\s*30\.0 m/);
  await expect(box(page)).toContainText(/Stands at\s*128\.0, -130\.0/);
  await expect(box(page)).toContainText("trees.png");
  await expect(box(page)).not.toContainText("no ID of its own");
});

test("the hover box goes over the sky and off the view", async ({page}) => {
  await openEditor(page);
  await hoverCentre(page);
  await expect(box(page)).toBeVisible();
  const view = (await scene(page).boundingBox())!;
  await page.mouse.move(view.x + 200, view.y + 2);
  await expect(box(page)).toBeHidden();
  await hoverCentre(page);
  await expect(box(page)).toBeVisible();
  await page.mouse.move(100, 500);
  await expect(box(page)).toBeHidden();
});

test("W moves and stops when let go; A too; the dropdown keeps its track", async ({page}) => {
  await openEditor(page);
  const start = await stillView(page);
  await page.keyboard.down("w");
  await expect.poll(async () => (await scene(page).screenshot()).equals(start)).toBe(false);
  await page.keyboard.up("w");
  await stillView(page);
  await page.keyboard.down("a");
  await expect.poll(async () => (await scene(page).screenshot()).equals(start)).toBe(false);
  await page.keyboard.up("a");
  await stillView(page);
  await expect(page.locator("#edit-track")).toHaveValue("alpha");
});

const awayOf = async (page: import("@playwright/test").Page) => Number(/Camera\s*(\d+\.\d) m/.exec(await box(page).innerText())![1]);
const placed = async (page: import("@playwright/test").Page) =>
  /AC x, y, z\s*([-\d.]+), ([-\d.]+), ([-\d.]+)/.exec(await box(page).innerText())!.slice(1).map(Number);
const apart = (a: number[], b: number[]) => Math.hypot(...a.map((v, k) => v - b[k]));

test("W moves level, also with the view looking down: the height stays, it doesn't sink to the ground", async ({page}) => {
  await openEditor(page);
  const c = await hoverCentre(page);
  await dragMouse(page, c, {x: c.x, y: c.y + 400}, "middle");    // (straight down: what the mouse finds lies right below the camera)
  await stillView(page);
  const height = async () => {
    await hoverCentre(page);
    await expect(box(page)).toContainText(/Camera/);
    return await awayOf(page) + (await placed(page))[1];         // (over a tree it finds the tree: its height counts too)
  };
  const before = await height();
  await page.keyboard.down("w");
  await page.waitForTimeout(300);                                 // (a time by nature: how long the key is held; the test track is small)
  await page.keyboard.up("w");
  await stillView(page);
  expect(Math.abs(await height() - before)).toBeLessThan(before * 0.15);
});

test("the wheel: a share of the way to what the mouse points at, however far out the camera was before", async ({page}) => {
  await openEditor(page);
  const step = async (notches: number) => {
    const c = await hoverCentre(page);
    await expect(box(page)).toContainText(/Camera/);
    const before = await awayOf(page);
    await page.mouse.move(c.x, c.y);
    for (let k = 0; k < Math.abs(notches); k++) await page.mouse.wheel(0, Math.sign(notches) * 100);
    await stillView(page);
    await hoverCentre(page);
    return await awayOf(page) / before;
  };
  expect(await step(-1)).toBeCloseTo(0.85, 1);
  expect(await step(5)).toBeGreaterThan(1.5);
  expect(await step(-1)).toBeCloseTo(0.85, 1);    // (no jump by what was before)
});

test("the wheel does nothing while a button is held: the drag goes on from where it was", async ({page}) => {
  await openEditor(page);
  const c = await hoverCentre(page);
  await page.mouse.move(100, 500);
  const before = await stillView(page);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down({button: "middle"});
  await page.mouse.wheel(0, -300);
  await page.mouse.up({button: "middle"});
  await page.mouse.move(100, 500);
  expect((await stillView(page)).equals(before)).toBe(true);
});

test("zoomed below where the ground comes later: when it comes the camera is over it", async ({page}) => {
  let release = () => {};
  const held = new Promise<void>(ok => { release = ok; });
  await page.route("**/api/editor/*/mesh/**", async route => {
    await held;
    await route.continue();
  });
  await page.goto("/");
  await page.locator("#t-edit").click();
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toContainText(/Loading|Reading/);
  const c = await centre(scene(page));
  await page.mouse.move(c.x, c.y);
  for (let k = 0; k < 12; k++) {
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(30);              // (a time by nature: the zoom glides, each notch from where the last ended)
  }
  release();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await hoverCentre(page);
  await expect(box(page)).toBeVisible();        // (from below, the ground isn't there for the mouse)
});

test("the camera stays by the track: W and the wheel lead nowhere, Start brings it back", async ({page}) => {
  test.slow();
  await openEditor(page);
  const c = await centre(scene(page));
  await page.mouse.move(100, 500);
  const start = await stillView(page);
  await scene(page).focus();
  await page.keyboard.down("w");
  await page.waitForTimeout(3000);                                // (a time by nature: how long the key is held)
  await page.keyboard.up("w");
  await page.mouse.move(c.x, c.y + 300);
  for (let k = 0; k < 30; k++) await page.mouse.wheel(0, 300);
  await stillView(page);
  await page.mouse.move(c.x - 2, c.y + 300);
  await page.mouse.move(c.x, c.y + 300);
  await expect(box(page)).toBeVisible();          // (the map still there, under it)
  await scene(page).focus();
  await page.keyboard.press("Home");
  await page.mouse.move(100, 500);
  await expect.poll(async () => (await stillView(page)).equals(start)).toBe(true);
});

test("at the edge of the area the view still turns, with the camera going beyond it", async ({page}) => {
  test.slow();
  await openEditor(page);
  const c = await centre(scene(page));
  await scene(page).focus();
  await page.keyboard.down("w");
  await page.waitForTimeout(4000);                                // (a time by nature: how long the key is held)
  await page.keyboard.up("w");
  await page.mouse.move(100, 500);
  const before = await stillView(page);
  await dragMouse(page, c, {x: c.x + 200, y: c.y}, "middle");
  await page.mouse.move(100, 500);
  expect((await stillView(page)).equals(before)).toBe(false);
});

test("the sky: a right drag from it moves nothing, the wheel on it goes the way the view looks, not up", async ({page}) => {
  await openEditor(page);
  const c = await centre(scene(page));
  await dragMouse(page, c, {x: c.x, y: c.y - 100}, "middle");     // (nearly level: the view's upper part above the horizon)
  const sky = {x: c.x, y: c.y - 300}, near = {x: c.x, y: c.y + 100};
  await page.mouse.move(100, 500);
  const before = await stillView(page);
  await page.mouse.move(sky.x, sky.y);
  await page.mouse.down({button: "right"});
  await page.mouse.move(sky.x + 60, sky.y + 10, {steps: 4});
  await page.mouse.up({button: "right"});
  await page.mouse.move(100, 500);
  expect((await stillView(page)).equals(before)).toBe(true);
  await page.mouse.move(near.x - 2, near.y);
  await page.mouse.move(near.x, near.y);
  await expect(box(page)).toContainText(/Camera/);
  const away = await awayOf(page);
  await page.mouse.move(sky.x, sky.y);
  await page.mouse.wheel(0, -300);
  await stillView(page);
  await page.mouse.move(near.x - 2, near.y);
  await page.mouse.move(near.x, near.y);
  await expect.poll(() => awayOf(page)).toBeLessThan(away);
});

test("the camera goes no higher than the track in view", async ({page}) => {
  await openEditor(page);
  const c = await hoverCentre(page);
  await dragMouse(page, c, {x: c.x, y: c.y + 400}, "middle");     // (straight down)
  await page.mouse.move(c.x, c.y);
  for (let k = 0; k < 40; k++) await page.mouse.wheel(0, 300);
  await stillView(page);
  await hoverCentre(page);
  await expect(box(page)).toContainText(/Camera/);
  expect(await awayOf(page)).toBeLessThan(1100);
});

test("the fly speed's slider reaches the view", async ({page}) => {
  const flown = async (speed: number) => {
    await page.goto("/");
    await page.evaluate(s => {
      localStorage.setItem("map2lap.controls", JSON.stringify({fly: s}));
      localStorage.setItem("map2lap.tab", "edit");
      localStorage.setItem("map2lap.editTrack", "alpha");
    }, speed);
    await page.reload();
    await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
    const c = await hoverCentre(page);
    await dragMouse(page, c, {x: c.x, y: c.y + 400}, "middle");   // (straight down: what the mouse finds lies right below the camera)
    await stillView(page);
    await hoverCentre(page);
    await expect(box(page)).toBeVisible();
    const before = await placed(page);
    await page.keyboard.down("w");
    await page.waitForTimeout(150);                               // (a time by nature: how long the key is held; the test track is small)
    await page.keyboard.up("w");
    await stillView(page);
    await hoverCentre(page);
    const moved = async () => { const at = await placed(page); return Math.hypot(at[0] - before[0], at[2] - before[2]); };
    await expect.poll(moved).toBeGreaterThan(0);
    return moved();
  };
  const slow = await flown(10), fast = await flown(100);
  expect(fast).toBeGreaterThan(slow * 1.5);       // (ten times as fast; how long the key was down varies under load)
});

test("the keys do nothing while the settings are open", async ({page}) => {
  await openEditor(page);
  await page.mouse.move(100, 500);
  const before = await stillView(page);
  await openSettings(page, "Editor");
  await page.keyboard.down("w");
  await page.waitForTimeout(500);                                 // (a time by nature: nothing is to happen)
  await page.keyboard.up("w");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  expect((await stillView(page)).equals(before)).toBe(true);
});

test("a click into the view gives it the keys", async ({page}) => {
  await openEditor(page);
  await page.getByLabel("Track", {exact: true}).focus();
  const c = await centre(scene(page));
  await page.mouse.click(c.x, c.y);
  await expect(scene(page)).toBeFocused();
});

test("the wheel held turns around the view's middle, up to just over the horizon; the right button takes the ground along; the left moves nothing", async ({page}) => {
  await openEditor(page);
  const c = await hoverCentre(page);
  await expect(box(page)).toContainText("Road surface");
  const middle = await placed(page);
  await page.mouse.move(100, 500);
  const start = await stillView(page);
  await dragMouse(page, c, {x: c.x + 150, y: c.y + 40}, "middle");
  await page.mouse.move(100, 500);
  expect((await stillView(page)).equals(start)).toBe(false);
  await hoverCentre(page);
  await expect(box(page)).toContainText("Road surface");
  expect(apart(await placed(page), middle)).toBeLessThan(1);

  const p = {x: c.x, y: c.y + 60}, to = {x: c.x + 80, y: c.y + 90};
  await page.mouse.move(p.x - 2, p.y);
  await page.mouse.move(p.x, p.y);
  await expect(box(page)).toContainText("Road surface");
  const grabbed = await placed(page);
  await dragMouse(page, p, to, "right");
  await expect(page.locator("#view-menu")).toBeHidden();
  await page.mouse.move(to.x - 2, to.y);
  await page.mouse.move(to.x, to.y);
  await expect.poll(async () => apart(await placed(page), grabbed)).toBeLessThan(1.5);

  await page.mouse.move(100, 500);
  const before = await stillView(page);
  await dragMouse(page, c, {x: c.x + 80, y: c.y + 30}, "left");
  await page.mouse.move(100, 500);
  expect((await stillView(page)).equals(before)).toBe(true);

  await dragMouse(page, c, {x: c.x, y: c.y - 600}, "middle");     // (far up: stops short of the sky)
  await page.mouse.move(c.x - 2, c.y + 200);
  await page.mouse.move(c.x, c.y + 200);
  await expect(box(page)).toBeVisible();
});

test("inverted, the same drag looks the other way", async ({page}) => {
  await openEditor(page);
  const c = await centre(scene(page));
  await page.mouse.move(100, 500);
  const start = await stillView(page);
  await dragMouse(page, c, {x: c.x, y: c.y - 100}, "middle");
  await page.mouse.move(100, 500);
  const normal = await stillView(page);
  await page.reload();
  await page.evaluate(() => localStorage.setItem("map2lap.controls", JSON.stringify({invertLook: true})));
  await page.reload();
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await page.mouse.move(100, 500);
  await expect.poll(async () => (await stillView(page)).equals(start)).toBe(true);     // (the textures still coming)
  await dragMouse(page, c, {x: c.x, y: c.y - 100}, "middle");
  await page.mouse.move(100, 500);
  expect((await stillView(page)).equals(normal)).toBe(false);
});

test("a late fault of the track left does not overwrite the new track's status", async ({page}) => {
  await page.addInitScript(() => {
    const real = window.fetch;
    window.fetch = ((url: RequestInfo | URL, options?: RequestInit) => {
      // (nothing stops this answer, not even the abort: the worst case)
      if (String(url).includes("/api/editor/alpha/mesh/")) {
        return new Promise(ok => setTimeout(() => ok(new Response('{"error": "late fault"}', {status: 500})), 800));
      }
      return real(url, options);
    }) as typeof fetch;
  });
  await page.goto("/");
  await page.locator("#t-edit").click();
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/Loading|Reading/);
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await page.waitForTimeout(1200);                                // (a time by nature: alpha's answers are to come in)
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
});

test("leaving a track frees its images", async ({page}) => {
  await page.addInitScript(() => {
    const w = window as unknown as {imagesMade: number; imagesClosed: number};
    w.imagesMade = 0;
    w.imagesClosed = 0;
    const create = window.createImageBitmap.bind(window) as (...a: unknown[]) => Promise<ImageBitmap>;
    (window as unknown as {createImageBitmap: unknown}).createImageBitmap = (...a: unknown[]) => create(...a).then(b => { w.imagesMade++; return b; });
    const close = ImageBitmap.prototype.close;
    ImageBitmap.prototype.close = function (this: ImageBitmap) { w.imagesClosed++; close.call(this); };
  });
  await openEditor(page);
  const counts = () => page.evaluate(() => { const w = window as unknown as {imagesMade: number; imagesClosed: number}; return [w.imagesMade, w.imagesClosed]; });
  await expect.poll(async () => (await counts())[0]).toBeGreaterThan(0);
  expect((await counts())[1]).toBe(0);
  await page.locator("#edit-track").selectOption("");
  await expect.poll(async () => { const [made, closed] = await counts(); return made === closed; }).toBe(true);
});

test("a track built again loads again, the same build does not", async ({page, backend}) => {
  await openEditor(page);
  let asked = 0;
  page.on("request", r => { if (r.url().endsWith("/api/editor/alpha/index")) asked++; });
  await page.locator("#t-new").click();
  await page.locator("#t-edit").click();
  await expect(page.locator("#edit-track")).toHaveValue("alpha");
  await page.waitForLoadState("networkidle");
  expect(asked).toBe(0);
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test"});
  await page.locator("#t-new").click();
  await page.locator("#t-edit").click();
  await expect.poll(() => asked).toBe(1);
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
});

test("a track file cut off by a build says so, the next track still loads", async ({page, backend, faultsAllowed}) => {
  faultsAllowed.on = true;
  await page.goto("/");
  await page.locator("#t-edit").click();
  await backend.post("/__test/cut", {name: "beta"});
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toContainText("being written or has changed");
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
});

test("a file changing under a loading track says so instead of drawing rubbish", async ({page, backend, faultsAllowed}) => {
  faultsAllowed.on = true;
  await page.route("**/api/editor/alpha/mesh/**", async route => {
    await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test"});
    await route.continue();
  });
  await page.goto("/");
  await page.locator("#t-edit").click();
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toContainText("being written or has changed");
});

test("loaded includes the textures, and a texture failure is shown", async ({page, faultsAllowed}) => {
  faultsAllowed.on = true;
  let release!: () => void;
  const ready = new Promise<void>(ok => { release = ok; });
  await page.route("**/api/editor/alpha/texture/**", async route => {
    await ready;
    await route.fulfill({status: 409, json: {error: "The texture changed during the build"}});
  });
  await page.goto("/");
  await page.locator("#t-edit").click();
  const requested = page.waitForRequest("**/api/editor/alpha/texture/**");
  await page.locator("#edit-track").selectOption("alpha");
  await requested;
  // Every mesh has arrived; the textures are still waiting.
  try {
    await expect(page.locator("#edit-status")).toHaveText("Loading: 4 of 4 parts");
  } finally {
    release();
  }
  await expect(page.locator("#edit-status")).toContainText("The texture changed during the build");
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
});

test("a track finishing behind Settings cannot take the keyboard focus", async ({page}) => {
  let release!: () => void;
  const ready = new Promise<void>(ok => { release = ok; });
  await page.route("**/api/editor/alpha/index", async route => { await ready; await route.continue(); });
  await page.goto("/");
  await page.locator("#t-edit").click();
  const requested = page.waitForRequest("**/api/editor/alpha/index");
  await page.locator("#edit-track").selectOption("alpha");
  await requested;
  try {
    await openSettings(page, "Editor");
  } finally {
    release();
  }
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(scene(page)).not.toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.getByRole("dialog").evaluate(e => e.contains(document.activeElement))).toBe(true);
});
