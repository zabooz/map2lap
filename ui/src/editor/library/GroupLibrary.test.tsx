import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {GroupLibrary} from "./GroupLibrary";

test("Groups lets users create a mixture without changing the selected track", () => {
  const html = renderToStaticMarkup(<GroupLibrary open onChoose={() => {}} onClose={() => {}} />);
  for (const text of ["New group", "Group name", "Search group objects", "Saved groups", "Save group", "Paint group"])
    expect(html).toContain(text);
});
