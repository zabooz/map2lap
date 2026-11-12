import {expect, openEditor, scene, test} from "./fixtures";
import {deleteTree} from "./edit-helpers";

for (const kind of ["rain", "snow"]) test(`${kind} particles visibly move in front of the editor terrain`, async ({page}, testInfo) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption(kind);
  await weather.getByRole("combobox", {name: "Intensity"}).selectOption("medium");
  await page.mouse.move(0, 0);
  const before = (await scene(page).screenshot()).toString("base64");
  let after: Buffer;
  await expect.poll(async () => {
    after = await scene(page).screenshot();
    return page.evaluate(async ({before, after}) => {
      const pixels = async (image: string) => {
        const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${image}`)).blob());
        const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
        const context = canvas.getContext("2d")!; context.drawImage(bitmap, 0, 0); bitmap.close();
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const [a, b] = await Promise.all([pixels(before), pixels(after)]);
      let changed = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 8) changed++;
      }
      return changed;
    }, {before, after: after.toString("base64")});
    // More than compression/edge noise must move; changing sky colour or static fog cannot satisfy this.
  }).toBeGreaterThan(80);
  await testInfo.attach(`${kind}-editor`, {body: after!, contentType: "image/png"});
});

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
    weather: {kind: "rain", intensity: "heavy", windDirection: 270, windSpeed: 25, fog: true, windscreenSnow: true}});
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

test("windscreen snow can be disabled while the native snowfall remains selected", async ({page}) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  const toggle = weather.getByRole("checkbox", {name: "Snow on windscreen"});
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  expect((await started).postDataJSON().weather).toMatchObject({kind: "snow", windscreenSnow: false});
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
    weather: {kind: "snow", intensity: "heavy", windDirection: -1, windSpeed: 0, fog: false, windscreenSnow: true}});
});
