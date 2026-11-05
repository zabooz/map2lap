// Each component's style file against the component: a class named in one and missing in the other is a typo or left over.
import {expect, test} from "bun:test";
import {existsSync, readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

const SRC = import.meta.dir;

function sources(dir: string): string[] {
  return readdirSync(dir, {withFileTypes: true}).flatMap(e => {
    const path = join(dir, e.name);
    return e.isDirectory() ? sources(path) : /\.tsx$/.test(e.name) ? [path] : [];
  });
}

/** The classes a stylesheet's text defines. */
function classesOf(css: string) {
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{[^{}]*\}/g, "{}");
  return new Set([...plain.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(m => m[1]));
}

const withStyles = sources(SRC).filter(path => existsSync(path.replace(/\.tsx$/, ".module.css")));

test("every component with a style file imports it", () => {
  expect(withStyles.length).toBeGreaterThan(5);
  for (const path of withStyles) expect(readFileSync(path, "utf8")).toContain(".module.css\"");
});

for (const path of withStyles) {
  test(`${path.slice(SRC.length + 1)}: its classes and its style file agree`, () => {
    const code = readFileSync(path, "utf8");
    const defined = classesOf(readFileSync(path.replace(/\.tsx$/, ".module.css"), "utf8"));
    const used = new Set([...code.matchAll(/\bstyles\.([A-Za-z_]\w*)/g)].map(m => m[1]));
    expect([...used].filter(c => !defined.has(c))).toEqual([]);       // (a typo: no style at all, without any error)
    expect([...defined].filter(c => !used.has(c))).toEqual([]);       // (left over)
  });
}
