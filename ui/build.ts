// `bun run build`: the page into src/web, where the server (src/server.py) and the release take it from. Users need no Bun.
import {rmSync} from "node:fs";
import {join} from "node:path";

const OUT = join(import.meta.dir, "..", "src", "web");

rmSync(OUT, {recursive: true, force: true});
const built = await Bun.build({
  entrypoints: [join(import.meta.dir, "index.html")],
  outdir: OUT,
  minify: true,
  splitting: true,              // (the 3D view with three.js in a part of its own: loaded on the Editor tab's first visit)
  define: {"process.env.NODE_ENV": JSON.stringify("production")},
});
if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}
for (const file of built.outputs) console.log(file.path, `${(file.size / 1024).toFixed(0)} KB`);
