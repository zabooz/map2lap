// What a point or a mesh of the 3D view is: the hover box's numbers. Pure, no three.js.

const TILE_M = 256;             // roads.TILE
const FACES_PER_BILLBOARD = 8;  // trees.billboards: two crossed quads, two triangles per quad's side
const WGS84_A = 6378137.0, WGS84_F = 1 / 298.257223563, WGS84_E2 = WGS84_F * (2 - WGS84_F);
const LATITUDE_ROUNDS = 5;      // (each round: a thousand times nearer; 5 is far below a millimetre)

export interface Atlas {
  sprites: string[];
  cols: number;
  rows: number;
}

/** Whether bytes more stay within a limit of gb. */
/** What meshes take up in x and z, each as far as its sphere reaches. None: anywhere. Pure. */
export function trackArea(meshes: {center: number[]; radius: number}[]) {
  const area = {minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity};
  for (const {center: [x, , z], radius} of meshes) {
    area.minX = Math.min(area.minX, x - radius);
    area.maxX = Math.max(area.maxX, x + radius);
    area.minZ = Math.min(area.minZ, z - radius);
    area.maxZ = Math.max(area.maxZ, z + radius);
  }
  return meshes.length ? area : {minX: -Infinity, maxX: Infinity, minZ: -Infinity, maxZ: Infinity};
}

/** The items sorted by how far from the point each begins, the nearest last: pop gives it without another look at the rest. Pure. */
export function nearestLast<T extends {center: number[]; radius: number}>(items: T[], at: number[]) {
  const begins = new Map(items.map(m => [m, Math.hypot(m.center[0] - at[0], m.center[1] - at[1], m.center[2] - at[2]) - m.radius]));
  return [...items].sort((a, b) => begins.get(b)! - begins.get(a)!);
}

export function fits(used: number, bytes: number, gb: number) {
  return used + bytes <= gb * 1024 ** 3;
}

/** What a decoded image takes: an RGBA bitmap in memory, plus the GPU copy with a third more for mipmaps. */
export function decodedBytes(width: number, height: number) {
  return Math.round(width * height * 4 * (1 + 4 / 3));
}

/** The tile (east, north) of an AC point: AC's z is minus north. */
export function tileOf(x: number, z: number): [number, number] {
  return [Math.floor(x / TILE_M), Math.floor(-z / TILE_M)];
}

/** The nearest place on the route [[x, z], ...] to (x, z): metres along it from its start and off it, or null. */
export function routeMetre(route: number[][], x: number, z: number) {
  if (route.length < 2) return null;
  let best = Infinity, metre = 0, along = 0;
  for (let k = 0; k + 1 < route.length; k++) {
    const [ax, az] = route[k], dx = route[k + 1][0] - ax, dz = route[k + 1][1] - az;
    const length2 = dx * dx + dz * dz, length = Math.sqrt(length2);
    const t = length2 ? Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / length2)) : 0;
    const off = Math.hypot(x - (ax + t * dx), z - (az + t * dz));
    if (off < best) {
      best = off;
      metre = along + t * length;
    }
    along += length;
  }
  return {metre, off: best};
}

/** Latitude and longitude (degrees) of an AC point in the frame around the anchor: as geodesy.EnuFrame, x east, z minus
    north, y up. Exact also far from the anchor, where a flat earth would be off by metres. */
export function latLonOf([lat0, lon0]: [number, number], x: number, y: number, z: number): [number, number] {
  const rad = Math.PI / 180, e = x, n = -z, u = y;
  const sla = Math.sin(lat0 * rad), cla = Math.cos(lat0 * rad), slo = Math.sin(lon0 * rad), clo = Math.cos(lon0 * rad);
  const r = WGS84_A / Math.sqrt(1 - WGS84_E2 * sla * sla);
  const ex = r * cla * clo - slo * e - sla * clo * n + cla * clo * u;
  const ey = r * cla * slo + clo * e - sla * slo * n + cla * slo * u;
  const ez = r * (1 - WGS84_E2) * sla + cla * n + sla * u;
  const p = Math.hypot(ex, ey);
  let lat = Math.atan2(ez, p * (1 - WGS84_E2));
  for (let k = 0; k < LATITUDE_ROUNDS; k++) {
    const s = Math.sin(lat);
    lat = Math.atan2(ez + WGS84_E2 * (WGS84_A / Math.sqrt(1 - WGS84_E2 * s * s)) * s, p);
  }
  return [lat / rad, Math.atan2(ey, ex) / rad];
}

/** The tree's or bush's number within its tile's billboards, for the triangle face of a mesh part whose earlier parts hold
    firstFace triangles. */
export function billboardOf(face: number, firstFace: number) {
  return Math.floor((firstFace + face) / FACES_PER_BILLBOARD);
}

/** The faces of billboard number k within a part: [first, end), clipped to the part's faces. */
export function billboardFaces(k: number, firstFace: number, faces: number): [number, number] {
  return [Math.max(0, k * FACES_PER_BILLBOARD - firstFace), Math.min(faces, (k + 1) * FACES_PER_BILLBOARD - firstFace)];
}

/** The build's list of a tile's single objects (src/track/objectlist.py). */
export interface ObjectList {
  kinds: string[];
  sorts?: string[];                         // each one's finest name (a bench, a stop sign); not in older builds' lists: its kind
  at: [number, number, number][];
  parents: number[];                        // the object each belongs to, deleted with it; -1: none
  with?: Record<string, string[]>;          // what else goes with an object, by its number: a pole's wires, in any tile
  faces: [number, number, number][][];      // per object: [mesh number, first triangle, triangles], ...
}

const KIND_NAMES: Record<string, string> = {car: "Parked car", house: "Building", "house sign": "Building sign", door: "Door",
                                            "road sign": "Road sign", "town sign": "Town sign", "street furniture": "Street furniture",
                                            "power line": "Power line", "power pole": "Power pole", fence: "Fence", rock: "Rock",
                                            "gas station": "Gas station", pool: "Pool", playground: "Playground equipment",
                                            "sports goal": "Sports goal", grave: "Grave", tower: "Tower", fountain: "Fountain"};

/** A kind of the list as the page says it. Pure. */
export const kindName = (kind: string) => KIND_NAMES[kind] ?? kind;

// (the groups of scenery/propsmesh.py, sort_of; the streams of make_obj.SIGN_KINDS)
const SORT_NAMES: Record<string, string> = {bench: "Bench", bin: "Bin", hydrant: "Hydrant", streetlight: "Street light",
                                            polelamp: "Lamp on a pole", signal: "Traffic light", "level crossing": "Level crossing",
                                            stop: "Stop sign", giveway: "Give way sign", speedk50: "Speed limit 50",
                                            speedk60: "Speed limit 60", speedk80: "Speed limit 80", speedk100: "Speed limit 100",
                                            pole: "Power pole", pylon: "Pylon", substation: "Substation part", exits: "Exit sign",
                                            mileposts: "Milepost", merges: "Merge sign", speeds: "Speed sign", towns: "Town sign"};

/** A sort of the list as the page says it: a kind's name where the sort is just its kind. Pure. */
export const sortName = (sort: string) => SORT_NAMES[sort] ?? kindName(sort);

/** Sorts never deleted all at once (objectlist.NOT_ALL): a click would take a whole street. */
export const NOT_ALL = new Set(["house"]);

/** The sort of object k of a tile's list. Pure. */
export const sortOf = (list: ObjectList, k: number) => list.sorts?.[k] ?? list.kinds[k];

/** The ids of all objects of the sorts. Pure. */
export function idsOfSorts(lists: Record<string, ObjectList>, sorts: Set<string>) {
  const out: string[] = [];
  if (!sorts.size) return out;
  for (const [tile, list] of Object.entries(lists)) {
    list.kinds.forEach((_, k) => { if (sorts.has(sortOf(list, k))) out.push(`${tile}#${k}`); });
  }
  return out;
}

/** The ids and all they take along, by childrenOf's belonging. Pure. */
export function takenAlong(ids: Iterable<string>, belonging: Map<string, string[]>) {
  const out = new Set<string>(), queue = [...ids];
  while (queue.length) {
    const id = queue.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    queue.push(...(belonging.get(id) ?? []));
  }
  return out;
}

/** How many objects of sort the whole track still shows: those with triangles (a saved track's own list keeps the numbers of what it left
    out, without any) that nothing in going takes. Pure. */
export function countOfSort(lists: Record<string, ObjectList>, sort: string, going: Set<string>) {
  let n = 0;
  for (const [tile, list] of Object.entries(lists)) {
    list.kinds.forEach((_, k) => { if (sortOf(list, k) === sort && list.faces[k].length && !going.has(`${tile}#${k}`)) n++; });
  }
  return n;
}

/** The objects that belong to others: their ids by the id of the one they belong to. Pure. */
export function childrenOf(lists: Record<string, ObjectList>) {
  const out = new Map<string, string[]>();
  for (const [tile, list] of Object.entries(lists)) {
    list.parents.forEach((parent, k) => {
      if (parent < 0) return;
      const id = `${tile}#${parent}`;
      if (!out.has(id)) out.set(id, []);
      out.get(id)!.push(`${tile}#${k}`);
    });
    for (const [number, ids] of Object.entries(list.with ?? {})) {
      const id = `${tile}#${number}`;
      out.set(id, [...(out.get(id) ?? []), ...ids]);
    }
  }
  return out;
}

/** Where each object lies, to look up by triangle: per mesh number its pieces sorted by first triangle. Pure. */
export function objectIndex(lists: Record<string, ObjectList>) {
  const index = new Map<number, {from: number; end: number; id: string}[]>();
  for (const [base, list] of Object.entries(lists)) {
    list.faces.forEach((pieces, k) => {
      for (const [mesh, from, count] of pieces) {
        if (!index.has(mesh)) index.set(mesh, []);
        index.get(mesh)!.push({from, end: from + count, id: `${base}#${k}`});
      }
    });
  }
  for (const pieces of index.values()) pieces.sort((a, b) => a.from - b.from);
  return index;
}

/** The id of the object that triangle face of a mesh belongs to, from its pieces sorted by first triangle, or null. Pure. */
export function objectAt(pieces: {from: number; end: number; id: string}[] | undefined, face: number) {
  let low = 0, high = (pieces?.length ?? 0) - 1;
  while (low <= high) {
    const middle = (low + high) >> 1, piece = pieces![middle];
    if (face < piece.from) high = middle - 1;
    else if (face >= piece.end) low = middle + 1;
    else return piece.id;
  }
  return null;
}

/** The image of the atlas under a uv as the kn5 stores it (v negated: make_obj, kn5), or null. */
export function spriteAt(atlas: Atlas, u: number, v: number) {
  const col = Math.floor((u - Math.floor(u)) * atlas.cols);
  const row = Math.floor((v - Math.floor(v)) * atlas.rows);
  return atlas.sprites[row * atlas.cols + col] ?? null;
}

const PHYSICS: [RegExp, string][] = [[/^1ROAD/, "Road"], [/^1GRAVEL/, "Gravel"], [/^1GRASS/, "Grass"], [/^1KERB/, "Kerb"],
                                     [/^1WALL/, "Wall"], [/^nocol_/, "None (drive through)"]];
const KINDS: [RegExp, string][] = [
  [/_trees_bush_|^nocol_bush_/, "Bush"], [/_trees_/, "Tree"], [/_ground_far|^nocol_far/, "Distant terrain"],
  // (the road is painted into the ground: ground.SURF_AC says what each cell's mesh holds)
  [/^1ROAD_ground/, "Road surface"], [/^1GRAVEL_ground/, "Gravel or rock"], [/^1GRASS_ground/, "Soft ground"], [/_ground_/, "Ground"],
  [/_bld/, "Building"], [/_deck/, "Bridge deck"], [/_road_paint/, "Road marking"], [/_road_edge/, "Road edge"], [/_road/, "Road"],
  [/_rocks/, "Rock"], [/_wire/, "Wire"], [/_water/, "Water"], [/_foam/, "Foam"], [/_guardrail/, "Guardrail"], [/_fence/, "Fence"],
  [/_props/, "Street furniture"], [/_cars/, "Parked car"], [/_gate/, "Start or finish gate"], [/_tunnel/, "Tunnel"], [/_rail/, "Rail"],
  [/_walk/, "Pavement"],
];

/** What a mesh's name says it does to the car: AC's prefixes (docs/ac-rules.md). */
export function physicsOf(name: string) {
  return PHYSICS.find(([re]) => re.test(name))?.[1] ?? "Unknown";
}

/** What a mesh's name says it is. */
export function kindOf(name: string) {
  return KINDS.find(([re]) => re.test(name))?.[1] ?? name;
}
