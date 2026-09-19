const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function convertImage(srcPath, destPath, options = {}) {
  const { maxWidth = 1920, quality = 82 } = options;
  const originalStat = fs.statSync(srcPath);

  let pipeline = sharp(srcPath);
  const metadata = await pipeline.metadata();

  if (maxWidth && metadata.width && metadata.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  pipeline = pipeline.webp({ quality });

  await pipeline.toFile(destPath);
  const newStat = fs.statSync(destPath);

  const origMB = (originalStat.size / (1024 * 1024)).toFixed(2);
  const newKB = (newStat.size / 1024).toFixed(1);
  const savings = (((originalStat.size - newStat.size) / originalStat.size) * 100).toFixed(1);

  console.log(
    `Converted: ${path.relative(PUBLIC_DIR, srcPath)} -> ${path.basename(destPath)} | ` +
    `${origMB} MB -> ${newKB} KB (-${savings}%)`
  );
}

async function main() {
  console.log('--- Starting Image Optimization to WebP ---');

  // 1. Map images
  const mapFiles = ['map-test.jpg', 'mapa-guixa.png'];
  for (const file of mapFiles) {
    const src = path.join(PUBLIC_DIR, file);
    if (fs.existsSync(src)) {
      const ext = path.extname(file);
      const dest = path.join(PUBLIC_DIR, file.replace(ext, '.webp'));
      await convertImage(src, dest, { maxWidth: 2048, quality: 84 });
    }
  }

  // 2. Root images folder (home.jpg, ending.jpg)
  const rootImages = ['home.jpg', 'ending.jpg'];
  for (const file of rootImages) {
    const src = path.join(PUBLIC_DIR, 'images', file);
    if (fs.existsSync(src)) {
      const ext = path.extname(file);
      const dest = path.join(PUBLIC_DIR, 'images', file.replace(ext, '.webp'));
      await convertImage(src, dest, { maxWidth: 1920, quality: 82 });
    }
  }

  // 3. Scenes folder
  const scenesDir = path.join(PUBLIC_DIR, 'images', 'scenes');
  if (fs.existsSync(scenesDir)) {
    const sceneFiles = fs.readdirSync(scenesDir);
    for (const file of sceneFiles) {
      if (/\.(jpg|jpeg|png)$/i.test(file) && !file.endsWith('.webp')) {
        const src = path.join(scenesDir, file);
        const ext = path.extname(file);
        const dest = path.join(scenesDir, file.replace(ext, '.webp'));
        const isPng = ext.toLowerCase() === '.png';
        await convertImage(src, dest, {
          maxWidth: 1920,
          quality: isPng ? 85 : 82
        });
      }
    }
  }

  // 4. Seals folder
  const sealsDir = path.join(PUBLIC_DIR, 'images', 'seals');
  if (fs.existsSync(sealsDir)) {
    const sealFiles = fs.readdirSync(sealsDir);
    for (const file of sealFiles) {
      if (/\.png$/i.test(file)) {
        const src = path.join(sealsDir, file);
        const dest = path.join(sealsDir, file.replace(/\.png$/i, '.webp'));
        await convertImage(src, dest, { maxWidth: 600, quality: 85 });
      }
    }
  }

  // 5. Elements folder (verify/regenerate)
  const elementsDir = path.join(PUBLIC_DIR, 'images', 'elements');
  if (fs.existsSync(elementsDir)) {
    const elementFiles = fs.readdirSync(elementsDir);
    for (const file of elementFiles) {
      if (/\.png$/i.test(file)) {
        const src = path.join(elementsDir, file);
        const dest = path.join(elementsDir, file.replace(/\.png$/i, '.webp'));
        await convertImage(src, dest, { maxWidth: 512, quality: 90 });
      }
    }
  }

  console.log('--- Finished Image Optimization ---');
}

main().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
