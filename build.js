#!/usr/bin/env node
/**
 * AEGIS build script.
 *   npm run build            → dist/ (Chromium: Chrome/Edge/Brave)
 *   npm run build:firefox    → dist-firefox/ (Firefox-adapted manifest)
 *
 * The Firefox variant adapts the manifest (gecko id, background scripts
 * instead of a service worker) and drops the offscreen in-browser AI model
 * (Firefox has no chrome.offscreen). Everything else is identical.
 */
const fs = require('fs');
const path = require('path');

const CHROME_OUT = 'dist';
const FIREFOX_OUT = 'dist-firefox';

function firefoxManifest(manifest) {
  const m = JSON.parse(JSON.stringify(manifest));
  m.background = {
    scripts: ['aegis-shared.js', 'aegis-vault.js', 'reality-engine.js', 'signing-engine.js', 'threat-store.js', 'semantic-engine.js', 'background.js']
  };
  m.browser_specific_settings = { gecko: { id: 'aegis@starboy-hub.github.io', strict_min_version: '115.0' } };
  // No chrome.offscreen in Firefox: the in-browser AI model + its permission
  // are removed; Sentinel falls back to heuristics (+ Ollama, which works)
  m.permissions = (m.permissions || []).filter(p => p !== 'offscreen');
  if (m.content_scripts && m.content_scripts[0]) {
    m.content_scripts[0].js = m.content_scripts[0].js.filter(f => f !== 'injection-engine.js');
  }
  return m;
}

/** Copy every source file for a target; returns the list written. */
function copySources(out, files) {
  const written = [];
  files.forEach(file => {
    if (fs.existsSync(file.src)) {
      fs.copyFileSync(file.src, path.join(out, file.dest));
      written.push(file.dest);
    } else {
      console.error(`✗ Missing: ${file.src}`);
    }
  });
  return written;
}

function copyIcons(out) {
  fs.mkdirSync(path.join(out, 'icons'), { recursive: true });
  ['icon16.png', 'icon48.png', 'icon128.png'].forEach(icon => {
    const src = path.join('src', 'icons', icon);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, 'icons', icon));
    else console.error(`✗ Missing icon: ${src}`);
  });
}

/** Vendor the in-browser AI runtime (Chromium target only). */
function vendorAIRuntime(out) {
  const hfDist = 'node_modules/@huggingface/transformers/dist';
  const ortDist = 'node_modules/onnxruntime-web/dist';
  if (!fs.existsSync(hfDist + '/transformers.min.js')) {
    console.warn('! @huggingface/transformers not installed — in-browser AI omitted');
    return false;
  }
  fs.mkdirSync(path.join(out, 'vendor'), { recursive: true });
  fs.copyFileSync(hfDist + '/transformers.min.js', path.join(out, 'vendor', 'transformers.min.js'));
  if (fs.existsSync(ortDist)) {
    fs.readdirSync(ortDist).filter(f => f.endsWith('.wasm') || f.endsWith('.mjs')).forEach(f => {
      fs.copyFileSync(path.join(ortDist, f), path.join(out, 'vendor', f));
    });
  }
  return true;
}

/** Build the Chromium target into `out` (default dist). Returns file count. */
function buildChromium(out = CHROME_OUT) {
  if (fs.existsSync(out)) fs.rmSync(out, { recursive: true });
  fs.mkdirSync(out, { recursive: true });

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf8'));
  manifest.version = pkg.version;
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const files = [
    { src: 'src/shared/aegis-shared.js', dest: 'aegis-shared.js' },
    { src: 'src/background/aegis-vault.js', dest: 'aegis-vault.js' },
    { src: 'src/background/reality-engine.js', dest: 'reality-engine.js' },
    { src: 'src/background/signing-engine.js', dest: 'signing-engine.js' },
    { src: 'src/background/threat-store.js', dest: 'threat-store.js' },
    { src: 'src/background/background.js', dest: 'background.js' },
    { src: 'src/background/offscreen-error.js', dest: 'offscreen-error.js' },
    { src: 'src/background/offscreen.html', dest: 'offscreen.html' },
    { src: 'src/background/offscreen.js', dest: 'offscreen.js' },
    { src: 'src/content/modules/fake-data.js', dest: 'fake-data.js' },
    { src: 'src/content/modules/detection-engine.js', dest: 'detection-engine.js' },
    { src: 'src/content/modules/sentinel-engine.js', dest: 'sentinel-engine.js' },
    { src: 'src/content/modules/injection-engine.js', dest: 'injection-engine.js' },
    { src: 'src/content/modules/webmail-profile.js', dest: 'webmail-profile.js' },
    { src: 'src/content/modules/semantic-engine.js', dest: 'semantic-engine.js' },
    { src: 'src/content/content.js', dest: 'content.js' },
    { src: 'src/popup/popup.html', dest: 'popup.html' },
    { src: 'src/popup/popup.css', dest: 'popup.css' },
    { src: 'src/popup/popup.js', dest: 'popup.js' },
    { src: 'src/options/options.html', dest: 'options.html' },
    { src: 'src/options/options.css', dest: 'options.css' },
    { src: 'src/options/options.js', dest: 'options.js' }
  ];
  const written = copySources(out, files);
  copyIcons(out);
  const hasAI = vendorAIRuntime(out);
  if (!hasAI) console.warn('! in-browser AI runtime omitted');
  return written.length;
}

/** Build the Firefox target: same files, adapted manifest, no offscreen AI. */
function buildFirefox(out = FIREFOX_OUT) {
  if (fs.existsSync(out)) fs.rmSync(out, { recursive: true });
  fs.mkdirSync(out, { recursive: true });

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const manifest = firefoxManifest(JSON.parse(fs.readFileSync('src/manifest.json', 'utf8')));
  manifest.version = pkg.version;
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const files = [
    { src: 'src/shared/aegis-shared.js', dest: 'aegis-shared.js' },
    { src: 'src/background/aegis-vault.js', dest: 'aegis-vault.js' },
    { src: 'src/background/reality-engine.js', dest: 'reality-engine.js' },
    { src: 'src/background/signing-engine.js', dest: 'signing-engine.js' },
    { src: 'src/background/threat-store.js', dest: 'threat-store.js' },
    { src: 'src/background/background.js', dest: 'background.js' },
    { src: 'src/content/modules/fake-data.js', dest: 'fake-data.js' },
    { src: 'src/content/modules/detection-engine.js', dest: 'detection-engine.js' },
    { src: 'src/content/modules/sentinel-engine.js', dest: 'sentinel-engine.js' },
    { src: 'src/content/modules/injection-engine.js', dest: 'injection-engine.js' },
    { src: 'src/content/modules/webmail-profile.js', dest: 'webmail-profile.js' },
    { src: 'src/content/modules/semantic-engine.js', dest: 'semantic-engine.js' },
    { src: 'src/content/content.js', dest: 'content.js' },
    { src: 'src/popup/popup.html', dest: 'popup.html' },
    { src: 'src/popup/popup.css', dest: 'popup.css' },
    { src: 'src/popup/popup.js', dest: 'popup.js' },
    { src: 'src/options/options.html', dest: 'options.html' },
    { src: 'src/options/options.css', dest: 'options.css' },
    { src: 'src/options/options.js', dest: 'options.js' }
  ];
  const written = copySources(out, files);
  copyIcons(out);
  return written.length;
}

if (require.main === module) {
  const target = process.argv.includes('--firefox') ? 'firefox' : 'chromium';
  if (target === 'firefox') {
    const n = buildFirefox();
    console.log(`✅ Firefox build complete (${n} files) — load dist-firefox/ via about:debugging`);
  } else {
    const n = buildChromium();
    console.log(`✅ Build complete! Load the "${CHROME_OUT}" folder in Chrome.`);
  }
}

module.exports = { buildChromium, buildFirefox, firefoxManifest, copySources, vendorAIRuntime, CHROME_OUT, FIREFOX_OUT };
