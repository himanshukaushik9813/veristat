/** Tiny single-series trend line (0–100 domain). One series — no legend. */
export function Sparkline({ values, width = 110, height = 26 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <span className="confidence">—</span>;
  const pad = 2;
  const step = (width - pad * 2) / (values.length - 1);
  const y = (v: number) => pad + (height - pad * 2) * (1 - Math.max(0, Math.min(100, v)) / 100);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values[values.length - 1]!;
  return (
    <svg className="sparkline" width={width} height={height} role="img" aria-label={`score trend, now ${last.toFixed(0)}`}>
      <path d={d} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pad + (values.length - 1) * step} cy={y(last)} r="2.5" fill="var(--series-1)" />
    </svg>
  );
}
