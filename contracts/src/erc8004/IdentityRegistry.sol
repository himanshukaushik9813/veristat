// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ERC-8004 Identity Registry (minimal implementation)
/// @notice Agent identities per ERC-8004 (Trustless Agents): an on-chain handle
///         (agentId) bound to an agent domain (where the registration file lives)
///         and an agent address. Deployed on XLayer where no canonical instance
///         exists yet; interface-compatible with the reference implementation.
contract IdentityRegistry {
    struct AgentInfo {
        uint256 agentId;
        string agentDomain;
        address agentAddress;
    }

    uint256 private _nextId = 1;
    mapping(uint256 => AgentInfo) private _agents;
    mapping(address => uint256) public agentIdByAddress;
    mapping(bytes32 => uint256) public agentIdByDomainHash;

    event AgentRegistered(uint256 indexed agentId, string agentDomain, address indexed agentAddress);
    event AgentUpdated(uint256 indexed agentId, string agentDomain, address indexed agentAddress);

    error Unauthorized();
    error AlreadyRegistered();
    error UnknownAgent();

    function newAgent(string calldata agentDomain, address agentAddress) external returns (uint256 agentId) {
        if (msg.sender != agentAddress) revert Unauthorized();
        if (agentIdByAddress[agentAddress] != 0) revert AlreadyRegistered();
        bytes32 domainHash = keccak256(bytes(agentDomain));
        if (agentIdByDomainHash[domainHash] != 0) revert AlreadyRegistered();

        agentId = _nextId++;
        _agents[agentId] = AgentInfo(agentId, agentDomain, agentAddress);
        agentIdByAddress[agentAddress] = agentId;
        agentIdByDomainHash[domainHash] = agentId;
        emit AgentRegistered(agentId, agentDomain, agentAddress);
    }

    function updateAgent(uint256 agentId, string calldata newDomain, address newAddress) external {
        AgentInfo storage info = _agents[agentId];
        if (info.agentId == 0) revert UnknownAgent();
        if (msg.sender != info.agentAddress) revert Unauthorized();

        delete agentIdByAddress[info.agentAddress];
        delete agentIdByDomainHash[keccak256(bytes(info.agentDomain))];
        info.agentDomain = newDomain;
        info.agentAddress = newAddress;
        agentIdByAddress[newAddress] = agentId;
        agentIdByDomainHash[keccak256(bytes(newDomain))] = agentId;
        emit AgentUpdated(agentId, newDomain, newAddress);
    }

    function getAgent(uint256 agentId) external view returns (AgentInfo memory) {
        return _agents[agentId];
    }

    function resolveByAddress(address agentAddress) external view returns (AgentInfo memory) {
        return _agents[agentIdByAddress[agentAddress]];
    }

    function agentCount() external view returns (uint256) {
        return _nextId - 1;
    }
}
