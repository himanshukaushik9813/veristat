import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Veristat } from "./index.js";

/** Fake score API implementing /v1/resolve and /v1/score. */
let server: Server;
let baseUrl: string;

const SCORES: Record<number, unknown> = {
  1: {
    service: { id: 1, name: "Good Oracle", endpoint: "http://svc.good", category: "price", status: "active" },
    score: {
      composite: 94.2, grade: "A", confidence: 0.9, sampleCount: 40, dominantTier: 1,
      dimensions: { accuracy: 100, reliability: 95, latency: 90, integrity: 100, freshness: 96 },
      computedAt: new Date().toISOString(),
    },
    conflictOfInterest: null,
  },
  2: {
    service: { id: 2, name: "Shady Oracle", endpoint: "http://svc.shady", category: "price", status: "active" },
    score: {
      composite: 51, grade: "F", confidence: 0.85, sampleCount: 38, dominantTier: 1,
      dimensions: { accuracy: 0, reliability: 90, latency: 88, integrity: 40, freshness: 80 },
      computedAt: new Date().toISOString(),
    },
    conflictOfInterest: null,
  },
  3: {
    service: { id: 3, name: "Research Bot", endpoint: "http://svc.research", category: "generic", status: "active" },
    score: {
      composite: 88, grade: "B+", confidence: 0.7, sampleCount: 22, dominantTier: 3,
      dimensions: { accuracy: null, reliability: 92, latency: 85, integrity: 90, freshness: null },
      computedAt: new Date().toISOString(),
    },
    conflictOfInterest: null,
  },
};

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = new URL(req.url!, "http://localhost");
    res.setHeader("content-type", "application/json");
    if (url.pathname === "/v1/resolve") {
      const ep = url.searchParams.get("endpoint") ?? "";
      const entry = Object.values(SCORES).find((s) =>
        ep.startsWith((s as { service: { endpoint: string } }).service.endpoint),
      ) as { service: { id: number; endpoint: string } } | undefined;
      res.end(JSON.stringify({ services: entry ? [entry.service] : [] }));
      return;
    }
    const m = url.pathname.match(/^\/v1\/score\/(\d+)$/);
    if (m && SCORES[Number(m[1])]) {
      res.end(JSON.stringify(SCORES[Number(m[1])]));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  });
  await new Promise<void>((r) => server.listen(0, () => r()));
  const addr = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(() => server.close());

describe("Veristat.guard", () => {
  it("allows a high-scoring service", async () => {
    const v = new Veristat({ baseUrl });
    const gate = await v.guard("http://svc.good/api/price");
    expect(gate.allow).toBe(true);
    expect(gate.reason).toContain("grade A");
  });

  it("blocks a failing service with a concrete reason", async () => {
    const v = new Veristat({ baseUrl });
    const gate = await v.guard("http://svc.shady/api/price");
    expect(gate.allow).toBe(false);
    expect(gate.reason).toContain("composite 51.0 < required 70");
    expect(gate.reason).toContain("integrity 40 < required 60");
  });

  it("respects requireVerifiedAccuracy against Tier-3 services", async () => {
    const v = new Veristat({ baseUrl });
    const relaxed = await v.guard("http://svc.research/run");
    expect(relaxed.allow).toBe(true);
    const strict = await v.guard("http://svc.research/run", { requireVerifiedAccuracy: true });
    expect(strict.allow).toBe(false);
    expect(strict.reason).toContain("accuracy not verified");
  });

  it("handles unknown services per policy", async () => {
    const v = new Veristat({ baseUrl });
    const warn = await v.guard("http://svc.unknown/x");
    expect(warn.allow).toBe(false);
    expect(warn.reason).toContain("not yet audited");
    const allow = await v.guard("http://svc.unknown/x", { onUnknown: "allow" });
    expect(allow.allow).toBe(true);
  });

  it("fails closed when Veristat is unreachable (unless onUnknown=allow)", async () => {
    const v = new Veristat({ baseUrl: "http://127.0.0.1:1" });
    const gate = await v.guard("http://svc.good/api");
    expect(gate.allow).toBe(false);
    expect(gate.reason).toContain("veristat unreachable");
  });
});
