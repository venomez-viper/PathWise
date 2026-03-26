import { ArrowRight, Brain, ChartNoAxesColumn, Goal, Route } from 'lucide-react';

const STEPS = [
  {
    id: '01',
    title: 'Understand your strongest-fit direction',
    description: 'Map your values, strengths, motivations, and work style into a grounded career identity.',
    icon: Brain,
  },
  {
    id: '02',
    title: 'Turn that direction into a roadmap',
    description: 'PathWise sequences skills, portfolio moves, network actions, and timing into a focused plan.',
    icon: Route,
  },
  {
    id: '03',
    title: 'Track execution week by week',
    description: 'Stay accountable with practical next steps, progress signals, and confidence-building momentum.',
    icon: Goal,
  },
];

export default function HowItWorks() {
  return (
    <section className="container py-8 md:py-12" id="how-it-works">
      <div className="section-shell px-6 py-8 md:px-8 md:py-10">
        <div className="max-w-3xl">
          <div className="section-label">
            <span className="eyebrow-dot" />
            How it works
          </div>
          <h2 className="mt-5 section-title">A calmer path from uncertainty to traction.</h2>
          <p className="mt-5 section-copy">
            Instead of asking you to figure everything out alone, PathWise gives you structure at each step of the
            journey.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative rounded-[28px] border border-[color:var(--line)] bg-white/72 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-[0.25em] text-[color:var(--brand)]">{step.id}</span>
                  <div className="rounded-2xl bg-[rgba(30,90,82,0.1)] p-3 text-[color:var(--brand)]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-bold text-[color:var(--ink)]">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-[color:var(--ink-soft)]">{step.description}</p>
                {index < STEPS.length - 1 && (
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[color:var(--ink-soft)]">
                    <ChartNoAxesColumn className="h-4 w-4 text-[color:var(--brand-warm)]" />
                    Progress compounds into the next step
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
