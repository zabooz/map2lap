import type {MeshInfo} from "../types";
import type {RegionPiece} from "./meshPrepare";

export interface RegionKernel {
  memory: WebAssembly.Memory;
  version(): number;
  allocate(words: number): number;
  release(pointer: number, words: number): void;
  components(input: number, vertices: number, indices: number, output: number): void;
}

/** Prepare connected face roots in Rust; original vertices and triangle numbers stay unchanged. */
export function regionGroups(wasm: RegionKernel, buffer: ArrayBuffer, info: MeshInfo, pieces: RegionPiece[]) {
  const offset = Math.ceil(buffer.byteLength / 4) * 4, faces = info.indices / 3;
  const words = offset / 4 + faces, pointer = wasm.allocate(words), output = wasm.allocate(faces);
  try {
    new Uint8Array(wasm.memory.buffer, pointer, buffer.byteLength).set(new Uint8Array(buffer));
    const owners = new Uint32Array(wasm.memory.buffer, pointer + offset, faces), ids = new Map<string, number>();
    owners.fill(0);
    for (const piece of pieces) {
      if (!ids.has(piece.id)) ids.set(piece.id, ids.size + 1);
      owners.fill(ids.get(piece.id)!, piece.from, Math.min(faces, piece.end));
    }
    wasm.components(pointer, info.vertices, info.indices, output);
    return new Uint32Array(wasm.memory.buffer, output, faces).slice();
  } finally { wasm.release(pointer, words); wasm.release(output, faces); }
}
