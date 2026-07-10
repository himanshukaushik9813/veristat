One-sentence: One 0–100 dimension bar from a scorecard; `value={null}` renders "n/a" (accuracy is never faked).

```jsx
<DimensionMeter name="Accuracy" value={94} />
<DimensionMeter name="Accuracy" value={null} />   {/* Tier-3: not verified */}
<DimensionMeter name="Integrity" value={40} color="var(--critical)" />
```
