import { base } from "wagmi/chains";

// Address is populated after on-chain deploy; until then, the mining UI
// will gracefully show a "not yet deployed" state.
export const AURX_ADDRESS = (process.env.NEXT_PUBLIC_AURX_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const AURX_CHAIN_ID = base.id;

// Token economics — kept in sync with the AurumX contract.
export const TOKENOMICS = {
  name: "Aurum",
  symbol: "AURX",
  decimals: 18,
  maxSupply: 100_000_000n * 10n ** 18n,
  blockReward: 100n * 10n ** 18n,
  walletCap: 1_000n * 10n ** 18n,
  network: "Base Mainnet",
  chainId: base.id,
} as const;

export const AURX_ABI = [
  // ----- ERC-20 reads -----
  { type: "function", name: "name",     stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol",   stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },

  // ----- Constants -----
  { type: "function", name: "MAX_SUPPLY",   stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "BLOCK_REWARD", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "WALLET_CAP",   stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

  // ----- Mining state -----
  { type: "function", name: "currentChallenge", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "target",           stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "epoch",            stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "claimFee",         stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "devWallet",        stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "totalMined",       stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function", name: "minedBy", stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "miningState", stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "challenge", type: "bytes32" },
      { name: "_target", type: "uint256" },
      { name: "_epoch", type: "uint256" },
      { name: "_claimFee", type: "uint256" },
      { name: "walletMined", type: "uint256" },
      { name: "walletRemaining", type: "uint256" },
      { name: "globalRemaining", type: "uint256" },
    ],
  },

  // ----- Mining write -----
  {
    type: "function", name: "mine", stateMutability: "payable",
    inputs: [{ name: "nonce", type: "uint256" }],
    outputs: [],
  },

  // ----- Events -----
  {
    type: "event", name: "Mined", anonymous: false,
    inputs: [
      { indexed: true,  name: "miner",    type: "address" },
      { indexed: true,  name: "epoch",    type: "uint256" },
      { indexed: false, name: "nonce",    type: "uint256" },
      { indexed: false, name: "solution", type: "bytes32" },
      { indexed: false, name: "reward",   type: "uint256" },
    ],
  },
  {
    type: "event", name: "ChallengeRotated", anonymous: false,
    inputs: [
      { indexed: true,  name: "epoch",     type: "uint256" },
      { indexed: false, name: "challenge", type: "bytes32" },
    ],
  },
] as const;
