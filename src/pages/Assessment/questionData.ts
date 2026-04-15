// Assessment v2 Question Data
// 82 questions across 6 phases
// Source: docs/research/assessment-question-bank.md v2.0

export type QuestionFormat = 'likert3' | 'likert5' | 'forcedChoice' | 'scenario' | 'ranking' | 'chips' | 'select';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  format: QuestionFormat;
  options: QuestionOption[];
  dimension: string;
  phase: number;
  weight: number;
  reverseCoded?: boolean;
  /** If set, this question validates the answer of the referenced question ID for consistency checking. */
  validatesQuestion?: string;
}

export interface Phase {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  questions: Question[];
  tier: 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// Helper data exports
// ---------------------------------------------------------------------------

export const SKILL_OPTIONS_V2: string[] = [
  // Technical/Digital
  'Python',
  'JavaScript/TypeScript',
  'Java/Kotlin',
  'C/C++/C#',
  'SQL/Databases',
  'Cloud/AWS/Azure/GCP',
  'AI/Machine Learning',
  'Data Analysis/Visualization',
  'Web Development (HTML/CSS)',
  'Mobile Development',
  'DevOps/CI-CD',
  'Cybersecurity',
  'Blockchain/Web3',
  // Design/Creative
  'UI/UX Design',
  'Graphic Design',
  'Video Production/Editing',
  'Content Writing/Copywriting',
  'Photography',
  'Audio/Music Production',
  // Business/Strategy
  'Project Management',
  'Product Management',
  'Strategic Planning',
  'Financial Modeling/Accounting',
  'Sales/Business Development',
  'Marketing/Digital Marketing',
  'Supply Chain/Logistics',
  'HR/People Operations',
  // Communication/People
  'Public Speaking/Presenting',
  'Technical Writing/Documentation',
  'Teaching/Training',
  'Counseling/Coaching',
  'Negotiation',
  'Foreign Languages',
  // Analytical/Research
  'Research Methods',
  'Statistical Analysis',
  'Market Research',
  'Policy Analysis',
  'Scientific Lab Skills',
  // Physical/Hands-On
  'Construction/Carpentry',
  'Electrical/Plumbing',
  'Mechanical/Automotive',
  'Welding/Fabrication',
  'Healthcare/Clinical Skills',
  'Cooking/Culinary Arts',
  'Agriculture/Horticulture',
];

export const DOMAIN_OPTIONS_V2: string[] = [
  'Technology/Software Engineering',
  'Data Science/Analytics',
  'Artificial Intelligence/Machine Learning',
  'Cybersecurity',
  'Product Management',
  'Design/UX/UI',
  'Marketing/Advertising',
  'Finance/Banking/Insurance',
  'Accounting/Auditing',
  'Management Consulting',
  'Healthcare/Medicine',
  'Mental Health/Counseling',
  'Education/Teaching',
  'Academic Research/Science',
  'Law/Legal Services',
  'Public Policy/Government',
  'Nonprofit/Social Impact',
  'Environmental Science/Sustainability',
  'Architecture/Urban Planning',
  'Construction/Skilled Trades',
  'Manufacturing/Engineering',
  'Media/Journalism',
  'Film/Entertainment/Gaming',
  'Arts/Music/Performance',
  'Hospitality/Tourism',
  'Retail/E-Commerce',
  'Real Estate',
  'Agriculture/Food Science',
  'Logistics/Supply Chain',
  'Human Resources/People Ops',
  'Sales/Business Development',
  'Entrepreneurship/Startups',
  'Trades/Electrical/Plumbing/HVAC',
  'Military/Public Safety/Emergency Services',
];

export const EXPERIENCE_LEVELS_V2 = [
  { value: 'student', label: 'Student or self-taught beginner' },
  { value: 'junior', label: 'Junior (0-2 years professional experience)' },
  { value: 'mid', label: 'Mid-level (2-6 years)' },
  { value: 'senior', label: 'Senior (6+ years)' },
  { value: 'expert', label: 'Expert or leadership (10+ years)' },
] as const;

// ---------------------------------------------------------------------------
// Shared option sets
// ---------------------------------------------------------------------------

const LIKERT3_OPTIONS: QuestionOption[] = [
  { value: 'like', label: 'Like' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'dislike', label: 'Dislike' },
];

const LIKERT5_OPTIONS: QuestionOption[] = [
  { value: '1', label: 'Strongly Disagree' },
  { value: '2', label: 'Disagree' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Agree' },
  { value: '5', label: 'Strongly Agree' },
];

const APTITUDE_OPTIONS: QuestionOption[] = [
  { value: '1', label: 'Developing' },
  { value: '2', label: 'Functional' },
  { value: '3', label: 'Competent' },
  { value: '4', label: 'Strong' },
  { value: '5', label: 'Exceptional' },
];

// ---------------------------------------------------------------------------
// Phase 1: RIASEC Interests (24 questions)
// ---------------------------------------------------------------------------

const phase1Questions: Question[] = [
  // Realistic (R)
  {
    id: 'ri_r1',
    text: 'How much would you enjoy assembling and testing electronic components or hardware?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_realistic',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_r2',
    text: 'How much would you enjoy building a piece of furniture or structure from raw materials?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_realistic',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_r3',
    text: 'How much would you enjoy troubleshooting and repairing a mechanical system that has broken down?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_realistic',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_r4',
    text: 'How much would you enjoy operating specialized equipment or machinery to complete a project?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_realistic',
    phase: 1,
    weight: 1.0,
  },
  // Investigative (I)
  {
    id: 'ri_i1',
    text: 'How much would you enjoy designing an experiment to test whether a new idea actually works?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_investigative',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_i2',
    text: 'How much would you enjoy analyzing a large dataset to discover patterns no one has noticed before?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_investigative',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_i3',
    text: 'How much would you enjoy reading research papers to understand the latest findings in a field?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_investigative',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_i4',
    text: 'How much would you enjoy debugging a complex system by methodically isolating each variable?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_investigative',
    phase: 1,
    weight: 1.0,
  },
  // Artistic (A)
  {
    id: 'ri_a1',
    text: 'How much would you enjoy designing the visual identity and brand for a new product?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_artistic',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_a2',
    text: 'How much would you enjoy writing original content -- stories, scripts, or persuasive copy?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_artistic',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_a3',
    text: 'How much would you enjoy composing music, editing video, or producing multimedia?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_artistic',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_a4',
    text: 'How much would you enjoy reimagining a process or space to make it more beautiful and functional?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_artistic',
    phase: 1,
    weight: 1.0,
  },
  // Social (S)
  {
    id: 'ri_s1',
    text: 'How much would you enjoy mentoring a newcomer through their first months in a new role?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_social',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_s2',
    text: 'How much would you enjoy facilitating a workshop to help a group solve a shared problem?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_social',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_s3',
    text: 'How much would you enjoy counseling someone who is navigating a difficult life transition?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_social',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_s4',
    text: 'How much would you enjoy organizing a community event that brings people together around a cause?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_social',
    phase: 1,
    weight: 1.0,
  },
  // Enterprising (E)
  {
    id: 'ri_e1',
    text: 'How much would you enjoy pitching an idea to investors or senior leaders to get buy-in?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_enterprising',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_e2',
    text: 'How much would you enjoy negotiating a deal where both sides walk away satisfied?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_enterprising',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_e3',
    text: 'How much would you enjoy leading a team to launch a product under a tight deadline?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_enterprising',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_e4',
    text: 'How much would you enjoy spotting a market gap and developing a strategy to exploit it?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_enterprising',
    phase: 1,
    weight: 1.0,
  },
  // Conventional (C)
  {
    id: 'ri_c1',
    text: 'How much would you enjoy creating a detailed spreadsheet to track and report on a project\'s budget?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_conventional',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_c2',
    text: 'How much would you enjoy developing a standardized process so a task is done the same way every time?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_conventional',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_c3',
    text: 'How much would you enjoy auditing records to ensure everything is accurate and compliant?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_conventional',
    phase: 1,
    weight: 1.0,
  },
  {
    id: 'ri_c4',
    text: 'How much would you enjoy organizing a filing system or database so information is easy to find?',
    format: 'likert3',
    options: LIKERT3_OPTIONS,
    dimension: 'riasec_conventional',
    phase: 1,
    weight: 1.0,
  },
];

// ---------------------------------------------------------------------------
// Phase 2: Big Five Personality (20 questions)
// ---------------------------------------------------------------------------

const phase2Questions: Question[] = [
  // Openness to Experience
  {
    id: 'bf_o1',
    text: 'At work, I tend to seek out projects that require me to learn something completely new.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_openness',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_o2',
    text: 'At work, I tend to prefer sticking with proven methods rather than experimenting with untested approaches.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_openness',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  {
    id: 'bf_o3',
    text: 'At work, I tend to get energized when a problem has no obvious solution and requires creative thinking.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_openness',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_o4',
    text: 'At work, I tend to feel uncomfortable when asked to brainstorm ideas that have no clear direction yet.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_openness',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  // Conscientiousness
  {
    id: 'bf_c1',
    text: 'At work, I tend to plan my tasks in advance and stick to the schedule I set.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_conscientiousness',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_c2',
    text: 'At work, I tend to leave details for later and focus on the big picture first.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_conscientiousness',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  {
    id: 'bf_c3',
    text: 'At work, I tend to double-check my work before submitting it, even under time pressure.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_conscientiousness',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_c4',
    text: 'At work, I tend to start tasks at the last minute because I work better under pressure.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_conscientiousness',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  // Extraversion
  {
    id: 'bf_e1',
    text: 'At work, I tend to speak up first in meetings to share my ideas.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_extraversion',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_e2',
    text: 'At work, I tend to prefer communicating through writing rather than in-person conversations.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_extraversion',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  {
    id: 'bf_e3',
    text: 'At work, I tend to feel recharged after collaborating with a group of colleagues.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_extraversion',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_e4',
    text: 'At work, I tend to need quiet time alone to recover after a full day of social interaction.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_extraversion',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  // Agreeableness
  {
    id: 'bf_a1',
    text: 'At work, I tend to prioritize team harmony even if it means compromising on my preferred approach.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_agreeableness',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_a2',
    text: 'At work, I tend to push back directly when I disagree with a decision, even if it creates tension.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_agreeableness',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  {
    id: 'bf_a3',
    text: 'At work, I tend to go out of my way to help a colleague who is struggling, even when it is not my responsibility.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_agreeableness',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_a4',
    text: 'At work, I tend to focus on my own deliverables before considering how to support others.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_agreeableness',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  // Validation: checks consistency with ri_i1 (enjoy designing experiments)
  {
    id: 'bf_v1',
    text: 'At work, I tend to avoid tasks that involve testing hypotheses or running experiments.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_openness',
    phase: 2,
    weight: 0.5,
    reverseCoded: true,
    validatesQuestion: 'ri_i1',
  },
  // Emotional Stability
  {
    id: 'bf_es1',
    text: 'At work, I tend to stay calm and focused when unexpected problems arise.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_stability',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_es2',
    text: 'At work, I tend to replay mistakes in my head long after they happened.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_stability',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
  {
    id: 'bf_es3',
    text: 'At work, I tend to maintain perspective during high-pressure deadlines without losing sleep.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_stability',
    phase: 2,
    weight: 1.0,
  },
  {
    id: 'bf_es4',
    text: 'At work, I tend to feel anxious when waiting for feedback on something important I submitted.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'bigfive_stability',
    phase: 2,
    weight: 1.0,
    reverseCoded: true,
  },
];

// ---------------------------------------------------------------------------
// Phase 3: Values (12 questions)
// ---------------------------------------------------------------------------

const phase3Questions: Question[] = [
  // Section A: Forced-Choice Value Pairs
  {
    id: 'va_1',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'self_direction', label: 'Having the freedom to choose how and when you do your work' },
      { value: 'security', label: 'Having a stable role with clear expectations and predictable income' },
    ],
    dimension: 'values_autonomy_vs_security',
    phase: 3,
    weight: 1.25,
  },
  {
    id: 'va_2',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'achievement', label: 'Being recognized as a top performer and advancing to leadership' },
      { value: 'benevolence', label: 'Doing work that directly improves other people\'s lives' },
    ],
    dimension: 'values_achievement_vs_benevolence',
    phase: 3,
    weight: 1.25,
  },
  {
    id: 'va_3',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'stimulation', label: 'Working on something new and different every few months' },
      { value: 'conformity', label: 'Working within well-defined guidelines and established best practices' },
    ],
    dimension: 'values_stimulation_vs_conformity',
    phase: 3,
    weight: 1.0,
  },
  {
    id: 'va_4',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'power', label: 'Having significant influence over your team\'s or organization\'s direction' },
      { value: 'universalism', label: 'Contributing to something that makes the world more fair and equitable' },
    ],
    dimension: 'values_power_vs_universalism',
    phase: 3,
    weight: 1.0,
  },
  {
    id: 'va_5',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'hedonism', label: 'Genuinely enjoying your day-to-day tasks and finding them fun' },
      { value: 'tradition', label: 'Upholding the values and traditions of your profession or community' },
    ],
    dimension: 'values_hedonism_vs_tradition',
    phase: 3,
    weight: 1.0,
  },
  {
    id: 'va_6',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'autonomy', label: 'Setting your own goals and deciding your own priorities' },
      { value: 'structure', label: 'Working within a clear framework with defined milestones and check-ins' },
    ],
    dimension: 'values_autonomy_vs_structure',
    phase: 3,
    weight: 1.0,
  },
  {
    id: 'va_7',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'purpose', label: 'Feeling that your work connects to a mission bigger than yourself' },
      { value: 'wealth', label: 'Earning enough to live comfortably and build financial security' },
    ],
    dimension: 'values_purpose_vs_wealth',
    phase: 3,
    weight: 1.25,
  },
  {
    id: 'va_8',
    text: 'Which matters more to you in your career?',
    format: 'forcedChoice',
    options: [
      { value: 'growth', label: 'Continuously learning and being stretched beyond your current abilities' },
      { value: 'stability', label: 'Having a role you have mastered and can perform with confidence and ease' },
    ],
    dimension: 'values_growth_vs_stability',
    phase: 3,
    weight: 1.0,
  },
  // Section B: Work Values Ranking
  {
    id: 'va_rank',
    text: 'Rank these five work values from most important (top) to least important (bottom) in your ideal career.',
    format: 'ranking',
    options: [
      { value: 'autonomy', label: 'Autonomy -- Freedom to decide how you work' },
      { value: 'mastery', label: 'Mastery -- Becoming excellent at your craft' },
      { value: 'purpose', label: 'Purpose -- Contributing to something meaningful' },
      { value: 'security', label: 'Security -- Stable income and predictable career path' },
      { value: 'recognition', label: 'Recognition -- Being known and respected for your work' },
    ],
    dimension: 'values_ranking',
    phase: 3,
    weight: 1.25,
  },
  // Section C: SDT Questions
  {
    id: 'va_sdt1',
    text: 'When thinking about my ideal career, having control over my own decisions and direction matters more than almost anything else.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'values_sdt_autonomy',
    phase: 3,
    weight: 1.0,
  },
  {
    id: 'va_sdt2',
    text: 'When thinking about my ideal career, constantly improving my skills and becoming an expert is what drives me most.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'values_sdt_competence',
    phase: 3,
    weight: 1.0,
  },
  {
    id: 'va_sdt3',
    text: 'When thinking about my ideal career, feeling connected to and valued by the people I work with is essential to my satisfaction.',
    format: 'likert5',
    options: LIKERT5_OPTIONS,
    dimension: 'values_sdt_relatedness',
    phase: 3,
    weight: 1.0,
  },
];

// ---------------------------------------------------------------------------
// Phase 4: Work DNA (10 scenarios)
// ---------------------------------------------------------------------------

const phase4Questions: Question[] = [
  {
    id: 'wd_1',
    text: 'Your team is tasked with producing a major deliverable in two weeks. The project lead asks how you would like to contribute.',
    format: 'scenario',
    options: [
      { value: 'independent', label: 'I will take a defined piece, work on it heads-down, and bring back a polished draft.' },
      { value: 'paired', label: 'I want to pair up with someone so we can iterate together in real time.' },
      { value: 'coordinator', label: 'I will coordinate across the team -- checking in, removing blockers, keeping us aligned.' },
      { value: 'foundation', label: 'Let me do the initial research and synthesis, then the team can build on my findings.' },
    ],
    dimension: 'workdna_collaboration',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_2',
    text: 'Two teammates have opposite ideas about which direction to take. The debate is getting heated and progress has stalled.',
    format: 'scenario',
    options: [
      { value: 'evidence', label: 'I suggest we test both approaches quickly and let the results decide.' },
      { value: 'mediator', label: 'I ask each person to explain the reasoning behind their position to find common ground.' },
      { value: 'integrator', label: 'I propose a compromise that takes the strongest element from each approach.' },
      { value: 'resolver', label: 'I suggest we escalate to the project lead to make a final call so we can move forward.' },
    ],
    dimension: 'workdna_conflict',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_3',
    text: 'You are leading a project and need to choose between two tools. Tool A is well-documented but limited. Tool B is powerful but new and has sparse documentation.',
    format: 'scenario',
    options: [
      { value: 'conservative', label: 'Go with Tool A. Reliability and predictability matter more than cutting-edge features.' },
      { value: 'exploratory', label: 'Go with Tool B. I am willing to invest time learning it for a better long-term outcome.' },
      { value: 'analytical', label: 'Run a two-day spike testing both tools against our actual requirements before committing.' },
      { value: 'collaborative', label: 'Ask the team which they prefer. Buy-in matters more than marginal tool differences.' },
    ],
    dimension: 'workdna_decision',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_4',
    text: 'Your manager asks you to present metrics that technically are not wrong but paint a more favorable picture than reality. A major stakeholder meeting is tomorrow.',
    format: 'scenario',
    options: [
      { value: 'principled_diplomat', label: 'I present the data as requested but add context that shows the full picture.' },
      { value: 'direct_challenger', label: 'I privately tell my manager I am uncomfortable and suggest we present the complete numbers.' },
      { value: 'options_provider', label: 'I prepare both versions and let my manager choose, making clear I prefer the transparent one.' },
      { value: 'chain_of_command', label: 'I present what is asked. My manager has context I do not, and this is their call to make.' },
    ],
    dimension: 'workdna_ethics',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_5',
    text: 'You join a new project that has a vague goal: "Make the customer experience better." There is no roadmap, no metrics, and no clear owner yet.',
    format: 'scenario',
    options: [
      { value: 'ambiguity_seeker', label: 'I love this. I will talk to customers, look at data, and define the problem myself before proposing solutions.' },
      { value: 'clarity_seeker', label: 'I would start by asking leadership to clarify scope and success criteria before I invest time.' },
      { value: 'action_first', label: 'I would identify one small, concrete improvement I can ship quickly to build momentum.' },
      { value: 'context_gatherer', label: 'I would find someone who has been here longer and understands the context to partner with.' },
    ],
    dimension: 'workdna_ambiguity',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_6',
    text: 'You are offered two identical roles at two companies. The only difference is the manager. Manager X gives you weekly check-ins, detailed feedback, and a clear growth plan. Manager Y trusts you completely, checks in monthly, and says "surprise me."',
    format: 'scenario',
    options: [
      { value: 'structured', label: 'I would choose Manager X. Clear feedback loops help me grow faster and stay aligned.' },
      { value: 'autonomous', label: 'I would choose Manager Y. Autonomy and trust are what I need to do my best work.' },
      { value: 'adaptive', label: 'I would ask Manager X if we could reduce check-ins to biweekly once I am ramped up.' },
      { value: 'scaffolded', label: 'I would ask Manager Y to increase check-ins for the first three months, then back off.' },
    ],
    dimension: 'workdna_management',
    phase: 4,
    weight: 1.0,
  },
  // Validation: checks consistency with bf_e3 (recharged after collaborating)
  {
    id: 'wd_v2',
    text: 'You finish a long day of back-to-back group brainstorms and team planning sessions. How do you feel at the end of the day?',
    format: 'scenario',
    options: [
      { value: 'energized', label: 'Energized and excited. Days like this are when I do my best thinking.' },
      { value: 'satisfied', label: 'Satisfied but ready for some quiet time to process everything.' },
      { value: 'drained', label: 'Drained. I need to recharge alone before I can be productive again.' },
      { value: 'mixed', label: 'It depends on the group. The right people energize me, the wrong ones exhaust me.' },
    ],
    dimension: 'workdna_collaboration',
    phase: 4,
    weight: 0.5,
    validatesQuestion: 'bf_e3',
  },
  {
    id: 'wd_7',
    text: 'Your company offers any of these four setups for the next year. Which do you choose?',
    format: 'scenario',
    options: [
      { value: 'remote_async', label: 'Fully remote with a distributed team across time zones. Flexible hours, async communication.' },
      { value: 'office_social', label: 'A vibrant office with open floor plan, daily standups, and spontaneous hallway conversations.' },
      { value: 'hybrid', label: 'Hybrid: two days in the office for collaboration, three days remote for deep work.' },
      { value: 'office_focused', label: 'A private office or quiet space in the building, with scheduled meeting blocks and no interruptions.' },
    ],
    dimension: 'workdna_environment',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_8',
    text: 'You are evaluating two teams to join. Team Alpha ships fast, pivots often, and celebrates "move fast and break things." Team Beta plans carefully, ships quarterly, and has extensive review processes.',
    format: 'scenario',
    options: [
      { value: 'fast_pace', label: 'Team Alpha. Speed and iteration keep me energized. I would rather fix bugs than miss opportunities.' },
      { value: 'steady_pace', label: 'Team Beta. I take pride in quality and want time to do things right.' },
      { value: 'sustainable', label: 'I would want to know which team has less burnout and better retention before choosing.' },
      { value: 'mission_driven', label: 'Either works if the work is meaningful. Pace matters less than what we are building.' },
    ],
    dimension: 'workdna_pace',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_9',
    text: 'A colleague takes credit for an idea you pitched in a previous meeting. Others congratulate them. Your colleague seems genuinely unaware they did this.',
    format: 'scenario',
    options: [
      { value: 'mission_over_ego', label: 'I let it go. The idea getting implemented matters more than who gets credit.' },
      { value: 'direct_private', label: 'I privately mention it to my colleague. They probably did not realize, and I want to clear the air.' },
      { value: 'strategic_visibility', label: 'In the next meeting, I build on the idea and reference my original proposal naturally.' },
      { value: 'escalation', label: 'I mention it to my manager so they are aware, in case it becomes a pattern.' },
    ],
    dimension: 'workdna_eq',
    phase: 4,
    weight: 1.0,
  },
  {
    id: 'wd_10',
    text: 'You have three major deadlines this week, a client just escalated a complaint, and your most important teammate called in sick. You have no option to extend any deadline.',
    format: 'scenario',
    options: [
      { value: 'prioritizer', label: 'I triage ruthlessly: figure out which deadline has the biggest consequence if missed, and focus there first.' },
      { value: 'help_seeker', label: 'I reach out to other teammates or my manager to redistribute the load -- no point being a hero alone.' },
      { value: 'deep_focus', label: 'I block my calendar, silence notifications, and enter deep focus mode until the most urgent item is done.' },
      { value: 'communicator', label: 'I communicate proactively to stakeholders about realistic timelines and negotiate where possible.' },
    ],
    dimension: 'workdna_stress',
    phase: 4,
    weight: 1.0,
  },
];

// ---------------------------------------------------------------------------
// Phase 5: Self-Assessed Aptitudes (8 questions)
// ---------------------------------------------------------------------------

const phase5Questions: Question[] = [
  {
    id: 'sa_1',
    text: 'How strong is your ability to express ideas clearly in writing and speech?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_verbal',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_2',
    text: 'How comfortable are you working with numbers, data, and quantitative analysis?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_quantitative',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_3',
    text: 'How strong is your ability to see patterns, connections, and underlying structures in complex information?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_abstract',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_4',
    text: 'How strong is your ability to think in terms of visual layouts, spatial relationships, and three-dimensional forms?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_spatial',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_5',
    text: 'How strong is your ability to generate original ideas, see unconventional possibilities, and think outside established boundaries?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_creative',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_6',
    text: 'How strong is your ability to read people, understand social dynamics, and navigate interpersonal situations?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_social',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_7',
    text: 'How strong is your ability to break down complex technical problems into logical steps and solve them systematically?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_technical',
    phase: 5,
    weight: 1.0,
  },
  {
    id: 'sa_8',
    text: 'How strong is your ability to work skillfully with your hands, use physical tools, and coordinate fine motor tasks?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_physical',
    phase: 5,
    weight: 1.0,
  },
  // Validation: checks consistency with va_1 (autonomy vs security)
  {
    id: 'sa_v3',
    text: 'How comfortable are you with taking on freelance or contract work where income varies but you set your own schedule?',
    format: 'likert5',
    options: APTITUDE_OPTIONS,
    dimension: 'aptitude_abstract',
    phase: 5,
    weight: 0.5,
    validatesQuestion: 'va_1',
  },
];

// ---------------------------------------------------------------------------
// Phase 6: Life Context (8 questions)
// ---------------------------------------------------------------------------

const phase6Questions: Question[] = [
  {
    id: 'lc_age',
    text: 'What is your age range?',
    format: 'select',
    options: [
      { value: '18_22', label: '18-22' },
      { value: '23_30', label: '23-30' },
      { value: '31_45', label: '31-45' },
      { value: '46_60', label: '46-60' },
      { value: '60_plus', label: '60+' },
    ],
    dimension: 'context_age',
    phase: 6,
    weight: 0.5,
  },
  {
    id: 'lc_stage',
    text: 'Which best describes where you are in your career right now?',
    format: 'select',
    options: [
      { value: 'exploring', label: 'Exploring -- I am still figuring out what I want to do.' },
      { value: 'building', label: 'Building -- I know my direction and I am developing my skills.' },
      { value: 'advancing', label: 'Advancing -- I am established and aiming for the next level.' },
      { value: 'pivoting', label: 'Pivoting -- I am changing fields or industries.' },
      { value: 'returning', label: 'Returning -- I am re-entering the workforce after a break.' },
      { value: 'encore', label: 'Encore -- I am looking for purposeful work in a later career stage.' },
    ],
    dimension: 'context_career_stage',
    phase: 6,
    weight: 1.25,
  },
  {
    id: 'lc_experience',
    text: 'How much professional work experience do you have?',
    format: 'select',
    options: [
      { value: 'student', label: 'Student or self-taught beginner' },
      { value: 'junior', label: 'Junior (0-2 years professional experience)' },
      { value: 'mid', label: 'Mid-level (2-6 years)' },
      { value: 'senior', label: 'Senior (6+ years)' },
      { value: 'expert', label: 'Expert or leadership (10+ years)' },
    ],
    dimension: 'context_experience',
    phase: 6,
    weight: 1.0,
  },
  {
    id: 'lc_decision',
    text: 'When making career decisions, which best describes your situation?',
    format: 'select',
    options: [
      { value: 'self_directed', label: 'I make career decisions primarily on my own.' },
      { value: 'family_input', label: 'Family input and approval matters significantly.' },
      { value: 'practical_first', label: 'Practical needs (bills, dependents, location) come first.' },
      { value: 'balanced', label: 'I balance personal passion with practical realities.' },
    ],
    dimension: 'context_decision',
    phase: 6,
    weight: 0.75,
  },
  {
    id: 'lc_financial',
    text: 'Which best describes your financial situation as it relates to career choices?',
    format: 'select',
    options: [
      { value: 'need_income', label: 'I need income soon -- career moves must have short payoff timelines.' },
      { value: 'some_runway', label: 'I have some savings or support -- I can invest 6-12 months in transition.' },
      { value: 'stable', label: 'I am financially stable -- timeline is flexible.' },
      { value: 'meaning_first', label: 'Financial security is handled -- I am prioritizing meaning over money.' },
    ],
    dimension: 'context_financial',
    phase: 6,
    weight: 0.75,
  },
  {
    id: 'lc_skills',
    text: 'Select the skills you currently have (choose all that apply).',
    format: 'chips',
    options: SKILL_OPTIONS_V2.map((s) => ({ value: s.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label: s })),
    dimension: 'context_skills',
    phase: 6,
    weight: 1.0,
  },
  {
    id: 'lc_domains',
    text: 'Which career domains interest you? (Choose 1-8)',
    format: 'chips',
    options: DOMAIN_OPTIONS_V2.map((d) => ({ value: d.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label: d })),
    dimension: 'context_domains',
    phase: 6,
    weight: 1.0,
  },
  // Validation: checks consistency with wd_1 (collaboration style)
  {
    id: 'lc_v4',
    text: 'When you have completed your best work in the past, how were you typically working?',
    format: 'select',
    options: [
      { value: 'solo', label: 'Independently, with full ownership of the task' },
      { value: 'pair', label: 'Closely with one partner, bouncing ideas back and forth' },
      { value: 'team_lead', label: 'Leading or coordinating a group effort' },
      { value: 'research', label: 'Doing deep research that others then built on' },
    ],
    dimension: 'context_work_style',
    phase: 6,
    weight: 0.5,
    validatesQuestion: 'wd_1',
  },
  {
    id: 'lc_learning',
    text: 'How do you prefer to learn new skills? (Choose up to 3)',
    format: 'chips',
    options: [
      { value: 'video', label: 'Video tutorials and courses (YouTube, Udemy, Coursera)' },
      { value: 'reading', label: 'Books, articles, and written documentation' },
      { value: 'projects', label: 'Hands-on projects and building things' },
      { value: 'courses', label: 'Structured courses with assignments and deadlines' },
      { value: 'mentorship', label: 'One-on-one mentorship or coaching' },
      { value: 'community', label: 'Learning communities, cohorts, and study groups' },
      { value: 'immersion', label: 'Full-time bootcamps or immersive programs' },
    ],
    dimension: 'context_learning',
    phase: 6,
    weight: 0.5,
  },
];

// ---------------------------------------------------------------------------
// Assembled phases
// ---------------------------------------------------------------------------

// Split Phase 6 questions by tier
const phase6Tier1Questions = phase6Questions.filter(q =>
  ['lc_age', 'lc_stage', 'lc_experience', 'lc_skills'].includes(q.id)
);
const phase6Tier2Questions = phase6Questions.filter(q =>
  ['lc_domains', 'lc_learning', 'lc_v4'].includes(q.id)
);
const phase6Tier3Questions = phase6Questions.filter(q =>
  ['lc_decision', 'lc_financial'].includes(q.id)
);

export const ASSESSMENT_PHASES: Phase[] = [
  // ── Tier 1: Core Assessment (40 questions, ~8 min) ──
  {
    id: 1,
    title: 'What Energizes You?',
    subtitle: 'Rate how much you would enjoy each activity.',
    icon: 'Compass',
    color: '#006a62',
    questions: phase1Questions,
    tier: 1,
  },
  {
    id: 3,
    title: 'What Matters to You?',
    subtitle: 'Discover which values drive your career decisions.',
    icon: 'Heart',
    color: '#c9a96e',
    questions: phase3Questions,
    tier: 1,
  },
  {
    id: 6,
    title: 'Your Career Context',
    subtitle: 'Help us tailor recommendations to your situation.',
    icon: 'User',
    color: '#006a62',
    questions: phase6Tier1Questions,
    tier: 1,
  },
  // ── Tier 2: Deeper Insights (22 questions, ~5 min) ──
  {
    id: 2,
    title: 'Your Work Personality',
    subtitle: 'How you naturally tend to operate at work.',
    icon: 'Brain',
    color: '#8b4f2c',
    questions: phase2Questions,
    tier: 2,
  },
  {
    id: 7,
    title: 'More About You',
    subtitle: 'Domains and learning preferences.',
    icon: 'User',
    color: '#006a62',
    questions: phase6Tier2Questions,
    tier: 2,
  },
  // ── Tier 3: Maximum Precision (20 questions, ~4 min) ──
  {
    id: 4,
    title: 'Your Work Style',
    subtitle: 'How you handle real workplace situations.',
    icon: 'Dna',
    color: '#006a62',
    questions: phase4Questions,
    tier: 3,
  },
  {
    id: 5,
    title: 'Your Natural Strengths',
    subtitle: 'Rate your abilities compared to your peers.',
    icon: 'Zap',
    color: '#8b4f2c',
    questions: phase5Questions,
    tier: 3,
  },
  {
    id: 8,
    title: 'Final Context',
    subtitle: 'Decision-making and financial context.',
    icon: 'User',
    color: '#006a62',
    questions: phase6Tier3Questions,
    tier: 3,
  },
];

/** Helper: get only phases for a given tier (and below) */
export function getPhasesForTier(tier: 1 | 2 | 3): Phase[] {
  return ASSESSMENT_PHASES.filter(p => p.tier <= tier);
}

/** Helper: get the last phase index for a given tier */
export function getLastPhaseIndexForTier(tier: 1 | 2 | 3): number {
  const phases = ASSESSMENT_PHASES;
  let lastIndex = -1;
  for (let i = 0; i < phases.length; i++) {
    if (phases[i].tier <= tier) lastIndex = i;
  }
  return lastIndex;
}

/** Count total questions for a given tier range */
export function getQuestionCountForTier(tier: 1 | 2 | 3): number {
  return ASSESSMENT_PHASES
    .filter(p => p.tier === tier)
    .reduce((sum, p) => sum + p.questions.length, 0);
}
