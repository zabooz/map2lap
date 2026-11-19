// Bank road: A-B on the hill track's mapped road is banked fully, the transitions lie beyond; Ctrl + wheel the banking, Shift
// the high edge, Alt + wheel the transitions; bankings stay highlighted and can be picked, changed and deleted.
import {centre, expect, openEditor, scene, test, type Backend} from "./fixtures";
import type {Locator, Page, Route} from "@playwright/test";
import {saved} from "./edit-helpers";

/** The hill track with its mapped road down the middle of the view (z -256 to 256): two points on that road. */
async function onRoad(page: Page, backend: Backend) {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  const c = await centre(scene(page));
  return {a: {x: c.x, y: c.y + 236}, b: {x: c.x, y: c.y - 261}, c};
}

/** Requests to url held until release(); held resolves once the first one waits. */
async function hold(page: Page, url: string) {
  let release!: () => void, mark!: () => void;
  const gate = new Promise<void>(r => { release = r; });
  const held = new Promise<void>(r => { mark = r; });
  await page.route(url, async (route: Route) => { mark(); await gate; await route.continue(); });
  return {held, release};
}

const draft = async (page: Page) => (await page.request.get("/api/editor/alpha/edits")).json();
type Banked = {id: string; mm: number[]; mesh_offsets: Record<string, number[][]>; bank: {banking: number; side: number; limit: number; points: number[][]}};
const banks = async (page: Page): Promise<Banked[]> => ((await draft(page)).heights ?? []).filter((h: {bank?: unknown}) => h.bank);
const applying = (r: {url(): string; request(): {method(): string}}) => r.url().endsWith("/api/editor/alpha/bank") && r.request().method() === "POST";

/** A notch of the wheel over the view with a modifier held; up: +1. */
async function wheel(page: Page, at: {x: number; y: number}, key: "Control" | "Alt" | "Shift", up = true) {
  await page.mouse.move(at.x, at.y);
  await page.keyboard.down(key);
  await page.mouse.wheel(0, up ? -100 : 100);
  await page.keyboard.up(key);
}

/** Bank road on, A and B marked: its options once the road is read. */
async function marked(page: Page, backend: Backend) {
  const road = await onRoad(page, backend);
  await page.keyboard.press("u");
  const options = page.locator("#edit-bank-set");
  await page.mouse.click(road.a.x, road.a.y);
  await expect(options).toContainText("Click B");
  const way = page.waitForResponse("**/api/editor/alpha/bank/way");
  await page.mouse.click(road.b.x, road.b.y);
  expect((await way).status()).toBe(200);
  await expect(options).toContainText("across now");
  return {options, ...road};
}

/** Two notches of Ctrl + wheel: 1 % banking, applied and kept. */
async function bankOnePercent(page: Page, options: Locator, c: {x: number; y: number}) {
  await wheel(page, c, "Control");
  await wheel(page, c, "Control");
  await expect(options).toContainText("Road banked to 1.0 %");
  await saved(page);
}

test("U and the button take up Bank road", async ({page, backend}) => {
  await onRoad(page, backend);
  await page.keyboard.press("u");
  await expect(page.locator("#edit-bank")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edit-bank-set")).toContainText("Click A on the road to bank");
  await page.keyboard.press("v");
  await page.locator("#edit-bank").click();
  await expect(page.locator("#edit-bank")).toHaveAttribute("aria-pressed", "true");
});

test("marking A and B changes nothing until the banking changes, also after Shift", async ({page, backend}) => {
  let applied = 0;
  page.on("request", r => { if (r.url().endsWith("/api/editor/alpha/bank") && r.method() === "POST") applied++; });
  const {options, c} = await marked(page, backend);
  await expect(options.getByLabel("Banking")).toHaveValue("0");
  await scene(page).focus();
  await page.keyboard.press("Shift");
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  expect(applied).toBe(0);
  expect(await banks(page)).toHaveLength(0);
  await wheel(page, c, "Control");
  await expect.poll(() => applied).toBeGreaterThan(0);
});

test("Ctrl + wheel changes the banking by 0.5; Shift flips the high edge, Shift + wheel does not", async ({page, backend}) => {
  const {options, c} = await marked(page, backend);
  await wheel(page, c, "Control");
  await expect(options.getByLabel("Banking")).toHaveValue("0.5");
  const side = options.locator("#edit-bank-side");
  const first = (await side.textContent()) ?? "";
  await scene(page).focus();
  await page.keyboard.press("Shift");
  await expect(side).not.toHaveText(first);
  const flipped = (await side.textContent()) ?? "";
  await wheel(page, c, "Shift");
  await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
  await expect(side).toHaveText(flipped);
});

test("Alt + wheel changes the edge-ramp limit and with it the transitions", async ({page, backend}) => {
  const {options, c} = await marked(page, backend);
  await wheel(page, c, "Control");
  await wheel(page, c, "Control");
  await expect(options).toContainText("Transitions about");
  const before = await options.textContent();
  await wheel(page, c, "Alt");
  await expect(options.getByLabel("Edge ramp")).toHaveValue("0.6");
  await expect.poll(async () => await options.textContent()).not.toBe(before);
});

test("a banking applies, undoes and redoes; the ground road tilts with its ground", async ({page, backend}) => {
  const {options, c} = await marked(page, backend);
  await bankOnePercent(page, options, c);
  const [made] = await banks(page);
  expect([made.bank.banking, made.bank.limit]).toEqual([0.01, 0.005]);
  expect(made.mm.some(mm => mm !== 0)).toBe(true);
  const offsets = Object.values(made.mesh_offsets).flat();
  expect(Math.max(0, ...offsets.map(row => Math.abs(row[1])))).toBeLessThan(5);    // (nothing takes the ground's tilt back)
  await scene(page).focus();
  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await banks(page)).length).toBe(0);
  await page.keyboard.press("Control+y");
  await expect.poll(async () => (await banks(page)).length).toBe(1);
});

for (const key of ["x", "Delete"]) {
  test(`a banked stretch is highlighted, picked by a click, and ${key} deletes it`, async ({page, backend}) => {
    let applied = 0;
    page.on("request", r => { if (r.url().endsWith("/api/editor/alpha/bank") && r.method() === "POST") applied++; });
    const {options, c} = await marked(page, backend);
    await bankOnePercent(page, options, c);
    const made = applied;
    await options.getByRole("button", {name: "Mark again"}).click();
    await expect(options).toContainText("or a highlighted banking");
    const way = page.waitForResponse("**/api/editor/alpha/bank/way");
    await page.mouse.click(c.x, c.y);                                  // (in the middle of the banked stretch)
    await way;
    await expect(options).toContainText("Banking picked: 1.0 %");
    await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
    expect(applied).toBe(made);                                        // (picking alone applies nothing)
    await scene(page).focus();
    await page.keyboard.press(key);
    await expect(options).toContainText("Banking deleted");
    await saved(page);
    expect(await banks(page)).toHaveLength(0);
    await expect(page.locator("#edit-bank")).toHaveAttribute("aria-pressed", "true");     // (X took no other tool up)
  });
}

test("dragging a picked banking's pin moves it, as its own banking", async ({page, backend}) => {
  const {options, a, c} = await marked(page, backend);
  await bankOnePercent(page, options, c);
  const [first] = await banks(page);
  const answer = page.waitForResponse(applying);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x, a.y - 30, {steps: 5});
  await page.mouse.up();
  expect((await answer).status()).toBe(200);
  await expect(options).toContainText("Road banked to 1.0 %");
  await saved(page);
  const moved = await banks(page);
  expect(moved).toHaveLength(1);
  expect(moved[0].id).not.toBe(first.id);
  expect(moved[0].bank.points[0]).not.toEqual(first.bank.points[0]);
});

test("a new marking whose transition reaches a banking is refused with a warning", async ({page, backend}) => {
  // (a short banking in the middle, 1 % with 24 m transitions, the far one ending about 187 px above the middle in this
  // view; the new one a few metres beyond it, whose own 24 m transition reaches back into the old one's)
  const {c} = await onRoad(page, backend);
  await page.keyboard.press("u");
  const options = page.locator("#edit-bank-set");
  await page.mouse.click(c.x, c.y + 60);
  const first = page.waitForResponse("**/api/editor/alpha/bank/way");
  await page.mouse.click(c.x, c.y - 60);
  await first;
  await bankOnePercent(page, options, c);
  await options.getByRole("button", {name: "Mark again"}).click();
  await page.mouse.click(c.x, c.y - 300);
  const way = page.waitForResponse("**/api/editor/alpha/bank/way");
  await page.mouse.click(c.x, c.y - 215);
  await way;
  await wheel(page, c, "Control");
  await wheel(page, c, "Control");
  await expect(options).toContainText("There is banking here already");
  await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
  expect(await banks(page)).toHaveLength(1);
});

test("a banking answer after a tool switch is dropped", async ({page, backend}) => {
  const {c} = await marked(page, backend);
  const apply = await hold(page, "**/api/editor/alpha/bank");
  await wheel(page, c, "Control");
  await apply.held;
  await scene(page).focus();
  await page.keyboard.press("v");
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  const answered = page.waitForResponse("**/api/editor/alpha/bank");
  apply.release();
  await answered;
  await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  await saved(page);
  expect(await banks(page)).toHaveLength(0);
});

test("Esc drops a road read that is still on its way", async ({page, backend}) => {
  const {a, b} = await onRoad(page, backend);
  const way = await hold(page, "**/api/editor/alpha/bank/way");
  await page.keyboard.press("u");
  const options = page.locator("#edit-bank-set");
  await page.mouse.click(a.x, a.y);
  await page.mouse.click(b.x, b.y);
  await way.held;
  await page.keyboard.press("Escape");
  const answered = page.waitForResponse("**/api/editor/alpha/bank/way");
  way.release();
  await answered;
  await page.keyboard.press("u");
  await expect(options).toContainText("Click A on the road to bank");
  await expect(options.getByLabel("Banking")).toHaveCount(0);
});
