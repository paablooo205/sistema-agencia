// Build-time tooling script — NOT part of the shipped app. Generates a
// 360° turntable frame sequence for botella_fanta.glb by driving
// /render-sequence (a headless-only page, see its own comment) with
// Puppeteer and screenshotting the <canvas> at 60 fixed angles.
//
// Requires the dev/prod server already running (see BASE_URL below) —
// this script only drives a browser against it, it doesn't start one.
//
// Usage: node scripts/generate-frame-sequence.mjs
//   BASE_URL=http://localhost:3002 node scripts/generate-frame-sequence.mjs

import { mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const FRAME_COUNT = 120;
const DEGREES_PER_FRAME = 360 / FRAME_COUNT; // 6°
const CANVAS_SIZE = 800;
const OUTPUT_DIR = join(__dirname, "..", "public", "sequences", "botella-360");

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: CANVAS_SIZE, height: CANVAS_SIZE });

  console.log(`Generating ${FRAME_COUNT} frames from ${BASE_URL}/render-sequence ...`);

  for (let i = 0; i < FRAME_COUNT; i++) {
    const angle = i * DEGREES_PER_FRAME;
    const frameNumber = String(i + 1).padStart(3, "0");
    const url = `${BASE_URL}/render-sequence?angle=${angle}`;

    await page.goto(url, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => window.__renderReady === true, {
      timeout: 30000,
    });

    const canvas = await page.$("canvas");
    if (!canvas) {
      throw new Error(`No <canvas> found on ${url}`);
    }

    const outPath = join(OUTPUT_DIR, `frame-${frameNumber}.png`);
    await canvas.screenshot({ path: outPath });
    console.log(`  frame-${frameNumber}.png  (angle ${angle.toFixed(1)}°)`);
  }

  await browser.close();

  const files = (await readdir(OUTPUT_DIR)).filter((f) => f.endsWith(".png"));
  let totalBytes = 0;
  for (const f of files) {
    totalBytes += (await stat(join(OUTPUT_DIR, f))).size;
  }

  console.log(`\nDone: ${files.length} frames in ${OUTPUT_DIR}`);
  console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
