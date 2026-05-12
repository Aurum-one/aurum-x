import { MiningDashboard } from "@/components/MiningDashboard";

export const metadata = {
  title: "Mine AURX — Aurum",
  description: "Mine AURX with your CPU. Submit a valid nonce to mint 100 AURX on Base.",
};

export default function MinePage() {
  return <MiningDashboard />;
}
