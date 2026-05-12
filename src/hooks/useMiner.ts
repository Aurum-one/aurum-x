"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MinerState =
  | { phase: "idle" }
  | { phase: "mining"; hashes: number; hashesPerSecond: number; nonce: string }
  | { phase: "found"; nonce: string; digest: string; hashes: number; elapsedMs: number }
  | { phase: "stopped"; hashes: number }
  | { phase: "error"; message: string };

interface StartArgs {
  challenge: `0x${string}`;
  miner: `0x${string}`;
  target: `0x${string}`; // uint256 hex, padded to 32 bytes
}

/**
 * React hook around the keccak256 mining Web Worker.
 *
 * Lifecycle: hook owns one worker instance per mount. `start()` boots a
 * mining run with the current challenge/miner/target; `stop()` halts it
 * (a new run can then be started). The hook tears the worker down on
 * unmount so we never leak threads on navigation.
 */
export function useMiner() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<MinerState>({ phase: "idle" });

  useEffect(() => {
    const w = new Worker(new URL("../workers/miner.worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = w;

    w.onmessage = (e: MessageEvent) => {
      const msg = e.data as
        | { type: "progress"; hashes: number; hashesPerSecond: number; nonce: string }
        | { type: "solution"; nonce: string; digest: string; hashes: number; elapsedMs: number }
        | { type: "stopped" }
        | { type: "error"; message: string };

      switch (msg.type) {
        case "progress":
          setState({
            phase: "mining",
            hashes: msg.hashes,
            hashesPerSecond: msg.hashesPerSecond,
            nonce: msg.nonce,
          });
          break;
        case "solution":
          setState({
            phase: "found",
            nonce: msg.nonce,
            digest: msg.digest,
            hashes: msg.hashes,
            elapsedMs: msg.elapsedMs,
          });
          break;
        case "stopped":
          setState((prev) =>
            prev.phase === "mining"
              ? { phase: "stopped", hashes: prev.hashes }
              : { phase: "stopped", hashes: 0 },
          );
          break;
        case "error":
          setState({ phase: "error", message: msg.message });
          break;
      }
    };

    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  const start = useCallback(({ challenge, miner, target }: StartArgs) => {
    if (!workerRef.current) return;
    // Reset to mining with seed values so the UI doesn't flash stale state.
    setState({ phase: "mining", hashes: 0, hashesPerSecond: 0, nonce: "0x0" });
    // Pick a random starting nonce so multiple tabs / restarts don't tread the
    // same path through the keyspace.
    const random = crypto.getRandomValues(new Uint8Array(8));
    let n = 0n;
    for (let i = 0; i < 8; i++) n = (n << 8n) | BigInt(random[i]);
    workerRef.current.postMessage({
      type: "start",
      challenge,
      miner,
      target,
      startNonce: "0x" + n.toString(16),
      reportEveryHashes: 25_000,
    });
  }, []);

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: "stop" });
  }, []);

  const reset = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  return { state, start, stop, reset };
}

/** Convert a uint256 bigint to a 32-byte zero-padded hex string. */
export function uint256ToHex32(v: bigint): `0x${string}` {
  let hex = v.toString(16);
  if (hex.length > 64) throw new Error("value exceeds 256 bits");
  hex = hex.padStart(64, "0");
  return ("0x" + hex) as `0x${string}`;
}
