import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateFavicons() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'logo.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Sizes to generate
  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const item of sizes) {
    const dest = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(dest);
    console.log(`Generated: ${item.name} (${item.size}x${item.size})`);
  }

  // Create favicon.ico (Standard ICO format wrapping 48x48 PNG and 32x32 PNG)
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  // Helper to build a multi-image ICO container
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type 1 = ICO
  icoHeader.writeUInt16LE(2, 4); // Number of images = 2

  const dirEntrySize = 16;
  const imageOffset = 6 + (dirEntrySize * 2);

  const entry32 = Buffer.alloc(dirEntrySize);
  entry32.writeUInt8(32, 0); // Width
  entry32.writeUInt8(32, 1); // Height
  entry32.writeUInt8(0, 2);  // Color count
  entry32.writeUInt8(0, 3);  // Reserved
  entry32.writeUInt16LE(1, 4); // Color planes
  entry32.writeUInt16LE(32, 6); // Bits per pixel
  entry32.writeUInt32LE(png32.length, 8); // Image size
  entry32.writeUInt32LE(imageOffset, 12); // Image offset

  const entry48 = Buffer.alloc(dirEntrySize);
  entry48.writeUInt8(48, 0); // Width
  entry48.writeUInt8(48, 1); // Height
  entry48.writeUInt8(0, 2);  // Color count
  entry48.writeUInt8(0, 3);  // Reserved
  entry48.writeUInt16LE(1, 4); // Color planes
  entry48.writeUInt16LE(32, 6); // Bits per pixel
  entry48.writeUInt32LE(png48.length, 8); // Image size
  entry48.writeUInt32LE(imageOffset + png32.length, 12); // Image offset

  const icoBuffer = Buffer.concat([icoHeader, entry32, entry48, png32, png48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated: favicon.ico (32x32, 48x48)');
}

generateFavicons().catch(console.error);
