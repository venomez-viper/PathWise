import { BarChart3, Brain, BriefcaseBusiness, CalendarRange, Compass, Network, Route, Sparkles } from 'lucide-react';

const LAYERS = [
  {
    title: 'Discovery',
    description: 'Clarify your professional identity and strongest-fit directions.',
    icon: Brain,
    points: ['AI career discovery', 'Strength and value mapping', 'Skill gap diagnosis'],
  },
  {
    title: 'Planning',
    description: 'Translate career direction into a practical roadmap.',
    icon: Route,
    points: ['Goal-based path design', 'Skill sequencing', 'Role transition planning'],
  },
  {
    title: 'Execution',
    description: 'Keep momentum with practical weekly guidance.',
    icon: CalendarRange,
    points: ['Weekly action plans', 'Project prompts', 'Career readiness checkpoints'],
  },
  {
    title: 'Opportunity',
    description: 'Surface the right signals as you become more ready.',
    icon: BriefcaseBusiness,
    points: ['Target-role insight', 'Network prompts', 'Progress dashboards'],
  },
];

const IMPACT = [
  { label: 'Decision clarity', icon: Compass },
  { label: 'Weekly momentum', icon: Sparkles },
  { label: 'Network guidance', icon: Network },
  { label: 'Progress visibility', icon: BarChart3 },
];

export default function Solution() {
  return (
    <section className="container py-8 md:py-12" id="solution">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-shell px-6 py-8 md:px-8">
          <div className="section-label">
            <span className="eyebrow-dot" />
            The PathWise system
          </div>
          <h2 className="mt-5 section-title">One product that covers the entire journey.</h2>
          <p className="mt-5 section-copy">
            PathWise is not another isolated career tool. It connects discovery, planning, and execution so every next
            step has context.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {IMPACT.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[24px] border border-[color:var(--line)] bg-white/68 p-4">
                  <Icon className="h-5 w-5 text-[color:var(--brand-warm)]" />
                  <p className="mt-3 text-base font-medium text-[color:var(--ink)]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4">
          {LAYERS.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div key={layer.title} className="section-shell px-6 py-6 md:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[rgba(30,90,82,0.1)] p-3 text-[color:var(--brand)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">
                          Layer {index + 1}
                        </p>
                        <h3 className="text-2xl font-bold text-[color:var(--ink)]">{layer.title}</h3>
                      </div>
                    </div>
                    <p className="mt-4 text-base leading-7 text-[color:var(--ink-soft)]">{layer.description}</p>
                  </div>

                  <div className="grid gap-2 md:min-w-[280px]">
                    {layer.points.map((point) => (
                      <div key={point} className="rounded-2xl bg-white/68 px-4 py-3 text-sm font-medium text-[color:var(--ink)]">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
