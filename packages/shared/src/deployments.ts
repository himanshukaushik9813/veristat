import type { ChainKey } from "./types.js";

export interface Deployment {
  evidenceAnchor: `0x${string}` | null;
  identityRegistry: `0x${string}` | null;
  validationRegistry: `0x${string}` | null;
  mockUsdt: `0x${string}` | null;
}

/**
 * Contract addresses per chain, filled in by `contracts/script/Deploy.s.sol`
 * runs (env vars override for local experimentation).
 */
export const DEPLOYMENTS: Partial<Record<ChainKey, Deployment>> = {
  xlayerTestnet: {
    evidenceAnchor: (process.env.EVIDENCE_ANCHOR_ADDRESS as `0x${string}`) ?? null,
    identityRegistry: (process.env.IDENTITY_REGISTRY_ADDRESS as `0x${string}`) ?? null,
    validationRegistry: (process.env.VALIDATION_REGISTRY_ADDRESS as `0x${string}`) ?? null,
    mockUsdt: (process.env.XLAYER_TESTNET_USDT as `0x${string}`) ?? null,
  },
};

export function deployment(chain: ChainKey): Deployment {
  return (
    DEPLOYMENTS[chain] ?? {
      evidenceAnchor: null,
      identityRegistry: null,
      validationRegistry: null,
      mockUsdt: null,
    }
  );
}
