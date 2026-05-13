---
name: testing-aurum-x-ui
description: Test Aurum X frontend flows, especially the Mine page, Vercel production/preview deployments, and claim-fee copy cleanup.
---

# Aurum X UI Testing

Use this skill when validating Aurum X frontend changes in `Aurum-one/aurum-x`.

## Devin Secrets Needed

- `VERCEL_TOKEN` — optional but useful for checking existing Vercel deployments and alias state via API. Do not run `vercel deploy` or `vercel link` for this repo.
- `AURX_TEST_WALLET_PRIVATE_KEY` — only needed if testing real wallet-connected mining or claim submission. Not needed for non-auth visual UI checks.
- `BASE_RPC_URL` — only needed if a test requires a specific Base RPC endpoint beyond the app's configured provider.

## Setup

- Install dependencies with `pnpm install --frozen-lockfile` if dependencies are missing.
- Local dev server: `pnpm dev`.
- Validation commands: `pnpm lint` and `pnpm build`.
- Production app: `https://aurum-x.vercel.app/`.
- Mine page: `https://aurum-x.vercel.app/mine`.

## Vercel Notes

- Do not use Vercel CLI deploy/link; the project is already connected to GitHub/Vercel.
- Vercel preview URLs may be protected. If previews are inaccessible, test the merged production deployment or run the PR branch locally.
- The `Continuous AI: the dev` check may fail as an external optional check with `Agent encountered an error`; verify Vercel separately before treating the deployment as failed.

## Mine Page CPU/GPU Selector Test

1. Open `/mine`.
2. Verify the page shows `Find the next block.` and an `Engine` card.
3. Verify two mode buttons are visible: `cpu` and `gpu`.
4. Verify `cpu` is selected by default.
5. Click `gpu` and verify only `gpu` becomes selected.
6. Click `cpu` and verify only `cpu` becomes selected.
7. Without a connected wallet, verify the start button stays `Awaiting wallet` and does not begin hashing.

For code-level confirmation of CPU weighting, check `src/hooks/useMiner.ts`: `MODE_LANES` should map `cpu: 5` and `gpu: 1`, and workers should use `nonceStride` so lanes search distinct nonce sequences.

## Claim-Fee Copy Regression Check

When testing claim-fee copy cleanup, verify production HTML and visible UI do not include:

- `Claim fee`
- `CLAIM FEE`
- `0.0001`
- `dev wallet`
- `ETH claim fees`
- `routed to dev`

Also verify expected remaining content still renders, such as `Max supply`, `Block reward`, and `Wallet cap`.
