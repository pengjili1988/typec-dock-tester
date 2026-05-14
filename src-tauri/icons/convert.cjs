const pngToIco = require('png-to-ico').default;
const fs = require('fs');

async function convert() {
  try {
    const buf = await pngToIco('128x128.png');
    fs.writeFileSync('icon.ico', buf);
    console.log('icon.ico created successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

convert();
