import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {CspControls, type CspInfo} from "./CspSettings";

const missing: CspInfo = {status: "missing", version: null, build: null, enabled: null, stage: "idle",
  done: 0, total: 0, error: null, busy: false, can_install: true, linux: false, website: "https://acstuff.club/patch/"};
const show = (info: CspInfo) => renderToStaticMarkup(<CspControls info={info} pending={false} error={null}
  onInstall={() => {}} onCheck={() => {}} />);

test("only a missing patch offers installation; a disabled existing version is preserved", () => {
  expect(show(missing)).toContain("Install CSP");
  const installed = show({...missing, status: "installed", version: "0.2.11", build: 3465, enabled: false, can_install: false});
  expect(installed).toContain("0.2.11");
  expect(installed).toContain("disabled");
  expect(installed).not.toContain("Install CSP");
});

test("download and installation show progress and failures remain actionable", () => {
  const working = show({...missing, busy: true, can_install: false, stage: "downloading", done: 12, total: 100});
  expect(working).toContain("Downloading");
  expect(working).toContain("progress");
  expect(working).not.toContain("Install CSP");
  const failed = show({...missing, stage: "error", error: "Not enough free disk space"});
  expect(failed).toContain("Not enough free disk space");
  expect(failed).toContain("Install CSP");
});

test("Linux explains loading through Proton and manual Steam starts", () => {
  const installed = show({...missing, status: "installed", version: "0.2.11", can_install: false, enabled: true, linux: true});
  expect(installed).toContain("Proton");
  expect(installed).toContain("dwrite=n,b");
});
