// Exercise inspector request lifetimes without waiting for a track or a WebGL renderer.
import {useState} from "react";
import {createRoot} from "react-dom/client";
import {Inspector} from "../src/editor/inspector/Inspector";
import type {EditState} from "../src/editor/state/edits";
import type {Hovered, Picked} from "../src/editor/types";
import type {TrackView} from "../src/editor/scene/view";

const surfaces = [{mesh: 0, u: .25, v: -.5, revision: "source"}];
const hovered: Hovered = {id: null, kind: "Ground", sprite: null, sort: null, object: "1GRASS_ground_0_0", physics: "Grass",
  material: "gc_meadow", shader: "ksPerPixel", texture: "meadow.dds", textureBytes: 4096, vertices: 4, triangles: 2,
  triangle: 0, uv: [.25, -.5], shownTo: 1000, billboard: null, at: [64, 0, -128], tile: [0, 0], route: null,
  latLon: null, distance: 100};
const picked: Picked = {id: null, kind: "Ground", sprite: null, sort: null, position: hovered.at, left: true,
  road: null, afterBuild: false, all: [], surface: surfaces[0], inspection: {
    revision: "source", texture: 0, hovered, listed: false,
  }};
const state = {placed: [], keptRevision: "source", save: "saved"} as unknown as EditState;
const ignore = () => {};
const view = {textureVersion: () => "displayed", setClock: ignore, setSurface: async (selection: unknown) => {
  if (selection) await new Promise<void>(() => {}); // The overlay is deliberately slower than selection metadata.
}} as unknown as TrackView;

function Harness() {
  const [revision, update] = useState(0);
  return <><button id="progress" onClick={() => update(v => v + 1)}>Progress {revision}</button>
    <Inspector name="alpha" picked={picked} hovered={null} surfaces={surfaces} marked={[]} view={view} state={state}
      collapsed={false} onCollapsed={ignore} width={320} onWidth={ignore} onSurface={ignore}
      onMaterialOpen={ignore} textureRevision={revision} /></>;
}

createRoot(document.getElementById("root")!).render(<Harness />);
