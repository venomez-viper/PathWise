import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe2, MessagesSquare, Rocket, Send } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const FOOTER_LINKS = [
  {
    title: 'Product',
    items: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Solution', href: '/solution' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Blog', href: '/blog' },
      { label: 'Career framework', href: '/solution' },
      { label: 'Roadmap preview', href: '/pricing' },
    ],
  },
];

const SOCIALS = [
  { label: 'LinkedIn', icon: MessagesSquare },
  { label: 'Instagram', icon: Globe2 },
  { label: 'Updates', icon: Send },
];

export default function Footer() {
  return (
    <footer className="container py-8 pb-12 md:py-12">
      <div className="section-shell px-6 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Logo size={38} />
            <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--ink-soft)]">
              PathWise helps people move from vague ambition to focused career momentum with guided discovery, planning,
              and execution.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="#"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-white/68 px-4 py-2 text-sm font-medium text-[color:var(--ink)]"
                  >
                    <Icon className="h-4 w-4 text-[color:var(--brand)]" />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-[color:var(--ink-soft)]">{group.title}</h3>
                <div className="mt-4 flex flex-col gap-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="inline-flex items-center gap-2 text-base font-medium text-[color:var(--ink)] transition-colors hover:text-[color:var(--brand)]"
                    >
                      {item.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[color:var(--line)] pt-6 text-sm text-[color:var(--ink-soft)] md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2">
            <Rocket className="h-4 w-4 text-[color:var(--brand-warm)]" />
            Built for people who want a career plan they can actually follow.
          </div>
          <p>Copyright 2026 PathWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
