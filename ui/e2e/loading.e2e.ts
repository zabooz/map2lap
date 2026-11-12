import {expect, test} from "./fixtures";

const gate = () => {
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  return {waiting, release};
};

test("one loading bar covers reading, parts, textures and selection preparation", async ({page}) => {
  const index = gate(), textures = gate(), selection = gate();
  await page.route("**/alpha/index", async route => { await index.waiting; await route.continue(); });
  await page.route("**/alpha/texture/*", async route => { await textures.waiting; await route.continue(); });
  await page.route("**/alpha/surface/prepare?*", async route => { await selection.waiting; await route.continue(); });
  try {
    await page.goto("/");
    await page.locator("#t-edit").click();
    await page.locator("#edit-track").selectOption("alpha");
    const bar = page.getByRole("progressbar", {name: "Loading track"});
    await expect(bar).toBeVisible();
    await expect(bar).not.toHaveAttribute("value"); // reading the index: the amount is not known yet
    index.release();
    await expect.poll(async () => Number(await bar.getAttribute("value"))).toBeGreaterThan(0);
    const before = Number(await bar.getAttribute("value"));
    expect(before).toBeLessThan(1);
    await expect(page.locator("#edit-status")).not.toHaveText(/parts loaded/);
    textures.release();
    await expect(page.locator("#edit-status")).toContainText("Preparing selection");
    await expect.poll(async () => Number(await bar.getAttribute("value"))).toBeGreaterThan(before);
    expect(Number(await bar.getAttribute("value"))).toBeLessThan(1);
    selection.release();
    await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
    await expect(bar).toBeHidden();
  } finally { index.release(); textures.release(); selection.release(); }
});

test("an old preparation cannot put the bar back after another track finishes", async ({page}) => {
  const selection = gate();
  let started!: () => void;
  const arrived = new Promise<void>(resolve => { started = resolve; });
  await page.route("**/alpha/surface/prepare?*", async route => { started(); await selection.waiting; await route.continue(); });
  try {
    await page.goto("/");
    await page.locator("#t-edit").click();
    await page.locator("#edit-track").selectOption("alpha");
    await arrived;
    await page.locator("#edit-track").selectOption("beta");
    await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
    selection.release();
    await expect(page.getByRole("progressbar", {name: "Loading track"})).toBeHidden();
    await expect(page.locator("#edit-track")).toHaveValue("beta");
    await page.locator("#edit-track").selectOption("");
    await expect(page.locator("#edit-status")).toHaveText("");
    await expect(page.getByRole("progressbar", {name: "Loading track"})).toBeHidden();
  } finally { selection.release(); }
});

test("a loading error ends the bar and keeps its explanation", async ({page}) => {
  await page.route("**/alpha/index", route => route.fulfill({status: 409, json: {error: "The track changed"}}));
  await page.goto("/");
  await page.locator("#t-edit").click();
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText("Could not load this track: The track changed");
  await expect(page.getByRole("progressbar", {name: "Loading track"})).toBeHidden();
});

test("switching tracks while a Rust worker is loading cannot restore the abandoned track", async ({page}) => {
  const kernel = gate();
  let started!: () => void, requests = 0;
  const arrived = new Promise<void>(resolve => { started = resolve; });
  await page.context().route("**/editorgeometry.wasm", async route => {
    if (++requests === 1) { started(); await kernel.waiting; }
    await route.continue();
  });
  try {
    await page.goto("/");
    await page.locator("#t-edit").click();
    await page.locator("#edit-track").selectOption("alpha");
    await arrived;
    await page.locator("#edit-track").selectOption("beta");
    await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
    kernel.release();
    await expect(page.locator("#edit-track")).toHaveValue("beta");
    await expect(page.getByRole("progressbar", {name: "Loading track"})).toBeHidden();
    await page.locator("#edit-track").selectOption("alpha");
    await expect(page.locator("#edit-status")).toHaveText(/parts loaded/);
    await expect(page.locator("#scene canvas")).toBeVisible();
  } finally { kernel.release(); }
});
