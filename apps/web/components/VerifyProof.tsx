"use client";

import { useState } from "react";

interface Step {
  label: string;
  ok: boolean;
  detail?: string;
}
interface VerifyResult {
  anchored: boolean;
  valid?: boolean;
  onChain?: boolean;
  steps: Step[];
  message?: string;
  error?: string;
  anchor?: { txUrl: string | null; contractUrl: string | null; contract: string; txHash: string };
}

/**
 * "Verify it yourself" — recomputes a verdict's Merkle proof against the
 * on-chain EvidenceAnchor using only public inputs, live in the browser. The
 * button proves the trust story instead of asserting it.
 */
export function VerifyProof({ verificationId }: { verificationId: number }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function run() {
    setState("running");
    setResult(null);
    try {
      const res = await fetch(`/api/verify/${verificationId}`, { cache: "no-store" });
      setResult((await res.json()) as VerifyResult);
    } catch (err) {
      setResult({ anchored: false, steps: [], error: err instanceof Error ? err.message : String(err) });
    }
    setState("done");
  }

  return (
    <div className="verify-proof">
      <button className="btn-verify" onClick={run} disabled={state === "running"}>
        {state === "running" ? "Recomputing proof…" : state === "done" ? "Verify again" : "🔒 Verify this verdict on-chain"}
      </button>

      {result && (
        <div className="verify-out">
          {result.error && <div className="verify-step bad">✕ {result.error}</div>}
          {!result.error && result.anchored === false && (
            <div className="verify-step muted">◷ {result.message ?? "Not anchored on-chain yet — check back after the next anchoring cycle."}</div>
          )}
          {result.steps?.map((s, i) => (
            <div key={i} className={`verify-step ${s.ok ? "good" : "bad"}`}>
              {s.ok ? "✓" : "✕"} {s.label}
              {s.detail && <div className="verify-detail">{s.detail}</div>}
            </div>
          ))}
          {result.valid && result.onChain && (
            <div className="verify-verdict">
              Proof valid — independently recomputed from public evidence and confirmed by the
              on-chain contract.
              {result.anchor?.txUrl && (
                <>
                  {" "}
                  <a href={result.anchor.txUrl} target="_blank" rel="noreferrer">
                    Anchor tx on OKLink ↗
                  </a>
                </>
              )}
              {result.anchor?.contractUrl && (
                <>
                  {" · "}
                  <a href={result.anchor.contractUrl} target="_blank" rel="noreferrer">
                    EvidenceAnchor contract ↗
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
