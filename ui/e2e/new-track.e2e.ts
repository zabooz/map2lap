// New track: pins, route, stops, search, track codes, area.
import {button, card, centre, clickMap, dragMouse, expect, handles, mapPoint, pins, test} from "./fixtures";

test("two pins make a route, its name and its code", async ({page}) => {
  await page.goto("/");
  await expect(page.locator("#go")).toBeDisabled();
  await clickMap(page, 0.3, 0.3);
  await expect(card(page)).toContainText("Now click the finish.");
  await clickMap(page, 0.6, 0.6);
  await expect(card(page)).toContainText("1.00 km");
  await expect(page.locator("#go")).toBeEnabled();
  await expect(pins(page)).toHaveCount(2);
  await expect(page.getByLabel("Track name")).toHaveValue("Testtown Route");
  await expect(page.getByLabel("Start")).toHaveValue(/^Testtown, Part/);
  await expect(page.getByRole("textbox", {name: "Track code"})).toHaveValue(/^M2L1-/);
});

test("a name typed stays, emptied the places give it again", async ({page}) => {
  await page.goto("/");
  await page.getByLabel("Track name").fill("My own");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(card(page)).toContainText("1.00 km");
  await expect(page.getByLabel("Track name")).toHaveValue("My own");
  await page.getByLabel("Track name").fill("");
  await expect(page.getByLabel("Track name")).toHaveValue("Testtown Route");
});

test("a changed selection never offers the previous track's code", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  const code = page.getByRole("textbox", {name: "Track code"});
  await expect(code).toHaveValue(/^M2L1-/);
  const before = await code.inputValue();
  let release!: () => void;
  const ready = new Promise<void>(ok => { release = ok; });
  await page.route("**/api/code", async route => { await ready; await route.continue(); });
  try {
    await page.getByLabel("Corridor each side").fill("200");
    await expect(code).toHaveValue("");
    await expect(page.getByRole("button", {name: "Copy track code"})).toBeDisabled();
  } finally {
    release();
  }
  await expect(code).toHaveValue(/^M2L1-/);
  expect(await code.inputValue()).not.toBe(before);
});

test("a pin drags and right-click removes it", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(pins(page)).toHaveCount(2);
  const start = await centre(pins(page).nth(1));
  const was = await page.getByLabel("Finish").inputValue();
  await dragMouse(page, {x: start.x, y: start.y + 15}, {x: start.x - 120, y: start.y - 90});
  // (it stays where it was let go: a new position object while dragging used to put it back)
  await expect.poll(async () => Math.round((await centre(pins(page).nth(1))).x)).toBe(Math.round(start.x - 120));
  await expect(page.getByLabel("Finish")).not.toHaveValue(was);
  await pins(page).first().click({button: "right", position: {x: 12, y: 30}});
  await expect(pins(page)).toHaveCount(1);
  await expect(card(page)).toContainText("Now click the finish.");
});

test("the corridor's slider shows on the card", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(card(page)).toContainText("±100 m");
  await page.getByLabel("Corridor each side").fill("200");
  await expect(card(page)).toContainText("±200 m");
});

test("a stop by search: one result is taken, several to choose by arrows, none is said", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(card(page)).toContainText("1.00 km");
  await button(page, "+ Add a stop").click();
  const field = page.getByLabel("Finish").last();
  await expect(field).toBeFocused();
  await field.fill("Nowhere");
  await field.press("Enter");
  const drop = page.getByTestId("search-drop");
  await expect(drop).toContainText("Nothing found");
  await field.press("Escape");
  await expect(drop).toBeHidden();
  await field.fill("Springfield");
  await field.press("Enter");
  await expect(drop.getByRole("button")).toHaveCount(2);
  await field.press("ArrowDown");
  await field.press("Enter");
  await expect(card(page)).toContainText("2.00 km");
  await expect(page.getByLabel("Finish")).toHaveValue("Springfield, Massachusetts, United States");
  await expect(page.getByLabel("Stop 1")).toBeVisible();
});

test("an empty stop goes when left", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await button(page, "+ Add a stop").click();
  await expect(pins(page)).toHaveCount(2);
  await page.getByLabel("Track name").click();
  await expect(button(page, "+ Add a stop")).toBeEnabled();
  await expect(page.getByLabel("Stop 1")).toBeHidden();
});

test("Clear all takes it all away", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await button(page, "Clear all").click();
  await expect(pins(page)).toHaveCount(0);
  await expect(card(page)).toContainText("Set a route");
  await expect(button(page, "Clear all")).toBeDisabled();
});

test("a track code sets the track, a wrong one says so", async ({page}) => {
  await page.goto("/");
  const {tracks} = await (await page.request.get("/api/tracks")).json();
  const code = page.getByRole("textbox", {name: "Track code"});
  await code.fill("%%% not a code");
  await code.press("Enter");
  await expect(card(page)).toContainText("Track code: not a Map2Lap track code.");
  await code.fill(tracks[0].code);
  await code.press("Enter");
  await expect(page.getByLabel("Track name")).toHaveValue(tracks[0].title);
  await expect(pins(page)).toHaveCount(2);
  await expect(card(page)).toContainText("km");
});

test("an area: drawn, resized by a corner, cleared; while there is none the map stays put", async ({page}) => {
  await page.goto("/");
  await button(page, "Area").click();
  await expect(card(page)).toContainText("Draw an area");
  await expect(page.getByText("Press and drag to draw")).toBeVisible();
  const pane = page.locator(".leaflet-map-pane");
  const before = await pane.evaluate(e => (e as HTMLElement).style.transform);
  const a = await mapPoint(page, 0.3, 0.3), b = await mapPoint(page, 0.6, 0.6);
  await dragMouse(page, a, b);
  expect(await pane.evaluate(e => (e as HTMLElement).style.transform)).toBe(before);
  await expect(card(page)).toContainText("km²");
  await expect(handles(page)).toHaveCount(4);
  await expect(page.locator("#go")).toBeEnabled();
  await expect(page.getByLabel("Track name")).toHaveValue("Testtown Area");
  const size = await card(page).innerText();
  const corner = await centre(handles(page).nth(3));
  await dragMouse(page, corner, {x: corner.x + 100, y: corner.y - 50});
  await expect.poll(() => card(page).innerText()).not.toBe(size);
  await expect.poll(async () => Math.round((await centre(handles(page).nth(3))).x)).toBe(Math.round(corner.x + 100));
  // (with an area the map moves again)
  const moved = await mapPoint(page, 0.9, 0.9);
  await dragMouse(page, moved, {x: moved.x - 40, y: moved.y - 30});
  await expect.poll(() => pane.evaluate(e => (e as HTMLElement).style.transform)).not.toBe(before);
  await button(page, "Clear area").click();
  await expect(card(page)).toContainText("Draw an area");
  await expect(handles(page)).toHaveCount(0);
});
