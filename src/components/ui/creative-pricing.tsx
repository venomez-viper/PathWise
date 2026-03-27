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
  amber:  "text-amber-500",
  blue:   "text-blue-500",
  purple: "text-purple-500",
  green:  "text-green-500",
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
  const YEARLY_DISCOUNT = 0.4; // 40 % off

  const displayPrice = (monthly: number) => {
    if (monthly === 0) return 0;
    const p = yearly ? monthly * (1 - YEARLY_DISCOUNT) : monthly;
    return yearly ? parseFloat(p.toFixed(2)) : p;
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="text-center space-y-5 mb-12">
        <div className="inline-block font-handwritten text-lg text-violet-400 bg-violet-500/10 px-4 py-1 rounded-full border border-violet-500/20 rotate-[-1deg]">
          {tag}
        </div>

        <div className="relative inline-block">
          <h2 className="text-4xl md:text-5xl font-bold font-handwritten text-white rotate-[-1deg]">
            {title}
            <span className="absolute -right-10 top-0 text-amber-400 rotate-12 text-3xl">✨</span>
          </h2>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-40 h-2 bg-violet-500/30 rotate-[-1deg] rounded-full blur-sm" />
        </div>

        <p className="font-handwritten text-xl text-zinc-400 rotate-[-0.5deg]">
          {description}
        </p>

        {/* ── Monthly / Yearly toggle ─────────────────── */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <span className={cn("font-handwritten text-lg transition-colors", !yearly ? "text-white" : "text-zinc-500")}>
            Monthly
          </span>

          <button
            onClick={() => setYearly(v => !v)}
            aria-pressed={yearly}
            className={cn(
              "relative w-14 h-7 rounded-full border-2 transition-all duration-300",
              yearly
                ? "bg-violet-500 border-violet-400"
                : "bg-zinc-700 border-zinc-600"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300",
                yearly && "translate-x-7"
              )}
            />
          </button>

          <span className={cn("font-handwritten text-lg transition-colors flex items-center gap-2", yearly ? "text-white" : "text-zinc-500")}>
            Yearly
            <span className="inline-block bg-green-500/20 text-green-400 text-sm font-handwritten px-2 py-0.5 rounded-full border border-green-500/30 rotate-[1deg]">
              Save 40%
            </span>
          </span>
        </div>
      </div>

      {/* ── Cards ──────────────────────────────────────── */}
      <div className={cn(
        "grid gap-8",
        tiers.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" : "grid-cols-1 md:grid-cols-3"
      )}>
        {tiers.map((tier, index) => {
          const price = displayPrice(tier.monthlyPrice);
          const isFree = tier.monthlyPrice === 0;
          const rotations = ["rotate-[-1deg]", "rotate-[1deg]", "rotate-[-1.5deg]"];

          return (
            <div
              key={tier.name}
              className={cn(
                "relative group",
                "transition-all duration-300",
                rotations[index % rotations.length]
              )}
            >
              {/* Card shadow layer */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl",
                  "border-2 transition-all duration-300",
                  "group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]",
                  tier.popular
                    ? "bg-violet-950 border-violet-400 shadow-[5px_5px_0px_0px] shadow-violet-500 group-hover:shadow-[9px_9px_0px_0px] group-hover:shadow-violet-500"
                    : "bg-zinc-900 border-zinc-700 shadow-[5px_5px_0px_0px] shadow-zinc-700 group-hover:shadow-[9px_9px_0px_0px] group-hover:shadow-zinc-700"
                )}
              />

              <div className="relative p-7">
                {tier.popular && (
                  <div className="absolute -top-3 -right-3 bg-amber-400 text-zinc-900 font-handwritten text-sm px-3 py-1 rounded-full rotate-12 border-2 border-zinc-900 shadow-md">
                    Most Popular!
                  </div>
                )}

                {/* Icon + name */}
                <div className="mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-full mb-4 flex items-center justify-center border-2",
                    tier.popular ? "border-violet-400" : "border-zinc-600",
                    colorClasses[tier.color] ?? "text-violet-400"
                  )}>
                    {tier.icon}
                  </div>
                  <h3 className="font-handwritten text-2xl text-white">{tier.name}</h3>
                  <p className="font-handwritten text-zinc-400 mt-0.5">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 font-handwritten">
                  {isFree ? (
                    <span className="text-4xl font-bold text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">${price}</span>
                      <span className="text-zinc-400 ml-1">
                        /mo{yearly && <span className="text-xs text-zinc-500 ml-1">billed yearly</span>}
                      </span>
                      {yearly && (
                        <div className="mt-1 text-sm text-green-400 font-handwritten">
                          was ${tier.monthlyPrice}/mo — you save ${((tier.monthlyPrice * YEARLY_DISCOUNT) * 12).toFixed(0)}/yr
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-7">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        tier.popular ? "border-violet-400 text-violet-400" : "border-zinc-500 text-zinc-400"
                      )}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="font-handwritten text-base text-zinc-200">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <a href={tier.ctaHref ?? "/signup"} className="block">
                  <Button
                    className={cn(
                      "w-full h-12 font-handwritten text-lg",
                      "border-2 transition-all duration-300",
                      "shadow-[4px_4px_0px_0px]",
                      "hover:shadow-[6px_6px_0px_0px]",
                      "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                      tier.popular
                        ? "bg-violet-600 hover:bg-violet-500 text-white border-violet-400 shadow-violet-700"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600 shadow-zinc-800"
                    )}
                  >
                    {tier.cta ?? "Get Started"}
                  </Button>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Decorative background pencil marks ─────────── */}
      <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-32 left-8 text-3xl text-violet-500/20 rotate-12">✎</div>
        <div className="absolute bottom-20 right-8 text-3xl text-violet-500/20 -rotate-12">✏</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
