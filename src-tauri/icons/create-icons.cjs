const sharp = require('sharp');

async function createIcons() {
  // 创建一个简单的蓝色圆形图标
  const size = 256;
  const channels = 4;
  const pixels = Buffer.alloc(size * size * channels);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * channels;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius) {
        // 蓝色圆
        pixels[idx] = 64;     // R
        pixels[idx + 1] = 158; // G
        pixels[idx + 2] = 255; // B
        pixels[idx + 3] = 255; // A
        
        // 添加文字 "DT" 的简单表示（用白点）
        const textY = y - centerY;
        const textX = x - centerX;
        if (textX > -20 && textX < 20 && textY > -10 && textY < 10) {
          pixels[idx] = 255;
          pixels[idx + 1] = 255;
          pixels[idx + 2] = 255;
        }
      } else {
        // 透明背景
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }
  
  // 生成不同尺寸的图标
  await sharp(pixels, {
    raw: {
      width: size,
      height: size,
      channels: channels
    }
  })
  .resize(32, 32)
  .png()
  .toFile('32x32.png');
  
  await sharp(pixels, {
    raw: {
      width: size,
      height: size,
      channels: channels
    }
  })
  .resize(128, 128)
  .png()
  .toFile('128x128.png');
  
  await sharp(pixels, {
    raw: {
      width: size,
      height: size,
      channels: channels
    }
  })
  .resize(256, 256)
  .png()
  .toFile('128x128@2x.png');
  
  // 生成ICO文件
  const icoBuffer = await sharp(pixels, {
    raw: {
      width: size,
      height: size,
      channels: channels
    }
  })
  .resize(256, 256)
  .png()
  .toBuffer();
  
  // 使用png-to-ico创建ICO
  const pngToIco = require('png-to-ico').default;
  const ico = await pngToIco(icoBuffer);
  require('fs').writeFileSync('icon.ico', ico);
  
  console.log('Icons created successfully!');
}

createIcons().catch(console.error);
