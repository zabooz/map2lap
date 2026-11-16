import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {ToolOptions} from "./ToolOptions";

test("keyed tool controls keep their wheel shortcuts in the shown order", () => {
  const html = renderToStaticMarkup(<ToolOptions title="Racing kerb" options={{
    shift: <span>Width</span>, ctrl: <span>Height</span>, alt: <span>Profile</span>,
  }} />);
  expect(html).toMatch(/>Shift<\/kbd><span>Width<\/span>/);
  expect(html).toMatch(/>Ctrl<\/kbd><span>Height<\/span>/);
  expect(html).toMatch(/>Alt<\/kbd><span>Profile<\/span>/);
  expect(html).not.toContain(">Ctrl+Alt</kbd>");
});
