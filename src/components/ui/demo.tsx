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
      "1 AI-generated career roadmap",
      "Up to 3 career match suggestions",
      "Basic task planner",
      "Career readiness score",
      "5-step career assessment",
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
      "Unlimited AI roadmap generations",
      "Advanced Claude AI coaching",
      "Personalised skill gap analysis",
      "Priority AI response times",
      "Shareable roadmap link",
      "Labor market salary insights",
      "Priority support",
    ],
  },
];

function CreativePricingDemo() {
  return (
    <CreativePricing
      tag="Transparent Pricing"
      title="Invest in your career"
      description="Start free. Upgrade when you're ready to accelerate."
      tiers={pathwiseTiers}
    />
  );
}

export { CreativePricingDemo };
