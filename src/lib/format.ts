/**
 * Tiny formatting helpers used across the UI. Avoids pulling in heavy
 * deps for what amounts to a handful of bigint → string conversions.
 */

export function formatToken(amount: bigint, decimals = 18, dp = 2): string {
  if (amount === 0n) return "0";
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const frac = amount % divisor;
  if (dp <= 0) return whole.toLocaleString("en-US");
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, dp);
  const trimmed = fracStr.replace(/0+$/, "");
  return trimmed
    ? `${whole.toLocaleString("en-US")}.${trimmed}`
    : whole.toLocaleString("en-US");
}

export function formatEthFromWei(wei: bigint, dp = 6): string {
  return formatToken(wei, 18, dp);
}

export function shortAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatHashRate(hps: number): string {
  if (!Number.isFinite(hps) || hps <= 0) return "0 H/s";
  const units = ["H/s", "KH/s", "MH/s", "GH/s"];
  let i = 0;
  let v = hps;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  const dp = v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return `${v.toFixed(dp)} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 1)   return "< 1s";
  if (seconds < 60)  return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
