"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AurumMark } from "./AurumMark";
import { XIcon } from "./icons/XIcon";

const TWITTER_URL = "https://x.com/Aurum_0x";

const links: Array<{ href: string; label: string }> = [
  { href: "/",         label: "Overview" },
  { href: "/#tokenomics", label: "Tokenomics" },
  { href: "/#roadmap",    label: "Roadmap" },
  { href: "/mine",     label: "Mine" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-navy-800/70 border-b hairline">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <AurumMark size={28} className="transition-transform group-hover:rotate-3" />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl tracking-[0.2em] text-bone">AURUM</span>
            <span className="mono text-[10px] tracking-[0.3em] text-gold-400/80 hidden sm:inline">AURX</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname?.startsWith(l.href.replace(/#.*$/, ""));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors ${
                  active ? "text-gold-300" : "text-bone/70 hover:text-bone"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={TWITTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Aurum on X"
            className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-full border hairline text-bone/70 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
          >
            <XIcon size={13} />
          </a>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
          />
        </div>
      </div>
    </header>
  );
}
