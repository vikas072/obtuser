import { Hero } from "@/components/landing/hero";
import { YearCards } from "@/components/landing/year-cards";
import { Benefits } from "@/components/landing/benefits";
import { ConditionalPricing } from "@/components/landing/conditional-pricing";
import { Footer } from "@/components/landing/footer";

import { SpotlightMask } from "@/components/landing/spotlight-mask";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <SpotlightMask>
        <YearCards />
      </SpotlightMask>
      <Benefits />
      <ConditionalPricing />
      <Footer />
    </main>
  );
}
