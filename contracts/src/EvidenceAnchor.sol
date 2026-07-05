// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title EvidenceAnchor
/// @notice Periodic Merkle-root anchoring of Veristat's evidence ledger (spec §5.4).
///         Each anchor covers a contiguous range of verification-ledger rows; leaves
///         are sha256 hashes of canonicalized rows, combined as sorted pairs, odd
///         node promoted — matching packages/shared/src/merkle.ts exactly. Anyone
///         can recompute a leaf from published evidence and prove inclusion.
contract EvidenceAnchor {
    struct Anchor {
        bytes32 merkleRoot;
        uint64 fromId; // first verification row id covered (inclusive)
        uint64 toId; // last verification row id covered (inclusive)
        uint64 leafCount;
        uint64 timestamp;
        string uri; // where the covered evidence rows can be fetched
    }

    address public owner;
    Anchor[] private _anchors;

    event EvidenceAnchored(
        uint256 indexed index,
        bytes32 merkleRoot,
        uint64 fromId,
        uint64 toId,
        uint64 leafCount,
        string uri
    );
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error EmptyRange();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) external onlyOwner {
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    function anchor(
        bytes32 merkleRoot,
        uint64 fromId,
        uint64 toId,
        uint64 leafCount,
        string calldata uri
    ) external onlyOwner returns (uint256 index) {
        if (toId < fromId || leafCount == 0) revert EmptyRange();
        _anchors.push(
            Anchor({
                merkleRoot: merkleRoot,
                fromId: fromId,
                toId: toId,
                leafCount: leafCount,
                timestamp: uint64(block.timestamp),
                uri: uri
            })
        );
        index = _anchors.length - 1;
        emit EvidenceAnchored(index, merkleRoot, fromId, toId, leafCount, uri);
    }

    function anchorCount() external view returns (uint256) {
        return _anchors.length;
    }

    function getAnchor(uint256 index) external view returns (Anchor memory) {
        return _anchors[index];
    }

    function latestAnchor() external view returns (Anchor memory) {
        return _anchors[_anchors.length - 1];
    }

    /// @notice Verify that `leaf` is included under anchor `index`.
    /// @dev sha256 sorted-pair combination, mirroring the off-chain tree.
    function verifyLeaf(uint256 index, bytes32 leaf, bytes32[] calldata proof)
        external
        view
        returns (bool)
    {
        bytes32 acc = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 sib = proof[i];
            acc = acc <= sib
                ? sha256(abi.encodePacked(acc, sib))
                : sha256(abi.encodePacked(sib, acc));
        }
        return acc == _anchors[index].merkleRoot;
    }
}
