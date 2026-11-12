import {expect, openEditor, test} from "./fixtures";
import {deleteTree} from "./edit-helpers";

test("Properties offers cloud cover for dry weather and intensity for rain or snow without changing the draft", async ({page}) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  const saved = await page.locator("#edit-saved").textContent();
  await expect(weather.getByRole("combobox", {name: "Weather", exact: true})).toHaveValue("dry");
  await expect(weather.getByRole("combobox", {name: "Cloud cover"}).locator("option")).toHaveText(["Clear", "Partly cloudy", "Overcast"]);
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("rain");
  await expect(weather.getByRole("combobox", {name: "Intensity"}).locator("option")).toHaveText(["Light", "Moderate", "Heavy"]);
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await weather.getByRole("combobox", {name: "Intensity"}).selectOption("heavy");
  await expect(weather).toContainText("Heavy snow already reduces visibility.");
  await expect(page.locator("#edit-saved")).toHaveText(saved!);
});

test("Play carries the selected weather, wind, additional fog and clock into the session", async ({page}) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("rain");
  await weather.getByRole("combobox", {name: "Intensity"}).selectOption("heavy");
  await weather.getByRole("slider", {name: "Wind direction"}).fill("270");
  await weather.getByRole("slider", {name: "Wind speed"}).fill("25");
  await weather.getByRole("checkbox", {name: "Additional fog"}).check();
  await page.getByRole("slider", {name: "Time of day"}).fill("1110");
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  expect((await started).postDataJSON()).toEqual({name: "alpha", clock: 18.5,
    weather: {kind: "rain", intensity: "heavy", windDirection: 270, windSpeed: 25, fog: true}});
});

test("random precedes north and changing tracks resets the preview weather", async ({page}) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await expect(weather).toContainText("Wind direction: Random");
  await weather.getByRole("slider", {name: "Wind direction"}).fill("0");
  await expect(weather).toContainText("Wind direction: 0°");
  await weather.getByRole("slider", {name: "Wind direction"}).fill("-1");
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await expect(weather.getByRole("combobox", {name: "Weather", exact: true})).toHaveValue("dry");
  await expect(weather.getByRole("combobox", {name: "Cloud cover"})).toHaveValue("light");
  await expect(weather.getByRole("slider", {name: "Wind direction"})).toHaveValue("-1");
});

test("Save as new track followed by Play keeps the chosen weather and clock through the track switch", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await weather.getByRole("combobox", {name: "Intensity"}).selectOption("heavy");
  await page.getByRole("slider", {name: "Time of day"}).fill("1110");
  await page.locator("#edit-play").click();
  await expect(page.locator("#save-dialog")).toBeVisible();
  await page.locator("#save-name").fill("Snow copy");
  const started = page.waitForRequest("**/api/play");
  await page.locator("#save-dialog").getByRole("button", {name: "Save as new track", exact: true}).click();
  expect((await started).postDataJSON()).toEqual({name: "snow_copy", clock: 18.5,
    weather: {kind: "snow", intensity: "heavy", windDirection: -1, windSpeed: 0, fog: false}});
});
