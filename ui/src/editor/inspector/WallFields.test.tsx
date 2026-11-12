import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {WallFields} from "./WallFields";

test("a wall has a cap-height field and whole-wall texture controls", () => {
  const html = renderToStaticMarkup(<WallFields rise={1.2} textured busy={false} error={null}
    onHeight={async () => true} onTexture={() => {}} onOriginal={async () => true} onReset={async () => true} />);
  expect(html).toContain("Top offset"); expect(html).toContain('value="120"'); expect(html).toContain('min="0"');
  expect(html).toContain("Change texture"); expect(html).toContain("Original texture");
  expect(html).toContain("feet stay fixed"); expect(html).not.toContain("Turn"); expect(html).not.toContain("Size");
});
