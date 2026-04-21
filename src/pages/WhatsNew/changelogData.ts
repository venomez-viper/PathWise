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
 * 4. Commit and push - it shows up on /whats-new and /app/whats-new
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
    version: '0.22.0',
    date: 'April 21, 2026',
    title: 'Outbox, snippets, and a real sender picker',
    tag: 'feature',
    description: 'The support inbox now sends, not just replies: compose to anyone, pick your sender address, insert saved snippets, and have reply-backs thread into the same ticket automatically.',
    highlights: [
      'Compose modal: write to any address with To and CC, and every send opens a tracked ticket so reply-backs land here',
      'Sender picker with four verified mailboxes: hello, onboarding, support, marketing',
      'Per-agent snippets: save your own canned replies, insert with one click, manage in a side panel',
      'Reply composer now supports additional recipients and CC',
      'New "In Progress" filter tab, distinct from Open',
      'Delete stays visible for support agents but is admin-only: agents see a clear "ask an admin" prompt',
      'Removed the automatic "Hi {name}" greeting so agents write their own opening',
    ],
  },
  {
    version: '0.21.0',
    date: 'April 21, 2026',
    title: 'Support inbox + Team Roles',
    tag: 'feature',
    description: 'Admin Tickets becomes a real support inbox with two-way replies, and admins can now grant teammates support-agent access to just the inbox.',
    highlights: [
      'Two-pane ticket inbox with unread indicators, search, and status filters',
      'Reply to tickets inline — replies thread properly in the customer\'s email client',
      'User replies to support emails automatically appear in the ticket thread',
      'Team Roles console: grant support-agent access by email (no full admin console)',
      'Standalone /support route for support agents — inbox only, nothing else',
    ],
  },
  {
    version: '0.20.0',
    date: 'April 17, 2026',
    title: 'Career Journal — write, dictate, reflect',
    tag: 'feature',
    description:
      'A quiet new space to journal your career. Type or dictate entries with voice, get AI-generated tags and periodic reflections, and ask questions across your own journey.',
    highlights: [
      'Voice dictation with Mistral Voxtral',
      'AI-generated tags on every entry (win, skill-gap, interview-prep, …)',
      'Daily reflection prompts, refreshed every 24 hours',
      'Auto-summaries every 5 entries',
      'Ask natural-language questions across your entire journal',
    ],
  },
  {
    version: '0.19.0',
    date: 'April 15, 2026',
    title: 'Focus Mode, Drag & Drop, Streak Celebrations',
    tag: 'feature',
    description: 'A zen focus view with pomodoro timer, drag-and-drop tasks, and confetti when you hit streak milestones.',
    highlights: [
      'Focus Mode - distraction-free view of today\'s tasks with a 25-minute pomodoro timer',
      'Drag and drop tasks between kanban columns (To Do, In Progress, Done)',
      'Streak celebrations - confetti and Panda party at 3, 7, 14, 30, 60, and 100 day milestones',
      'Smooth page transitions when navigating between screens',
      'Accessibility improvements - keyboard focus rings, skip-to-content, better contrast',
      'Assessment welcome screen redesigned with phase overview and outcome preview',
    ],
  },
  {
    version: '0.18.0',
    date: 'April 15, 2026',
    title: 'Smarter Assessment Brain',
    tag: 'feature',
    description: 'Major scoring engine overhaul with better accuracy, skill gap ROI ranking, and interactive skill selection.',
    highlights: [
      'Career matching accuracy improved - scores now spread realistically instead of clustering at 98%',
      'Score breakdown - see exactly why each career matched (interest, personality, values, aptitude)',
      'Skill gaps ranked by ROI - learn the skills that boost your score the most per hour',
      'Interactive skill picker - click a domain to see and select specific skills you know',
      'Bias detection flags inconsistent or rushed answers with a confidence note',
      'Career pathways show where each role leads (entry roles and progression)',
      'All 91 career profiles now have specific tools and frameworks instead of vague skills',
      'Real clickable learning resource URLs for every skill gap',
      'Assessment progress saved to the server - resume on any device',
    ],
  },
  {
    version: '0.17.0',
    date: 'April 14, 2026',
    title: 'Consistent Design & Better Navigation',
    tag: 'improvement',
    description: 'Unified button colors, skill bubbles on results, and two-way task-milestone navigation.',
    highlights: [
      'All app buttons now use a consistent copper accent',
      'Career match cards show domain tags, skill bubbles, and pathway time',
      'Skills you already have are highlighted on career match cards',
      'Tasks show which milestone they belong to with a clickable badge',
      'Shimmer loading skeletons replace spinners on Dashboard, Roadmap, and Tasks',
      'Toast notifications for task completion, milestone progress, and settings saves',
      'Fuzzy search across tasks, milestones, careers, and skills with recent searches',
      'Quick-start checklist guides new users through their first steps',
      'Roadmap milestones adapt based on your assessment results',
    ],
  },
  {
    version: '0.16.0',
    date: 'April 14, 2026',
    title: 'Full-Width Pages & Design Polish',
    tag: 'improvement',
    description: 'App pages now use the full screen, with cleaner visuals and consistent styling throughout.',
    highlights: [
      'All app pages now fill your full screen width, no more narrow columns',
      'Replaced hardcoded colors with CSS variables for a more consistent look',
      'Image optimization: converted assets to WebP for faster loading',
      'Smoother animations and micro-interactions across the app',
      'Fixed broken footer links and missing pages',
    ],
  },
  {
    version: '0.15.0',
    date: 'April 13, 2026',
    title: 'Premium Marketing Pages & Smarter Matching',
    tag: 'feature',
    description: 'Redesigned marketing pages with scroll-driven animations, and more accurate career recommendations.',
    highlights: [
      'Solution page - scroll-driven Rubik\'s cube animation with floating 3D shapes',
      'How It Works - aurora shader background with bold, premium typography',
      'Redesigned auth and legal pages with a polished, consistent look',
      'Career recommendations now use Jaccard + cosine similarity for better accuracy',
      'Salary ranges and growth outlooks added to 80+ career cards',
      'Each career match now shows a personalised "Why this fits you" reason',
      'Content Creator and Social Media Manager career paths added',
      'View Tasks button on roadmap milestone cards for quick access',
    ],
  },
  {
    version: '0.14.0',
    date: 'April 9, 2026',
    title: 'Smart Notifications, Streaks & Widget Controls',
    tag: 'feature',
    description: 'Get notified when it matters, track your streaks over time, and customise your sidebar.',
    highlights: [
      'Smart notifications - get notified when you complete tasks, hit milestones, or reach streak goals',
      'Streak calendar - toggle between Week, Month, and Year views to see your consistency over time',
      'Streak milestones - unlock achievements at 3, 7, 14, 30, 60, and 100 day streaks',
      'Hide or show widgets - hover to dismiss, or manage them all from Settings',
      'Skill progress widget now shows real data from your tasks and milestones',
      'Dashboard and widgets refresh automatically when you navigate back',
      'Pro page - see what\'s coming next for PathWise Pro members',
    ],
  },
  {
    version: '0.13.0',
    date: 'April 9, 2026',
    title: 'Password Recovery & Smarter Results',
    tag: 'feature',
    description: 'Reset your password, get more accurate career matches, and a smoother signup experience.',
    highlights: [
      'Forgot your password? You can now reset it from the sign-in page',
      'Career assessment results are now saved - revisit them anytime without retaking',
      'RIASEC chart now shows full labels and scores so you can understand your interest profile',
      'Personality traits are estimated from your interests even before completing the full assessment',
      'New "Continue Assessment" button to deepen your results when you\'re ready',
      'Streamlined signup - land on a welcoming dashboard and start your assessment from there',
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
      'Discover your career archetype - 30 unique types like "The Analytical Architect"',
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
      'In-app support - submit a ticket without leaving the app',
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
      'Public profile pages - share your career journey at pathwise.fit/u/your-name',
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
      'Sign in with Google or Apple - one tap to get started',
      'Pick up to 3 options per assessment question for more nuanced results',
      '90 career profiles spanning tech, law, trades, arts, science, and more',
      'Task detail panel - view and edit tasks in a slide-over',
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
      'Streak tracking - build a daily habit of career growth',
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
      'New Zen Stone light theme - easier on the eyes',
      'Apple Fitness-inspired achievement badges',
      'Smoother animations and transitions throughout',
    ],
  },
  {
    version: '0.5.0',
    date: 'March 27, 2026',
    title: 'We\'re Live!',
    tag: 'feature',
    description: 'PathWise launched on pathwise.fit with career guidance.',
    highlights: [
      'Take the career assessment and get personalised matches',
      'Personalized roadmap with milestones and daily tasks',
      'Skill Gap Assessment to identify what to learn next',
    ],
  },
];
