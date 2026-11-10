import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {GroupLibrary, GroupPicker} from "./GroupLibrary";

test("Groups lets users create a mixture without changing the selected track", () => {
  const html = renderToStaticMarkup(<GroupLibrary open onChoose={() => {}} onClose={() => {}} />);
  for (const text of ["New group", "Group name", "Search group objects", "Save group", "Settings", "Paint group"])
    expect(html).toContain(text);
});

test("the saved groups' list offers only saved groups: none, no list; a group not saved yet is no choice in it", () => {
  const groups = [{id: "a", name: "Waldrand", entries: []}, {id: "b", name: "Wiese", entries: []}];
  expect(renderToStaticMarkup(<GroupPicker groups={[]} id="" disabled={false} onChoose={() => {}} />)).toBe("");
  const unsaved = renderToStaticMarkup(<GroupPicker groups={groups} id="" disabled={false} onChoose={() => {}} />);
  expect(unsaved).not.toContain("New group");
  expect(unsaved).toContain('<option value="" disabled="" hidden="" selected="">Choose a saved group</option>');
  expect(unsaved.match(/<option value="[ab]"/g)).toHaveLength(2);
  expect(renderToStaticMarkup(<GroupPicker groups={groups} id="b" disabled={false} onChoose={() => {}} />)).not.toContain('hidden=""');
});
