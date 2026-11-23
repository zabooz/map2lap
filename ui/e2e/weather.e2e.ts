import {expect, openEditor, scene, startDriving, test} from "./fixtures";
import {deleteTree} from "./edit-helpers";

test("roof snow covers red tiles in winter and restores their colour in summer", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", trees: false, roof_material: "rtl_00_1"});
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const season = page.getByRole("combobox", {name: "Season", exact: true});
  await page.mouse.move(0, 0);
  const summer = (await scene(page).screenshot()).toString("base64");
  const cover = async () => page.evaluate(async ({summer, current}) => {
    const pixels = async (source: string) => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${source}`)).blob());
      const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext("2d")!; context.drawImage(bitmap, 0, 0); bitmap.close();
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const [a, b] = await Promise.all([pixels(summer), pixels(current)]);
    let red = 0, snowy = 0, changed = 0;
    for (let i = 0; i < a.length; i += 4) {
      if (a[i] < 60 || a[i] < a[i + 1] * 1.5 || a[i] < a[i + 2] * 1.5) continue;
      red++;
      if (b[i + 1] > a[i + 1] + 40 && Math.abs(b[i] - b[i + 1]) < 35) snowy++;
      if (Math.max(...[0, 1, 2].map(c => Math.abs(a[i + c] - b[i + c]))) > 8) changed++;
    }
    return {red, snow: snowy / red, changed: changed / red};
  }, {summer, current: (await scene(page).screenshot()).toString("base64")});
  expect((await cover()).red).toBeGreaterThan(500);
  await season.selectOption("autumn");
  await expect.poll(async () => (await cover()).changed).toBeLessThan(.01);
  await season.selectOption("winter");
  await expect.poll(async () => (await cover()).snow).toBeGreaterThan(.9);
  await season.selectOption("summer");
  await expect.poll(async () => (await cover()).changed).toBeLessThan(.01);
});

test("Properties groups time and season, conditions, and scenery without resetting weather between tabs", async ({page}, testInfo) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await page.screenshot({path: testInfo.outputPath("properties-groups.png")});
  const time = page.getByRole("region", {name: "Time and date", exact: true});
  const conditions = page.getByRole("region", {name: "Conditions", exact: true});
  const scenery = page.getByRole("region", {name: "Scenery", exact: true});
  await expect(time.getByRole("slider", {name: "Time of day"})).toBeVisible();
  await time.getByRole("combobox", {name: "Season", exact: true}).selectOption("autumn");
  await conditions.getByRole("slider", {name: "Air temperature"}).fill("-5");
  await expect(conditions.getByRole("slider", {name: "Road temperature"})).toBeVisible();
  await expect(conditions.getByRole("slider", {name: "Wind speed"})).toBeVisible();
  await expect(conditions.getByRole("slider", {name: "Wind direction"})).toBeVisible();
  await expect(scenery.getByRole("slider", {name: "Tree minimum spacing"})).toBeAttached();
  await conditions.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await expect(time.getByRole("combobox", {name: "Season", exact: true})).toHaveValue("winter");
  await expect(time.getByRole("combobox", {name: "Season", exact: true})).toBeDisabled();
  await page.getByRole("tab", {name: "Selection", exact: true}).click();
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await conditions.getByRole("combobox", {name: "Weather", exact: true}).selectOption("dry");
  await expect(time.getByRole("combobox", {name: "Season", exact: true})).toHaveValue("autumn");
  await expect(conditions.getByRole("slider", {name: "Air temperature"})).toHaveValue("-5");
});

for (const species of ["broadleaf", "birch", "larch", "baobab"]) test(`${species}: seasons retain the green summer crown, warm autumn leaves, and restore after bare winter`, async ({page, backend}, testInfo) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", tree_model: species});
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const season = page.getByRole("combobox", {name: "Season", exact: true});
  const greenPixels = async (image: Buffer) => page.evaluate(async source => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${source}`)).blob());
    const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const c = canvas.getContext("2d")!; c.drawImage(bitmap, 0, 0); bitmap.close();
    const data = c.getImageData(0, 0, canvas.width, canvas.height).data;
    let green = 0;
    // The near tree's crown above the horizon: exclude seasonal ground and the distant evergreen at the left edge.
    for (let y = 0; y < canvas.height * .12; y++) for (let x = Math.floor(canvas.width * .3); x < canvas.width * .7; x++) {
      const i = (y * canvas.width + x) * 4;
      if (data[i + 1] > data[i] * 1.2 && data[i + 1] > data[i + 2] * 1.2 && data[i + 1] > 25) green++;
    }
    return green;
  }, image.toString("base64"));
  await expect(season).toHaveValue("summer");
  const summer = await scene(page).screenshot();
  const green = await greenPixels(summer);
  expect(green).toBeGreaterThan(100);
  await season.selectOption("spring");
  await expect.poll(async () => (await scene(page).screenshot()).equals(summer)).toBe(true);
  await season.selectOption("autumn");
  await expect.poll(async () => greenPixels(await scene(page).screenshot())).toBeLessThan(green * .8);
  await testInfo.attach("autumn", {body: await scene(page).screenshot({path: testInfo.outputPath('autumn.png')}), contentType: "image/png"});
  await season.selectOption("winter");
  await expect.poll(async () => greenPixels(await scene(page).screenshot())).toBeLessThan(green * .2);
  await testInfo.attach("winter", {body: await scene(page).screenshot({path: testInfo.outputPath('winter.png')}), contentType: "image/png"});
  await page.screenshot({path: testInfo.outputPath('winter-properties.png')});
  await season.selectOption("summer");
  await expect.poll(async () => (await scene(page).screenshot()).equals(summer)).toBe(true);
  await testInfo.attach("summer", {body: summer, contentType: "image/png"});
  await scene(page).screenshot({path: testInfo.outputPath('summer.png')});
});

test("the chosen season reaches Play, while selecting snow forces the season shown to Winter", async ({page}) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const season = page.getByRole("combobox", {name: "Season", exact: true});
  await season.selectOption("autumn");
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  await startDriving(page);
  expect((await started).postDataJSON().weather.season).toBe("autumn");
  await expect(page.getByRole("dialog", {name: "Play"})).toBeHidden();
  await page.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await expect(season).toHaveValue("winter");
  await expect(season).toBeDisabled();
  await page.getByRole("combobox", {name: "Weather", exact: true}).selectOption("dry");
  await expect(season).toHaveValue("autumn");
  await expect(season).toBeEnabled();
});

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
  await weather.getByRole("slider", {name: "Air temperature"}).fill("-5");
  await weather.getByRole("slider", {name: "Road temperature"}).fill("2");
  await weather.getByRole("checkbox", {name: "Additional fog"}).check();
  await page.getByRole("slider", {name: "Time of day"}).fill("1110");
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  await startDriving(page);
  expect((await started).postDataJSON()).toMatchObject({name: "alpha", clock: 18.5,
    weather: {kind: "rain", intensity: "heavy", windDirection: 270, windSpeed: 25, fog: true, windscreenSnow: true, season: "summer", airTemperature: -5, roadTemperature: 2}});
});

test("calm is the default, random precedes north and changing tracks resets the preview weather", async ({page}) => {
  await openEditor(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await expect(weather).toContainText("Wind direction: 0°");
  await expect(weather).toContainText("Wind speed: 0 km/h");
  await expect(weather.getByRole("slider", {name: "Air temperature"})).toHaveValue("20");
  await expect(weather.getByRole("slider", {name: "Road temperature"})).toHaveValue("26");
  await weather.getByRole("slider", {name: "Air temperature"}).fill("50");
  await weather.getByRole("slider", {name: "Road temperature"}).fill("80");
  await weather.getByRole("slider", {name: "Wind speed"}).fill("100");
  await expect(weather).toContainText("Wind speed: 100 km/h");
  const started = page.waitForRequest("**/api/play");
  await page.locator("#edit-play").click();
  await startDriving(page);
  expect((await started).postDataJSON().weather.windSpeed).toBe(100);
  await weather.getByRole("slider", {name: "Wind speed"}).fill("-1");
  await expect(weather).toContainText("Wind speed: Random");
  await weather.getByRole("slider", {name: "Wind direction"}).fill("0");
  await expect(weather).toContainText("Wind direction: 0°");
  await weather.getByRole("slider", {name: "Wind direction"}).fill("-1");
  await expect(weather).toContainText("Wind direction: Random");
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await page.locator("#edit-track").selectOption("beta");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  await expect(weather.getByRole("combobox", {name: "Weather", exact: true})).toHaveValue("dry");
  await expect(weather.getByRole("combobox", {name: "Cloud cover"})).toHaveValue("light");
  await expect(weather.getByRole("slider", {name: "Wind direction"})).toHaveValue("0");
  await expect(weather.getByRole("slider", {name: "Wind speed"})).toHaveValue("0");
  await expect(weather.getByRole("slider", {name: "Air temperature"})).toHaveValue("20");
  await expect(weather.getByRole("slider", {name: "Road temperature"})).toHaveValue("26");
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
  await startDriving(page);
  expect((await started).postDataJSON().weather).toMatchObject({kind: "snow", windscreenSnow: false});
});

test("Play saves current edits and keeps the chosen weather and clock", async ({page}) => {
  await openEditor(page);
  await deleteTree(page);
  await page.getByRole("tab", {name: "Properties", exact: true}).click();
  const weather = page.getByRole("region", {name: "Weather settings"});
  await weather.getByRole("combobox", {name: "Weather", exact: true}).selectOption("snow");
  await weather.getByRole("combobox", {name: "Intensity"}).selectOption("heavy");
  await weather.getByRole("slider", {name: "Air temperature"}).fill("-12");
  await weather.getByRole("slider", {name: "Road temperature"}).fill("-6");
  await page.getByRole("slider", {name: "Time of day"}).fill("1110");
  await page.locator("#edit-play").click();
  const started = page.waitForRequest("**/api/play");
  await startDriving(page);
  await expect(page.locator("#save-dialog")).toBeHidden();
  expect((await started).postDataJSON()).toMatchObject({name: "alpha", clock: 18.5,
    weather: {kind: "snow", intensity: "heavy", windDirection: 0, windSpeed: 0, fog: false, windscreenSnow: true, season: "summer", airTemperature: -12, roadTemperature: -6}});
});
