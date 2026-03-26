import { ArrowRight, Brain, BriefcaseBusiness, Check, Compass, Sparkles, X } from 'lucide-react';

const TOOLS = [
  {
    name: 'Job boards',
    does: 'Show open listings',
    misses: ['Personal career fit', 'Long-range planning', 'Weekly accountability'],
    icon: BriefcaseBusiness,
  },
  {
    name: 'Professional networks',
    does: 'Expand your visibility',
    misses: ['Path clarity', 'Decision support', 'Roadmap sequencing'],
    icon: Sparkles,
  },
  {
    name: 'Resume tools',
    does: 'Polish application assets',
    misses: ['Career discovery', 'Skill prioritization', 'Confidence-building guidance'],
    icon: Brain,
  },
];

const NEEDS = [
  {
    title: 'Functional need',
    text: 'Help me identify the right path and break it into realistic steps.',
  },
  {
    title: 'Emotional need',
    text: 'Help me stop second-guessing every decision about my future.',
  },
  {
    title: 'Momentum need',
    text: 'Help me stay consistent instead of restarting from zero every month.',
  },
];

export default function Problem() {
  return (
    <section className="container py-8 md:py-12">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="section-shell px-6 py-8 md:px-8">
          <div className="section-label">
            <span className="eyebrow-dot" />
            Why current tools fall short
          </div>
          <h2 className="mt-5 section-title">
            Most career products help you apply faster, not decide better.
          </h2>
          <p className="mt-5 section-copy">
            The real bottleneck is not effort. It is uncertainty. People need a system that helps them understand who
            they are, where they should go next, and what to do this week.
          </p>

          <div className="mt-8 space-y-4">
            {NEEDS.map((need) => (
              <div
                key={need.title}
                className="rounded-[24px] border border-[color:var(--line)] bg-white/68 p-5"
              >
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
                  <Compass className="h-4 w-4" />
                  {need.title}
                </div>
                <p className="mt-3 text-base leading-7 text-[color:var(--ink)]">{need.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-shell px-6 py-8 md:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">Market reality</p>
              <h3 className="mt-2 text-3xl font-bold text-[color:var(--ink)]">Fragmented tools, fragmented confidence</h3>
            </div>
            <div className="hidden rounded-full bg-[rgba(30,90,82,0.08)] p-3 text-[color:var(--brand)] md:block">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-4">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="rounded-[24px] border border-[color:var(--line)] bg-white/72 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[rgba(216,109,61,0.1)] p-3 text-[color:var(--brand-warm)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-[color:var(--ink)]">{tool.name}</h4>
                          <p className="mt-1 flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
                            <Check className="h-4 w-4 text-[color:var(--brand)]" />
                            {tool.does}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 md:min-w-[260px]">
                      {tool.misses.map((miss) => (
                        <div key={miss} className="flex items-start gap-2 rounded-2xl bg-[rgba(17,58,54,0.05)] px-3 py-2 text-sm text-[color:var(--ink)]">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-warm)]" />
                          {miss}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
