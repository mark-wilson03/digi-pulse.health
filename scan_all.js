const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu;

function checkFile(relPath) {
  const full = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(full)) return;
  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split('\n');
  const found = [];
  lines.forEach((l, i) => {
    const matches = l.match(emojiRegex);
    if (matches) {
      found.push({ line: i + 1, text: l.trim(), emojis: matches });
    }
  });
  console.log(`=== ${relPath}: ${found.length} lines with emojis ===`);
  found.forEach(item => {
    console.log(`L${item.line} [${item.emojis.join(' ')}]: ${item.text}`);
  });
}

['public/index.html', 'public/js/app.js', 'public/js/charts.js', 'public/js/translations.js', 'public/css/style.css'].forEach(checkFile);
