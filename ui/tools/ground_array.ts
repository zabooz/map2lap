/** Bun/Playwright launcher for tools/ground_regions.py --gpu. Serves only its explicit offline fixture files. */
import {chromium,firefox,webkit} from "@playwright/test";
import {readFile,writeFile} from "node:fs/promises";
import {existsSync} from "node:fs";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import type {GroundBrowserProbe} from "./ground_array_browser";

const args=Bun.argv.slice(2),folder=resolve(args[0]??"../out/analysis/ground-regions/webgl"),kind=args[1]??"chrome";
if (!["chrome","edge","firefox","webkit"].includes(kind)) throw new Error("Choose chrome, edge, firefox or webkit");
const hardware=args.includes("--hardware");
const built=await Bun.build({entrypoints:[fileURLToPath(new URL("./ground_array_browser.ts",import.meta.url))],target:"browser",format:"iife"});
if (!built.success) throw new AggregateError(built.logs,"Could not build ground material probe");
const script=await built.outputs[0].text();
const fixture=await readFile(join(folder,"fixture.json"),"utf8");
const server=Bun.serve({hostname:"127.0.0.1",port:0,fetch(request){
  switch (new URL(request.url).pathname) {
    case "/":return new Response('<!doctype html><html><body style="margin:0"><canvas id="ground"></canvas><script src="/probe.js"></script></body></html>',{headers:{"Content-Type":"text/html"}});
    case "/probe.js":return new Response(script,{headers:{"Content-Type":"application/javascript"}});
    case "/fixture.json":return new Response(fixture,{headers:{"Content-Type":"application/json"}});
    case "/weights.bin":return new Response(Bun.file(join(folder,"weights.bin")),{headers:{"Content-Type":"application/octet-stream"}});
    default:return new Response("No probe resource",{status:404});
  }
}});
let browser;
try {
  if (kind==="firefox" || kind==="webkit") browser=await (kind==="firefox"?firefox:webkit).launch();
  else {
    const chrome=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Google/Chrome/Application/chrome.exe","/usr/bin/google-chrome","/Applications/Google Chrome.app"];
    browser=await chromium.launch({channel:kind==="edge"?"msedge":chrome.some(existsSync)?"chrome":undefined,
      args:hardware?[]:["--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
  }
  const page=await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(`http://127.0.0.1:${server.port}/`);
  await page.waitForFunction(()=>!!(window as unknown as {groundArrayProbe:GroundBrowserProbe}).groundArrayProbe);
  const report=await page.evaluate(async()=>{
    const api=(window as unknown as {groundArrayProbe:GroundBrowserProbe}).groundArrayProbe;
    const checks={dense:api.denseCheck(),filtering:api.filterCheck(),properties:api.propertyCheck(),regional:api.regionalCheck()};
    const source=await (await fetch("/fixture.json")).json();
    source.weights=new Float32Array(await (await fetch("/weights.bin")).arrayBuffer());
    for (const layer of source.layers) for (const role of ["colour","normal","roughness"]) {
      if (layer[role]) layer[role].data=new Uint8Array(layer[role].data);
    }
    return {...api.benchmark(source,source.view_size,source.view_size,source.regions),checks};
  });
  for (const name of ["full","regions","lit"] as const) {
    await writeFile(join(folder,`${name}.png`),Buffer.from(report[name].png.split(",")[1],"base64"));
    delete (report[name] as Partial<typeof report[typeof name]>).png;
  }
  const {dense,filtering,properties,regional}=report.checks;
  const passed=report.error<=2 && report.regionDifference===0 && dense.error<=2 && dense.materials===12 && dense.minimumContribution>3
    && dense.reopenIdentical && filtering.nearError<=2 && filtering.farError<=2 && filtering.regionsError===0
    && properties.normalDifference>4 && properties.roughnessDifference>4 && properties.repeatError<=2
    && properties.variationDifference>4 && properties.variationRegionsError===0
    && regional.nearDifference===0 && regional.transitionDifference<=1 && regional.farDifference===0
    && regional.regionalApplied && regional.regionalBytes<regional.fullBytes;
  const saved={...report,passed,browser:kind,hardware_requested:hardware,ac_verified:false,
    timing:"CPU plus WebGL completion wall time, not GPU timer queries or a track FPS measurement"};
  await writeFile(join(folder,"report.json"),JSON.stringify(saved,null,2));
  if (!passed) throw new Error("Ground array rendering/reference checks failed; see report.json");
  process.stdout.write(`WebGL prototype passed on ${report.renderer}\n`);
} finally {
  await browser?.close(); server.stop(true);
}
