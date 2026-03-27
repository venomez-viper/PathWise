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

      {/* ── Header (on dark section background — text is white) ── */}
      <div className="text-center mb-14" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
        <div
          className="font-handwritten text-base text-violet-300 px-4 py-1 rounded-full border border-violet-500/30 bg-violet-500/10"
          style={{ transform: "rotate(-1deg)", display: "inline-block" }}
        >
          {tag}
        </div>

        <div style={{ position: "relative", display: "inline-block" }}>
          <h2
            className="font-handwritten text-4xl md:text-5xl font-bold text-white"
            style={{ transform: "rotate(-1deg)", display: "inline-block" }}
          >
            {title}
          </h2>
          <span
            className="text-amber-400 text-3xl"
            style={{ position: "absolute", right: "-2.5rem", top: 0, transform: "rotate(12deg)", display: "inline-block" }}
          >
            ✨
          </span>
          <div
            className="bg-violet-500/25 rounded-full blur-sm"
            style={{ position: "absolute", bottom: "-0.5rem", left: "50%", transform: "translateX(-50%) rotate(-1deg)", width: "10rem", height: "0.5rem" }}
          />
        </div>

        <p
          className="font-handwritten text-lg text-zinc-300"
          style={{ transform: "rotate(-0.5deg)" }}
        >
          {description}
        </p>

        {/* Monthly / Yearly toggle (white text on dark bg) */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "0.25rem" }}>
          <span className={cn("font-handwritten text-lg transition-colors", !yearly ? "text-white" : "text-zinc-500")}>
            Monthly
          </span>

          <button
            onClick={() => setYearly((v) => !v)}
            aria-pressed={yearly}
            aria-label="Toggle yearly billing"
            style={{ position: "relative", width: "3.25rem", height: "1.75rem", borderRadius: "999px", border: "2px solid", transition: "all 0.3s", flexShrink: 0 }}
            className={yearly ? "bg-violet-600 border-violet-400" : "bg-zinc-700 border-zinc-600"}
          >
            <span
              style={{
                position: "absolute", top: "0.125rem", left: "0.125rem",
                width: "1.25rem", height: "1.25rem", borderRadius: "50%",
                background: "white", transition: "transform 0.3s",
                transform: yearly ? "translateX(1.5rem)" : "translateX(0)",
                display: "block",
              }}
            />
          </button>

          <span
            className={cn("font-handwritten text-lg transition-colors", yearly ? "text-white" : "text-zinc-500")}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            Yearly
            <span
              className="bg-green-500/20 text-green-400 font-handwritten border border-green-500/30"
              style={{ fontSize: "0.8rem", padding: "0.125rem 0.5rem", borderRadius: "999px", transform: "rotate(1deg)", display: "inline-block" }}
            >
              Save 40%
            </span>
          </span>
        </div>
      </div>

      {/* ── Cards (white neo-brutalist on dark bg) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {tiers.map((tier, index) => {
          const price    = displayPrice(tier.monthlyPrice);
          const isFree   = tier.monthlyPrice === 0;
          const rotations = ["-1deg", "1deg", "-1.5deg"];
          const rot = rotations[index % rotations.length];

          return (
            <div
              key={tier.name}
              style={{ position: "relative", transform: `rotate(${rot})`, transition: "transform 0.3s" }}
              className="group"
            >
              {/* Card with hard box shadow */}
              <div
                className={cn(
                  "bg-white border-2 border-zinc-900 rounded-xl p-7",
                  "shadow-[5px_5px_0px_0px_#18181b]",
                  "group-hover:shadow-[8px_8px_0px_0px_#18181b] group-hover:-translate-x-1 group-hover:-translate-y-1",
                  "transition-all duration-200",
                  "relative"
                )}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div
                    className="bg-amber-400 text-zinc-900 font-handwritten border-2 border-zinc-900 shadow-sm"
                    style={{
                      position: "absolute", top: "-0.875rem", right: "-0.875rem",
                      fontSize: "0.8rem", padding: "0.25rem 0.75rem",
                      borderRadius: "999px", transform: "rotate(12deg)",
                      zIndex: 10,
                    }}
                  >
                    Most Popular!
                  </div>
                )}

                {/* Icon + plan name */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    className={cn(
                      "border-2 border-zinc-900 flex items-center justify-center text-violet-600"
                    )}
                    style={{ width: "3rem", height: "3rem", borderRadius: "50%", marginBottom: "1rem" }}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="font-handwritten text-2xl text-zinc-900">{tier.name}</h3>
                  <p className="font-handwritten text-zinc-600" style={{ marginTop: "0.125rem", fontSize: "0.95rem" }}>
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="font-handwritten" style={{ marginBottom: "1.5rem" }}>
                  {isFree ? (
                    <div>
                      <span className="text-zinc-900" style={{ fontSize: "2.5rem", fontWeight: 700 }}>$0</span>
                      <span className="text-zinc-500" style={{ marginLeft: "0.5rem", fontSize: "1.1rem" }}>/ Free</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-zinc-900" style={{ fontSize: "2.5rem", fontWeight: 700 }}>${price}</span>
                      <span className="text-zinc-500" style={{ marginLeft: "0.25rem" }}>
                        /mo{yearly && <span className="text-zinc-500" style={{ fontSize: "0.75rem", marginLeft: "0.25rem" }}>billed yearly</span>}
                      </span>
                      {yearly && (
                        <div className="text-green-600 font-handwritten" style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                          was ${tier.monthlyPrice}/mo — save ${((tier.monthlyPrice * DISCOUNT) * 12).toFixed(0)}/yr
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.75rem" }}>
                  {tier.features.map((feature) => (
                    <div key={feature} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        className="border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 text-zinc-900"
                        style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%" }}
                      >
                        <Check style={{ width: "0.7rem", height: "0.7rem" }} />
                      </div>
                      <span className="font-handwritten text-zinc-600" style={{ fontSize: "1rem" }}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <a href={tier.ctaHref ?? "/signup"} style={{ display: "block" }}>
                  <Button
                    className={cn(
                      "w-full font-handwritten text-lg",
                      "border-2 border-zinc-900 transition-all duration-200",
                      "shadow-[4px_4px_0px_0px_#18181b]",
                      "hover:shadow-[2px_2px_0px_0px_#18181b] hover:translate-x-[2px] hover:translate-y-[2px]",
                      tier.popular
                        ? "bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-900"
                        : "bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white"
                    )}
                    style={{ height: "3rem" }}
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
      <div style={{ position: "absolute", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
        <div
          className="bg-violet-600/10 rounded-full blur-3xl"
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "36rem", height: "24rem" }}
        />
        <div
          className="text-violet-500/15 font-handwritten"
          style={{ position: "absolute", top: "5rem", left: "1rem", fontSize: "2.5rem", transform: "rotate(12deg)" }}
        >
          ✎
        </div>
        <div
          className="text-violet-500/15 font-handwritten"
          style={{ position: "absolute", bottom: "3rem", right: "1rem", fontSize: "2.5rem", transform: "rotate(-12deg)" }}
        >
          ✏
        </div>
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
