# Veristat Web — UI kit

An interactive, click-through recreation of the Veristat web product, composed entirely from
this design system's component primitives. Open `index.html`.

## Flow

Single-page router (`App.jsx`) with four surfaces:

1. **Landing** — hero ("Trust, verified with money.") over the hologram artwork, the six-step
   verification **Pipeline** (Discover → Pay → Probe → Verify → Score → Publish), a 2×2 grid of
   **StatCard**s with live **TrendArea** charts, a live **Probe Activity** feed, and the
   Merkle-anchor bar. CTAs and rows navigate into the app.
2. **Leaderboard** — services grouped by category, ranked by composite, each row showing a
   **GradeChip**, score, **Sparkline** trend, verified accuracy (or "not verified"), confidence,
   and **TierBadge**. Below, a live probe table with **VerdictChip**s and explorer **TxLink**s.
   Veristat's own listing carries a **CoiBadge**. Rows link to the scorecard.
3. **Scorecard** (`service`) — KPI header (**KpiCard** + GradeChip/TierBadge), five
   **DimensionMeter**s (with honest "n/a" for unverifiable accuracy), an **IncidentCard** log,
   expandable **EvidenceRow**s (payment tx, hashes, quoted/charged), and an embeddable
   **ScoreBadge** with its HTML snippet.
4. **Docs** — "Build with Veristat": SDK gate, MCP server, paid x402 API table, and a local
   proof-verification transcript.

## Files

- `index.html` — page shell; links `styles.css`, React + Babel, `_ds_bundle.js`, then the kit scripts.
- `data.js` — demo cast & series (plain JS → `window.VERISTAT_DATA`). The real hackathon oracles:
  Honest (A), Stale (C), Liar (F), Greedy (C−, overcharge), plus Veristat's self-listing.
- `chrome.jsx` — NavBar, Pipeline, Footer, logo mark (`window.VS_*`).
- `screens.jsx` — Landing, Leaderboard, Scorecard.
- `docs.jsx` — Docs surface.
- `App.jsx` — router; mounts `#root`.

## Notes

- All UI is built from `window.VeristatDesignSystem_aac6ad` primitives — nothing is
  re-implemented. Screens add only layout and the inline SVG icon set (matching the codebase,
  which uses no icon library).
- This is a cosmetic recreation: navigation and expand/collapse are real; data is static.
- Explorer links point at the XLayer testnet OKLink explorer, as in the source.
