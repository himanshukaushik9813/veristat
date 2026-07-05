import { closeDb, latestScore, listServices, runMigrations } from "@veristat/db";

/** Quick CLI: print the current leaderboard state. */
async function main(): Promise<void> {
  await runMigrations();
  const services = await listServices({});
  for (const s of services) {
    const score = await latestScore(s.id);
    if (!score) {
      console.log(`${s.name.padEnd(16)} — no score yet`);
      continue;
    }
    const dims = [
      `acc=${score.accuracy === null ? "n/a" : score.accuracy.toFixed(0)}`,
      `rel=${score.reliability.toFixed(0)}`,
      `lat=${score.latency.toFixed(0)}`,
      `int=${score.integrity.toFixed(0)}`,
      `fresh=${score.freshness === null ? "n/a" : score.freshness.toFixed(0)}`,
    ].join(" ");
    console.log(
      `${s.name.padEnd(16)} ${score.grade.padEnd(2)} ${score.composite.toFixed(1).padStart(5)}  ${dims}  conf=${score.confidence.toFixed(2)} n=${score.sampleCount}`,
    );
  }
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
