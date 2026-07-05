// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {EvidenceAnchor} from "../src/EvidenceAnchor.sol";

contract EvidenceAnchorTest is Test {
    EvidenceAnchor anchor;
    address stranger = address(0xBEEF);

    function setUp() public {
        anchor = new EvidenceAnchor();
    }

    function _pair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a <= b ? sha256(abi.encodePacked(a, b)) : sha256(abi.encodePacked(b, a));
    }

    function test_anchorAndRead() public {
        uint256 idx = anchor.anchor(bytes32(uint256(1)), 1, 10, 10, "https://veristat.example/anchors/0");
        assertEq(idx, 0);
        assertEq(anchor.anchorCount(), 1);
        EvidenceAnchor.Anchor memory a = anchor.getAnchor(0);
        assertEq(a.merkleRoot, bytes32(uint256(1)));
        assertEq(a.fromId, 1);
        assertEq(a.toId, 10);
        assertEq(a.leafCount, 10);
    }

    function test_onlyOwnerCanAnchor() public {
        vm.prank(stranger);
        vm.expectRevert(EvidenceAnchor.NotOwner.selector);
        anchor.anchor(bytes32(0), 1, 2, 2, "");
    }

    function test_rejectsEmptyRange() public {
        vm.expectRevert(EvidenceAnchor.EmptyRange.selector);
        anchor.anchor(bytes32(0), 5, 4, 1, "");
        vm.expectRevert(EvidenceAnchor.EmptyRange.selector);
        anchor.anchor(bytes32(0), 1, 2, 0, "");
    }

    /// Build a 4-leaf sha256 sorted-pair tree in Solidity and verify each leaf,
    /// mirroring the off-chain construction in packages/shared/src/merkle.ts.
    function test_verifyLeaf_fourLeaves() public {
        bytes32[4] memory leaves = [
            sha256("row-1"),
            sha256("row-2"),
            sha256("row-3"),
            sha256("row-4")
        ];
        bytes32 n01 = _pair(leaves[0], leaves[1]);
        bytes32 n23 = _pair(leaves[2], leaves[3]);
        bytes32 root = _pair(n01, n23);
        anchor.anchor(root, 1, 4, 4, "");

        bytes32[] memory proof = new bytes32[](2);
        // leaf 0: sibling leaf 1, then n23
        proof[0] = leaves[1];
        proof[1] = n23;
        assertTrue(anchor.verifyLeaf(0, leaves[0], proof));
        // leaf 3: sibling leaf 2, then n01
        proof[0] = leaves[2];
        proof[1] = n01;
        assertTrue(anchor.verifyLeaf(0, leaves[3], proof));
        // tampered leaf fails
        assertFalse(anchor.verifyLeaf(0, sha256("row-x"), proof));
    }

    /// Odd leaf count: last node is promoted, its proof is shorter.
    function test_verifyLeaf_oddPromotion() public {
        bytes32[3] memory leaves = [sha256("a"), sha256("b"), sha256("c")];
        bytes32 n01 = _pair(leaves[0], leaves[1]);
        bytes32 root = _pair(n01, leaves[2]);
        anchor.anchor(root, 1, 3, 3, "");

        bytes32[] memory proof = new bytes32[](1);
        proof[0] = n01;
        assertTrue(anchor.verifyLeaf(0, leaves[2], proof));
    }

    function test_ownershipTransfer() public {
        anchor.setOwner(stranger);
        vm.expectRevert(EvidenceAnchor.NotOwner.selector);
        anchor.anchor(bytes32(0), 1, 1, 1, "");
        vm.prank(stranger);
        anchor.anchor(bytes32(uint256(2)), 1, 1, 1, "");
        assertEq(anchor.anchorCount(), 1);
    }
}
