One-sentence: Probe-outcome pill for the landing feed and anchor bar (correct / stale / overcharge / incorrect / …).

```jsx
<StatusChip status="correct" />
<StatusChip status="overcharge" />
<StatusChip status="confirmed">✓ Confirmed</StatusChip>
```

States: `correct` `confirmed` (green), `stale` (amber), `overcharge` (orange), `incorrect` `failed` (red), `unverified` (muted). Pass `children` to override the label.
