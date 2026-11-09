import {expect, test} from "bun:test";
import {placeOnRoute, routeMetres} from "./ride";

const route = [[0, 0], [10, 0], [10, 0], [10, 20]];     // (with a point twice: a route can have that)
const metres = routeMetres(route);

test("the length up to each point", () => {
  expect(metres).toEqual([0, 10, 10, 30]);
});

test("a place along the way lies between its points, over a point given twice too", () => {
  expect(placeOnRoute(route, metres, 5)).toEqual([5, 0]);
  expect(placeOnRoute(route, metres, 10)).toEqual([10, 0]);
  expect(placeOnRoute(route, metres, 20)).toEqual([10, 10]);
});

test("beyond its ends: the ends", () => {
  expect(placeOnRoute(route, metres, -5)).toEqual([0, 0]);
  expect(placeOnRoute(route, metres, 99)).toEqual([10, 20]);
});
