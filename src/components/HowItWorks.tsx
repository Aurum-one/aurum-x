import { AurumMark } from "./AurumMark";

const steps = [
  {
    n: "01",
    title: "Read the challenge",
    body: "The contract exposes `currentChallenge` — a 32-byte digest that rotates after every mined block. Your miner pulls it on connect and after every confirmed claim.",
  },
  {
    n: "02",
    title: "Hash locally",
    body: "Your browser hashes `keccak256(challenge ‖ your-address ‖ nonce)` in a Web Worker. The hot loop never leaves your CPU.",
  },
  {
    n: "03",
    title: "Beat the target",
    body: "If the digest, interpreted as a uint256, is strictly less than the on-chain target, you've found a valid proof. The lower the target, the harder the work.",
  },
  {
    n: "04",
    title: "Claim on-chain",
    body: "Submit the winning nonce via `mine(nonce)` with the 0.0001 ETH claim fee. The contract re-verifies the hash, mints you 100 AURX, rotates the challenge, and forwards the fee to the dev wallet — all atomically.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
        <div className="max-w-2xl">
          <p className="mono text-[10px] tracking-[0.4em] text-gold-300/80 uppercase">Mechanics</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight text-bone">
            One loop. Four steps.
          </h2>
        </div>

        <ol className="mt-12 grid sm:grid-cols-2 gap-px hairline border rounded-xl overflow-hidden">
          {steps.map((s) => (
            <li key={s.n} className="bg-navy-800/40 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="mono text-[10px] tracking-[0.3em] text-gold-300/80">{s.n}</span>
                <AurumMark size={14} />
              </div>
              <p className="font-display text-2xl text-bone">{s.title}</p>
              <p className="mt-2 text-sm text-bone/65 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 card p-6 sm:p-8">
          <p className="mono text-[10px] tracking-[0.3em] text-gold-400/80 mb-3">CONTRACT SNIPPET</p>
          <pre className="mono text-[12px] sm:text-[13px] leading-relaxed text-bone/80 overflow-x-auto">
{`function mine(uint256 nonce) external payable nonReentrant {
    if (msg.value < claimFee)               revert InsufficientClaimFee();
    if (minedBy[msg.sender] + BLOCK_REWARD > WALLET_CAP)
        revert WalletCapReached();
    if (totalMined + BLOCK_REWARD > MAX_SUPPLY)
        revert MaxSupplyReached();

    bytes32 solution = keccak256(abi.encodePacked(currentChallenge, msg.sender, nonce));
    if (uint256(solution) >= target)        revert InvalidProofOfWork();

    minedBy[msg.sender] += BLOCK_REWARD;    // wallet ledger
    totalMined          += BLOCK_REWARD;    // global ledger
    epoch               += 1;
    currentChallenge     = solution;        // rotate challenge

    _mint(msg.sender, BLOCK_REWARD);        // 100 AURX
    (bool ok, ) = devWallet.call{ value: msg.value }("");
    if (!ok)                                revert FeeTransferFailed();

    emit Mined(msg.sender, epoch, nonce, solution, BLOCK_REWARD);
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
