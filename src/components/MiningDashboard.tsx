"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AURX_ABI, AURX_ADDRESS, AURX_CHAIN_ID, TOKENOMICS } from "@/lib/contract";
import { uint256ToHex32, useMiner, type MinerState } from "@/hooks/useMiner";
import { formatDuration, formatHashRate, formatToken } from "@/lib/format";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

export function MiningDashboard() {
  const { address, isConnected, chainId } = useAccount();
  const wrongNetwork = isConnected && chainId !== AURX_CHAIN_ID;
  const notDeployed = AURX_ADDRESS === ZERO_ADDR;

  // --- on-chain reads ---
  const { data: challenge, refetch: refetchChallenge } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "currentChallenge",
    query: { enabled: !notDeployed, refetchInterval: 12_000 },
  });
  const { data: target } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "target",
    query: { enabled: !notDeployed, refetchInterval: 30_000 },
  });
  const { data: epoch } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "epoch",
    query: { enabled: !notDeployed, refetchInterval: 12_000 },
  });
  const { data: claimFee } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "claimFee",
    query: { enabled: !notDeployed },
  });
  const { data: walletMined, refetch: refetchWallet } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "minedBy",
    args: address ? [address] : undefined,
    query: { enabled: !notDeployed && !!address, refetchInterval: 15_000 },
  });
  const { data: balance } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !notDeployed && !!address, refetchInterval: 15_000 },
  });
  const { data: totalMined } = useReadContract({
    abi: AURX_ABI,
    address: AURX_ADDRESS,
    functionName: "totalMined",
    query: { enabled: !notDeployed, refetchInterval: 15_000 },
  });

  // --- miner worker ---
  const { state, start, stop, reset } = useMiner();
  const [autoSubmit, setAutoSubmit] = useState(true);

  // --- claim tx ---
  const { writeContract, data: txHash, isPending: txSending, reset: resetTx } = useWriteContract();
  const { isLoading: txMining, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  // Refresh state on tx success.
  useEffect(() => {
    if (txSuccess) {
      refetchChallenge();
      refetchWallet();
      reset();
      resetTx();
    }
  }, [txSuccess, refetchChallenge, refetchWallet, reset, resetTx]);

  // Auto-submit when a solution is found.
  useEffect(() => {
    if (state.phase !== "found" || !autoSubmit || !isConnected || wrongNetwork || notDeployed) return;
    if (txSending || txMining) return;
    if (claimFee === undefined) return;
    try {
      writeContract({
        abi: AURX_ABI,
        address: AURX_ADDRESS,
        functionName: "mine",
        args: [BigInt(state.nonce)],
        value: claimFee,
        chainId: AURX_CHAIN_ID,
      });
    } catch {
      /* user will see the error via tx state */
    }
  }, [state, autoSubmit, isConnected, wrongNetwork, notDeployed, txSending, txMining, claimFee, writeContract]);

  const difficulty = useMemo(() => {
    if (!target) return null;
    if (target === 0n) return null;
    const MAX = (1n << 256n) - 1n;
    return MAX / (target as bigint);
  }, [target]);

  const canStart = isConnected && !wrongNetwork && !notDeployed && !!challenge && !!target && !!address;
  const isMining = state.phase === "mining";

  function onStart() {
    if (!canStart) return;
    start({
      challenge: challenge as `0x${string}`,
      miner: address as `0x${string}`,
      target: uint256ToHex32(target as bigint),
      mode: "cpu",
    });
  }

  function onSubmit() {
    if (state.phase !== "found" || claimFee === undefined) return;
    writeContract({
      abi: AURX_ABI,
      address: AURX_ADDRESS,
      functionName: "mine",
      args: [BigInt(state.nonce)],
      value: claimFee,
      chainId: AURX_CHAIN_ID,
    });
  }

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
        <header className="mb-10">
          <p className="mono text-[10px] tracking-[0.4em] text-gold-300/80 uppercase">Aurum · Miner</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-bone">
            Find the next block.
          </h1>
          <p className="mt-3 text-bone/65 max-w-2xl">
            Your CPU iterates nonces locally until <code className="mono text-gold-300">keccak256(challenge ‖ wallet ‖ nonce)</code>{" "}
            falls below the network target. Submit the winning nonce and the chain mints you{" "}
            <span className="mono text-gold-300">100 AURX</span>.
          </p>
        </header>

        {notDeployed && (
          <Banner tone="warn">
            Contract address not yet configured. Set <code className="mono">NEXT_PUBLIC_AURX_ADDRESS</code> to the
            deployed AurumX address on Base to enable on-chain mining.
          </Banner>
        )}

        {!isConnected && (
          <Banner tone="info">
            Connect a wallet on the Base network to start mining. <ConnectButton chainStatus="none" showBalance={false} />
          </Banner>
        )}

        {wrongNetwork && (
          <Banner tone="warn">
            Switch your wallet to <span className="mono">Base · chain id 8453</span> to mine AURX.
          </Banner>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* --- Mining engine card --- */}
          <div className="lg:col-span-2 card p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
              <h2 className="font-display text-2xl text-bone">Engine</h2>
              <div className="flex items-center gap-2 text-[11px] mono tracking-wider text-bone/50">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isMining ? "bg-gold-400 animate-pulseGold" : "bg-bone/30"}`} />
                {isMining ? "HASHING" : state.phase === "found" ? "SOLUTION READY" : state.phase === "stopped" ? "IDLE" : "READY"}
              </div>
            </div>

            <EngineReadout state={state} />

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!isMining && state.phase !== "found" && (
                <button onClick={onStart} disabled={!canStart} className="btn-gold">
                  {canStart ? "Start mining" : "Awaiting wallet"}
                </button>
              )}
              {isMining && (
                <button onClick={stop} className="btn-ghost">
                  Pause
                </button>
              )}
              {state.phase === "found" && (
                <button onClick={onSubmit} disabled={txSending || txMining} className="btn-gold">
                  {txSending ? "Confirm in wallet…" : txMining ? "Claiming on-chain…" : "Claim 100 AURX"}
                </button>
              )}
              {state.phase === "found" && (
                <button onClick={() => { reset(); onStart(); }} className="btn-ghost">
                  Discard & re-mine
                </button>
              )}
              <label className="flex items-center gap-2 text-sm text-bone/60 ml-auto">
                <input
                  type="checkbox"
                  checked={autoSubmit}
                  onChange={(e) => setAutoSubmit(e.target.checked)}
                  className="accent-gold-400 w-4 h-4"
                />
                Auto-submit on solution
              </label>
            </div>

            {txHash && (
              <div className="mt-6 text-sm text-bone/65 mono break-all">
                tx{" "}
                <a
                  className="text-gold-300 hover:underline"
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>

          {/* --- Wallet card --- */}
          <div className="card p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="font-display text-2xl text-bone">Wallet</h2>
            <KV label="Mined by you"   value={`${formatToken(walletMined ?? 0n)} AURX`} />
            <KV label="Wallet cap"     value={`${formatToken(TOKENOMICS.walletCap, 18, 0)} AURX`} />
            <Capacity mined={walletMined ?? 0n} />
            <KV label="AURX balance"   value={`${formatToken(balance ?? 0n)} AURX`} />
          </div>

          {/* --- Network card --- */}
          <div className="lg:col-span-3 card p-6 sm:p-8">
            <h2 className="font-display text-2xl text-bone mb-4">Network</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              <KV
                label="Current challenge"
                value={challenge ? shorten(challenge as string, 10) : "—"}
                mono
              />
              <KV
                label="Target (lower = harder)"
                value={target ? shorten(uint256ToHex32(target as bigint), 10) : "—"}
                mono
              />
              <KV
                label="Expected attempts"
                value={difficulty ? difficulty.toLocaleString("en-US") : "—"}
              />
              <KV
                label="Estimated time @ your rate"
                value={
                  state.phase === "mining" && difficulty && state.hashesPerSecond > 0
                    ? formatDuration(Number(difficulty) / state.hashesPerSecond)
                    : "—"
                }
              />
              <KV label="Epoch"           value={epoch ? (epoch as bigint).toString() : "—"} mono />
              <KV label="Total mined"     value={`${formatToken(totalMined ?? 0n, 18, 0)} AURX`} />
              <KV label="Max supply"      value={`${formatToken(TOKENOMICS.maxSupply, 18, 0)} AURX`} />
              <KV
                label="Contract"
                value={
                  notDeployed
                    ? "not yet deployed"
                    : shorten(AURX_ADDRESS, 8)
                }
                mono
                link={
                  !notDeployed ? `https://basescan.org/address/${AURX_ADDRESS}` : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EngineReadout({ state }: { state: MinerState }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
      <Metric
        label="Hashrate"
        value={
          state.phase === "mining"
            ? formatHashRate(state.hashesPerSecond)
            : state.phase === "found"
              ? formatHashRate((state.hashes / state.elapsedMs) * 1000)
              : "—"
        }
      />
      <Metric
        label="Hashes computed"
        value={
          state.phase === "mining" || state.phase === "found" || state.phase === "stopped"
            ? state.hashes.toLocaleString("en-US")
            : "—"
        }
      />
      <Metric
        label="Last nonce"
        mono
        value={
          state.phase === "mining"
            ? shorten(state.nonce, 8)
            : state.phase === "found"
              ? shorten(state.nonce, 8)
              : "—"
        }
      />
      <Metric
        label="Solution digest"
        mono
        value={state.phase === "found" ? shorten(state.digest, 8) : "—"}
      />
      {state.phase === "error" && (
        <div className="col-span-full text-sm text-red-300">Miner error: {state.message}</div>
      )}
    </div>
  );
}

function Metric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mono text-[10px] tracking-[0.25em] text-bone/40 uppercase">{label}</p>
      <p className={`mt-1 text-bone ${mono ? "mono" : "font-display"} text-xl`}>{value}</p>
    </div>
  );
}

function KV({
  label,
  value,
  mono = false,
  link,
}: {
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
}) {
  const content = (
    <span className={`text-bone ${mono ? "mono" : ""}`}>{value}</span>
  );
  return (
    <div className="flex flex-col gap-1">
      <p className="mono text-[10px] tracking-[0.25em] text-bone/40 uppercase">{label}</p>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="hover:text-gold-300 underline-offset-4 hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function Capacity({ mined }: { mined: bigint }) {
  const cap = TOKENOMICS.walletCap;
  const pct = cap === 0n ? 0 : Number((mined * 100n) / cap);
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div>
      <div className="flex justify-between mono text-[10px] tracking-[0.25em] text-bone/40 mb-2">
        <span>WALLET CAPACITY</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 w-full bg-bone/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500 animate-shimmer"
          style={{ width: `${clamped}%`, backgroundSize: "200% 100%" }}
        />
      </div>
    </div>
  );
}

function Banner({ children, tone }: { children: React.ReactNode; tone: "info" | "warn" }) {
  const cls =
    tone === "warn"
      ? "border-gold-500/40 bg-gold-500/10 text-gold-200"
      : "border-bone/15 bg-navy-800/40 text-bone/75";
  return (
    <div className={`mb-6 px-5 py-3 rounded-lg border ${cls} flex items-center gap-3 flex-wrap`}>
      {children}
    </div>
  );
}

function shorten(hex: string, head = 6, tail = 6) {
  if (!hex) return "";
  if (hex.length <= head + tail + 2) return hex;
  return `${hex.slice(0, head + 2)}…${hex.slice(-tail)}`;
}
