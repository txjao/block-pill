import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const outputDirectory = resolve("dist");
const manifestPath = resolve(outputDirectory, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const referencedFiles = new Set([
  manifest.background?.service_worker,
  manifest.action?.default_popup,
  manifest.options_page,
  ...Object.values(manifest.action?.default_icon ?? {}),
  ...Object.values(manifest.icons ?? {}),
  "src/entrypoints/blocked/index.html"
].filter(Boolean));

const missingFiles = [];

for (const relativePath of referencedFiles) {
  try {
    await access(resolve(outputDirectory, relativePath), constants.R_OK);
  } catch {
    missingFiles.push(relativePath);
  }
}

if (missingFiles.length > 0) {
  throw new Error(`Arquivos ausentes no build: ${missingFiles.join(", ")}`);
}

if (manifest.background?.service_worker?.endsWith(".ts")) {
  throw new Error("O service worker do build não pode apontar para TypeScript.");
}

console.log(`Build validado: ${referencedFiles.size} recursos encontrados.`);
