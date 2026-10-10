const http = require('http');

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({
      host: 'localhost',
      port: 5000,
      path,
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(resData) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Testing frontend HTML delivery...');
  const page = await get('/');
  console.log('GET / Status:', page.status);
  
  const checks = [
    { name: 'authPortalScreen present', test: page.data.includes('id="authPortalScreen"') },
    { name: 'mainAppShell present', test: page.data.includes('id="mainAppShell"') },
    { name: 'portalSignInContainer present', test: page.data.includes('id="portalSignInContainer"') },
    { name: 'portalSignUpContainer present', test: page.data.includes('id="portalSignUpContainer"') },
    { name: 'portalForgotContainer present', test: page.data.includes('id="portalForgotContainer"') },
    { name: 'quick action pill svg icons present', test: page.data.includes('class="pill-icon"') },
    { name: 'sign out button in header present', test: page.data.includes('app.logout()') }
  ];

  checks.forEach(c => {
    console.log(`  [${c.test ? 'PASS' : 'FAIL'}] ${c.name}`);
  });

  console.log('\nTesting Auth API endpoints...');
  // 1. Patient Login
  const loginRes = await post('/api/auth/login', {
    email: 'mark@digipulse.health',
    password: 'password123',
    rememberMe: true
  });
  console.log('Patient Login:', loginRes.status, loginRes.data.success ? 'SUCCESS' : 'FAILED', loginRes.data.user?.fullName);

  // 2. Doctor Login
  const adminRes = await post('/api/auth/login', {
    email: 'admin@digipulse.health',
    password: 'admin123',
    rememberMe: true
  });
  console.log('Doctor Login:', adminRes.status, adminRes.data.success ? 'SUCCESS' : 'FAILED', adminRes.data.user?.fullName);

  // 3. Register New User
  const randomEmail = `patient_${Date.now()}@example.com`;
  const regRes = await post('/api/auth/register', {
    fullName: 'Jane Doe',
    email: randomEmail,
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    agreeTerms: true
  });
  console.log('Registration Test:', regRes.status, regRes.data.success ? 'SUCCESS' : 'FAILED', regRes.data.user?.email);

  // 4. Validate Me endpoint
  const meRes = await get('/api/auth/me', {
    'Authorization': `Bearer ${loginRes.data.token}`
  });
  const meData = JSON.parse(meRes.data);
  console.log('/api/auth/me Validation:', meRes.status, meData.success ? 'SUCCESS' : 'FAILED', meData.user?.fullName);
}

runTests().catch(err => console.error('Error running test:', err));
