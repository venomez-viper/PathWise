import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Problem from '@/components/Problem';
import Pricing from '@/components/Pricing';
import Solution from '@/components/Solution';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Solution />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}
