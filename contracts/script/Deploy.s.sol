// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {EvidenceAnchor} from "../src/EvidenceAnchor.sol";
import {IdentityRegistry} from "../src/erc8004/IdentityRegistry.sol";
import {ValidationRegistry} from "../src/erc8004/ValidationRegistry.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

/// Deploys the full Veristat contract set. MockUSDT is only deployed when
/// DEPLOY_MOCK_USDT=true (testnet); on mainnet the canonical USDT is used.
contract Deploy is Script {
    function run() external {
        bool deployMockUsdt = vm.envOr("DEPLOY_MOCK_USDT", false);

        vm.startBroadcast();
        EvidenceAnchor anchor = new EvidenceAnchor();
        IdentityRegistry identity = new IdentityRegistry();
        ValidationRegistry validation = new ValidationRegistry(identity);
        address usdt = address(0);
        if (deployMockUsdt) {
            usdt = address(new MockUSDT());
        }
        vm.stopBroadcast();

        console.log("EvidenceAnchor:    ", address(anchor));
        console.log("IdentityRegistry:  ", address(identity));
        console.log("ValidationRegistry:", address(validation));
        if (deployMockUsdt) console.log("MockUSDT:          ", usdt);
    }
}
