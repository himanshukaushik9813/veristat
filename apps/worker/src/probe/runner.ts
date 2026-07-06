import { createHash } from "node:crypto";
import { createLogger, computeScore, type ChainKey, type ServiceCategory } from "@veristat/shared";
import { payAndFetch } from "@veristat/chain";
import {
  appendScore,
  getService,
  insertIncident,
  insertProbe,
  insertVerification,
  latestScore,
  observationsForService,
} from "@veristat/db";
import { fireAlerts } from "../alerts/notifier.js";
import { verifyProbe } from "../verify/engine.js";
import { liveReader } from "../verify/reader.js";
import { HONEYPOTS, HONEYPOT_RATE, TEMPLATES_BY_CATEGORY } from "../verify/templates.js";
import type { ProbeOutcome, QueryTemplate } from "../verify/types.js";
import { drawWallet, recordWalletUse } from "./walletPool.js";
import { recordSpend, remainingBudget } from "./budget.js";

const log = createLogger("prober");

export interface ServiceRow {
  id: number;
  name: string;
  endpoint: string;
  category: string;
  chain: string;
  declaredPriceUsd: number | null;
}

function pickTemplate(category: ServiceCategory): QueryTemplate | null {
  const honeypots = HONEYPOTS.filter((h) => h.category === category);
  if (honeypots.length > 0 && Math.random() < HONEYPOT_RATE) {
    return honeypots[Math.floor(Math.random() * honeypots.length)]!;
  }
  const templates = TEMPLATES_BY_CATEGORY[category] ?? [];
  if (templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)]!;
}

/**
 * One full probe: pick template → pay via x402 → capture everything into the
 * evidence ledger → verify → append verdicts → recompute the service's score.
 */
export async function probeService(service: ServiceRow): Promise<{ probeId: number; verdictSummary: string } | null> {
  const chain = service.chain as ChainKey;
  const category = service.category as ServiceCategory;
  const template = pickTemplate(category);
  if (!template) {
    log.warn("no template for category", { service: service.name, category });
    return null;
  }

  const maxUsd = remainingBudget(service.id);
  if (maxUsd <= 0) {
    log.info("budget exhausted for service today", { service: service.name });
    return null;
  }

  const built = await template.build(chain, liveReader);
  const url = service.endpoint.replace(/\/$/, "") + built.path;
  const wallet = await drawWallet(chain);
  const startedAt = new Date();
  const t0 = performance.now();

  let outcome: ProbeOutcome;
  let paymentTxHash: string | null = null;
  let paymentChain: string | null = null;
  try {
    const paid = await payAndFetch(url, { account: wallet.account, maxUsd, timeoutMs: 30_000 });
    const raw = await paid.response.text().catch(() => null);
    paymentTxHash = paid.paymentTxHash;
    paymentChain = paid.paymentChain;
    outcome = {
      httpStatus: paid.response.status,
      x402Status: paid.x402Status,
      declaredUsd: service.declaredPriceUsd,
      quotedUsd: paid.quotedUsd,
      chargedUsd: paid.chargedUsd,
      rawResponse: raw,
      latencyMs: Math.round(performance.now() - t0),
      error: null,
    };
    if (paid.chargedUsd) recordSpend(service.id, paid.chargedUsd);
  } catch (err) {
    outcome = {
      httpStatus: null,
      x402Status: "error",
      declaredUsd: service.declaredPriceUsd,
      quotedUsd: null,
      chargedUsd: null,
      rawResponse: null,
      latencyMs: Math.round(performance.now() - t0),
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const probeId = await insertProbe({
    serviceId: service.id,
    walletId: wallet.id,
    templateId: template.id,
    isHoneypot: template.isHoneypot,
    requestUrl: url,
    requestParams: built.params,
    httpStatus: outcome.httpStatus,
    x402Status: outcome.x402Status as never,
    paymentTxHash,
    paymentChain,
    quotedUsd: outcome.quotedUsd,
    chargedUsd: outcome.chargedUsd,
    rawResponse: outcome.rawResponse,
    responseHash: outcome.rawResponse
      ? createHash("sha256").update(outcome.rawResponse).digest("hex")
      : null,
    latencyMs: outcome.latencyMs,
    error: outcome.error,
    startedAt,
    walletAddress: wallet.account.address,
  } as never);
  await recordWalletUse(wallet.id);

  const results = await verifyProbe(template, chain, liveReader, built, outcome);
  for (const v of results) {
    await insertVerification(probeId, service.id, v);
  }

  // Incidents: factual, evidence-linked records of failures (spec §9).
  for (const v of results) {
    if (v.verdict !== "fail") continue;
    const kindByDimension: Record<string, string> = {
      accuracy: template.isHoneypot ? "honeypot_failure" : "wrong_answer",
      freshness: "stale_data",
      integrity: "overcharge",
      reliability: "settlement_failure",
    };
    const kind = kindByDimension[v.dimension];
    if (kind) {
      await insertIncident(service.id, kind, v.detail, [probeId]);
      await fireAlerts({
        kind: "incident",
        service: { id: service.id, name: service.name },
        incidentKind: kind,
        summary: v.detail,
        probeIds: [probeId],
      });
    }
  }

  await recomputeScore(service.id, category);

  const summary = results.map((r) => `${r.dimension}:${r.verdict}`).join(" ");
  log.info("probe complete", {
    service: service.name,
    template: template.id,
    tx: paymentTxHash,
    verdicts: summary,
  });
  return { probeId, verdictSummary: summary };
}

export async function recomputeScore(serviceId: number, category: ServiceCategory): Promise<void> {
  const rows = await observationsForService(serviceId);
  if (rows.length === 0) return;
  const now = Date.now();
  const observations = rows.map((r) => ({
    dimension: r.dimension as never,
    verdict: r.verdict as never,
    tier: r.tier as never,
    latencyMs: r.dimension === "latency" ? r.latencyMs : undefined,
    ageDays: (now - new Date(r.createdAt).getTime()) / 86_400_000,
  }));
  const prev = await latestScore(serviceId);
  const score = computeScore(observations, category);
  await appendScore(serviceId, score);

  // Degradation alert: composite dropped meaningfully or the grade slipped.
  if (prev && (prev.composite - score.composite >= 1 || prev.grade !== score.grade)) {
    const drop = prev.composite - score.composite;
    if (drop > 0) {
      const service = await getService(serviceId);
      await fireAlerts({
        kind: prev.grade !== score.grade ? "grade_change" : "score_drop",
        service: { id: serviceId, name: service?.name ?? `service ${serviceId}` },
        previous: { composite: prev.composite, grade: prev.grade },
        current: { composite: score.composite, grade: score.grade },
        drop,
      });
    }
  }
}
