/**
 * Area sparkline: gradient fill under an auto-scaled line with a glowing end
 * dot. Server-renderable; pass a stable `id` for the gradient defs.
 */
export function TrendArea({
  values,
  id,
  width = 170,
  height = 44,
  color = "var(--accent)",
}: {
  values: number[];
  id: string;
  width?: number;
  height?: number;
  color?: string;
}) {
  if (values.length < 2) return <span className="confidence">—</span>;
  const pad = 3;
  const max = Math.max(...values, 1);
  const step = (width - pad * 2) / (values.length - 1);
  const y = (v: number) => pad + (height - pad * 2) * (1 - Math.max(0, v) / max);
  const pts = values.map((v, i) => [pad + i * step, y(v)] as const);
  const line = pts.map(([x, py], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]![0].toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
  const [lx, ly] = pts[pts.length - 1]!;
  return (
    <svg className="sparkline" width={width} height={height} role="img" aria-label="trend">
      <defs>
        <linearGradient id={`ta-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#ta-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} opacity="0.9">
        <animate attributeName="r" values="3;4.5;3" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
