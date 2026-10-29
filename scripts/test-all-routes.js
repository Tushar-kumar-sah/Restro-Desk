const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper to make HTTP requests
function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout requesting ${urlPath}`));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Authenticating to obtain JWT auth_token cookie ---');
  let authCookie = '';
  try {
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        identifier: 'owner@restodesk.com',
        password: 'Password@123',
      },
    });

    if (loginRes.statusCode !== 200) {
      console.error('Failed to log in:', loginRes.statusCode, loginRes.body);
      process.exit(1);
    }

    const setCookie = loginRes.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      authCookie = setCookie[0].split(';')[0];
      console.log('Login successful! Auth Cookie acquired.');
    } else {
      console.error('No set-cookie header in login response');
      process.exit(1);
    }
  } catch (err) {
    console.error('Login error:', err);
    process.exit(1);
  }

  const pagesToTest = [
    '/login',
    '/setup',
    '/dashboard',
    '/pos',
    '/kitchen',
    '/tables',
    '/menu',
    '/menu/combos',
    '/menu/modifiers',
    '/inventory',
    '/inventory/recipes',
    '/inventory/purchase',
    '/inventory/suppliers',
    '/crm',
    '/crm/segments',
    '/loyalty',
    '/coupons',
    '/reports/sales',
    '/reports/day-end',
    '/reports/tax',
    '/campaigns',
    '/feedback',
    '/online-orders',
    '/delivery',
    '/settings',
    '/settings/outlets',
    '/settings/staff',
    '/settings/printers',
    '/audit-logs',
    // Public customer facing routes
    '/order',
    '/order/outlet-blr-ind-001',
    '/table-order',
    '/table-order/tbl-01',
    '/review',
    '/review/rev-01',
  ];

  console.log(`\n--- 2. Testing ${pagesToTest.length} Frontend Page Routes ---`);
  let pageFailures = 0;
  for (const page of pagesToTest) {
    try {
      const res = await request(page, {
        headers: {
          Cookie: authCookie,
          Accept: 'text/html',
        },
      });

      const isOk = res.statusCode >= 200 && res.statusCode < 400;
      const isErrorHtml = res.body.includes('Internal Server Error') || res.body.includes('An unexpected error has occurred');

      if (!isOk || isErrorHtml) {
        console.error(`❌ [PAGE FAIL] ${page} -> Status: ${res.statusCode}`);
        if (isErrorHtml) {
          console.error(`   Error excerpt:`, res.body.slice(0, 300));
        }
        pageFailures++;
      } else {
        console.log(`✅ [PAGE OK] ${page} (${res.statusCode}) - ${res.body.length} bytes`);
      }
    } catch (err) {
      console.error(`❌ [PAGE EXCEPTION] ${page} ->`, err.message);
      pageFailures++;
    }
  }

  const apisToTest = [
    '/api/auth/me',
    '/api/outlets',
    '/api/menu/categories',
    '/api/menu/items',
    '/api/menu/combos',
    '/api/menu/modifiers',
    '/api/tables',
    '/api/sections',
    '/api/kds',
    '/api/pos/orders',
    '/api/inventory/raw-materials',
    '/api/inventory/recipes',
    '/api/inventory/suppliers',
    '/api/inventory/purchase-orders',
    '/api/crm/customers',
    '/api/crm/segments',
    '/api/crm/loyalty',
    '/api/crm/coupons',
    '/api/reports/dashboard',
    '/api/reports/sales',
    '/api/reports/day-end',
    '/api/reports/tax',
    '/api/reports/shifts',
    '/api/campaigns',
    '/api/campaigns/templates',
    '/api/campaigns/journeys',
    '/api/feedback',
    '/api/online-orders',
    '/api/delivery/zones',
    '/api/delivery/boys',
    '/api/settings/brand',
    '/api/settings/outlets',
    '/api/settings/staff',
    '/api/settings/printers',
    '/api/settings/api-keys',
    '/api/audit-logs',
  ];

  console.log(`\n--- 3. Testing ${apisToTest.length} API GET Endpoints ---`);
  let apiFailures = 0;
  for (const api of apisToTest) {
    try {
      const res = await request(api, {
        headers: {
          Cookie: authCookie,
          Accept: 'application/json',
        },
      });

      const isOk = res.statusCode >= 200 && res.statusCode < 300;
      let json = null;
      try {
        json = JSON.parse(res.body);
      } catch (e) {}

      if (!isOk || (json && json.success === false)) {
        console.error(`❌ [API FAIL] ${api} -> Status: ${res.statusCode}, Body: ${res.body.slice(0, 200)}`);
        apiFailures++;
      } else {
        console.log(`✅ [API OK] ${api} (${res.statusCode})`);
      }
    } catch (err) {
      console.error(`❌ [API EXCEPTION] ${api} ->`, err.message);
      apiFailures++;
    }
  }

  console.log('\n=======================================');
  console.log(`Total Pages Tested: ${pagesToTest.length} | Failures: ${pageFailures}`);
  console.log(`Total APIs Tested:  ${apisToTest.length} | Failures: ${apiFailures}`);
  console.log('=======================================');

  if (pageFailures > 0 || apiFailures > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL PAGES AND ENDPOINTS WORKING PERFECTLY WITH ZERO ERRORS!');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
