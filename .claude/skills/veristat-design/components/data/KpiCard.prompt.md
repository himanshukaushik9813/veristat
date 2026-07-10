One-sentence: Generic KPI card — uppercase label over a big mono value.

```jsx
<KpiCard label="Composite" value="94.3" />
<KpiCard label="Confidence" value="88%" sub="12 verdicts" />
<KpiCard label="Composite"><GradeChip grade="A" /> 94.3</KpiCard>
```

Use `children` when the value needs custom markup (e.g. a grade chip + number).
