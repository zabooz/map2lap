import {expect, test} from "bun:test";
import {editorToasts, loadingToast, type EditorProblems} from "./editorToasts";

const none: EditorProblems = {viewFailed: null, copyFailed: null, saveFailed: null, save: "saved", error: null, outdated: 0};
const actions = {reopen: () => {}, readAgain: () => {}, giveUp: () => {}};

test("a working Editor shows no toast", () => {
  expect(editorToasts(none, new Set(), actions)).toEqual([]);
});

test("a rejected group remains visible as a placement error after its brush closes", () => {
  const result = editorToasts({...none, groupFailed: "Group draft rejected"}, new Set(), actions);
  expect(result).toMatchObject([{id: "edit-group-failed", tone: "error", title: "Group placement failed", message: "Group draft rejected"}]);
});

test("each problem without a window of its own is a toast with its way out", () => {
  const all = editorToasts({viewFailed: "The models exceed the Editor memory limit", copyFailed: "Copy was refused",
    saveFailed: "The track could not be kept", save: "stuck", error: "This track was changed elsewhere", outdated: 2}, new Set(), actions);
  expect(all.map(t => [t.id, t.tone, t.action?.label])).toEqual([
    ["edit-view-failed", "warning", "Load again"],
    ["edit-copy-failed", "error", undefined],
    ["edit-made", "error", undefined],
    ["edit-stuck", "error", "Read again"],
    ["edit-outdated", "warning", "Give up"],
  ]);
  expect(all[0].title).toBe("The view doesn't show the last change");
  expect(all[0].message).toContain("The models exceed the Editor memory limit");
  expect(all[1].message).toBe("Copy was refused");
  expect(all[4].title).toBe("2 older changes not applied");
});

test("saving again after a failed write is a warning; a dismissed toast stays away until its message changes", () => {
  const retrying = editorToasts({...none, save: "failed"}, new Set(), actions);
  expect(retrying).toMatchObject([{id: "edit-kept", tone: "warning", title: "Changes not kept: trying again"}]);
  const failed = {...none, viewFailed: "A"};
  const [shown] = editorToasts(failed, new Set(), actions);
  expect(editorToasts(failed, new Set([shown.key]), actions)).toEqual([]);
  expect(editorToasts({...none, viewFailed: "B"}, new Set([shown.key]), actions)).toHaveLength(1);
});

test("Saving is a toast with a running bar and no ×", () => {
  expect(editorToasts({...none, saving: true}, new Set(), actions)).toMatchObject([
    {id: "edit-saving", tone: "info", title: "Saving track", progress: {value: null, label: "Saving track"}, dismissible: false}]);
});

test("loading is a toast with its bar; a first opening says why it takes longer; a failure or the memory limit stays to be read", () => {
  expect(loadingToast({text: ""})).toBeNull();
  expect(loadingToast({text: "12 parts loaded"})).toBeNull();
  expect(loadingToast({text: "Reading the track …", progress: null})).toMatchObject(
    {id: "edit-loading", tone: "info", title: "Loading track", message: "Reading the track …", progress: {value: null, label: "Loading track"}, dismissible: false});
  expect(loadingToast({text: "Loading: 3 of 9 parts", progress: 0.3})?.detail).toBeUndefined();
  expect(loadingToast({text: "Preparing selection: 1 of 4", progress: 0.8, first: true})?.detail).toContain("sections");
  expect(loadingToast({text: "Could not load this track: The track changed", failed: "The track changed"})).toMatchObject(
    {id: "edit-load-failed", tone: "error", title: "Could not load this track", message: "The track changed"});
  expect(loadingToast({text: "Memory limit reached (Settings): 3 of 9 parts, the nearest ones", limited: true})).toMatchObject(
    {id: "edit-limited", tone: "warning", title: "Memory limit reached"});
});
