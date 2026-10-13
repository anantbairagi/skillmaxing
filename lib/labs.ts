export type LabSpec = {
  slug: string;
  number: string;
  level: "easy" | "medium" | "hard";
  topic: "Latency" | "Caching" | "Concurrency" | "Scaling" | "Throughput";
  title: string;
  dek: string;
};

export const labs: LabSpec[] = [
  { slug: "latency-budget", number: "01", level: "easy", topic: "Latency", title: "Spend a latency budget", dek: "Move the pieces of a request and watch the budget blow." },
  { slug: "cache-hit-rate", number: "02", level: "easy", topic: "Caching", title: "The cache that has to be good", dek: "A cache only helps if it hits. Find the rate where it starts to matter." },
  { slug: "concurrency-vs-threads", number: "03", level: "medium", topic: "Concurrency", title: "Waiting is not working", dek: "One process, many waits. Watch throughput move with concurrency." },
  { slug: "load-balancer-fanout", number: "04", level: "medium", topic: "Scaling", title: "One address, many servers", dek: "Add servers and watch where the queue actually forms." },
  { slug: "batching-tradeoff", number: "05", level: "hard", topic: "Throughput", title: "Batch size is a latency choice", dek: "Bigger batches cost less per row and more per request." },
  { slug: "tail-latency", number: "06", level: "hard", topic: "Latency", title: "The slowest of many", dek: "Fan out to enough services and the tail becomes the average." },
];

export const BUDGET_MS = 200;

export function latencyBudget(parts: number[]) {
  const total = parts.reduce((sum, part) => sum + part, 0);
  return { total, over: total - BUDGET_MS, ok: total <= BUDGET_MS };
}

export function cacheLatency(hitRate: number, hitMs = 2, missMs = 40) {
  const rate = clamp(hitRate, 0, 1);
  const avg = rate * hitMs + (1 - rate) * missMs;
  return { avg, speedup: missMs / avg, saved: missMs - avg };
}

export function concurrencyThroughput(concurrency: number, workMs: number, workers: number) {
  const busy = Math.min(concurrency, workers);
  const rps = busy / (workMs / 1000);
  return { rps, util: busy / workers, waiting: Math.max(0, concurrency - workers) };
}

export function loadBalance(servers: number, arrivalRps: number, serviceMs: number) {
  const capacity = servers / (serviceMs / 1000);
  const util = arrivalRps / capacity;
  const saturated = util >= 0.98;
  const response = saturated ? null : serviceMs / (1 - util);
  return { capacity, util, saturated, response };
}

export function batchTradeoff(batch: number, startupMs: number, rowUs: number) {
  const latency = startupMs + (batch * rowUs) / 1000;
  return { latency, perRow: latency / batch };
}

export function tailFanout(fanout: number, baseMs: number, sigma: number) {
  const n = Math.max(1, fanout);
  const expectedMax = baseMs + sigma * Math.sqrt(2 * Math.log(n));
  return { expectedMax, penalty: expectedMax - baseMs };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
