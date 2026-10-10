const http = require('http');

http.get('http://localhost:5000/api/health', r => {
  let data = '';
  r.on('data', chunk => data += chunk);
  r.on('end', () => console.log('Server is running! Status:', r.statusCode, data));
}).on('error', e => {
  console.log('Server is not running:', e.message);
});
