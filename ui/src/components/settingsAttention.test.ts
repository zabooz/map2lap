import {expect, test} from "bun:test";
import {activeInstallation, settingsAttention} from "./settingsAttention";

test("the gear names the active installation and update notices", () => {
  const csp = {id: "csp-missing", title: "CSP is not installed", message: "", action: "Install CSP", target: "csp" as const};
  expect(settingsAttention(null, null)).toBeNull();
  expect(settingsAttention(csp, null)).toBe("Settings: CSP is not installed");
  expect(settingsAttention(null, "2.0.0")).toBe("Settings: Map2Lap 2.0.0 available");
  expect(settingsAttention(csp, "2.0.0")).toBe("Settings: CSP is not installed; Map2Lap 2.0.0 available");
});

test("acknowledging an untested CSP version hides only that version's advisory", () => {
  const version = {id: "csp-version-0.3.1", title: "Untested CSP version", message: "", action: "Check CSP", target: "csp" as const};
  const missing = {...version, id: "csp-missing", title: "CSP is not installed"};
  expect(activeInstallation(version, "")).toEqual(version);
  expect(activeInstallation(version, version.id)).toBeNull();
  expect(activeInstallation({...version, id: "csp-version-0.3.2"}, version.id)).not.toBeNull();
  expect(activeInstallation(missing, missing.id)).toEqual(missing);
});
