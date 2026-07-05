# Veristat

**The production auditor of the agent economy.** Veristat continuously and
adversarially probes paid agent services — OKX.AI ASP listings, x402 endpoints —
with known-answer queries, pays for them via x402 (receipt on-chain), verifies
the responses against independently computed on-chain ground truth, and turns
the results into:

1. **A free public leaderboard** with per-service scorecards, incident logs, and
   inspectable evidence,
2. **A paid x402 pre-purchase score API** agents call before spending money on
   an unknown service,
3. **On-chain attestations** in the ERC-8004 Validation Registry plus periodic
   Merkle-root anchoring of the full evidence ledger on **XLayer**.

> Recall ranks agents in arenas; **we audit services in production.**

Built for the OKX XLayer hackathon. No token. Providers can never pay to change
a score ([neutrality policy](docs/neutrality-policy.md), [methodology](docs/methodology.md)).

## Architecture

```
                        ┌──────────────────────────────────────────────┐
   OKX.AI ASP dir ───▶  │ crawler   → services catalog (never deleted) │
   x402 Bazaar    ───▶  │                                              │
   curated seeds  ───▶  │ prober    → x402-paid probes, wallet pool,   │
                        │             budget governor, jittered timing │
                        │ verifier  → Tier 1 pinned-block chain reads  │
                        │             Tier 2 reference consensus (MAD) │
                        │             Tier 3 operational-only          │
                        │ scorer    → 5 dims, time decay, confidence   │
                        │ anti-gaming → fresh vs established z-test,   │
                        │             honeypots                        │
                        └────┬──────────────┬──────────────┬───────────┘
                             ▼              ▼              ▼
                     Postgres evidence   Next.js       attestor/anchorer
                     ledger (append-    leaderboard      │
                     only, traceable)   + report      XLayer: ERC-8004
                             ▲                        ValidationRegistry
                     score-api (paid x402) ◀────────  + EvidenceAnchor
```

| Piece | Path | What it does |
|---|---|---|
| shared | `packages/shared` | types, chain configs, Merkle tree, scoring math |
| db | `packages/db` | Drizzle schema + append-only evidence-ledger repositories |
| chain | `packages/chain` | viem clients, x402 client/server, HD wallet derivation |
| worker | `apps/worker` | crawler + prober + verifier + scorer + attestor + anchorer daemon |
| score-api | `apps/score-api` | paid x402 score endpoints (`/v1/score`, `/v1/category`, `/v1/evidence`) |
| web | `apps/web` | leaderboard, scorecards, report, methodology, badge SVG |
| contracts | `contracts` | `EvidenceAnchor` + ERC-8004 `Identity`/`Validation` registries + `MockUSDT` (Foundry) |
| mock ASPs | `demo/mock-asps` | 4 x402 oracles: honest / stale / liar / greedy |

## Quickstart (local demo)

Prereqs: Node ≥22, pnpm, Foundry, Postgres (`brew install postgresql@17`).

```bash
pnpm install
cp .env.example .env                       # defaults work for the free-mode demo
createdb veristat

# terminal 1 — four intentionally-flawed oracle services
MOCK_ASP_FREE=true MOCK_ASP_CHAIN=base pnpm mock-asps

# terminal 2 — probe + verify + score (a few rounds)
export DATABASE_URL=postgres://localhost:5432/veristat DATABASE_POOL_MAX=10
export PROBE_MNEMONIC="test test test test test test test test test test test junk"
SKIP_WALLET_FUNDING=true MOCK_ASP_CHAIN=base pnpm --filter @veristat/worker probe-once
# (repeat a few times, or run the daemon: pnpm worker)

# terminal 3 — leaderboard on :3000
DATABASE_URL=postgres://localhost:5432/veristat pnpm web

# terminal 4 — paid score API on :4020 (DEMO_MODE bypasses the paywall)
DEMO_MODE=true DATABASE_URL=postgres://localhost:5432/veristat pnpm score-api
```

Within ~3 probe rounds the leaderboard separates the four mock oracles:
honest ≈ **B+/A**, stale fails **freshness**, liar fails **accuracy**, greedy
fails **integrity/reliability** — each verdict traceable to a pinned block,
a contract read, and (in paid mode) a payment tx hash.

## Live deployment — XLayer testnet (chainId 1952)

| Contract | Address |
|---|---|
| EvidenceAnchor | [`0xe33f10dfb09f0c479a24555dcbcda6fc1c0bb03c`](https://www.oklink.com/xlayer-test/address/0xe33f10dfb09f0c479a24555dcbcda6fc1c0bb03c) |
| ERC-8004 IdentityRegistry | [`0xbf6d87a126edbcc2ac31d61ff370d4a9d38373d5`](https://www.oklink.com/xlayer-test/address/0xbf6d87a126edbcc2ac31d61ff370d4a9d38373d5) |
| ERC-8004 ValidationRegistry | [`0xb6da410e89d7e2774f0c4af9bd87bc19f93f8bc9`](https://www.oklink.com/xlayer-test/address/0xb6da410e89d7e2774f0c4af9bd87bc19f93f8bc9) |
| MockUSDT (tUSDT, public faucet) | [`0x6292949e5ef22aaa402bd933af83384462d4711b`](https://www.oklink.com/xlayer-test/address/0x6292949e5ef22aaa402bd933af83384462d4711b) |

Sample on-chain artifacts:
- Evidence Merkle anchor (159 verification rows): [`0x7673b4…`](https://www.oklink.com/xlayer-test/tx/0x7673b46ef680f0ac28384a6524ad1b122cd2de8aa2f4b284fe4b692aa3f960f6)
- ERC-8004 validation response (Honest Oracle, 94/100): [`0x49acc0…`](https://www.oklink.com/xlayer-test/tx/0x49acc04cb561a388e13e8a57d5225b0d461674ad246951ee8bddc804fb0a60d7)
- x402 probe payment (caught the Greedy Oracle overcharging): every probe row on the leaderboard links its own payment tx.

## XLayer testnet deployment

```bash
cd contracts
forge test                                          # 13 tests
DEPLOY_MOCK_USDT=true forge script script/Deploy.s.sol \
  --rpc-url https://testrpc.xlayer.tech \
  --mnemonics "$PROBE_MNEMONIC" --broadcast
```

Fund the treasury (mnemonic index 0) with testnet OKB from the
[XLayer faucet](https://web3.okx.com/xlayer/faucet), then put the four printed
addresses into `.env` (`EVIDENCE_ANCHOR_ADDRESS`, `IDENTITY_REGISTRY_ADDRESS`,
`VALIDATION_REGISTRY_ADDRESS`, `XLAYER_TESTNET_USDT`). Restart the worker with
`MOCK_ASP_CHAIN=xlayerTestnet` and **paid mode** (drop `MOCK_ASP_FREE` /
`SKIP_WALLET_FUNDING`): probes now settle real x402 payments in MockUSDT on
XLayer testnet, verdict batches are attested into the ERC-8004 Validation
Registry, and Merkle roots of the evidence ledger are anchored in
`EvidenceAnchor` — all visible on the [OKLink testnet explorer](https://www.oklink.com/xlayer-test).

## The x402 flow implemented here

`GET resource` → `402 { x402Version: 1, accepts: [{ scheme: "exact", network,
asset, payTo, maxAmountRequired, ... }] }` → client pays by ERC-20 transfer on
XLayer (USDT has no EIP-3009, so settlement presents the transfer tx hash) →
retry with `X-PAYMENT: base64(payload)` → server verifies the transfer
**on-chain** (token, recipient, amount, recency, single-use) → `200`.

The prober additionally records quoted-vs-charged (from the on-chain Transfer
event) — that is how the greedy oracle gets caught.

## Scoring

Five dimensions (accuracy, reliability, latency, integrity, freshness) with
exponential time decay, category-specific weights, letter grades, and a
tier-weighted confidence indicator. Tier 3 services are explicitly labeled
**"accuracy not verified"** — Veristat never fabricates an accuracy number.
Full formula: [docs/methodology.md](docs/methodology.md).

## Tests

```bash
pnpm test          # scoring, merkle, verification engine, anti-gaming (32 tests)
cd contracts && forge test   # anchor + ERC-8004 registries (13 tests)
```

## Registering as an OKX.AI ASP

The score API self-describes at `/.well-known/veristat.json`. Register the
deployed endpoint at [okx.ai/tutorial/asp](https://www.okx.ai/tutorial/asp)
(requires an OKX account and their review). Veristat's own listing is seeded in
`data/curated.json` and appears on the leaderboard with a conflict-of-interest
label, scored by the same methodology.

## Neutrality

- Providers can never pay to change a score.
- Disputes trigger fresh-wallet re-probes (`pnpm --filter @veristat/worker dispute <id> "<reason>"`); outcomes publish regardless of result.
- Every claim is a measurement — "returned X when the contract read Y at block N" — never a characterization.
- No token.
