import {fetchBytes} from "./requests";

export interface WeightBundleRef {url: string; offset: number; size: number}
interface Transfer {controller: AbortController; users: number; done?: Promise<ArrayBuffer>; size: number}

/** Shared tile transfers only; each texture owns a copy so it cannot retain the full bundle. */
export class WeightBundles {
  private transfers = new Map<string, Transfer>();
  constructor(private reserve: (bytes: number) => boolean, private free: (bytes: number) => void) {}

  acquire(ref: WeightBundleRef, length: number, signal: AbortSignal) {
    signal.throwIfAborted();
    if (!Number.isSafeInteger(ref.offset) || ref.offset < 0 || !Number.isSafeInteger(length) || length < 1 ||
        !Number.isSafeInteger(ref.size) || ref.offset + length > ref.size) throw new Error("Invalid ground weight bundle bounds");
    let transfer = this.transfers.get(ref.url);
    if (!transfer) {
      if (!this.reserve(ref.size)) return null;
      transfer = {controller: new AbortController(), users: 0, size: ref.size};
      this.transfers.set(ref.url, transfer);
    }
    if (transfer.size !== ref.size) throw new Error("Ground weight bundle size changed");
    transfer.users++;
    const shared = transfer;
    let released = false;
    const release = () => {
      if (released) return;
      released = true; signal.removeEventListener("abort", release);
      if (--shared.users === 0) {
        shared.controller.abort(); shared.done = undefined;
        this.transfers.delete(ref.url); this.free(shared.size);
      }
    };
    signal.addEventListener("abort", release, {once: true});
    return {release, read: async () => {
      signal.throwIfAborted();
      shared.done ??= fetchBytes(ref.url, shared.controller.signal).then(raw => {
        if (raw.byteLength !== ref.size) throw new Error("Invalid ground weight bundle length");
        return raw;
      });
      const raw = await shared.done;
      signal.throwIfAborted();
      // ArrayBuffer.slice copies: a retained small atlas must not pin the tile's complete transfer buffer.
      return raw.slice(ref.offset, ref.offset + length);
    }};
  }
}
