import { parseAbi } from "viem";
import {
  canonicalize,
  createLogger,
  deployment,
  sha256,
  type ChainKey,
} from "@veristat/shared";
import { publicClient, treasuryAccount, walletClient } from "@veristat/chain";
import {
  insertAttestation,
  latestScore,
  listServices,
  markAttestation,
  pendingAttestationForScore,
} from "@veristat/db";

const log = createLogger("attestor");

const IDENTITY_ABI = parseAbi([
  "function newAgent(string agentDomain, address agentAddress) returns (uint256)",
  "function agentIdByAddress(address) view returns (uint256)",
]);
const VALIDATION_ABI = parseAbi([
  "function validationRequest(uint256 validatorAgentId, uint256 serverAgentId, bytes32 dataHash)",
  "function validationResponse(bytes32 dataHash, uint8 response, string tag, string uri)",
]);

const CHAIN: ChainKey = (process.env.ATTEST_CHAIN as ChainKey) ?? "xlayerTestnet";
const MIN_CONFIDENCE = Number(process.env.ATTEST_MIN_CONFIDENCE ?? 0.5);

/**
 * Attestation publisher (spec §5.5): settled verdicts become ERC-8004
 * Validation Registry responses — score 0–100 + evidence URI — so any wallet,
 * framework, or marketplace can consume Veristat verdicts without touching
 * Veristat's API. Attests only scores with enough evidence behind them.
 */
export async function runAttestor(): Promise<void> {
  const dep = deployment(CHAIN);
  if (!dep.identityRegistry || !dep.validationRegistry || !process.env.PROBE_MNEMONIC) {
    return; // contracts not deployed yet — nothing to publish
  }
  const account = treasuryAccount();
  const client = publicClient(CHAIN);
  const wallet = walletClient(CHAIN, account);

  // Ensure Veristat itself is registered as a validator agent.
  let agentId = await client.readContract({
    address: dep.identityRegistry,
    abi: IDENTITY_ABI,
    functionName: "agentIdByAddress",
    args: [account.address],
  });
  if (agentId === 0n) {
    const domain = process.env.VERISTAT_AGENT_DOMAIN ?? "veristat.demo";
    const tx = await wallet.writeContract({
      address: dep.identityRegistry,
      abi: IDENTITY_ABI,
      functionName: "newAgent",
      args: [domain, account.address],
      chain: wallet.chain,
      account,
    });
    await client.waitForTransactionReceipt({ hash: tx });
    agentId = await client.readContract({
      address: dep.identityRegistry,
      abi: IDENTITY_ABI,
      functionName: "agentIdByAddress",
      args: [account.address],
    });
    log.info("registered Veristat in ERC-8004 Identity Registry", { agentId: agentId.toString(), tx });
  }

  const services = await listServices({ status: "active" });
  for (const service of services) {
    const score = await latestScore(service.id);
    if (!score || score.confidence < MIN_CONFIDENCE) continue;
    if (await pendingAttestationForScore(score.id)) continue;

    const evidenceUri = `${process.env.PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/services/${service.id}/scorecard`;
    const bundle = canonicalize({
      serviceId: service.id,
      endpoint: service.endpoint,
      scoreId: score.id,
      composite: score.composite,
      computedAt: new Date(score.computedAt).toISOString(),
    });
    const dataHash = `0x${sha256(bundle).toString("hex")}` as `0x${string}`;
    const attId = await insertAttestation({
      serviceId: service.id,
      scoreId: score.id,
      chain: CHAIN,
      registryAddress: dep.validationRegistry,
      evidenceUri,
      response: Math.round(score.composite),
    });

    try {
      const reqTx = await wallet.writeContract({
        address: dep.validationRegistry,
        abi: VALIDATION_ABI,
        functionName: "validationRequest",
        args: [agentId, 0n, dataHash],
        chain: wallet.chain,
        account,
      });
      await client.waitForTransactionReceipt({ hash: reqTx });
      const resTx = await wallet.writeContract({
        address: dep.validationRegistry,
        abi: VALIDATION_ABI,
        functionName: "validationResponse",
        args: [dataHash, Math.round(score.composite), "veristat:composite", evidenceUri],
        chain: wallet.chain,
        account,
      });
      await client.waitForTransactionReceipt({ hash: resTx });
      await markAttestation(attId, { txHash: resTx, requestHash: dataHash, status: "confirmed" });
      log.info("attested score on-chain", {
        service: service.name,
        score: Math.round(score.composite),
        tx: resTx,
      });
    } catch (err) {
      await markAttestation(attId, { status: "failed" });
      log.error("attestation failed", { service: service.name, err: String(err) });
    }
  }
}
