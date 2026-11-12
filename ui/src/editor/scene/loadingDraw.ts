// Incoming geometry and textures need a preview, but redrawing the growing scene for every arrival slows the import.
// Ten previews per second keep progress visible; camera, selection and tool changes still request an immediate frame.
const PREVIEW_MS = 100;

export class LoadingDraw {
  private token: number | null = null;
  private pending = false;
  private lastDraw = -Infinity;

  begin(token: number) { this.token = token; this.pending = false; this.lastDraw = -Infinity; }
  changed() { this.pending = true; }

  /** End only this opening; an aborted earlier track cannot release a newer one's redraw limit. */
  end(token: number) {
    if (token !== this.token) return false;
    this.token = null;
    this.pending = true;
    return true;
  }

  /** Whether to draw at now (ms). Interactive changes bypass the loading interval. */
  due(now: number, interactive: boolean) {
    if (!interactive && (!this.pending || this.token !== null && now - this.lastDraw < PREVIEW_MS)) return false;
    this.pending = false;
    this.lastDraw = now;
    return true;
  }
}
