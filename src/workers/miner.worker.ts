/// <reference lib="webworker" />
import { keccak_256 } from "@noble/hashes/sha3.js";

/**
 * Aurum CPU miner — single Web Worker.
 *
 * Hashes keccak256(challenge ‖ miner ‖ nonce) and reports any nonce whose
 * resulting digest is strictly less than the network target. Mirrors the
 * exact byte layout used by `AurumX.mine()`:
 *
 *   keccak256(abi.encodePacked(bytes32 challenge, address miner, uint256 nonce))
 *
 * The hot loop avoids per-iteration allocation by reusing a single buffer.
 */

type StartMessage = {
  type: "start";
  challenge: string; // 0x-prefixed 32-byte hex
  miner: string;     // 0x-prefixed 20-byte hex
  target: string;    // 0x-prefixed 32-byte hex (uint256, big-endian)
  startNonce?: string; // optional 0x-prefixed uint256
  reportEveryHashes?: number;
};

type StopMessage = { type: "stop" };

type WorkerInbound = StartMessage | StopMessage;

type WorkerOutbound =
  | { type: "progress"; hashes: number; hashesPerSecond: number; nonce: string }
  | { type: "solution"; nonce: string; digest: string; hashes: number; elapsedMs: number }
  | { type: "stopped" }
  | { type: "error"; message: string };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

let running = false;

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error(`odd-length hex: ${hex}`);
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  let s = "0x";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}

/** Writes a uint256 (bigint) into the last 32 bytes of `buf`, big-endian. */
function writeUint256BE(buf: Uint8Array, offset: number, value: bigint) {
  // Fill 32 bytes; value is masked into 256 bits.
  for (let i = 31; i >= 0; i--) {
    buf[offset + i] = Number(value & 0xffn);
    value >>= 8n;
  }
}

/** Big-endian bytes → unsigned bigint. */
function bytesToBigIntBE(bytes: Uint8Array): bigint {
  let r = 0n;
  for (let i = 0; i < bytes.length; i++) {
    r = (r << 8n) | BigInt(bytes[i]);
  }
  return r;
}

function start(msg: StartMessage) {
  running = true;
  try {
    const challenge = hexToBytes(msg.challenge);
    const miner     = hexToBytes(msg.miner);
    const target    = bytesToBigIntBE(hexToBytes(msg.target));

    if (challenge.length !== 32) throw new Error("challenge must be 32 bytes");
    if (miner.length !== 20)     throw new Error("miner must be 20 bytes");

    // Layout: [challenge(32)][miner(20)][nonce(32)] = 84 bytes.
    const buf = new Uint8Array(32 + 20 + 32);
    buf.set(challenge, 0);
    buf.set(miner, 32);

    let nonce = msg.startNonce ? BigInt(msg.startNonce) : 0n;
    const reportEvery = msg.reportEveryHashes ?? 25_000;

    const t0 = performance.now();
    let lastReport = t0;
    let lastReportHashes = 0;
    let hashes = 0;

    while (running) {
      writeUint256BE(buf, 52, nonce);
      const digest = keccak_256(buf);
      const value  = bytesToBigIntBE(digest);

      if (value < target) {
        const elapsedMs = performance.now() - t0;
        const out: WorkerOutbound = {
          type: "solution",
          nonce: "0x" + nonce.toString(16),
          digest: bytesToHex(digest),
          hashes: hashes + 1,
          elapsedMs,
        };
        ctx.postMessage(out);
        running = false;
        return;
      }

      hashes += 1;
      nonce  += 1n;

      if (hashes % reportEvery === 0) {
        const now = performance.now();
        const dt = (now - lastReport) / 1000;
        const recentHashes = hashes - lastReportHashes;
        const hps = dt > 0 ? recentHashes / dt : 0;
        const out: WorkerOutbound = {
          type: "progress",
          hashes,
          hashesPerSecond: hps,
          nonce: "0x" + nonce.toString(16),
        };
        ctx.postMessage(out);
        lastReport = now;
        lastReportHashes = hashes;
      }
    }

    const stopped: WorkerOutbound = { type: "stopped" };
    ctx.postMessage(stopped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const out: WorkerOutbound = { type: "error", message };
    ctx.postMessage(out);
    running = false;
  }
}

ctx.addEventListener("message", (e: MessageEvent<WorkerInbound>) => {
  const data = e.data;
  if (data.type === "start") {
    if (running) return; // already mining
    start(data);
  } else if (data.type === "stop") {
    running = false;
  }
});

export {};
