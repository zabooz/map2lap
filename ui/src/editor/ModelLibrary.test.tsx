import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {ModelLibrary} from "./ModelLibrary";

test("the Objects library exposes search, category filtering and its selected-tree replacement scope", () => {
  const html = renderToStaticMarkup(<ModelLibrary embedded replace={12} onChoose={() => {}} onClose={() => {}} />);
  expect(html).toContain('aria-label="Search objects"');
  expect(html).toContain('aria-label="Filter objects"');
  expect(html).toContain("Replace 12 selected trees");
  expect(html).toContain("Import…");
});
