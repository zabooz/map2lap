import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {TransformFields} from "./TransformFields";

const at = {id: "t_0_0#1", x: 0, y: 0.25, z: 0, turn: 30, scale: 1.5};
const move = {targets: ["t_0_0#1"], shown: at, setTurn: () => {}, setHeight: () => {}, setSize: () => {}, reset: () => {}};

test("A picked object's turn, raise and size stand in the panel as fields to type into, with Reset", () => {
  const html = renderToStaticMarkup(<TransformFields move={move} />);
  expect(html).toMatch(/Turn.*value="30".*°/);
  expect(html).toMatch(/Raise.*value="25".*cm/);
  expect(html).toMatch(/Size.*value="150".*%/);
  expect(html).toContain("Reset");
});

test("Nothing movable picked: no fields", () => {
  expect(renderToStaticMarkup(<TransformFields move={{...move, targets: []}} />)).toBe("");
});
