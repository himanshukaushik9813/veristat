import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * The evidence ledger (spec §5.4). Probe/verification rows are append-only:
 * the repository layer exposes no update/delete for them, and every published
 * score must trace back to rows here plus an on-chain payment tx.
 */

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(), // okx_asp | bazaar | x402scan | curated | demo
    sourceId: text("source_id").notNull(),
    name: text("name").notNull(),
    endpoint: text("endpoint").notNull(),
    category: text("category").notNull(),
    chain: text("chain").notNull(),
    paymentScheme: text("payment_scheme").notNull(),
    declaredPriceUsd: doublePrecision("declared_price_usd"),
    status: text("status").notNull().default("active"), // active | inactive | dead
    isSelf: boolean("is_self").notNull().default(false), // Veristat's own listing → COI label
    metadata: jsonb("metadata").notNull().default({}),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastAliveAt: timestamp("last_alive_at", { withTimezone: true }),
    deadCrawlCount: integer("dead_crawl_count").notNull().default(0),
  },
  (t) => [uniqueIndex("services_source_key").on(t.source, t.sourceId)],
);

export const crawlRuns = pgTable("crawl_runs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  found: integer("found").notNull().default(0),
  added: integer("added").notNull().default(0),
  changed: integer("changed").notNull().default(0),
  markedInactive: integer("marked_inactive").notNull().default(0),
  error: text("error"),
});

export const serviceSnapshots = pgTable(
  "service_snapshots",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull().references(() => services.id),
    crawlRunId: integer("crawl_run_id").notNull().references(() => crawlRuns.id),
    snapshot: jsonb("snapshot").notNull(),
    diff: jsonb("diff"), // silent price/schema changes feed Integrity
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("snapshots_service_idx").on(t.serviceId)],
);

export const wallets = pgTable(
  "wallets",
  {
    id: serial("id").primaryKey(),
    address: text("address").notNull(),
    chain: text("chain").notNull(),
    hdIndex: integer("hd_index").notNull(), // key derived from mnemonic env; never stored
    status: text("status").notNull().default("active"), // active | retired
    fundedAt: timestamp("funded_at", { withTimezone: true }),
    fundingTxHash: text("funding_tx_hash"),
    probeCount: integer("probe_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("wallets_addr_chain").on(t.address, t.chain)],
);

export const probes = pgTable(
  "probes",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull().references(() => services.id),
    walletId: integer("wallet_id").references(() => wallets.id),
    templateId: text("template_id").notNull(),
    isHoneypot: boolean("is_honeypot").notNull().default(false),
    requestUrl: text("request_url").notNull(),
    requestParams: jsonb("request_params").notNull(),
    httpStatus: integer("http_status"),
    x402Status: text("x402_status").notNull(), // settled | free | payment_failed | no_payment_required | error
    paymentTxHash: text("payment_tx_hash"),
    paymentChain: text("payment_chain"),
    quotedUsd: doublePrecision("quoted_usd"),
    chargedUsd: doublePrecision("charged_usd"),
    rawResponse: text("raw_response"),
    responseHash: text("response_hash"),
    latencyMs: integer("latency_ms").notNull(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("probes_service_idx").on(t.serviceId),
    index("probes_created_idx").on(t.createdAt),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: serial("id").primaryKey(),
    probeId: integer("probe_id").notNull().references(() => probes.id),
    serviceId: integer("service_id").notNull().references(() => services.id),
    tier: integer("tier").notNull(), // 1 | 2 | 3
    dimension: text("dimension").notNull(), // accuracy | reliability | latency | integrity | freshness
    verdict: text("verdict").notNull(), // pass | fail | inconclusive | unverifiable
    expected: jsonb("expected"),
    actual: jsonb("actual"),
    toleranceBps: integer("tolerance_bps"),
    groundTruth: jsonb("ground_truth"), // pinned blocks, contract reads, reference values
    detail: text("detail").notNull().default(""),
    verifierVersion: text("verifier_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("verifications_service_idx").on(t.serviceId),
    index("verifications_probe_idx").on(t.probeId),
  ],
);

export const scores = pgTable(
  "scores",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull().references(() => services.id),
    accuracy: doublePrecision("accuracy"), // null = "accuracy not verified"
    reliability: doublePrecision("reliability").notNull(),
    latency: doublePrecision("latency").notNull(),
    integrity: doublePrecision("integrity").notNull(),
    freshness: doublePrecision("freshness"),
    composite: doublePrecision("composite").notNull(),
    grade: text("grade").notNull(),
    confidence: doublePrecision("confidence").notNull(),
    sampleCount: integer("sample_count").notNull(),
    dominantTier: integer("dominant_tier").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("scores_service_time_idx").on(t.serviceId, t.computedAt)],
);

export const incidents = pgTable(
  "incidents",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull().references(() => services.id),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(), // factual, evidence-linked — never editorial (spec §9)
    probeIds: jsonb("probe_ids").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("incidents_service_idx").on(t.serviceId)],
);

export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id),
  contestedScoreId: integer("contested_score_id").references(() => scores.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"), // open | reprobing | upheld | overturned
  reprobeIds: jsonb("reprobe_ids").notNull().default([]),
  outcome: text("outcome"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const attestations = pgTable("attestations", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id),
  scoreId: integer("score_id").notNull().references(() => scores.id),
  chain: text("chain").notNull(),
  txHash: text("tx_hash"),
  registryAddress: text("registry_address").notNull(),
  requestHash: text("request_hash"),
  response: integer("response"), // 0-100 score written on-chain
  evidenceUri: text("evidence_uri").notNull(),
  status: text("status").notNull().default("pending"), // pending | sent | confirmed | failed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const anchors = pgTable("anchors", {
  id: serial("id").primaryKey(),
  merkleRoot: text("merkle_root").notNull(),
  fromVerificationId: integer("from_verification_id").notNull(),
  toVerificationId: integer("to_verification_id").notNull(),
  leafCount: integer("leaf_count").notNull(),
  chain: text("chain").notNull(),
  txHash: text("tx_hash"),
  blockNumber: integer("block_number"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  payerAddress: text("payer_address"),
  paymentTxHash: text("payment_tx_hash"),
  priceUsd: doublePrecision("price_usd"),
  demoMode: boolean("demo_mode").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
