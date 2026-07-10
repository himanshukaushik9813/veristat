# Veristat Design System

**"Trust, verified with money."** Veristat is the production auditor of the agent
economy: it continuously and adversarially probes paid AI agent services, pays them
with real money over x402, verifies every answer against on-chain ground truth, scores
them on five dimensions (0–100), and publishes cryptographic, Merkle-anchored proof on
XLayer. Providers can never pay to change a score. There is no token.

This design system captures Veristat's product surface — a dark, terminal-grade,
evidence-first UI where **every number is a measurement and the mono typeface is the
proof.**

## Sources

Built from the attached **`verdict/`** codebase (a pnpm/turbo monorepo; the product is
named *Veristat*, the repo directory is `verdict`). Primary references:

- `verdict/apps/web/app/globals.css` — the authoritative visual system (this supersedes
  the warmer palette in the design brief; the shipped product is the dark navy→violet
  theme "tuned to the hero artwork").
- `verdict/apps/web/app/page.tsx`, `leaderboard/page.tsx`, `service/[id]/page.tsx`,
  `report/page.tsx`, `docs/page.tsx` — the real screens recreated in the UI kit.
- `verdict/apps/web/components/*` — NavBar, Pipeline, Sparkline, TrendArea, DocPage.
- `verdict/apps/web/app/api/badge/[id]/route.ts` — the embeddable score badge (thresholds
  mirrored in `ScoreBadge`).
- `verdict/apps/web/public/hero-bg.png` — the hologram-tower hero artwork (copied to
  `assets/hero-bg.png`); the source of the entire color mood.
- `verdict/docs/design-brief.md`, `verdict/README.md` — product logic, dimensions,
  incident kinds, verification tiers, demo cast (Honest / Stale / Liar / Greedy oracles).

## CONTENT FUNDAMENTALS

**Voice: an auditor's, not a marketer's.** Copy is measurement, never characterization.
The product never says a service is "bad" — it says exactly what happened, with numbers:

- *"returned 42.7 when the contract read 38.1 at block 9,214,006"*
- *"quoted \$0.0010 but charged \$0.0030 (on-chain Transfer event)"*
- *"claimed block 9,213,856 — 150 blocks behind chain head"*

**Tone & rules:**
- **Declarative and precise.** Short, factual, no hype. Verbs are concrete: probe, pay,
  verify, score, publish, anchor.
- **Second person for the developer** ("Everything an agent needs before you spend"),
  third person for services ("this service's output cannot be objectively checked").
- **Never fabricates.** When accuracy can't be objectively verified, the copy says
  "accuracy not verified" / "n/a" and the service gets an operational-only score. This
  honesty is the brand — extended to Veristat's own self-listing, which carries a
  **conflict-of-interest badge**.
- **Casing:** Sentence case for headings and body. UPPERCASE only for short labels/eyebrows
  (LIVE, PAID PROBES, SERVICE) and the `VERISTAT` wordmark. Grades are single capital letters.
- **Numbers are sacred:** always mono, always tabular, always traceable to a tx hash. USD to
  4 decimals ($0.0030), latency in ms, blocks with thousands separators, scores to one decimal.
- **No emoji.** The only glyphs are ✓ / ✗ (verdicts), ↗ (external/explorer links), → (nav),
  and a pulsing dot for "live". Everything else is a line-drawn SVG icon.
- **Signature line**, repeated as a quiet footer everywhere: *"Every score traces to on-chain
  payments and Merkle-anchored evidence on XLayer. Providers can never pay to change a score."*

## VISUAL FOUNDATIONS

**Overall vibe:** a Bloomberg-terminal-meets-block-explorer dark product in **strict
monochrome** — pure black canvas, white/grayscale ink, a single white accent, and a faint
grid texture. Modeled on the X Layer "Build X Hackathon" key art: stark, cold, high-contrast,
ASCII-texture energy. Dense, evidence-first. No hue anywhere.

- **Color:** true-black surfaces stacked darkest→raised (`#000000` → `#0b0b0d` →
  `#17181b`) separated by one hairline border (`#2a2b30`). One accent — **white** `#ffffff`
  (links, series, primary fill) — terminating in gray on gradients (`#ffffff`→`#8f9096`).
  Severity is carried by **brightness, not hue**: green/amber/red are gone; the verdict ramp
  runs bright→dim (good `#f0f0f2` → stale `#b4b5bb` → overcharge `#86878d` → wrong `#626368`),
  and meaning is reinforced by ✓/✗ glyphs and labels. Letter grades are **solid blocks on a
  light→dark ramp** — A pure white (dark ink), F near-black (white ink).
- **Type:** no webfonts by design. System sans (renders as Helvetica Neue / SF / Segoe — close
  to the X Layer grotesk) for prose; **system mono with tabular numerals for everything a
  machine measured**. Hero is 44–64px, weight 700, tracking −0.03em, with the accent word in a
  clipped white→gray gradient. Uppercase eyebrows at 0.06em; the wordmark at 0.14em.
- **Backgrounds:** flat black, no page gradients. The one image is the hologram `hero-bg.png`,
  **desaturated to grayscale** (`filter: grayscale(1) contrast(1.08)`), full-bleed on the right
  of the hero with a left-to-transparent black protection gradient and a faint 44px grid overlay
  masked out toward the artwork — the X Layer key-art signature.
- **Cards:** `--surface-1` fill + 1px `--border` hairline + 10–16px radius + a barely-there
  `0 1px 2px` shadow. Stat cards add a faint white top edge and a grayscale icon tile. The
  anchor bar uses a **white gradient border** (padding-box/border-box) — the only gradient
  stroke in the system.
- **Glow is the signature, now white.** Elevation is expressed by soft white halo more than
  shadow: primary buttons carry `0 0 24px rgba(255,255,255,0.16)`, the logo and hero word have
  white drop-shadow glows, pipeline tiles are lit from within with grayscale `color-mix` glows.
- **Radii:** chips/grades 4–6px, buttons/cards 8–10px, panels 16px, hero 20px, status pills
  fully rounded (999px).
- **Borders:** almost everything is separated by a single 1px hairline rather than shadow or
  fill change. Tables use hairline row separators (`--surface-2`).
- **Transparency & blur:** the sticky nav is `rgba(5,6,13,0.72)` + `blur(14px) saturate(1.3)`;
  ghost buttons use a light blur. Blur is reserved for floating chrome (nav, menus, ghost CTA),
  never for content cards.
- **Motion (restrained):** short `cubic-bezier(0.22,1,0.36,1)` eases at 120–150ms on
  color/opacity. The only loops are a gentle "LIVE" dot pulse (opacity 1↔0.35) and the trend
  end-dot breathing (r 3↔4.5). No bounces, no slide-ins, no decorative animation.
- **Hover:** links lift to ~0.85 opacity; table rows fill to `--surface-2`; nav items reveal a
  glowing underline. **Press:** quiet — color deepens, no scale.
- **Imagery mood:** cool, electric, **monochrome**. The hero is a rendered isometric hologram
  tower (stacked translucent plates + a shield-check) — desaturated to grayscale on black, no
  color, no warmth. Thin grid texture and ASCII density evoke the X Layer key art.

## ICONOGRAPHY

- **No icon-font or SVG sprite in the source** — icons are small inline line-drawn SVGs at
  ~1.8 stroke weight, rounded caps/joins, `currentColor`, drawn per-use in the components
  (NavBar logo shield-check, Pipeline step glyphs, StatCard tiles). This system reproduces that
  approach: `ui_kits/web/chrome.jsx` and `screens.jsx` carry the icon set inline; there is **no
  icon dependency and no CDN icon library** — matching the codebase exactly.
- **Logomark:** a shield outline with an interior check, in accent blue with a glow — the same
  shape as the "verify" pipeline step. Rendered as inline SVG (see `guidelines/brand-logo.card.html`).
  **The source contains no separate logo asset file**, so the mark is reproduced as SVG from its
  in-code definition and the wordmark is set in plain type (`VERISTAT`, 800 weight, 0.14em). If an
  official logo file exists, drop it in `assets/` and swap these.
- **Glyph vocabulary:** ✓ pass/verified, ✗ wrong/fail, ↗ external & explorer links, → navigation,
  pulsing dot = live. **No emoji, ever.**
- **Only raster asset:** `assets/hero-bg.png` (the hologram hero). No other imagery ships.

## Index (root manifest)

- `styles.css` — entry point (import manifest only). Consumers link this one file.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`
  (intentionally empty — system stacks), `base.css` (reset + element defaults).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand groups).
- `components/` — reusable primitives:
  - `buttons/` — **Button** (primary/ghost/secondary).
  - `indicators/` — **GradeChip, StatusChip, VerdictChip, TierBadge, CoiBadge, LiveChip, TxLink**.
  - `data/` — **Sparkline, TrendArea, DimensionMeter, KpiCard, StatCard, IncidentCard,
    EvidenceRow (+EvidenceKV), ScoreBadge**.
- `ui_kits/web/` — interactive recreation of the Veristat web product (landing → leaderboard →
  scorecard → docs). Entry: `index.html`.
- `assets/` — `hero-bg.png`.
- `SKILL.md` — Agent-Skills-compatible entry for using this system in Claude Code.

### Component namespace

The compiler exposes components on `window.VeristatDesignSystem_aac6ad`. In card/kit HTML:
`const { Button, GradeChip, StatCard } = window.VeristatDesignSystem_aac6ad;`

## Intentional additions

The source defines no formal component library, so the primitives above were factored out of
the real screens. Two are light conveniences with clear source lineage:
- **KpiCard** — generalizes the repeated label-over-mono-value blocks in the scorecard/report.
- **LiveChip** — extracts the "LIVE" pulse used on the probe-activity panel header.

## Caveats

- **Theme:** the system was reskinned to a **strict monochrome X Layer theme** (black/white/gray,
  white accent, white glow). To match the all-grayscale key art, the functional verdict hues
  (green/amber/orange/red) were replaced by a brightness ramp + ✓/✗ glyphs. If you want muted
  functional color back (e.g. red for "verifiably wrong"), say so and I'll reintroduce it while
  keeping the black canvas.
- **Fonts:** Veristat ships **no webfonts** — this is faithful to the codebase (system sans +
  system mono). `tokens/fonts.css` is intentionally empty. If you later adopt a brand typeface,
  declare it there and repoint `--font-sans` / `--font-mono`.
- **Logo:** no logo *file* exists in the source; the shield-check mark is reproduced as inline
  SVG from its in-code definition and the wordmark is plain type. Provide an official asset to
  replace it if one exists.
