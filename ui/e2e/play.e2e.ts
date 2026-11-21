import {expect, startDriving, test} from "./fixtures";

test("Play switches between Hotlap and a Race grid without moving the dialog", async ({page}) => {
  await page.route("**/api/tracks", async route => {
    const response = await route.fetch();
    const data = await response.json();
    const alpha = data.tracks.find((track: {name: string}) => track.name === "alpha");
    alpha.kind = "circuit";
    await route.fulfill({response, json: data});
  });
  await page.route("**/api/play/options?name=alpha", route => route.fulfill({json: {max_opponents: 3}}));
  await page.goto("/");
  await page.locator("#t-mine").click();
  await page.locator("#actions").getByRole("button", {name: "▶ Play"}).click();

  const dialog = page.getByRole("dialog", {name: "Play"});
  const session = dialog.getByRole("combobox", {name: "Session"});
  const opponents = dialog.getByRole("combobox", {name: "Opponents"});
  await expect(session).toHaveValue("practice");
  const bounds = await dialog.boundingBox();
  await session.selectOption("hotlap");
  await expect(opponents).toHaveCount(0);
  await session.selectOption("race");
  await expect(opponents.locator("option")).toHaveCount(4);
  await expect(dialog.getByRole("combobox", {name: "Laps"})).toHaveValue("2");
  await opponents.selectOption("3");
  await dialog.getByRole("slider", {name: "Strength"}).fill("92");
  await dialog.getByRole("slider", {name: "Aggression"}).fill("24");
  await dialog.getByRole("combobox", {name: "Opponent car"}).selectOption("car_a");
  expect(await dialog.boundingBox()).toEqual(bounds);

  await dialog.getByRole("tab", {name: "Air and road"}).click();
  await expect(session).toHaveCount(0);
  const air = dialog.getByRole("slider", {name: "Air temperature"});
  await air.fill("17");
  expect(await dialog.boundingBox()).toEqual(bounds);
  await dialog.getByRole("tab", {name: "Session"}).click();
  await expect(opponents).toHaveValue("3");
  await expect(air).toHaveCount(0);

  const request = page.waitForRequest("**/api/play");
  await startDriving(page);
  expect((await request).postDataJSON()).toMatchObject({name: "alpha", session: "race", laps: 2,
    ai: {opponents: 3, strength: 92, aggression: 24, car: "car_a"}, weather: {airTemperature: 17}});
});
