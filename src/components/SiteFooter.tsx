import Link from "next/link";
import { AurumMark } from "./AurumMark";
import { XIcon } from "./icons/XIcon";

const TWITTER_URL = "https://x.com/Aurum_0x";

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
            A mineable ERC-20 on Base. No presale, no airdrop, no inflation.
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
          <div className="mt-5">
            <p className="mono text-[10px] tracking-[0.3em] text-gold-400/70 mb-3">FOLLOW</p>
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aurum on X"
              className="inline-flex items-center gap-2 text-bone/75 hover:text-gold-300 transition-colors"
            >
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full border hairline">
                <XIcon size={12} />
              </span>
              <span className="mono text-[11px] tracking-wider">@Aurum_0x</span>
            </a>
          </div>
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
