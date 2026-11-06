// What the 3D view draws, down to the pixel: a road texture of four fields (server.py's ROAD_FIELDS) tells from a pixel's colour
// which part of the image lies there, so a mirrored or turned texture can't pass; the rest against known colours and references.
import {join} from "node:path";
import type {Page} from "@playwright/test";
import {centre, dragMouse, expect, openEditor, scene, stillView, test} from "./fixtures";

const SKY = [169, 207, 233];
const SKY_TOLERANCE = 3;        // (of 255: rounding between browsers)
const FIELDS = [["red", "green"], ["blue", "yellow"]];
const FIELD_MARGIN = 0.1;       // of the image: what lies nearer a field's edge is blended with its neighbour (8 x 8 pixels)
// (threshold: Playwright's 0.2 lets a whole picture lit far too bright pass; the same software graphics draw the same pixels)
const REFERENCE = {threshold: 0.02, maxDiffPixelRatio: 0.002, stylePath: join(import.meta.dirname, "view-alone.css")};
const AWAY = {x: 100, y: 500};  // (the mouse off the view: no hover box in the picture)

type Colour = number[];

/** The pixels of a screenshot of the view: colour(x, y). */
async function picture(page: Page, png: Buffer) {
  const pixels = await page.evaluate(async base64 => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const can = canvas.getContext("2d")!;
    can.drawImage(bitmap, 0, 0);
    return {width: bitmap.width, data: Array.from(can.getImageData(0, 0, bitmap.width, bitmap.height).data)};
  }, png.toString("base64"));
  return (x: number, y: number): Colour => {
    const k = (Math.round(y) * pixels.width + Math.round(x)) * 4;
    return pixels.data.slice(k, k + 3);
  };
}

/** Which of the road's four colours a pixel is, however lit: the channels that stand out. */
function fieldOf([r, g, b]: Colour) {
  const high = Math.max(r, g, b) * 0.6;
  const key = [r > high, g > high, b > high].join();
  return {"true,false,false": "red", "false,true,false": "green", "false,false,true": "blue", "true,true,false": "yellow"}[key] ?? `other ${r},${g},${b}`;
}

/** What the hover box says at a point of the page: its mesh and uv. */
async function hovered(page: Page, x: number, y: number) {
  await page.mouse.move(x - 1, y);
  await page.mouse.move(x, y);
  const box = page.locator("#hover-box");
  // (the box follows within a moment, or goes over the sky: until it says the same twice)
  let text: string | null = null;
  await expect.poll(async () => {
    const now = (await box.isVisible()) ? await box.innerText().catch(() => "") : "";
    const same = now === text;
    text = now;
    return same;
  }, {intervals: [100]}).toBe(true);
  text = text ?? "";
  const uv = /UV\s*(-?[\d.]+), (-?[\d.]+)/.exec(text);
  return {text, u: Number(uv?.[1]), v: Number(uv?.[2])};
}

test("the road's texture lies the right way round: each pixel shows the field of the image its uv says", async ({page}) => {
  test.slow();                          // (a hundred points, each asked until the box stands still)
  await openEditor(page);
  await page.mouse.move(AWAY.x, AWAY.y);
  const view = (await scene(page).boundingBox())!;
  const colour = await picture(page, await stillView(page));
  const seen = new Set<string>();
  // (the road tile fills the view below its far edge; the picture was taken without the box)
  for (let y = view.height * 0.15; y < view.height * 0.97; y += view.height * 0.1) {
    for (let x = view.width * 0.03; x < view.width; x += view.width * 0.1) {
      const {text, u, v} = await hovered(page, view.x + x, view.y + y);
      if (!text.includes("1ROAD_ground")) continue;
      const fu = u - Math.floor(u), fv = v - Math.floor(v);
      if ([fu, fv].some(f => Math.abs(f - 0.5) < FIELD_MARGIN || f < FIELD_MARGIN || f > 1 - FIELD_MARGIN)) continue;
      const want = FIELDS[fv < 0.5 ? 0 : 1][fu < 0.5 ? 0 : 1];
      expect(fieldOf(colour(x, y)), `at ${Math.round(x)},${Math.round(y)}, uv ${u}, ${v}`).toBe(want);
      seen.add(want);
    }
  }
  expect([...seen].sort(), "all four fields must have been seen").toEqual(["blue", "green", "red", "yellow"]);
});

test("the sky has its colour, the grass is green, the road is no grass", async ({page}) => {
  await openEditor(page);
  await page.mouse.move(AWAY.x, AWAY.y);
  const view = (await scene(page).boundingBox())!;
  const colour = await picture(page, await stillView(page));
  const sky = colour(view.width * 0.9, 3);
  sky.forEach((c, k) => expect(Math.abs(c - SKY[k]), `sky ${sky}`).toBeLessThanOrEqual(SKY_TOLERANCE));
  // find the grass by asking, then look at its pixel
  await page.mouse.move(AWAY.x, AWAY.y);
  const grassAt = {x: view.width * 0.03, y: view.height * 0.138};     // (the grass tile: beyond the road tile's far left corner)
  const {text} = await hovered(page, view.x + grassAt.x, view.y + grassAt.y);
  expect(text).toContain("1GRASS_ground");
  const [r, g, b] = colour(grassAt.x, grassAt.y);
  expect(g, `grass ${r},${g},${b}`).toBeGreaterThan(r);
  expect(g, `grass ${r},${g},${b}`).toBeGreaterThan(b);
});

test("a tree shows where the mouse finds one, and through its empty parts lies what is behind it", async ({page, backend}) => {
  test.slow();                          // (a hundred points, each asked until the box stands still)
  await backend.post("/__test/rebuild", {name: "beta", title: "Beta Test", trees: false});
  await openEditor(page, "beta");       // (the same view without trees)
  await page.mouse.move(AWAY.x, AWAY.y);
  const empty = await picture(page, await stillView(page));
  await page.locator("#edit-track").selectOption("alpha");
  await expect(page.locator("#edit-status")).toHaveText(/\d+ parts loaded/);
  await page.mouse.move(AWAY.x, AWAY.y);
  const view = (await scene(page).boundingBox())!;
  const full = await picture(page, await stillView(page));

  const changed = (x: number, y: number) => empty(x, y).some((c, k) => Math.abs(c - full(x, y)[k]) > 12);
  // around the near tree, its crown and the empty corners of its image
  const asked: {x: number; y: number; drawn: boolean; tree: boolean}[] = [];
  for (let y = view.height * 0.01; y < view.height * 0.22; y += view.height * 0.025) {
    for (let x = view.width * 0.38; x < view.width * 0.62; x += view.width * 0.025) {
      const {text} = await hovered(page, view.x + x, view.y + y);
      asked.push({x, y, drawn: changed(x, y), tree: text.includes("nocol_trees")});
    }
  }
  const drawn = asked.filter(p => p.drawn), tree = asked.filter(p => p.tree), both = asked.filter(p => p.drawn && p.tree);
  expect(drawn.length, "the tree must be in the picture").toBeGreaterThan(3);
  // (the mouse finds a tree only where one is drawn, and the other way round; at a crown's soft edge one point may differ)
  const tolerated = Math.ceil(asked.length * 0.04);
  expect(tree.length - both.length, "the mouse found a tree on an empty pixel").toBeLessThanOrEqual(tolerated);
  expect(drawn.length - both.length, "a drawn tree the mouse does not find").toBeLessThanOrEqual(tolerated);
});

test("reference views: the track looks as it did", async ({page}) => {
  await openEditor(page);
  const c = await centre(scene(page));
  await page.mouse.move(AWAY.x, AWAY.y);
  await stillView(page);
  await expect(scene(page)).toHaveScreenshot("start.png", REFERENCE);
  await dragMouse(page, c, {x: c.x - 220, y: c.y - 90}, "middle");
  await page.mouse.move(AWAY.x, AWAY.y);
  await stillView(page);
  await expect(scene(page)).toHaveScreenshot("turned.png", REFERENCE);
});
