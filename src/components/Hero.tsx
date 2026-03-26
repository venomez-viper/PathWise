import { ArrowRight, Compass, MapPinned, Sparkles, Stars, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const SIGNALS = [
  'Identity signal',
  'Career fit score',
  'Skill gap map',
  'Next-week action plan',
];

const MILESTONES = [
  { label: 'Role clarity', value: '92%', tone: 'var(--brand)' },
  { label: 'Momentum in 30 days', value: '3x', tone: 'var(--brand-warm)' },
  { label: 'Roadmap confidence', value: '4.8/5', tone: 'var(--brand-gold)' },
];

export default function Hero() {
  return (
    <section className="container pt-28 md:pt-36">
      <div className="section-shell relative overflow-hidden px-6 py-8 md:px-10 md:py-10">
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(240,187,90,0.28),_transparent_55%)]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[rgba(30,90,82,0.12)] blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="section-label mb-6">
              <span className="eyebrow-dot" />
              AI-guided career operating system
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.92] text-[color:var(--ink)] md:text-6xl xl:text-7xl">
              Career direction that feels
              <span className="block text-[color:var(--brand)]">clear, concrete, and actionable.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--ink-soft)] md:text-xl">
              PathWise turns career uncertainty into a living roadmap. We map your strengths, surface the right paths,
              and turn long-term ambition into focused weekly moves.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/pricing" className="btn-primary">
                Start your roadmap
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/how-it-works" className="btn-secondary">
                See how it works
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {SIGNALS.map((signal) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-[color:var(--line)] bg-white/55 px-4 py-3 text-sm font-medium text-[color:var(--ink)]"
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] bg-[color:var(--surface-dark)] p-6 text-white shadow-[0_24px_60px_rgba(20,30,35,0.2)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/55">Roadmap preview</p>
                  <h2 className="mt-2 text-3xl font-bold">Product strategy path</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 p-3">
                  <Compass className="h-6 w-6 text-[color:var(--brand-gold)]" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Sparkles className="h-5 w-5 text-[color:var(--brand-gold)]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">This week</p>
                      <p className="mt-1 text-lg font-medium">Validate your strongest-fit product roles</p>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        We matched your strengths to product strategy, research ops, and customer insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <MapPinned className="h-5 w-5 text-[color:var(--brand-gold)]" />
                    <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/45">Next milestone</p>
                    <p className="mt-1 text-lg font-medium">Portfolio narrative</p>
                    <p className="mt-2 text-sm text-white/65">Turn your strongest projects into evidence for the role you want.</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <TrendingUp className="h-5 w-5 text-[color:var(--brand-gold)]" />
                    <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/45">Momentum</p>
                    <p className="mt-1 text-lg font-medium">Daily score is climbing</p>
                    <p className="mt-2 text-sm text-white/65">Three recommended actions are unlocked for the next seven days.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {MILESTONES.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-[color:var(--line)] bg-white/72 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
                    <Stars className="h-4 w-4" style={{ color: item.tone }} />
                    {item.label}
                  </div>
                  <div className="mt-3 text-3xl font-bold text-[color:var(--ink)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
