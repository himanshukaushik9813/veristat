// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IdentityRegistry} from "./IdentityRegistry.sol";

/// @title ERC-8004 Validation Registry (minimal implementation)
/// @notice The registry designed for independent validators — the one that sits
///         effectively empty across deployments because populating it requires
///         someone who actually verifies services in production. Veristat is its
///         first serious feed on XLayer: each response carries a 0–100 score and
///         an evidence URI pointing at a scorecard whose underlying ledger rows
///         are Merkle-anchored in EvidenceAnchor.
contract ValidationRegistry {
    struct Request {
        uint256 validatorAgentId;
        uint256 serverAgentId; // the rated service's agent id (0 if unregistered)
        bytes32 dataHash; // hash of the evidence bundle being attested
        uint64 requestedAt;
        bool responded;
    }

    struct Response {
        uint8 response; // 0–100 composite score
        string tag; // e.g. "veristat:composite" or a dimension
        string uri; // evidence URI (scorecard JSON, includes anchor proofs)
        uint64 respondedAt;
    }

    IdentityRegistry public immutable identityRegistry;

    mapping(bytes32 => Request) public requests;
    mapping(bytes32 => Response) public responses;
    bytes32[] private _dataHashes;

    event ValidationRequested(
        uint256 indexed validatorAgentId, uint256 indexed serverAgentId, bytes32 indexed dataHash
    );
    event ValidationResponded(
        uint256 indexed validatorAgentId,
        uint256 indexed serverAgentId,
        bytes32 indexed dataHash,
        uint8 response,
        string tag,
        string uri
    );

    error UnknownValidator();
    error NotValidator();
    error UnknownRequest();
    error AlreadyResponded();
    error ScoreOutOfRange();

    constructor(IdentityRegistry identity) {
        identityRegistry = identity;
    }

    /// @notice Announce an upcoming validation of `serverAgentId` over `dataHash`.
    function validationRequest(uint256 validatorAgentId, uint256 serverAgentId, bytes32 dataHash) external {
        IdentityRegistry.AgentInfo memory v = identityRegistry.getAgent(validatorAgentId);
        if (v.agentId == 0) revert UnknownValidator();
        if (v.agentAddress != msg.sender) revert NotValidator();

        requests[dataHash] = Request({
            validatorAgentId: validatorAgentId,
            serverAgentId: serverAgentId,
            dataHash: dataHash,
            requestedAt: uint64(block.timestamp),
            responded: false
        });
        _dataHashes.push(dataHash);
        emit ValidationRequested(validatorAgentId, serverAgentId, dataHash);
    }

    /// @notice Publish the verdict for a previously announced validation.
    function validationResponse(bytes32 dataHash, uint8 response, string calldata tag, string calldata uri)
        external
    {
        Request storage req = requests[dataHash];
        if (req.requestedAt == 0) revert UnknownRequest();
        if (req.responded) revert AlreadyResponded();
        if (response > 100) revert ScoreOutOfRange();
        IdentityRegistry.AgentInfo memory v = identityRegistry.getAgent(req.validatorAgentId);
        if (v.agentAddress != msg.sender) revert NotValidator();

        req.responded = true;
        responses[dataHash] = Response({
            response: response,
            tag: tag,
            uri: uri,
            respondedAt: uint64(block.timestamp)
        });
        emit ValidationResponded(req.validatorAgentId, req.serverAgentId, dataHash, response, tag, uri);
    }

    function validationCount() external view returns (uint256) {
        return _dataHashes.length;
    }

    function dataHashAt(uint256 index) external view returns (bytes32) {
        return _dataHashes[index];
    }
}
