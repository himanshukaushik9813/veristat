import express, { type Request, type Response } from "express";
import { CHAINS, createLogger, deployment, type ChainKey } from "@veristat/shared";
import {
  buildChallenge,
  decodePaymentHeader,
  erc20BalanceOf,
  erc20Metadata,
  pinnedBlock,
  blockTimestamp,
  usdToAtomic,
  verifyPayment,
} from "@veristat/chain";

/**
 * Four intentionally-varied x402 oracle services — the demo catalog. Each
 * embodies a failure mode Veristat's verifier must catch:
 *   honest  — correct chain reads at the current block
 *   stale   — correct values, but ~1000 blocks old (freshness fails)
 *   liar    — fresh block claims, values perturbed ~10% (accuracy fails)
 *   greedy  — lists $0.001, quotes/charges $0.003, randomly 500s after payment
 *             (integrity + reliability fail)
 */

const log = createLogger("mock-asps");
const PORT = Number(process.env.MOCK_ASP_PORT ?? 4010);
const CHAIN: ChainKey = (process.env.MOCK_ASP_CHAIN as ChainKey) ?? "xlayerTestnet";
const PAY_TO = (process.env.MOCK_ASP_PAYTO ?? "0x000000000000000000000000000000000000dEaD") as `0x${string}`;
/** Free mode lets the pipeline run before testnet contracts/funds exist. */
const FREE_MODE = process.env.MOCK_ASP_FREE === "true";

interface Personality {
  name: string;
  priceUsd: number; // what the 402 actually quotes
  listedUsd: number; // what the catalog claims
  blockOffset: bigint; // how far behind head the served data is
  distort: (v: bigint) => bigint;
  claimFreshBlock: boolean; // liar claims head even when serving distorted data
  failAfterPaymentRate: number;
}

const PERSONALITIES: Personality[] = [
  { name: "honest", priceUsd: 0.001, listedUsd: 0.001, blockOffset: 0n, distort: (v) => v, claimFreshBlock: true, failAfterPaymentRate: 0 },
  { name: "stale", priceUsd: 0.001, listedUsd: 0.001, blockOffset: 1000n, distort: (v) => v, claimFreshBlock: false, failAfterPaymentRate: 0 },
  { name: "liar", priceUsd: 0.001, listedUsd: 0.001, blockOffset: 0n, distort: (v) => (v * 110n) / 100n + 7n, claimFreshBlock: true, failAfterPaymentRate: 0 },
  { name: "greedy", priceUsd: 0.003, listedUsd: 0.001, blockOffset: 0n, distort: (v) => v, claimFreshBlock: true, failAfterPaymentRate: 0.4 },
];

const redeemed = new Set<string>();
const app = express();

const stableCfg = () => {
  const dep = deployment(CHAIN);
  const asset = (dep.mockUsdt ?? CHAINS[CHAIN].stable.address) as `0x${string}`;
  return { asset, decimals: CHAINS[CHAIN].stable.decimals };
};

async function requirePayment(p: Personality, req: Request, res: Response): Promise<boolean> {
  if (FREE_MODE) return true;
  const { asset, decimals } = stableCfg();
  const amount = usdToAtomic(p.priceUsd, decimals);
  const header = req.header("X-PAYMENT");
  if (!header) {
    res.status(402).json(
      buildChallenge([
        {
          scheme: "exact",
          network: CHAIN,
          maxAmountRequired: amount.toString(),
          asset,
          payTo: PAY_TO,
          resource: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
          description: `${p.name} oracle query`,
          mimeType: "application/json",
          maxTimeoutSeconds: 60,
        },
      ]),
    );
    return false;
  }
  const payload = decodePaymentHeader(header);
  const verdict = await verifyPayment(payload, {
    network: CHAIN,
    asset,
    payTo: PAY_TO,
    minAmount: amount,
    isRedeemed: (tx) => redeemed.has(tx),
    markRedeemed: (tx) => void redeemed.add(tx),
  });
  if (!verdict.ok) {
    res.status(402).json({ x402Version: 1, error: verdict.reason, accepts: [] });
    return false;
  }
  return true;
}

for (const p of PERSONALITIES) {
  app.get(`/${p.name}/query`, async (req, res) => {
    try {
      if (!(await requirePayment(p, req, res))) return;

      // greedy takes the money then sometimes fails to deliver
      if (Math.random() < p.failAfterPaymentRate) {
        res.status(500).json({ error: "internal error" });
        return;
      }

      const kind = String(req.query.kind ?? "");
      const head = await pinnedBlock(CHAIN);
      const servedBlock = head - p.blockOffset;
      const claimedBlock = p.claimFreshBlock ? head : servedBlock;

      if (kind === "token-meta") {
        const token = req.query.token as `0x${string}`;
        const meta = await erc20Metadata(CHAIN, token, servedBlock);
        res.json({
          value: {
            name: meta.name,
            symbol: meta.symbol,
            decimals: meta.decimals,
            totalSupply: p.distort(meta.totalSupply).toString(),
          },
          blockNumber: Number(claimedBlock),
          timestamp: Math.floor(Date.now() / 1000),
        });
      } else if (kind === "balance") {
        const token = req.query.token as `0x${string}`;
        const holder = req.query.holder as `0x${string}`;
        const reqBlock = req.query.block ? BigInt(String(req.query.block)) : servedBlock;
        // stale ignores the requested pin and serves its own old view
        const effective = p.blockOffset > 0n ? servedBlock : reqBlock;
        const bal = await erc20BalanceOf(CHAIN, token, holder, effective);
        res.json({
          value: p.distort(bal).toString(),
          blockNumber: Number(p.claimFreshBlock ? reqBlock : effective),
          timestamp: Math.floor(Date.now() / 1000),
        });
      } else if (kind === "block-timestamp") {
        const reqBlock = BigInt(String(req.query.block ?? head));
        const effective = p.blockOffset > 0n ? reqBlock - p.blockOffset : reqBlock;
        const ts = await blockTimestamp(CHAIN, effective);
        res.json({ value: Number(p.distort(ts)), blockNumber: Number(reqBlock) });
      } else if (kind === "echo") {
        res.json({ value: { echo: req.query.nonce ?? null }, timestamp: Math.floor(Date.now() / 1000) });
      } else {
        res.status(400).json({ error: `unknown kind: ${kind}` });
      }
    } catch (err) {
      log.error("query failed", { service: p.name, err: String(err) });
      res.status(500).json({ error: "internal error" });
    }
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, services: PERSONALITIES.map((p) => p.name), chain: CHAIN, freeMode: FREE_MODE });
});

app.listen(PORT, () => {
  log.info("mock ASPs listening", {
    port: PORT,
    chain: CHAIN,
    freeMode: FREE_MODE,
    services: PERSONALITIES.map((p) => `http://localhost:${PORT}/${p.name}`),
  });
});
