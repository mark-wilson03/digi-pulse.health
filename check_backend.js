const fs = require('fs');
const path = require('path');
const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const storePath = path.join(__dirname, '..', 'data', 'digipulse_store.json');
if (fs.existsSync(storePath)) {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  for (let key in store) {
    const s = JSON.stringify(store[key]);
    if (emojiRegex.test(s)) {
      console.log('Store key has emoji:', key);
      const matches = s.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
      console.log('Matches:', matches);
    }
  }
}
