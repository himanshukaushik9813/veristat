import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createLogger, evaluateGuardPolicy } from "@veristat/shared";
import {
  createAlertSubscription,
  getService,
  latestScore,
  leaderboard,
  listIncidents,
  recentProbes,
  runMigrations,
  scoreHistory,
  verificationsForProbes,
} from "@veristat/db";
import { paid } from "./paywall.js";

/**
 * The pre-purchase score API (spec §4.2): a paid x402 endpoint an agent calls
 * before spending money on an unknown service. Veristat lists this endpoint
 * as an ASP on OKX.AI — a rated, paid agent service that rates paid agent
 * services — and it appears on its own leaderboard with a COI label (§9).
 */
const log = createLogger("score-api");
const PORT = Number(process.env.SCORE_API_PORT ?? 4020);

const PRICE_SCORE = Number(process.env.PRICE_SCORE_USD ?? 0.001);
const PRICE_CATEGORY = Number(process.env.PRICE_CATEGORY_USD ?? 0.002);
const PRICE_EVIDENCE = Number(process.env.PRICE_EVIDENCE_USD ?? 0.005);

const app = express();

function scorePayload(score: NonNullable<Awaited<ReturnType<typeof latestScore>>>) {
  return {
    composite: score.composite,
    grade: score.grade,
    confidence: score.confidence,
    sampleCount: score.sampleCount,
    dominantTier: score.dominantTier,
    dimensions: {
      accuracy: score.accuracy, // null = "accuracy not verified" (Tier 3) — never fabricated
      reliability: score.reliability,
      latency: score.latency,
      integrity: score.integrity,
      freshness: score.freshness,
    },
    computedAt: score.computedAt,
  };
}

// ---- paid endpoints ----

app.get("/v1/score/:serviceId", paid(PRICE_SCORE), async (req, res) => {
  const service = await getService(Number(req.params.serviceId));
  if (!service) {
    res.status(404).json({ error: "unknown service" });
    return;
  }
  const score = await latestScore(service.id);
  res.json({
    service: { id: service.id, name: service.name, endpoint: service.endpoint, category: service.category, status: service.status },
    score: score ? scorePayload(score) : null,
    conflictOfInterest: service.isSelf ? "this is Veristat's own listing, scored by the same methodology" : null,
  });
});

app.get("/v1/category/:category", paid(PRICE_CATEGORY), async (req, res) => {
  const rows = await leaderboard();
  const filtered = rows.filter((r) => r.service.category === req.params.category);
  res.json({
    category: req.params.category,
    services: filtered.map((r) => ({
      id: r.service.id,
      name: r.service.name,
      endpoint: r.service.endpoint,
      score: r.score ? scorePayload(r.score) : null,
    })),
  });
});

app.get("/v1/evidence/:serviceId", paid(PRICE_EVIDENCE), async (req, res) => {
  const service = await getService(Number(req.params.serviceId));
  if (!service) {
    res.status(404).json({ error: "unknown service" });
    return;
  }
  const [score, history, probes, incidents] = await Promise.all([
    latestScore(service.id),
    scoreHistory(service.id, 100),
    recentProbes(service.id, 20),
    listIncidents(service.id, 50),
  ]);
  const verifications = await verificationsForProbes(probes.map((p) => p.id));
  res.json({
    service: { id: service.id, name: service.name, endpoint: service.endpoint, category: service.category },
    score: score ? scorePayload(score) : null,
    scoreHistory: history.map((h) => ({ composite: h.composite, computedAt: h.computedAt })),
    incidents,
    evidence: probes.map((p) => ({
      probeId: p.id,
      templateId: p.templateId,
      requestUrl: p.requestUrl,
      paymentTxHash: p.paymentTxHash,
      quotedUsd: p.quotedUsd,
      chargedUsd: p.chargedUsd,
      latencyMs: p.latencyMs,
      responseHash: p.responseHash,
      startedAt: p.startedAt,
      verdicts: verifications
        .filter((v) => v.probeId === p.id)
        .map((v) => ({
          tier: v.tier,
          dimension: v.dimension,
          verdict: v.verdict,
          expected: v.expected,
          actual: v.actual,
          groundTruth: v.groundTruth,
          detail: v.detail,
        })),
    })),
  });
});

/** Probe-able echo endpoint so Veristat's own listing is scored like any other ASP (spec §9). */
app.get("/v1/query", paid(PRICE_SCORE), (req, res) => {
  res.json({ value: { echo: req.query.nonce ?? null }, timestamp: Math.floor(Date.now() / 1000) });
});

// ---- free endpoints ----

/** Resolve a service endpoint URL to Veristat catalog entries (free — the score itself is paid). */
app.get("/v1/resolve", async (req, res) => {
  const endpoint = String(req.query.endpoint ?? "");
  if (!endpoint) {
    res.status(400).json({ error: "endpoint query param required" });
    return;
  }
  const all = await leaderboard();
  const norm = (u: string) => u.replace(/\/+$/, "").toLowerCase();
  const matches = all.filter(
    (r) => norm(r.service.endpoint) === norm(endpoint) || norm(endpoint).startsWith(norm(r.service.endpoint)),
  );
  res.json({
    services: matches.map((r) => ({
      id: r.service.id,
      name: r.service.name,
      endpoint: r.service.endpoint,
      category: r.service.category,
    })),
  });
});

/**
 * Free pre-purchase gate (spec §4.2): the go/no-go decision itself is free so an
 * agent can cheaply decide whether to pay a service; the detailed score and
 * evidence behind it stay paid. Same policy the @veristat/sdk `guard()` runs.
 * Query: ?serviceId= | ?endpoint= (+ minScore, minIntegrity, minConfidence,
 * requireVerifiedAccuracy).
 */
app.get("/v1/guard", async (req, res) => {
  const q = req.query;
  let service: Awaited<ReturnType<typeof getService>> | undefined;
  if (q.serviceId != null) {
    service = await getService(Number(q.serviceId));
  } else if (q.endpoint != null) {
    const norm = (u: string) => u.replace(/\/+$/, "").toLowerCase();
    const ep = norm(String(q.endpoint));
    const all = await leaderboard();
    const match = all.find((r) => norm(r.service.endpoint) === ep || ep.startsWith(norm(r.service.endpoint)));
    service = match?.service;
  } else {
    res.status(400).json({ error: "serviceId or endpoint query param required" });
    return;
  }
  if (!service) {
    res.json({ allow: false, reason: "service not yet audited by Veristat — no verified track record exists", service: null, score: null });
    return;
  }
  const score = await latestScore(service.id);
  if (!score) {
    res.json({
      allow: false,
      reason: "service not yet audited by Veristat — no verified track record exists",
      service: { id: service.id, name: service.name, endpoint: service.endpoint },
      score: null,
    });
    return;
  }
  const policy = {
    minScore: q.minScore != null ? Number(q.minScore) : undefined,
    minConfidence: q.minConfidence != null ? Number(q.minConfidence) : undefined,
    minIntegrity: q.minIntegrity != null ? Number(q.minIntegrity) : undefined,
    requireVerifiedAccuracy: q.requireVerifiedAccuracy === "true",
  };
  const decision = evaluateGuardPolicy(
    {
      composite: score.composite,
      confidence: score.confidence,
      integrity: score.integrity,
      accuracyVerified: score.accuracy !== null,
      grade: score.grade,
      sampleCount: score.sampleCount,
    },
    policy,
  );
  res.json({
    allow: decision.allow,
    reason: decision.reason,
    failures: decision.failures,
    service: { id: service.id, name: service.name, endpoint: service.endpoint, category: service.category },
    score: { composite: score.composite, grade: score.grade, confidence: score.confidence, integrity: score.integrity, sampleCount: score.sampleCount },
    policy: { minScore: policy.minScore ?? 70, minConfidence: policy.minConfidence ?? 0.3, minIntegrity: policy.minIntegrity ?? 60, requireVerifiedAccuracy: policy.requireVerifiedAccuracy },
  });
});

/**
 * Degradation alerts (free): register a webhook that fires when a service's
 * verified score drops, its grade changes, or an incident is recorded.
 * Body: { webhookUrl, serviceId?, minScoreDrop?, notifyIncidents? }
 */
app.post("/v1/alerts/subscribe", express.json(), async (req, res) => {
  const { webhookUrl, serviceId, minScoreDrop, notifyIncidents } = req.body ?? {};
  let parsed: URL;
  try {
    parsed = new URL(String(webhookUrl));
  } catch {
    res.status(400).json({ error: "webhookUrl must be a valid URL" });
    return;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    res.status(400).json({ error: "webhookUrl must be http(s)" });
    return;
  }
  if (serviceId != null) {
    const service = await getService(Number(serviceId));
    if (!service) {
      res.status(404).json({ error: "unknown service" });
      return;
    }
  }
  const id = await createAlertSubscription({
    webhookUrl: parsed.toString(),
    serviceId: serviceId != null ? Number(serviceId) : null,
    minScoreDrop: minScoreDrop != null ? Number(minScoreDrop) : undefined,
    notifyIncidents: notifyIncidents != null ? Boolean(notifyIncidents) : undefined,
  });
  res.status(201).json({
    subscriptionId: id,
    scope: serviceId != null ? `service ${serviceId}` : "all services",
    events: ["score_drop", "grade_change", ...(notifyIncidents === false ? [] : ["incident"])],
  });
});

app.get("/v1/methodology", async (_req, res) => {
  try {
    const md = await readFile(path.resolve(process.cwd(), "../../docs/methodology.md"), "utf8");
    res.type("text/markdown").send(md);
  } catch {
    res.status(404).json({ error: "methodology not found" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, demoMode: process.env.DEMO_MODE === "true" });
});

/** OKX.AI ASP-style service manifest so the endpoint is easy to list. */
app.get("/.well-known/veristat.json", (_req, res) => {
  res.json({
    name: "Veristat Score API",
    description: "Pre-purchase verified track record for paid agent services. Pays-per-call via x402.",
    endpoints: [
      { path: "/v1/score/:serviceId", priceUsd: PRICE_SCORE, description: "single-service score" },
      { path: "/v1/category/:category", priceUsd: PRICE_CATEGORY, description: "ranked category comparison" },
      { path: "/v1/evidence/:serviceId", priceUsd: PRICE_EVIDENCE, description: "full evidence report" },
    ],
    paymentScheme: "x402 exact",
    neutralityPolicy: "providers can never pay to change a score",
  });
});

async function main(): Promise<void> {
  await runMigrations();
  app.listen(PORT, () => log.info("score API listening", { port: PORT, demoMode: process.env.DEMO_MODE === "true" }));
}

main().catch((err) => {
  log.error("fatal", { err: String(err) });
  process.exit(1);
});
