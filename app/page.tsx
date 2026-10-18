import { CtaSection } from "@/components/ui/landing/cta-section";
import { FaqSection } from "@/components/ui/landing/faq-section";
import { FeaturesSection } from "@/components/ui/landing/features-section";
import { HeroSection } from "@/components/ui/landing/hero-section";
import { HowItWorksSection } from "@/components/ui/landing/how-it-works-section";
import { PainPointsSection } from "@/components/ui/landing/pain-points-section";
import { PreviewSection } from "@/components/ui/landing/preview-section";
import { PrivacyTrustSection } from "@/components/ui/landing/privacy-trust-section";
import { SiteFooter } from "@/components/ui/landing/site-footer";
import { SiteHeader } from "@/components/ui/landing/site-header";


export default function Home() {
  return (
    <div
      id="top"
      className="flex min-h-screen flex-col bg-[#FAF8F5] antialiased selection:bg-forest-900 selection:text-white"
    >
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <PainPointsSection />
        <HowItWorksSection />
        <PreviewSection />
        <FeaturesSection />
        <PrivacyTrustSection />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
