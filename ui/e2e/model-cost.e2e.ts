import {expect, openLibrary, test} from "./library-fixtures";

/** An uneven indexed grid without NORMAL: native flat shading expands every triangle's corners, and no two neighbours lie
 * flat enough to share them again. Pure. */
function detailedPanel() {
  const positions: number[] = [], indices: number[] = [];
  for (let y = 0; y < 50; y++) for (let x = 0; x < 50; x++) positions.push(x / 10, y / 10, (x * y % 7) / 10);
  for (let y = 0; y < 49; y++) for (let x = 0; x < 49; x++) {
    const a = y * 50 + x; indices.push(a, a + 1, a + 50, a + 1, a + 51, a + 50);
  }
  const points = Buffer.from(new Float32Array(positions).buffer), faces = Buffer.from(new Uint16Array(indices).buffer);
  const binary = Buffer.concat([points, faces]);
  const document = {asset: {version: "2.0"}, scene: 0, scenes: [{nodes: [0]}], nodes: [{mesh: 0}],
    buffers: [{byteLength: binary.length}], bufferViews: [{buffer: 0, byteLength: points.length},
      {buffer: 0, byteOffset: points.length, byteLength: faces.length}],
    accessors: [{bufferView: 0, componentType: 5126, count: positions.length / 3, type: "VEC3", min: [0, 0, 0], max: [4.9, 4.9, 0.6]},
      {bufferView: 1, componentType: 5123, count: indices.length, type: "SCALAR"}],
    meshes: [{primitives: [{attributes: {POSITION: 0}, indices: 1, material: 0}]}],
    materials: [{doubleSided: true, pbrMetallicRoughness: {baseColorFactor: [.2, .5, .3, 1]}}]};
  const json = Buffer.from(JSON.stringify(document));
  const text = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const data = Buffer.concat([binary, Buffer.alloc((4 - binary.length % 4) % 4)]);
  const header = Buffer.alloc(20); header.write("glTF"); header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + text.length + data.length, 8); header.writeUInt32LE(text.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const tail = Buffer.alloc(8); tail.writeUInt32LE(data.length); tail.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, text, tail, data]);
}

test("native geometry cost and heavy warning survive import into the selected library model", async ({page}, testInfo) => {
  await openLibrary(page, "objects");
  const library = page.getByRole("dialog", {name: "Asset library"});
  const prepared = page.waitForResponse(r => r.url().includes("/model-imports?filename="));
  await library.getByLabel("Model file").setInputFiles({name: "detailed-panel.glb", mimeType: "model/gltf-binary", buffer: detailedPanel()});
  const cost = (await (await prepared).json()).geometry.track_cost;
  const importer = page.getByRole("dialog", {name: "Import object", exact: true});
  const facts = importer.getByLabel("Track geometry cost"), heavy = importer.getByRole("status").filter({hasText: "Heavy model"});
  // (the cost of the model as it is: Original, not the 50 % the dialog starts at)
  await importer.getByRole("slider", {name: "Geometry", exact: true}).fill("0");
  await expect(facts).toContainText("4,802 triangles");
  await expect(facts).toContainText("No collision: 0.63 MB");
  await expect(facts).toContainText("Mesh collision: 1.89 MB");
  await expect(heavy).toContainText("Heavy model: 0.63 MB");
  expect(cost.bytes).toEqual({none: 630908, mesh: 1892724});
  await importer.getByRole("combobox", {name: /^Collision/}).selectOption("mesh");
  await expect(heavy).toContainText("Heavy model: 1.89 MB");
  await facts.scrollIntoViewIfNeeded();
  await importer.screenshot({path: testInfo.outputPath("import-cost.png")});
  const published = page.waitForResponse(r => new URL(r.url()).pathname === "/api/library/models" && r.request().method() === "POST");
  await importer.getByRole("button", {name: "Add to library", exact: true}).click();
  const asset = (await (await published).json()).model;
  const measured = await page.request.get(`/api/library/models/${asset.id}/cost`);
  expect(measured.ok()).toBe(true);
  expect(await measured.json()).toEqual(cost);
  await expect(importer).toBeHidden();
  const stored = library.getByLabel("Track geometry cost");
  await expect(stored).toContainText("4,802 triangles");
  await expect(stored.getByRole("status")).toContainText("Heavy model: 1.89 MB");
  await library.screenshot({path: testInfo.outputPath("library-cost.png")});
});
