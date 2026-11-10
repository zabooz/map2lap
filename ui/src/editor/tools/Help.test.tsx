import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {Help} from "./Help";

test("Help says how the Editor is worked, then the keys of the tool that is on", () => {
  const html = renderToStaticMarkup(<Help tool="move" />);
  expect(html).toContain("Esc");
  expect(html).toContain("W A S D");
  expect(html).toContain("Transform (M)");
  expect(html).toMatch(/Alt \+ wheel.*size/);
  expect(html).not.toContain("Elevation");
});

test("every tool has its keys, Elevation its soft edge", () => {
  for (const tool of ["select", "camera", "smooth", "elevation", "move", "copy", "delete", "model"] as const) {
    expect(renderToStaticMarkup(<Help tool={tool} />)).toContain("<dt>");
  }
  expect(renderToStaticMarkup(<Help tool="elevation" />)).toMatch(/Ctrl \+ Alt \+ wheel.*soft edge/);
});
