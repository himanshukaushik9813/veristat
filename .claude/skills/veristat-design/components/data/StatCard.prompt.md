One-sentence: Landing metric card — colored icon tile, big mono value, caption + "today" delta, and a trend chart pinned to the bottom.

```jsx
<StatCard
  icon={<SearchIcon />} label="Paid Probes" value="1,284"
  caption="On-chain payments" delta="+124 today" color="var(--accent)"
  chart={<TrendArea values={series} id="probes" />}
/>
```

The top edge glows in `color`. Pair with any chart component.
