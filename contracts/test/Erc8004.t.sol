// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {IdentityRegistry} from "../src/erc8004/IdentityRegistry.sol";
import {ValidationRegistry} from "../src/erc8004/ValidationRegistry.sol";

contract Erc8004Test is Test {
    IdentityRegistry identity;
    ValidationRegistry validation;

    address veristat = address(0xA11CE);
    address provider = address(0xB0B);

    function setUp() public {
        identity = new IdentityRegistry();
        validation = new ValidationRegistry(identity);
    }

    function test_registerAgents() public {
        vm.prank(veristat);
        uint256 id1 = identity.newAgent("veristat.example", veristat);
        vm.prank(provider);
        uint256 id2 = identity.newAgent("provider.example", provider);
        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(identity.agentCount(), 2);
        assertEq(identity.resolveByAddress(veristat).agentId, 1);
    }

    function test_cannotRegisterForSomeoneElse() public {
        vm.prank(veristat);
        vm.expectRevert(IdentityRegistry.Unauthorized.selector);
        identity.newAgent("provider.example", provider);
    }

    function test_duplicateRegistrationReverts() public {
        vm.startPrank(veristat);
        identity.newAgent("veristat.example", veristat);
        vm.expectRevert(IdentityRegistry.AlreadyRegistered.selector);
        identity.newAgent("veristat2.example", veristat);
        vm.stopPrank();
    }

    function test_validationLifecycle() public {
        vm.prank(veristat);
        uint256 validatorId = identity.newAgent("veristat.example", veristat);
        vm.prank(provider);
        uint256 serverId = identity.newAgent("provider.example", provider);

        bytes32 dataHash = keccak256("evidence-bundle-1");
        vm.prank(veristat);
        validation.validationRequest(validatorId, serverId, dataHash);

        vm.prank(veristat);
        validation.validationResponse(dataHash, 94, "veristat:composite", "https://veristat.example/service/2.json");

        (uint8 score, string memory tag,, uint64 respondedAt) = validation.responses(dataHash);
        assertEq(score, 94);
        assertEq(tag, "veristat:composite");
        assertGt(respondedAt, 0);
        assertEq(validation.validationCount(), 1);
    }

    function test_onlyValidatorCanRespond() public {
        vm.prank(veristat);
        uint256 validatorId = identity.newAgent("veristat.example", veristat);
        bytes32 dataHash = keccak256("evidence");
        vm.prank(veristat);
        validation.validationRequest(validatorId, 0, dataHash);

        vm.prank(provider);
        vm.expectRevert(ValidationRegistry.NotValidator.selector);
        validation.validationResponse(dataHash, 100, "", "");
    }

    function test_scoreCappedAt100() public {
        vm.prank(veristat);
        uint256 validatorId = identity.newAgent("veristat.example", veristat);
        bytes32 dataHash = keccak256("evidence");
        vm.startPrank(veristat);
        validation.validationRequest(validatorId, 0, dataHash);
        vm.expectRevert(ValidationRegistry.ScoreOutOfRange.selector);
        validation.validationResponse(dataHash, 101, "", "");
        vm.stopPrank();
    }

    function test_noDoubleResponse() public {
        vm.prank(veristat);
        uint256 validatorId = identity.newAgent("veristat.example", veristat);
        bytes32 dataHash = keccak256("evidence");
        vm.startPrank(veristat);
        validation.validationRequest(validatorId, 0, dataHash);
        validation.validationResponse(dataHash, 90, "", "");
        vm.expectRevert(ValidationRegistry.AlreadyResponded.selector);
        validation.validationResponse(dataHash, 95, "", "");
        vm.stopPrank();
    }
}
