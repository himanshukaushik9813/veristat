import { createLogger } from "@veristat/shared";
import { insertAlertDelivery, subscriptionsForService } from "@veristat/db";

const log = createLogger("alerts");

export interface ScoreDropAlert {
  kind: "score_drop" | "grade_change";
  service: { id: number; name: string };
  previous: { composite: number; grade: string };
  current: { composite: number; grade: string };
  drop: number;
}

export interface IncidentAlert {
  kind: "incident";
  service: { id: number; name: string };
  incidentKind: string;
  summary: string;
  probeIds: number[];
}

export type Alert = ScoreDropAlert | IncidentAlert;

/**
 * Degradation alerts: when a service's verified score drops or an incident is
 * recorded, POST the event to every matching webhook subscription. Delivery is
 * best-effort and fully logged; a failing webhook never blocks the pipeline.
 */
export async function fireAlerts(alert: Alert): Promise<void> {
  let subs;
  try {
    subs = await subscriptionsForService(alert.service.id);
  } catch (err) {
    log.error("subscription lookup failed", { err: String(err) });
    return;
  }
  const relevant = subs.filter((s) =>
    alert.kind === "incident" ? s.notifyIncidents : alert.kind === "grade_change" || alert.drop >= s.minScoreDrop,
  );
  if (relevant.length === 0) return;

  const payload = {
    event: alert.kind,
    firedAt: new Date().toISOString(),
    ...alert,
    scorecardUrl: `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/service/${alert.service.id}`,
  };

  await Promise.all(
    relevant.map(async (sub) => {
      let httpStatus: number | null = null;
      let status: "sent" | "failed" = "failed";
      try {
        const res = await fetch(sub.webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json", "user-agent": "veristat-alerts/0.1" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10_000),
        });
        httpStatus = res.status;
        status = res.ok ? "sent" : "failed";
      } catch (err) {
        log.warn("webhook delivery failed", { url: sub.webhookUrl, err: String(err) });
      }
      await insertAlertDelivery({
        subscriptionId: sub.id,
        serviceId: alert.service.id,
        kind: alert.kind,
        payload,
        httpStatus,
        status,
      });
      if (status === "sent") log.info("alert delivered", { kind: alert.kind, service: alert.service.name, url: sub.webhookUrl });
    }),
  );
}
