import {test, expect, openLibrary} from "./library-fixtures";

test("our shipped trees, rocks and lamps have previews, native cost information and author/licence credits", async ({page, backend}, info) => {
  await backend.post("/__test/builtin-models");
  await openLibrary(page, "objects");
  const library = page.getByRole("dialog", {name: "Asset library"}), search = library.getByLabel("Search objects");
  await search.fill("Spruce");
  await library.getByRole("button", {name: "Spruce", exact: true}).click();
  const details = library.getByRole("region", {name: "Object information"});
  await expect(details.getByText("Map2Lap (zabooz)", {exact: true})).toBeVisible();
  await expect(details.getByText("MIT", {exact: true})).toBeVisible();
  await expect(details).toContainText("Shared tree model");
  await expect(details.getByRole("link", {name: "View source"})).toHaveAttribute("href", "https://github.com/zabooz/map2lap");
  await expect(library.locator("canvas")).toBeVisible();
  await search.fill(""); await library.getByLabel("Filter objects").selectOption("rock");
  for (let n = 1; n <= 6; n++) await expect(library.getByRole("button", {name: `Rock ${n}`, exact: true})).toBeVisible();
  await library.getByLabel("Filter objects").selectOption(""); await search.fill("Street lamp");
  await library.getByRole("button", {name: "Street lamp", exact: true}).click();
  await expect(details).toContainText("Lights the road at night with CSP.");
  await expect(details.getByText("MIT", {exact: true})).toBeVisible();
  await library.screenshot({path: info.outputPath("map2lap-lamp-credits.png")});
});
