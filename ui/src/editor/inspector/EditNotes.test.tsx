import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {EditNotes} from "./EditNotes";

function message(viewFailed: string) {
  return renderToStaticMarkup(<EditNotes {...({state: {heights: [], placed: [], removed: [], copies: [], models: [], paints: [], sorts: [], objectSorts: []},
    viewFailed, edits: {}, view: {}, note: null, saveFailed: null, markedName: null, picked: null, sort: null,
    reopen: () => {}, readAgain: () => {}} as unknown as Parameters<typeof EditNotes>[0])} />);
}

test("a refused Copy keeps its own failure message", () => {
  const text = message("Copy failed: Draft copy refused");
  expect(text).toContain("Copy failed: Draft copy refused");
  expect(text).not.toContain("The editor could not complete");
  expect(text).not.toContain("it is kept all the same");
});

test("a failed view refresh explains that the change is still kept", () => {
  expect(message("Mesh unavailable")).toContain("The view doesn&#x27;t show the last change, it is kept all the same: Mesh unavailable");
});
