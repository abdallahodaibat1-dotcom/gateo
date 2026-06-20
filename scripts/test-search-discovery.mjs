#!/usr/bin/env node
/**
 * Search & Discovery API smoke test.
 * Validates that search endpoints return expected shapes.
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text().catch(() => '');
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
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
  console.log('  Gateo Search & Discovery Test');
  console.log('═══════════════════════════════════════════════════════════');

  let allPassed = true;

  const endpoints = [
    { path: '/api/businesses', name: 'Businesses list' },
    { path: '/api/businesses?category=medical-services', name: 'Businesses by category' },
    { path: '/api/search?q=medical', name: 'Global search' },
    { path: '/api/search/businesses?q=medical', name: 'Business search' },
    { path: '/api/professionals', name: 'Professionals list' },
    { path: '/api/marketplace', name: 'Marketplace list' },
    { path: '/api/categories', name: 'Categories list' },
    { path: '/api/groups', name: 'Groups list' },
    { path: '/api/posts', name: 'Posts list' },
  ];

  for (const ep of endpoints) {
    const res = await request(ep.path);
    const isArray = Array.isArray(res.json);
    const hasResults = isArray || (res.json && typeof res.json === 'object');
    allPassed &= assert(
      `${ep.name} returns valid response`,
      res.status === 200 && hasResults
    );
  }

  // Ladies Gate isolation
  const ladiesCats = await request('/api/categories?ladiesGate=true');
  const ladiesSearch = await request('/api/search/businesses?ladiesGate=true&q=beauty');
  const ladiesCatsArray = ladiesCats.json?.categories || ladiesCats.json;
  allPassed &= assert(
    'Ladies Gate categories endpoint works',
    ladiesCats.status === 200 && Array.isArray(ladiesCatsArray) && ladiesCatsArray.every((c) => c.isLadiesGate === true)
  );
  allPassed &= assert(
    'Ladies Gate search endpoint works',
    ladiesSearch.status === 200
  );

  console.log('═══════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ Search & discovery test passed');
    process.exit(0);
  }
  console.log('❌ Search & discovery test failed');
  process.exit(1);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
