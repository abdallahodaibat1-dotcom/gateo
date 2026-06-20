#!/usr/bin/env node
/**
 * Basic security smoke tests for Gateo API.
 * Checks for common vulnerabilities without destructive operations.
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text().catch(() => '');
  return { status: res.status, text, headers: res.headers };
}

function assert(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    return true;
  }
  console.error(`❌ ${name}`);
  return false;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Gateo Security Smoke Test');
  console.log('═══════════════════════════════════════════════════════════');

  let allPassed = true;

  // 1. SQL Injection probe on public search
  const sqli = await request('/api/search?q=\' OR \'1\'=\'1');
  allPassed &= assert(
    'Search endpoint does not crash on SQL-like input',
    sqli.status === 200 || sqli.status === 400
  );

  // 2. XSS probe on public search
  const xss = await request('/api/search?q=<script>alert(1)</script>');
  const contentType = xss.headers.get('content-type') || '';
  allPassed &= assert(
    'Search endpoint returns JSON (not executable HTML)',
    contentType.includes('application/json')
  );

  // 3. Protected endpoints require auth
  const protectedEndpoints = [
    '/api/account/me',
    '/api/conversations',
    '/api/notifications',
    '/api/bookings',
  ];
  for (const ep of protectedEndpoints) {
    const res = await request(ep);
    allPassed &= assert(
      `${ep} requires authentication`,
      res.status === 401 || res.status === 403 || res.status === 307
    );
  }

  // 4. Admin endpoints require auth/role
  const adminApi = await request('/api/admin/categories');
  allPassed &= assert(
    '/api/admin/categories is protected',
    adminApi.status === 401 || adminApi.status === 403
  );

  // 5. Content-Type handling for invalid JSON
  const invalidJson = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json',
  });
  allPassed &= assert(
    'Register endpoint handles malformed JSON safely',
    invalidJson.status === 400 || invalidJson.status === 500
  );

  // 6. Large payload rejection
  const hugePayload = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a'.repeat(10000) + '@test.com' }),
  });
  allPassed &= assert(
    'Register endpoint rejects oversized input',
    hugePayload.status === 400 || hugePayload.status === 413
  );

  // 7. CORS headers for API routes
  const cors = await request('/api/health', {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://evil.example.com',
      'Access-Control-Request-Method': 'GET',
    },
  });
  allPassed &= assert(
    'API does not allow arbitrary origins',
    cors.status !== 204 || !cors.headers.get('access-control-allow-origin')?.includes('evil.example.com')
  );

  console.log('═══════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ Security smoke test passed');
    process.exit(0);
  }
  console.log('❌ Security smoke test failed');
  process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
