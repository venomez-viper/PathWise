/**
 * Gap Pattern Database & Career Stage Modifiers
 *
 * Two modifier layers for the career brain expert system:
 * 1. Keyword-based pattern matcher for free-text "biggest gap" responses
 * 2. Stage × risk-tolerance modifiers that adjust advice framing & priorities
 *
 * No external dependencies.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export interface GapPattern {
  id: string;
  keywords: string[];
  category:
    | "technical_depth"
    | "interview_prep"
    | "networking"
    | "portfolio"
    | "confidence"
    | "job_search"
    | "time_management"
    | "practical_experience"
    | "tool_selection"
    | "soft_skills"
    | "career_direction"
    | "salary_negotiation";
  priorityBoost: string[];
  adviceSnippet: string;
  actionItems: string[];
  resourceSuggestions: string[];
}

export interface StageModifier {
  stage: string;
  risk: string;
  tone: string;
  summaryTemplate: string;
  milestoneAdjustment: "compress" | "standard" | "expand";
  priorityShift: string[];
  deEmphasis: string[];
}

// ── Gap Pattern Database ──────────────────────────────────────────────────

const GAP_PATTERNS: GapPattern[] = [
  // ── Technical Depth ───────────────────────────────────────────────────
  {
    id: "system-design",
    keywords: [
      "system design",
      "architecture",
      "scalability",
      "distributed systems",
      "high level design",
      "low level design",
      "design patterns",
      "microservices",
    ],
    category: "technical_depth",
    priorityBoost: ["System Design", "Cloud Architecture", "Distributed Systems"],
    adviceSnippet:
      "System design fluency comes from studying real-world architectures, not memorizing templates. Pick three products you use daily and reverse-engineer how they handle scale, failure, and data flow. Pair that study with mock design sessions to build verbal fluency.",
    actionItems: [
      "Complete one system design case study per week for 8 weeks",
      "Practice whiteboard design sessions with a peer or recording yourself",
      "Read engineering blogs from companies like Uber, Stripe, and Netflix",
    ],
    resourceSuggestions: [
      "Designing Data-Intensive Applications (Kleppmann)",
      "System Design Interview by Alex Xu",
      "ByteByteGo YouTube channel",
    ],
  },
  {
    id: "dsa-algorithms",
    keywords: [
      "algorithm",
      "algorithms",
      "data structure",
      "data structures",
      "leetcode",
      "coding challenge",
      "coding problems",
      "competitive programming",
      "dsa",
      "big o",
      "complexity",
    ],
    category: "technical_depth",
    priorityBoost: ["Algorithms", "Data Structures", "Problem Solving"],
    adviceSnippet:
      "Algorithm skills improve with structured, spaced practice rather than brute-force grinding. Focus on pattern recognition — most problems map to about 15 core patterns. Start with easy problems in each pattern before attempting mediums.",
    actionItems: [
      "Work through one DSA pattern per week using a structured problem list",
      "Solve at least 3 problems per pattern before moving on",
      "Review and re-solve missed problems after 3 and 7 days",
    ],
    resourceSuggestions: [
      "NeetCode 150 roadmap",
      "Grokking the Coding Interview (patterns)",
      "LeetCode study plans",
    ],
  },
  {
    id: "coding-fundamentals",
    keywords: [
      "programming basics",
      "coding basics",
      "syntax",
      "beginner",
      "learn to code",
      "new to coding",
      "programming fundamentals",
      "don't know how to code",
      "cant code",
      "can't code",
    ],
    category: "technical_depth",
    priorityBoost: ["Programming Fundamentals", "Version Control", "Command Line"],
    adviceSnippet:
      "Building a strong foundation matters more than racing ahead. Focus on one language deeply before branching out — understand variables, control flow, functions, and basic data structures until they feel automatic. Build small projects from day one to reinforce concepts.",
    actionItems: [
      "Pick one language and complete an interactive fundamentals course",
      "Build three small projects (calculator, to-do list, API consumer)",
      "Set up Git and commit your work daily to build the version control habit",
    ],
    resourceSuggestions: [
      "freeCodeCamp",
      "The Odin Project",
      "CS50 by Harvard (free on edX)",
    ],
  },
  {
    id: "cloud-devops",
    keywords: [
      "cloud",
      "aws",
      "azure",
      "gcp",
      "devops",
      "docker",
      "kubernetes",
      "ci/cd",
      "deployment",
      "infrastructure",
      "terraform",
      "containerization",
    ],
    category: "technical_depth",
    priorityBoost: ["Cloud Platforms", "DevOps", "CI/CD", "Containerization"],
    adviceSnippet:
      "Cloud and DevOps skills are best learned by deploying real things. Certifications validate knowledge but hands-on labs cement it. Start with one cloud provider and build a simple deployment pipeline end to end before going broad.",
    actionItems: [
      "Deploy a personal project to a cloud provider using infrastructure as code",
      "Set up a CI/CD pipeline with automated testing for one of your repos",
      "Pursue one foundational cloud certification (AWS CCP or AZ-900)",
    ],
    resourceSuggestions: [
      "AWS Free Tier + hands-on labs",
      "Docker & Kubernetes: The Practical Guide (Udemy)",
      "A Cloud Guru",
    ],
  },

  // ── Interview Preparation ─────────────────────────────────────────────
  {
    id: "interview-general",
    keywords: [
      "interview",
      "interviewing",
      "interviews",
      "interview prep",
      "technical interview",
      "coding interview",
      "phone screen",
      "onsite",
    ],
    category: "interview_prep",
    priorityBoost: ["Interview Skills", "Problem Solving", "Communication"],
    adviceSnippet:
      "Interview performance is a trainable skill separate from day-to-day engineering. The gap between knowing how to code and performing under interview pressure is real — bridge it with structured mock practice and learning to think out loud.",
    actionItems: [
      "Schedule weekly mock interviews with a peer or use Pramp/Interviewing.io",
      "Practice the STAR method for behavioral questions with written stories",
      "Record yourself solving problems to identify communication gaps",
    ],
    resourceSuggestions: [
      "Cracking the Coding Interview",
      "Pramp (free mock interviews)",
      "Interviewing.io",
    ],
  },
  {
    id: "behavioral-interviews",
    keywords: [
      "behavioral",
      "behavioral interview",
      "star method",
      "tell me about a time",
      "soft skill interview",
      "leadership questions",
      "culture fit",
    ],
    category: "interview_prep",
    priorityBoost: ["Communication", "Leadership", "Storytelling"],
    adviceSnippet:
      "Behavioral interviews reward preparation and structure. Build a bank of 8-10 stories from your experience that each demonstrate multiple competencies. Practice telling them concisely — the best answers land in under two minutes.",
    actionItems: [
      "Write out 8-10 STAR-format stories covering common competencies",
      "Map each story to multiple question types (conflict, leadership, failure)",
      "Practice delivering each story in under 2 minutes with a timer",
    ],
    resourceSuggestions: [
      "Amazon Leadership Principles prep guides",
      "The STAR Interview Method (various online guides)",
      "Exponent behavioral interview course",
    ],
  },

  // ── Networking ────────────────────────────────────────────────────────
  {
    id: "networking-general",
    keywords: [
      "network",
      "networking",
      "connections",
      "linkedin",
      "professional network",
      "meet people",
      "industry contacts",
      "referral",
      "referrals",
      "cold outreach",
    ],
    category: "networking",
    priorityBoost: ["Networking", "Communication", "Personal Branding"],
    adviceSnippet:
      "Effective networking is about giving value before asking for it. Start by engaging authentically with people's work — comment on posts, share insights, ask genuine questions. The goal is relationships, not transactions.",
    actionItems: [
      "Engage meaningfully with 3-5 industry posts on LinkedIn daily for a month",
      "Attend one virtual or local meetup/event per month",
      "Send two personalized connection requests per week to people in your target role",
    ],
    resourceSuggestions: [
      "Never Eat Alone by Keith Ferrazzi",
      "Meetup.com for local tech events",
      "Lunchclub for 1:1 professional matching",
    ],
  },
  {
    id: "mentorship",
    keywords: [
      "mentor",
      "mentorship",
      "guidance",
      "career advice",
      "someone to guide",
      "coach",
      "coaching",
      "no one to ask",
    ],
    category: "networking",
    priorityBoost: ["Networking", "Community Engagement", "Communication"],
    adviceSnippet:
      "Finding a mentor often starts with being visible and engaged in a community, not by cold-asking strangers. Contribute to open-source, join Slack/Discord communities in your field, and build relationships organically. Mentorship often emerges naturally from consistent interaction.",
    actionItems: [
      "Join 2-3 active Slack or Discord communities in your target field",
      "Contribute to discussions and help others — visibility attracts mentors",
      "Reach out to one person you admire with a specific, non-generic question",
    ],
    resourceSuggestions: [
      "ADPList (free mentorship platform)",
      "Dev.to community",
      "Relevant Slack/Discord communities in your niche",
    ],
  },

  // ── Portfolio & Projects ──────────────────────────────────────────────
  {
    id: "portfolio-projects",
    keywords: [
      "portfolio",
      "projects",
      "side project",
      "side projects",
      "nothing to show",
      "no projects",
      "what to build",
      "project ideas",
      "github",
      "showcase",
    ],
    category: "portfolio",
    priorityBoost: ["Project Development", "Git/GitHub", "Technical Writing"],
    adviceSnippet:
      "Quality beats quantity in portfolios. Two or three well-documented, deployed projects that solve real problems outshine twenty half-finished repos. Focus on projects that demonstrate the skills your target role demands and write clear READMEs that explain your decisions.",
    actionItems: [
      "Identify 2-3 project ideas that align with your target role's tech stack",
      "Build and deploy at least one end-to-end project with a live demo",
      "Write detailed READMEs covering problem, approach, architecture, and learnings",
    ],
    resourceSuggestions: [
      "GitHub Pages or Vercel for free deployment",
      "Project ideas: build a clone of a tool you use daily",
      "Frontend Mentor for design-to-code challenges",
    ],
  },
  {
    id: "resume-cv",
    keywords: [
      "resume",
      "cv",
      "curriculum vitae",
      "resume writing",
      "ats",
      "applicant tracking",
      "resume format",
      "cover letter",
    ],
    category: "job_search",
    priorityBoost: ["Resume Writing", "Personal Branding", "Communication"],
    adviceSnippet:
      "Your resume has about 7 seconds to make an impression. Lead with impact — quantify achievements, use strong action verbs, and tailor each version to the specific role. Run it through an ATS checker to ensure it parses correctly.",
    actionItems: [
      "Rewrite each bullet point using the formula: Action + Task + Result + Metric",
      "Create a master resume and tailor it for each application",
      "Run your resume through an ATS simulator before submitting",
    ],
    resourceSuggestions: [
      "Jake's Resume template (LaTeX/Overleaf)",
      "Jobscan ATS checker",
      "The Tech Resume Inside Out by Orosz",
    ],
  },

  // ── Confidence & Imposter Syndrome ────────────────────────────────────
  {
    id: "imposter-syndrome",
    keywords: [
      "imposter",
      "impostor",
      "imposter syndrome",
      "not good enough",
      "fraud",
      "don't belong",
      "everyone is better",
      "self doubt",
      "self-doubt",
      "unqualified",
      "not smart enough",
    ],
    category: "confidence",
    priorityBoost: ["Communication", "Community Engagement", "Personal Branding"],
    adviceSnippet:
      "Imposter syndrome affects the majority of professionals, including senior engineers and executives. The antidote is evidence — start tracking your wins, shipping your work publicly, and teaching what you learn. Confidence is built through accumulated proof, not waiting to feel ready.",
    actionItems: [
      "Keep a daily 'wins journal' — even small accomplishments count",
      "Publish one piece of content (blog post, tutorial, thread) per month about what you're learning",
      "Find a peer accountability partner to normalize struggles and celebrate progress",
    ],
    resourceSuggestions: [
      "The Imposter Cure by Dr. Jessamy Hibberd",
      "Blogging on Dev.to or Hashnode",
      "ADPList for mentorship conversations",
    ],
  },
  {
    id: "fear-of-failure",
    keywords: [
      "afraid to fail",
      "fear of failure",
      "scared to try",
      "perfectionism",
      "perfectionist",
      "paralysis",
      "overthinking",
      "analysis paralysis",
      "stuck",
      "overwhelmed",
    ],
    category: "confidence",
    priorityBoost: ["Project Development", "Communication", "Goal Setting"],
    adviceSnippet:
      "Perfectionism often masquerades as high standards but actually blocks progress. Adopt a 'ship it' mindset — release version 0.1, learn from feedback, and iterate. Every expert you admire has a graveyard of imperfect early work that made their later work great.",
    actionItems: [
      "Set a hard deadline to ship something imperfect within 2 weeks",
      "Break your next goal into the smallest possible first step and do it today",
      "Practice 'learning in public' — share your process, not just polished results",
    ],
    resourceSuggestions: [
      "The Practice by Seth Godin",
      "Ship It Journal (building in public communities)",
      "Atomic Habits by James Clear",
    ],
  },

  // ── Job Search ────────────────────────────────────────────────────────
  {
    id: "job-search-strategy",
    keywords: [
      "get hired",
      "getting hired",
      "job search",
      "job hunting",
      "job hunt",
      "applying",
      "applications",
      "no callbacks",
      "no responses",
      "ghosted",
      "job market",
    ],
    category: "job_search",
    priorityBoost: ["Networking", "Resume Writing", "Interview Skills"],
    adviceSnippet:
      "The hidden job market — roles filled through referrals and direct outreach — accounts for a large share of hires. Complement applications with proactive outreach to hiring managers and employees at target companies. Track everything in a spreadsheet to stay organized.",
    actionItems: [
      "Build a target list of 20 companies and identify contacts at each",
      "Send 5 personalized outreach messages per week to people at target companies",
      "Track every application, outreach, and follow-up in a job search spreadsheet",
    ],
    resourceSuggestions: [
      "The 2-Hour Job Search by Steve Dalton",
      "Huntr or Teal for job search tracking",
      "LinkedIn Sales Navigator (free trial) for finding contacts",
    ],
  },
  {
    id: "first-job",
    keywords: [
      "first job",
      "entry level",
      "entry-level",
      "junior",
      "no experience",
      "new grad",
      "graduate",
      "fresh out of",
      "career start",
      "bootcamp grad",
    ],
    category: "job_search",
    priorityBoost: ["Portfolio", "Internships", "Networking", "Git/GitHub"],
    adviceSnippet:
      "Breaking into your first role is the hardest transition. Employers want proof you can deliver — build that proof through projects, contributions, and any real-world experience you can get. Smaller companies and startups are often more willing to take a chance on driven newcomers.",
    actionItems: [
      "Apply to startups and smaller companies, not just big tech",
      "Contribute to 1-2 open-source projects to show real collaboration skills",
      "Consider internships, apprenticeships, or freelance gigs to build initial experience",
    ],
    resourceSuggestions: [
      "GitHub 'good first issue' labels for open-source",
      "AngelList/Wellfound for startup jobs",
      "Hired, Otta, or Triplebyte for curated matching",
    ],
  },

  // ── Time Management ───────────────────────────────────────────────────
  {
    id: "time-management",
    keywords: [
      "time management",
      "no time",
      "too busy",
      "full time job",
      "working full time",
      "balance",
      "work-life",
      "burnout",
      "scheduling",
      "juggling",
      "part time",
      "side hustle",
    ],
    category: "time_management",
    priorityBoost: ["Goal Setting", "Productivity", "Focus"],
    adviceSnippet:
      "When time is scarce, consistency beats intensity. Thirty focused minutes daily outperforms sporadic weekend marathons. Identify your highest-leverage learning activity and protect that time slot ruthlessly — even 20 minutes a day compounds dramatically over months.",
    actionItems: [
      "Block one consistent 30-60 minute slot daily for skill building",
      "Use the Pomodoro technique to maximize focus in short sessions",
      "Audit your week — identify and eliminate one low-value time sink",
    ],
    resourceSuggestions: [
      "Deep Work by Cal Newport",
      "Toggl Track for time auditing",
      "Focusmate for accountability sessions",
    ],
  },

  // ── Practical Experience ──────────────────────────────────────────────
  {
    id: "theory-vs-practice",
    keywords: [
      "practical experience",
      "hands-on",
      "real world",
      "real-world",
      "theory but no practice",
      "know theory",
      "apply knowledge",
      "no real experience",
      "textbook",
      "academic",
    ],
    category: "practical_experience",
    priorityBoost: ["Project Development", "Open Source", "Freelancing"],
    adviceSnippet:
      "The gap between theory and practice closes by building things that serve real users, even if that user is just you. Tutorials teach patterns; projects teach judgment. Pick a problem you actually have and solve it with code — the constraints of real usage force learning no course can replicate.",
    actionItems: [
      "Build a tool that solves a real problem you or someone you know faces",
      "Contribute to an open-source project to experience production-level code",
      "Volunteer your skills for a nonprofit to gain real-world project experience",
    ],
    resourceSuggestions: [
      "Code for America / Code for All (nonprofit tech volunteering)",
      "Up For Grabs (beginner-friendly open-source issues)",
      "Freelance a small project on Upwork to face real client constraints",
    ],
  },
  {
    id: "open-source",
    keywords: [
      "open source",
      "open-source",
      "contribute",
      "contributing",
      "oss",
      "pull request",
      "pr review",
      "collaboration",
    ],
    category: "practical_experience",
    priorityBoost: ["Git/GitHub", "Code Review", "Collaboration", "Open Source"],
    adviceSnippet:
      "Open-source contribution is one of the strongest signals on a resume because it proves you can work with existing codebases, follow contribution guidelines, and collaborate asynchronously. Start with documentation fixes or small bug fixes to learn the workflow before tackling features.",
    actionItems: [
      "Find 2-3 projects you actually use and read their CONTRIBUTING.md",
      "Start with documentation, typo fixes, or 'good first issue' labels",
      "Work up to a small bug fix or feature within your first month",
    ],
    resourceSuggestions: [
      "First Timers Only (firsttimersonly.com)",
      "Good First Issues (goodfirstissues.com)",
      "How to Contribute to Open Source (GitHub guide)",
    ],
  },

  // ── Tool Selection ────────────────────────────────────────────────────
  {
    id: "tool-selection",
    keywords: [
      "what to learn",
      "which language",
      "which framework",
      "what tools",
      "technology choice",
      "tech stack",
      "too many options",
      "which path",
      "what programming language",
      "framework choice",
    ],
    category: "tool_selection",
    priorityBoost: ["Industry Research", "Career Planning", "Technical Breadth"],
    adviceSnippet:
      "Tool choice matters less than depth of understanding. Look at job postings for your target role — the intersection of 'frequently required' and 'interesting to you' is your answer. Master one stack deeply rather than learning five shallowly; transferable principles matter more than specific syntax.",
    actionItems: [
      "Analyze 20 job postings for your target role and tally required technologies",
      "Pick the most commonly listed stack and commit to it for 3-6 months",
      "Build one substantial project with that stack before evaluating alternatives",
    ],
    resourceSuggestions: [
      "Stack Overflow Developer Survey (annual trends)",
      "Roadmap.sh for structured learning paths",
      "ThoughtWorks Technology Radar",
    ],
  },
  {
    id: "staying-current",
    keywords: [
      "keeping up",
      "staying current",
      "technology changes",
      "too fast",
      "new frameworks",
      "outdated skills",
      "falling behind",
      "obsolete",
      "ai replacing",
    ],
    category: "tool_selection",
    priorityBoost: ["Continuous Learning", "Industry Awareness", "Adaptability"],
    adviceSnippet:
      "You don't need to learn every new tool — you need to learn how to learn quickly. Focus on fundamentals that transfer (HTTP, SQL, OS concepts, design patterns) and stay aware of trends without chasing every one. The developers who thrive aren't the ones who know every framework; they're the ones who can pick up any framework fast.",
    actionItems: [
      "Subscribe to 2-3 curated newsletters to stay aware without doomscrolling",
      "Spend 80% of learning time on fundamentals, 20% on new tools",
      "When a new tool gets traction, build one small thing with it to form an opinion",
    ],
    resourceSuggestions: [
      "TLDR Newsletter",
      "Bytes.dev (JavaScript ecosystem)",
      "Hacker News (weekly top stories digest)",
    ],
  },

  // ── Soft Skills ───────────────────────────────────────────────────────
  {
    id: "communication",
    keywords: [
      "communication",
      "presenting",
      "presentation",
      "public speaking",
      "writing",
      "explain technical",
      "articulate",
      "meetings",
      "stakeholder",
    ],
    category: "soft_skills",
    priorityBoost: ["Communication", "Technical Writing", "Presentation Skills"],
    adviceSnippet:
      "Communication is the multiplier on all other skills. The engineer who can explain a complex system clearly to a non-technical stakeholder is more valuable than one who builds it in silence. Practice writing about your work — blog posts, documentation, and design docs all build this muscle.",
    actionItems: [
      "Write a technical blog post or internal doc explaining something you recently built",
      "Practice giving a 5-minute explanation of your current project to a non-technical friend",
      "Volunteer to present at a team meeting or local meetup",
    ],
    resourceSuggestions: [
      "On Writing Well by William Zinsser",
      "Toastmasters International",
      "Technical Writing courses by Google (free)",
    ],
  },
  {
    id: "leadership-management",
    keywords: [
      "leadership",
      "management",
      "managing",
      "team lead",
      "tech lead",
      "people management",
      "delegation",
      "senior role",
      "staff engineer",
      "principal",
    ],
    category: "soft_skills",
    priorityBoost: ["Leadership", "Mentoring", "Strategic Thinking", "Project Management"],
    adviceSnippet:
      "The transition from individual contributor to leader requires deliberately building new muscles: influence without authority, stakeholder management, and multiplying your impact through others. Start practicing these skills now by mentoring junior developers and leading small initiatives.",
    actionItems: [
      "Mentor one junior developer or peer for at least 3 months",
      "Lead a small cross-functional project or initiative at work",
      "Read one book on engineering leadership and apply one concept monthly",
    ],
    resourceSuggestions: [
      "The Manager's Path by Camille Fournier",
      "Staff Engineer by Will Larson",
      "An Elegant Puzzle by Will Larson",
    ],
  },

  // ── Career Direction ──────────────────────────────────────────────────
  {
    id: "career-direction",
    keywords: [
      "don't know what",
      "unsure",
      "confused",
      "direction",
      "what career",
      "what role",
      "what should i",
      "lost",
      "no idea",
      "which field",
      "career path",
      "explore",
    ],
    category: "career_direction",
    priorityBoost: ["Industry Research", "Networking", "Self-Assessment"],
    adviceSnippet:
      "Clarity comes from exposure, not introspection alone. Instead of trying to figure it all out in your head, talk to people in different roles, try small projects in different domains, and pay attention to what energizes you versus what drains you. Direction emerges from experimentation.",
    actionItems: [
      "Conduct 5 informational interviews with people in different roles that interest you",
      "Try a weekend project in 2-3 different domains (web, data, mobile, etc.)",
      "Keep a journal noting which activities give you energy vs. drain you",
    ],
    resourceSuggestions: [
      "Designing Your Life by Burnett & Evans",
      "PathWise career assessment (retake with different focus areas)",
      "80,000 Hours career guide",
    ],
  },
  {
    id: "career-pivot",
    keywords: [
      "pivot",
      "career change",
      "career switch",
      "switching careers",
      "transition",
      "different field",
      "changing industry",
      "starting over",
      "non-traditional",
      "different background",
    ],
    category: "career_direction",
    priorityBoost: ["Transferable Skills", "Networking", "Portfolio", "Storytelling"],
    adviceSnippet:
      "Career pivots are more common and more achievable than most people think. Your previous experience is an asset, not a liability — the combination of your old domain and new skills creates a unique value proposition. Frame your story around the bridge between what you've done and where you're going.",
    actionItems: [
      "Map your transferable skills from your current role to your target role",
      "Build a bridge project that combines your old domain expertise with new skills",
      "Connect with others who have made a similar pivot and learn from their path",
    ],
    resourceSuggestions: [
      "Switchers by Dawn Graham",
      "LinkedIn career changers communities",
      "Relevant bootcamps or structured transition programs",
    ],
  },

  // ── Salary Negotiation ────────────────────────────────────────────────
  {
    id: "salary-negotiation",
    keywords: [
      "salary",
      "negotiation",
      "negotiate",
      "compensation",
      "pay",
      "offer",
      "underpaid",
      "raise",
      "promotion",
      "total comp",
      "equity",
      "stock options",
    ],
    category: "salary_negotiation",
    priorityBoost: ["Negotiation", "Market Research", "Communication"],
    adviceSnippet:
      "Salary negotiation is expected by employers — not negotiating is leaving money on the table. Arm yourself with market data, practice your script, and remember that the conversation is collaborative, not adversarial. The discomfort of a 10-minute conversation can be worth tens of thousands of dollars.",
    actionItems: [
      "Research market rates on Levels.fyi, Glassdoor, and Blind for your target role",
      "Practice your negotiation script out loud with a friend at least 3 times",
      "Always negotiate the first offer — ask for 10-20% more with data to back it up",
    ],
    resourceSuggestions: [
      "Levels.fyi for compensation data",
      "Never Split the Difference by Chris Voss",
      "Candor salary negotiation guide",
    ],
  },

  // ── Additional Patterns ───────────────────────────────────────────────
  {
    id: "remote-work",
    keywords: [
      "remote",
      "remote work",
      "work from home",
      "distributed team",
      "async",
      "asynchronous",
      "remote job",
    ],
    category: "job_search",
    priorityBoost: ["Async Communication", "Self-Management", "Documentation"],
    adviceSnippet:
      "Remote work demands stronger written communication and self-management than office roles. Companies hiring remotely look for evidence that you can work autonomously, communicate proactively, and document your work. Demonstrate these skills in your application process itself.",
    actionItems: [
      "Build a public body of written work (blog, documentation, open-source PRs)",
      "Practice asynchronous communication in open-source or community projects",
      "Target remote-first companies rather than companies that merely allow remote",
    ],
    resourceSuggestions: [
      "Remote OK, We Work Remotely, FlexJobs",
      "Remote: Office Not Required by Basecamp",
      "GitLab Remote Work handbook (free)",
    ],
  },
  {
    id: "freelancing",
    keywords: [
      "freelance",
      "freelancing",
      "consulting",
      "self-employed",
      "independent",
      "contract",
      "contractor",
      "clients",
      "own business",
    ],
    category: "job_search",
    priorityBoost: ["Business Development", "Client Management", "Self-Marketing"],
    adviceSnippet:
      "Freelancing success depends as much on business skills as technical skills. Start by freelancing on the side while employed, build a portfolio of client work, and develop a niche specialty. Generalists compete on price; specialists compete on value.",
    actionItems: [
      "Complete 2-3 small freelance projects to build client testimonials",
      "Define a specific niche where your skills solve an expensive problem",
      "Set up a simple portfolio site and professional profiles on freelance platforms",
    ],
    resourceSuggestions: [
      "The Freelancer's Bible by Sara Horowitz",
      "Toptal, Upwork, or Freelancer.com for initial clients",
      "Double Your Freelancing by Brennan Dunn",
    ],
  },
  {
    id: "data-ml",
    keywords: [
      "data science",
      "machine learning",
      "ml",
      "ai",
      "artificial intelligence",
      "deep learning",
      "statistics",
      "data analysis",
      "data engineering",
      "pandas",
      "tensorflow",
      "pytorch",
    ],
    category: "technical_depth",
    priorityBoost: ["Data Science", "Machine Learning", "Statistics", "Python"],
    adviceSnippet:
      "Data science and ML require a solid foundation in statistics and programming before diving into models. Many learners skip the math and jump to libraries, which creates a fragile understanding. Build intuition for the fundamentals, then apply them through end-to-end projects with real datasets.",
    actionItems: [
      "Complete a statistics fundamentals course before advanced ML",
      "Build 2-3 end-to-end ML projects using real-world datasets from Kaggle",
      "Learn to communicate results — a great model with poor presentation has zero impact",
    ],
    resourceSuggestions: [
      "Fast.ai (practical deep learning)",
      "Andrew Ng's Machine Learning Specialization",
      "Kaggle competitions and datasets",
    ],
  },
  {
    id: "testing-quality",
    keywords: [
      "testing",
      "tests",
      "unit test",
      "test driven",
      "tdd",
      "quality",
      "code quality",
      "code review",
      "best practices",
      "clean code",
    ],
    category: "technical_depth",
    priorityBoost: ["Testing", "Code Quality", "Software Engineering Practices"],
    adviceSnippet:
      "Writing tests and maintaining code quality are skills that separate professional developers from hobbyists. Start by writing tests for your own projects — it feels slow at first but dramatically speeds up development over time by catching regressions and enabling confident refactoring.",
    actionItems: [
      "Add tests to an existing project — start with the most critical path",
      "Practice TDD on a small feature: write the test first, then make it pass",
      "Set up a linter and formatter in your projects and fix all warnings",
    ],
    resourceSuggestions: [
      "Test Driven Development by Kent Beck",
      "Clean Code by Robert C. Martin",
      "JavaScript Testing Best Practices (GitHub repo)",
    ],
  },
  {
    id: "focus-discipline",
    keywords: [
      "focus",
      "discipline",
      "distracted",
      "motivation",
      "procrastination",
      "procrastinate",
      "consistency",
      "can't focus",
      "scattered",
      "shiny object",
    ],
    category: "time_management",
    priorityBoost: ["Goal Setting", "Productivity", "Focus"],
    adviceSnippet:
      "Discipline, not motivation, drives long-term skill development. Build systems that make consistency easy — same time, same place, same trigger. Start so small that skipping feels silly. A 10-minute daily habit will take you further in a year than any burst of weekend motivation.",
    actionItems: [
      "Establish a daily learning ritual at a fixed time, even if only 15 minutes",
      "Use a habit tracker to maintain a visible streak",
      "Eliminate decision fatigue by planning your next learning session in advance",
    ],
    resourceSuggestions: [
      "Atomic Habits by James Clear",
      "Forest app for focus sessions",
      "Streaks or Habitica for habit tracking",
    ],
  },
];

// ── Gap Pattern Matching ──────────────────────────────────────────────────

/**
 * Finds the best-matching gap pattern for a user's free-text "biggest gap" response.
 * Uses keyword scoring: each matched keyword increments the score for its pattern.
 * Returns the highest-scoring pattern, or null if nothing matches.
 */
export function matchGapPattern(biggestGap: string): GapPattern | null {
  if (!biggestGap || biggestGap.trim().length === 0) return null;

  const normalized = biggestGap.toLowerCase().trim();

  let bestPattern: GapPattern | null = null;
  let bestScore = 0;

  for (const pattern of GAP_PATTERNS) {
    let score = 0;

    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        // Longer keyword matches are worth more — they're more specific
        score += keyword.split(" ").length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  return bestPattern;
}

// ── Career Stage Modifiers ────────────────────────────────────────────────

const STAGE_MODIFIERS: StageModifier[] = [
  // ── Exploring ─────────────────────────────────────────────────────────
  {
    stage: "exploring",
    risk: "high",
    tone: "Cast a wide net. Try multiple paths fast. Don't overthink — experiment boldly and let the results guide you.",
    summaryTemplate:
      "You're in exploration mode with an appetite for bold moves — perfect. Your strongest signal points toward {role}, where your {topSkill} skills give you a head start. Don't worry about perfection right now; focus on closing {gaps} through rapid experimentation and shipping real work.",
    milestoneAdjustment: "compress",
    priorityShift: ["Breadth of Exposure", "Rapid Prototyping", "Networking"],
    deEmphasis: ["Deep Specialization", "Certifications"],
  },
  {
    stage: "exploring",
    risk: "moderate",
    tone: "Explore with purpose. Try a few promising directions, but give each one enough time to provide real signal before switching.",
    summaryTemplate:
      "You're exploring your options with a balanced approach — smart. The data suggests {role} as a strong match, with {topSkill} as your biggest asset. Focus on closing {gaps} through structured experimentation: give each direction at least 4-6 weeks before evaluating.",
    milestoneAdjustment: "standard",
    priorityShift: ["Structured Exploration", "Networking", "Foundational Skills"],
    deEmphasis: ["Advanced Certifications", "Leadership"],
  },
  {
    stage: "exploring",
    risk: "low",
    tone: "Research thoroughly before committing. Use informational interviews, courses, and small projects to validate your direction safely.",
    summaryTemplate:
      "You prefer to look before you leap — that's a valid strategy when exploring. {role} stands out as a strong fit given your {topSkill} background. Address {gaps} incrementally through low-commitment learning (courses, side projects) before making bigger moves.",
    milestoneAdjustment: "expand",
    priorityShift: ["Research", "Foundational Skills", "Low-Risk Experimentation"],
    deEmphasis: ["Job Switching", "Rapid Prototyping"],
  },

  // ── Building ──────────────────────────────────────────────────────────
  {
    stage: "building",
    risk: "high",
    tone: "Move fast and build aggressively. Take on stretch projects, ship publicly, and don't wait until you're 'ready' — readiness comes from doing.",
    summaryTemplate:
      "You're in build mode and willing to push hard — that's how fast growth happens. Lean into {role} by leading with {topSkill} and attacking {gaps} head-on through ambitious projects. Ship early, ship often, and let real-world feedback accelerate your learning.",
    milestoneAdjustment: "compress",
    priorityShift: ["Project Shipping", "Public Portfolio", "Stretch Assignments"],
    deEmphasis: ["Theoretical Study", "Risk Mitigation"],
  },
  {
    stage: "building",
    risk: "moderate",
    tone: "Build consistently and strategically. Balance learning with doing, and invest in skills that compound over time.",
    summaryTemplate:
      "You're actively building your career foundation — the most impactful phase. {role} aligns well with your {topSkill} strength. Close {gaps} through a steady cadence of learning and building: one course paired with one project at a time.",
    milestoneAdjustment: "standard",
    priorityShift: ["Core Skills", "Portfolio Development", "Consistent Learning"],
    deEmphasis: ["Broad Exploration", "Advanced Leadership"],
  },
  {
    stage: "building",
    risk: "low",
    tone: "Build a rock-solid foundation. Master fundamentals deeply, follow proven paths, and invest in credentials that open doors.",
    summaryTemplate:
      "You're building carefully and thoroughly — a strong approach for long-term success. {role} is a solid target with your {topSkill} foundation. Address {gaps} through structured programs and credentialed learning paths that give you both the skill and the proof.",
    milestoneAdjustment: "expand",
    priorityShift: ["Fundamentals Mastery", "Certifications", "Structured Learning"],
    deEmphasis: ["Speculative Projects", "Rapid Experimentation"],
  },

  // ── Advancing ─────────────────────────────────────────────────────────
  {
    stage: "advancing",
    risk: "high",
    tone: "Push for the next level aggressively. Pursue leadership roles, high-visibility projects, and opportunities that scare you a little.",
    summaryTemplate:
      "You're ready to level up and willing to take bold swings. Target senior {role} positions by leveraging your {topSkill} expertise. Close {gaps} by volunteering for the hardest problems, mentoring others, and building your reputation as a go-to expert.",
    milestoneAdjustment: "compress",
    priorityShift: ["Leadership", "Visibility", "Strategic Networking", "Speaking"],
    deEmphasis: ["Foundational Skills", "Entry-Level Certifications"],
  },
  {
    stage: "advancing",
    risk: "moderate",
    tone: "Deepen your specialization. Target senior-level credentials. Build your professional brand while maintaining your current stability.",
    summaryTemplate:
      "You're advancing your career with a strategic mindset. Deepen your expertise toward senior {role} by doubling down on {topSkill}. Address {gaps} through targeted upskilling and increased visibility — conference talks, blog posts, or internal tech talks.",
    milestoneAdjustment: "standard",
    priorityShift: ["Specialization", "Personal Branding", "Senior Certifications"],
    deEmphasis: ["Breadth of Exposure", "Foundational Courses"],
  },
  {
    stage: "advancing",
    risk: "low",
    tone: "Advance methodically. Secure the next rung through proven credentials, strong internal relationships, and documented impact.",
    summaryTemplate:
      "You're climbing the ladder with deliberate precision. {role} at the senior level is achievable by deepening {topSkill} and addressing {gaps} through institutional channels — internal training, sponsored certifications, and high-impact projects within your current organization.",
    milestoneAdjustment: "expand",
    priorityShift: ["Credentials", "Internal Visibility", "Documented Impact"],
    deEmphasis: ["Broad Exploration", "Job Switching"],
  },

  // ── Pivoting ──────────────────────────────────────────────────────────
  {
    stage: "pivoting",
    risk: "high",
    tone: "Make the leap. Your transferable skills are more valuable than you think. Commit fully, immerse yourself, and accelerate the transition.",
    summaryTemplate:
      "You're ready to make a bold career pivot — respect. {role} is within reach, especially with your {topSkill} transferable strength. Close {gaps} rapidly through immersive learning (bootcamps, intensive projects) and lean heavily on networking to break into the new field.",
    milestoneAdjustment: "compress",
    priorityShift: ["Immersive Learning", "Networking", "Bridge Projects"],
    deEmphasis: ["Current Role Optimization", "Long-Term Credentials"],
  },
  {
    stage: "pivoting",
    risk: "moderate",
    tone: "Bridge the gap strategically. Build skills in your new direction while leveraging your existing expertise. Transition gradually.",
    summaryTemplate:
      "You're pivoting with a thoughtful plan. {role} makes sense as a target given your {topSkill} background. Close {gaps} by building bridge projects that connect your current experience with your new direction — this lets you transition without starting from zero.",
    milestoneAdjustment: "standard",
    priorityShift: ["Bridge Projects", "Transferable Skills Framing", "Targeted Learning"],
    deEmphasis: ["Current Role Deepening", "Broad Exploration"],
  },
  {
    stage: "pivoting",
    risk: "low",
    tone: "Leverage your existing expertise. Build bridges from what you know. Minimize gaps methodically and transition when the ground is solid.",
    summaryTemplate:
      "You're pivoting carefully — a wise approach that minimizes risk. {role} connects well to your {topSkill} experience. Address {gaps} through evening/weekend learning, side projects, and informational interviews. Build your safety net first, then make the transition once you have proof of viability.",
    milestoneAdjustment: "expand",
    priorityShift: ["Gradual Transition", "Safety Net Building", "Side Projects"],
    deEmphasis: ["Full Immersion", "Risky Moves"],
  },
];

/**
 * Returns the stage modifier for a given career stage and risk tolerance combination.
 */
export function getStageModifier(stage: string, risk: string): StageModifier {
  const modifier = STAGE_MODIFIERS.find(
    (m) => m.stage === stage.toLowerCase() && m.risk === risk.toLowerCase()
  );

  if (!modifier) {
    // Fallback to building + moderate as a sensible default
    return STAGE_MODIFIERS.find(
      (m) => m.stage === "building" && m.risk === "moderate"
    )!;
  }

  return modifier;
}
