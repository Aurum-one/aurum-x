const allocationRows: Array<{ name: string; share: string; note: string }> = [
  { name: "Mined emission", share: "100%",   note: "Issued only via on-chain PoW. No team or treasury allocation." },
  { name: "Premine",        share: "0%",     note: "There is no premine. Period." },
  { name: "Team / advisors",share: "0%",     note: "No team or advisor allocation." },
  { name: "Investors",      share: "0%",     note: "No private round. No public sale." },
];

export function Tokenomics() {
  return (
    <section id="tokenomics" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
        <Header
          eyebrow="Tokenomics"
          title="Scarce by design."
          subtitle="Every AURX in circulation was mined by someone."
        />

        <div className="mt-12 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card p-6 sm:p-8">
            <p className="mono text-[10px] tracking-[0.3em] text-gold-400/80 mb-4">SUPPLY · 100,000,000 AURX</p>
            <div className="space-y-4">
              {allocationRows.map((row) => (
                <div key={row.name} className="grid grid-cols-12 gap-4 items-baseline border-b hairline pb-4 last:border-b-0 last:pb-0">
                  <p className="col-span-5 sm:col-span-4 text-bone">{row.name}</p>
                  <p className="col-span-2 mono text-gold-300 text-right sm:text-left">{row.share}</p>
                  <p className="col-span-12 sm:col-span-6 text-sm text-bone/55">{row.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-rows-2 gap-6">
            <Card
              eyebrow="Mining"
              title="100 AURX / valid block"
              body={
                <>
                  Each accepted nonce mints exactly <span className="mono text-gold-300">100 AURX</span> to the miner.
                </>
              }
            />
            <Card
              eyebrow="Wallet cap"
              title="1,000 AURX max / wallet"
              body={
                <>
                  After ten successful mines a wallet retires from emission.
                </>
              }
            />
          </div>
        </div>

      </div>
    </section>
  );
}

function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <p className="mono text-[10px] tracking-[0.4em] text-gold-300/80 uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-bone">{title}</h2>
      <p className="mt-3 text-bone/65 text-lg">{subtitle}</p>
    </div>
  );
}

function Card({ eyebrow, title, body }: { eyebrow: string; title: string; body: React.ReactNode }) {
  return (
    <div className="card p-6">
      <p className="mono text-[10px] tracking-[0.3em] text-gold-400/80">{eyebrow}</p>
      <p className="mt-3 font-display text-2xl text-bone">{title}</p>
      <p className="mt-2 text-sm text-bone/60 leading-relaxed">{body}</p>
    </div>
  );
}
