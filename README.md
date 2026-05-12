# Aurum (AURX)

> Proof-of-Work, refined.
> A fixed-supply, mineable ERC-20 on **Base Mainnet**.

Aurum is a scarce digital asset whose only emission path is on-chain proof-of-work.
There is no presale, no airdrop, no inflation. To earn AURX, you submit a nonce whose
keccak256 digest beats the current network target — and the contract mints you the
block reward.

| Parameter        | Value                              |
| ---------------- | ---------------------------------- |
| Name             | Aurum                              |
| Ticker           | **AURX**                           |
| Chain            | Base Mainnet (chain id `8453`)     |
| Standard         | ERC-20, 18 decimals                |
| Max supply       | **100,000,000 AURX**               |
| Block reward     | **100 AURX** per valid mine        |
| Wallet cap       | **1,000 AURX** per wallet (lifetime) |
| Claim fee        | **0.0001 ETH** per mine, routed to dev wallet |
| Mining algorithm | `keccak256(challenge ‖ miner ‖ nonce) < target` |

---

## Repository layout

```
aurum-x/
├── contracts/         # Foundry project — AurumX.sol + tests + deploy script
│   ├── src/AurumX.sol
│   ├── test/AurumX.t.sol
│   └── script/Deploy.s.sol
├── src/               # Next.js 14 app (App Router)
│   ├── app/           # Landing + /mine page
│   ├── components/    # Hero, Tokenomics, Roadmap, MiningDashboard, …
│   ├── hooks/         # useMiner — wraps the Web Worker
│   ├── lib/           # ABI, address, formatting helpers
│   └── workers/       # miner.worker.ts — keccak256 hot loop
├── public/            # Aurum mark + wordmark SVGs
└── README.md
```

---

## How mining works

1. **Read the challenge.** The contract exposes `currentChallenge` — a 32-byte digest
   that rotates after every mined block.
2. **Hash locally.** A Web Worker in your browser hashes
   `keccak256(currentChallenge ‖ your-address ‖ nonce)` for incrementing nonces.
3. **Beat the target.** If the digest, interpreted as a `uint256`, is strictly less
   than the on-chain `target`, you've found a valid proof-of-work.
4. **Claim on-chain.** Submit the winning nonce via `mine(nonce)` with the 0.0001 ETH
   claim fee. The contract re-verifies the hash, mints **100 AURX** to you, rotates the
   challenge, and forwards the fee to the dev wallet — all atomically.

Because the challenge rotates on every successful mine, any in-flight nonces become
invalid the moment someone else lands a block. This is true PoW — no off-chain signer,
no relayer, no oracle.

### Constraints, in order

```
require(msg.value >= claimFee)
require(minedBy[msg.sender] + 100 ≤ 1_000 AURX)   // wallet cap
require(totalMined + 100 ≤ 100_000_000 AURX)      // global supply cap
require(uint256(keccak256(challenge, sender, nonce)) < target)   // PoW
```

If any of those fail, the transaction reverts and your fee stays in your wallet
(modulo gas).

---

## Smart contract

`contracts/src/AurumX.sol` is a single-file ERC-20 with the mining primitive built in.
All admin functions (`setTarget`, `setClaimFee`, `setDevWallet`, `sweepETH`) are
`onlyOwner`. The supply cap, block reward, and wallet cap are **immutable constants**
— governance can never change them.

### Run the test suite

```bash
cd contracts
forge install                 # one-time
forge build
forge test -vv
```

All 15 tests cover: happy-path mining, challenge rotation, invalid PoW, insufficient
fee, wallet cap, supply cap, multi-wallet independence, admin tunables, and ETH rescue.

### Deploy to Base Mainnet

```bash
cd contracts

export BASE_RPC_URL=https://mainnet.base.org
export BASESCAN_API_KEY=<your-basescan-key>
export DEV_WALLET=<address-that-receives-fees>
export PRIVATE_KEY=<deployer-private-key>

# Optional overrides:
export INITIAL_TARGET=$(printf '%.f' "$(python3 -c 'print(2**256 // 500_000)')")
export CLAIM_FEE=100000000000000   # 0.0001 ETH in wei

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv
```

> **Use a dedicated deployer wallet.** Fund it with the bare minimum ETH needed for
> the deploy (~0.005 ETH on Base). Never deploy with a wallet holding significant
> assets.

After deployment, set `NEXT_PUBLIC_AURX_ADDRESS` to the deployed contract address in
the Next.js app and redeploy the frontend.

---

## Frontend

The frontend is a Next.js 14 App Router project styled with Tailwind. Wallet
connection uses RainbowKit; reads/writes use wagmi + viem. The mining engine is a
single dedicated Web Worker using `@noble/hashes` for keccak256.

### Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` for the landing page and `/mine` for the miner. Until
the contract address is configured, the miner shows a "not yet deployed" banner — all
read functions are gated behind the address check so nothing crashes.

### Environment variables

| Variable                       | Purpose                                                 |
| ------------------------------ | ------------------------------------------------------- |
| `NEXT_PUBLIC_AURX_ADDRESS`     | Deployed `AurumX` address on Base.                      |
| `NEXT_PUBLIC_BASE_RPC_URL`     | Optional Base RPC override (defaults to public).        |
| `NEXT_PUBLIC_WC_PROJECT_ID`    | WalletConnect Cloud project id (optional, recommended). |

### Build for production

```bash
pnpm build
pnpm start
```

---

## Brand

- **Mark.** A hexagonal ingot enclosing a monoline "A". The lines never glow — gold
  is treated as material, not light.
- **Palette.** Refined gold (`#D4A85C`), deep navy (`#0B1322`), neutral charcoal,
  bone (`#EFE8DA`). Backgrounds are dark by default; gold is reserved for typographic
  accents and primary actions.
- **Typography.** `Cormorant Garamond` for display, `Inter` for body, `JetBrains
  Mono` for hashes, addresses, and protocol metadata.

The mark is shipped as plain SVG in `public/aurum-mark.svg` and `public/aurum-logo.svg`
and as a React component in `src/components/AurumMark.tsx`.

---

## Roadmap

- **Phase I · Vein (now).** Mainnet ignition. Contract live on Base. Browser CPU miner.
- **Phase II · Ore.** WebGPU miner. Public pool relay. Community-driven re-target.
- **Phase III · Foundry.** Aerodrome/Uniswap pool. Headless CLI miner. Independent audit.
- **Phase IV · Reserve.** Lending integrations. AURX-denominated payments. Multi-sig
  hand-off.

Phases ship only when the prior phase is verifiably mined out.

---

## License

MIT. See [`LICENSE`](./LICENSE).
