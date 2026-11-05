import {useCallback, useEffect, useState} from "react";
import {get, post} from "../api";
import type {Settings} from "../types";

export interface AcMessage {
  text: string;
  ok: boolean;
}

/** What settings say about the AC folder. Pure. */
function acMessage(s: Settings): AcMessage {
  return s.ac_ok ? {text: "✓ Assetto Corsa found – tracks are installed here", ok: true}
                 : {text: "✗ No Assetto Corsa folder there", ok: false};
}

/** The settings in settings.json (server.py). revision: a new number at each answer, for fields to show it again. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [revision, setRevision] = useState(0);
  const [ac, setAc] = useState<AcMessage | null>(null);

  const show = useCallback((s: Settings) => {
    setSettings(s);
    setRevision(k => k + 1);
    setAc(acMessage(s));
  }, []);

  useEffect(() => {
    let alive = true;
    get<Settings>("/api/settings").then(s => { if (alive && s) show(s); });
    return () => { alive = false; };
  }, [show]);

  /** Save values: they show at once (a checkbox waiting for the server's answer looks dead). Refused: nothing is saved, the
      fields show what is still in use and the error says why. */
  const save = useCallback(async (values: Partial<Settings>) => {
    setSettings(s => (s ? {...s, ...values} : s));
    const r = await post<Settings>("/api/settings", values);
    if (!r.error) {
      show(r as Settings);
      return;
    }
    const s = await get<Settings>("/api/settings");
    if (s) show(s);
    setAc({text: `✗ ${r.error}${s?.ac_ok ? " – tracks still go to the folder above" : ""}`, ok: false});
  }, [show]);

  /** The system's folder picker (Linux without one: the path is typed in). */
  const browse = useCallback(async () => {
    const r = await post<{path: string | null}>("/api/browse");
    if (r.error) setAc({text: `✗ ${r.error}`, ok: false});
    else if (r.path) await save({ac_path: r.path});
  }, [save]);

  return {settings, revision, ac, save, browse};
}
