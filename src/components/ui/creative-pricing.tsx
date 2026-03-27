import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  icon: ReactNode;
  monthlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  cta?: string;
  ctaHref?: string;
}

const colorClasses: Record<string, string> = {
  amber:  "text-amber-400",
  blue:   "text-blue-400",
  purple: "text-purple-400",
  green:  "text-green-400",
  violet: "text-violet-400",
};

function CreativePricing({
  tag         = "Simple Pricing",
  title       = "Pick your plan",
  description = "Start free, upgrade when you're ready",
  tiers,
}: {
  tag?:         string;
  title?:       string;
  description?: string;
  tiers:        PricingTier[];
}) {
  const [yearly, setYearly] = useState(false);
  const DISCOUNT = 0.4;

  const displayPrice = (monthly: number) => {
    if (monthly === 0) return 0;
    return yearly ? parseFloat((monthly * (1 - DISCOUNT)).toFixed(2)) : monthly;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-4">

      {/* ── Header ── */}
      <div className="text-center mb-14" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div
          className="font-handwritten text-base text-violet-400 px-4 py-1 rounded-full border border-violet-500/30 bg-violet-500/10"
          style={{ transform: 'rotate(-1deg)', display: 'inline-block' }}
        >
          {tag}
        </div>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2
            className="text-4xl md:text-5xl font-bold font-handwritten text-white"
            style={{ transform: 'rotate(-1deg)', display: 'inline-block' }}
          >
            {title}
          </h2>
          <span
            className="text-amber-400 text-3xl"
            style={{ position: 'absolute', right: '-2.5rem', top: 0, transform: 'rotate(12deg)', display: 'inline-block' }}
          >✨</span>
          <div
            className="bg-violet-500/25 rounded-full blur-sm"
            style={{ position: 'absolute', bottom: '-0.5rem', left: '50%', transform: 'translateX(-50%) rotate(-1deg)', width: '10rem', height: '0.5rem' }}
          />
        </div>

        <p
          className="font-handwritten text-lg text-zinc-400"
          style={{ transform: 'rotate(-0.5deg)' }}
        >
          {description}
        </p>

        {/* Monthly / Yearly toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.25rem' }}>
          <span className={cn("font-handwritten text-lg transition-colors", !yearly ? "text-white" : "text-zinc-500")}>
            Monthly
          </span>

          <button
            onClick={() => setYearly(v => !v)}
            aria-pressed={yearly}
            style={{ position: 'relative', width: '3.25rem', height: '1.75rem', borderRadius: '999px', border: '2px solid', transition: 'all 0.3s', flexShrink: 0 }}
            className={yearly ? "bg-violet-600 border-violet-400" : "bg-zinc-700 border-zinc-600"}
          >
            <span
              style={{
                position: 'absolute', top: '0.125rem', left: '0.125rem',
                width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                background: 'white', transition: 'transform 0.3s',
                transform: yearly ? 'translateX(1.5rem)' : 'translateX(0)',
                display: 'block',
              }}
            />
          </button>

          <span className={cn("font-handwritten text-lg transition-colors", yearly ? "text-white" : "text-zinc-500")}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Yearly
            <span
              className="bg-green-500/20 text-green-400 font-handwritten border border-green-500/30"
              style={{ fontSize: '0.8rem', padding: '0.125rem 0.5rem', borderRadius: '999px', transform: 'rotate(1deg)', display: 'inline-block' }}
            >
              Save 40%
            </span>
          </span>
        </div>
      </div>

      {/* ── Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {tiers.map((tier, index) => {
          const price    = displayPrice(tier.monthlyPrice);
          const isFree   = tier.monthlyPrice === 0;
          const rotations = ['-1deg', '1deg', '-1.5deg'];
          const rot = rotations[index % rotations.length];

          return (
            <div
              key={tier.name}
              style={{ position: 'relative', transform: `rotate(${rot})`, transition: 'transform 0.3s' }}
              className="group"
            >
              {/* Offset shadow — stays put, card lifts over it */}
              <div
                style={{
                  position: 'absolute', inset: 0, borderRadius: '0.75rem',
                  transform: 'translate(6px, 6px)',
                  zIndex: 0,
                }}
                className={tier.popular ? "bg-violet-500/40" : "bg-zinc-700/60"}
              />

              {/* Actual card — lifts on hover */}
              <div
                style={{
                  position: 'relative', zIndex: 1,
                  borderRadius: '0.75rem', padding: '1.75rem',
                  border: '2px solid',
                  transition: 'transform 0.25s',
                }}
                className={cn(
                  "group-hover:-translate-x-1 group-hover:-translate-y-1",
                  tier.popular
                    ? "bg-violet-950 border-violet-400"
                    : "bg-zinc-900 border-zinc-700"
                )}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div
                    className="bg-amber-400 text-zinc-900 font-handwritten border-2 border-zinc-900 shadow"
                    style={{
                      position: 'absolute', top: '-0.875rem', right: '-0.875rem',
                      fontSize: '0.8rem', padding: '0.25rem 0.75rem',
                      borderRadius: '999px', transform: 'rotate(12deg)',
                      zIndex: 10,
                    }}
                  >
                    Most Popular!
                  </div>
                )}

                {/* Icon + plan name */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    className={cn(
                      "border-2 flex items-center justify-center",
                      tier.popular ? "border-violet-400" : "border-zinc-600",
                      colorClasses[tier.color] ?? "text-violet-400"
                    )}
                    style={{ width: '3rem', height: '3rem', borderRadius: '50%', marginBottom: '1rem' }}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="font-handwritten text-2xl text-white">{tier.name}</h3>
                  <p className="font-handwritten text-zinc-400" style={{ marginTop: '0.125rem', fontSize: '0.95rem' }}>
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="font-handwritten" style={{ marginBottom: '1.5rem' }}>
                  {isFree ? (
                    <span className="text-white" style={{ fontSize: '2.5rem', fontWeight: 700 }}>Free</span>
                  ) : (
                    <>
                      <span className="text-white" style={{ fontSize: '2.5rem', fontWeight: 700 }}>${price}</span>
                      <span className="text-zinc-400" style={{ marginLeft: '0.25rem' }}>
                        /mo{yearly && <span className="text-zinc-500" style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>billed yearly</span>}
                      </span>
                      {yearly && (
                        <div className="text-green-400 font-handwritten" style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                          was ${tier.monthlyPrice}/mo — save ${((tier.monthlyPrice * DISCOUNT) * 12).toFixed(0)}/yr
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  {tier.features.map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className={cn(
                          "border-2 flex items-center justify-center flex-shrink-0",
                          tier.popular ? "border-violet-400 text-violet-400" : "border-zinc-500 text-zinc-400"
                        )}
                        style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%' }}
                      >
                        <Check style={{ width: '0.7rem', height: '0.7rem' }} />
                      </div>
                      <span className="font-handwritten text-zinc-200" style={{ fontSize: '1rem' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <a href={tier.ctaHref ?? "/signup"} style={{ display: 'block' }}>
                  <Button
                    className={cn(
                      "w-full font-handwritten text-lg",
                      "border-2 transition-all duration-200",
                      "shadow-[4px_4px_0px_0px]",
                      "hover:shadow-[2px_2px_0px_0px] hover:translate-x-[2px] hover:translate-y-[2px]",
                      tier.popular
                        ? "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white border-violet-300 shadow-violet-800"
                        : "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-white border-zinc-600 shadow-zinc-900"
                    )}
                    style={{ height: '3rem' }}
                  >
                    {tier.cta ?? "Get Started"}
                  </Button>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative glows */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          className="bg-violet-600/10 rounded-full blur-3xl"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '36rem', height: '24rem' }}
        />
        <div
          className="text-violet-500/15 font-handwritten"
          style={{ position: 'absolute', top: '5rem', left: '1rem', fontSize: '2.5rem', transform: 'rotate(12deg)' }}
        >✎</div>
        <div
          className="text-violet-500/15 font-handwritten"
          style={{ position: 'absolute', bottom: '3rem', right: '1rem', fontSize: '2.5rem', transform: 'rotate(-12deg)' }}
        >✏</div>
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
