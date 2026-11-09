import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {MaterialLibrary} from "./MaterialLibrary";

test("partial ground Apply explains that only the highlighted tiles will change", () => {
  const html = renderToStaticMarkup(<MaterialLibrary embedded open target="Meadow" reason={null} limitedTiles={64}
    busy={false} error={null} onApply={async () => true} onClose={() => {}} />);
  expect(html).toContain("Only the highlighted areas in 64 tiles will change");
  expect(html).toContain("Apply to 64 tiles");
});
