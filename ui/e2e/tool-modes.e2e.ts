// Tool modes switched by Shift pressed and let go alone, a tool's own keys after the Editor's shortcuts.
import {centre, expect, openEditor, scene, test} from "./fixtures";
import type {Locator, Page} from "@playwright/test";
import {saved} from "./edit-helpers";

const mode = (bar: Locator, name: "Road" | "Free") => expect(bar.getByRole("button", {name, exact: true})).toHaveAttribute("aria-pressed", "true");
const draft = async (page: Page) => (await page.request.get("/api/editor/alpha/edits")).json();

test("Shift alone switches Smooth road and Racing kerb between Road and Free; Shift with Ctrl+Z, a click or the wheel does not", async ({page}) => {
  await openEditor(page);
  const c = await centre(scene(page));
  await page.keyboard.press("r");
  const smooth = page.locator("#edit-road-hint");
  await mode(smooth, "Road");
  await page.keyboard.press("Shift");
  await mode(smooth, "Free");
  await page.keyboard.press("Control+Shift+Z");
  await mode(smooth, "Free");
  await page.keyboard.down("Shift"); await page.mouse.move(c.x, c.y); await page.mouse.wheel(0, -100); await page.keyboard.up("Shift");
  await mode(smooth, "Free");
  await page.keyboard.press("Shift");
  await mode(smooth, "Road");
  await page.keyboard.press("b");
  const kerb = page.locator("#edit-kerb-options");
  await mode(kerb, "Road");
  await page.keyboard.press("Shift");
  await mode(kerb, "Free");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Shift");          // (Select has no modes: nothing to switch, no error)
  await page.keyboard.press("b");
  await mode(kerb, "Free");                    // (the mode stays with the tool while the Editor is open)
});

test("a free kerb: Backspace takes its last point; Esc ends the tool before any tool key and keeps the kerb; each change is one Undo step", async ({page, backend}) => {
  await backend.post("/__test/rebuild", {name: "alpha", title: "Alpha Test", hill: true, trees: false});
  await openEditor(page);
  const c = await centre(scene(page));
  await page.keyboard.press("b");
  await page.keyboard.press("Shift");
  const kerb = page.locator("#edit-kerb-options");
  let answers = 0;
  page.on("response", r => { if (r.url().endsWith("/kerb/way")) answers++; });
  for (const dy of [236, 100, -100]) await page.mouse.click(c.x, c.y + dy);
  await expect(kerb).toContainText("3 points");
  await expect.poll(() => answers).toBe(2);          // (from the second click on, each click asks for the longer line)
  await saved(page);
  const three = (await draft(page)).kerbs[0].line.length;
  await page.keyboard.press("Backspace");
  await expect(kerb).toContainText("2 points");
  await expect.poll(async () => (await draft(page)).kerbs?.[0]?.line.length ?? 0).toBeLessThan(three);
  await page.keyboard.press("Escape");
  await expect(page.locator("#edit-select")).toHaveAttribute("aria-pressed", "true");
  await saved(page);
  expect((await draft(page)).kerbs).toHaveLength(1);
  await page.keyboard.press("Control+z");          // (Backspace's shorter line was one step: the three-point line is back)
  await expect.poll(async () => (await draft(page)).kerbs?.[0]?.line.length ?? 0).toBe(three);
});
