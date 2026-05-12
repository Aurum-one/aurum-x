import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Tokenomics } from "@/components/Tokenomics";
import { Roadmap } from "@/components/Roadmap";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Tokenomics />
      <Roadmap />
    </>
  );
}
