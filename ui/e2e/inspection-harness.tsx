// Exercise inspector request lifetimes without waiting for a track or a WebGL renderer.
import {useState} from "react";
import {createRoot} from "react-dom/client";
import {Inspector} from "../src/editor/inspector/Inspector";
import type {EditState} from "../src/editor/state/edits";
import type {Picked} from "../src/editor/types";
import type {TrackView} from "../src/editor/scene/view";

const surfaces = [{mesh: 0, u: .25, v: -.5, revision: "source"}];
const picked = {kind: "Ground", all: [], surface: surfaces[0], inspection: {
  revision: "source", texture: 0, hovered: null,
}} as unknown as Picked;
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
