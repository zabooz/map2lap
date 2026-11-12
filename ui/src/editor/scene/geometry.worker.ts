import {MeshBVH} from "three-mesh-bvh";
import {makeGeometry, validateMesh} from "./geometry";
import {regionGroups, type RegionKernel} from "./regionsKernel";
import type {PrepareJob, PreparedMesh} from "./meshPrepare";

let kernel: Promise<RegionKernel> | undefined;
async function rust() {
  return kernel ??= (async () => {
    const response = await fetch("/editorgeometry.wasm");
    if (!response.ok) throw new Error("Could not load the geometry kernel");
    const {instance} = await WebAssembly.instantiate(await response.arrayBuffer());
    const wasm = instance.exports as unknown as RegionKernel;
    if (wasm.version() !== 1) throw new Error("The geometry kernel changed; reload the page");
    return wasm;
  })();
}

self.onmessage = async ({data}: MessageEvent<PrepareJob>) => {
  try {
    const {info, buffer, pieces, ground} = data;
    const wasm = await rust();
    validateMesh(info, buffer);
    const result: PreparedMesh = {buffer};
    if (pieces !== null) result.regions = regionGroups(wasm, buffer, info, pieces);
    if (ground) {
      const geometry = makeGeometry(info, buffer);
      try { result.bvh = MeshBVH.serialize(new MeshBVH(geometry, {indirect: true}), {cloneBuffers: false}); }
      finally { geometry.dispose(); }
    }
    const transfer = new Set<ArrayBuffer>([buffer]);
    if (result.regions) transfer.add(result.regions.buffer as ArrayBuffer);
    if (result.bvh) {
      result.bvh.roots.forEach(root => transfer.add(root));
      if (result.bvh.index) transfer.add(result.bvh.index.buffer as ArrayBuffer);
      if (result.bvh.indirectBuffer) transfer.add(result.bvh.indirectBuffer.buffer as ArrayBuffer);
    }
    self.postMessage({id: data.id, result}, [...transfer]);
  } catch (error) { self.postMessage({id: data.id, error: (error as Error).message}); }
};
