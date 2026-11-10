import {useState} from "react";
import type {useCspStatus} from "../hooks/useCspStatus";
import {post} from "../api";
import {fmtBytes} from "../format";
import styles from "./CspSettings.module.css";

export interface CspInfo {
  status: "invalid" | "missing" | "partial" | "installed";
  version: string | null;
  build: number | null;
  enabled: boolean | null;
  stage: "idle" | "checking" | "downloading" | "installing" | "done" | "error";
  done: number;
  total: number;
  busy: boolean;
  can_install: boolean;
  linux: boolean;
  website: string;
  message?: string;
  error: string | null;
}

function description(info: CspInfo | null, pending: boolean) {
  if (pending || info?.stage === "checking") return "Checking the official CSP release…";
  if (!info) return "Checking Custom Shaders Patch…";
  if (info.stage === "downloading") return `Downloading CSP… ${fmtBytes(info.done)}${info.total ? ` of ${fmtBytes(info.total)}` : ""}`;
  if (info.stage === "installing") return "Installing CSP…";
  if (info.busy) return "CSP is being installed in another Assetto Corsa folder.";
  if (info.status === "installed") return `CSP ${info.version} installed${info.enabled ? "" : " — disabled in its settings"}`;
  return info.message ?? "CSP is not installed.";
}

/** One local installation status. The install button itself requests the download; opening Settings never downloads CSP. */
export function CspControls({info, pending, error, onInstall, onCheck}: {
  info: CspInfo | null; pending: boolean; error: string | null; onInstall: () => void; onCheck: () => void;
}) {
  const busy = pending || !!info?.busy;
  return <div id="csp-settings" className={styles.box}>
    <div className={styles.row}><strong>Custom Shaders Patch</strong>
      {info?.can_install && !busy ? <button type="button" onClick={onInstall}>Install CSP</button>
        : <button type="button" onClick={onCheck} disabled={busy}>Check again</button>}
    </div>
    <p role="status" className={styles.note}>{description(info, pending)}</p>
    {busy && <progress className={styles.progress} aria-label="Installing Custom Shaders Patch"
      max={info?.total || 1} value={info?.total ? info.done : undefined} />}
    {(error || info?.error) && <p role="alert" className={styles.error}>{error || info?.error}</p>}
    {info?.can_install && <p className={styles.note}>Downloads and installs the recommended public release directly from acstuff.club into the AC folder above. Close AC first.</p>}
    {info?.linux && <p className={styles.note}>Play loads installed CSP through Proton, unless your DLL overrides explicitly choose otherwise.
      For starts from Steam, set its launch options to <code>WINEDLLOVERRIDES="dwrite=n,b" %command%</code>. Compatibility also depends on your Proton version.</p>}
    <a className={styles.link} href="https://acstuff.club/patch/" target="_blank" rel="noopener">Official CSP website</a>
  </div>;
}

/** Installation uses the same local status as the page's warning; changing the AC folder remounts these controls. */
export function CspSettings({path, patch}: {path: string; patch: ReturnType<typeof useCspStatus>}) {
  const {info, error, refresh, accept} = patch;
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const install = async () => {
    if (pending || !info?.can_install) return;
    setPending(true); setActionError(null);
    try {
      const result = await post<CspInfo>("/api/csp/install", {path});
      if (result.error) throw new Error(result.error);
      accept(result as CspInfo);
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not install CSP");
    } finally { setPending(false); }
  };

  return <CspControls info={info} pending={pending} error={actionError ?? error} onInstall={() => void install()}
    onCheck={() => { setActionError(null); refresh(); }} />;
}
