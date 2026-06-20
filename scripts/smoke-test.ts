import { prisma } from '../src/lib/db';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
const TEST_USER_PASSWORD = process.env.TEST_PASSWORD || 'demo123';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  error?: string;
  durationMs: number;
}

class CookieJar {
  private cookies = new Map<string, string>();

  setFromHeaders(headers: Headers) {
    const setCookie = headers.getSetCookie?.() || (headers.get('set-cookie') ? [headers.get('set-cookie')!] : []);
    for (const raw of setCookie) {
      const [nameValue] = raw.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) this.cookies.set(name.trim(), value.trim());
    }
  }

  getCookieString(): string {
    return Array.from(this.cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

const results: TestResult[] = [];

async function request(
  name: string,
  path: string,
  options: RequestInit = {},
  jar?: CookieJar,
  expectedStatus: number = 200
): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (jar) {
    const cookie = jar.getCookieString();
    if (cookie) headers['Cookie'] = cookie;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (jar) jar.setFromHeaders(res.headers);
    const duration = Date.now() - start;
    const body = await res.text();
    let json: any;
    try {
      json = JSON.parse(body);
    } catch {
      json = body.slice(0, 200);
    }

    if (res.status === expectedStatus) {
      results.push({ name, status: 'PASS', statusCode: res.status, durationMs: duration });
    } else {
      results.push({
        name,
        status: 'FAIL',
        statusCode: res.status,
        error: typeof json === 'string' ? json : JSON.stringify(json.error || json).slice(0, 200),
        durationMs: duration,
      });
    }
    return json;
  } catch (e: any) {
    results.push({ name, status: 'FAIL', error: e.message, durationMs: Date.now() - start });
    return null;
  }
}

async function login(jar: CookieJar, email: string, password: string, provider = 'credentials'): Promise<boolean> {
  const csrf = await request('Auth: get CSRF', '/api/auth/csrf', {}, jar);
  if (!csrf?.csrfToken) return false;

  const body: Record<string, string> = {
    emailOrPhone: email,
    password,
    csrfToken: csrf.csrfToken,
    callbackUrl: '/',
  };
  if (provider === 'admin-credentials') {
    body.email = email;
    delete body.emailOrPhone;
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: jar.getCookieString() },
    body: new URLSearchParams(body),
    redirect: 'manual',
  });
  jar.setFromHeaders(loginRes.headers);
  const text = await loginRes.text();
  const ok = loginRes.status === 302 && !text.includes('error');
  results.push({
    name: provider === 'admin-credentials' ? 'Admin: NextAuth login' : 'Auth: credentials login',
    status: ok ? 'PASS' : 'FAIL',
    statusCode: loginRes.status,
    error: ok ? undefined : `Login failed: ${text.slice(0, 200)}`,
    durationMs: 0,
  });
  return ok;
}

async function main() {
  console.log('🧪 Starting smoke tests...\n');

  const jar = new CookieJar();

  // Public endpoints
  await request('Public: health', '/api/health');
  await request('Public: home stats', '/api/stats/home');
  await request('Public: categories', '/api/categories');
  await request('Public: categories with subs', '/api/categories?withSubs=true');
  await request('Public: businesses', '/api/businesses');
  await request('Public: marketplace', '/api/marketplace');
  await request('Public: posts', '/api/posts');
  await request('Public: trending', '/api/trending');
  await request('Public: leaderboard', '/api/leaderboard');
  await request('Public: user suggestions', '/api/users/suggestions');
  await request('Public: search suggestions', '/api/search/suggestions?q=test');
  await request('Public: groups', '/api/groups');
  await request('Public: professionals', '/api/professionals');
  await request('Public: ladies gate categories', '/api/categories?ladiesGate=true');
  await request('Public: search businesses', '/api/search/businesses?q=صالون');
  await request('Public: search users', '/api/search/users?q=user');
  await request('Public: search posts', '/api/search/posts?q=test');

  // Entity detail endpoints (need valid IDs)
  const business = await prisma.business.findFirst({ where: { slug: { startsWith: 'rt-' } } });
  if (business) {
    await request('Public: business detail', `/api/businesses/${business.id}`);
    await request('Public: business reviews', `/api/businesses/${business.id}/reviews`);
    await request('Public: business services', `/api/businesses/${business.id}/services`);
    // Business products endpoint is dashboard-only (requires owner/admin)
    results.push({ name: 'Public: business products', status: 'SKIP', durationMs: 0 });
  } else {
    results.push({ name: 'Public: business detail', status: 'SKIP', durationMs: 0 });
  }

  const listing = await prisma.marketplaceListing.findFirst({
    where: { Product: { name: { startsWith: 'RT-' } } },
    include: { Product: true },
  });
  if (listing) {
    await request('Public: marketplace item', `/api/marketplace/${listing.id}`);
  } else {
    results.push({ name: 'Public: marketplace item', status: 'SKIP', durationMs: 0 });
  }

  const category = await prisma.category.findFirst();
  if (category) {
    await request('Public: category businesses', `/api/categories/${category.id}/businesses`);
  } else {
    results.push({ name: 'Public: category businesses', status: 'SKIP', durationMs: 0 });
  }

  // Authenticated tests
  const loggedIn = await login(jar, TEST_USER_EMAIL, TEST_USER_PASSWORD);
  if (!loggedIn) {
    console.error('❌ Could not log in; skipping authenticated tests');
  } else {
    await request('Auth: account/me', '/api/account/me', {}, jar);
    await request('Auth: notifications', '/api/notifications', {}, jar);
    await request('Auth: conversations', '/api/conversations', {}, jar);
    await request('Auth: my bookings', '/api/bookings', {}, jar);
    await request('Auth: saved posts', '/api/saved-posts', {}, jar);
    await request('Auth: groups my', '/api/groups/my', {}, jar);

    // Business products for owned business
    const ownedBusiness = await prisma.business.findFirst({
      where: { User: { email: TEST_USER_EMAIL } },
    });
    if (ownedBusiness) {
      await request('Auth: business products (owner)', `/api/businesses/${ownedBusiness.id}/products`, {}, jar);
    }

    // Create a post
    const newPost = await request(
      'Auth: create post',
      '/api/posts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Smoke test post from realistic environment' }),
      },
      jar,
      201
    );

    if (newPost?.post?.id) {
      await request('Auth: like post', `/api/posts/${newPost.post.id}/like`, { method: 'POST' }, jar, 200);
      await request(
        'Auth: comment post',
        `/api/posts/${newPost.post.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: 'Smoke test comment' }),
        },
        jar,
        201
      );
    }

    // Follow a user
    const targetUser = await prisma.user.findFirst({
      where: { email: { endsWith: '@realistic.gateo.com' }, NOT: { email: TEST_USER_EMAIL } },
    });
    if (targetUser) {
      await request('Auth: follow user', `/api/users/${targetUser.id}/follow`, { method: 'POST' }, jar);
    }

    // Create a group
    await request(
      'Auth: create group',
      '/api/groups',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'RT Smoke Test Group', description: 'Group created during smoke test', isPublic: true }),
      },
      jar,
      201
    );

    // Create a booking
    const bookableService = await prisma.service.findFirst({ where: { name: { startsWith: 'RT-' } } });
    if (bookableService) {
      await request(
        'Auth: create booking',
        '/api/bookings',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: bookableService.businessId,
            serviceId: bookableService.id,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            time: '10:00',
            notes: 'Smoke test booking',
          }),
        },
        jar,
        201
      );
    }

    // Create a review on a business not yet reviewed by this user
    const testUser = await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
    const reviewedBusinessIds = testUser
      ? new Set((await prisma.review.findMany({ where: { userId: testUser.id }, select: { businessId: true } })).map((r) => r.businessId))
      : new Set<string>();
    const reviewableBusiness = await prisma.business.findFirst({
      where: { slug: { startsWith: 'rt-' }, NOT: { id: { in: Array.from(reviewedBusinessIds) } } },
    });
    if (reviewableBusiness) {
      await request(
        'Auth: create review',
        `/api/businesses/${reviewableBusiness.id}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: 5, comment: 'Smoke test review' }),
        },
        jar,
        201
      );
    }

    // Start a conversation
    if (targetUser) {
      await request(
        'Auth: create conversation',
        '/api/conversations',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantIds: [targetUser.id], initialMessage: 'Hello from smoke test' }),
        },
        jar,
        201
      );
    }
  }

  // Admin endpoints (via NextAuth admin-credentials provider)
  const adminJar = new CookieJar();
  const adminLoggedIn = await login(adminJar, 'admin@gateo.com', 'admin123', 'admin-credentials');
  if (adminLoggedIn) {
    await request('Admin: dashboard', '/api/admin/dashboard', {}, adminJar);
    await request('Admin: users', '/api/admin/users', {}, adminJar);
    await request('Admin: businesses', '/api/admin/businesses', {}, adminJar);
    await request('Admin: bookings', '/api/admin/bookings', {}, adminJar);
    await request('Admin: posts', '/api/admin/posts', {}, adminJar);
    await request('Admin: reviews', '/api/admin/reviews', {}, adminJar);
    await request('Admin: audit logs', '/api/admin/audit-logs', {}, adminJar);
  } else {
    results.push({ name: 'Admin: dashboard', status: 'SKIP', durationMs: 0 });
  }

  // Legacy admin login endpoint (also tests audit logging)
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gateo.com', password: 'admin123' }),
    });
    const adminLoginBody = await adminLoginRes.text();
    results.push({
      name: 'Admin: legacy login',
      status: adminLoginRes.status === 200 ? 'PASS' : 'FAIL',
      statusCode: adminLoginRes.status,
      error: adminLoginRes.status === 200 ? undefined : adminLoginBody.slice(0, 200),
      durationMs: 0,
    });
  } else {
    results.push({ name: 'Admin: legacy login', status: 'SKIP', durationMs: 0 });
  }

  // Report
  console.log('\n📊 Smoke Test Results\n' + '='.repeat(60));
  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const skip = results.filter((r) => r.status === 'SKIP').length;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
    const detail = r.status === 'FAIL' ? ` (${r.statusCode}) ${r.error || ''}` : ` (${r.durationMs}ms)`;
    console.log(`${icon} ${r.name}${detail}`);
  }

  console.log('='.repeat(60));
  console.log(`Total: ${results.length} | ✅ Pass: ${pass} | ❌ Fail: ${fail} | ⏭️ Skip: ${skip}`);

  if (fail > 0) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
