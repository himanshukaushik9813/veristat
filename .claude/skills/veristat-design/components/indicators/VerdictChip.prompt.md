One-sentence: Tiny mono verdict tag for one dimension — the atom of the evidence ledger.

```jsx
<VerdictChip verdict="pass" dimension="accuracy" />
<VerdictChip verdict="fail" dimension="integrity" abbrev />  {/* int:✗ */}
```

`verdict`: pass (green ✓) / fail (red ✗) / inconclusive / unverifiable (muted –). `abbrev` renders `acc:✓`; without a `dimension` it shows just the verdict word.
