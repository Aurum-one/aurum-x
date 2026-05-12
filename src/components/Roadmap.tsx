const phases = [
  {
    id: "I",
    label: "Vein",
    eyebrow: "Phase I",
    status: "Now",
    title: "Mainnet ignition.",
    items: [
      "AurumX contract deployed and verified on Base",
      "Browser-based CPU miner — Web Worker + keccak256",
      "Mining dashboard, live challenge stream, claim flow",
      "Public source, audit-friendly Foundry test suite",
    ],
  },
  {
    id: "II",
    label: "Ore",
    eyebrow: "Phase II",
    status: "Q+1",
    title: "Mining at scale.",
    items: [
      "WebGPU miner — opt-in GPU hashing for capable devices",
      "Public pool RPC for relay submissions (latency-optimized)",
      "Difficulty re-target proposal — community-driven via multi-sig",
      "Block explorer mirror with per-wallet leaderboard",
    ],
  },
  {
    id: "III",
    label: "Foundry",
    eyebrow: "Phase III",
    status: "Q+2",
    title: "Liquidity & tooling.",
    items: [
      "Aerodrome / Uniswap v3 pool seeded after broad distribution",
      "Open-source CLI miner for headless rigs",
      "On-chain attestations: \"Genesis Miner\" SBT for early epochs",
      "Independent security review published",
    ],
  },
  {
    id: "IV",
    label: "Reserve",
    eyebrow: "Phase IV",
    status: "Long-horizon",
    title: "Aurum as collateral.",
    items: [
      "Integrations with lending / collateral markets on Base",
      "AURX-denominated payments standard (EIP draft)",
      "Cross-chain mirroring via canonical bridge (read-only first)",
      "Hand-off of admin keys to a community-elected multi-sig",
    ],
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
        <div className="max-w-2xl">
          <p className="mono text-[10px] tracking-[0.4em] text-gold-300/80 uppercase">Roadmap</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-bone">
            From vein to reserve.
          </h2>
        </div>

        <div className="mt-12 relative">
          {/* Vertical rule on the left */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-gold-500/60 via-gold-500/15 to-transparent hidden sm:block" />

          <ol className="space-y-10">
            {phases.map((p, i) => (
              <li key={p.id} className="relative pl-0 sm:pl-12">
                <div className="hidden sm:flex absolute left-0 top-1.5 w-7 h-7 rounded-md border hairline items-center justify-center bg-navy-800">
                  <span className="mono text-[10px] text-gold-300 tracking-wider">{p.id}</span>
                </div>

                <div className="card p-6 sm:p-8">
                  <div className="flex flex-wrap items-baseline gap-4 mb-2">
                    <p className="mono text-[10px] tracking-[0.3em] text-gold-400/80 uppercase">
                      {p.eyebrow} · {p.label}
                    </p>
                    <span
                      className={`mono text-[10px] tracking-wider px-2 py-0.5 rounded-full border ${
                        i === 0
                          ? "border-gold-500/40 text-gold-200 bg-gold-500/10"
                          : "border-bone/15 text-bone/55"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-bone">{p.title}</h3>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-bone/70">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 inline-block w-1 h-1 rounded-full bg-gold-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
