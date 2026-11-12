import {expect, test} from "bun:test";
import {childrenOf, countOfSort, idsOfSorts, kindOf, latLonOf, nearestLast, objectAt, objectIndex, physicsOf, routeMetre,
        sortName, sortOf, takenAlong, tileOf, trackArea, type ObjectList} from "./inspect";

test("the camera's area: what the meshes take up, each by its sphere; none: no limit", () => {
  expect(trackArea([{center: [10, 5, -20], radius: 2}, {center: [-30, 0, 40], radius: 1}])).toEqual({minX: -31, maxX: 12, minZ: -22, maxZ: 41});
  expect(trackArea([]).maxX).toBe(Infinity);
});

test("the queue: the nearest comes last, a large mesh counts from its edge; the list given stays", () => {
  const far = {center: [100, 0, 0], radius: 1}, near = {center: [10, 0, 0], radius: 1}, large = {center: [50, 0, 0], radius: 45};
  const items = [near, far, large];
  expect(nearestLast(items, [0, 0, 0])).toEqual([far, near, large]);
  expect(items).toEqual([near, far, large]);
});

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

test("a triangle's object: over all its pieces, fronts and backs, in any mesh; none between them", () => {
  const index = objectIndex({
    cars: {kinds: ["car", "car"], at: [[0, 0, 0], [1, 1, 1]], parents: [-1, -1], faces: [[[5, 0, 10], [5, 30, 10]], [[5, 10, 10], [5, 40, 5], [6, 0, 5]]]},
  });
  const in5 = index.get(5);
  expect(objectAt(in5, 0)).toBe("cars#0");
  expect(objectAt(in5, 9)).toBe("cars#0");
  expect(objectAt(in5, 10)).toBe("cars#1");
  expect(objectAt(in5, 35)).toBe("cars#0");
  expect(objectAt(in5, 44)).toBe("cars#1");
  expect(objectAt(in5, 20)).toBeNull();
  expect(objectAt(in5, 45)).toBeNull();
  expect(objectAt(index.get(6), 4)).toBe("cars#1");
  expect(objectAt(index.get(7), 0)).toBeNull();
});

test("what belongs to an object, by tile", () => {
  const list = {kinds: ["house", "house sign", "door", "car"], at: [], parents: [-1, 0, 0, -1], faces: []};
  const children = childrenOf({t_0_0: list});
  expect(children.get("t_0_0#0")).toEqual(["t_0_0#1", "t_0_0#2"]);
  expect(children.get("t_0_0#3")).toBeUndefined();
  const withWires = childrenOf({t_0_0: {...list, with: {3: ["t_1_0#7"]}}});
  expect(withWires.get("t_0_0#3")).toEqual(["t_1_0#7"]);
});

test("all of a sort: by the finest name, or the kind in an older list; what still stands is counted", () => {
  const poles: ObjectList = {kinds: ["power pole", "power pole", "street furniture"], sorts: ["pole", "pole", "bench"], at: [],
                             parents: [-1, -1, -1], faces: [[[0, 0, 1]], [[0, 1, 1]], [[0, 2, 1]]], with: {0: ["t_1_0#0"], 1: ["t_1_0#0"]}};
  const wires: ObjectList = {kinds: ["power line"], at: [], parents: [-1], faces: [[[1, 0, 1]]]};
  const lists = {t_0_0: poles, t_1_0: wires};
  expect([sortOf(poles, 2), sortOf(wires, 0)]).toEqual(["bench", "power line"]);
  expect([sortName("bench"), sortName("power line"), sortName("speedk50")]).toEqual(["Bench", "Power line", "Speed limit 50"]);
  expect(idsOfSorts(lists, new Set(["pole"]))).toEqual(["t_0_0#0", "t_0_0#1"]);
  // (pole A deleted alone: the span the two share goes with it, pole B still stands)
  const going = takenAlong(["t_0_0#0"], childrenOf(lists));
  expect([...going].sort()).toEqual(["t_0_0#0", "t_1_0#0"]);
  expect([countOfSort(lists, "pole", going), countOfSort(lists, "power line", going)]).toEqual([1, 0]);
  expect(countOfSort({t_0_0: {...poles, faces: [[], [[0, 1, 1]], []]}}, "pole", new Set())).toBe(1);   // (left out of a saved track's own kn5)
});

test("a mesh's name: what it is and what it does to the car", () => {
  expect([kindOf("nocol_props_-1_0"), physicsOf("nocol_props_-1_0")]).toEqual(["Street furniture", "None (drive through)"]);
  expect([kindOf("1ROAD_ground_0_0"), physicsOf("1ROAD_ground_0_0")]).toEqual(["Road surface", "Road"]);
  expect(kindOf("1GRASS_ground_0_0_1")).toBe("Soft ground");
  expect(kindOf("nocol_far_1")).toBe("Distant terrain");
  expect(physicsOf("1WALL_bldcol_0_0")).toBe("Wall");
});
