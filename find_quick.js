const fs = require('fs');
const lines = fs.readFileSync('public/css/style.css', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('quick-action')) console.log(i + 1, l.trim());
});
