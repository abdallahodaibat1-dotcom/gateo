import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.join(__dirname, '../../playwright/.auth');
const userAuthFile = path.join(authDir, 'user.json');
const adminAuthFile = path.join(authDir, 'admin.json');

interface CookieJar {
  [name: string]: string;
}

async function login(baseURL: string, email: string, password: string, provider: string) {
  const jar: CookieJar = {};

  // 1. Fetch CSRF token
  const csrfRes = await fetch(`${baseURL}/api/auth/csrf`);
  const csrfData = (await csrfRes.json()) as { csrfToken: string };
  collectCookies(csrfRes.headers, jar);

  // 2. Submit credentials to NextAuth callback
  const body: Record<string, string> = {
    emailOrPhone: email,
    password,
    csrfToken: csrfData.csrfToken,
    callbackUrl: '/',
  };

  if (provider === 'admin-credentials') {
    body.email = email;
    delete body.emailOrPhone;
  }

  const loginRes = await fetch(`${baseURL}/api/auth/callback/${provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieString(jar),
    },
    body: new URLSearchParams(body),
    redirect: 'manual',
  });

  collectCookies(loginRes.headers, jar);
  return jar;
}

function collectCookies(headers: Headers, jar: CookieJar) {
  const rawCookies = headers.getSetCookie?.() || [];
  for (const raw of rawCookies) {
    const [nameValue] = raw.split(';');
    const [name, ...valueParts] = nameValue.split('=');
    if (name) {
      jar[name.trim()] = valueParts.join('=').trim();
    }
  }
}

function cookieString(jar: CookieJar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

function toStorageState(jar: CookieJar) {
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: 'localhost',
    path: '/',
    httpOnly: name.includes('session') || name.includes('csrf'),
    sameSite: 'Lax' as const,
  }));
  return { cookies, origins: [] as any[] };
}

setup('authenticate regular user', async ({ baseURL }) => {
  fs.mkdirSync(authDir, { recursive: true });
  const email = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
  const password = process.env.TEST_PASSWORD || 'demo123';
  const jar = await login(baseURL!, email, password, 'credentials');
  fs.writeFileSync(userAuthFile, JSON.stringify(toStorageState(jar), null, 2));
});

setup('authenticate admin', async ({ baseURL }) => {
  fs.mkdirSync(authDir, { recursive: true });
  const jar = await login(baseURL!, 'admin@gateo.com', 'admin123', 'admin-credentials');
  fs.writeFileSync(adminAuthFile, JSON.stringify(toStorageState(jar), null, 2));
});
