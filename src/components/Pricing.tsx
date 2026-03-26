import { ArrowRight, Building2, Check, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIERS = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'A light way to test your direction and see your strongest-fit paths.',
    icon: Star,
    featured: false,
    features: ['Career identity snapshot', 'Basic fit suggestions', 'Starter roadmap preview'],
  },
  {
    name: 'Navigator',
    price: '$12.99/mo',
    description: 'The full PathWise experience for people actively building toward a role shift or major goal.',
    icon: Sparkles,
    featured: true,
    features: ['Full roadmap generation', 'Weekly action plans', 'Progress tracking and readiness signals'],
  },
  {
    name: 'Institution',
    price: 'Custom',
    description: 'For universities and programs supporting many students at once.',
    icon: Building2,
    featured: false,
    features: ['Campus licensing', 'Shared reporting', 'Implementation support'],
  },
];

export default function Pricing() {
  return (
    <section className="container py-8 md:py-12" id="pricing">
      <div className="section-shell px-6 py-8 md:px-8 md:py-10">
        <div className="max-w-3xl">
          <div className="section-label">
            <span className="eyebrow-dot" />
            Pricing
          </div>
          <h2 className="mt-5 section-title">Start small, then grow into the full roadmap.</h2>
          <p className="mt-5 section-copy">
            The entry point stays accessible, and the premium plan is built for people who want a guided system rather
            than another static dashboard.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className="relative rounded-[28px] border p-6"
                style={{
                  borderColor: tier.featured ? 'rgba(30, 90, 82, 0.32)' : 'var(--line)',
                  background: tier.featured ? 'linear-gradient(180deg, rgba(30, 90, 82, 0.08), rgba(255,255,255,0.78))' : 'rgba(255,255,255,0.72)',
                  boxShadow: tier.featured ? '0 24px 60px rgba(17, 58, 54, 0.12)' : 'none',
                }}
              >
                {tier.featured && (
                  <div className="absolute right-5 top-5 rounded-full bg-[color:var(--brand)] px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white">
                    Most popular
                  </div>
                )}

                <div className="rounded-2xl bg-[rgba(216,109,61,0.1)] p-3 text-[color:var(--brand-warm)] w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[color:var(--ink)]">{tier.name}</h3>
                <div className="mt-4 text-4xl font-bold text-[color:var(--ink)]">{tier.price}</div>
                <p className="mt-4 text-base leading-7 text-[color:var(--ink-soft)]">{tier.description}</p>

                <div className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-[color:var(--ink)]">
                      <div className="mt-0.5 rounded-full bg-[rgba(30,90,82,0.12)] p-1 text-[color:var(--brand)]">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link to="/pricing" className="btn-primary mt-8 w-full">
                  Choose {tier.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
