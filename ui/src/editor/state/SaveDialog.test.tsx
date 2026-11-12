import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {SaveDialog} from "./SaveDialog";

test("Save as new track is primary; Delete track is immediately before Cancel", () => {
  const html = renderToStaticMarkup(<SaveDialog title="Alpine" taken={[]} canOverwrite
    onOverwrite={() => {}} onSaveNew={() => {}} onCancel={() => {}} onDelete={() => {}} />);
  expect([...html.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map(m => m[1]))
    .toEqual(["Delete track", "Cancel", "Overwrite", "Save as new track"]);
  expect(html).toContain('type="submit">Save as new track');
  expect(html).toContain('type="button">Overwrite');
});
