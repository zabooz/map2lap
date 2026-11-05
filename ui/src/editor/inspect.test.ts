import {expect, test} from "bun:test";
import {billboardFaces, billboardOf, kindOf, latLonOf, physicsOf, routeMetre, spriteAt, tileOf} from "./inspect";

test("a tile from AC's x and z: z is minus north", () => {
  expect(tileOf(10, -10)).toEqual([0, 0]);
  expect(tileOf(-1, 1)).toEqual([-1, -1]);
  expect(tileOf(256, -512)).toEqual([1, 2]);
});

test("latitude and longitude as geodesy.EnuFrame gives them", () => {
  const anchor: [number, number] = [42.9240775, 9.364324];
  const near = latLonOf(anchor, 100, 50, -200), far = latLonOf(anchor, 250000, 1200, 300000);
  expect(near[0]).toBeCloseTo(42.925877801, 7);
  expect(near[1]).toBeCloseTo(9.365548896, 7);
  expect(far[0]).toBeCloseTo(40.188343899, 7);
  expect(far[1]).toBeCloseTo(12.295262871, 7);
});

test("the metre along a route and the distance off it", () => {
  const route = [[0, 0], [100, 0], [100, 50]];
  expect(routeMetre(route, 40, 3)).toEqual({metre: 40, off: 3});
  expect(routeMetre(route, 104, 20)).toEqual({metre: 120, off: 4});
  expect(routeMetre(route, -5, 0)).toEqual({metre: 0, off: 5});
  expect(routeMetre([[0, 0]], 1, 1)).toBeNull();
});

test("a billboard goes on over the parts of its tile", () => {
  expect(billboardOf(0, 0)).toBe(0);
  expect(billboardOf(7, 0)).toBe(0);
  expect(billboardOf(8, 0)).toBe(1);
  expect(billboardOf(0, 21666)).toBe(2708);      // (21666 / 8: a part can start inside one)
  expect(billboardFaces(1, 0, 100)).toEqual([8, 16]);
  expect(billboardFaces(2708, 21666, 100)).toEqual([0, 6]);
  expect(billboardFaces(2708, 21660, 10)).toEqual([4, 10]);
});

test("an atlas image from a uv as the kn5 stores it", () => {
  const atlas = {sprites: ["a", "b", "c", "d"], cols: 2, rows: 2};
  expect(spriteAt(atlas, 0.1, -0.9)).toBe("a");
  expect(spriteAt(atlas, 0.6, -0.9)).toBe("b");
  expect(spriteAt(atlas, 0.1, -0.1)).toBe("c");
  expect(spriteAt({...atlas, sprites: ["a"]}, 0.6, -0.1)).toBeNull();
});

test("a mesh's name: what it is and what it does to the car", () => {
  expect([kindOf("nocol_trees_-1_0"), physicsOf("nocol_trees_-1_0")]).toEqual(["Tree", "None (drive through)"]);
  expect(kindOf("nocol_trees_bush_-1_0_1")).toBe("Bush");
  expect(kindOf("nocol_bush_3_4")).toBe("Bush");
  expect([kindOf("1ROAD_ground_0_0"), physicsOf("1ROAD_ground_0_0")]).toEqual(["Road surface", "Road"]);
  expect(kindOf("1GRASS_ground_0_0_1")).toBe("Soft ground");
  expect(kindOf("nocol_far_1")).toBe("Distant terrain");
  expect(physicsOf("1WALL_bldcol_0_0")).toBe("Wall");
});
