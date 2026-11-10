import type {CspInfo} from "./CspSettings";

export type InstallationTarget = "ac" | "csp";
export interface InstallationNotice {
  id: string;
  title: string;
  message: string;
  action: string;
  target: InstallationTarget;
}

/** The next useful installation warning, prioritizing the game folder over its patch. Pure. */
export function installationNotice(acOk: boolean | undefined, info: CspInfo | null, error: string | null): InstallationNotice | null {
  if (acOk === false || (acOk && !error && info?.status === "invalid")) return {id: "ac-missing", title: "Assetto Corsa folder not found",
    message: "Choose your Assetto Corsa folder so Map2Lap can install your tracks.", action: "Choose folder", target: "ac"};
  if (!acOk) return null;
  if (error) return {id: "csp-check", title: "Could not check CSP",
    message: "Open Settings to check Custom Shaders Patch again.", action: "Check CSP", target: "csp"};
  if (!info || info.busy) return null;
  if (info.status === "missing") return {id: "csp-missing", title: "CSP is not installed",
    message: "Custom Shaders Patch adds lighting and material effects to your tracks. You can still try Play without it.",
    action: "Install CSP", target: "csp"};
  if (info.status === "installed" && info.enabled === false) return {id: "csp-disabled", title: "CSP is disabled",
    message: "Enable Custom Shaders Patch in Content Manager to use your tracks' lighting and material effects.",
    action: "Check CSP", target: "csp"};
  if (info.status === "partial") return {id: "csp-partial", title: "CSP needs checking",
    message: info.message ?? "Existing patch files could not be verified. Use Content Manager to repair them.",
    action: "Check CSP", target: "csp"};
  return null;
}
