import {expect, test} from "bun:test";
import * as THREE from "three";
import {ModelDraw} from "./modelDraw";

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
  const picking = draw.picking("a", -1) as THREE.MeshStandardMaterial;
  expect(picking.map).toBeNull(); expect(picking.alphaTest).toBe(0); expect(picking.color.getHex()).toBe(0xffffff);
  draw.dispose();
});
