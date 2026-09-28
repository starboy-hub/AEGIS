#!/usr/bin/env node
/**
 * Package dist/ into releases/aegis-v<version>.zip for store upload.
 * Requires the `zip` CLI (preinstalled on macOS and GitHub runners).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;
const outDir = path.join('releases');
const name = `aegis-v${version}.zip`;

if (!fs.existsSync('dist/manifest.json')) {
  console.error('dist/ is missing — run `npm run build` first.');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(path.join(outDir, name))) fs.rmSync(path.join(outDir, name));

const stage = path.join(outDir, `aegis-v${version}`);
if (fs.existsSync(stage)) fs.rmSync(stage, { recursive: true });
fs.cpSync('dist', stage, { recursive: true });

execSync(`cd "${outDir}" && zip -rq "${name}" "aegis-v${version}"`, { stdio: 'inherit' });
fs.rmSync(stage, { recursive: true });

const size = (fs.statSync(path.join(outDir, name)).size / 1024).toFixed(1);
console.log(`✅ Packaged ${outDir}/${name} (${size} KB) — ready for store upload.`);
