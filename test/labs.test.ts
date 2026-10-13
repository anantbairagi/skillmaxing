import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { batchTradeoff, cacheLatency, concurrencyThroughput, latencyBudget, loadBalance, tailFanout } from "../lib/labs.ts";

describe("labs", () => {
  it("flags a blown latency budget", () => {
    assert.equal(latencyBudget([20, 30, 40, 50]).ok, true);
    assert.equal(latencyBudget([80, 80, 80, 80]).ok, false);
  });

  it("makes a higher hit rate faster", () => {
    const poor = cacheLatency(0.1, 2, 40);
    const good = cacheLatency(0.9, 2, 40);
    assert.ok(good.avg < poor.avg);
  });

  it("stops extra concurrency from adding throughput past the workers", () => {
    const full = concurrencyThroughput(4, 100, 4);
    const many = concurrencyThroughput(20, 100, 4);
    assert.equal(full.rps, many.rps);
    assert.ok(many.waiting > 0);
  });

  it("saturates when arrival passes server capacity", () => {
    const result = loadBalance(1, 50, 100);
    assert.equal(result.saturated, true);
    const fine = loadBalance(4, 10, 100);
    assert.equal(fine.saturated, false);
    assert.ok(fine.response && fine.response > 100);
  });

  it("trades batch latency against per-row cost", () => {
    const small = batchTradeoff(1, 10, 100);
    const big = batchTradeoff(32, 10, 100);
    assert.ok(big.latency > small.latency);
    assert.ok(big.perRow < small.perRow);
  });

  it("raises the expected max as fan-out grows", () => {
    assert.ok(tailFanout(8, 20, 10).expectedMax > tailFanout(1, 20, 10).expectedMax);
  });
});
