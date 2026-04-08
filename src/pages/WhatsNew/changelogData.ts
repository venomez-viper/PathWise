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
      'In-app notifications so you never miss important updates',
      'Guided feature tour for new users',
      'Completion certificate with fireworks when you finish your roadmap',
      'Share your career journey on LinkedIn and Twitter',
      'Contact support directly from the app',
      'Email confirmations for account and support requests',
      'Updated What\'s New page inside the app',
    ],
  },
  {
    version: '0.10.1',
    date: 'April 7, 2026',
    title: 'Settings Revamp & Public Profiles',
    tag: 'feature',
    description: 'Complete Settings page overhaul with real controls, plus shareable public profile cards.',
    highlights: [
      'Choose from 12 avatar illustrations',
      'Retake assessment, change target role, or reset roadmap',
      'Download your data as a file',
      'Delete your account if needed',
      'Create a shareable public profile with custom URL',
    ],
  },
  {
    version: '0.10.0',
    date: 'April 7, 2026',
    title: 'Admin Dashboard & Security',
    tag: 'improvement',
    description: 'Improved account security, performance enhancements, and general bug fixes.',
    highlights: [
      'Improved account security',
      'Faster, more reliable experience',
      'Bug fixes and performance improvements',
    ],
  },
  {
    version: '0.9.0',
    date: 'April 7, 2026',
    title: 'Smart Assessment & 90 Career Profiles',
    tag: 'feature',
    description: 'Multi-select assessment, expanded career database, smarter AI matching, and improved task management.',
    highlights: [
      'Pick up to 3 answers per question for more accurate results',
      '40 new career paths added (90 total) across law, trades, arts, science, and more',
      'Smarter career matching with improved AI',
      'Click any task to view details, edit, or delete',
      'Sort tasks by priority, due date, or title',
      'Welcome guide for new users',
      'Fixed: roadmap timelines now match your chosen plan',
    ],
  },
  {
    version: '0.8.0',
    date: 'April 6, 2026',
    title: 'Widget System & Panda Mascots',
    tag: 'feature',
    description: 'Interactive widget sidebar and contextual Panda mascots across the app.',
    highlights: [
      'Daily Focus, Streaks, and Milestone widgets in your sidebar',
      'Meet the PathWise Panda mascots throughout the app',
      'Smarter career recommendations',
    ],
  },
  {
    version: '0.7.0',
    date: 'April 6, 2026',
    title: 'Expert System Career Brain',
    tag: 'improvement',
    description: 'Replaced static career responses with an intelligent modifier system.',
    highlights: [
      'Personalized career advice based on your experience level',
      'Better skill gap recommendations',
      'Career suggestions that understand your unique combination of strengths',
    ],
  },
  {
    version: '0.6.0',
    date: 'April 2-5, 2026',
    title: 'UI Retheme & Achievements',
    tag: 'improvement',
    description: 'Zen Stone light theme and gamified achievement system.',
    highlights: [
      'Beautiful new light theme design',
      'Earn achievement badges as you progress',
      'Automatic badges for completing milestones',
    ],
  },
  {
    version: '0.5.0',
    date: 'March 27, 2026',
    title: 'Launch',
    tag: 'feature',
    description: 'PathWise launches publicly at pathwise.fit.',
    highlights: [
      'PathWise launches at pathwise.fit',
      'Career assessment with AI-powered matching',
      'Skill gap analysis and learning recommendations',
    ],
  },
];
