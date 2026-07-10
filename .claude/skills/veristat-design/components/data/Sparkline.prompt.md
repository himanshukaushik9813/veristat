One-sentence: Tiny 0–100 trend line for leaderboard rows and scorecards.

```jsx
<Sparkline values={[72, 74, 71, 78, 81, 80]} />
<Sparkline values={history} width={160} height={36} color="var(--good)" />
```

Fixed 0–100 domain; renders "—" for fewer than 2 points.
