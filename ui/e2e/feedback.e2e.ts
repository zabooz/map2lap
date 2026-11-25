import {expect, test} from "./fixtures";

test("reports and replies accept images, and news stays unread per ticket", async ({page, backend}) => {
  await page.clock.install();
  await page.goto("/");
  const report = page.getByTestId("report-bug");
  await report.click();
  const form = page.getByTestId("new-report");
  const text = form.getByLabel("Description");
  await text.fill("A bridge joint is raised");
  await form.getByLabel("Track code").fill("broken");
  await form.getByTestId("send").click();
  await expect(form.getByLabel("Track code")).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel("Track code").fill("");
  const image = {name: "bridge.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXZkAAAAASUVORK5CYII=", "base64")};
  await form.getByTestId("image-files").setInputFiles(Array.from({length: 6}, () => image));
  await expect(form.getByRole("alert")).toHaveText("Choose up to 5 images.");
  await form.getByTestId("image-files").setInputFiles(image);
  await expect.poll(() => form.getByAltText("bridge.png").evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1);
  await form.getByRole("button", {name: "Remove bridge.png"}).click();
  await text.evaluate((el, bytes) => {
    const data = new DataTransfer();
    data.items.add(new File([Uint8Array.from(bytes)], "side.png", {type: "image/png"}));
    el.dispatchEvent(new DragEvent("drop", {bubbles: true, dataTransfer: data}));
    el.dispatchEvent(new ClipboardEvent("paste", {bubbles: true, clipboardData: data}));
  }, Array.from(image.buffer));
  await form.getByTestId("send").click();
  await expect(page.getByRole("dialog").getByTestId("toast-feedback-sent")).toContainText("Ticket #1 sent.");
  await expect(page.getByTestId("ticket-1")).toContainText("A bridge joint is raised");
  await form.getByLabel("Type").selectOption("idea");
  await text.fill("More kerb colours");
  await form.getByTestId("send").click();
  await expect(page.getByTestId("ticket-2")).toContainText("More kerb colours");
  await page.mouse.click(5, 5);
  await expect(form).toBeHidden();
  await backend.post("/__test/feedback-news", {id: 1, text: "Fixed in the next build"});
  await backend.post("/__test/feedback-news", {id: 2, status: "seen"});
  await page.clock.fastForward(15 * 60_000);
  await expect(report).toContainText("!");
  await report.click();
  await text.fill("Unfinished new report");
  await page.getByTestId("ticket-1").click();
  await expect(form).toBeHidden();
  await expect(page.getByTestId("ticket-1")).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("history")).toContainText("Fixed in the next build");
  await expect(page.getByTestId("history")).toContainText("2 images");
  const reply = page.getByTestId("reply");
  await reply.getByLabel("Reply").fill("Confirmed");
  await page.getByTestId("feedback-new").click();
  await expect(text).toHaveValue("Unfinished new report");
  await expect(reply).toBeHidden();
  await page.getByTestId("ticket-1").click();
  await expect(reply.getByLabel("Reply")).toHaveValue("Confirmed");
  await reply.getByTestId("image-files").setInputFiles(image);
  await reply.getByTestId("send").click();
  await expect(page.getByTestId("history")).toContainText("Confirmed");
  await page.reload();
  await expect(report).toContainText("!");
  await report.click();
  await page.getByTestId("ticket-2").click();
  await expect(page.getByTestId("history")).toContainText("Seen");
  await page.keyboard.press("Escape");
  await expect(report).not.toContainText("!");
  await page.reload();
  await expect(page.getByTestId("ticket-2")).toHaveCount(0);
  await report.click();
  await expect(page.getByTestId("ticket-2")).toBeVisible();
  await expect(report).not.toContainText("!");
});

test("the report button works in My tracks and when the Editor cannot start", async ({page, faultsAllowed}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
      apply: (original, canvas, args) => args[0] === "webgl2" ? null : Reflect.apply(original, canvas, args),
    });
  });
  await page.goto("/");
  await page.getByTestId("nav-my-tracks").click();
  await page.getByTestId("report-bug").click();
  await expect(page.getByTestId("new-report")).toBeVisible();
  await page.keyboard.press("Escape");
  faultsAllowed.on = true;
  await page.getByTestId("nav-editor").click();
  await expect(page.getByText(/The 3D view could not start/)).toBeVisible();
  await page.getByTestId("report-bug").click({timeout: 5000});
  await expect(page.getByTestId("new-report")).toBeVisible();
});
