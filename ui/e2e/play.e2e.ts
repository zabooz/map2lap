import {expect, startDriving, test} from "./fixtures";

test("Play switches between Hotlap and a Race grid without moving the dialog", async ({page}) => {
  await page.route("**/api/tracks", async route => {
    const response = await route.fetch();
    const data = await response.json();
    const alpha = data.tracks.find((track: {name: string}) => track.name === "alpha");
    alpha.kind = "circuit";
    await route.fulfill({response, json: data});
  });
  await page.route("**/api/play/options?name=alpha", async route => {
    const response = await route.fetch();
    await route.fulfill({response, json: {...await response.json(), max_opponents: 5}});
  });
  await page.goto("/");
  await page.locator("#t-mine").click();
  await page.locator("#actions").getByRole("button", {name: "▶ Play"}).click();

  const dialog = page.getByRole("dialog", {name: "Play"});
  await expect(dialog.getByRole("heading", {name: "Play", exact: true})).toHaveCount(0);
  await expect(dialog.getByRole("checkbox", {name: "Use last session time"})).toHaveCount(0);
  const session = dialog.getByRole("combobox", {name: "Session"});
  const opponents = dialog.getByRole("combobox", {name: "Opponents"});
  await expect(session).toHaveValue("practice");
  const bounds = await dialog.boundingBox();
  await session.selectOption("hotlap");
  await expect(opponents).toHaveCount(0);
  await session.selectOption("race");
  await expect(opponents.locator("option")).toHaveCount(6);
  await expect(dialog.getByRole("combobox", {name: "Laps"})).toHaveValue("2");
  await expect(opponents).toHaveValue("5");
  await dialog.getByRole("slider", {name: "Strength"}).fill("92");
  await dialog.getByRole("slider", {name: "Aggression"}).fill("24");
  await dialog.getByRole("combobox", {name: "Opponent car"}).selectOption("car_a");
  expect(await dialog.boundingBox()).toEqual(bounds);

  await dialog.getByRole("tab", {name: "Air and road"}).click();
  await expect(session).toHaveCount(0);
  const grip = dialog.getByRole("combobox", {name: "Track grip"});
  await expect(grip.getByRole("option", {name: "Green · 95% base, 2% variation"})).toHaveCount(1);
  await expect(grip).toHaveValue("Optimum");
  const base = dialog.getByRole("slider", {name: "Starting grip"});
  const variation = dialog.getByRole("slider", {name: "Grip variation"});
  await expect(base).toHaveValue("100");
  await expect(variation).toHaveValue("0");
  await base.fill("91");
  await expect(grip).toHaveValue("Custom");
  await grip.selectOption("Green");
  await expect(base).toHaveValue("95");
  await expect(variation).toHaveValue("2");
  await variation.fill("0");
  const air = dialog.getByRole("slider", {name: "Air temperature"});
  await air.fill("17");
  expect(await dialog.boundingBox()).toEqual(bounds);
  await dialog.getByRole("tab", {name: "Session"}).click();
  await expect(opponents).toHaveValue("5");
  await expect(air).toHaveCount(0);

  const request = page.waitForRequest("**/api/play");
  await startDriving(page);
  const body = (await request).postDataJSON();
  expect(body).not.toHaveProperty("clock");
  expect(body).toMatchObject({name: "alpha", session: "race", laps: 2, grip: {preset: "Green", variation: 0},
    ai: {opponents: 5, strength: 92, aggression: 24, car: "car_a"}, weather: {airTemperature: 17}});
});

test("Play asks before using a manual line or starting a failed Race solo", async ({page}) => {
  await page.route("**/api/tracks", async route => {
    const response = await route.fetch();
    const data = await response.json();
    data.tracks.find((t: {name: string}) => t.name === "alpha").kind = "circuit";
    await route.fulfill({response, json: data});
  });
  await page.route("**/api/play/options?name=alpha", route => route.fulfill({json: {max_opponents: 2}}));
  const grid: number[] = [];
  let manual = false;
  await page.route("**/api/play", route => {
    expect(route.request().postDataJSON().grip).toBe("Optimum");
    const n = route.request().postDataJSON().ai.opponents;
    grid.push(n);
    if (manual) {
      const {useInstalled, recalculate} = route.request().postDataJSON().ai;
      return route.fulfill({json: useInstalled === "chosen-file" || recalculate ? {ok: true} :
        {lane: "manual", token: "chosen-file", error: "The installed AI line was replaced by hand."}});
    }
    return route.fulfill({json: n ? {lane: "failed", error: "No driveable road at route metre 74.9"} : {ok: true}});
  });
  await page.goto("/");
  await page.locator("#t-mine").click();
  const dialog = page.getByRole("dialog", {name: "Play"});
  for (const action of ["Cancel", "Start without opponents", "Use installed line", "Recalculate"]) {
    await page.locator("#actions").getByRole("button", {name: "▶ Play"}).click();
    await dialog.getByRole("combobox", {name: "Session", exact: true}).selectOption("race");
    const opponents = dialog.getByLabel("Opponents", {exact: true});
    await expect(opponents).toHaveValue("2");
    await opponents.selectOption("1");
    await startDriving(page);
    await expect(dialog).toContainText(manual ? "The installed AI line was replaced by hand." : "74.9");
    await dialog.getByRole("button", {name: action, exact: true}).click();
    await expect(dialog).toHaveCount(0);
    if (action === "Start without opponents") manual = true;
  }
  expect(grid).toEqual([1, 1, 0, 1, 1, 1, 1]);
});
