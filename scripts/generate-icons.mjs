#!/usr/bin/env node
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SVG_PATH = resolve(ROOT, "public/icons/icon.svg");
const OUT_DIR = resolve(ROOT, "public/icons");

const SIZES = [16, 48, 128];

const svg = await readFile(SVG_PATH);

for (const size of SIZES) {
  const out = resolve(OUT_DIR, `icon-${size}.png`);
  await sharp(svg, { density: Math.max(72, size * 8) })
    .resize(size, size, { fit: "contain" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`[gallery-mode] wrote ${out}`);
}
