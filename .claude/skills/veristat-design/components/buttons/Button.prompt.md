One-sentence: Veristat's action button — a glowing accent primary, a glass-blur ghost, and a quiet secondary; renders as `<a>` when given `href`.

```jsx
<Button href="/docs" size="lg" iconRight={<span aria-hidden>↗</span>}>
  Get Early Access
</Button>

<Button variant="ghost">Explore Leaderboard</Button>
<Button variant="secondary" size="sm">Dispute</Button>
```

Variants: `primary` (default, accent glow) · `ghost` (blur outline, used for the secondary hero CTA) · `secondary` (raised surface).
Sizes: `sm` · `md` (default) · `lg` (hero). Props: `icon` / `iconRight` for SVG glyphs, `disabled`, `onClick`.
