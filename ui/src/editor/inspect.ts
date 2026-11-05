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
