One-sentence: Expandable evidence-ledger row (`<details>`) with a mono summary; pair with `EvidenceKV` for each field.

```jsx
<EvidenceRow summary={<>#42 · defi.token-meta · <VerdictChip verdict="pass" dimension="acc" /></>}>
  <EvidenceKV label="payment tx"><TxLink hash="0x2d40…" href={url} /></EvidenceKV>
  <EvidenceKV label="quoted / charged">$0.0010 / $0.0030</EvidenceKV>
  <EvidenceKV label="response sha256">0xe3fab9aa…</EvidenceKV>
</EvidenceRow>
```
