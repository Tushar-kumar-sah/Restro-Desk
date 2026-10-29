const http = require('http');

async function measure(urlPath, headers = {}) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({
          path: urlPath,
          status: res.statusCode,
          timeMs: Date.now() - t0,
          bytes: data.length,
        });
      });
    });
    req.on('error', err => resolve({ path: urlPath, error: err.message, timeMs: Date.now() - t0 }));
    req.end();
  });
}

async function run() {
  console.log('======================================================');
  console.log('⚡ RESTODESK LATENCY & SPEED BENCHMARK');
  console.log('======================================================');

  // Test public login page
  const loginTest = await measure('/login');
  console.log(`[Public Page]  ${loginTest.path} -> ${loginTest.timeMs}ms (HTTP ${loginTest.status}, ${loginTest.bytes} bytes)`);

  // Authenticate
  const authCookie = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
        resolve(cookie);
      });
    });
    req.write(JSON.stringify({ identifier: 'owner@restodesk.com', password: 'Password@123' }));
    req.end();
  });

  const authHeader = { Cookie: authCookie };

  console.log('\n--- API Endpoints (Cache & Query Speed) ---');
  // First call (populates cache)
  const out1 = await measure('/api/outlets', authHeader);
  console.log(`[API 1st Call] ${out1.path} -> ${out1.timeMs}ms (DB fetch)`);
  // Second call (hits sub-ms cache)
  const out2 = await measure('/api/outlets', authHeader);
  console.log(`[API 2nd Call] ${out2.path} -> ${out2.timeMs}ms (⚡ In-Memory Cache)`);

  const cat1 = await measure('/api/menu/categories', authHeader);
  console.log(`[API 1st Call] ${cat1.path} -> ${cat1.timeMs}ms`);
  const cat2 = await measure('/api/menu/categories', authHeader);
  console.log(`[API 2nd Call] ${cat2.path} -> ${cat2.timeMs}ms (⚡ In-Memory Cache)`);

  const itm1 = await measure('/api/menu/items?limit=100', authHeader);
  console.log(`[API 1st Call] ${itm1.path} -> ${itm1.timeMs}ms`);
  const itm2 = await measure('/api/menu/items?limit=100', authHeader);
  console.log(`[API 2nd Call] ${itm2.path} -> ${itm2.timeMs}ms (⚡ In-Memory Cache)`);

  const tbl1 = await measure('/api/tables', authHeader);
  console.log(`[API 1st Call] ${tbl1.path} -> ${tbl1.timeMs}ms`);
  const tbl2 = await measure('/api/tables', authHeader);
  console.log(`[API 2nd Call] ${tbl2.path} -> ${tbl2.timeMs}ms (⚡ In-Memory Cache)`);

  console.log('\n--- Frontend App Pages (SSR / Hydration Ready) ---');
  const pages = ['/dashboard', '/pos', '/kitchen', '/tables', '/menu', '/inventory', '/crm', '/reports/sales'];
  for (const p of pages) {
    const res = await measure(p, authHeader);
    console.log(`[App Page]     ${res.path.padEnd(16)} -> ${res.timeMs}ms (HTTP ${res.status}, ${(res.bytes/1024).toFixed(1)} KB)`);
  }

  console.log('======================================================');
}

run();
