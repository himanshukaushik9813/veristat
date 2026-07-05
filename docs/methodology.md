# Veristat Scoring Methodology

Veristat continuously and adversarially probes paid agent services with
known-answer queries paid for via x402 (receipt on-chain), verifies responses
against independently computed ground truth, and converts the results into
scores. The full formula is public: transparency of method is what makes scores
trustworthy. The moat is the evidence corpus, not the formula.

## Verification tiers

Every verdict carries its tier, always disclosed on the scorecard.

- **Tier 1 — deterministic on-chain truth.** For any claim about chain state,
  Veristat computes the answer independently at a pinned block number and
  compares: token metadata, balances, block timestamps, rates read from
  protocol contracts, prices derived from a median of independent DEX pool
  reads with tolerance bands set by liquidity tier. Billing integrity is also
  Tier 1: the amount charged is read from the on-chain transfer.
- **Tier 2 — consensus cross-reference.** For off-chain facts: agreement
  against 2+ independent references (median), plus cross-service consensus —
  the same question to competing services with MAD-based outlier flagging.
  If references are unreachable, the verdict is *inconclusive* — never guessed.
- **Tier 3 — operational only.** For outputs that cannot be objectively
  verified (research, analysis, creative work): schema validity, completeness,
  latency, uptime, billing integrity. These services receive an operational
  score explicitly labeled **"accuracy not verified."** Veristat never
  fabricates an accuracy number.

## Dimensions (each 0–100)

| Dimension | What it measures | Source |
|---|---|---|
| Accuracy | verified correctness rate within tolerance bands | Tier 1/2 verdicts only |
| Reliability | uptime, protocol error rate, settled-but-not-served rate | every probe |
| Latency | end-to-end latency vs category baseline (100 at ≤0.8s, 0 at ≥15s) | every probe |
| Integrity | charged == quoted == listed price; x402 flow spec-compliant; schema stable | on-chain transfer vs quote |
| Freshness | claimed block/timestamp vs chain head at verification (max lag 60 blocks / 300s) | data-bearing responses |

## Composite

- Observations are weighted by exponential time decay (half-life 7 days) so
  recent behavior dominates.
- Category weights: data services are accuracy-heavy (45% accuracy), execution
  services are integrity-heavy (35% integrity). Tier-3 categories have no
  accuracy/freshness weight; weights renormalize over measured dimensions.
- Letter grades: A+ ≥97, A ≥93, A− ≥90, B+ ≥87 … F <60.
- **Confidence (0–1)** grows with tier-weighted effective sample size
  (Tier 1 = 1.0, Tier 2 = 0.75, Tier 3 = 0.4): `1 − exp(−n_eff / 10)`.
  Low-confidence scores are labeled as such.

## Anti-gaming

- Probe wallets rotate (retired after 25 probes; fresh HD-derived replacements).
- No fixed baskets, no fixed schedule — parameters and timing are randomized.
- Honeypot queries with obscure but deterministically verifiable answers are
  mixed into rotation (15%).
- Statistical special-casing detection: accuracy on established wallets is
  compared against fresh wallets (one-sided two-proportion z-test, p < 0.01).
  A significant gap is published as a **gaming_suspected** incident.

## Evidence

Every probe stores: request parameters, the payment transaction hash, the raw
response and its hash, verification inputs (pinned block numbers, contract
reads, reference values), the verdict, and timestamps. Every published score is
traceable end-to-end to on-chain payments and stored evidence. A recurring
Merkle root of the verification ledger is anchored on XLayer
(`EvidenceAnchor`), making history tamper-evident; verdicts are additionally
published as ERC-8004 Validation Registry attestations.
