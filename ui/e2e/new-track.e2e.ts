// New track: pins, route, stops, search, track codes, area, circuit.
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
  await expect(page.getByRole("textbox", {name: "Track code"})).toHaveValue(/^M2L2-/);
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
  await expect(code).toHaveValue(/^M2L2-/);
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
  await expect(code).toHaveValue(/^M2L2-/);
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

test("an existing stop can move by search, with several matches or none", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(card(page)).toContainText("1.00 km");
  const field = page.getByRole("textbox", {name: "Finish", exact: true});
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
  await expect(field).toHaveValue("Springfield, Massachusetts, United States");
  await expect(pins(page)).toHaveCount(2);
});

test("after two pins, map clicks add stops without an extra search field", async ({page}) => {
  await page.goto("/");
  await clickMap(page, 0.3, 0.3);
  await clickMap(page, 0.6, 0.6);
  await expect(page.getByRole("textbox", {name: "Next stop", exact: true})).toHaveCount(0);
  await expect(pins(page)).toHaveCount(2);
  await expect(page.getByLabel("Stop 1")).toBeHidden();
  await clickMap(page, .7, .5);
  await expect(pins(page)).toHaveCount(3);
  await expect(page.getByLabel("Stop 1")).toBeVisible();
  await expect(page.getByLabel("Finish", {exact: true})).not.toHaveValue("");
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

test("the track modes share one row in Route, Circuit, Area order", async ({page}) => {
  await page.goto("/");
  const modes = page.getByRole("button", {name: /^(Route|Circuit|Area)$/});
  await expect(modes).toHaveText(["Route", "Circuit", "Area"]);
  for (const width of [1500, 375]) {
    await page.setViewportSize({width, height: 900});
    const boxes = await modes.evaluateAll(buttons => buttons.map(button => {
      const {x, y} = button.getBoundingClientRect();
      return {x, y};
    }));
    expect(boxes.map(box => box.y)).toEqual([boxes[0].y, boxes[0].y, boxes[0].y]);
    expect(boxes[0].x).toBeLessThan(boxes[1].x);
    expect(boxes[1].x).toBeLessThan(boxes[2].x);
  }
});

test("Circuit closes a lap through its numbered pins and builds it", async ({page}) => {
  await page.addInitScript(() => localStorage.setItem("map2lap.view", JSON.stringify({c: [48.5, 11], z: 16})));
  await page.goto("/");
  await button(page, "Circuit").click();
  const close = button(page, "Close circuit");
  const previews: {kind?: string}[] = [];
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/api/route") previews.push(request.postDataJSON());
  });
  await page.getByLabel("Track name").fill("Testtown Circuit");
  await expect(page.getByPlaceholder("Next pin: search or click the map")).toBeVisible();
  const width = page.getByLabel("Corridor each side");
  await expect(width).toBeVisible();
  await width.fill("180");
  await expect(page.getByText("Click to set pins in driving order · drag to move · right-click to remove")).toBeVisible();
  await clickMap(page, .3, .3);
  await expect(card(page)).toContainText("Now click the next pin.");
  await expect(close).toBeDisabled();
  await clickMap(page, .62, .33);
  await expect(page.getByPlaceholder("Next pin: search or click the map")).toHaveCount(0);
  await clickMap(page, .46, .65);
  await expect(pins(page).locator("span")).toHaveText(["S", "2", "3"]);
  await expect(page.getByLabel("Finish", {exact: true})).toBeHidden();
  await expect(card(page)).toContainText("2.00 km");
  await expect(button(page, "Build track")).toBeDisabled();
  await expect(page.getByTestId("lap-arrow")).toHaveCount(0);
  expect(previews.length).toBeGreaterThan(0);
  expect(previews.every(preview => preview.kind === undefined)).toBe(true);
  const line = page.locator(".leaflet-overlay-pane path").last();
  await expect(line).toBeVisible();
  const [openStart, ...openLegs] = (await line.getAttribute("d"))!.split("L");
  expect(openLegs).toHaveLength(2);
  expect(openLegs.at(-1)).not.toBe(openStart.slice(1));
  const [closed] = await Promise.all([page.waitForRequest("**/api/route"), close.click()]);
  expect(closed.postDataJSON()).toMatchObject({kind: "circuit"});
  await expect(page.getByText("Back to S · Lap 3.0 km", {exact: true})).toBeVisible();
  await expect(line).toBeVisible();
  const [start, ...legs] = (await line.getAttribute("d"))!.split("L");
  expect(legs).toHaveLength(3);
  expect(legs.at(-1)).toBe(start.slice(1));
  const arrows = page.getByTestId("lap-arrow");
  await expect(arrows.first()).toBeVisible();
  expect(await arrows.count()).toBeLessThanOrEqual(12);

  const code = page.getByRole("textbox", {name: "Track code"});
  await expect(code).toHaveValue(/^M2L2-/);
  const decoded = await (await page.request.post("/api/code", {data: {code: await code.inputValue()}})).json();
  expect(decoded).toMatchObject({kind: "circuit", width: 180});
  expect(decoded.points).toHaveLength(3);
  const [build] = await Promise.all([page.waitForResponse("**/api/build"), button(page, "Build track").click()]);
  expect(build.request().postDataJSON()).toMatchObject({kind: "circuit", width: 180});
  expect(build.ok()).toBe(true);
  await expect(card(page)).toContainText("Installed in Assetto Corsa.");
  await page.locator("#t-mine").click();
  await expect(page.locator("#pane-mine").getByRole("button", {name: /^Testtown Circuit\b/})).toBeVisible();
  await expect(card(page).getByText("3.00 km", {exact: true})).toBeVisible();

  await page.locator("#t-new").click();
  await button(page, "Route").click();
  await expect(pins(page)).toHaveCount(0);
  await expect(arrows).toHaveCount(0);
  await clickMap(page, .3, .3);
  const [route] = await Promise.all([page.waitForRequest("**/api/route"), clickMap(page, .6, .6)]);
  expect(route.postDataJSON()).not.toHaveProperty("kind");
  await expect(card(page)).toContainText("1.00 km");
});

test("a Circuit track code restores the lap in Circuit mode", async ({page}) => {
  await page.goto("/");
  const make = {kind: "circuit", title: "Saved lap", points: [[48.5, 11], [48.51, 11], [48.51, 11.02]], width: 100};
  const {code} = await (await page.request.post("/api/code", {data: {make}})).json();
  const field = page.getByRole("textbox", {name: "Track code"});
  await field.fill(code);
  await field.press("Enter");
  await expect(page.getByLabel("Track name")).toHaveValue(make.title);
  await expect(pins(page).locator("span")).toHaveText(["S", "2", "3"]);
  await expect(page.getByText("Back to S · Lap 3.0 km", {exact: true})).toBeVisible();
});

test("Circuit fits a pasted lap and a saved lap across the antimeridian", async ({page}) => {
  const points = [[-16.8, 179.9975], [-16.8, -179.999]];
  const coords = [points[0], points[1], [-16.799, -179.994], [-16.799, 179.996], points[0]];
  const title = "Antimeridian Circuit";
  await page.addInitScript(() => localStorage.setItem("map2lap.view", JSON.stringify({c: [-16.8, -179], z: 7})));
  await page.route("**/api/route", route => route.fulfill({json: {coords, length_m: 2400}}));
  await page.route("**/api/tracks", async route => {
    const response = await route.fetch();
    const listing = await response.json();
    Object.assign(listing.tracks.find((track: {name: string}) => track.name === "alpha"),
                  {kind: "circuit", title, points, line: coords, length_m: 2400});
    await route.fulfill({response, json: listing});
  });
  await page.goto("/");
  const {code} = await (await page.request.post("/api/code", {data: {make: {kind: "circuit", title, points, width: 100}}})).json();
  const field = page.getByRole("textbox", {name: "Track code"});
  await field.fill(code);
  const routed = page.waitForRequest(request => new URL(request.url()).pathname === "/api/route" && request.postDataJSON().kind === "circuit");
  await field.press("Enter");
  const sent = (await routed).postDataJSON();
  expect(sent.kind).toBe("circuit");
  expect(sent.points.map((point: number[]) => point.map(value => Number(value.toFixed(6))))).toEqual(points);
  await expect(page.getByText("Back to S · Lap 2.4 km", {exact: true})).toBeVisible();

  const map = (await page.locator(".leaflet-container").boundingBox())!;
  const paths = page.locator(".leaflet-overlay-pane path");
  const view = () => page.evaluate(() => JSON.parse(localStorage.getItem("map2lap.view")!) as {c: {lng: number}; z: number});
  await expect.poll(async () => (await view()).z).toBeGreaterThan(13);
  expect((await view()).c.lng).toBeLessThan(-179);
  await expect(pins(page)).toHaveCount(2);
  await expect(paths).toHaveCount(2);
  const a = await centre(pins(page).first()), b = await centre(pins(page).last());
  expect(a.x).toBeGreaterThan(map.x);
  expect(b.x).toBeGreaterThan(a.x);
  expect(b.x).toBeLessThan(map.x + map.width);

  const contained = async () => {
    const boxes = await paths.evaluateAll(paths => paths.map(path => {
      const {left, right} = path.getBoundingClientRect();
      return {left, right};
    }));
    return boxes.length > 0 && boxes.every(box => box.left > map.x && box.right < map.x + map.width);
  };
  await expect.poll(contained).toBe(true);
  const arrow = await centre(page.getByTestId("lap-arrow").first());
  expect(arrow.x).toBeGreaterThan(a.x);
  expect(arrow.x).toBeLessThan(b.x);

  await page.reload();
  await page.locator("#t-mine").click();
  await page.locator("#pane-mine").getByRole("button", {name: /^Antimeridian Circuit\b/}).click();
  await expect(card(page).getByText("2.40 km", {exact: true})).toBeVisible();
  await expect.poll(async () => (await view()).z).toBeGreaterThan(13);
  expect((await view()).c.lng).toBeLessThan(-179);
  await expect(paths).toHaveCount(1);
  await expect.poll(contained).toBe(true);
});

test("Circuit shows a lap refusal in the status card", async ({page}) => {
  await page.goto("/");
  const error = "At pin 2 the car would have to turn around: put it on the through road.";
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/route", async route => {
    if (route.request().postDataJSON().kind !== "circuit") return route.continue();
    await ready;
    await route.fulfill({status: 400, json: {error}});
  });
  await button(page, "Circuit").click();
  await clickMap(page, .3, .3);
  await clickMap(page, .6, .6);
  await expect(card(page)).toContainText("1.00 km");
  const line = page.locator(".leaflet-overlay-pane path").last();
  await expect(line).toBeVisible();
  const open = await line.getAttribute("d");
  try {
    await button(page, "Close circuit").click();
    await expect(page.getByText("Back to S", {exact: true})).toBeVisible();
    await expect(button(page, "Build track")).toBeDisabled();
  } finally {
    release();
  }
  await expect(card(page)).toContainText(`Circuit: ${error}`);
  await expect(line).toHaveAttribute("d", open!);
  await expect(button(page, "Build track")).toBeDisabled();
  await clickMap(page, .68, .35);
  await expect(card(page)).toContainText("2.00 km");
  await expect(button(page, "Close circuit")).toBeEnabled();
});
