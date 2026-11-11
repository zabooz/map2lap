import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {MaterialLibrary} from "./MaterialLibrary";

test("partial ground Apply explains that only the highlighted tiles will change", () => {
  const html = renderToStaticMarkup(<MaterialLibrary embedded open target="Meadow" reason={null} limitedTiles={64}
    busy={false} error={null} onApply={async () => true} onClose={() => {}} />);
  expect(html).toContain("Only the highlighted areas in 64 tiles will change");
  expect(html).toContain("Apply to 64 tiles");
});

test("an Apply under way shows how far each step is in its bar", () => {
  const html = (progress: {phase: string; done: number; total: number}) => renderToStaticMarkup(<MaterialLibrary embedded open
    target="Meadow" reason={null} busy progress={progress} error={null} onApply={async () => true} onClose={() => {}} />);
  expect(html({phase: "masks", done: 120, total: 300})).toContain("Taking the selection: 120 of 300 tiles");
  expect(html({phase: "masks", done: 120, total: 300})).toMatch(/<progress[^>]*value="120"[^>]*max="300"|<progress[^>]*max="300"[^>]*value="120"/);
  expect(html({phase: "preview", done: 3, total: 300})).toContain("Preparing the preview: 3 of 300 tiles");
  expect(html({phase: "loading", done: 7, total: 9})).toContain("Loading the preview: 7 of 9");
});
