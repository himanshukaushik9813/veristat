import type { Account } from "viem";
import { payAndFetch } from "@veristat/chain";
import { evaluateGuardPolicy, type GuardPolicy as GuardPolicyBase } from "@veristat/shared";

/**
 * @veristat/sdk — the pre-purchase gate for agent spending.
 *
 * Before your agent pays an unknown x402 service, ask Veristat for its
 * verified track record — scores grounded in adversarial probes paid on-chain
 * and verified against independently computed truth. Three lines:
 *
 * ```ts
 * const veristat = new Veristat({ account });
 * const gate = await veristat.guard(serviceUrl, { minScore: 70 });
 * if (gate.allow) await payForService(...); else console.log(gate.reason);
 * ```
 */

export interface VeristatOptions {
  /** Veristat score API base URL. */
  baseUrl?: string;
  /** Wallet used to pay for score lookups (x402). Omit if the API is in demo mode. */
  account?: Account;
  /** Max USD willing to pay per score lookup. */
  maxLookupUsd?: number;
}

export interface ServiceScore {
  composite: number;
  grade: string;
  confidence: number;
  sampleCount: number;
  dominantTier: 1 | 2 | 3;
  dimensions: {
    accuracy: number | null; // null = "accuracy not verified" — never fabricated
    reliability: number;
    latency: number;
    integrity: number;
    freshness: number | null;
  };
  computedAt: string;
}

export interface ScoreResult {
  service: { id: number; name: string; endpoint: string; category: string; status: string };
  score: ServiceScore | null;
  conflictOfInterest: string | null;
}

export interface GuardPolicy extends GuardPolicyBase {
  /** What to do when the service is unknown to Veristat (default "warn"). */
  onUnknown?: "allow" | "warn" | "block";
}

export interface GuardResult {
  allow: boolean;
  reason: string;
  score: ServiceScore | null;
  serviceId: number | null;
}

export class Veristat {
  private baseUrl: string;
  private account?: Account;
  private maxLookupUsd: number;

  constructor(opts: VeristatOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? process.env.VERISTAT_API_URL ?? "http://localhost:4020").replace(/\/$/, "");
    this.account = opts.account;
    this.maxLookupUsd = opts.maxLookupUsd ?? 0.01;
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    if (this.account) {
      const paid = await payAndFetch(url, { account: this.account, maxUsd: this.maxLookupUsd });
      if (!paid.response.ok) throw new Error(`veristat ${paid.response.status}: ${await paid.response.text()}`);
      return (await paid.response.json()) as T;
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`veristat ${res.status}: ${await res.text()}`);
    return (await res.json()) as T;
  }

  /** Verified track record of a service by Veristat catalog id. */
  score(serviceId: number): Promise<ScoreResult> {
    return this.get<ScoreResult>(`/v1/score/${serviceId}`);
  }

  /** Ranked comparison of every scored service in a category. */
  category(category: string): Promise<{ category: string; services: Array<{ id: number; name: string; endpoint: string; score: ServiceScore | null }> }> {
    return this.get(`/v1/category/${encodeURIComponent(category)}`);
  }

  /** Full evidence report: probes, payment txs, ground truth, verdicts. */
  evidence(serviceId: number): Promise<unknown> {
    return this.get(`/v1/evidence/${serviceId}`);
  }

  /** Find a service's score by its endpoint URL. */
  async lookup(endpointUrl: string): Promise<ScoreResult | null> {
    const res = await this.get<{ services: Array<{ id: number; endpoint: string }> }>(
      `/v1/resolve?endpoint=${encodeURIComponent(endpointUrl)}`,
    );
    const match = res.services[0];
    return match ? this.score(match.id) : null;
  }

  /**
   * The pre-purchase gate: should my agent spend money on this service?
   * Pure policy over verified evidence — never a vibe.
   */
  async guard(endpointUrl: string, policy: GuardPolicy = {}): Promise<GuardResult> {
    const onUnknown = policy.onUnknown ?? "warn";

    let result: ScoreResult | null;
    try {
      result = await this.lookup(endpointUrl);
    } catch (err) {
      return {
        allow: onUnknown === "allow",
        reason: `veristat unreachable (${err instanceof Error ? err.message : err}); policy onUnknown=${onUnknown}`,
        score: null,
        serviceId: null,
      };
    }

    if (!result || !result.score) {
      return {
        allow: onUnknown === "allow",
        reason:
          onUnknown === "allow"
            ? "service not yet audited by Veristat; allowed by policy"
            : "service not yet audited by Veristat — no verified track record exists",
        score: result?.score ?? null,
        serviceId: result?.service.id ?? null,
      };
    }

    const s = result.score;
    const decision = evaluateGuardPolicy(
      {
        composite: s.composite,
        confidence: s.confidence,
        integrity: s.dimensions.integrity,
        accuracyVerified: s.dimensions.accuracy !== null,
        grade: s.grade,
        sampleCount: s.sampleCount,
      },
      policy,
    );
    return { allow: decision.allow, reason: decision.reason, score: s, serviceId: result.service.id };
  }
}

export default Veristat;
