# Veristat — UI Design Brief

> Hand this document to a design tool / AI. It contains the problem statement, product
> logic, every screen with its real data fields, and the visual direction. Nothing here
> is hypothetical — the product is live; all data shown must map to these fields.

## 1. Problem statement

The agent economy has a trust problem. AI agents now autonomously **pay** other AI
services for answers — prices, DeFi rates, security scores — using the x402 payment
protocol (HTTP 402 → pay in stablecoin → get the response). Marketplaces like OKX.AI
list hundreds of these paid "Agent Service Providers" (ASPs).

But nothing checks whether those services tell the truth:

- A price oracle can return numbers **10% off** and still get paid.
- A data service can serve values that are **hours stale** and still get paid.
- A service can quote $0.001 and silently **charge $0.003** from the payment wallet.
- A service can special-case known auditors and lie to everyone else.

Reviews and star ratings don't work here — the buyers are machines, the failures are
numeric, and the money is real. There is no Moody's, no Consumer Reports, no health
inspector for machine-to-machine commerce.

**Veristat is that inspector.** It adversarially probes paid agent services with its own
money (real x402 payments from rotating anonymous wallets), verifies every answer
against independently computed on-chain ground truth ("service said X; the blockchain
said Y at block N"), scores services on five dimensions, and publishes everything —
with cryptographic receipts. Every verdict is Merkle-anchored in a smart contract on
XLayer, so even Veristat cannot rewrite history. Providers can never pay to change a
score; the only way to score higher is to be more accurate.

One-line pitch: **"Trust, verified with money."** Credit rating agency + health
inspector for the agent economy.

## 2. How it works (the loop the UI must explain)

1. **Discover** — crawl marketplaces (OKX.AI ASP directory, x402 Bazaar) for paid services.
2. **Probe** — pay each service via x402 from anonymous rotating wallets; randomized,
   jittered timing; honeypot questions that catch caching/hardcoding.
3. **Verify** — recompute the true answer from the blockchain at a pinned block
   (Tier 1 deterministic), or from ≥3 independent references (Tier 2 consensus), or —
   when the output can't be objectively checked — mark accuracy **"not verified"**
   (Tier 3) rather than fabricating a number.
4. **Score** — five dimensions 0–100 (Accuracy, Reliability, Latency, Integrity,
   Freshness), exponential time-decay, letter grade A+…F, confidence %.
5. **Publish** — free leaderboard; paid score API (agents pay $0.001/lookup via x402);
   ERC-8004 attestations + Merkle-anchored evidence on XLayer chain.

Products on top: a **pre-purchase SDK gate** (`guard()` — 3 lines an agent runs before
spending), an **MCP server** (Claude and other agents can query scores as tools),
**degradation webhooks** (alert when a score drops), and a **public proof verifier**
(anyone can recompute any verdict's Merkle proof and check it against the contract).

## 3. Demo cast (real data — use these in mockups)

| Service | Grade | Composite | What it does wrong |
|---|---|---|---|
| Honest Oracle | A | 94.3 | nothing — control |
| Stale Oracle | C | 75.8 | serves data ~150 blocks old (Freshness 0) |
| Liar Oracle | F | 50.7 | returns values ×1.10 + 7 (Accuracy 0) |
| Greedy Oracle | C- | 72.5 | quotes $0.001, charges $0.003; random failures (Integrity 0) |
| Veristat Score API | A | 96 | Veristat's own listing — Tier 3, "accuracy not verified", COI-labeled |

Live chain facts usable in designs: XLayer testnet (chainId 1952), OKLink explorer
links, anchor tx `0x7673…60f6` covering 159 evidence leaves, 5 ERC-8004 validation
responses on-chain, payments in tUSDT of $0.0002–$0.005 per probe.

## 4. Visual direction

- **Mood:** Bloomberg terminal meets a modern crypto explorer. Authoritative, dense,
  evidence-first. A neutral referee, not a marketing site. No mascots, no gradients-for-fun.
- **Dark theme:** background `#121211`, surface `#1a1a19`, raised `#242422`,
  border `#34342f`, primary text `#ffffff`, secondary `#c3c2b7`, muted `#8b8a80`.
- **Accent:** blue `#3987e5` (links, charts, primary actions).
- **Semantic:** good `#0ca30c`, warning `#fab219`, serious `#ec835a`, critical `#d03b3b`.
- **Grades:** solid chips — A=green, B=blue `#1c5cab`, C=yellow (dark text), D=orange
  (dark text), F=red. Monospace, bold.
- **Type:** system sans for prose; monospace (SF Mono/Menlo) for every number, hash,
  address, verdict, and grade. Tabular numerals everywhere.
- **Texture:** thin 1px borders, 10px radius cards, sparklines, tiny bar charts for the
  five dimensions, ✓/✗ verdict chips. Payment tx hashes are everywhere — treat truncated
  hashes (`0x2d4022…`) linked to the explorer as a core visual element, they ARE the proof.
- **Tone of copy:** measurements, never characterizations. "returned 42.7 when the
  contract read 38.1 at block 9,214,006" — not "this service is bad".

## 5. Screens

### 5.1 Landing / Leaderboard (`/`)
- **Hero:** headline "Trust, verified with money." + one-paragraph explainer + 4 stat
  cards fed by live ledger data: Paid probes (with count of on-chain payments),
  Verified verdicts (with count Merkle-anchored), Incidents caught ("wrong, stale &
  overcharges"), $ spent probing (with services-scored count).
- **Leaderboard tables, grouped by category** (price, defi-rates, generic…). Columns:
  rank, service name (+ amber "Veristat itself — COI" chip on self-listing), grade chip,
  composite score, trend sparkline (last 40 scores), accuracy (or muted "not verified"),
  confidence %, tier badge (T1/T2/T3).
- **Live probe activity feed:** table of the latest probes — time, service, probe
  template id (`defi.token-meta`), verdict chips per dimension (`acc:✓ int:✗`), amount
  paid, latency ms, truncated payment-tx link to OKLink.

### 5.2 Service scorecard (`/service/[id]`)
- Header: name, endpoint, category, grade chip, composite, confidence, tier badge,
  COI banner if self.
- **Score history line chart** (composite over time).
- **Five-dimension breakdown:** horizontal bars 0–100 with values; accuracy may be
  "n/a — not verified" (muted, never a fake number).
- **Incident log:** left-red-border cards — kind tag (`WRONG_ANSWER`, `STALE_DATA`,
  `OVERCHARGE`, `HONEYPOT_FAILURE`, `GAMING_SUSPECTED`), factual summary, timestamp.
- **Sample evidence:** expandable rows per probe — request URL + params, payment tx
  (explorer link), quoted vs charged USD, response hash, latency, then per-verdict:
  tier, dimension, ✓/✗, expected vs actual vs ground truth, detail sentence.
- **Dispute history** (providers can contest; fresh-wallet re-probe; outcome publishes
  either way).
- **"Embed this score":** live badge preview (SVG: "Veristat 94/100") + copyable HTML
  snippet.

### 5.3 Report (`/report`) — "The State of the Agent Marketplace"
Aggregate stats page: % of paid responses that were wrong / stale, advertised vs real
latency, billing-integrity findings, per-category summaries. Editorial layout, chart-heavy.

### 5.4 Methodology & Neutrality (`/methodology`, `/neutrality`)
Long-form prose pages. Key claims to surface as pull-quotes: "Providers can never pay
to change a score", "Every claim is a measurement", "No token".

### 5.5 Developer surfaces (can be one "Build with Veristat" page)
- **SDK:** code block —
  `const gate = await veristat.guard(url, { minScore: 70 }); if (!gate.allow) throw …`
  Show a deny result: `allow: false, reason: "composite 51.0 < required 70; integrity 40 < required 60 (billing risk)"`.
- **MCP:** config snippet + the four tools (check_before_purchase, get_service_score,
  compare_category, get_evidence).
- **Alerts:** `POST /v1/alerts/subscribe {webhookUrl, minScoreDrop}` + example webhook
  payload (event, previous/current score, scorecardUrl).
- **Paid API:** endpoint table with x402 prices ($0.001 score / $0.002 category /
  $0.005 evidence) and the 402→pay→200 flow diagram.
- **Proof verifier:** terminal-style block showing
  `verify-proof 42 → recomputed root ✓ matches → contract verifyLeaf(): ✓ PROOF VALID ON-CHAIN`.

## 6. Signature diagram (draw this)

```
Agent marketplaces          VERISTAT ENGINE                    Outputs
(OKX.AI, x402 Bazaar)   ┌────────────────────────┐   free leaderboard (web)
        │               │ probe: pay via x402     │   paid score API (x402)
        └──▶ discover ──▶│ verify: vs on-chain    │──▶ SDK guard() / MCP tools
                        │   ground truth          │   webhooks on degradation
   anonymous wallets ──▶│ score: 5 dims + decay   │   XLayer: ERC-8004 attest
   (rotating, honeypots)└────────────────────────┘   + Merkle evidence anchors
```

## 7. Do / Don't

- DO show money: every probe row carries a real payment amount and tx hash.
- DO show uncertainty honestly: confidence %, "not verified", "inconclusive".
- DON'T use star ratings, testimonials, or five-point scales.
- DON'T soften failures: F is red, incidents are listed, the liar oracle is named.
- DON'T add a token, staking, or pay-to-boost anything — neutrality is the brand.
