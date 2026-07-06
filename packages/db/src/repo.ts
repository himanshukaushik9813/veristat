import { and, desc, eq, gt, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import type { CatalogEntry, ComputedScore, ProbeResult, VerificationResult } from "@veristat/shared";
import { getDb } from "./client.js";
import {
  alertDeliveries,
  alertSubscriptions,
  anchors,
  apiUsage,
  attestations,
  crawlRuns,
  disputes,
  incidents,
  probes,
  scores,
  services,
  serviceSnapshots,
  verifications,
  wallets,
} from "./schema.js";

/**
 * Repository layer. Probe/verification/score rows are append-only by
 * construction: nothing here updates or deletes them (spec §5.4).
 */

// ---------- services / catalog ----------

export async function upsertService(entry: CatalogEntry): Promise<{ id: number; added: boolean; changed: boolean }> {
  const db = getDb();
  const existing = await db
    .select()
    .from(services)
    .where(and(eq(services.source, entry.source), eq(services.sourceId, entry.sourceId)))
    .limit(1);

  if (existing.length === 0) {
    const [row] = await db
      .insert(services)
      .values({
        source: entry.source,
        sourceId: entry.sourceId,
        name: entry.name,
        endpoint: entry.endpoint,
        category: entry.category,
        chain: entry.chain,
        paymentScheme: entry.paymentScheme,
        declaredPriceUsd: entry.declaredPriceUsd,
        metadata: entry.metadata,
        isSelf: entry.metadata.self === true, // Veristat's own listing → COI label (spec §9)
        lastAliveAt: new Date(),
      })
      .returning({ id: services.id });
    return { id: row!.id, added: true, changed: false };
  }

  const svc = existing[0]!;
  const changed =
    svc.endpoint !== entry.endpoint ||
    svc.declaredPriceUsd !== entry.declaredPriceUsd ||
    svc.paymentScheme !== entry.paymentScheme ||
    svc.chain !== entry.chain ||
    svc.category !== entry.category;
  await db
    .update(services)
    .set({
      name: entry.name,
      endpoint: entry.endpoint,
      declaredPriceUsd: entry.declaredPriceUsd,
      paymentScheme: entry.paymentScheme,
      chain: entry.chain,
      category: entry.category,
      status: "active",
      deadCrawlCount: 0,
      lastAliveAt: new Date(),
      metadata: entry.metadata,
    })
    .where(eq(services.id, svc.id));
  return { id: svc.id, added: false, changed };
}

/** Services from `source` not seen in this crawl get their dead counter bumped; dead across N crawls → inactive (never deleted). */
export async function markMissingServices(source: string, seenSourceIds: string[], deadThreshold = 3): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ id: services.id, sourceId: services.sourceId, deadCrawlCount: services.deadCrawlCount })
    .from(services)
    .where(and(eq(services.source, source), eq(services.status, "active")));
  let marked = 0;
  for (const row of rows) {
    if (seenSourceIds.includes(row.sourceId)) continue;
    const count = row.deadCrawlCount + 1;
    await db
      .update(services)
      .set({ deadCrawlCount: count, status: count >= deadThreshold ? "inactive" : "active" })
      .where(eq(services.id, row.id));
    if (count >= deadThreshold) marked += 1;
  }
  return marked;
}

export async function listServices(opts: { status?: string; category?: string } = {}) {
  const db = getDb();
  const conds = [];
  if (opts.status) conds.push(eq(services.status, opts.status));
  if (opts.category) conds.push(eq(services.category, opts.category));
  return db
    .select()
    .from(services)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(services.id);
}

export async function getService(id: number) {
  const db = getDb();
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return rows[0] ?? null;
}

// ---------- crawl bookkeeping ----------

export async function startCrawlRun(source: string): Promise<number> {
  const db = getDb();
  const [row] = await db.insert(crawlRuns).values({ source }).returning({ id: crawlRuns.id });
  return row!.id;
}

export async function finishCrawlRun(
  id: number,
  stats: { found: number; added: number; changed: number; markedInactive: number; error?: string },
): Promise<void> {
  const db = getDb();
  await db
    .update(crawlRuns)
    .set({ finishedAt: new Date(), ...stats, error: stats.error ?? null })
    .where(eq(crawlRuns.id, id));
}

export async function insertSnapshot(serviceId: number, crawlRunId: number, snapshot: unknown, diff: unknown | null) {
  const db = getDb();
  await db.insert(serviceSnapshots).values({ serviceId, crawlRunId, snapshot, diff });
}

// ---------- wallets ----------

export async function insertWallet(w: { address: string; chain: string; hdIndex: number }) {
  const db = getDb();
  const [row] = await db.insert(wallets).values(w).returning({ id: wallets.id });
  return row!.id;
}

export async function activeWallets(chain: string) {
  const db = getDb();
  return db.select().from(wallets).where(and(eq(wallets.chain, chain), eq(wallets.status, "active")));
}

export async function allWallets(chain: string) {
  const db = getDb();
  return db.select().from(wallets).where(eq(wallets.chain, chain));
}

export async function bumpWalletProbeCount(id: number) {
  const db = getDb();
  await db
    .update(wallets)
    .set({ probeCount: sql`${wallets.probeCount} + 1` })
    .where(eq(wallets.id, id));
}

export async function retireWallet(id: number) {
  const db = getDb();
  await db.update(wallets).set({ status: "retired", retiredAt: new Date() }).where(eq(wallets.id, id));
}

export async function markWalletFunded(id: number, txHash: string) {
  const db = getDb();
  await db.update(wallets).set({ fundedAt: new Date(), fundingTxHash: txHash }).where(eq(wallets.id, id));
}

// ---------- probes & verifications (append-only) ----------

export async function insertProbe(p: ProbeResult & { walletId?: number | null; isHoneypot?: boolean; paymentChain?: string | null }): Promise<number> {
  const db = getDb();
  const [row] = await db
    .insert(probes)
    .values({
      serviceId: p.serviceId,
      walletId: p.walletId ?? null,
      templateId: p.templateId,
      isHoneypot: p.isHoneypot ?? false,
      requestUrl: p.requestUrl,
      requestParams: p.requestParams,
      httpStatus: p.httpStatus,
      x402Status: p.x402Status,
      paymentTxHash: p.paymentTxHash,
      paymentChain: p.paymentChain ?? null,
      quotedUsd: p.quotedUsd,
      chargedUsd: p.chargedUsd,
      rawResponse: p.rawResponse,
      responseHash: p.responseHash,
      latencyMs: p.latencyMs,
      error: p.error,
      startedAt: p.startedAt,
    })
    .returning({ id: probes.id });
  return row!.id;
}

export async function insertVerification(probeId: number, serviceId: number, v: VerificationResult): Promise<number> {
  const db = getDb();
  const [row] = await db
    .insert(verifications)
    .values({
      probeId,
      serviceId,
      tier: v.tier,
      dimension: v.dimension,
      verdict: v.verdict,
      expected: v.expected ?? null,
      actual: v.actual ?? null,
      toleranceBps: v.toleranceBps,
      groundTruth: v.groundTruth,
      detail: v.detail,
      verifierVersion: v.verifierVersion,
    })
    .returning({ id: verifications.id });
  return row!.id;
}

/** Observations for scoring: verifications joined with probe latency/wallet, within a window. */
export async function observationsForService(serviceId: number, sinceDays = 30) {
  const db = getDb();
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  return db
    .select({
      dimension: verifications.dimension,
      verdict: verifications.verdict,
      tier: verifications.tier,
      createdAt: verifications.createdAt,
      latencyMs: probes.latencyMs,
      walletId: probes.walletId,
      isHoneypot: probes.isHoneypot,
    })
    .from(verifications)
    .innerJoin(probes, eq(verifications.probeId, probes.id))
    .where(and(eq(verifications.serviceId, serviceId), gte(verifications.createdAt, since)));
}

export async function appendScore(serviceId: number, s: ComputedScore): Promise<number> {
  const db = getDb();
  const [row] = await db
    .insert(scores)
    .values({
      serviceId,
      accuracy: s.dimensions.accuracy,
      reliability: s.dimensions.reliability,
      latency: s.dimensions.latency,
      integrity: s.dimensions.integrity,
      freshness: s.dimensions.freshness,
      composite: s.composite,
      grade: s.grade,
      confidence: s.confidence,
      sampleCount: s.sampleCount,
      dominantTier: s.tier,
    })
    .returning({ id: scores.id });
  return row!.id;
}

export async function latestScore(serviceId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(scores)
    .where(eq(scores.serviceId, serviceId))
    .orderBy(desc(scores.computedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function scoreHistory(serviceId: number, limit = 200) {
  const db = getDb();
  return db
    .select()
    .from(scores)
    .where(eq(scores.serviceId, serviceId))
    .orderBy(desc(scores.computedAt))
    .limit(limit);
}

export async function recentProbes(serviceId: number, limit = 20) {
  const db = getDb();
  return db
    .select()
    .from(probes)
    .where(eq(probes.serviceId, serviceId))
    .orderBy(desc(probes.createdAt))
    .limit(limit);
}

export async function verificationsForProbes(probeIds: number[]) {
  const db = getDb();
  if (probeIds.length === 0) return [];
  return db.select().from(verifications).where(inArray(verifications.probeId, probeIds));
}

/** Un-anchored verification rows (id > last anchored id). */
export async function verificationsAfter(id: number) {
  const db = getDb();
  return db.select().from(verifications).where(gt(verifications.id, id)).orderBy(verifications.id);
}

/** Verification rows covered by an anchor range, inclusive — for independent proof recomputation. */
export async function verificationsInRange(fromId: number, toId: number) {
  const db = getDb();
  return db
    .select()
    .from(verifications)
    .where(and(gte(verifications.id, fromId), lte(verifications.id, toId)))
    .orderBy(verifications.id);
}

// ---------- incidents / disputes ----------

export async function insertIncident(serviceId: number, kind: string, summary: string, probeIds: number[] = []) {
  const db = getDb();
  await db.insert(incidents).values({ serviceId, kind, summary, probeIds });
}

export async function listIncidents(serviceId: number, limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(incidents)
    .where(eq(incidents.serviceId, serviceId))
    .orderBy(desc(incidents.createdAt))
    .limit(limit);
}

export async function openDispute(serviceId: number, reason: string, contestedScoreId?: number): Promise<number> {
  const db = getDb();
  const [row] = await db
    .insert(disputes)
    .values({ serviceId, reason, contestedScoreId: contestedScoreId ?? null })
    .returning({ id: disputes.id });
  return row!.id;
}

export async function resolveDispute(id: number, status: "upheld" | "overturned", outcome: string, reprobeIds: number[]) {
  const db = getDb();
  await db
    .update(disputes)
    .set({ status, outcome, reprobeIds, resolvedAt: new Date(), publishedAt: new Date() })
    .where(eq(disputes.id, id));
}

export async function listDisputes(serviceId?: number) {
  const db = getDb();
  return db
    .select()
    .from(disputes)
    .where(serviceId ? eq(disputes.serviceId, serviceId) : undefined)
    .orderBy(desc(disputes.openedAt));
}

// ---------- attestations / anchors / api usage ----------

export async function insertAttestation(a: {
  serviceId: number;
  scoreId: number;
  chain: string;
  registryAddress: string;
  evidenceUri: string;
  response: number;
}): Promise<number> {
  const db = getDb();
  const [row] = await db.insert(attestations).values(a).returning({ id: attestations.id });
  return row!.id;
}

export async function markAttestation(id: number, fields: { txHash?: string; requestHash?: string; status: string }) {
  const db = getDb();
  await db.update(attestations).set(fields).where(eq(attestations.id, id));
}

export async function pendingAttestationForScore(scoreId: number) {
  const db = getDb();
  const rows = await db.select().from(attestations).where(eq(attestations.scoreId, scoreId)).limit(1);
  return rows[0] ?? null;
}

export async function insertAnchor(a: {
  merkleRoot: string;
  fromVerificationId: number;
  toVerificationId: number;
  leafCount: number;
  chain: string;
}): Promise<number> {
  const db = getDb();
  const [row] = await db.insert(anchors).values(a).returning({ id: anchors.id });
  return row!.id;
}

export async function markAnchor(id: number, fields: { txHash?: string; blockNumber?: number; status: string }) {
  const db = getDb();
  await db.update(anchors).set(fields).where(eq(anchors.id, id));
}

export async function lastAnchor() {
  const db = getDb();
  const rows = await db.select().from(anchors).orderBy(desc(anchors.id)).limit(1);
  return rows[0] ?? null;
}

export async function listAnchors(limit = 50) {
  const db = getDb();
  return db.select().from(anchors).orderBy(desc(anchors.id)).limit(limit);
}

export async function logApiUsage(u: {
  endpoint: string;
  payerAddress?: string | null;
  paymentTxHash?: string | null;
  priceUsd?: number | null;
  demoMode?: boolean;
}) {
  const db = getDb();
  await db.insert(apiUsage).values({
    endpoint: u.endpoint,
    payerAddress: u.payerAddress ?? null,
    paymentTxHash: u.paymentTxHash ?? null,
    priceUsd: u.priceUsd ?? null,
    demoMode: u.demoMode ?? false,
  });
}

// ---------- landing stats / activity ----------

/** Headline numbers for the landing hero — everything traceable to ledger rows. */
export async function globalStats(): Promise<{
  probes: number;
  verdicts: number;
  incidents: number;
  servicesScored: number;
  usdSpent: number;
  paymentTxs: number;
  anchoredLeaves: number;
  attestationsConfirmed: number;
}> {
  const db = getDb();
  const result = await db.execute(sql`
    select
      (select count(*) from probes) as probes,
      (select count(*) from verifications) as verdicts,
      (select count(*) from incidents) as incidents,
      (select count(distinct service_id) from scores) as services_scored,
      (select coalesce(sum(charged_usd), 0) from probes) as usd_spent,
      (select count(*) from probes where payment_tx_hash is not null) as payment_txs,
      (select coalesce(sum(leaf_count), 0) from anchors where status = 'confirmed') as anchored_leaves,
      (select count(*) from attestations where status = 'confirmed') as attestations_confirmed
  `);
  const row = (result.rows as Array<Record<string, unknown>>)[0];
  return {
    probes: Number(row?.probes ?? 0),
    verdicts: Number(row?.verdicts ?? 0),
    incidents: Number(row?.incidents ?? 0),
    servicesScored: Number(row?.services_scored ?? 0),
    usdSpent: Number(row?.usd_spent ?? 0),
    paymentTxs: Number(row?.payment_txs ?? 0),
    anchoredLeaves: Number(row?.anchored_leaves ?? 0),
    attestationsConfirmed: Number(row?.attestations_confirmed ?? 0),
  };
}

/** Recent probes with service names and verdict summaries — the live activity feed. */
export async function recentActivity(limit = 12): Promise<
  Array<{
    probeId: number;
    serviceId: number;
    serviceName: string;
    templateId: string;
    paymentTxHash: string | null;
    paymentChain: string | null;
    chargedUsd: number | null;
    latencyMs: number | null;
    startedAt: Date;
    verdicts: Array<{ dimension: string; verdict: string }>;
  }>
> {
  const db = getDb();
  const rows = await db
    .select({ probe: probes, serviceName: services.name })
    .from(probes)
    .innerJoin(services, eq(probes.serviceId, services.id))
    .orderBy(desc(probes.id))
    .limit(limit);
  const verdictRows = await verificationsForProbes(rows.map((r) => r.probe.id));
  return rows.map((r) => ({
    probeId: r.probe.id,
    serviceId: r.probe.serviceId,
    serviceName: r.serviceName,
    templateId: r.probe.templateId,
    paymentTxHash: r.probe.paymentTxHash,
    paymentChain: r.probe.paymentChain,
    chargedUsd: r.probe.chargedUsd,
    latencyMs: r.probe.latencyMs,
    startedAt: r.probe.startedAt,
    verdicts: verdictRows
      .filter((v) => v.probeId === r.probe.id)
      .map((v) => ({ dimension: v.dimension, verdict: v.verdict })),
  }));
}

// ---------- degradation alerts ----------

export async function createAlertSubscription(s: {
  webhookUrl: string;
  serviceId?: number | null;
  minScoreDrop?: number;
  notifyIncidents?: boolean;
}): Promise<number> {
  const db = getDb();
  const [row] = await db
    .insert(alertSubscriptions)
    .values({
      webhookUrl: s.webhookUrl,
      serviceId: s.serviceId ?? null,
      minScoreDrop: s.minScoreDrop ?? 5,
      notifyIncidents: s.notifyIncidents ?? true,
    })
    .returning({ id: alertSubscriptions.id });
  return row!.id;
}

/** Active subscriptions matching a service (service-specific ones plus catalog-wide ones). */
export async function subscriptionsForService(serviceId: number) {
  const db = getDb();
  return db
    .select()
    .from(alertSubscriptions)
    .where(
      and(
        eq(alertSubscriptions.active, true),
        sql`(${alertSubscriptions.serviceId} = ${serviceId} or ${alertSubscriptions.serviceId} is null)`,
      ),
    );
}

export async function insertAlertDelivery(d: {
  subscriptionId: number;
  serviceId: number;
  kind: string;
  payload: unknown;
  httpStatus?: number | null;
  status: "sent" | "failed";
}) {
  const db = getDb();
  await db.insert(alertDeliveries).values({
    subscriptionId: d.subscriptionId,
    serviceId: d.serviceId,
    kind: d.kind,
    payload: d.payload,
    httpStatus: d.httpStatus ?? null,
    status: d.status,
  });
}

// ---------- anti-gaming (spec §8) ----------

/**
 * Accuracy pass counts split by whether the probe was among the first 5 a
 * wallet ever made ("fresh") vs later ("established"). A service special-casing
 * known probe wallets shows a significant gap between the two.
 */
export async function freshVsEstablishedAccuracy(serviceId: number): Promise<{
  fresh: { pass: number; total: number };
  established: { pass: number; total: number };
}> {
  const db = getDb();
  const rows = await db.execute(sql`
    with ranked as (
      select p.id as probe_id,
             row_number() over (partition by p.wallet_id order by p.id) as nth
      from probes p
      where p.service_id = ${serviceId} and p.wallet_id is not null
    )
    select case when r.nth <= 5 then 'fresh' else 'established' end as cohort,
           count(*) filter (where v.verdict = 'pass')::int as pass,
           count(*)::int as total
    from verifications v
    join ranked r on r.probe_id = v.probe_id
    where v.service_id = ${serviceId}
      and v.dimension = 'accuracy'
      and v.verdict in ('pass', 'fail')
    group by 1
  `);
  const out = {
    fresh: { pass: 0, total: 0 },
    established: { pass: 0, total: 0 },
  };
  for (const row of rows.rows as Array<{ cohort: string; pass: number; total: number }>) {
    if (row.cohort === "fresh") out.fresh = { pass: Number(row.pass), total: Number(row.total) };
    else out.established = { pass: Number(row.pass), total: Number(row.total) };
  }
  return out;
}

export async function recentGamingIncident(serviceId: number, withinHours = 24): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - withinHours * 3_600_000);
  const rows = await db
    .select({ id: incidents.id })
    .from(incidents)
    .where(and(eq(incidents.serviceId, serviceId), eq(incidents.kind, "gaming_suspected"), gte(incidents.createdAt, since)))
    .limit(1);
  return rows.length > 0;
}

// ---------- aggregates for leaderboard/report ----------

/** Latest score per active service, for the leaderboard. */
export async function leaderboard() {
  const db = getDb();
  const svc = await db.select().from(services).where(eq(services.status, "active"));
  const out = [];
  for (const s of svc) {
    const score = await latestScore(s.id);
    out.push({ service: s, score });
  }
  return out.sort((a, b) => (b.score?.composite ?? -1) - (a.score?.composite ?? -1));
}

export async function reportAggregates() {
  const db = getDb();
  const [probeStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      settled: sql<number>`count(*) filter (where ${probes.x402Status} = 'settled')::int`,
      overcharged: sql<number>`count(*) filter (where ${probes.chargedUsd} > ${probes.quotedUsd})::int`,
      avgLatency: sql<number>`coalesce(avg(${probes.latencyMs}), 0)::float`,
      p95Latency: sql<number>`coalesce(percentile_cont(0.95) within group (order by ${probes.latencyMs}), 0)::float`,
    })
    .from(probes);
  const [verStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pass: sql<number>`count(*) filter (where ${verifications.verdict} = 'pass')::int`,
      fail: sql<number>`count(*) filter (where ${verifications.verdict} = 'fail')::int`,
      staleFails: sql<number>`count(*) filter (where ${verifications.verdict} = 'fail' and ${verifications.dimension} = 'freshness')::int`,
      accuracyFails: sql<number>`count(*) filter (where ${verifications.verdict} = 'fail' and ${verifications.dimension} = 'accuracy')::int`,
    })
    .from(verifications);
  return { probes: probeStats!, verifications: verStats! };
}
