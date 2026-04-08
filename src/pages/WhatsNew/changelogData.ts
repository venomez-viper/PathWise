export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  tag: 'feature' | 'improvement' | 'fix' | 'security';
  highlights: string[];
}

/*
 * ═══════════════════════════════════════════════════════════════
 * HOW TO ADD A NEW ENTRY:
 *
 * 1. Copy the template below
 * 2. Paste it at the TOP of the CHANGELOG array (newest first)
 * 3. Fill in: version, date, title, tag, description, highlights
 * 4. Commit and push — it shows up on /whats-new and /app/whats-new
 *
 * TEMPLATE:
 * {
 *   version: 'X.Y.Z',
 *   date: 'Month Day, Year',
 *   title: 'Short Title',
 *   tag: 'feature',  // 'feature' | 'improvement' | 'fix' | 'security'
 *   description: 'One sentence summary.',
 *   highlights: [
 *     'Bullet point 1',
 *     'Bullet point 2',
 *   ],
 * },
 * ═══════════════════════════════════════════════════════════════
 */

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.11.0',
    date: 'April 7, 2026',
    title: 'Notifications, Onboarding Tour & Certificates',
    tag: 'feature',
    description: 'In-app notification system, guided feature tour for new users, completion certificates with fireworks, and shareable profile cards.',
    highlights: [
      'Notification bell with real-time dropdown and 60-second polling',
      'Guided 5-step onboarding tour after first assessment',
      'Completion certificate with fireworks when all milestones are done',
      'Share Journey button (Twitter, LinkedIn, copy link)',
      'In-app support page with ticket submission',
      'In-app What\'s New changelog with filter pills',
      'Contact Us page saves to support ticket system',
      'Resend email integration (welcome, contact confirmation, admin alerts)',
      'PostHog and Microsoft Clarity analytics',
    ],
  },
  {
    version: '0.10.1',
    date: 'April 7, 2026',
    title: 'Settings Revamp & Public Profiles',
    tag: 'feature',
    description: 'Complete Settings page overhaul with real controls, plus shareable public profile cards.',
    highlights: [
      'Avatar picker with 12 preset illustrations',
      'Career controls: retake assessment, change target role, reset roadmap',
      'Export your data as JSON (GDPR compliant)',
      'Account deletion with cascade delete',
      'Public profile pages at pathwise.fit/u/your-name',
      'Profile settings: headline, bio, custom URL slug',
    ],
  },
  {
    version: '0.10.0',
    date: 'April 7, 2026',
    title: 'Admin Dashboard & Security Hardening',
    tag: 'feature',
    description: 'Full admin panel for user management, support tickets, analytics, and comprehensive security upgrades.',
    highlights: [
      'Admin dashboard with user management, bulk actions, CSV export',
      'Support ticket system with status tracking',
      'User impersonation for debugging',
      'Rate limiting on all API endpoints',
      'IDOR vulnerability fixes',
      'Microsoft Clarity and PostHog analytics',
      'DMARC, SPF, DKIM email authentication',
    ],
  },
  {
    version: '0.9.0',
    date: 'April 7, 2026',
    title: 'OAuth, Smart Assessment & 90 Career Profiles',
    tag: 'feature',
    description: 'Google and Apple sign-in, multi-select assessment, expanded career database, and a smarter AI career brain.',
    highlights: [
      'Google and Apple OAuth social login',
      'Assessment: pick up to 3 options per question',
      '40 new career profiles (90 total) across law, trades, arts, science',
      'AI career brain: synergy scoring, anti-patterns, personality coherence',
      'Task detail/edit panel (CRM-style slide-over)',
      'Task sort by priority, due date, newest, title',
      'Mandatory assessment onboarding for new users',
      'Due date fix: milestones scale to chosen timeline',
    ],
  },
  {
    version: '0.8.0',
    date: 'April 6, 2026',
    title: 'Widget System & Panda Mascots',
    tag: 'feature',
    description: 'Interactive widget sidebar and contextual Panda mascots across the app.',
    highlights: [
      '8 interactive widgets: Daily Focus, Streaks, Milestone Map, and more',
      'App-level widget panel on Roadmap, Tasks, Progress pages',
      '15 Panda mascot moods placed across empty states and success moments',
      'Expert system career brain with 4-layer modifier architecture',
    ],
  },
  {
    version: '0.7.0',
    date: 'April 6, 2026',
    title: 'Expert System Career Brain',
    tag: 'improvement',
    description: 'Replaced static career responses with an intelligent modifier system.',
    highlights: [
      'Experience modifiers (5 tiers: student to expert)',
      'Gap pattern database (30 keyword-matched patterns)',
      'Career stage modifiers (12 stage x risk combinations)',
      'Combination rules engine (25 persona rules)',
      'Learning style router (24 skills x 5 formats)',
    ],
  },
  {
    version: '0.6.0',
    date: 'April 2-5, 2026',
    title: 'UI Retheme & Achievements',
    tag: 'improvement',
    description: 'Zen Stone light theme and gamified achievement system.',
    highlights: [
      'Rethemed from dark purple to Zen Stone light palette',
      'Apple Fitness-inspired achievement badges',
      'Auto-award system for assessment, roadmap, and task milestones',
    ],
  },
  {
    version: '0.5.0',
    date: 'March 27, 2026',
    title: 'Custom Domain & Live Backend',
    tag: 'feature',
    description: 'Launched on pathwise.fit with a live Encore.dev backend.',
    highlights: [
      'Custom domain: pathwise.fit',
      'Live backend API connection',
      'Skill Gap Assessment page',
      'AI task generation from prompts',
    ],
  },
];
