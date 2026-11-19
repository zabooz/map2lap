/** Fail before Playwright starts if this process cannot bind the local test server. */
import {createServer} from "node:net";

const server = createServer();
try {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => server.close(error => error ? reject(error) : resolve()));
  });
} catch (error) {
  console.error("Browser tests need permission to bind 127.0.0.1. Grant local socket access and rerun.");
  console.error(error);
  process.exitCode = 1;
}
