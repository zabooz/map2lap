import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {AppearanceCard} from "./Inspector";

test("Appearance shows the applied texture and scale, with technical source names kept out", () => {
  const html = renderToStaticMarkup(<AppearanceCard info={{name: "Fine asphalt", preview: "/retained-photo.png",
    repeat: [2, 3], variation: true, original: false, mixed: false}} onEdit={() => {}} />);
  expect(html).toContain("Fine asphalt");
  expect(html).toContain("/retained-photo.png");
  expect(html).toContain("2 × 3 m");
  expect(html).not.toContain("Shader");
  expect(html).not.toContain("Change material");
});
