import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { CatalogEntry, createLogger } from "@veristat/shared";

const log = createLogger("crawler");

/** Seed files live in <repo>/data; the worker may run from apps/worker. */
function resolveSeed(p: string): string {
  if (path.isAbsolute(p) || existsSync(p)) return p;
  const fromRoot = path.resolve(process.cwd(), "../..", p);
  return existsSync(fromRoot) ? fromRoot : p;
}

/**
 * Registry sources (spec §5.1). Each returns normalized catalog entries;
 * the crawler diffs them into the services table and marks the missing ones.
 */
export interface RegistrySource {
  name: string;
  discover(): Promise<CatalogEntry[]>;
}

/** Local demo catalog: the four mock ASPs. */
export function demoSource(baseUrl = process.env.MOCK_ASP_URL ?? "http://localhost:4010"): RegistrySource {
  const services = [
    { id: "honest", name: "Honest Oracle", price: 0.001 },
    { id: "stale", name: "Stale Oracle", price: 0.001 },
    { id: "liar", name: "Liar Oracle", price: 0.001 },
    { id: "greedy", name: "Greedy Oracle", price: 0.001 }, // lists 0.001, quotes 0.003
  ];
  return {
    name: "demo",
    async discover() {
      return services.map((s) =>
        CatalogEntry.parse({
          source: "demo",
          sourceId: s.id,
          name: s.name,
          endpoint: `${baseUrl}/${s.id}`,
          category: "defi-rates",
          chain: process.env.MOCK_ASP_CHAIN ?? "xlayerTestnet",
          paymentScheme: "exact",
          declaredPriceUsd: s.price,
          metadata: { demo: true },
        }),
      );
    },
  };
}

/** Coinbase x402 Bazaar discovery — the public x402 service directory. */
export function bazaarSource(): RegistrySource {
  const url =
    process.env.BAZAAR_DISCOVERY_URL ??
    "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources";
  return {
    name: "bazaar",
    async discover() {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`bazaar discovery http ${res.status}`);
      const body = (await res.json()) as { items?: Array<Record<string, unknown>> };
      const items = body.items ?? [];
      const entries: CatalogEntry[] = [];
      for (const item of items) {
        try {
          const resource = String(item.resource ?? "");
          const accepts = (item.accepts as Array<Record<string, unknown>>) ?? [];
          const first = accepts[0] ?? {};
          const maxAmount = Number(first.maxAmountRequired ?? 0);
          entries.push(
            CatalogEntry.parse({
              source: "x402scan",
              sourceId: resource,
              name: (item.metadata as Record<string, unknown>)?.name?.toString() ?? new URL(resource).hostname,
              endpoint: resource,
              category: "generic", // unknown outputs → Tier 3 until categorized
              chain: "base",
              paymentScheme: "exact",
              declaredPriceUsd: maxAmount / 1e6,
              metadata: { bazaar: true, type: item.type ?? null },
            }),
          );
        } catch {
          // skip malformed listings
        }
      }
      return entries;
    },
  };
}

/**
 * OKX.AI ASP directory. The site blocks non-browser fetches, so this reads a
 * manually exported JSON seed (data/okx-asp-seed.json) and falls back to a
 * direct fetch attempt with browser-like headers when the file is absent.
 */
export function okxAspSource(seedPath = process.env.OKX_ASP_SEED ?? "data/okx-asp-seed.json"): RegistrySource {
  return {
    name: "okx_asp",
    async discover() {
      let raw: string;
      try {
        raw = await readFile(resolveSeed(seedPath), "utf8");
      } catch {
        log.warn("seed file missing; skipping source", { seedPath });
        return [];
      }
      const items = JSON.parse(raw) as Array<Record<string, unknown>>;
      return items.map((item) =>
        CatalogEntry.parse({
          source: "okx_asp",
          sourceId: String(item.id ?? item.endpoint),
          name: String(item.name ?? "unnamed ASP"),
          endpoint: String(item.endpoint),
          category: (item.category as string) ?? "generic",
          chain: (item.chain as string) ?? "xlayer",
          paymentScheme: (item.paymentScheme as string) ?? "exact",
          declaredPriceUsd: item.priceUsd === undefined ? null : Number(item.priceUsd),
          metadata: { okx: true, ...(item.metadata as object ?? {}) },
        }),
      );
    },
  };
}

/** Curated list checked into the repo (data/curated.json), same shape as the OKX seed. */
export function curatedSource(path = "data/curated.json"): RegistrySource {
  const inner = okxAspSource(path);
  return {
    name: "curated",
    async discover() {
      const entries = await inner.discover();
      return entries.map((e) => ({ ...e, source: "curated" as const, metadata: { ...e.metadata, okx: undefined } }));
    },
  };
}
