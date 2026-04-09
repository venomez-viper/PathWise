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
    version: '0.13.0',
    date: 'April 9, 2026',
    title: 'Password Recovery & Smarter Results',
    tag: 'feature',
    description: 'Reset your password, get more accurate career matches, and a smoother signup experience.',
    highlights: [
      'Forgot your password? You can now reset it from the sign-in page',
      'Career assessment results are now saved — revisit them anytime without retaking',
      'RIASEC chart now shows full labels and scores so you can understand your interest profile',
      'Personality traits are estimated from your interests even before completing the full assessment',
      'New "Continue Assessment" button to deepen your results when you\'re ready',
      'Streamlined signup — land on a welcoming dashboard and start your assessment from there',
    ],
  },
  {
    version: '0.12.0',
    date: 'April 8, 2026',
    title: 'Career Assessment v2',
    tag: 'feature',
    description: 'A completely redesigned career assessment with deeper questions and personalised results.',
    highlights: [
      'New 6-phase assessment covering interests, personality, values, work style, and strengths',
      'One question at a time with smooth transitions and progress tracking',
      'Discover your career archetype — 30 unique types like "The Analytical Architect"',
      'RIASEC interest radar chart showing your career fingerprint',
      'Big Five personality profile matched to career fit',
      'See an early preview of your archetype halfway through',
      'Save your progress and resume anytime',
      '"How to boost your match" tips for each career',
      'Download and share your career DNA card',
    ],
  },
  {
    version: '0.11.0',
    date: 'April 7, 2026',
    title: 'Notifications & Certificates',
    tag: 'feature',
    description: 'Stay informed with in-app notifications and celebrate your progress with certificates.',
    highlights: [
      'Notification bell with real-time updates on your progress',
      'Guided tour for new users after completing the assessment',
      'Completion certificate with fireworks when you finish all milestones',
      'Share your career journey on Twitter, LinkedIn, or copy a link',
      'In-app support — submit a ticket without leaving the app',
    ],
  },
  {
    version: '0.10.0',
    date: 'April 7, 2026',
    title: 'Settings & Public Profiles',
    tag: 'feature',
    description: 'Customise your account and share your career profile with the world.',
    highlights: [
      'Avatar picker with 12 preset illustrations',
      'Retake your assessment, change target role, or reset your roadmap from Settings',
      'Export all your data as JSON anytime',
      'Public profile pages — share your career journey at pathwise.fit/u/your-name',
      'Set a custom headline, bio, and profile URL',
    ],
  },
  {
    version: '0.9.0',
    date: 'April 7, 2026',
    title: 'Social Login & 90 Career Paths',
    tag: 'feature',
    description: 'Sign in with Google or Apple, and explore 90+ career paths with smarter matching.',
    highlights: [
      'Sign in with Google or Apple — one tap to get started',
      'Pick up to 3 options per assessment question for more nuanced results',
      '90 career profiles spanning tech, law, trades, arts, science, and more',
      'Task detail panel — view and edit tasks in a slide-over',
      'Sort tasks by priority, due date, or title',
    ],
  },
  {
    version: '0.8.0',
    date: 'April 6, 2026',
    title: 'Widgets & Streaks',
    tag: 'feature',
    description: 'Interactive sidebar widgets and streak tracking to keep you on track.',
    highlights: [
      'Widget sidebar with Daily Focus, Streaks, Milestone Map, and more',
      'Streak tracking — build a daily habit of career growth',
      'Achievement badges that unlock as you hit milestones',
    ],
  },
  {
    version: '0.6.0',
    date: 'April 2, 2026',
    title: 'Fresh Look',
    tag: 'improvement',
    description: 'A clean, light redesign for a better experience.',
    highlights: [
      'New Zen Stone light theme — easier on the eyes',
      'Apple Fitness-inspired achievement badges',
      'Smoother animations and transitions throughout',
    ],
  },
  {
    version: '0.5.0',
    date: 'March 27, 2026',
    title: 'We\'re Live!',
    tag: 'feature',
    description: 'PathWise launched on pathwise.fit with AI-powered career guidance.',
    highlights: [
      'Take the career assessment and get personalised matches',
      'AI-generated roadmap with milestones and daily tasks',
      'Skill Gap Assessment to identify what to learn next',
    ],
  },
];
