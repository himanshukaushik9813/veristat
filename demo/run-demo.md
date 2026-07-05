# Veristat — judge demo script (~5 minutes)

## 0. Setup (once)

```bash
pnpm install && cp .env.example .env && createdb veristat
export DATABASE_URL=postgres://localhost:5432/veristat DATABASE_POOL_MAX=10
export PROBE_MNEMONIC="<funded testnet mnemonic>"   # or the test mnemonic in free mode
```

## 1. The cast (30s)

Start the four mock oracle ASPs — one honest, three misbehaving in ways that
are invisible to completion-based reputation:

```bash
pnpm mock-asps        # honest / stale / liar / greedy on :4010
```

All four *complete* every task. OKX completion-reputation would rate them
identically. Watch what verification finds.

## 2. Probing (1m)

```bash
pnpm --filter @veristat/worker probe-once   # run 3-4 times, or `pnpm worker` for the daemon
```

Point out log lines: each probe pays via x402 (tx hash), captures latency and
quoted-vs-charged, then verifies against contract reads at a pinned block.

## 3. The leaderboard (1m) — `pnpm web` → http://localhost:3000

- Honest ≈ A/B+; stale fails **freshness**; liar fails **accuracy**; greedy
  fails **integrity** (charged > listed) and **reliability** (paid-but-500).
- Open a scorecard → sample evidence → expand a probe: request, payment tx
  (OKLink link), response hash, ground truth (pinned block + contract read),
  verdict. Every score is a receipt, not an opinion.
- `/report` — "The State of the Agent Marketplace," computed live from the ledger.
- `/neutrality` — providers can never pay to change a score.

## 4. The paid score API (1m) — `DEMO_MODE=false pnpm score-api`

```bash
curl -i localhost:4020/v1/score/3          # → 402 with x402 payment requirements
# pay with the x402 client and retry → JSON verdict an agent reads pre-purchase
curl localhost:4020/.well-known/veristat.json   # the ASP manifest for OKX.AI listing
```

A rated, paid agent service that rates paid agent services — listed on its own
leaderboard with a COI label.

## 5. On-chain outputs (1m)

```bash
pnpm --filter @veristat/worker exec tsx src/main.ts anchor-once
pnpm --filter @veristat/worker exec tsx src/main.ts attest-once
```

Show on OKLink (XLayer testnet): the `EvidenceAnchor` Merkle root covering the
verification rows, and the ERC-8004 `ValidationRegistry` response (score 0-100 +
evidence URI). Any wallet or framework can consume these without touching our API.

## 6. The kicker (30s)

```bash
pnpm --filter @veristat/worker dispute 3 "provider contests accuracy score"
```

Fresh wallets, re-probe, published outcome — the liar stays a liar. Neutrality
is a process, not a promise.
