#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Veristat, type GuardPolicy } from "@veristat/sdk";

/**
 * Veristat MCP server — plug verified service reputation straight into any
 * MCP-capable agent (Claude, etc). Four tools:
 *
 *   check_before_purchase  — the gate: should I spend money on this endpoint?
 *   get_service_score      — verified 5-dimension score for a catalog service
 *   compare_category       — ranked comparison across a category
 *   get_evidence           — full evidence report (probes, payment txs, verdicts)
 *
 * Configure with VERISTAT_API_URL (defaults to http://localhost:4020). Score
 * lookups are x402-paid in production; in DEMO_MODE the API answers free.
 */

const veristat = new Veristat();

const server = new McpServer({ name: "veristat", version: "0.1.0" });

function asText(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

server.registerTool(
  "check_before_purchase",
  {
    description:
      "Pre-purchase gate for agent spending. Given a paid service's endpoint URL, returns allow/deny with a concrete reason based on Veristat's adversarially verified track record (accuracy vs on-chain ground truth, billing integrity, reliability). Call this BEFORE paying any x402/ASP service.",
    inputSchema: {
      endpointUrl: z.string().describe("The service endpoint URL your agent is about to pay"),
      minScore: z.number().optional().describe("Minimum composite score 0-100 (default 70)"),
      minConfidence: z.number().optional().describe("Minimum confidence 0-1 (default 0.3)"),
      requireVerifiedAccuracy: z.boolean().optional().describe("Reject services whose accuracy is unverified (Tier 3)"),
      onUnknown: z.enum(["allow", "warn", "block"]).optional().describe("Policy when the service is not in the catalog (default warn)"),
    },
  },
  async ({ endpointUrl, ...policy }) => asText(await veristat.guard(endpointUrl, policy as GuardPolicy)),
);

server.registerTool(
  "get_service_score",
  {
    description:
      "Verified track record of a service: composite score, letter grade, confidence, and 5 dimensions (accuracy, reliability, latency, integrity, freshness). accuracy=null means 'not verified', never fabricated.",
    inputSchema: {
      serviceId: z.number().describe("Veristat catalog service id (from compare_category or check_before_purchase)"),
    },
  },
  async ({ serviceId }) => asText(await veristat.score(serviceId)),
);

server.registerTool(
  "compare_category",
  {
    description:
      "Ranked comparison of every scored service in a category (e.g. 'price', 'defi-rates', 'generic'). Use to pick the best-verified provider before spending.",
    inputSchema: {
      category: z.string().describe("Service category to compare"),
    },
  },
  async ({ category }) => asText(await veristat.category(category)),
);

server.registerTool(
  "get_evidence",
  {
    description:
      "Full evidence report for a service: probe samples with x402 payment tx hashes, quoted vs charged amounts, ground-truth inputs, per-tier verdicts, incidents, and score history. Everything is Merkle-anchored on XLayer.",
    inputSchema: {
      serviceId: z.number().describe("Veristat catalog service id"),
    },
  },
  async ({ serviceId }) => asText(await veristat.evidence(serviceId)),
);

const transport = new StdioServerTransport();
await server.connect(transport);
