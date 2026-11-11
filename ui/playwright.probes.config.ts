// Standalone WebGL experiments stay runnable without joining the product's browser regression suite.
import {defineConfig} from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({...config, testDir: "probes", outputDir: "../out/e2e-probes"});
