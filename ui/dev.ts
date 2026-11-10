// Working on the page: `bun run dev`, then http://localhost:3000. It changes in the browser as its files are saved (hot
// reloading); what it asks the server goes on to the running Map2Lap (src/server.py).
import page from "./index.html";

const SERVER = Bun.env.MAP2LAP_SERVER ?? "http://127.0.0.1:8800";

Bun.serve({
  hostname: "127.0.0.1",        // (this machine only, as server.py)
  port: 3000,
  development: {hmr: true, console: true},
  routes: {"/": page,
    "/src/editor/tools/scatter.worker.js": async () => {
      const result = await Bun.build({entrypoints: [import.meta.dir + "/src/editor/tools/scatter.worker.ts"], target: "browser"});
      return result.success ? new Response(result.outputs[0], {headers: {"Content-Type": "text/javascript"}}) : new Response("Worker build failed", {status: 500});
    }},
  async fetch(request) {
    const url = new URL(request.url);
    // (the body whole: a stream would come without the Content-Length server.py reads it by)
    const body = ["POST", "PUT"].includes(request.method) ? await request.arrayBuffer() : undefined;
    const headers = {"Content-Type": request.headers.get("Content-Type") ?? ""};
    return fetch(SERVER + url.pathname + url.search, {method: request.method, headers, body});
  },
});
console.log("Map2Lap's page: http://localhost:3000");
