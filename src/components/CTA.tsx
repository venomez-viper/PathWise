import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="container py-8 md:py-12">
      <div className="section-shell relative overflow-hidden px-6 py-8 md:px-10 md:py-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(30,90,82,0.18),_transparent_58%)] lg:block" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <div className="section-label">
              <span className="eyebrow-dot" />
              Early access
            </div>
            <h2 className="mt-5 section-title max-w-2xl">
              Build a career plan that keeps moving after motivation fades.
            </h2>
            <p className="mt-5 max-w-2xl section-copy">
              Join the first wave of students, switchers, and ambitious professionals using PathWise to turn ambition
              into a repeatable weekly system.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Free to start', 'No credit card required', 'Roadmaps built in minutes'].map((item) => (
                <div key={item} className="rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm font-medium text-[color:var(--ink)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--brand-cream)] p-6 shadow-[0_20px_48px_rgba(69,44,20,0.1)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[rgba(216,109,61,0.12)] p-3 text-[color:var(--brand-warm)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">Waitlist access</p>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">Get launch updates and first access to new roadmap features.</p>
              </div>
            </div>

            {submitted ? (
              <div className="mt-6 rounded-[24px] bg-white/80 p-5">
                <div className="flex items-center gap-3 text-[color:var(--brand)]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-bold">You are on the list.</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                  We will send product updates and invite-only access details to {email}.
                </p>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[color:var(--ink)]">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--brand)]"
                    required
                  />
                </label>
                <button type="submit" className="btn-primary w-full">
                  Join the waitlist
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
              Weekly updates. No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
