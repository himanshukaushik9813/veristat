import { decodeEventLog, type Account } from "viem";
import { CHAINS, type ChainKey } from "@veristat/shared";
import { publicClient } from "./clients.js";
import { ERC20_ABI, erc20Transfer } from "./erc20.js";
import { withRetry } from "./retry.js";

/**
 * x402 payment flow, wire-compatible with the protocol shape
 * (https://github.com/coinbase/x402): a resource server answers 402 with
 * { x402Version, accepts: [PaymentRequirements] }; the client settles and
 * retries with an X-PAYMENT header (base64 JSON payload).
 *
 * Settlement scheme here is "exact" settled by a direct ERC-20 transfer whose
 * tx hash is presented in the payload — chosen because XLayer USDT does not
 * support EIP-3009 transferWithAuthorization, and OKX's XLayer flavor settles
 * in USDT/USDG. The server verifies the transfer on-chain (token, recipient,
 * amount, recency) and enforces single-use of each tx hash.
 */

export interface PaymentRequirements {
  scheme: "exact";
  network: ChainKey;
  maxAmountRequired: string; // atomic units of `asset`
  asset: `0x${string}`;
  payTo: `0x${string}`;
  resource: string;
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

export interface X402Challenge {
  x402Version: 1;
  error?: string;
  accepts: PaymentRequirements[];
}

export interface X402PaymentPayload {
  x402Version: 1;
  scheme: "exact";
  network: ChainKey;
  payload: {
    txHash: `0x${string}`;
    payer: `0x${string}`;
  };
}

export function encodePaymentHeader(p: X402PaymentPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64");
}

export function decodePaymentHeader(header: string): X402PaymentPayload {
  return JSON.parse(Buffer.from(header, "base64").toString("utf8")) as X402PaymentPayload;
}

export function usdToAtomic(usd: number, decimals: number): bigint {
  return BigInt(Math.round(usd * 10 ** decimals));
}

export function atomicToUsd(amount: bigint, decimals: number): number {
  return Number(amount) / 10 ** decimals;
}

// ---------- client side ----------

export interface PaidFetchResult {
  response: Response;
  quotedUsd: number | null;
  chargedUsd: number | null;
  paymentTxHash: `0x${string}` | null;
  paymentChain: ChainKey | null;
  x402Status: "settled" | "free" | "payment_failed" | "no_payment_required" | "error";
}

export interface PayAndFetchOptions {
  account: Account;
  /** Refuse to pay above this (budget governor passes it down). */
  maxUsd: number;
  networks?: ChainKey[]; // acceptable networks, default all
  init?: RequestInit;
  timeoutMs?: number;
}

/**
 * GET/POST a paid x402 resource: request → 402 → settle ERC-20 transfer →
 * retry with X-PAYMENT. Returns everything the evidence ledger records.
 */
export async function payAndFetch(url: string, opts: PayAndFetchOptions): Promise<PaidFetchResult> {
  const timeout = AbortSignal.timeout(opts.timeoutMs ?? 30_000);
  const first = await fetch(url, { ...opts.init, signal: timeout });

  if (first.status !== 402) {
    return {
      response: first,
      quotedUsd: null,
      chargedUsd: null,
      paymentTxHash: null,
      paymentChain: null,
      x402Status: "no_payment_required",
    };
  }

  const challenge = (await first.json()) as X402Challenge;
  const acceptable = challenge.accepts.find(
    (a) => a.scheme === "exact" && (!opts.networks || opts.networks.includes(a.network)),
  );
  if (!acceptable) {
    return {
      response: first,
      quotedUsd: null,
      chargedUsd: null,
      paymentTxHash: null,
      paymentChain: null,
      x402Status: "error",
    };
  }

  const chainCfg = CHAINS[acceptable.network];
  const amount = BigInt(acceptable.maxAmountRequired);
  const quotedUsd = atomicToUsd(amount, chainCfg.stable.decimals);

  if (quotedUsd > opts.maxUsd) {
    // Budget governor: a quote above cap is refused, not paid (spec §5.2).
    return {
      response: first,
      quotedUsd,
      chargedUsd: null,
      paymentTxHash: null,
      paymentChain: acceptable.network,
      x402Status: "payment_failed",
    };
  }

  let txHash: `0x${string}`;
  try {
    txHash = await erc20Transfer(
      acceptable.network,
      opts.account,
      acceptable.asset,
      acceptable.payTo,
      amount,
    );
  } catch {
    return {
      response: first,
      quotedUsd,
      chargedUsd: null,
      paymentTxHash: null,
      paymentChain: acceptable.network,
      x402Status: "payment_failed",
    };
  }

  const header = encodePaymentHeader({
    x402Version: 1,
    scheme: "exact",
    network: acceptable.network,
    payload: { txHash, payer: opts.account.address as `0x${string}` },
  });

  const second = await fetch(url, {
    ...opts.init,
    headers: { ...(opts.init?.headers as Record<string, string>), "X-PAYMENT": header },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
  });

  // chargedUsd = what actually left the wallet, read from the Transfer event.
  const charged = await chargedFromTx(acceptable.network, txHash, acceptable.payTo);

  return {
    response: second,
    quotedUsd,
    chargedUsd: charged ?? quotedUsd,
    paymentTxHash: txHash,
    paymentChain: acceptable.network,
    x402Status: second.ok ? "settled" : "error",
  };
}

async function chargedFromTx(
  chain: ChainKey,
  txHash: `0x${string}`,
  payTo: `0x${string}`,
): Promise<number | null> {
  try {
    const receipt = await publicClient(chain).getTransactionReceipt({ hash: txHash });
    for (const log of receipt.logs) {
      try {
        const ev = decodeEventLog({ abi: ERC20_ABI, data: log.data, topics: log.topics });
        if (ev.eventName === "Transfer" && (ev.args.to as string).toLowerCase() === payTo.toLowerCase()) {
          return atomicToUsd(ev.args.value as bigint, CHAINS[chain].stable.decimals);
        }
      } catch {
        // not a Transfer log
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ---------- server side ----------

export interface VerifyPaymentOptions {
  network: ChainKey;
  asset: `0x${string}`;
  payTo: `0x${string}`;
  minAmount: bigint;
  /** Reject payments older than this many seconds (default 600). */
  maxAgeSeconds?: number;
  /** Single-use enforcement hook: returns true if txHash was already redeemed. */
  isRedeemed: (txHash: string) => Promise<boolean> | boolean;
  markRedeemed: (txHash: string) => Promise<void> | void;
}

export interface VerifyPaymentResult {
  ok: boolean;
  reason?: string;
  paidAmount?: bigint;
  payer?: `0x${string}`;
}

/** On-chain verification of a presented X-PAYMENT payload. */
export async function verifyPayment(
  payload: X402PaymentPayload,
  opts: VerifyPaymentOptions,
): Promise<VerifyPaymentResult> {
  if (payload.network !== opts.network) return { ok: false, reason: "wrong network" };
  const { txHash } = payload.payload;
  if (await opts.isRedeemed(txHash)) return { ok: false, reason: "payment already used" };

  const client = publicClient(opts.network);
  let receipt;
  try {
    // The payment tx was just mined — retry so a lagging LB node doesn't reject it.
    receipt = await withRetry(() => client.getTransactionReceipt({ hash: txHash }));
  } catch {
    return { ok: false, reason: "tx not found" };
  }
  if (receipt.status !== "success") return { ok: false, reason: "tx reverted" };

  const block = await withRetry(() => client.getBlock({ blockNumber: receipt.blockNumber }));
  const age = Date.now() / 1000 - Number(block.timestamp);
  if (age > (opts.maxAgeSeconds ?? 600)) return { ok: false, reason: "payment too old" };

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== opts.asset.toLowerCase()) continue;
    try {
      const ev = decodeEventLog({ abi: ERC20_ABI, data: log.data, topics: log.topics });
      if (
        ev.eventName === "Transfer" &&
        (ev.args.to as string).toLowerCase() === opts.payTo.toLowerCase() &&
        (ev.args.value as bigint) >= opts.minAmount
      ) {
        await opts.markRedeemed(txHash);
        return { ok: true, paidAmount: ev.args.value as bigint, payer: ev.args.from as `0x${string}` };
      }
    } catch {
      // not a Transfer log
    }
  }
  return { ok: false, reason: "no matching transfer to payTo" };
}

export function buildChallenge(reqs: PaymentRequirements[]): X402Challenge {
  return { x402Version: 1, accepts: reqs };
}
