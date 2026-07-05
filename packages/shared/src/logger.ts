type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel: number = LEVELS[(process.env.LOG_LEVEL as Level) ?? "info"] ?? 20;

export interface Logger {
  debug: (msg: string, ctx?: Record<string, unknown>) => void;
  info: (msg: string, ctx?: Record<string, unknown>) => void;
  warn: (msg: string, ctx?: Record<string, unknown>) => void;
  error: (msg: string, ctx?: Record<string, unknown>) => void;
}

export function createLogger(component: string): Logger {
  const log =
    (level: Level) =>
    (msg: string, ctx?: Record<string, unknown>) => {
      if (LEVELS[level] < minLevel) return;
      const line = JSON.stringify({
        t: new Date().toISOString(),
        level,
        component,
        msg,
        ...ctx,
      });
      if (level === "error") console.error(line);
      else console.log(line);
    };
  return { debug: log("debug"), info: log("info"), warn: log("warn"), error: log("error") };
}
