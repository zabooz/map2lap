import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {ModelDetails, modelName} from "./ModelDetails";

test("publisher prefixes leave object titles while credit remains in the right information panel", () => {
  for (const creator of ["Kenney", "Quaternius"]) {
    const model = {id: "a", name: `${creator} - Flower Purple B`, category: "flower", metres_per_unit: 1,
      anchor: [0, 0, 0], collision: "none" as const, creator, license: "CC0", source_url: "https://example.org/source"};
    expect(modelName(model)).toBe("Flower Purple B");
    const html = renderToStaticMarkup(<ModelDetails model={model} />);
    expect(html).toContain("<strong>Flower Purple B</strong>");
    expect(html).not.toContain(`${creator} - Flower`);
    expect(html).toContain('aria-label="Object information"');
    expect(html).toContain(`<dd>${creator}</dd>`);
    expect(html).toContain("CC0");
    expect(html).toContain('href="https://example.org/source"');
  }
});

test("unprovided credits stay unknown and source links allow only web URLs", () => {
  const model = {id: "a", name: "Own model", category: "other", metres_per_unit: 1,
    anchor: [0, 0, 0], collision: "none" as const, source_url: "javascript:alert(1)"};
  expect(modelName(model)).toBe("Own model");
  const html = renderToStaticMarkup(<ModelDetails model={model} />);
  expect(html).toContain("Not specified");
  expect(html).not.toContain('href="javascript:');
});

test("our native trees show shared storage and their real licence instead of a KN5 cost per tree", () => {
  const model = {id: "a", name: "Spruce", category: "tree", metres_per_unit: 1, anchor: [0, 0, 0], collision: "none" as const,
    creator: "Map2Lap (zabooz)", license: "MIT", source_url: "https://github.com/zabooz/map2lap",
    native_tree: {file: "native/model.bin", bytes: 12288}};
  const html = renderToStaticMarkup(<ModelDetails model={model} />);
  expect(html).toContain("Shared tree model");
  expect(html).toContain("3 detail levels");
  expect(html).toContain("MIT");
  expect(html).toContain("Map2Lap (zabooz)");
  expect(html).not.toContain("Reading geometry cost");
});
