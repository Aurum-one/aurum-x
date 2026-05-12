import Link from "next/link";
import { AurumMark } from "./AurumMark";

export function SiteFooter() {
  return (
    <footer className="border-t hairline mt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-3">
            <AurumMark size={24} />
            <span className="font-display text-lg tracking-[0.2em] text-bone">AURUM</span>
          </div>
          <p className="mt-3 text-bone/55 max-w-xs leading-relaxed">
            Proof-of-Work, refined. A scarce, mineable ERC-20 on Base — no presale,
            no airdrop, no inflation. The only way in is through work.
          </p>
        </div>

        <div>
          <p className="mono text-[10px] tracking-[0.3em] text-gold-400/70 mb-3">PROTOCOL</p>
          <ul className="space-y-2 text-bone/75">
            <li><Link href="/mine" className="hover:text-gold-300">Mining dashboard</Link></li>
            <li><Link href="/#tokenomics" className="hover:text-gold-300">Tokenomics</Link></li>
            <li><Link href="/#roadmap" className="hover:text-gold-300">Roadmap</Link></li>
          </ul>
        </div>

        <div>
          <p className="mono text-[10px] tracking-[0.3em] text-gold-400/70 mb-3">CHAIN</p>
          <ul className="space-y-2 text-bone/75">
            <li>Base · chain id <span className="mono text-bone">8453</span></li>
            <li>ERC-20 · 18 decimals · capped 100M AURX</li>
            <li>On-chain PoW · no premine</li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-5 flex items-center justify-between text-[11px] mono text-bone/40 tracking-wider">
          <span>© Aurum Protocol · {new Date().getFullYear()}</span>
          <span>VEINS &nbsp;·&nbsp; ORE &nbsp;·&nbsp; PROOF</span>
        </div>
      </div>
    </footer>
  );
}
