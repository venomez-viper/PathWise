import HowItWorks from '@/components/HowItWorks';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import AnimatedShaderBackground from '@/components/ui/animated-shader-background';

export default function HowItWorksPage() {
  return (
    <>
      <AnimatedShaderBackground className="min-h-screen">
        <div className="page-hero-pad" />
        <HowItWorks />
      </AnimatedShaderBackground>
      <CTA />
      <Footer />
    </>
  );
}
