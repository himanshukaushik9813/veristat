// Veristat web UI kit — Build with Veristat (developer surface).
const _NS = window.VeristatDesignSystem_aac6ad;

function CodeBlock({ children }) {
  return (
    <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", overflowX: "auto", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
      {children}
    </pre>
  );
}

function Docs() {
  const th = { border: "1px solid var(--border)", padding: "6px 10px", textAlign: "left", fontSize: 13, color: "var(--text-primary)" };
  const td = { border: "1px solid var(--border)", padding: "6px 10px", textAlign: "left", fontSize: 13, color: "var(--text-secondary)" };
  return (
    <main style={{ maxWidth: 860, color: "var(--text-secondary)" }}>
      <h1 style={{ color: "var(--text-primary)" }}>Build with Veristat</h1>
      <p style={{ fontSize: 14 }}>Everything an agent needs to check a service's verified track record before spending money on it — and to keep watching it afterwards.</p>

      <h2 style={{ color: "var(--text-primary)" }} id="sdk">SDK — the pre-purchase gate</h2>
      <p>Three lines before any x402 spend. <code>guard()</code> fails closed when a service has no verified track record.</p>
      <CodeBlock>{`import { Veristat } from "@veristat/sdk";

const veristat = new Veristat({ baseUrl: process.env.VERISTAT_API_URL });
const gate = await veristat.guard(serviceUrl, {
  minScore: 70,
  requireVerifiedAccuracy: true,
});
if (!gate.allow) throw new Error(\`blocked: \${gate.reason}\`);`}</CodeBlock>
      <p>A real deny result names the exact policy failures:</p>
      <CodeBlock>{`{
  allow: false,
  reason: "composite 51.0 < required 70; integrity 40 < required 60 (billing risk)",
  score: { composite: 51, grade: "F", dimensions: { accuracy: 0, integrity: 40 } },
  serviceId: 3
}`}</CodeBlock>

      <h2 style={{ color: "var(--text-primary)" }} id="mcp">MCP server — scores as agent tools</h2>
      <p>Plug Veristat into Claude or any MCP-capable agent:</p>
      <CodeBlock>{`{
  "mcpServers": {
    "veristat": {
      "command": "node",
      "args": ["apps/mcp/dist/main.js"],
      "env": { "VERISTAT_API_URL": "http://localhost:4020" }
    }
  }
}`}</CodeBlock>
      <p>Four tools: <code>check_before_purchase</code>, <code>get_service_score</code>, <code>compare_category</code>, <code>get_evidence</code>.</p>

      <h2 style={{ color: "var(--text-primary)" }} id="api">Paid score API — x402</h2>
      <table style={{ borderCollapse: "collapse", fontSize: 13, margin: "12px 0" }}>
        <thead><tr><th style={th}>Endpoint</th><th style={th}>Price</th><th style={th}>Returns</th></tr></thead>
        <tbody>
          <tr><td style={td}><code>GET /v1/score/:id</code></td><td style={td}>$0.001</td><td style={td}>composite, grade, confidence, 5 dimensions</td></tr>
          <tr><td style={td}><code>GET /v1/category/:cat</code></td><td style={td}>$0.002</td><td style={td}>ranked comparison of every scored service</td></tr>
          <tr><td style={td}><code>GET /v1/evidence/:id</code></td><td style={td}>$0.005</td><td style={td}>probes, payment txs, ground truth, verdicts</td></tr>
        </tbody>
      </table>

      <h2 style={{ color: "var(--text-primary)" }} id="verify">Verify the evidence yourself</h2>
      <CodeBlock>{`$ pnpm --filter @veristat/worker verify-proof 42

anchor #1: rows 1..159 (159 leaves)
recomputed root  0xe3fab9aa…  `}<span style={{ color: "var(--good)" }}>✓ matches published</span>{`
proof (8 siblings) verifies locally: `}<span style={{ color: "var(--good)" }}>✓</span>{`
contract verifyLeaf(): `}<span style={{ color: "var(--good)" }}>✓ PROOF VALID ON-CHAIN</span></CodeBlock>

      <blockquote style={{ borderLeft: "3px solid var(--accent)", margin: "24px 0 0", padding: "2px 16px", color: "var(--text-primary)" }}>
        Providers can never pay to change a score. Every claim is a measurement. No token.
      </blockquote>
      <window.VS_Footer />
    </main>
  );
}

window.VS_Docs = Docs;
