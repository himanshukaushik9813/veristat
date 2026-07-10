One-sentence: Truncated explorer-linked hash (`0x7673b4…60f6 ↗`) — the signature "proof" element that appears on every probe row.

```jsx
<TxLink hash="0x7673b46ef6…f960f6" href="https://www.oklink.com/xlayer-test/tx/0x7673…" />
<TxLink hash={anchorRoot} />  {/* no href → muted, non-linked */}
```

Mono + tabular. `lead`/`tail` control truncation; `arrow={false}` drops the ↗. Helper `truncateHash(hash, lead, tail)` is exported.
