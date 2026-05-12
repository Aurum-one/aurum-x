// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { AurumX } from "../src/AurumX.sol";

/// @notice Deployment script for AurumX.
///
/// Required env vars:
///   DEV_WALLET     — address that receives claim fees & ETH dust
///   INITIAL_TARGET — uint256 target (lower = harder). Default ≈ 1M expected attempts.
///   CLAIM_FEE      — wei per mine() call. Default = 0.0001 ether.
///
/// Usage:
///   forge script script/Deploy.s.sol:DeployScript \
///     --rpc-url base --broadcast --verify -vvvv
contract DeployScript is Script {
    function run() external returns (AurumX aurx) {
        address payable devWallet = payable(vm.envAddress("DEV_WALLET"));
        uint256 initialTarget = vm.envOr("INITIAL_TARGET", type(uint256).max / 500_000);
        uint256 claimFee      = vm.envOr("CLAIM_FEE",      uint256(0.0001 ether));

        console2.log("Deploying AurumX with:");
        console2.log("  devWallet     ", devWallet);
        console2.log("  initialTarget ", initialTarget);
        console2.log("  claimFee (wei)", claimFee);

        vm.startBroadcast();
        aurx = new AurumX(devWallet, initialTarget, claimFee);
        vm.stopBroadcast();

        console2.log("AurumX deployed at:", address(aurx));
    }
}
