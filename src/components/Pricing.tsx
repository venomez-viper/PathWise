import React, { useEffect, useRef } from 'react';
import { CreativePricing } from '@/components/ui/creative-pricing';
import type { PricingTier } from '@/components/ui/creative-pricing';
import { Sparkles, Star, Building2 } from 'lucide-react';
import './Pricing.css';

const PATHWISE_TIERS: PricingTier[] = [
  {
    name: 'Explorer',
    icon: <Star className="w-6 h-6" />,
    price: 0,
    description: 'Kick off your career journey for free',
    color: 'violet',
    features: [
      'AI Career Discovery',
      'Skill Gap Analysis',
      'Career Path Recommendation',
      'Limited Career Insights',
      'Ad-Supported Experience',
    ],
  },
  {
    name: 'Navigator',
    icon: <Sparkles className="w-6 h-6" />,
    price: 12.99,
    description: 'Full platform access — no limits, no ads',
    color: 'amber',
    popular: true,
    features: [
      'Full Career Roadmap',
      'Daily Career Task Planner',
      'Progress Tracking Dashboard',
      'Career Opportunity Insights',
      'Unlimited AI Career Coach',
      'Ad-Free Experience',
    ],
  },
  {
    name: 'Institution',
    icon: <Building2 className="w-6 h-6" />,
    price: 'Custom',
    description: 'Campus-wide licensing for universities',
    color: 'teal',
    features: [
      'Per-Student Licensing',
      'Campus-Wide SaaS Contract',
      'Career Center Integration',
      'Institutional Analytics',
      'Dedicated Support',
    ],
  },
];

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.fade-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 100);
          });
        }
      }),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pricing-section" id="pricing" ref={ref}>
      <div className="container">
        <CreativePricing
          tag="Simple Pricing"
          title="Start free. Grow on your terms."
          description="No credit card required · Cancel anytime · Annual plan saves 23%"
          tiers={PATHWISE_TIERS}
        />

        {/* Discount callout below */}
        <div className="pricing-discounts fade-up">
          <div className="pricing-discount-item">
            <span>📅</span>
            <span><strong>Annual Plan</strong> — $9.99/mo (save 23%)</span>
          </div>
          <div className="pricing-discount-item">
            <span>👫</span>
            <span><strong>Peer Plan</strong> — $149.99/yr for up to 6 users</span>
          </div>
        </div>
      </div>
    </section>
  );
}
