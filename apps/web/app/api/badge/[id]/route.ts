import { getService, latestScore } from "@veristat/db";
import { ensureDb } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Provider badge (spec §4, fourth surface): "Veristat 94/100", embeddable SVG. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const service = await getService(Number(id));
  const score = service ? await latestScore(service.id) : null;
  const value = score ? `${Math.round(score.composite)}/100` : "unscored";
  // Colors follow the design-system ScoreBadge thresholds (violet-era palette).
  const color = !score
    ? "#7c82a0"
    : score.composite >= 90
      ? "#22c55e"
      : score.composite >= 70
        ? "#3b46c4"
        : score.composite >= 60
          ? "#fab219"
          : "#ef4444";
  // Amber (60–69) is the only light band — dark ink for contrast; white elsewhere.
  const valueInk = score && score.composite >= 60 && score.composite < 70 ? "#131316" : "#fff";
  const label = "Veristat";
  const labelWidth = 62;
  const valueWidth = value.length * 8 + 16;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${labelWidth + valueWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <rect width="${labelWidth}" height="20" rx="3" fill="#131316"/>
  <rect x="${labelWidth}" width="${valueWidth}" height="20" rx="3" fill="${color}"/>
  <rect x="${labelWidth - 3}" width="6" height="20" fill="${color}"/>
  <text x="8" y="14" fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="11">${label}</text>
  <text x="${labelWidth + 8}" y="14" fill="${valueInk}" font-family="Verdana,Geneva,sans-serif" font-size="11" font-weight="bold">${value}</text>
</svg>`;
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "max-age=300" },
  });
}
