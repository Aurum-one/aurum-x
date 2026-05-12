"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MinerMode = "cpu" | "gpu";

const MODE_LANES: Record<MinerMode, number> = {
  cpu: 5,
  gpu: 1,
};

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
  mode: MinerMode;
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
  const workersRef = useRef<Worker[]>([]);
  const runRef = useRef(0);
  const hashesRef = useRef<number[]>([]);
  const hpsRef = useRef<number[]>([]);
  const [state, setState] = useState<MinerState>({ phase: "idle" });

  const terminateWorkers = useCallback(() => {
    workersRef.current.forEach((w) => w.terminate());
    workersRef.current = [];
  }, []);

  const createWorker = useCallback((runId: number, lane: number) => {
    const w = new Worker(new URL("../workers/miner.worker.ts", import.meta.url), {
      type: "module",
    });

    w.onmessage = (e: MessageEvent) => {
      if (runRef.current !== runId) return;
      const msg = e.data as
        | { type: "progress"; hashes: number; hashesPerSecond: number; nonce: string }
        | { type: "solution"; nonce: string; digest: string; hashes: number; elapsedMs: number }
        | { type: "stopped" }
        | { type: "error"; message: string };

      switch (msg.type) {
        case "progress": {
          hashesRef.current[lane] = msg.hashes;
          hpsRef.current[lane] = msg.hashesPerSecond;
          setState({
            phase: "mining",
            hashes: hashesRef.current.reduce((a, b) => a + (b || 0), 0),
            hashesPerSecond: hpsRef.current.reduce((a, b) => a + (b || 0), 0),
            nonce: msg.nonce,
          });
          break;
        }
        case "solution":
          hashesRef.current[lane] = msg.hashes;
          terminateWorkers();
          setState({
            phase: "found",
            nonce: msg.nonce,
            digest: msg.digest,
            hashes: hashesRef.current.reduce((a, b) => a + (b || 0), 0),
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

    return w;
  }, [terminateWorkers]);

  useEffect(() => {
    return () => {
      terminateWorkers();
    };
  }, [terminateWorkers]);

  const start = useCallback(({ challenge, miner, target, mode }: StartArgs) => {
    terminateWorkers();
    const runId = runRef.current + 1;
    runRef.current = runId;
    const lanes = MODE_LANES[mode];
    hashesRef.current = Array(lanes).fill(0);
    hpsRef.current = Array(lanes).fill(0);
    setState({ phase: "mining", hashes: 0, hashesPerSecond: 0, nonce: "0x0" });

    const random = crypto.getRandomValues(new Uint8Array(8));
    let n = 0n;
    for (let i = 0; i < 8; i++) n = (n << 8n) | BigInt(random[i]);
    const stride = BigInt(lanes);
    const workers = Array.from({ length: lanes }, (_, lane) => createWorker(runId, lane));
    workersRef.current = workers;
    workers.forEach((w, lane) => {
      w.postMessage({
        type: "start",
        challenge,
        miner,
        target,
        startNonce: "0x" + (n + BigInt(lane)).toString(16),
        nonceStride: "0x" + stride.toString(16),
        reportEveryHashes: 25_000,
      });
    });
  }, [createWorker, terminateWorkers]);

  const stop = useCallback(() => {
    const hashes = hashesRef.current.reduce((a, b) => a + (b || 0), 0);
    runRef.current += 1;
    terminateWorkers();
    setState({ phase: "stopped", hashes });
  }, [terminateWorkers]);

  const reset = useCallback(() => {
    runRef.current += 1;
    terminateWorkers();
    setState({ phase: "idle" });
  }, [terminateWorkers]);

  return { state, start, stop, reset };
}

/** Convert a uint256 bigint to a 32-byte zero-padded hex string. */
export function uint256ToHex32(v: bigint): `0x${string}` {
  let hex = v.toString(16);
  if (hex.length > 64) throw new Error("value exceeds 256 bits");
  hex = hex.padStart(64, "0");
  return ("0x" + hex) as `0x${string}`;
}
