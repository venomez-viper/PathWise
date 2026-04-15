import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { Sparkles, Zap } from "lucide-react";

const pathwiseTiers: PricingTier[] = [
  {
    name: "Free",
    icon: <Zap className="w-6 h-6" />,
    monthlyPrice: 0,
    description: "Get started on your career journey",
    color: "violet",
    cta: "Start for Free",
    ctaHref: "/signup",
    features: [
      "1 career roadmap",
      "3 career match suggestions",
      "5-step career assessment",
      "Basic task planner",
      "Career readiness score",
    ],
  },
  {
    name: "Pro",
    icon: <Sparkles className="w-6 h-6" />,
    monthlyPrice: 12.99,
    description: "Unlock your full career potential",
    color: "amber",
    popular: true,
    cta: "Upgrade to Pro",
    ctaHref: "/signup",
    features: [
      "Unlimited roadmaps",
      "Advanced career coaching",
      "Skill gap analysis",
      "Salary & market insights",
      "Shareable roadmap link",
      "Priority support",
    ],
  },
];

function CreativePricingDemo() {
  return (
    <CreativePricing
      tag="Transparent Pricing"
      title="Invest in your career"
      description="Start free. Upgrade when you're ready."
      tiers={pathwiseTiers}
    />
  );
}

export { CreativePricingDemo };
