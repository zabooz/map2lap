import type {InstallationNotice} from "./installationNotice";

/** An acknowledged CSP version is advisory until the installed version changes. Pure. */
export function activeInstallation(installation: InstallationNotice | null, acknowledgedId: string): InstallationNotice | null {
  return installation?.id.startsWith("csp-version-") && installation.id === acknowledgedId ? null : installation;
}

/** Settings issues shown at the gear, including a newer Map2Lap release. Pure. */
export function settingsAttention(installation: InstallationNotice | null, newer: string | null): string | null {
  const reasons = [installation?.title, newer ? `Map2Lap ${newer} available` : null].filter(Boolean);
  return reasons.length ? `Settings: ${reasons.join("; ")}` : null;
}
