---
name: veristat-design
description: Use this skill to generate well-branded interfaces and assets for Veristat, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — the design guide: content voice, visual foundations, iconography, full component index. **Read this first.**
- `styles.css` — the one stylesheet to link; `@import`s every token file.
- `tokens/` — CSS custom properties (colors, typography, spacing, effects, base reset). No webfonts (system stacks by design).
- `components/` — React primitives grouped as `buttons/`, `indicators/`, `data/`. Each has a `.jsx`, `.d.ts`, `.prompt.md`, and a directory `@dsCard` HTML demo.
- `ui_kits/web/` — full interactive recreation of the Veristat web product; the reference for how surfaces compose.
- `guidelines/` — foundation specimen cards.
- `assets/hero-bg.png` — the hologram hero artwork.

## The one rule to remember
Veristat is an **auditor**: copy is measurement, not marketing; numbers/hashes/grades render in **tabular mono**; the palette is **strict monochrome** — pure-black canvas, white/grayscale ink, a single white accent, white glow, a faint grid texture (X Layer key-art look). Severity is carried by **brightness + ✓/✗ glyphs**, not hue. Grades are solid blocks on a light→dark ramp. No emoji. When accuracy can't be verified, say so — never fabricate.
