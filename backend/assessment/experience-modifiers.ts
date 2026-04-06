/**
 * Experience Modifiers — Context-Aware Advice Layer
 *
 * Adjusts career brain output based on two dimensions:
 *   1. Experience tier (student → expert)
 *   2. Learning style preferences
 *
 * No external dependencies.
 */

// ── Types ─────────────────────────────────────────────────────────────

export type ExperienceTier = "student" | "junior" | "mid" | "senior" | "expert";
export type ResourceTier = "foundational" | "intermediate" | "advanced";

export interface ExperienceModifier {
  tier: ExperienceTier;
  summaryPrefix: string;
  resourceTier: ResourceTier;
  timelineMultiplier: number;
  focusAreas: string[];
  skipAreas: string[];
  advicePatterns: Record<string, string>;
}

export interface LearningResource {
  style: "video" | "book" | "project" | "bootcamp" | "mentorship";
  name: string;
  url: string;
  duration: string;
  cost: string;
}

// ── Experience Tier Definitions ───────────────────────────────────────

const EXPERIENCE_MODIFIERS: Record<ExperienceTier, ExperienceModifier> = {
  student: {
    tier: "student",
    summaryPrefix:
      "As someone starting your career journey, the most important thing is building a strong foundation.",
    resourceTier: "foundational",
    timelineMultiplier: 1.2,
    focusAreas: [
      "fundamentals",
      "portfolio",
      "networking",
      "internships",
      "soft-skills",
    ],
    skipAreas: [
      "executive leadership",
      "architecture at scale",
      "budget management",
      "vendor negotiation",
    ],
    advicePatterns: {
      gettingStarted:
        "Focus on learning one technology deeply rather than many superficially. Build projects you can show.",
      networking:
        "Attend local meetups, join online communities, and connect with alumni in your target field.",
      portfolio:
        "Create 2–3 polished projects that demonstrate real problem-solving, not just tutorial clones.",
      job_search:
        "Look for internships and entry-level roles that emphasize mentorship and growth.",
      skill_gap:
        "Don't worry about not knowing everything — employers expect to invest in training new grads.",
    },
  },
  junior: {
    tier: "junior",
    summaryPrefix:
      "With some early experience under your belt, you're in a great position to accelerate your growth.",
    resourceTier: "foundational",
    timelineMultiplier: 1.0,
    focusAreas: [
      "hands-on projects",
      "code quality",
      "teamwork",
      "fundamentals deepening",
      "certifications",
    ],
    skipAreas: [
      "executive strategy",
      "organizational design",
      "advanced architecture",
    ],
    advicePatterns: {
      gettingStarted:
        "Take ownership of small features end-to-end. Volunteer for tasks that stretch your skills.",
      networking:
        "Find a mentor within your organization or community who can accelerate your learning.",
      portfolio:
        "Contribute to open-source projects and document what you learn in a blog or portfolio.",
      job_search:
        "Highlight measurable impact from your first roles — even small wins count.",
      skill_gap:
        "Identify the top 2–3 skills your team values most and invest focused time in those.",
    },
  },
  mid: {
    tier: "mid",
    summaryPrefix:
      "At this stage in your career, the key is deciding whether to deepen your expertise or broaden into leadership.",
    resourceTier: "intermediate",
    timelineMultiplier: 0.85,
    focusAreas: [
      "specialization",
      "leadership basics",
      "system design",
      "cross-team collaboration",
      "mentoring others",
    ],
    skipAreas: [
      "learn basics of programming",
      "introductory tutorials",
      "what is version control",
    ],
    advicePatterns: {
      gettingStarted:
        "Define your career direction: individual contributor track or management track.",
      networking:
        "Start speaking at meetups or conferences. Teaching is the fastest way to solidify expertise.",
      portfolio:
        "Shift from quantity to quality — showcase complex systems and their business impact.",
      job_search:
        "Negotiate based on the value you deliver. Quantify your impact in previous roles.",
      skill_gap:
        "Focus on gaps that unlock the next level: system design, architecture, or people management.",
    },
  },
  senior: {
    tier: "senior",
    summaryPrefix:
      "With your deep experience, this guidance focuses on strategic moves and high-leverage opportunities.",
    resourceTier: "advanced",
    timelineMultiplier: 0.7,
    focusAreas: [
      "architecture",
      "leadership",
      "specialization",
      "strategic thinking",
      "influence",
    ],
    skipAreas: [
      "learn basics of X",
      "introductory courses",
      "beginner tutorials",
      "getting started with",
      "fundamentals of programming",
    ],
    advicePatterns: {
      gettingStarted:
        "Identify where your experience creates unique leverage. Pursue roles where depth matters.",
      networking:
        "Build your personal brand. Write, speak, and advise — your network is your greatest asset.",
      portfolio:
        "Document architectural decisions, team outcomes, and systems you've designed.",
      job_search:
        "Target roles by networking and reputation. The best senior roles are rarely posted publicly.",
      skill_gap:
        "At your level, gaps are strategic — focus on the one skill that unlocks a new tier of impact.",
    },
  },
  expert: {
    tier: "expert",
    summaryPrefix:
      "As an established expert, this guidance highlights ways to maximize your influence and chart your own path.",
    resourceTier: "advanced",
    timelineMultiplier: 0.6,
    focusAreas: [
      "thought leadership",
      "industry influence",
      "advisory roles",
      "entrepreneurship",
      "knowledge transfer",
    ],
    skipAreas: [
      "learn basics of X",
      "introductory courses",
      "beginner tutorials",
      "getting started with",
      "fundamentals of programming",
      "junior certifications",
      "entry-level skills",
    ],
    advicePatterns: {
      gettingStarted:
        "Consider whether your next move is within an org, founding something, or advising/consulting.",
      networking:
        "You likely know the right people. Focus on deepening relationships with decision-makers.",
      portfolio:
        "Your track record speaks for itself — focus on narrative and the 'why' behind key decisions.",
      job_search:
        "At your level, opportunities come through reputation. Invest in visibility and thought leadership.",
      skill_gap:
        "Your gaps are likely in adjacent domains — business, communication, or a new technical frontier.",
    },
  },
};

// ── Tier Normalization ────────────────────────────────────────────────

/** Maps `yearsExperience` dropdown values → unified tier */
const YEARS_TO_TIER: Record<string, ExperienceTier> = {
  Student: "student",
  student: "student",
  "0–1 yr": "junior",
  "0-1 yr": "junior",
  "0–1 yrs": "junior",
  "0-1 yrs": "junior",
  "1–3 yrs": "mid",
  "1-3 yrs": "mid",
  "3–5 yrs": "senior",
  "3-5 yrs": "senior",
  "5+ yrs": "expert",
  "5+ yr": "expert",
};

/** Maps `experienceLevel` values → unified tier */
const LEVEL_TO_TIER: Record<string, ExperienceTier> = {
  student: "student",
  entry: "student",
  junior: "junior",
  mid: "mid",
  middle: "mid",
  intermediate: "mid",
  senior: "senior",
  lead: "senior",
  expert: "expert",
  principal: "expert",
  staff: "expert",
};

/**
 * Returns the experience modifier for the given user context.
 * Accepts either `experienceLevel` or `yearsExperience` (or both).
 * When both are provided, `experienceLevel` takes priority since it
 * is the more intentional self-assessment.
 */
export function getExperienceModifier(
  level: string,
  years?: string,
): ExperienceModifier {
  const normalizedLevel = level?.toLowerCase().trim();

  // Try experienceLevel first
  if (normalizedLevel && LEVEL_TO_TIER[normalizedLevel]) {
    return EXPERIENCE_MODIFIERS[LEVEL_TO_TIER[normalizedLevel]];
  }

  // Fall back to yearsExperience
  if (years) {
    const trimmed = years.trim();
    if (YEARS_TO_TIER[trimmed]) {
      return EXPERIENCE_MODIFIERS[YEARS_TO_TIER[trimmed]];
    }
  }

  // Last resort: try the raw level string as a tier key
  if (normalizedLevel && normalizedLevel in EXPERIENCE_MODIFIERS) {
    return EXPERIENCE_MODIFIERS[normalizedLevel as ExperienceTier];
  }

  // Default to junior if nothing matches
  return EXPERIENCE_MODIFIERS.junior;
}

// ── Learning Resources Database ───────────────────────────────────────

export const LEARNING_RESOURCES: Record<string, LearningResource[]> = {
  React: [
    { style: "video", name: "React — The Complete Guide (Udemy)", url: "https://www.udemy.com/course/react-the-complete-guide/", duration: "48 hours", cost: "$15–25" },
    { style: "book", name: "Learning React (O'Reilly)", url: "https://www.oreilly.com/library/view/learning-react-2nd/9781492051718/", duration: "2–3 weeks", cost: "$40" },
    { style: "project", name: "Build a Full-Stack App with React & Firebase", url: "https://react.dev/learn", duration: "1–2 weeks", cost: "Free" },
    { style: "bootcamp", name: "Scrimba — Learn React for Free", url: "https://scrimba.com/learn/learnreact", duration: "10 hours", cost: "Free" },
    { style: "mentorship", name: "MentorCruise — React Mentors", url: "https://mentorcruise.com/filter/react/", duration: "Ongoing", cost: "$100–300/mo" },
  ],
  Python: [
    { style: "video", name: "100 Days of Code — Python (Udemy)", url: "https://www.udemy.com/course/100-days-of-code/", duration: "60 hours", cost: "$15–25" },
    { style: "book", name: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com/", duration: "3–4 weeks", cost: "Free" },
    { style: "project", name: "Python Project-Based Learning (GitHub)", url: "https://github.com/tuvtran/project-based-learning#python", duration: "Varies", cost: "Free" },
    { style: "bootcamp", name: "Codecademy — Learn Python 3", url: "https://www.codecademy.com/learn/learn-python-3", duration: "25 hours", cost: "Free / $20/mo" },
    { style: "mentorship", name: "Codementor — Python Experts", url: "https://www.codementor.io/python-experts", duration: "Ongoing", cost: "$60–150/session" },
  ],
  SQL: [
    { style: "video", name: "The Complete SQL Bootcamp (Udemy)", url: "https://www.udemy.com/course/the-complete-sql-bootcamp/", duration: "9 hours", cost: "$15–25" },
    { style: "book", name: "Learning SQL (O'Reilly)", url: "https://www.oreilly.com/library/view/learning-sql-3rd/9781492057604/", duration: "2–3 weeks", cost: "$45" },
    { style: "project", name: "SQLZoo Interactive Exercises", url: "https://sqlzoo.net/", duration: "1 week", cost: "Free" },
    { style: "bootcamp", name: "DataCamp — Introduction to SQL", url: "https://www.datacamp.com/courses/introduction-to-sql", duration: "4 hours", cost: "Free" },
  ],
  JavaScript: [
    { style: "video", name: "The Complete JavaScript Course (Udemy)", url: "https://www.udemy.com/course/the-complete-javascript-course/", duration: "69 hours", cost: "$15–25" },
    { style: "book", name: "Eloquent JavaScript", url: "https://eloquentjavascript.net/", duration: "4–6 weeks", cost: "Free" },
    { style: "project", name: "JavaScript30 — 30 Day Challenge", url: "https://javascript30.com/", duration: "30 days", cost: "Free" },
    { style: "bootcamp", name: "freeCodeCamp — JavaScript Algorithms", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", duration: "300 hours", cost: "Free" },
    { style: "mentorship", name: "MentorCruise — JavaScript Mentors", url: "https://mentorcruise.com/filter/javascript/", duration: "Ongoing", cost: "$100–300/mo" },
  ],
  TypeScript: [
    { style: "video", name: "Understanding TypeScript (Udemy)", url: "https://www.udemy.com/course/understanding-typescript/", duration: "15 hours", cost: "$15–25" },
    { style: "book", name: "Programming TypeScript (O'Reilly)", url: "https://www.oreilly.com/library/view/programming-typescript/9781492037644/", duration: "2–3 weeks", cost: "$45" },
    { style: "project", name: "Type Challenges", url: "https://github.com/type-challenges/type-challenges", duration: "Ongoing", cost: "Free" },
    { style: "bootcamp", name: "Execute Program — TypeScript", url: "https://www.executeprogram.com/courses/typescript", duration: "20 hours", cost: "$19/mo" },
  ],
  Docker: [
    { style: "video", name: "Docker & Kubernetes: The Practical Guide (Udemy)", url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", duration: "24 hours", cost: "$15–25" },
    { style: "book", name: "Docker Deep Dive (Nigel Poulton)", url: "https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton/dp/1916585256", duration: "1–2 weeks", cost: "$30" },
    { style: "project", name: "Dockerize a Full-Stack App", url: "https://docs.docker.com/get-started/", duration: "1 week", cost: "Free" },
    { style: "bootcamp", name: "KodeKloud — Docker for Beginners", url: "https://kodekloud.com/courses/docker-for-the-absolute-beginner/", duration: "5 hours", cost: "Free" },
  ],
  AWS: [
    { style: "video", name: "Ultimate AWS Certified Solutions Architect (Udemy)", url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", duration: "27 hours", cost: "$15–25" },
    { style: "book", name: "AWS Certified Solutions Architect Study Guide", url: "https://www.wiley.com/en-us/AWS+Certified+Solutions+Architect+Study+Guide-p-9781119713104", duration: "4–6 weeks", cost: "$40" },
    { style: "project", name: "AWS Free Tier — Hands-On Labs", url: "https://aws.amazon.com/free/", duration: "Ongoing", cost: "Free" },
    { style: "bootcamp", name: "A Cloud Guru — AWS Practitioner", url: "https://acloudguru.com/course/aws-certified-cloud-practitioner", duration: "12 hours", cost: "$35/mo" },
    { style: "mentorship", name: "MentorCruise — Cloud / AWS Mentors", url: "https://mentorcruise.com/filter/aws/", duration: "Ongoing", cost: "$100–300/mo" },
  ],
  Git: [
    { style: "video", name: "Git & GitHub — The Practical Guide (Udemy)", url: "https://www.udemy.com/course/git-github-practical-guide/", duration: "11 hours", cost: "$15–25" },
    { style: "book", name: "Pro Git (Scott Chacon)", url: "https://git-scm.com/book/en/v2", duration: "1–2 weeks", cost: "Free" },
    { style: "project", name: "Learn Git Branching (Interactive)", url: "https://learngitbranching.js.org/", duration: "3–5 hours", cost: "Free" },
  ],
  "Machine Learning": [
    { style: "video", name: "Machine Learning Specialization (Coursera / Andrew Ng)", url: "https://www.coursera.org/specializations/machine-learning-introduction", duration: "3 months", cost: "Free / $50/mo" },
    { style: "book", name: "Hands-On Machine Learning (Aurélien Géron)", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/", duration: "6–8 weeks", cost: "$55" },
    { style: "project", name: "Kaggle Competitions — Beginner Friendly", url: "https://www.kaggle.com/competitions?hostSegment=gettingStarted", duration: "Ongoing", cost: "Free" },
    { style: "bootcamp", name: "fast.ai — Practical Deep Learning", url: "https://course.fast.ai/", duration: "7 weeks", cost: "Free" },
    { style: "mentorship", name: "Codementor — ML / AI Experts", url: "https://www.codementor.io/machine-learning-experts", duration: "Ongoing", cost: "$80–200/session" },
  ],
  "Data Analysis": [
    { style: "video", name: "Google Data Analytics Certificate (Coursera)", url: "https://www.coursera.org/professional-certificates/google-data-analytics", duration: "6 months", cost: "$50/mo" },
    { style: "book", name: "Python for Data Analysis (Wes McKinney)", url: "https://wesmckinney.com/book/", duration: "3–4 weeks", cost: "Free" },
    { style: "project", name: "Analyze Datasets on Kaggle", url: "https://www.kaggle.com/datasets", duration: "Ongoing", cost: "Free" },
    { style: "bootcamp", name: "DataCamp — Data Analyst with Python", url: "https://www.datacamp.com/tracks/data-analyst-with-python", duration: "36 hours", cost: "$25/mo" },
  ],
  CSS: [
    { style: "video", name: "Advanced CSS and Sass (Udemy)", url: "https://www.udemy.com/course/advanced-css-and-sass/", duration: "28 hours", cost: "$15–25" },
    { style: "book", name: "CSS: The Definitive Guide (O'Reilly)", url: "https://www.oreilly.com/library/view/css-the-definitive/9781098117603/", duration: "3–4 weeks", cost: "$50" },
    { style: "project", name: "CSS Battle — Interactive Challenges", url: "https://cssbattle.dev/", duration: "Ongoing", cost: "Free" },
    { style: "bootcamp", name: "freeCodeCamp — Responsive Web Design", url: "https://www.freecodecamp.org/learn/responsive-web-design/", duration: "300 hours", cost: "Free" },
  ],
  "Node.js": [
    { style: "video", name: "The Complete Node.js Developer Course (Udemy)", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", duration: "35 hours", cost: "$15–25" },
    { style: "book", name: "Node.js Design Patterns", url: "https://www.nodejsdesignpatterns.com/", duration: "3–4 weeks", cost: "$40" },
    { style: "project", name: "Build a REST API with Express & MongoDB", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", duration: "1–2 weeks", cost: "Free" },
    { style: "bootcamp", name: "The Odin Project — NodeJS Path", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", duration: "4–6 weeks", cost: "Free" },
  ],
  Leadership: [
    { style: "video", name: "Leadership: Practical Skills (Udemy)", url: "https://www.udemy.com/course/leadership-practical-skills/", duration: "3 hours", cost: "$15–25" },
    { style: "book", name: "The Manager's Path (Camille Fournier)", url: "https://www.oreilly.com/library/view/the-managers-path/9781491973882/", duration: "1–2 weeks", cost: "$30" },
    { style: "mentorship", name: "Plato — Engineering Leadership Mentors", url: "https://www.platohq.com/", duration: "Ongoing", cost: "Free / Premium" },
    { style: "project", name: "Lead a Volunteer or Open-Source Project", url: "https://opensource.guide/leadership-and-governance/", duration: "Ongoing", cost: "Free" },
  ],
  Communication: [
    { style: "video", name: "Communication Skills for Professionals (Coursera)", url: "https://www.coursera.org/learn/wharton-communication", duration: "10 hours", cost: "Free / $50" },
    { style: "book", name: "Crucial Conversations", url: "https://www.amazon.com/Crucial-Conversations-Tools-Talking-Stakes/dp/1260474186", duration: "1 week", cost: "$20" },
    { style: "project", name: "Start a Technical Blog", url: "https://dev.to/", duration: "Ongoing", cost: "Free" },
    { style: "mentorship", name: "Toastmasters International", url: "https://www.toastmasters.org/", duration: "Ongoing", cost: "$50/6 months" },
  ],
  "System Design": [
    { style: "video", name: "Grokking the System Design Interview", url: "https://www.designgurus.io/course/grokking-the-system-design-interview", duration: "20 hours", cost: "$79" },
    { style: "book", name: "Designing Data-Intensive Applications", url: "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/", duration: "4–6 weeks", cost: "$50" },
    { style: "project", name: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", duration: "Ongoing", cost: "Free" },
    { style: "video", name: "ByteByteGo — System Design Fundamentals", url: "https://bytebytego.com/", duration: "Ongoing", cost: "$15/mo" },
  ],
  APIs: [
    { style: "video", name: "REST APIs with Flask and Python (Udemy)", url: "https://www.udemy.com/course/rest-api-flask-and-python/", duration: "17 hours", cost: "$15–25" },
    { style: "book", name: "API Design Patterns (Manning)", url: "https://www.manning.com/books/api-design-patterns", duration: "2–3 weeks", cost: "$50" },
    { style: "project", name: "Build & Document a Public API", url: "https://swagger.io/specification/", duration: "1–2 weeks", cost: "Free" },
    { style: "bootcamp", name: "Postman API Fundamentals Student Expert", url: "https://academy.postman.com/", duration: "5 hours", cost: "Free" },
  ],
  Testing: [
    { style: "video", name: "Testing JavaScript (Kent C. Dodds)", url: "https://testingjavascript.com/", duration: "15 hours", cost: "$99" },
    { style: "book", name: "The Art of Unit Testing", url: "https://www.manning.com/books/the-art-of-unit-testing-third-edition", duration: "2–3 weeks", cost: "$45" },
    { style: "project", name: "Add Full Test Coverage to an Open-Source Repo", url: "https://jestjs.io/docs/getting-started", duration: "1–2 weeks", cost: "Free" },
    { style: "bootcamp", name: "Test Automation University", url: "https://testautomationu.applitools.com/", duration: "Varies", cost: "Free" },
  ],
  Kubernetes: [
    { style: "video", name: "Kubernetes for the Absolute Beginners (Udemy)", url: "https://www.udemy.com/course/learn-kubernetes/", duration: "6 hours", cost: "$15–25" },
    { style: "book", name: "Kubernetes in Action", url: "https://www.manning.com/books/kubernetes-in-action-second-edition", duration: "4–6 weeks", cost: "$50" },
    { style: "project", name: "Deploy a Microservices App on Minikube", url: "https://kubernetes.io/docs/tutorials/", duration: "1 week", cost: "Free" },
    { style: "bootcamp", name: "KodeKloud — CKA Certification Course", url: "https://kodekloud.com/courses/certified-kubernetes-administrator-cka/", duration: "20 hours", cost: "$15/mo" },
  ],
  Figma: [
    { style: "video", name: "Figma UI/UX Design Essentials (Udemy)", url: "https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/", duration: "14 hours", cost: "$15–25" },
    { style: "book", name: "Refactoring UI", url: "https://www.refactoringui.com/", duration: "1–2 weeks", cost: "$99" },
    { style: "project", name: "Redesign an Existing App in Figma", url: "https://www.figma.com/community", duration: "1–2 weeks", cost: "Free" },
    { style: "mentorship", name: "ADPList — Design Mentors", url: "https://adplist.org/explore?category=design", duration: "Ongoing", cost: "Free" },
  ],
  "Product Management": [
    { style: "video", name: "Become a Product Manager (Udemy)", url: "https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/", duration: "13 hours", cost: "$15–25" },
    { style: "book", name: "Inspired (Marty Cagan)", url: "https://www.svpg.com/inspired-how-to-create-tech-products-customers-love/", duration: "1–2 weeks", cost: "$25" },
    { style: "project", name: "Write a Product Requirements Doc for a Side Project", url: "https://www.productplan.com/glossary/product-requirements-document/", duration: "1 week", cost: "Free" },
    { style: "mentorship", name: "ADPList — Product Mentors", url: "https://adplist.org/explore?category=product-management", duration: "Ongoing", cost: "Free" },
  ],
  Excel: [
    { style: "video", name: "Microsoft Excel — From Beginner to Advanced (Udemy)", url: "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/", duration: "18 hours", cost: "$15–25" },
    { style: "book", name: "Excel Bible (John Walkenbach)", url: "https://www.wiley.com/en-us/Excel+2019+Bible-p-9781119514787", duration: "3–4 weeks", cost: "$35" },
    { style: "project", name: "Build a Financial Dashboard in Excel", url: "https://support.microsoft.com/en-us/office/create-a-dashboard-in-excel", duration: "1 week", cost: "Free" },
    { style: "bootcamp", name: "Coursera — Excel Skills for Business", url: "https://www.coursera.org/specializations/excel", duration: "6 months", cost: "$50/mo" },
  ],
  "Financial Modeling": [
    { style: "video", name: "Financial Modeling & Valuation Analyst (CFI)", url: "https://corporatefinanceinstitute.com/certifications/financial-modeling-valuation-analyst-fmva-program/", duration: "120 hours", cost: "$497/year" },
    { style: "book", name: "Financial Modeling (Simon Benninga)", url: "https://mitpress.mit.edu/9780262046428/financial-modeling/", duration: "4–6 weeks", cost: "$70" },
    { style: "project", name: "Build a DCF Model for a Public Company", url: "https://corporatefinanceinstitute.com/resources/financial-modeling/dcf-model-training-free-guide/", duration: "2 weeks", cost: "Free" },
    { style: "mentorship", name: "Wall Street Oasis — Career Mentors", url: "https://www.wallstreetoasis.com/", duration: "Ongoing", cost: "Varies" },
  ],
  "Project Management": [
    { style: "video", name: "Google Project Management Certificate (Coursera)", url: "https://www.coursera.org/professional-certificates/google-project-management", duration: "6 months", cost: "$50/mo" },
    { style: "book", name: "The Lean Startup (Eric Ries)", url: "https://theleanstartup.com/", duration: "1 week", cost: "$20" },
    { style: "project", name: "Manage a Real Project Using Jira/Trello", url: "https://www.atlassian.com/software/jira/guides", duration: "Ongoing", cost: "Free" },
    { style: "bootcamp", name: "PMI — CAPM Certification Prep", url: "https://www.pmi.org/certifications/certified-associate-capm", duration: "23 hours", cost: "$225 exam" },
    { style: "mentorship", name: "ADPList — Project Management Mentors", url: "https://adplist.org/explore?category=project-management", duration: "Ongoing", cost: "Free" },
  ],
  "Agile/Scrum": [
    { style: "video", name: "Agile Crash Course (Udemy)", url: "https://www.udemy.com/course/agile-crash-course/", duration: "3 hours", cost: "$15–25" },
    { style: "book", name: "Scrum: The Art of Doing Twice the Work in Half the Time", url: "https://www.scruminc.com/new-scrum-the-book/", duration: "1 week", cost: "$20" },
    { style: "project", name: "Run a Sprint Retrospective for Your Team", url: "https://www.scrum.org/resources/what-is-a-sprint-retrospective", duration: "2 hours", cost: "Free" },
    { style: "bootcamp", name: "Scrum.org — Professional Scrum Master I", url: "https://www.scrum.org/assessments/professional-scrum-master-i-certification", duration: "16 hours", cost: "$150 exam" },
  ],
};

// ── Learning Style Router ─────────────────────────────────────────────

/** Maps user-facing learning style labels to resource style keys */
const STYLE_LABEL_MAP: Record<string, LearningResource["style"]> = {
  "Video courses": "video",
  video: "video",
  "Books": "book",
  book: "book",
  books: "book",
  "Projects": "project",
  project: "project",
  projects: "project",
  "Bootcamps": "bootcamp",
  bootcamp: "bootcamp",
  bootcamps: "bootcamp",
  "Mentorship": "mentorship",
  mentorship: "mentorship",
};

/**
 * Returns learning resources for a skill filtered and ranked by the
 * user's preferred learning styles.
 *
 * - Exact skill match first, then case-insensitive lookup.
 * - Resources matching a preferred style are returned first, in the
 *   order the user ranked their styles.
 * - If fewer than 2 resources match the preferred styles, popular
 *   defaults (video, project) are appended.
 * - Returns an empty array only if the skill has no resources at all.
 */
export function routeResourcesByStyle(
  skillName: string,
  preferredStyles: string[],
): LearningResource[] {
  // Resolve skill resources (exact then case-insensitive)
  let resources = LEARNING_RESOURCES[skillName];
  if (!resources) {
    const lower = skillName.toLowerCase();
    const key = Object.keys(LEARNING_RESOURCES).find(
      (k) => k.toLowerCase() === lower,
    );
    resources = key ? LEARNING_RESOURCES[key] : undefined;
  }

  if (!resources || resources.length === 0) return [];

  // Normalize user styles to internal keys
  const normalizedStyles: LearningResource["style"][] = preferredStyles
    .map((s) => STYLE_LABEL_MAP[s] ?? STYLE_LABEL_MAP[s.toLowerCase()])
    .filter((s): s is LearningResource["style"] => s !== undefined);

  if (normalizedStyles.length === 0) {
    // No recognizable styles — return all resources, video & project first
    const priority: LearningResource["style"][] = ["video", "project"];
    return [
      ...resources.filter((r) => priority.includes(r.style)),
      ...resources.filter((r) => !priority.includes(r.style)),
    ];
  }

  // Partition into matched (ordered by user preference) and unmatched
  const matched: LearningResource[] = [];
  const unmatched: LearningResource[] = [];

  // Index resources by style for fast lookup
  const byStyle = new Map<string, LearningResource[]>();
  for (const r of resources) {
    const list = byStyle.get(r.style) ?? [];
    list.push(r);
    byStyle.set(r.style, list);
  }

  const usedResources = new Set<LearningResource>();

  // Add resources in user's preference order
  for (const style of normalizedStyles) {
    const styleResources = byStyle.get(style) ?? [];
    for (const r of styleResources) {
      matched.push(r);
      usedResources.add(r);
    }
  }

  // Collect unmatched resources
  for (const r of resources) {
    if (!usedResources.has(r)) {
      unmatched.push(r);
    }
  }

  // If we have fewer than 2 matched results, pad with popular defaults
  if (matched.length < 2) {
    const fallbackStyles: LearningResource["style"][] = ["video", "project"];
    for (const fb of fallbackStyles) {
      for (const r of unmatched) {
        if (r.style === fb && !usedResources.has(r)) {
          matched.push(r);
          usedResources.add(r);
        }
      }
    }
  }

  // Return matched first, then remaining
  return [
    ...matched,
    ...unmatched.filter((r) => !usedResources.has(r)),
  ];
}
