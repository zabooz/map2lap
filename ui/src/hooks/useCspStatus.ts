import {useCallback, useEffect, useState} from "react";
import type {CspInfo} from "../components/CspSettings";

/** Poll local patch files for the selected valid AC folder; never download or install anything. */
export function useCspStatus(path: string | null) {
  const [result, setResult] = useState<{path: string; info: CspInfo | null; error: string | null} | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(v => v + 1), []);
  const accept = useCallback((info: CspInfo) => {
    if (path !== null) setResult({path, info, error: null});
  }, [path]);

  useEffect(() => {
    if (path === null) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      let delay = 5000;
      try {
        const response = await fetch("/api/csp", {signal: controller.signal});
        if (!response.ok) throw new Error("Could not check CSP. Check the connection to Map2Lap and try again.");
        const info = await response.json() as CspInfo;
        if (controller.signal.aborted) return;
        setResult({path, info, error: null});
        if (info.busy) delay = 1000;
      } catch (e) {
        if (controller.signal.aborted) return;
        setResult({path, info: null, error: e instanceof Error ? e.message : "Could not check CSP"});
      }
      timer = setTimeout(() => void poll(), delay);
    };
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [path, revision]);

  const current = result?.path === path ? result : null;
  return {info: current?.info ?? null, error: current?.error ?? null, refresh, accept};
}
