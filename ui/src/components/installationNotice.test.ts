import {expect, test} from "bun:test";
import {installationNotice} from "./installationNotice";
import type {CspInfo} from "./CspSettings";

const missing: CspInfo = {status: "missing", version: null, build: null, enabled: null, stage: "idle",
  done: 0, total: 0, busy: false, can_install: true, linux: false, website: "", error: null};

test("a missing AC folder takes priority; loading never claims CSP is missing", () => {
  expect(installationNotice(undefined, null, null)).toBeNull();
  expect(installationNotice(true, null, null)).toBeNull();
  expect(installationNotice(false, missing, null)).toMatchObject({id: "ac-missing", target: "ac"});
  expect(installationNotice(true, {...missing, status: "invalid"}, null)).toMatchObject({id: "ac-missing", target: "ac"});
});

test("missing, disabled and unreadable CSP have different actions; installed versions are preserved", () => {
  expect(installationNotice(true, missing, null)).toMatchObject({id: "csp-missing", action: "Install CSP", target: "csp"});
  expect(installationNotice(true, {...missing, status: "installed", enabled: false}, null)?.title).toContain("disabled");
  expect(installationNotice(true, {...missing, status: "partial"}, null)?.action).toBe("Check CSP");
  expect(installationNotice(true, {...missing, status: "installed", enabled: true, version: "0.2.11"}, null)).toBeNull();
});

test("other CSP versions warn about unverified effects without offering replacement", () => {
  for (const version of ["0.1.79", "0.3.1", "0.2.11-preview1"]) {
    const notice = installationNotice(true, {...missing, status: "installed", enabled: true, version}, null);
    expect(notice?.title).toBe("Untested CSP version");
    expect(notice?.message).toContain(version);
    expect(notice?.message).toContain("0.2.11");
    expect(notice?.message).toContain("You can still play");
    expect(notice?.action).toBe("Check CSP");
    expect(notice?.id).toContain(version);
  }
});

test("an active installation is not reported as missing; a failed check is not an absent patch", () => {
  expect(installationNotice(true, {...missing, busy: true}, null)).toBeNull();
  expect(installationNotice(true, missing, "Connection failed")).toMatchObject({id: "csp-check", action: "Check CSP"});
});
