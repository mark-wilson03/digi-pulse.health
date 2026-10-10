const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// 1x1 transparent/blue PNG buffer
const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzcTjX8AAAAABJRU5ErkJggg==';
const buf = Buffer.from(tinyPngBase64, 'base64');

fs.writeFileSync(path.join(iconDir, 'icon-192.png'), buf);
fs.writeFileSync(path.join(iconDir, 'icon-512.png'), buf);
console.log('Created placeholder PWA icons.');
