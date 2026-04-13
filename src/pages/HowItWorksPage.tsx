import HowItWorks from '@/components/HowItWorks';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';

export default function HowItWorksPage() {
  return (
    <>
      <FloatingPathsBackground position={-1} className="min-h-screen bg-[#030303]">
        <div className="page-hero-pad" />
        <HowItWorks />
      </FloatingPathsBackground>
      <CTA />
      <Footer />
    </>
  );
}
