import type { NextFunction, Request, Response } from "express";
import { CHAINS, createLogger, deployment, type ChainKey } from "@veristat/shared";
import { buildChallenge, decodePaymentHeader, usdToAtomic, verifyPayment } from "@veristat/chain";
import { logApiUsage } from "@veristat/db";

const log = createLogger("score-api:paywall");

/**
 * x402 paywall middleware for the pre-purchase score API (spec §4.2).
 * DEMO_MODE=true bypasses payment (judges) but still logs usage as demo.
 */
const DEMO_MODE = process.env.DEMO_MODE === "true";
const CHAIN: ChainKey = (process.env.SCORE_API_CHAIN as ChainKey) ?? "xlayerTestnet";
const PAY_TO = (process.env.SCORE_API_PAYTO ?? "0x000000000000000000000000000000000000dEaD") as `0x${string}`;

const redeemed = new Set<string>();

export function paid(priceUsd: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (DEMO_MODE) {
      await logApiUsage({ endpoint: req.path, priceUsd, demoMode: true });
      next();
      return;
    }
    const dep = deployment(CHAIN);
    const asset = (dep.mockUsdt ?? CHAINS[CHAIN].stable.address) as `0x${string}`;
    const amount = usdToAtomic(priceUsd, CHAINS[CHAIN].stable.decimals);
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
            description: "Veristat pre-purchase score lookup",
            mimeType: "application/json",
            maxTimeoutSeconds: 60,
          },
        ]),
      );
      return;
    }
    try {
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
        return;
      }
      await logApiUsage({
        endpoint: req.path,
        payerAddress: verdict.payer,
        paymentTxHash: payload.payload.txHash,
        priceUsd,
      });
      next();
    } catch (err) {
      log.error("paywall error", { err: String(err) });
      res.status(400).json({ error: "malformed X-PAYMENT header" });
    }
  };
}
