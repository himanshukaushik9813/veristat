export const metadata = { title: "Build with Veristat" };

/** Developer surface: SDK gate, MCP server, paid API, alerts, proof verification. */
export default function Docs() {
  return (
    <main className="prose" style={{ maxWidth: 860 }}>
      <h1>Build with Veristat</h1>
      <p className="sub">
        Everything an agent needs to check a service&apos;s verified track record before spending
        money on it — and to keep watching it afterwards.
      </p>

      <h2 id="sdk">SDK — the pre-purchase gate</h2>
      <p>
        Three lines before any x402 spend. <code>guard()</code> fails closed when a service has no
        verified track record (configurable via <code>onUnknown</code>).
      </p>
      <pre className="code">{`import { Veristat } from "@veristat/sdk";

const veristat = new Veristat({ baseUrl: process.env.VERISTAT_API_URL });
const gate = await veristat.guard(serviceUrl, {
  minScore: 70,
  requireVerifiedAccuracy: true,
});
if (!gate.allow) throw new Error(\`blocked: \${gate.reason}\`);`}</pre>
      <p>
        A real deny result names the exact policy failures — this is the live verdict{" "}
        <code>guard()</code> returns for the Liar Oracle on the current leaderboard:
      </p>
      <pre className="code">{`{
  allow: false,
  reason: "composite 51.1 < required 70",
  score: { composite: 51.1, grade: "F", dimensions: { accuracy: 0, integrity: 100, ... } },
  serviceId: 3
}`}</pre>

      <h2 id="mcp">MCP server — scores as agent tools</h2>
      <p>Plug Veristat into Claude or any MCP-capable agent:</p>
      <pre className="code">{`{
  "mcpServers": {
    "veristat": {
      "command": "node",
      "args": ["apps/mcp/dist/main.js"],
      "env": { "VERISTAT_API_URL": "http://localhost:4020" }
    }
  }
}`}</pre>
      <p>
        Four tools: <code>check_before_purchase</code> (allow/deny with reasons),{" "}
        <code>get_service_score</code>, <code>compare_category</code>, <code>get_evidence</code>.
      </p>

      <h2 id="api">Paid score API — x402</h2>
      <p>
        Agents pay per lookup in stablecoin via the x402 protocol (402 challenge → settle →
        retry with <code>X-PAYMENT</code>). Free endpoints: <code>/v1/resolve</code>,{" "}
        <code>/v1/methodology</code>, <code>/.well-known/veristat.json</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Price</th>
            <th>Returns</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>GET /v1/score/:serviceId</code></td>
            <td>$0.001</td>
            <td>composite, grade, confidence, 5 dimensions</td>
          </tr>
          <tr>
            <td><code>GET /v1/category/:category</code></td>
            <td>$0.002</td>
            <td>ranked comparison of every scored service</td>
          </tr>
          <tr>
            <td><code>GET /v1/evidence/:serviceId</code></td>
            <td>$0.005</td>
            <td>probes, payment txs, ground truth, verdicts, incidents</td>
          </tr>
        </tbody>
      </table>

      <h2 id="alerts">Degradation alerts — webhooks</h2>
      <p>Get notified the moment a service you depend on starts failing:</p>
      <pre className="code">{`curl -X POST $VERISTAT_API/v1/alerts/subscribe \\
  -H 'content-type: application/json' \\
  -d '{"webhookUrl":"https://your.agent/hooks/veristat","minScoreDrop":5}'`}</pre>
      <p>
        Webhook payload as delivered for a real incident (the Greedy Oracle&apos;s on-chain
        overcharge, from the incidents ledger):
      </p>
      <pre className="code">{`{
  "event": "incident",
  "service": { "id": 4, "name": "Greedy Oracle" },
  "incidentKind": "overcharge",
  "summary": "charged $0.003 vs listed/quoted $0.001",
  "scorecardUrl": "${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/service/4"
}`}</pre>

      <h2 id="verify">Verify the evidence yourself</h2>
      <p>
        Every verification row is Merkle-anchored in the <code>EvidenceAnchor</code> contract on
        XLayer. Anyone can recompute a proof from the published evidence — no trust in
        Veristat&apos;s database required:
      </p>
      <pre className="code">{`$ pnpm --filter @veristat/worker verify-proof 42

anchor #1: rows 1..159 (159 leaves)
recomputed root  0xe3fab9aa…  `}<span className="ok">✓ matches published</span>{`
proof (8 siblings) verifies locally: `}<span className="ok">✓</span>{`
contract verifyLeaf(): `}<span className="ok">✓ PROOF VALID ON-CHAIN</span></pre>
      <p>
        Public inputs: <code>GET /api/anchors</code> (anchor list) and{" "}
        <code>GET /api/anchors/:id/leaves</code> (canonical rows in leaf order).
      </p>

      <h2>Neutrality</h2>
      <blockquote>
        Providers can never pay to change a score. Every claim is a measurement. No token.
      </blockquote>
    </main>
  );
}
