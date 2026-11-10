import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {CostBudget, ModelCost} from "./ModelCost";

test("costs show decimal MB for both collision choices and warn for the selected choice", () => {
  const cost = {version: 1, triangles: 12345, bytes: {none: 400000, mesh: 1200000},
    warning_bytes: 500000, heavy: {none: false, mesh: true}};
  const plain = renderToStaticMarkup(<ModelCost cost={cost} collision="none" />);
  expect(plain).toContain("12,345 triangles");
  expect(plain).toContain("0.40 MB");
  expect(plain).toContain("1.20 MB");
  expect(plain).not.toContain("Heavy model");
  const collision = renderToStaticMarkup(<ModelCost cost={cost} collision="mesh" />);
  expect(collision).toContain("Heavy model");
  expect(collision).toContain("0.50 MB");
});

test("the budget line is always there, quiet within the budget and a warning above it, so nothing moves when it changes", () => {
  const cost = {version: 1, triangles: 12345, bytes: {none: 30000, mesh: 1200000},
    warning_bytes: 500000, heavy: {none: false, mesh: true}};
  const within = renderToStaticMarkup(<CostBudget cost={cost} collision="none" />);
  expect(within).toContain("0.03 MB per copy, within the 0.50 MB budget");
  expect(within).not.toContain("Heavy");
  const above = renderToStaticMarkup(<CostBudget cost={cost} collision="mesh" />);
  expect(above).toContain("Heavy model: 1.20 MB per copy, above the 0.50 MB budget");
  expect(renderToStaticMarkup(<ModelCost cost={cost} collision="mesh" budget={false} />)).not.toContain("Heavy");
});
