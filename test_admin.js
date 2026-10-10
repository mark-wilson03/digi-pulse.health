const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function verifyAdmin() {
  console.log('🧑‍⚕️ Verifying Admin Portal & User Management...');
  
  // Login as admin
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@digipulse.health', password: 'admin123' }
  });
  console.log(`[Admin Login] Status ${adminLogin.status}, Role: ${adminLogin.data.user.role}`);
  const token = adminLogin.data.token;

  // Fetch admin stats
  const stats = await request('/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`[Admin Stats] Total Users: ${stats.data.data.totalUsers}, Active: ${stats.data.data.activeUsers}, Articles: ${stats.data.data.totalArticles}`);

  // Fetch admin user list
  const users = await request('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`[Admin Users List] Count: ${users.data.data.length}, First: ${users.data.data[0].fullName} (${users.data.data[0].role})`);

  // Publish a tip
  const newTip = await request('/api/tips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: { tip_text: 'Deep nasal breathing stimulates diaphragmatic excursion and autonomic parasympathetic tone.', category: 'Respiratory' }
  });
  console.log(`[Publish Tip] Status: ${newTip.status}, Saved Tip: "${newTip.data.data.tip_text.slice(0, 40)}..."`);

  console.log('✅ ADMIN FEATURES VERIFIED!');
}

verifyAdmin().catch(console.error);
