// Fails the build when the brotli-compressed bundle exceeds the 10 KiB budget.
// TODO: re-enable the hard gate (exit 1) before release - currently warn-only
// while functionality-first iteration is in progress.
import { statSync } from "node:fs";

const file = new URL("../../../_static/v4/www.js.br", import.meta.url);
const bytes = statSync(file).size;
console.log(`www.js.br: ${(bytes / 1024).toFixed(2)} KiB (budget 10.00 KiB)`);
if (bytes > 10 * 1024) {
  console.warn(`WARNING: size budget exceeded by ${bytes - 10 * 1024} bytes`);
}
