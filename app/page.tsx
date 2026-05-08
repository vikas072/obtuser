import { Hero } from "@/components/landing/hero";
import { YearCards } from "@/components/landing/year-cards";
import { Benefits } from "@/components/landing/benefits";
import { Footer } from "@/components/landing/footer";
import { SpotlightMask } from "@/components/landing/spotlight-mask";
import PricingSection4 from "@/components/ui/pricing-section-4";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <SpotlightMask>
        <YearCards />
      </SpotlightMask>
      <Benefits />
      <PricingSection4 />
      <Footer />
    </main>
  );
}
