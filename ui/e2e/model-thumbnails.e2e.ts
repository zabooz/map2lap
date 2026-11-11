import {execFileSync} from "node:child_process";
import {join} from "node:path";
import {test, expect, openLibrary} from "./library-fixtures";

test("object cards show distinct model pictures and reuse them after reopening and reloading", async ({page, backend}, info) => {
  const repo = join(import.meta.dirname, "../..");
  const python = join(repo, process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python");
  for (const [name, args] of [["Leafy tree", []], ["White tree", ["--default-material"]]] as const) {
    const body = execFileSync(python, [join(repo, "ui/e2e/model_fixture.py"), ...args]);
    const prepared = await page.request.post(`${backend.url}/api/library/model-imports?filename=tree.glb`, {
      headers: {Origin: backend.url, "Content-Type": "application/x-map2lap-glb"}, data: body,
    });
    expect(prepared.ok()).toBe(true);
    const added = await page.request.post(`${backend.url}/api/library/models`, {
      headers: {Origin: backend.url}, data: {token: (await prepared.json()).token, filename: "tree.glb", name,
        category: "tree", metres_per_unit: 1, collision: "none"},
    });
    expect(added.ok()).toBe(true);
  }
  const sources: string[] = [];
  page.on("request", request => { if (/\/api\/library\/models\/[^/]+\/original$/.test(request.url())) sources.push(request.url()); });
  const open = async () => {
    await openLibrary(page, "objects");
  };
  await open();
  const library = page.getByRole("dialog", {name: "Asset library"});
  const leafy = library.getByRole("button", {name: "Leafy tree", exact: true}).getByRole("img");
  const white = library.getByRole("button", {name: "White tree", exact: true}).getByRole("img");
  await expect(leafy).toBeVisible(); await expect(white).toBeVisible();
  // Read actual pixels, rather than accepting a blank PNG or two copies of a placeholder.
  const pixels = async () => library.locator("[data-library-browser] img").evaluateAll(images => images.map(image => {
    const img = image as HTMLImageElement, canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d")!; context.drawImage(img, 0, 0);
    const bytes = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let opaque = 0, green = 0, clipped = 0;
    for (let i = 0; i < bytes.length; i += 4) if (bytes[i + 3] > 200) {
      opaque++; if (bytes[i + 1] > bytes[i] * 1.3) green++;
      if (Math.max(bytes[i], bytes[i + 1], bytes[i + 2]) >= 254) clipped++;
    }
    return {width: img.naturalWidth, opaque, green, clipped};
  }));
  await expect.poll(async () => (await pixels()).filter(p => p.width === 512 && p.opaque > 1000).length).toBe(2);
  const pictures = await pixels(); expect(Math.max(...pictures.map(p => p.green))).toBeGreaterThan(1000);
  expect(Math.max(...pictures.map(p => p.green))).toBeGreaterThan(Math.min(...pictures.map(p => p.green)) * 4);
  for (const picture of pictures) expect(picture.clipped / picture.opaque).toBeLessThan(.05);
  expect(sources).toHaveLength(2);
  await library.screenshot({path: info.outputPath("object-thumbnails.png")});
  await library.getByRole("button", {name: "Cancel", exact: true}).click();
  await page.getByRole("button", {name: "Insert", exact: true}).click();
  await expect(leafy).toBeVisible(); expect(sources).toHaveLength(2);
  await page.reload(); await open();
  await expect(leafy).toBeVisible(); await expect(white).toBeVisible();
  expect(sources).toHaveLength(2);
  await library.getByRole("button", {name: "Leafy tree", exact: true}).click();
  // (the selected one turns in 3D, from its GLB loaded once more for it: the card pictures stay as they were)
  await expect(library.getByLabel("Model preview").locator("canvas")).toBeVisible();
  await expect.poll(() => sources.length).toBe(3);
  await expect(leafy).toBeVisible(); await expect(white).toBeVisible();
  await expect(library.getByRole("button", {name: "Place on ground", exact: true})).toBeEnabled();
});
