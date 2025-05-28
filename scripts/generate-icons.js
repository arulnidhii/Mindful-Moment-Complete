const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'splash-icon.png': 1242,
  'favicon.png': 48,
  'logo.png': 240,
  'benefits-illustration.png': 320,
  'discovery-illustration.png': 320
};

async function generateIcons() {
  const sourceSvg = path.join(__dirname, '../assets/logo.svg');
  const outputDir = path.join(__dirname, '../assets/images');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [filename, size] of Object.entries(sizes)) {
    try {
      await sharp(sourceSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, filename));
      
      console.log(`Generated ${filename} (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating ${filename}:`, error);
    }
  }
}

generateIcons().catch(console.error); 