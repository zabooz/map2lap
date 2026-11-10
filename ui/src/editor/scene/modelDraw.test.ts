import {expect, test} from "bun:test";
import * as THREE from "three";
import {ModelDraw} from "./modelDraw";

test("many repeated model parts draw in spatial instance batches while logical roots remain editable", async () => {
  const source = new THREE.Group(); source.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshStandardMaterial()));
  const scene = new THREE.Scene(), draw = new ModelDraw(scene, async () => source);
  const bindings = Array.from({length: 200}, (_, n) => ({id: String(n), asset: "tree"}));
  const matrices = Object.fromEntries(bindings.map(({id}, n) => [id, new THREE.Matrix4().makeTranslation(n % 100, 0, 0).toArray()]));
  await draw.sync(bindings, {tree: {url: "tree"}}, matrices);
  draw.flush();
  expect(scene.children.filter(m => m instanceof THREE.InstancedMesh)).toHaveLength(1);
  const batch = scene.children.find(m => m instanceof THREE.InstancedMesh) as THREE.InstancedMesh;
  expect(batch.count).toBe(200); expect(draw.instance("0")).toBeDefined();
  const hidden = new THREE.Matrix4(); draw.visible("0", false); draw.flush(); batch.getMatrixAt(0, hidden);
  expect(new THREE.Vector3().setFromMatrixScale(hidden).length()).toBe(0); expect(batch.count).toBe(200);
  draw.transforms({"1": new THREE.Matrix4().makeTranslation(1000, 0, 0).toArray()}); draw.flush();
  expect(scene.children.filter(m => m instanceof THREE.InstancedMesh)).toHaveLength(2);
  draw.dispose(); expect(scene.children).toHaveLength(0);
});

test("a moved or hidden model rebuilds only the batches it leaves or joins", async () => {
  const source = new THREE.Group(); source.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  const scene = new THREE.Scene(), draw = new ModelDraw(scene, async () => source);
  const at = (x: number) => new THREE.Matrix4().makeTranslation(x, 0, 0).toArray();
  await draw.sync([{id: "a", asset: "tree"}, {id: "b", asset: "tree"}, {id: "c", asset: "tree"}], {tree: {url: "tree"}}, {a: at(0), b: at(1), c: at(600)});
  const batches = () => scene.children.filter(m => m instanceof THREE.InstancedMesh) as THREE.InstancedMesh[];
  const far = batches().find(b => b.count === 1)!, version = far.instanceMatrix.version;
  draw.nudge("a", [0, 0, 0], new THREE.Matrix4().makeTranslation(2, 0, 0)); draw.flush();
  draw.visible("b", false); draw.flush();
  expect(far.instanceMatrix.version).toBe(version); expect(batches().map(b => b.count).sort()).toEqual([1, 2]);
  draw.transforms({c: at(3)}); draw.flush();
  expect(batches().map(b => b.count)).toEqual([3]); expect(far.parent).toBeNull();
  draw.dispose();
});

test("hiding and showing instances reuses transform capacity even if no more memory can be reserved", async () => {
  const source = new THREE.Group(); source.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  const scene = new THREE.Scene(); let allowed = true;
  const draw = new ModelDraw(scene, async () => source, bytes => bytes <= 0 || allowed);
  await draw.sync([{id: "a", asset: "tree"}, {id: "b", asset: "tree"}], {tree: {url: "tree"}},
    {a: new THREE.Matrix4().toArray(), b: new THREE.Matrix4().toArray()});
  const batch = scene.children[0]; allowed = false;
  draw.visible("a", false); draw.flush(); expect(scene.children[0]).toBe(batch);
  draw.visible("a", true); expect(() => draw.flush()).not.toThrow(); expect(scene.children[0]).toBe(batch);
  draw.dispose();
});

test("a refused transform-buffer reservation preserves the previous roots, resource balance and visible batches", async () => {
  const source = new THREE.Group(); source.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  const scene = new THREE.Scene(); let balance = 0, allowed = true;
  const draw = new ModelDraw(scene, async () => source, bytes => { if (bytes > 0 && !allowed) return false; balance += bytes; return true; });
  const matrix = new THREE.Matrix4().toArray(); await draw.sync([{id: "a", asset: "tree"}], {tree: {url: "tree"}}, {a: matrix});
  const root = draw.instance("a")!, batch = scene.children[0], before = balance; allowed = false;
  await expect(draw.sync([{id: "a", asset: "tree"}, {id: "b", asset: "tree"}], {tree: {url: "tree"}}, {a: matrix, b: matrix})).rejects.toThrow("memory limit");
  expect(draw.instance("a")).toBe(root); expect(draw.instance("b")).toBeUndefined(); expect(scene.children[0]).toBe(batch); expect(balance).toBe(before);
  draw.dispose(); expect(balance).toBe(0);
});

test("a Copy ghost holds its source textures after Revert removes the model, until its last preview is released", async () => {
  const geometry = new THREE.PlaneGeometry(), source = new THREE.Group();
  source.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));
  let disposed = 0; geometry.addEventListener("dispose", () => disposed++);
  const draw = new ModelDraw(new THREE.Scene(), async () => source);
  await draw.sync([{id: "a", asset: "tree"}], {tree: {url: "tree"}}, {a: new THREE.Matrix4().toArray()});
  const release = draw.hold("a");
  await draw.sync([], {}, {});
  expect(disposed).toBe(0);
  release(); release();
  expect(disposed).toBe(1);
  expect(draw.stats().assets).toBe(0);
  draw.dispose();
});

test("retained colour-corrected Kenney models receive the matte profile without changing their binding or other models", async () => {
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const draw = new ModelDraw(new THREE.Scene(), async url => {
    const material = new THREE.MeshStandardMaterial({color: 0x2cd8b8}); materials.set(url, material);
    const root = new THREE.Group(); root.add(new THREE.Mesh(new THREE.PlaneGeometry(), material)); return root;
  });
  const environment = new THREE.Texture(); draw.setEnvironment(environment);
  const source = "https://kenney.nl/assets/nature-kit";
  const assets = {legacy: {url: "legacy", source_url: source, material_colours: "srgb"},
    other: {url: "other", source_url: "https://example.org/other", material_colours: "srgb"},
    explicit: {url: "explicit", source_url: source, material_colours: "srgb", material_lighting: "model"}};
  const saved = JSON.stringify(assets);
  const bindings = Object.keys(assets).map(id => ({id, asset: id}));
  const matrices = Object.fromEntries(bindings.map(({id}) => [id, new THREE.Matrix4().makeTranslation(5, 2, 3).toArray()]));
  await draw.sync(bindings, assets, matrices);
  expect(materials.get("legacy")!.envMap).toBeNull();
  expect(materials.get("legacy")!.toneMapped).toBe(false);
  for (const id of ["other", "explicit"]) {
    expect(materials.get(id)!.envMap).toBe(environment);
    expect(materials.get(id)!.toneMapped).toBe(true);
  }
  expect(JSON.stringify(assets)).toBe(saved);
  expect(draw.instance("legacy")!.matrix.toArray()).toEqual(matrices.legacy);
  draw.dispose();
});

test("a placed model lies in the shadow of a house and throws none itself", async () => {
  const source = new THREE.Group(); source.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshStandardMaterial()));
  const draw = new ModelDraw(new THREE.Scene(), async () => source);
  await draw.sync([{id: "a", asset: "tree"}], {tree: {url: "tree.glb"}}, {a: new THREE.Matrix4().toArray()});
  const mesh = draw.instance("a")!.children[0] as THREE.Mesh;
  expect(mesh.receiveShadow).toBe(true);
  expect(mesh.castShadow).toBe(false);
  draw.dispose();
});

test("model instances share real geometry, materials and textures; removing one keeps the other alive", async () => {
  const scene = new THREE.Scene(), geometry = new THREE.PlaneGeometry(), texture = new THREE.Texture();
  const material = new THREE.MeshStandardMaterial({map: texture, alphaTest: .5, roughness: .7});
  const source = new THREE.Group(); source.add(new THREE.Mesh(geometry, material));
  let loads = 0, disposedGeometry = 0, disposedMaterial = 0, disposedTexture = 0;
  geometry.addEventListener("dispose", () => disposedGeometry++);
  material.addEventListener("dispose", () => disposedMaterial++);
  texture.addEventListener("dispose", () => disposedTexture++);
  const draw = new ModelDraw(scene, async () => { loads++; return source; });
  const identity = new THREE.Matrix4().toArray();
  await draw.sync([{id: "a", asset: "tree"}, {id: "b", asset: "tree"}], {tree: {url: "tree.glb"}}, {a: identity, b: identity});
  const a = draw.instance("a")!.children[0] as THREE.Mesh, b = draw.instance("b")!.children[0] as THREE.Mesh;
  expect(loads).toBe(1); expect(a.geometry).toBe(b.geometry); expect(a.material).toBe(b.material);
  expect((a.material as THREE.MeshStandardMaterial).map).toBe(texture);
  await draw.sync([{id: "b", asset: "tree"}], {tree: {url: "tree.glb"}}, {b: identity});
  expect(draw.instance("b")!.children[0]).toBe(b);
  expect([disposedGeometry, disposedMaterial, disposedTexture]).toEqual([0, 0, 0]);
  draw.dispose();
  expect([disposedGeometry, disposedMaterial, disposedTexture]).toEqual([1, 1, 1]);
  expect(scene.children).toHaveLength(0);
});

test("Undo before an asset finishes releases the late geometry without reserving it", async () => {
  const scene = new THREE.Scene(), geometry = new THREE.PlaneGeometry(), root = new THREE.Group();
  root.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
  let finish!: (root: THREE.Group) => void, disposed = 0, reserved = 0;
  geometry.addEventListener("dispose", () => disposed++);
  const draw = new ModelDraw(scene, () => new Promise(resolve => { finish = resolve; }), bytes => { reserved += bytes; return true; });
  const first = draw.sync([{id: "a", asset: "a"}], {a: {url: "a"}}, {a: new THREE.Matrix4().toArray()});
  await draw.sync([], {}, {}); finish(root); await first;
  expect(disposed).toBe(1); expect(reserved).toBe(0); expect(scene.children).toHaveLength(0);
  draw.dispose(); expect(disposed).toBe(1);
});

test("a rejected load can be retried, and removal succeeds even after the memory limit is lowered", async () => {
  const scene = new THREE.Scene(), root = new THREE.Group(); root.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  let attempts = 0, allow = true, balance = 0;
  const draw = new ModelDraw(scene, async () => { if (++attempts === 1) throw new Error("network"); return root; }, bytes => {
    if (bytes >= 0 && !allow) return false;
    balance += bytes; return true;
  });
  const bindings = [{id: "a", asset: "a"}], assets = {a: {url: "a"}}, matrices = {a: new THREE.Matrix4().toArray()};
  await expect(draw.sync(bindings, assets, matrices)).rejects.toThrow("network");
  await draw.sync(bindings, assets, matrices); expect(attempts).toBe(2); expect(balance).toBeGreaterThan(0);
  allow = false; await draw.sync([], {}, {});
  expect(balance).toBe(0); expect(scene.children).toHaveLength(0);
});

test("a refused new asset leaves the old instance and its resource balance intact", async () => {
  let allowed = true, balance = 0;
  const roots = [new THREE.Group(), new THREE.Group()];
  for (const root of roots) root.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  const draw = new ModelDraw(new THREE.Scene(), async url => roots[Number(url)], bytes => {
    if (bytes > 0 && !allowed) return false;
    balance += bytes; return true;
  });
  const identity = new THREE.Matrix4().toArray();
  await draw.sync([{id: "a", asset: "a"}], {a: {url: "0"}}, {a: identity});
  const kept = draw.instance("a")!, before = balance; allowed = false;
  await expect(draw.sync([{id: "b", asset: "b"}], {b: {url: "1"}}, {b: identity})).rejects.toThrow("memory limit");
  expect(draw.instance("a")).toBe(kept); expect(draw.instance("b")).toBeUndefined(); expect(balance).toBe(before);
  await draw.sync([], {}, {}); expect(balance).toBe(0);
});

test("one failed asset releases another already decoded asset from the same rejected change", async () => {
  const root = new THREE.Group(), geometry = new THREE.PlaneGeometry(); root.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
  let finish!: (root: THREE.Group) => void, fail!: (error: Error) => void, disposed = 0;
  geometry.addEventListener("dispose", () => disposed++);
  const draw = new ModelDraw(new THREE.Scene(), url => url === "a" ? new Promise(resolve => { finish = resolve; }) : new Promise((_resolve, reject) => { fail = reject; }));
  const matrix = new THREE.Matrix4().toArray();
  const task = draw.sync([{id: "a", asset: "a"}, {id: "b", asset: "b"}], {a: {url: "a"}, b: {url: "b"}}, {a: matrix, b: matrix});
  finish(root); await Promise.resolve(); await Promise.resolve(); fail(new Error("network"));
  await expect(task).rejects.toThrow("network"); await Promise.resolve();
  expect(disposed).toBe(1); expect(draw.stats().reservedBytes).toBe(0);
});

test("an old rejected load cannot remove a newer pending request for the same asset after disposal", async () => {
  const requests: {resolve: (root: THREE.Group) => void; reject: (error: Error) => void}[] = [];
  const draw = new ModelDraw(new THREE.Scene(), () => new Promise((resolve, reject) => { requests.push({resolve, reject}); }));
  const matrix = {a: new THREE.Matrix4().toArray()}, bindings = [{id: "a", asset: "a"}], assets = {a: {url: "a"}};
  const old = draw.sync(bindings, assets, matrix).catch(error => error);
  draw.dispose(); const current = draw.sync(bindings, assets, matrix);
  requests[0].reject(new Error("old network failure")); await old;
  const retry = draw.sync(bindings, assets, matrix);
  expect(requests).toHaveLength(2);
  const root = new THREE.Group(); root.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial()));
  requests[1].resolve(root); await Promise.all([current, retry]);
  expect(draw.stats().assets).toBe(1); draw.dispose();
});

test("an unassociated GLTF default material stays opaque for picking instead of borrowing material zero's mask", async () => {
  const root = new THREE.Group(), texture = new THREE.Texture();
  const coloured = new THREE.MeshStandardMaterial({map: texture, alphaTest: .5}); coloured.userData.modelMaterial = 0;
  const fallback = new THREE.MeshStandardMaterial({color: 0xffffff});
  root.add(new THREE.Mesh(new THREE.PlaneGeometry(), coloured), new THREE.Mesh(new THREE.PlaneGeometry(), fallback));
  const draw = new ModelDraw(new THREE.Scene(), async () => root);
  await draw.sync([{id: "a", asset: "a"}], {a: {url: "a"}}, {a: new THREE.Matrix4().toArray()});
  const picking = (draw.instance("a")!.children[1] as THREE.Mesh).material as THREE.MeshStandardMaterial;
  expect(picking.map).toBeNull(); expect(picking.alphaTest).toBe(0); expect(picking.color.getHex()).toBe(0xffffff);
  draw.dispose();
});


test("picking uses shared asset triangles at each instance matrix, without generated meshes", async () => {
  const geometry = new THREE.PlaneGeometry(2, 2), material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, alphaTest: .5});
  const source = new THREE.Group(); source.add(new THREE.Mesh(geometry, material));
  const draw = new ModelDraw(new THREE.Scene(), async () => source);
  await draw.sync([{id: "a", asset: "tree"}, {id: "b", asset: "tree"}], {tree: {url: "tree"}},
    {a: new THREE.Matrix4().makeTranslation(3, 0, 0).toArray(), b: new THREE.Matrix4().makeTranslation(3, 0, -2).toArray()});
  const picker = new THREE.Raycaster(new THREE.Vector3(3, .3, 5), new THREE.Vector3(0, 0, -1));
  const hits = draw.intersections(picker);
  expect(hits.map(h => h.object.userData.modelInstance)).toEqual(["a", "b"]);
  expect((hits[0].object as THREE.Mesh).geometry).toBe(geometry);
  expect((hits[0].object as THREE.Mesh).material).toBe(material);
  draw.visible("a", false);
  expect(draw.intersections(picker).map(h => h.object.userData.modelInstance)).toEqual(["b"]);
  draw.nudge("b", [3, 0, -2], new THREE.Matrix4().makeTranslation(4, 0, 0));
  expect(draw.intersections(picker)).toEqual([]);
  draw.dispose();
});

test("distance and selection bounds follow asset bounds, pose and deletion without an instance mesh", async () => {
  const source = new THREE.Group(); const child = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 2), new THREE.MeshBasicMaterial());
  child.position.y = 2; source.add(child);
  const draw = new ModelDraw(new THREE.Scene(), async () => source);
  await draw.sync([{id: "a", asset: "tree"}], {tree: {url: "tree"}}, {a: new THREE.Matrix4().makeTranslation(10, 5, 0).toArray()});
  expect(draw.bounds("a")!.min.toArray()).toEqual([9, 5, -1]);
  expect(draw.bounds("a")!.max.toArray()).toEqual([11, 9, 1]);
  draw.cull(new THREE.Vector3(10, 7, 999), new Set(), 1000);
  expect(draw.instance("a")!.visible).toBe(true);
  draw.cull(new THREE.Vector3(10, 7, 1000), new Set(), 1000);
  expect(draw.instance("a")!.visible).toBe(false);
  draw.cull(new THREE.Vector3(10, 7, 0), new Set(["a#0"]), 1000);
  expect(draw.instance("a")!.visible).toBe(false);
  draw.transforms({a: new THREE.Matrix4().makeTranslation(20, 5, 0).toArray()});
  expect(draw.bounds("a")!.min.x).toBe(19);
  draw.dispose();
});


test("unused GLB accessor vertices never enlarge an instance's selection or distance center", async () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 2, 0, 0, 0, 2, 0, 9000, 9000, 0], 3));
  geometry.setIndex([0, 1, 2]);
  const source = new THREE.Group(); source.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
  const draw = new ModelDraw(new THREE.Scene(), async () => source);
  await draw.sync([{id: "a", asset: "tree"}], {tree: {url: "tree"}}, {a: new THREE.Matrix4().toArray()});
  expect(draw.bounds("a")!.max.toArray()).toEqual([2, 2, 0]);
  draw.cull(new THREE.Vector3(1, 1, 0), new Set(), 10);
  expect(draw.instance("a")!.visible).toBe(true);
  draw.dispose();
});
