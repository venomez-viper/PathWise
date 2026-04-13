import Solution from '@/components/Solution';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function SolutionPage() {
  return (
    <div style={{ background: '#09090b' }}>
      <div className="page-hero-pad" style={{ background: '#09090b' }} />
      <Solution />
      <CTA />
      <Footer />
    </div>
  );
}
