import { describe, expect, it } from "vitest";
import {
  canonicalize,
  leafHash,
  merkleProof,
  merkleRoot,
  sha256,
  verifyProof,
} from "./merkle.js";

describe("canonicalize", () => {
  it("sorts keys deterministically", () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(canonicalize({ a: 2, b: 1 })).toBe('{"a":2,"b":1}');
  });
  it("handles nesting and arrays", () => {
    expect(canonicalize({ z: [{ y: null, x: "s" }] })).toBe('{"z":[{"x":"s","y":null}]}');
  });
});

describe("merkle", () => {
  const rows = Array.from({ length: 7 }, (_, i) => ({ id: i, verdict: i % 2 ? "pass" : "fail" }));
  const leaves = rows.map(leafHash);
  const root = merkleRoot(leaves);

  it("verifies a proof for every leaf", () => {
    for (let i = 0; i < leaves.length; i++) {
      const proof = merkleProof(leaves, i);
      expect(verifyProof(leaves[i]!, proof, root)).toBe(true);
    }
  });

  it("rejects a tampered leaf", () => {
    const proof = merkleProof(leaves, 3);
    const tampered = leafHash({ id: 3, verdict: "pass", tampered: true });
    expect(verifyProof(tampered, proof, root)).toBe(false);
  });

  it("single leaf tree root equals the leaf", () => {
    const leaf = sha256("only");
    expect(merkleRoot([leaf]).equals(leaf)).toBe(true);
  });

  it("empty tree has a stable sentinel root", () => {
    expect(merkleRoot([]).equals(sha256("veristat:empty"))).toBe(true);
  });
});
