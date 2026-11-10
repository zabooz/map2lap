import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {ModelCost} from "./ModelCost";

test("costs show decimal MB for both collision choices and warn for the selected choice", () => {
  const cost = {version: 1, triangles: 12345, bytes: {none: 400000, mesh: 1200000},
    warning_bytes: 500000, heavy: {none: false, mesh: true}};
  const plain = renderToStaticMarkup(<ModelCost cost={cost} collision="none" />);
  expect(plain).toContain("12,345 triangles");
  expect(plain).toContain("0.40 MB");
  expect(plain).toContain("1.20 MB");
  expect(plain).toContain("per instance in the track");
  expect(plain).not.toContain("Heavy model");
  const collision = renderToStaticMarkup(<ModelCost cost={cost} collision="mesh" />);
  expect(collision).toContain("Heavy model");
  expect(collision).toContain("0.50 MB");
});
