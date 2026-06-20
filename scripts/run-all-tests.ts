#!/usr/bin/env ts-node
/**
 * Gateo Full Test Suite Orchestrator
 *
 * Runs the complete testing plan from the ODT test plan document:
 * 1. Seed base data (categories, admin, demo users)
 * 2. Seed professional profiles and businesses
 * 3. Build realistic test environment (users, businesses, marketplace, content, social)
 * 4. Run smoke tests, load tests, privacy tests
 * 5. Run Playwright E2E tests
 *
 * Usage:
 *   npx ts-node scripts/run-all-tests.ts
 *
 * Environment:
 *   BASE_URL    - defaults to http://localhost:3000
 *   DATABASE_URL- read from .env if present
 */

import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PROJECT_ROOT = path.resolve(__dirname, '..');

interface Step {
  name: string;
  cmd: string;
  args: string[];
  optional?: boolean;
}

function runCommand(cmd: string, args: string[], options: SpawnOptionsWithoutStdio = {}): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, BASE_URL },
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    child.stdout?.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk);
    });
    child.stderr?.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stderr.write(chunk);
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

async function waitForServer(retries = 30, delay = 2000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return true;
    } catch {
      // server not ready yet
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Gateo Full Test Suite Orchestrator');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Project Root: ${PROJECT_ROOT}`);
  console.log();

  // 1. Wait for dev server
  console.log('⏳ Waiting for dev server...');
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('\n❌ Dev server is not running. Please run `npm run dev` first.');
    process.exit(1);
  }
  console.log('\n✅ Dev server is ready.\n');

  // Define test steps aligned with the ODT test plan
  const steps: Step[] = [
    // Phase 1 & 2: Base accounts, auth setup
    {
      name: '1️⃣  Prisma seed (categories, admin, demo users)',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', '-r', 'dotenv/config', 'prisma/seed.ts'],
    },
    {
      name: '2️⃣  Ensure admin exists',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/create-admin.ts'],
    },
    // Phase 3: Directory seed
    {
      name: '3️⃣  Seed professional profiles',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/seed-professionals.ts'],
    },
    {
      name: '4️⃣  Seed professional businesses',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/seed-professional-businesses.ts'],
    },
    // Phase 4-7: Realistic environment (users, businesses, e-commerce, content, social, comms)
    {
      name: '5️⃣  Build realistic test environment',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/realistic-test-environment.ts'],
    },
    // Phase 8-9: API smoke, load, privacy tests
    {
      name: '6️⃣  API smoke test',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/smoke-test.ts'],
    },
    {
      name: '7️⃣  Load test',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/load-test.ts'],
    },
    {
      name: '8️⃣  Ladies Gate privacy test',
      cmd: 'npx',
      args: ['ts-node', '--compiler-options', '{"module":"commonjs"}', 'scripts/ladies-gate-privacy-test.ts'],
    },
    {
      name: '9️⃣  Search & discovery API test',
      cmd: 'node',
      args: ['scripts/test-search-discovery.mjs'],
    },
    {
      name: '🔟 Security smoke test',
      cmd: 'node',
      args: ['scripts/security-smoke-test.mjs'],
    },
    // E2E tests
    {
      name: '1️⃣1️⃣ E2E: onboarding flow',
      cmd: 'node',
      args: ['scripts/test-onboarding.mjs'],
      optional: true,
    },
    {
      name: '1️⃣2️⃣ E2E: register country selector',
      cmd: 'node',
      args: ['scripts/test-register-country.mjs'],
      optional: true,
    },
    {
      name: '1️⃣3️⃣ E2E: role-based access',
      cmd: 'node',
      args: ['scripts/test-roles.mjs'],
      optional: true,
    },
    {
      name: '1️⃣4️⃣ E2E: profile contact button',
      cmd: 'node',
      args: ['scripts/test-profile-contact.mjs'],
      optional: true,
    },
    {
      name: '1️⃣5️⃣ E2E: booking flow',
      cmd: 'node',
      args: ['scripts/test-booking-flow.mjs'],
      optional: true,
    },
  ];

  const results: { name: string; success: boolean; optional: boolean }[] = [];

  for (const step of steps) {
    console.log('\n───────────────────────────────────────────────────────────');
    console.log(`▶ ${step.name}`);
    console.log('───────────────────────────────────────────────────────────');
    const { code } = await runCommand(step.cmd, step.args);
    const success = code === 0;
    results.push({ name: step.name, success, optional: !!step.optional });

    if (!success && !step.optional) {
      console.error(`\n❌ Critical step failed: ${step.name}`);
      console.error('Stopping the test suite.');
      break;
    }
    if (!success && step.optional) {
      console.warn(`\n⚠️  Optional step failed: ${step.name}`);
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Test Suite Summary');
  console.log('═══════════════════════════════════════════════════════════');
  let passed = 0;
  let failed = 0;
  let optionalFailed = 0;
  for (const r of results) {
    const icon = r.success ? '✅' : r.optional ? '⚠️ ' : '❌';
    console.log(`${icon} ${r.name}`);
    if (r.success) passed++;
    else if (r.optional) optionalFailed++;
    else failed++;
  }
  console.log('───────────────────────────────────────────────────────────');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Optional failed: ${optionalFailed}`);

  if (failed > 0) {
    console.log('\n❌ Test suite completed with critical failures.');
    process.exit(1);
  }
  if (optionalFailed > 0) {
    console.log('\n✅ Test suite completed. Some optional E2E tests failed.');
    process.exit(0);
  }
  console.log('\n🎉 All tests passed successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
