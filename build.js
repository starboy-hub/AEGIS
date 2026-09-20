const fs = require('fs');
const path = require('path');

// Create dist folder
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy manifest.json
fs.copyFileSync('manifest.json', 'dist/manifest.json');

// Copy and flatten source files
const files = [
  { src: 'src/background/background.js', dest: 'dist/background.js' },
  { src: 'src/content/content.js', dest: 'dist/content.js' },
  { src: 'src/popup/popup.html', dest: 'dist/popup.html' },
  { src: 'src/popup/popup.js', dest: 'dist/popup.js' }
];

files.forEach(file => {
  if (fs.existsSync(file.src)) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`✓ Copied ${file.src} to ${file.dest}`);
  } else {
    console.error(`✗ Missing: ${file.src}`);
  }
});

// Create icons directory
if (!fs.existsSync('dist/icons')) {
  fs.mkdirSync('dist/icons', { recursive: true });
}

// Generate icons using create-icons.js
console.log('\n🎨 Generating icons...');
require('./create-icons.js');

console.log('\n✅ Build complete! Load the "dist" folder in Chrome.');