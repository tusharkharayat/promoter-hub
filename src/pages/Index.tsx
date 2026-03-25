import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import PromoterCTA from "@/components/PromoterCTA";
import SpecsAccordion from "@/components/SpecsAccordion";
import FooterInfo from "@/components/FooterInfo";
import StickyFooter from "@/components/StickyFooter";
import VirtualPromoterFAB from "@/components/VirtualPromoterFAB";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesGrid />
      <PromoterCTA />
      <SpecsAccordion />
      <FooterInfo />
      <StickyFooter />
      <VirtualPromoterFAB />
    </div>
  );
};

export default Index;
