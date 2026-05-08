import { Hero } from "@/components/landing/hero";
import { YearCards } from "@/components/landing/year-cards";
import { Benefits } from "@/components/landing/benefits";
import { Footer } from "@/components/landing/footer";
import { SpotlightMask } from "@/components/landing/spotlight-mask";
import PricingSection4 from "@/components/ui/pricing-section-4";
import GradientMenu from "@/components/ui/gradient-menu";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <SpotlightMask>
        <YearCards />
      </SpotlightMask>
      <Benefits />
      <PricingSection4 />
      <div className="py-12 bg-black/50">
        <h3 className="text-center text-muted-foreground text-sm uppercase tracking-[0.3em] font-bold mb-8">Stay Connected</h3>
        <GradientMenu />
      </div>
      <Footer />
    </main>
  );
}
