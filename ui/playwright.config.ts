// The page's browser tests: `bun run e2e` (Chrome), `bun run e2e:all` (the other browsers too). e2e/server.py stands behind them.
import {existsSync} from "node:fs";
import {defineConfig} from "@playwright/test";

// (software graphics: the tests need the 3D view, not a graphics card)
const SOFTWARE_3D = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
                "/usr/bin/google-chrome", "/Applications/Google Chrome.app"];

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  outputDir: "../out/e2e",
  fullyParallel: true,
  workers: 4,       // (software 3D shares the CPU: 16 browser workers starve the pixel tests past their timeout)
  reporter: [["list"]],
  timeout: 60000,
  expect: {timeout: 15000},
  use: {viewport: {width: 1500, height: 900}, trace: "retain-on-failure", screenshot: "only-on-failure"},
  projects: [
    // (Chrome when installed, else Playwright's own Chromium: installing Chrome takes administrator rights)
    {name: "chrome", use: {browserName: "chromium", channel: CHROME.some(existsSync) ? "chrome" : "chromium", launchOptions: {args: SOFTWARE_3D}}},
    {name: "edge", use: {browserName: "chromium", channel: "msedge", launchOptions: {args: SOFTWARE_3D}}},
    {name: "firefox", use: {browserName: "firefox"}},
    {name: "webkit", use: {browserName: "webkit"}},
  ],
});
