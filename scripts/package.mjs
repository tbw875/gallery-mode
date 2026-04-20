#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const OUT = resolve(ROOT, "web-ext-artifacts");

await mkdir(OUT, { recursive: true });

for (const target of ["chrome", "firefox"]) {
  const ext = target === "firefox" ? "xpi" : "zip";
  const outFile = resolve(OUT, `gallery-mode-${target}.${ext}`);
  await exec("zip", ["-r", "-FS", outFile, "."], {
    cwd: resolve(DIST, target),
  });
  console.log(`[gallery-mode] packaged → ${outFile}`);
}
