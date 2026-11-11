import type {Page} from "@playwright/test";
import {build} from "bun";
import {join} from "node:path";
import {expect, test as base} from "./fixtures";

let bundle: Promise<{script: string; styles: string}> | undefined;

/** Compile the real library components in memory once per worker, keeping their CSS modules. */
function libraryBundle() {
  return bundle ??= build({entrypoints: [join(import.meta.dirname, "library-harness.tsx")], target: "browser", format: "iife", minify: true,
    define: {"process.env.NODE_ENV": JSON.stringify("production")}}).then(async result => {
      if (!result.success) throw new Error(result.logs.join("\n"));
      // No shared output directory: concurrent workers must not truncate one another's script while it is read.
      const script = await result.outputs.find(file => file.kind === "entry-point" && file.path.endsWith(".js"))!.text();
      const styles = await Promise.all(result.outputs.filter(file => file.path.endsWith(".css")).map(file => file.text()));
      if (!script.trim()) throw new Error("The library harness compiled to an empty script");
      return {script, styles: styles.join("\n")};
    });
}

// Library-only cases must never load a track. Editor shortcut and placement cases use fixtures.ts instead.
export const test = base.extend({
  page: async ({page}, use) => {
    const {script, styles} = await libraryBundle();
    // Init scripts survive reloads; only the small document goes through HTTP route fulfillment.
    await page.addInitScript({content: `document.addEventListener("DOMContentLoaded", () => {
      if (location.pathname === "/__library/index.html") { ${script}\n }
    }, {once: true});`});
    await page.route("**/__library/index.html", route => route.fulfill({contentType: "text/html", body:
      `<!doctype html><html><head><style>${styles}</style></head><body><div id="root"></div></body></html>`}));
    const trackRequests: string[] = [];
    page.on("request", request => {
      if (new URL(request.url()).pathname.startsWith("/api/editor/")) trackRequests.push(request.url());
    });
    await use(page);
    expect(trackRequests, "Library-only tests must not load an Editor track").toEqual([]);
  },
});

export {expect};

/** Open a library tab without loading an Editor track. */
export async function openLibrary(page: Page, tab: "textures" | "objects" = "textures") {
  await page.goto("/__library/index.html");
  await page.getByRole("button", {name: tab === "objects" ? "Insert" : "Library", exact: true}).click();
  await expect(page.getByRole("dialog", {name: "Asset library"})).toBeVisible();
}
