const fs = require('fs');
const path = require('path');

// Create dist folder
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy manifest.json from src (single source of truth), then stamp the
// version from package.json so the two can never drift apart
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf8'));
manifest.version = pkg.version;
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`✓ Wrote dist/manifest.json (version ${pkg.version} from package.json)`);

// Copy and flatten source files
const files = [
  { src: 'src/shared/aegis-shared.js', dest: 'dist/aegis-shared.js' },
  { src: 'src/background/aegis-vault.js', dest: 'dist/aegis-vault.js' },
  { src: 'src/background/reality-engine.js', dest: 'dist/reality-engine.js' },
  { src: 'src/content/modules/fake-data.js', dest: 'dist/fake-data.js' },
  { src: 'src/content/modules/detection-engine.js', dest: 'dist/detection-engine.js' },
  { src: 'src/content/modules/sentinel-engine.js', dest: 'dist/sentinel-engine.js' },
  { src: 'src/content/modules/injection-engine.js', dest: 'dist/injection-engine.js' },
  { src: 'src/background/background.js', dest: 'dist/background.js' },
  { src: 'src/content/content.js', dest: 'dist/content.js' },
  { src: 'src/popup/popup.html', dest: 'dist/popup.html' },
  { src: 'src/popup/popup.js', dest: 'dist/popup.js' },
  { src: 'src/popup/popup.css', dest: 'dist/popup.css' },
  { src: 'src/options/options.html', dest: 'dist/options.html' },
  { src: 'src/options/options.js', dest: 'dist/options.js' },
  { src: 'src/install-mac.sh', dest: 'dist/install-mac.sh' },
  { src: 'src/install-windows.bat', dest: 'dist/install-windows.bat' }
];

files.forEach(file => {
  if (fs.existsSync(file.src)) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`✓ Copied ${file.src} to ${file.dest}`);
  } else {
    console.error(`✗ Missing: ${file.src}`);
  }
});

// Create icons directory and copy icons from src
if (!fs.existsSync('dist/icons')) {
  fs.mkdirSync('dist/icons', { recursive: true });
}

// Copy icons from src/icons to dist/icons
const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png'];
iconFiles.forEach(icon => {
  const srcPath = path.join('src', 'icons', icon);
  const destPath = path.join('dist', 'icons', icon);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${srcPath} to ${destPath}`);
  } else {
    console.error(`✗ Missing icon: ${srcPath}`);
  }
});

console.log('\n✅ Build complete! Load the "dist" folder in Chrome.');