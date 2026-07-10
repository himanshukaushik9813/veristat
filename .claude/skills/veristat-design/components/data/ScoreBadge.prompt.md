One-sentence: Embeddable provider badge ("Veristat 94/100") — a two-part pill colored by the composite score.

```jsx
<ScoreBadge score={94} />
<ScoreBadge score={51} />        {/* red */}
<ScoreBadge score={null} />     {/* unscored, muted */}
```

Thresholds match the live SVG badge: ≥90 green, ≥70 blue, ≥60 amber, else red.
