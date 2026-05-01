import { Hero } from "@/components/landing/hero";
import { YearCards } from "@/components/landing/year-cards";
import { Benefits } from "@/components/landing/benefits";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <YearCards />
      <Benefits />
      <Pricing />
      <Footer />
    </main>
  );
}
