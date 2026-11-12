import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {TextureSettings} from "./TextureSettings";
import {LOOK} from "./textureLook";

const props = {name: "Meadow", preview: "/meadow.png", look: LOOK, variation: false, scope: "The next Apply uses these settings.",
  confirm: "OK", onSave: () => {}, onClose: () => {}};

test("a texture with both maps offers their switches, the normal strength and the gloss, capped by the ground's", () => {
  const html = renderToStaticMarkup(<TextureSettings {...props} maps={{normal: true, roughness: true}} />);
  expect(html).toContain("Use normal map");
  expect(html).toContain("Normal strength");
  expect(html).toContain("Use roughness map");
  expect(html).toContain("Shinier");
  expect(html).toContain("Matter");
  expect(html).toContain("As imported");
  expect(html).toContain("at most as much as the");
  expect(html).toContain("The next Apply uses these settings.");
});

test("missing maps are named, without switches that would do nothing", () => {
  const html = renderToStaticMarkup(<TextureSettings {...props} maps={{normal: false, roughness: false}} />);
  expect(html).not.toContain("Use normal map");
  expect(html).not.toContain("Normal strength");
  expect(html).not.toContain("Use roughness map");
  expect(html).toContain("No normal map");
  expect(html).toContain("No roughness map");
  expect(html).toContain("Shinier");          // (shinier still changes a texture without a roughness map)
});

test("repetition variation is offered for every repeat: the classic shader holds the road image fixed", () => {
  const html = renderToStaticMarkup(<TextureSettings {...props} maps={{normal: false, roughness: false}} />);
  expect(html).toContain('type="checkbox" aria-label="Break up texture repetition"');
  expect(html).not.toContain("not available for square");
});
