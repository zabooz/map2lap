import {useCallback, useEffect, useState} from "react";
import {get, post} from "../api";
import type {Release} from "../types";

const pause = (ms: number) => new Promise(ok => setTimeout(ok, ms));
const RESTART_WAIT = 60;        // s after which Map2Lap should have come back from an update

export interface ReleaseNote {
  text: string;
  tone?: "ok" | "bad";
  link?: {url: string; text: string};
}

/** The note for an answer about the newest release. Pure. */
function noteOf(r: Release | null, canInstall: boolean): ReleaseNote {
  if (!r?.version) return {text: "✗ Couldn’t reach GitHub (offline?)", tone: "bad"};
  if (!r.newer) return {text: "✓ Up to date", tone: "ok"};
  return {text: `Map2Lap ${r.version} is out: `,
          link: {url: r.url ?? "", text: canInstall ? "what’s new" : "what’s new and download"}};
}

/** The newest release on GitHub: the server asks once per run, "Check for updates" again. A newer one shows in the head.
    A release folder installs it itself; only "what's new" leads to GitHub. version: this Map2Lap's. */
export function useRelease(version: string | undefined) {
  const [newer, setNewer] = useState<string | null>(null);
  const [installTo, setInstallTo] = useState<string | null>(null);
  const [note, setNote] = useState<ReleaseNote>({text: ""});
  const [working, setWorking] = useState(true);

  const show = useCallback((r: Release | null) => {
    const can = Boolean(r?.newer && r.can_install);
    setNewer(r?.newer ? r.version ?? null : null);
    setInstallTo(can ? r?.version ?? null : null);
    setNote(noteOf(r, can));
    setWorking(false);
  }, []);

  useEffect(() => {
    let alive = true;
    get<Release>("/api/update").then(r => { if (alive) show(r); });
    return () => { alive = false; };
  }, [show]);

  const check = async () => {
    setWorking(true);
    setNote({text: "checking …"});
    show(await get<Release>("/api/update?fresh=1"));
  };

  const fail = (message: string) => {
    setNote({text: `✗ ${message}`, tone: "bad"});
    setWorking(false);
  };

  /** Download and install: the server ends meanwhile, back with the new version the page loads again. */
  const install = async () => {
    if (!installTo || !confirm(`Install Map2Lap ${installTo}? Map2Lap restarts; your settings, tracks and map data stay.`)) return;
    setWorking(true);
    setNote({text: "Downloading …"});
    const r = await post("/api/update/install");
    if (r.error) return fail(r.error);
    for (;;) {
      await pause(500);
      const p = await get<{state: string; done?: number; total?: number; error?: string}>("/api/update/progress");
      if (p?.state === "error") return fail(p.error ?? "The update failed");
      if (!p || p.state === "restarting") break;
      if (p.total) setNote({text: `Downloading … ${Math.floor(100 * (p.done ?? 0) / p.total)} %`});
    }
    setNote({text: "Installing, Map2Lap restarts …"});
    for (let i = 1; ; i++) {
      await pause(1000);
      const s = await get<{version: string}>("/api/settings");
      if (s && s.version !== version) return location.reload();
      if (i === RESTART_WAIT) setNote({text: "Map2Lap didn’t come back: start it again (Start Map2Lap.bat)"});
    }
  };

  return {newer, installTo, note, working, check, install};
}
