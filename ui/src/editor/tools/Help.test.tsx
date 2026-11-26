import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {Help} from "./Help";
import {TOOLS} from "./toolDefs";

test("Transform, Smooth road and Insert use T, R and E consistently without duplicate tool keys", () => {
  for (const [tool, key] of [["move", "T"], ["smooth", "R"], ["model", "E"]]) {
    const entry = TOOLS.find(t => t.tool === tool)!;
    expect(entry.key).toBe(key); expect(entry.hint).toContain(`(${key}`);
  }
  const keys = TOOLS.flatMap(t => t.key ? [t.key] : []);
  expect(new Set(keys).size).toBe(keys.length);
});

test("Help says how the Editor is worked, then the keys of the tool that is on", () => {
  const html = renderToStaticMarkup(<Help tool="move" />);
  expect(html).toContain("Esc");
  expect(html).toContain("W A S D");
  expect(html).toContain("Transform (T)");
  expect(html).toMatch(/Alt \+ wheel.*size/);
  expect(html).not.toContain("Elevation");
});

test("every tool has its keys, Elevation its soft edge", () => {
  for (const tool of ["select", "camera", "smooth", "elevation", "move", "copy", "delete", "model"] as const) {
    expect(renderToStaticMarkup(<Help tool={tool} />)).toContain("<dt>");
  }
  expect(renderToStaticMarkup(<Help tool="elevation" />)).toMatch(/Ctrl \+ Alt \+ wheel.*soft edge/);
});

test("AI hint help explains how to tune a downhill hairpin", () => {
  const corner = renderToStaticMarkup(<Help tool="ai-corner" />);
  expect(corner).toMatch(/0\.85.*slower/);

  const braking = renderToStaticMarkup(<Help tool="ai-braking" />);
  expect(braking).toContain("1.00 is neutral");
  expect(braking).toMatch(/0\.90.*earlier/);
  expect(braking).toMatch(/1\.10.*later/);

  const limit = renderToStaticMarkup(<Help tool="ai-speed-limit" />);
  expect(limit).toMatch(/positive.*km\/h/i);
  expect(limit).toMatch(/start.*before.*target speed/i);
});

test("Select's help names Alt and the right-click menu, Smooth road's that R starts at a picked road", () => {
  const select = renderToStaticMarkup(<Help tool="select" />);
  expect(select).toMatch(/Alt.*texture.*replace/);
  expect(select).toMatch(/B.*kerb/);
  expect(select).not.toContain("marks all of its sort");
  expect(renderToStaticMarkup(<Help tool="smooth" />)).toMatch(/R.*picked road/);
});

test("Racing kerb Help names B, Road and Free, and the modifier controls", () => {
  const help = renderToStaticMarkup(<Help tool="kerb" />);
  expect(help).toContain("<dt>B</dt>");
  expect(help).toContain("complete range");
  expect(help).toContain("first click chooses the road edge");
  expect(help).toMatch(/<dt>Shift<\/dt><dd>switch between Road and Free/);
  expect(help).toMatch(/Free: click.*centred on them/);
  expect(help).toMatch(/Ctrl \+ wheel.*width by 5 cm/);
  expect(help).toMatch(/Alt \+ wheel.*physical height by 1 cm/);
  expect(help).toMatch(/Ctrl \+ Alt \+ wheel.*flat, rounded or ribbed profile/);
});
