const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '50', 10);
const REQUESTS = parseInt(process.env.REQUESTS || '500', 10);

interface Endpoint {
  method: string;
  path: string;
  body?: object;
}

const ENDPOINTS: Endpoint[] = [
  { method: 'GET', path: '/api/businesses?limit=24' },
  { method: 'GET', path: '/api/marketplace?limit=24' },
  { method: 'GET', path: '/api/posts?limit=20' },
  { method: 'GET', path: '/api/categories' },
  { method: 'GET', path: '/api/search/businesses?q=صالون' },
  { method: 'GET', path: '/api/professionals?limit=20' },
  { method: 'GET', path: '/api/groups?limit=20' },
];

interface Result {
  path: string;
  status: number;
  duration: number;
  error?: string;
}

interface EndpointStats {
  count: number;
  success: number;
  total: number;
}

async function request(endpoint: Endpoint): Promise<Result> {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: endpoint.body ? { 'Content-Type': 'application/json' } : {},
      body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
    });
    const duration = Date.now() - start;
    return { path: endpoint.path, status: res.status, duration };
  } catch (e: any) {
    return { path: endpoint.path, status: 0, duration: Date.now() - start, error: e.message };
  }
}

async function worker(queue: Endpoint[], results: Result[]) {
  while (queue.length > 0) {
    const endpoint = queue.pop()!;
    const result = await request(endpoint);
    results.push(result);
  }
}

async function main() {
  const queue: Endpoint[] = [];
  for (let i = 0; i < REQUESTS; i++) {
    queue.push(ENDPOINTS[i % ENDPOINTS.length]);
  }

  const results: Result[] = [];
  const start = Date.now();
  const workers = Array.from({ length: CONCURRENCY }, () => worker(queue, results));
  await Promise.all(workers);
  const totalTime = Date.now() - start;

  const success = results.filter((r) => r.status >= 200 && r.status < 300).length;
  const failed = results.filter((r) => r.status >= 400 || r.status === 0).length;
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const min = durations[0];
  const max = durations[durations.length - 1];
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];
  const rps = ((REQUESTS / totalTime) * 1000).toFixed(1);

  console.log('📊 Load Test Results');
  console.log('====================');
  console.log(`Concurrency   : ${CONCURRENCY}`);
  console.log(`Total requests: ${REQUESTS}`);
  console.log(`Successful    : ${success}`);
  console.log(`Failed        : ${failed}`);
  console.log(`Total time    : ${totalTime}ms`);
  console.log(`RPS           : ${rps}`);
  console.log(`Min latency   : ${min}ms`);
  console.log(`Avg latency   : ${Math.round(avg)}ms`);
  console.log(`P50 latency   : ${p50}ms`);
  console.log(`P95 latency   : ${p95}ms`);
  console.log(`P99 latency   : ${p99}ms`);
  console.log(`Max latency   : ${max}ms`);

  // Per-endpoint summary
  const byEndpoint = new Map<string, EndpointStats>();
  for (const r of results) {
    const prev = byEndpoint.get(r.path) || { count: 0, success: 0, total: 0 };
    prev.count++;
    if (r.status >= 200 && r.status < 300) prev.success++;
    prev.total += r.duration;
    byEndpoint.set(r.path, prev);
  }
  console.log('\nPer endpoint:');
  for (const [path, stats] of byEndpoint.entries()) {
    console.log(
      `${path.padEnd(45)} success ${stats.success}/${stats.count} avg ${Math.round(
        (stats as any).total / stats.count
      )}ms`
    );
  }

  if (failed > 0) {
    console.log('\n❌ Sample failures:');
    results
      .filter((r) => r.status >= 400 || r.status === 0)
      .slice(0, 20)
      .forEach((r) => console.log(`${r.path} status=${r.status} error=${r.error || ''}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
