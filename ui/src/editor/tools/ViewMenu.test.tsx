import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {ViewMenu} from "./ViewMenu";

test("Edit is first for ground, road and object menus", () => {
  const noop = () => {};
  for (const object of [false, true]) for (const onSmooth of [null, noop]) {
    const html = renderToStaticMarkup(<ViewMenu at={{x: 0, y: 0, width: 800, height: 600}} object={object}
      mark="Mark all trees" canDelete onEdit={noop} onReplace={noop} onMove={noop} onDuplicate={noop} onSmooth={onSmooth}
      onMark={noop} onDelete={noop} onDeleteSurface={noop} onClose={noop} />);
    const expected = ["Edit…", ...(object ? ["Replace…", "Transform", "Duplicate", "Mark all trees"] : []),
      ...(onSmooth ? ["Smooth road"] : []), "Delete"];
    expect([...html.matchAll(/role="menuitem"[^>]*>([^<]+)</g)].map(m => m[1])).toEqual(expected);
  }
});
