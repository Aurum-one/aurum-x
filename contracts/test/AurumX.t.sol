// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { AurumX } from "../src/AurumX.sol";

contract AurumXTest is Test {
    AurumX internal aurx;

    address internal owner   = makeAddr("owner");
    address internal dev     = makeAddr("dev");
    address internal alice   = makeAddr("alice");
    address internal bob     = makeAddr("bob");

    // An easy target so tests don't need long PoW loops: requires only that
    // the top byte of the hash is zero (≈ 256 expected attempts).
    uint256 internal constant EASY_TARGET = type(uint256).max >> 8;
    uint256 internal constant CLAIM_FEE   = 0.0001 ether;

    function setUp() public {
        vm.prank(owner);
        aurx = new AurumX(payable(dev), EASY_TARGET, CLAIM_FEE);

        vm.deal(alice, 100 ether);
        vm.deal(bob,   100 ether);
    }

    /* ----------------------------- helpers ------------------------------ */

    function _findNonce(address miner) internal view returns (uint256) {
        bytes32 challenge = aurx.currentChallenge();
        uint256 target    = aurx.target();
        for (uint256 n = 0; n < 1_000_000; ++n) {
            bytes32 h = keccak256(abi.encodePacked(challenge, miner, n));
            if (uint256(h) < target) return n;
        }
        revert("no nonce found");
    }

    /* ------------------------------ tests ------------------------------- */

    function test_metadata() public view {
        assertEq(aurx.name(), "Aurum");
        assertEq(aurx.symbol(), "AURX");
        assertEq(aurx.decimals(), 18);
        assertEq(aurx.totalSupply(), 0);
        assertEq(aurx.MAX_SUPPLY(),   100_000_000 ether);
        assertEq(aurx.BLOCK_REWARD(), 100 ether);
        assertEq(aurx.WALLET_CAP(),   1_000 ether);
    }

    function test_mine_happyPath_mintsRewardAndForwardsFee() public {
        uint256 nonce = _findNonce(alice);
        uint256 devBefore = dev.balance;

        vm.prank(alice);
        aurx.mine{ value: CLAIM_FEE }(nonce);

        assertEq(aurx.balanceOf(alice), 100 ether);
        assertEq(aurx.minedBy(alice),   100 ether);
        assertEq(aurx.totalMined(),     100 ether);
        assertEq(aurx.epoch(),          1);
        assertEq(dev.balance - devBefore, CLAIM_FEE);
    }

    function test_mine_rotatesChallenge() public {
        bytes32 before = aurx.currentChallenge();
        uint256 nonce  = _findNonce(alice);

        vm.prank(alice);
        aurx.mine{ value: CLAIM_FEE }(nonce);

        assertTrue(aurx.currentChallenge() != before, "challenge should rotate");
    }

    function test_mine_revertsOnInvalidPoW() public {
        vm.prank(alice);
        vm.expectRevert(AurumX.InvalidProofOfWork.selector);
        aurx.mine{ value: CLAIM_FEE }(123456789);
    }

    function test_mine_revertsOnInsufficientFee() public {
        uint256 nonce = _findNonce(alice);
        vm.prank(alice);
        vm.expectRevert(AurumX.InsufficientClaimFee.selector);
        aurx.mine{ value: CLAIM_FEE - 1 }(nonce);
    }

    function test_mine_walletCapEnforced() public {
        // Mine 10 successful blocks → exactly 1000 AURX → next attempt should revert.
        for (uint256 i = 0; i < 10; ++i) {
            uint256 nonce = _findNonce(alice);
            vm.prank(alice);
            aurx.mine{ value: CLAIM_FEE }(nonce);
        }

        assertEq(aurx.minedBy(alice), 1_000 ether);
        assertEq(aurx.balanceOf(alice), 1_000 ether);

        uint256 nextNonce = _findNonce(alice);
        vm.prank(alice);
        vm.expectRevert(AurumX.WalletCapReached.selector);
        aurx.mine{ value: CLAIM_FEE }(nextNonce);
    }

    function test_mine_multipleWalletsIndependent() public {
        uint256 nonceA = _findNonce(alice);
        vm.prank(alice);
        aurx.mine{ value: CLAIM_FEE }(nonceA);

        uint256 nonceB = _findNonce(bob);
        vm.prank(bob);
        aurx.mine{ value: CLAIM_FEE }(nonceB);

        assertEq(aurx.balanceOf(alice), 100 ether);
        assertEq(aurx.balanceOf(bob),   100 ether);
        assertEq(aurx.totalMined(),     200 ether);
        assertEq(aurx.epoch(),          2);
    }

    function test_verifySolution_view() public {
        uint256 nonce = _findNonce(alice);
        (bool valid, ) = aurx.verifySolution(alice, nonce);
        assertTrue(valid);

        (bool invalid, ) = aurx.verifySolution(alice, nonce + 1);
        assertFalse(invalid);
    }

    function test_setTarget_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        aurx.setTarget(123);

        vm.prank(owner);
        aurx.setTarget(987);
        assertEq(aurx.target(), 987);

        vm.prank(owner);
        vm.expectRevert(AurumX.InvalidTarget.selector);
        aurx.setTarget(0);
    }

    function test_setClaimFee_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        aurx.setClaimFee(123);

        vm.prank(owner);
        aurx.setClaimFee(0.0005 ether);
        assertEq(aurx.claimFee(), 0.0005 ether);
    }

    function test_setDevWallet_onlyOwner() public {
        vm.prank(owner);
        aurx.setDevWallet(payable(bob));
        assertEq(aurx.devWallet(), bob);

        vm.prank(owner);
        vm.expectRevert(AurumX.InvalidAddress.selector);
        aurx.setDevWallet(payable(address(0)));
    }

    function test_constructor_rejectsZeroDev() public {
        vm.expectRevert(AurumX.InvalidAddress.selector);
        new AurumX(payable(address(0)), EASY_TARGET, CLAIM_FEE);
    }

    function test_constructor_rejectsZeroTarget() public {
        vm.expectRevert(AurumX.InvalidTarget.selector);
        new AurumX(payable(dev), 0, CLAIM_FEE);
    }

    function test_miningState_returnsCurrent() public view {
        (
            bytes32 challenge,
            uint256 target_,
            uint256 epoch_,
            uint256 claimFee_,
            uint256 walletMined,
            uint256 walletRemaining,
            uint256 globalRemaining
        ) = aurx.miningState();

        assertEq(challenge, aurx.currentChallenge());
        assertEq(target_,   EASY_TARGET);
        assertEq(epoch_,    0);
        assertEq(claimFee_, CLAIM_FEE);
        assertEq(walletMined, 0);
        assertEq(walletRemaining, 1_000 ether);
        assertEq(globalRemaining, 100_000_000 ether);
    }

    function test_sweepETH_forwardsToDev() public {
        // Send raw ETH to contract via receive().
        (bool ok, ) = address(aurx).call{ value: 1 ether }("");
        assertTrue(ok);
        assertEq(address(aurx).balance, 1 ether);

        uint256 before = dev.balance;
        vm.prank(owner);
        aurx.sweepETH();
        assertEq(address(aurx).balance, 0);
        assertEq(dev.balance - before, 1 ether);
    }
}
