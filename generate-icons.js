import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const input = path.resolve('public/favicon.svg');

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(input);

    await sharp(svgBuffer)
      .resize(192, 192)
      .toFile('public/pwa-192x192.png');
      
    await sharp(svgBuffer)
      .resize(512, 512)
      .toFile('public/pwa-512x512.png');
      
    await sharp(svgBuffer)
      .resize(180, 180)
      .toFile('public/apple-touch-icon.png');
      
    console.log('Icons generated successfully.');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
