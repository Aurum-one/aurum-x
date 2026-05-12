// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title  Aurum (AURX) — proof-of-work mineable token on Base
/// @notice Each mined block awards a fixed amount of AURX to the miner that submits a
///         nonce producing a keccak256 digest below the current network target. A small
///         ETH fee per claim is forwarded to the protocol dev wallet.
/// @dev    The mining challenge is the previous winning solution, which prevents nonce
///         pre-computation: as soon as someone mines, the challenge rotates and all
///         in-flight nonces become invalid.
contract AurumX is ERC20, Ownable, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  CONSTANTS                                 */
    /* -------------------------------------------------------------------------- */

    /// @notice Hard-capped total supply.
    uint256 public constant MAX_SUPPLY   = 100_000_000 ether;

    /// @notice Reward paid out per successful mine.
    uint256 public constant BLOCK_REWARD = 100 ether;

    /// @notice Maximum tokens a single wallet can ever mine.
    uint256 public constant WALLET_CAP   = 1_000 ether;

    /* -------------------------------------------------------------------------- */
    /*                                   STATE                                    */
    /* -------------------------------------------------------------------------- */

    /// @notice The hash miners must beat: keccak256(challenge, miner, nonce) < target.
    uint256 public target;

    /// @notice ETH required to submit a mine call. Forwarded to devWallet.
    uint256 public claimFee;

    /// @notice Recipient of all claim fees.
    address payable public devWallet;

    /// @notice The previous winning solution; rotates after every successful mine.
    bytes32 public currentChallenge;

    /// @notice Monotonic counter; increments each successful mine.
    uint256 public epoch;

    /// @notice Cumulative AURX minted through mining.
    uint256 public totalMined;

    /// @notice AURX mined per wallet (used to enforce WALLET_CAP).
    mapping(address => uint256) public minedBy;

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event Mined(
        address indexed miner,
        uint256 indexed epoch,
        uint256 nonce,
        bytes32 solution,
        uint256 reward
    );
    event ChallengeRotated(uint256 indexed epoch, bytes32 challenge);
    event TargetUpdated(uint256 target);
    event ClaimFeeUpdated(uint256 fee);
    event DevWalletUpdated(address devWallet);

    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error InvalidProofOfWork();
    error InsufficientClaimFee();
    error WalletCapReached();
    error MaxSupplyReached();
    error FeeTransferFailed();
    error InvalidAddress();
    error InvalidTarget();

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address payable _devWallet, uint256 _initialTarget, uint256 _claimFee)
        ERC20("Aurum", "AURX")
        Ownable(msg.sender)
    {
        if (_devWallet == address(0)) revert InvalidAddress();
        if (_initialTarget == 0) revert InvalidTarget();

        devWallet = _devWallet;
        target    = _initialTarget;
        claimFee  = _claimFee;

        currentChallenge = keccak256(
            abi.encodePacked(block.number, block.prevrandao, block.timestamp, address(this), msg.sender)
        );

        emit DevWalletUpdated(_devWallet);
        emit TargetUpdated(_initialTarget);
        emit ClaimFeeUpdated(_claimFee);
        emit ChallengeRotated(0, currentChallenge);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  MINING                                    */
    /* -------------------------------------------------------------------------- */

    /// @notice Submit a proof-of-work nonce to mine the next block.
    /// @param  nonce Any 256-bit value such that keccak256(challenge ‖ miner ‖ nonce) < target.
    /// @dev    Reverts if msg.value < claimFee, the PoW is invalid, the wallet cap is
    ///         hit, or the supply cap is hit. On success, mints BLOCK_REWARD AURX to
    ///         the caller, rotates the challenge, and forwards msg.value to devWallet.
    function mine(uint256 nonce) external payable nonReentrant {
        if (msg.value < claimFee) revert InsufficientClaimFee();
        if (minedBy[msg.sender] + BLOCK_REWARD > WALLET_CAP) revert WalletCapReached();
        if (totalMined + BLOCK_REWARD > MAX_SUPPLY) revert MaxSupplyReached();

        bytes32 solution = keccak256(abi.encodePacked(currentChallenge, msg.sender, nonce));
        if (uint256(solution) >= target) revert InvalidProofOfWork();

        unchecked {
            minedBy[msg.sender] += BLOCK_REWARD;
            totalMined          += BLOCK_REWARD;
            epoch               += 1;
        }
        currentChallenge = solution;

        _mint(msg.sender, BLOCK_REWARD);

        (bool ok, ) = devWallet.call{ value: msg.value }("");
        if (!ok) revert FeeTransferFailed();

        emit Mined(msg.sender, epoch, nonce, solution, BLOCK_REWARD);
        emit ChallengeRotated(epoch, currentChallenge);
    }

    /// @notice Convenience read used by the web miner — returns all the state needed to
    ///         start hashing in a single call.
    function miningState()
        external
        view
        returns (
            bytes32 challenge,
            uint256 _target,
            uint256 _epoch,
            uint256 _claimFee,
            uint256 walletMined,
            uint256 walletRemaining,
            uint256 globalRemaining
        )
    {
        uint256 mined = minedBy[msg.sender];
        uint256 remainingWallet = mined >= WALLET_CAP ? 0 : WALLET_CAP - mined;
        uint256 remainingGlobal = totalMined >= MAX_SUPPLY ? 0 : MAX_SUPPLY - totalMined;
        return (currentChallenge, target, epoch, claimFee, mined, remainingWallet, remainingGlobal);
    }

    /// @notice Off-chain helper: verify a candidate solution without spending gas.
    function verifySolution(address miner, uint256 nonce) external view returns (bool valid, bytes32 solution) {
        solution = keccak256(abi.encodePacked(currentChallenge, miner, nonce));
        valid    = uint256(solution) < target;
    }

    /* -------------------------------------------------------------------------- */
    /*                              ADMIN — TUNABLES                              */
    /* -------------------------------------------------------------------------- */

    function setTarget(uint256 newTarget) external onlyOwner {
        if (newTarget == 0) revert InvalidTarget();
        target = newTarget;
        emit TargetUpdated(newTarget);
    }

    function setClaimFee(uint256 newFee) external onlyOwner {
        claimFee = newFee;
        emit ClaimFeeUpdated(newFee);
    }

    function setDevWallet(address payable newWallet) external onlyOwner {
        if (newWallet == address(0)) revert InvalidAddress();
        devWallet = newWallet;
        emit DevWalletUpdated(newWallet);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  RESCUE                                    */
    /* -------------------------------------------------------------------------- */

    receive() external payable {}

    /// @notice Forward any ETH that ended up on the contract to the dev wallet.
    function sweepETH() external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        if (bal == 0) return;
        (bool ok, ) = devWallet.call{ value: bal }("");
        if (!ok) revert FeeTransferFailed();
    }
}
