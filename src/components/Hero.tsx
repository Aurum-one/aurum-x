import Link from "next/link";
import { AurumMark } from "./AurumMark";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-aurum-grid opacity-60 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-grid-fade animate-shimmer pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-20 pb-24">
        <div className="flex items-center gap-3 mono text-[10px] tracking-[0.4em] text-gold-300/80 uppercase mb-8">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulseGold" />
          Live on Base · Mainnet
        </div>

        <h1 className="font-display text-5xl sm:text-7xl leading-[1.02] tracking-tight max-w-4xl">
          <span className="text-bone">Proof-of-Work,</span>{" "}
          <span className="text-shimmer-gold">refined.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-bone/70 max-w-2xl leading-relaxed">
          <span className="text-bone">Aurum (AURX)</span> is a fixed-supply, mineable ERC-20 on Base.
          No presale. No airdrop. No inflation. Submit a nonce that beats the
          network target and the chain mints you
          <span className="mono text-gold-300"> 100 AURX</span>.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/mine" className="btn-gold">
            Start mining
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="#tokenomics" className="btn-ghost">
            Read the tokenomics
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px hairline border rounded-xl overflow-hidden">
          <Stat label="Max supply"    value="100,000,000" unit="AURX" />
          <Stat label="Block reward"  value="100" unit="AURX / block" />
          <Stat label="Wallet cap"    value="1,000" unit="AURX / wallet" />
          <Stat label="Claim fee"     value="0.0001" unit="ETH · routed to dev" />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 mono text-[11px] tracking-wider text-bone/40">
          <AurumMark size={14} />
          <span>chain id 8453</span>
          <span>·</span>
          <span>solc 0.8.24</span>
          <span>·</span>
          <span>no premine</span>
          <span>·</span>
          <span>capped issuance</span>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="p-5 bg-navy-800/40">
      <p className="mono text-[10px] tracking-[0.25em] text-bone/40 uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl text-gold-200">{value}</p>
      <p className="mono text-[11px] text-bone/45 mt-1">{unit}</p>
    </div>
  );
}
