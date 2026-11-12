// What every browser test starts from: a server of its worker's own (e2e/server.py), everything as new, a page without
// faults in its console. Tests wait for what happens, never for a time.
import {spawn} from "node:child_process";
import {join} from "node:path";
import {test as base, expect, type Locator, type Page} from "@playwright/test";

const REPO = join(import.meta.dirname, "..", "..");
const PYTHON = process.platform === "win32" ? join(REPO, ".venv", "Scripts", "python.exe") : join(REPO, ".venv", "bin", "python");

export interface Backend {
  url: string;
  post: (path: string, body?: object) => Promise<void>;
  calls: () => Promise<unknown[][]>;
}

export const test = base.extend<{reset: void; faultsAllowed: {on: boolean}}, {backend: Backend}>({
  backend: [async ({}, use) => {
    const server = spawn(PYTHON, [join(REPO, "ui", "e2e", "server.py")], {stdio: ["pipe", "pipe", "inherit"]});
    const port = await new Promise<string>((ok, fail) => {
      server.stdout.on("data", (d: Buffer) => { const m = /PORT (\d+)/.exec(String(d)); if (m) ok(m[1]); });
      server.on("exit", code => fail(new Error(`the test server ended: ${code}`)));
    });
    const url = `http://127.0.0.1:${port}`;
    await use({
      url,
      post: async (path, body = {}) => {
        // The server closes POST connections; do not reuse a closing socket between test resets.
        const response = await fetch(url + path, {method: "POST", headers: {Connection: "close"}, body: JSON.stringify(body)});
        const answer = await response.json();
        if (!response.ok) throw new Error(`Test setup failed: ${response.status} ${JSON.stringify(answer)}`);
      },
      calls: async () => (await fetch(`${url}/__test/calls`)).json() as Promise<unknown[][]>,
    });
    server.stdin.end();
  }, {scope: "worker"}],

  baseURL: async ({backend}, use) => use(backend.url),
  faultsAllowed: async ({}, use) => use({on: false}),

  reset: [async ({backend}, use) => {
    await backend.post("/__test/reset");
    await use();
  }, {auto: true}],

  page: async ({page, faultsAllowed}, use) => {
    const faults: string[] = [];
    page.on("pageerror", e => faults.push(`page: ${e.message}`));
    page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) faults.push(m.text()); });
    page.on("dialog", d => void d.accept());
    await page.route(/tile\.openstreetmap\.org/, r => r.fulfill({status: 204}));     // (no map images: the tests need no net)
    await use(page);
    if (!faultsAllowed.on) expect(faults).toEqual([]);
  },
});

export {expect};

export const card = (page: Page) => page.getByTestId("status-card");
export const button = (page: Page, name: string | RegExp) => page.getByRole("button", {name, exact: typeof name === "string"});
export const pins = (page: Page) => page.locator(".leaflet-marker-icon:not([class*=handle_])");
export const handles = (page: Page) => page.locator("[class*=handle_]");
export const scene = (page: Page) => page.locator("#scene canvas");

/** A point of the map, as shares of its width and height. */
export async function mapPoint(page: Page, x: number, y: number) {
  const box = (await page.locator(".leaflet-container").boundingBox())!;
  return {x: box.x + box.width * x, y: box.y + box.height * y};
}

export async function clickMap(page: Page, x: number, y: number) {
  const at = await mapPoint(page, x, y);
  await page.mouse.click(at.x, at.y);
}

export async function dragMouse(page: Page, from: {x: number; y: number}, to: {x: number; y: number},
                                button_: "left" | "right" | "middle" = "left") {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down({button: button_});
  await page.mouse.move(to.x, to.y, {steps: 8});
  await page.mouse.up({button: button_});
}

export async function centre(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** The Editor tab with the track name loaded. */
export async function openEditor(page: Page, name = "alpha") {
  await page.goto("/");
  await page.locator("#t-edit").click();
  await page.locator("#edit-track").selectOption(name);
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await expect(scene(page)).toBeVisible();
}

/** The Settings popup on the tab named, from a closed one. */
export async function openSettings(page: Page, tab: "General" | "Map2Lap" | "Editor" = "General") {
  await page.locator("#t-set").click();
  await page.getByRole("tab", {name: tab}).click();
}

/** The 3D view as an image, once it stands still. */
export async function stillView(page: Page, options?: Parameters<Locator["screenshot"]>[0]) {
  let last = await scene(page).screenshot(options);
  await expect.poll(async () => {
    const now = await scene(page).screenshot(options);
    const same = now.equals(last);
    last = now;
    return same;
  }).toBe(true);
  return last;
}
