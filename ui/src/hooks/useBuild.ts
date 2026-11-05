import {useEffect, useEffectEvent, useState} from "react";
import {get, post} from "../api";
import type {BuildStatus} from "../types";

const POLL_MS = 1000, RETRY_MS = 2000;

export const isBusy = (s: BuildStatus) => s.state === "running" || s.state === "stopping";

/** The build the server runs: its status and log, asked for each second while it runs (one at a time: server.py).
    onProgress: a build's progress or result came (it wins over the selection in the card). onFinished: a build ended. */
export function useBuild(onProgress: () => void, onFinished: () => void) {
  const [status, setStatus] = useState<BuildStatus>({state: "idle"});
  const [log, setLog] = useState("");
  const [ask, setAsk] = useState(0);        // (a new number: ask the server now)

  const received = useEffectEvent((s: BuildStatus) => {
    const was = isBusy(status);
    setStatus(s);
    setLog((s.log ?? []).join("\n"));
    if (isBusy(s) || was) onProgress();
    if (was && !isBusy(s)) onFinished();
    return isBusy(s);
  });

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const again = (ms: number) => { timer = setTimeout(() => setAsk(k => k + 1), ms); };
    get<BuildStatus>("/api/status").then(s => {
      if (!alive) return;
      if (!s) again(RETRY_MS);
      else if (received(s)) again(POLL_MS);
    });
    return () => { alive = false; clearTimeout(timer); };
  }, [ask]);

  /** Start a build; the server's refusal, or null. */
  const start = async (url: string, body: unknown) => {
    const r = await post(url, body);
    onProgress();
    if (r.error) {
      setStatus({state: "error", error: r.error});
      return r.error;
    }
    setStatus({state: "running", progress: null, elapsed: 0});
    setAsk(k => k + 1);
    return null;
  };

  const stop = async () => {
    setStatus(s => ({...s, state: "stopping"}));
    await post("/api/stop");
    setAsk(k => k + 1);
  };

  return {status, log, busy: isBusy(status), start, stop};
}
