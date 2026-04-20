#!/usr/bin/env node
import * as esbuild from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");
const DIST = resolve(ROOT, "dist");

const TARGETS = ["chrome", "firefox"];

const ENTRY_POINTS = {
  "background/service-worker": resolve(SRC, "background/service-worker.ts"),
  "content/content-script": resolve(SRC, "content/content-script.ts"),
  "popup/popup": resolve(SRC, "popup/popup.ts"),
  "options/options": resolve(SRC, "options/options.ts"),
};

const args = process.argv.slice(2);
const watch = args.includes("--watch");
const explicit = args.find((a) => TARGETS.includes(a));
const targets = explicit ? [explicit] : TARGETS;

async function buildTarget(target) {
  const outDir = resolve(DIST, target);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const buildOptions = {
    entryPoints: Object.fromEntries(
      Object.entries(ENTRY_POINTS).map(([k, v]) => [k, v]),
    ),
    bundle: true,
    outdir: outDir,
    format: "esm",
    target: ["chrome120", "firefox128"],
    platform: "browser",
    sourcemap: watch ? "inline" : false,
    minify: !watch,
    logLevel: "info",
    define: { "process.env.NODE_ENV": watch ? '"development"' : '"production"' },
  };

  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log(`[gallery-mode] watching ${target}...`);
  } else {
    await esbuild.build(buildOptions);
  }

  await copyStatic(outDir);
  await writeManifest(target, outDir);
}

async function copyStatic(outDir) {
  await Promise.all([
    cp(resolve(SRC, "popup/popup.html"), resolve(outDir, "popup/popup.html")),
    cp(
      resolve(SRC, "options/options.html"),
      resolve(outDir, "options/options.html"),
    ),
    cp(
      resolve(SRC, "styles/replacement.css"),
      resolve(outDir, "styles/replacement.css"),
    ),
    cp(resolve(ROOT, "public/icons"), resolve(outDir, "icons"), {
      recursive: true,
    }).catch(() => {}),
  ]);
}

async function writeManifest(target, outDir) {
  const [base, overlay] = await Promise.all([
    readFile(resolve(SRC, "manifest.base.json"), "utf8"),
    readFile(resolve(SRC, `manifest.${target}.json`), "utf8"),
  ]);
  const merged = { ...JSON.parse(base), ...JSON.parse(overlay) };
  await writeFile(
    resolve(outDir, "manifest.json"),
    JSON.stringify(merged, null, 2),
  );
}

for (const t of targets) {
  await buildTarget(t);
}

if (!watch) {
  console.log(`[gallery-mode] built ${targets.join(", ")} → dist/`);
}
