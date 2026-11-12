// Unit tests use the same Rust kernel and BVH code without spawning browser workers.
import {readFileSync} from "node:fs";
import {MeshBVH} from "three-mesh-bvh";
import {makeGeometry, validateMesh} from "./geometry";
import {regionGroups, type RegionKernel} from "./regionsKernel";
import type {MeshInfo} from "../types";
import type {PreparedMesh, RegionPiece} from "./meshPrepare";

export const testKernel = new WebAssembly.Instance(new WebAssembly.Module(readFileSync(new URL("../../../assets/editorgeometry.wasm", import.meta.url)))).exports as unknown as RegionKernel;

export const inlinePreparation = {
  dispose() {},
  async prepare(info: MeshInfo, buffer: ArrayBuffer, pieces: RegionPiece[] | null, ground: boolean, signal: AbortSignal): Promise<PreparedMesh> {
    signal.throwIfAborted();
    validateMesh(info, buffer);
    const result: PreparedMesh = {buffer};
    if (pieces !== null) result.regions = regionGroups(testKernel, buffer, info, pieces);
    if (ground) {
      const geometry = makeGeometry(info, buffer);
      result.bvh = MeshBVH.serialize(new MeshBVH(geometry, {indirect: true}), {cloneBuffers: false});
      geometry.dispose();
    }
    return result;
  },
};
