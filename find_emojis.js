const fs = require('fs');
const path = require('path');

const files = [
  'public/index.html',
  'public/js/app.js',
  'public/js/charts.js',
  'public/js/translations.js',
  'public/css/style.css'
];

// Comprehensive regex matching emojis
const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;

files.forEach(f => {
  const filePath = path.join(__dirname, '..', f);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      matches.push({ lineNum: idx + 1, line: line.trim() });
    }
  });
  console.log(`${f}: ${matches.length} lines with emojis`);
  matches.forEach(m => console.log(`  [${m.lineNum}] ${m.line}`));
});
