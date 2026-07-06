import { createHash } from "node:crypto";

/**
 * Minimal Merkle tree over sha256 leaves, matching EvidenceAnchor.sol's
 * verification convention: parent = sha256(sorted-pair concat), odd node promoted.
 * Leaves are hashes of canonicalized ledger rows (see canonicalize()).
 */

export function sha256(data: string | Buffer): Buffer {
  return createHash("sha256").update(data).digest();
}

export function hex(b: Buffer): `0x${string}` {
  return `0x${b.toString("hex")}` as `0x${string}`;
}

/** Deterministic JSON: sorted keys, no whitespace — so any party can recompute leaf hashes. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`)
    .join(",")}}`;
}

export function leafHash(row: unknown): Buffer {
  return sha256(canonicalize(row));
}

function pairHash(a: Buffer, b: Buffer): Buffer {
  // sorted-pair so proofs don't need left/right flags
  return Buffer.compare(a, b) <= 0
    ? sha256(Buffer.concat([a, b]))
    : sha256(Buffer.concat([b, a]));
}

export function merkleRoot(leaves: Buffer[]): Buffer {
  if (leaves.length === 0) return sha256("veristat:empty");
  let level = leaves.slice();
  while (level.length > 1) {
    const next: Buffer[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]!;
      const right = level[i + 1];
      next.push(right ? pairHash(left, right) : left);
    }
    level = next;
  }
  return level[0]!;
}

export function merkleProof(leaves: Buffer[], index: number): Buffer[] {
  if (index < 0 || index >= leaves.length) throw new Error("leaf index out of range");
  const proof: Buffer[] = [];
  let level = leaves.slice();
  let i = index;
  while (level.length > 1) {
    const sibling = i % 2 === 0 ? level[i + 1] : level[i - 1];
    if (sibling) proof.push(sibling);
    const next: Buffer[] = [];
    for (let j = 0; j < level.length; j += 2) {
      const left = level[j]!;
      const right = level[j + 1];
      next.push(right ? pairHash(left, right) : left);
    }
    level = next;
    i = Math.floor(i / 2);
  }
  return proof;
}

/**
 * The exact canonical shape of an anchored verification-ledger row. Anyone can
 * rebuild a leaf as sha256(canonicalize(canonicalVerificationRow(row))) from
 * published evidence and prove inclusion against the on-chain EvidenceAnchor.
 */
export interface AnchoredVerificationRow {
  id: number;
  probeId: number;
  serviceId: number;
  tier: number;
  dimension: string;
  verdict: string;
  expected: unknown;
  actual: unknown;
  groundTruth: unknown;
  createdAt: Date | string;
}

export function canonicalVerificationRow(v: AnchoredVerificationRow) {
  return {
    id: v.id,
    probeId: v.probeId,
    serviceId: v.serviceId,
    tier: v.tier,
    dimension: v.dimension,
    verdict: v.verdict,
    expected: v.expected ?? null,
    actual: v.actual ?? null,
    groundTruth: v.groundTruth ?? null,
    createdAt: new Date(v.createdAt).toISOString(),
  };
}

export function verifyProof(leaf: Buffer, proof: Buffer[], root: Buffer): boolean {
  let acc = leaf;
  for (const sibling of proof) acc = pairHash(acc, sibling);
  return acc.equals(root);
}
