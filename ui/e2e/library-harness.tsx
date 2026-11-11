// The production library and importers, backed by server.py, without an Editor scene or track.
import {useState} from "react";
import {createRoot} from "react-dom/client";
import {AssetLibrary, type LibraryTab} from "../src/editor/library/AssetLibrary";
import {MaterialLibrary} from "../src/editor/library/MaterialLibrary";
import {ModelLibrary} from "../src/editor/library/ModelLibrary";
import {useTheme} from "../src/hooks/useTheme";
import "../src/styles.css";

function Harness() {
  useTheme();
  const [tab, setTab] = useState<LibraryTab | null>(null);
  const [lastTab, setLastTab] = useState<LibraryTab>("textures");
  const [busy, setBusy] = useState(false);
  const close = () => setTab(null);
  const chooseTab = (next: LibraryTab) => { setLastTab(next); setTab(next); };
  return <>
    <button onClick={() => setTab(lastTab)}>Library</button>
    <button onClick={() => chooseTab("objects")}>Insert</button>
    <AssetLibrary tab={tab} onTab={chooseTab} onClose={close} busy={busy}
      textures={<MaterialLibrary embedded open={tab === "textures"} target={null} reason="Choose ground in the Editor to paint"
        busy={false} error={null} onApply={async () => { throw new Error("Track painting needs the Editor fixture"); }} onClose={close} />}
      objects={<ModelLibrary embedded open={tab === "objects"} replace={0} onBusy={setBusy} onClose={close}
        onChoose={() => { throw new Error("Model placement needs the Editor fixture"); }} />} />
  </>;
}

createRoot(document.getElementById("root")!).render(<Harness />);
