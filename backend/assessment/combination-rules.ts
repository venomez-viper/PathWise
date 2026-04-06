/**
 * Combination Rules Engine — Modifier Layers for Career Brain
 *
 * Detects high-signal answer combinations and returns tailored
 * advice overlays that produce smarter, more personalized outputs.
 */

// ── Types ─────────────────────────────────────────────────────────────────

export interface RuleCondition {
  experienceLevel?: string[];
  careerStage?: string[];
  workStyle?: string[];
  riskTolerance?: string[];
  trajectory?: string[];
  values?: string[];
  hasSkillAbove?: { skill: string; level: string }[];
  hasSkillBelow?: { skill: string; level: string }[];
  domainIncludes?: string[];
  learningStyleIncludes?: string[];
}

export interface MilestoneInsert {
  title: string;
  description: string;
  tasks: string[];
  estimatedWeeks: number;
  position: "start" | "end" | number;
}

export interface CombinationRule {
  id: string;
  name: string;
  conditions: RuleCondition;
  weight: number;
  summaryOverride?: string;
  additionalAdvice: string;
  skillBoosts: string[];
  skillSuppress: string[];
  milestoneInsert?: MilestoneInsert;
}

export interface RuleContext {
  experienceLevel: string;
  careerStage: string;
  workStyle: string;
  riskTolerance: string;
  trajectory: string;
  values: string[];
  technicalSkills: Record<string, string>;
  softSkills: Record<string, string>;
  domains: string[];
  learningStyle: string[];
}

// ── Skill Level Hierarchy ────────────────────────────────────────────────

const SKILL_LEVELS: Record<string, number> = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

function skillLevelNum(level: string): number {
  return SKILL_LEVELS[level.toLowerCase()] ?? 0;
}

// ── Rule Condition Evaluator ─────────────────────────────────────────────

function matchesCondition(ctx: RuleContext, cond: RuleCondition): boolean {
  if (cond.experienceLevel && !cond.experienceLevel.includes(ctx.experienceLevel)) return false;
  if (cond.careerStage && !cond.careerStage.includes(ctx.careerStage)) return false;
  if (cond.workStyle && !cond.workStyle.includes(ctx.workStyle)) return false;
  if (cond.riskTolerance && !cond.riskTolerance.includes(ctx.riskTolerance)) return false;
  if (cond.trajectory && !cond.trajectory.includes(ctx.trajectory)) return false;

  if (cond.values) {
    const hasAnyValue = cond.values.some((v) => ctx.values.includes(v));
    if (!hasAnyValue) return false;
  }

  if (cond.domainIncludes) {
    const hasAnyDomain = cond.domainIncludes.some((d) =>
      ctx.domains.some((ud) => ud.toLowerCase().includes(d.toLowerCase()))
    );
    if (!hasAnyDomain) return false;
  }

  if (cond.learningStyleIncludes) {
    const hasAnyStyle = cond.learningStyleIncludes.some((ls) =>
      ctx.learningStyle.some((ul) => ul.toLowerCase().includes(ls.toLowerCase()))
    );
    if (!hasAnyStyle) return false;
  }

  const allSkills = { ...ctx.technicalSkills, ...ctx.softSkills };

  if (cond.hasSkillAbove) {
    for (const req of cond.hasSkillAbove) {
      const userLevel = allSkills[req.skill];
      if (!userLevel || skillLevelNum(userLevel) < skillLevelNum(req.level)) return false;
    }
  }

  if (cond.hasSkillBelow) {
    for (const req of cond.hasSkillBelow) {
      const userLevel = allSkills[req.skill] ?? "none";
      if (skillLevelNum(userLevel) > skillLevelNum(req.level)) return false;
    }
  }

  return true;
}

// ── Combination Rules ────────────────────────────────────────────────────

export const COMBINATION_RULES: CombinationRule[] = [
  // 1. Career Changer
  {
    id: "career-changer",
    name: "Career Changer",
    conditions: {
      experienceLevel: ["senior", "expert"],
      careerStage: ["pivoting"],
    },
    weight: 9,
    summaryOverride:
      "Your extensive professional experience is a major asset as you pivot. The key is reframing — not starting over.",
    additionalAdvice:
      "Focus on identifying transferable skills from your current career. Leadership, communication, project management, and domain expertise translate across industries. Frame your pivot as an evolution, not a restart. Seek roles that specifically value cross-functional experience and diverse backgrounds.",
    skillBoosts: ["Communication", "Leadership", "Project Management", "Strategic Thinking", "Stakeholder Management"],
    skillSuppress: ["Entry-level certifications", "Basic tutorials"],
    milestoneInsert: {
      title: "Leverage Transferable Skills",
      description: "Map your existing expertise onto your target field and build a compelling narrative.",
      tasks: [
        "Audit your current skills and categorize as directly transferable, partially transferable, or new-to-learn",
        "Rewrite your resume with target-field language while preserving your experience depth",
        "Identify 3 professionals who made a similar pivot and request informational interviews",
        "Create a portfolio piece that bridges your old and new domains",
      ],
      estimatedWeeks: 4,
      position: "start",
    },
  },

  // 2. Ambitious Student
  {
    id: "ambitious-student",
    name: "Ambitious Student",
    conditions: {
      experienceLevel: ["student"],
      riskTolerance: ["high"],
      trajectory: ["entrepreneur"],
    },
    weight: 8,
    additionalAdvice:
      "Your entrepreneurial drive at this stage is powerful. Ship early and often — a launched MVP beats a perfect plan. Focus on building real products over accumulating certifications. Seek startup incubators, pitch competitions, and co-founder matching events. Your lack of corporate habits is an advantage.",
    skillBoosts: ["Product Development", "MVP Building", "User Research", "Growth Hacking", "Pitching", "No-Code Tools"],
    skillSuppress: ["Corporate governance", "Enterprise architecture"],
    milestoneInsert: {
      title: "Build & Ship Fast",
      description: "Launch your first product or meaningful side project to build real-world credibility.",
      tasks: [
        "Identify a problem you personally experience and validate it with 10 potential users",
        "Build an MVP in under 2 weeks using the simplest possible tech stack",
        "Launch on Product Hunt, Hacker News, or a relevant community",
        "Collect user feedback and iterate — document your learnings publicly",
      ],
      estimatedWeeks: 6,
      position: "start",
    },
  },

  // 3. Risk-Averse Pivoter
  {
    id: "risk-averse-pivoter",
    name: "Risk-Averse Pivoter",
    conditions: {
      careerStage: ["pivoting"],
      riskTolerance: ["low"],
    },
    weight: 8,
    additionalAdvice:
      "A cautious pivot is a smart pivot. Build your new skill set alongside your current role before making the jump. Industry-recognized certifications provide both credibility and confidence. Target companies known for hiring career changers and investing in training programs.",
    skillBoosts: ["Certifications", "Structured Learning", "Risk Management", "Financial Planning"],
    skillSuppress: ["Speculative ventures", "Startup culture", "Freelancing"],
    milestoneInsert: {
      title: "Bridge Skills Safely",
      description: "Build verifiable credentials in your target field while maintaining income stability.",
      tasks: [
        "Identify the top 3 certifications valued in your target field",
        "Complete at least one certification while still employed",
        "Take on cross-functional projects at your current job that build relevant skills",
        "Build a 6-month financial runway before making any job switch",
      ],
      estimatedWeeks: 12,
      position: "start",
    },
  },

  // 4. Technical Leader
  {
    id: "technical-leader",
    name: "Technical Leader",
    conditions: {
      experienceLevel: ["mid", "senior"],
      trajectory: ["manager"],
      careerStage: ["advancing"],
    },
    weight: 9,
    additionalAdvice:
      "The jump from individual contributor to technical leader requires deliberate cultivation of people skills alongside system-level thinking. Study architecture patterns, learn to run effective 1:1s, and practice translating technical decisions into business impact. Seek a mentor who has successfully navigated this transition.",
    skillBoosts: ["System Design", "Architecture", "Team Leadership", "1:1 Management", "Technical Writing", "Strategic Planning"],
    skillSuppress: ["Entry-level coding", "Tutorial-driven learning"],
    milestoneInsert: {
      title: "Leadership Development",
      description: "Build the core competencies needed to lead engineering teams effectively.",
      tasks: [
        "Lead a cross-team technical initiative or RFC process",
        "Mentor at least 2 junior developers for 3+ months",
        "Read 'An Elegant Puzzle' or 'The Manager\'s Path' and apply one framework",
        "Present a system design to leadership and incorporate their feedback",
        "Practice giving constructive code review feedback that teaches, not just corrects",
      ],
      estimatedWeeks: 10,
      position: 2,
    },
  },

  // 5. Solo Builder
  {
    id: "solo-builder",
    name: "Solo Builder",
    conditions: {
      workStyle: ["solo"],
      values: ["mastery"],
      trajectory: ["specialist"],
    },
    weight: 7,
    additionalAdvice:
      "Your drive for deep mastery through independent work is a rare and valuable trait. Channel it into open source contributions, deep technical blog posts, and niche expertise. The most impactful solo builders become known authorities in specific domains. Build in public to compound your reputation.",
    skillBoosts: ["Open Source", "Deep Technical Writing", "System Design", "Performance Optimization", "Debugging"],
    skillSuppress: ["Networking events", "Team facilitation", "Public speaking"],
  },

  // 6. People Person Pivoting to Tech
  {
    id: "people-person-tech-pivot",
    name: "People Person Pivoting to Tech",
    conditions: {
      careerStage: ["pivoting"],
      workStyle: ["collaborative"],
      values: ["purpose"],
    },
    weight: 8,
    additionalAdvice:
      "Your collaborative nature and sense of purpose are superpowers in tech. Roles like Developer Relations, Product Management, UX Research, and Technical Program Management deeply value people skills. Consider bootcamps with strong pair-programming cultures. Seek mentorship from someone who made a similar transition.",
    skillBoosts: ["Pair Programming", "UX Research", "Product Management", "Developer Relations", "Technical Communication"],
    skillSuppress: ["Low-level systems programming", "Solo algorithmic work"],
    milestoneInsert: {
      title: "Collaborative Tech Immersion",
      description: "Leverage your people skills while building technical foundations through social learning.",
      tasks: [
        "Join a coding bootcamp or cohort-based course with strong community",
        "Contribute to an open-source project through documentation or issue triage",
        "Attend 2 meetups per month in your target tech area",
        "Find a coding buddy or join a study group for accountability",
      ],
      estimatedWeeks: 8,
      position: "start",
    },
  },

  // 7. Data-to-ML Pipeline
  {
    id: "data-to-ml-pipeline",
    name: "Data-to-ML Pipeline",
    conditions: {
      hasSkillAbove: [
        { skill: "Python", level: "intermediate" },
        { skill: "SQL", level: "intermediate" },
      ],
      domainIncludes: ["Data", "Analytics"],
      careerStage: ["advancing"],
    },
    weight: 8,
    additionalAdvice:
      "With solid Python and SQL foundations plus data domain experience, you're well-positioned to move into ML engineering. Focus on the full pipeline: data preprocessing, model training, evaluation, and deployment. MLOps skills are in extremely high demand and differentiate ML engineers from data scientists.",
    skillBoosts: ["Machine Learning", "Statistics", "MLOps", "Model Deployment", "TensorFlow", "PyTorch", "Feature Engineering"],
    skillSuppress: ["Basic SQL", "Spreadsheet analysis", "Basic Python"],
    milestoneInsert: {
      title: "ML Engineering Foundations",
      description: "Bridge your data skills into production machine learning.",
      tasks: [
        "Complete a structured ML course (fast.ai or Andrew Ng's specialization)",
        "Build an end-to-end ML project: data → model → deployed API",
        "Learn Docker and basic MLOps (MLflow, Weights & Biases)",
        "Contribute to a Kaggle competition to benchmark your skills",
      ],
      estimatedWeeks: 10,
      position: "end",
    },
  },

  // 8. Design-to-Product
  {
    id: "design-to-product",
    name: "Design-to-Product",
    conditions: {
      domainIncludes: ["Design", "UX"],
      trajectory: ["manager", "generalist"],
    },
    weight: 7,
    additionalAdvice:
      "Designers who move into product management bring an invaluable user-centric perspective. Your design thinking skills translate directly into product strategy. Focus on adding analytical and business skills to complement your existing UX expertise. Learn to speak the language of metrics, OKRs, and business impact.",
    skillBoosts: ["Product Management", "Analytics", "User Research", "A/B Testing", "SQL for PMs", "Business Strategy"],
    skillSuppress: ["Advanced visual design", "Motion design", "Illustration"],
    milestoneInsert: {
      title: "Product Management Transition",
      description: "Build the business and analytical skills that complement your design expertise.",
      tasks: [
        "Shadow a product manager for a sprint cycle",
        "Learn SQL well enough to pull your own data",
        "Write 3 product specs using a structured PRD template",
        "Run a user research study end-to-end and present findings to stakeholders",
      ],
      estimatedWeeks: 8,
      position: 1,
    },
  },

  // 9. Certification Hunter
  {
    id: "certification-hunter",
    name: "Certification Hunter",
    conditions: {
      riskTolerance: ["low"],
      careerStage: ["advancing"],
      learningStyleIncludes: ["Books"],
    },
    weight: 6,
    additionalAdvice:
      "Your methodical approach to career advancement through structured learning is effective, especially in fields that value credentials (cloud, security, project management). Map out a certification roadmap aligned with your target role. Pair each certification with a hands-on project to reinforce the knowledge.",
    skillBoosts: ["AWS/GCP/Azure Certifications", "PMP", "Scrum Master", "CompTIA", "Structured Learning"],
    skillSuppress: ["Unstructured exploration", "Hackathon-style building"],
  },

  // 10. Hackathon Builder
  {
    id: "hackathon-builder",
    name: "Hackathon Builder",
    conditions: {
      riskTolerance: ["high"],
      learningStyleIncludes: ["Projects"],
      careerStage: ["building"],
    },
    weight: 7,
    additionalAdvice:
      "You learn best by doing, and that's the fastest path to real competency. Participate in hackathons, build side projects, and contribute to open source. Employers increasingly value demonstrable shipping ability over credentials. Document everything you build — your GitHub profile is your resume.",
    skillBoosts: ["Rapid Prototyping", "Full-Stack Development", "Git/GitHub", "Demo Skills", "API Integration"],
    skillSuppress: ["Long certification tracks", "Academic coursework"],
    milestoneInsert: {
      title: "Ship Three Projects",
      description: "Build a portfolio of shipped projects that demonstrate real-world problem solving.",
      tasks: [
        "Participate in at least 2 hackathons (online or in-person)",
        "Build and deploy 3 projects with increasing complexity",
        "Write a brief case study for each project covering problem, approach, and outcome",
        "Get at least one project to 10+ real users",
      ],
      estimatedWeeks: 8,
      position: "start",
    },
  },

  // 11. Expert Consultant
  {
    id: "expert-consultant",
    name: "Expert Consultant",
    conditions: {
      experienceLevel: ["expert"],
      trajectory: ["specialist"],
      values: ["autonomy"],
    },
    weight: 8,
    additionalAdvice:
      "With expert-level skills and a desire for autonomy, independent consulting or fractional roles are your highest-leverage path. Build a personal brand around your specialty. Publish thought leadership, speak at conferences, and cultivate a referral network. Your deep expertise commands premium rates — don't undersell yourself.",
    skillBoosts: ["Personal Branding", "Consulting Skills", "Thought Leadership", "Pricing Strategy", "Contract Negotiation"],
    skillSuppress: ["Entry-level skills", "Generalist breadth"],
    milestoneInsert: {
      title: "Build Your Consulting Practice",
      description: "Transition from employee to trusted expert advisor in your domain.",
      tasks: [
        "Define your niche: the specific intersection where you have rare expertise",
        "Create a consulting website and LinkedIn presence highlighting your specialty",
        "Publish 4 in-depth articles or talks that demonstrate thought leadership",
        "Land your first 2 consulting clients through your network",
      ],
      estimatedWeeks: 12,
      position: "end",
    },
  },

  // 12. Junior Mentorship Seeker
  {
    id: "junior-mentorship-seeker",
    name: "Junior Mentorship Seeker",
    conditions: {
      experienceLevel: ["student", "junior"],
      learningStyleIncludes: ["Mentorship"],
    },
    weight: 7,
    additionalAdvice:
      "Mentorship at your stage can compress years of trial-and-error into months. Actively seek mentors through ADPList, coding communities, or your workplace. Come to every session with specific questions and follow through on advice. The best mentees become the most sought-after mentors later.",
    skillBoosts: ["Networking", "Communication", "Active Learning", "Question Formulation"],
    skillSuppress: ["Self-directed research-heavy paths"],
    milestoneInsert: {
      title: "Establish Mentorship Network",
      description: "Build relationships with experienced professionals who can accelerate your growth.",
      tasks: [
        "Sign up on ADPList or MentorCruise and book 3 introductory sessions",
        "Identify one long-term mentor and propose a regular cadence (biweekly)",
        "Prepare a career goals document to share with potential mentors",
        "Join a professional community (Discord, Slack) in your target field",
      ],
      estimatedWeeks: 4,
      position: "start",
    },
  },

  // 13. Prestige Climber
  {
    id: "prestige-climber",
    name: "Prestige Climber",
    conditions: {
      values: ["prestige"],
      careerStage: ["advancing"],
      trajectory: ["manager", "specialist"],
    },
    weight: 6,
    additionalAdvice:
      "Prestige in tech is earned through visible impact and brand-name signals. Target FAANG-tier companies, contribute to high-profile open source projects, and build a public track record. Invest in system design interview prep and competitive programming if targeting top-tier companies.",
    skillBoosts: ["System Design", "Algorithm Optimization", "Technical Interviews", "Public Speaking", "Open Source Leadership"],
    skillSuppress: ["No-code tools", "Low-profile roles"],
  },

  // 14. Purpose-Driven Builder
  {
    id: "purpose-driven-builder",
    name: "Purpose-Driven Builder",
    conditions: {
      values: ["purpose"],
      riskTolerance: ["moderate", "high"],
      careerStage: ["building", "advancing"],
    },
    weight: 7,
    additionalAdvice:
      "Your motivation by purpose is a career superpower — it sustains energy through hard challenges. Target mission-driven companies, social enterprises, or non-profit tech roles. Consider govtech, healthtech, edtech, or climate tech. Purpose-aligned work dramatically reduces burnout and increases long-term career satisfaction.",
    skillBoosts: ["Impact Measurement", "Grant Writing", "Stakeholder Communication", "Ethical AI", "Accessibility"],
    skillSuppress: ["Pure profit optimization", "Ad tech", "High-frequency trading"],
  },

  // 15. Generalist Explorer
  {
    id: "generalist-explorer",
    name: "Generalist Explorer",
    conditions: {
      experienceLevel: ["student", "junior"],
      trajectory: ["generalist"],
      careerStage: ["exploring"],
    },
    weight: 7,
    additionalAdvice:
      "Exploration is the right strategy early in your career. Try multiple domains before specializing. Seek rotational programs, agencies, or startups where you wear many hats. Track what energizes you vs. what drains you — that data will guide your eventual specialization.",
    skillBoosts: ["Full-Stack Development", "Design Thinking", "Data Literacy", "Communication", "Adaptability"],
    skillSuppress: ["Narrow specialization", "Deep-dive certifications"],
    milestoneInsert: {
      title: "Structured Exploration Sprint",
      description: "Systematically sample different tech domains to discover your best fit.",
      tasks: [
        "Complete a mini-project in 3 different domains (e.g., web dev, data, mobile)",
        "Shadow professionals in 2 roles that interest you",
        "Keep a journal rating each experience on energy, skill fit, and excitement",
        "After 8 weeks, pick your top 2 areas and go deeper",
      ],
      estimatedWeeks: 8,
      position: "start",
    },
  },

  // 16. Bootcamp Fast-Tracker
  {
    id: "bootcamp-fast-tracker",
    name: "Bootcamp Fast-Tracker",
    conditions: {
      learningStyleIncludes: ["Bootcamps"],
      riskTolerance: ["high", "moderate"],
      careerStage: ["pivoting", "exploring"],
    },
    weight: 7,
    additionalAdvice:
      "Bootcamps are your fastest path to job-ready skills. Choose one with strong hiring partnerships, career support, and a curriculum aligned with market demand. Supplement with personal projects — bootcamp graduates who ship side projects get hired significantly faster.",
    skillBoosts: ["Full-Stack Development", "Portfolio Building", "Interview Prep", "Networking"],
    skillSuppress: ["Academic theory", "Research-heavy paths"],
    milestoneInsert: {
      title: "Bootcamp Selection & Preparation",
      description: "Choose the right intensive program and maximize your ROI.",
      tasks: [
        "Research 5 bootcamps: compare curriculum, outcomes data, and alumni reviews",
        "Complete pre-work or prerequisites before the cohort starts",
        "Set up your development environment and learn Git basics",
        "Connect with 3 bootcamp alumni on LinkedIn and ask about their experience",
      ],
      estimatedWeeks: 3,
      position: "start",
    },
  },

  // 17. Cloud Architect Path
  {
    id: "cloud-architect-path",
    name: "Cloud Architect Path",
    conditions: {
      domainIncludes: ["Cloud", "Infrastructure", "DevOps"],
      experienceLevel: ["mid", "senior"],
      trajectory: ["specialist"],
    },
    weight: 8,
    additionalAdvice:
      "Cloud architecture is one of the highest-paying specializations. Build hands-on experience across at least one major cloud provider (AWS preferred for breadth of opportunity). Combine certifications with real infrastructure projects. Learn Infrastructure as Code (Terraform, Pulumi) — it's non-negotiable for senior roles.",
    skillBoosts: ["AWS", "Terraform", "Kubernetes", "System Design", "Networking", "Security", "Cost Optimization"],
    skillSuppress: ["Frontend development", "UI design"],
    milestoneInsert: {
      title: "Cloud Certification Ladder",
      description: "Build structured cloud expertise through progressively advanced certifications.",
      tasks: [
        "Earn AWS Solutions Architect Associate (or equivalent GCP/Azure cert)",
        "Deploy a multi-service production architecture using Infrastructure as Code",
        "Implement monitoring, alerting, and auto-scaling for a real application",
        "Document your architecture decisions in ADRs (Architecture Decision Records)",
      ],
      estimatedWeeks: 12,
      position: "end",
    },
  },

  // 18. Creative Technologist
  {
    id: "creative-technologist",
    name: "Creative Technologist",
    conditions: {
      domainIncludes: ["Design", "Creative"],
      workStyle: ["solo", "mixed"],
      values: ["mastery", "autonomy"],
    },
    weight: 6,
    additionalAdvice:
      "You sit at the intersection of art and technology — a rare and valuable position. Explore creative coding (p5.js, three.js, shaders), generative art, interactive installations, and creative tools development. Companies like studios, agencies, and tech art departments actively recruit this profile.",
    skillBoosts: ["Creative Coding", "Three.js", "WebGL", "Generative Art", "Interactive Design", "Prototyping"],
    skillSuppress: ["Enterprise software", "Database administration"],
  },

  // 19. Security Specialist
  {
    id: "security-specialist",
    name: "Security Specialist",
    conditions: {
      domainIncludes: ["Security", "Cybersecurity"],
      riskTolerance: ["low", "moderate"],
      trajectory: ["specialist"],
    },
    weight: 8,
    additionalAdvice:
      "Cybersecurity has near-zero unemployment and rising demand. Your methodical nature aligns perfectly with security work. Start with defensive security (blue team), then expand to penetration testing or security architecture. Certifications matter significantly in this field — CompTIA Security+, then CISSP or OSCP.",
    skillBoosts: ["Network Security", "Penetration Testing", "SIEM", "Compliance", "Incident Response", "Security Certifications"],
    skillSuppress: ["Frontend design", "Marketing"],
    milestoneInsert: {
      title: "Security Foundation",
      description: "Build core cybersecurity skills through structured learning and hands-on practice.",
      tasks: [
        "Complete TryHackMe or HackTheBox beginner paths",
        "Earn CompTIA Security+ certification",
        "Set up a home lab for security testing and monitoring",
        "Participate in a Capture The Flag (CTF) competition",
      ],
      estimatedWeeks: 10,
      position: 1,
    },
  },

  // 20. Entrepreneurial Senior
  {
    id: "entrepreneurial-senior",
    name: "Entrepreneurial Senior",
    conditions: {
      experienceLevel: ["senior", "expert"],
      trajectory: ["entrepreneur"],
      riskTolerance: ["high", "moderate"],
    },
    weight: 9,
    additionalAdvice:
      "Your combination of deep experience and entrepreneurial drive positions you for high-impact ventures. You have the technical chops to build and the industry knowledge to identify real problems. Consider bootstrapping over VC funding initially — your savings and network are your unfair advantage. Focus on B2B products in your domain of expertise.",
    skillBoosts: ["Business Development", "Revenue Strategy", "Hiring", "Product-Market Fit", "Financial Modeling", "Sales"],
    skillSuppress: ["Academic credentials", "Corporate ladder skills"],
    milestoneInsert: {
      title: "Validate & Launch",
      description: "Use your industry expertise to identify, validate, and build a viable business.",
      tasks: [
        "Identify 3 painful problems from your professional experience that businesses would pay to solve",
        "Validate demand: get 5 potential customers to commit (LOI or pre-order)",
        "Build an MVP leveraging your strongest technical skills",
        "Establish a runway plan: how many months can you self-fund before needing revenue?",
      ],
      estimatedWeeks: 8,
      position: "start",
    },
  },

  // 21. Video Learner Optimizer
  {
    id: "video-learner-optimizer",
    name: "Video Learner Optimizer",
    conditions: {
      learningStyleIncludes: ["Video courses"],
      experienceLevel: ["student", "junior"],
      careerStage: ["exploring", "building"],
    },
    weight: 5,
    additionalAdvice:
      "Video courses are a great starting point, but avoid tutorial hell — the trap of endlessly watching without building. For every hour of video, spend two hours coding along and experimenting. Supplement video learning with project-based practice to cement knowledge.",
    skillBoosts: ["Hands-on Practice", "Note Taking", "Active Recall"],
    skillSuppress: [],
  },

  // 22. Mid-Career Plateau Breaker
  {
    id: "mid-career-plateau",
    name: "Mid-Career Plateau Breaker",
    conditions: {
      experienceLevel: ["mid"],
      careerStage: ["advancing"],
      riskTolerance: ["moderate"],
    },
    weight: 7,
    additionalAdvice:
      "Mid-career plateaus are common and solvable. Break through by either going deeper (staff engineer track) or broader (management/product). Seek stretch assignments, contribute to architecture decisions, and build visibility outside your immediate team. Consider a lateral move to a higher-growth company if your current environment has a low ceiling.",
    skillBoosts: ["Architecture", "Cross-team Collaboration", "Technical Writing", "Mentoring", "Visibility Building"],
    skillSuppress: ["Beginner tutorials", "Entry-level certifications"],
    milestoneInsert: {
      title: "Break the Plateau",
      description: "Execute a focused plan to accelerate past the mid-career stall.",
      tasks: [
        "Identify the specific gap between your current level and the next (ask your manager directly)",
        "Take ownership of a cross-team or ambiguous initiative",
        "Write and publish 2 technical blog posts or internal RFCs",
        "Build a relationship with a skip-level leader or external mentor",
      ],
      estimatedWeeks: 8,
      position: 1,
    },
  },

  // 23. Collaborative Generalist
  {
    id: "collaborative-generalist",
    name: "Collaborative Generalist",
    conditions: {
      workStyle: ["collaborative"],
      trajectory: ["generalist"],
      careerStage: ["building"],
    },
    weight: 6,
    additionalAdvice:
      "Your collaborative nature and generalist inclination make you ideal for roles like Technical Program Manager, Solutions Architect, or Developer Advocate. These roles require breadth of knowledge and strong interpersonal skills — exactly your profile. Build T-shaped skills: broad understanding with one or two deeper areas.",
    skillBoosts: ["Cross-functional Communication", "Project Management", "Technical Writing", "Stakeholder Management"],
    skillSuppress: ["Deep narrow specialization"],
  },

  // 24. AI/ML Aspirer
  {
    id: "ai-ml-aspirer",
    name: "AI/ML Aspirer",
    conditions: {
      domainIncludes: ["AI", "Machine Learning", "Artificial Intelligence"],
      careerStage: ["exploring", "building"],
    },
    weight: 7,
    additionalAdvice:
      "The AI field is evolving rapidly. Focus on fundamentals (linear algebra, statistics, Python) before chasing the latest models. Understand the full ML lifecycle, not just model training. The biggest career differentiator right now is being able to deploy and maintain ML systems in production, not just build notebooks.",
    skillBoosts: ["Python", "Statistics", "Linear Algebra", "MLOps", "Prompt Engineering", "Data Engineering"],
    skillSuppress: ["Outdated frameworks", "Theory-only approaches"],
    milestoneInsert: {
      title: "AI/ML Foundations",
      description: "Build the mathematical and practical foundations for an AI/ML career.",
      tasks: [
        "Complete a math refresher: linear algebra and probability/statistics",
        "Work through fast.ai's Practical Deep Learning course",
        "Build 2 end-to-end ML projects with deployment (e.g., on Hugging Face Spaces)",
        "Follow and summarize 5 key AI research papers in your area of interest",
      ],
      estimatedWeeks: 12,
      position: "start",
    },
  },

  // 25. Remote-First Autonomy Seeker
  {
    id: "remote-autonomy-seeker",
    name: "Remote-First Autonomy Seeker",
    conditions: {
      values: ["autonomy"],
      workStyle: ["solo", "mixed"],
      riskTolerance: ["moderate", "high"],
    },
    weight: 5,
    additionalAdvice:
      "Remote-first roles reward strong async communication, self-management, and documentation skills. Build a home office setup that maximizes focus. Target companies with established remote cultures (GitLab, Automattic, Basecamp model). Your async communication skills are as important as your technical skills in this setup.",
    skillBoosts: ["Async Communication", "Written Communication", "Self-Management", "Documentation", "Time Management"],
    skillSuppress: ["In-person networking heavy strategies"],
  },
];

// ── Rule Evaluation ──────────────────────────────────────────────────────

/**
 * Evaluates all combination rules against the given context.
 * Returns matching rules sorted by weight (highest first).
 */
export function evaluateRules(context: RuleContext): CombinationRule[] {
  const matching = COMBINATION_RULES.filter((rule) => matchesCondition(context, rule.conditions));
  return matching.sort((a, b) => b.weight - a.weight);
}

// ── Rule Overlay Application ─────────────────────────────────────────────

interface GapEntry {
  skill: string;
  importance: "high" | "medium" | "low";
  [key: string]: unknown;
}

interface MilestoneEntry {
  title: string;
  description: string;
  tasks: string[];
  estimatedWeeks: number;
  [key: string]: unknown;
}

/**
 * Applies matching rule overlays to the base career assessment output.
 *
 * 1. Collects summaryOverrides and additionalAdvice
 * 2. Boosts/suppresses skills in the gap list
 * 3. Inserts milestones at specified positions
 */
export function applyRuleOverlays(
  rules: CombinationRule[],
  baseSummary: string,
  baseGaps: GapEntry[],
  baseMilestones: MilestoneEntry[]
): { summary: string; gaps: GapEntry[]; milestones: MilestoneEntry[] } {
  if (rules.length === 0) {
    return { summary: baseSummary, gaps: baseGaps, milestones: baseMilestones };
  }

  // ── 1. Summary modifications ────────────────────────────────────────

  let summary = baseSummary;

  // Apply the highest-weight summaryOverride (only one to avoid incoherence)
  const overrideRule = rules.find((r) => r.summaryOverride);
  if (overrideRule?.summaryOverride) {
    summary = overrideRule.summaryOverride + "\n\n" + summary;
  }

  // Append all additionalAdvice paragraphs
  const adviceParagraphs = rules
    .filter((r) => r.additionalAdvice)
    .map((r) => r.additionalAdvice);

  if (adviceParagraphs.length > 0) {
    summary = summary + "\n\n" + adviceParagraphs.join("\n\n");
  }

  // ── 2. Skill gap boost/suppress ─────────────────────────────────────

  const allBoosts = new Set<string>();
  const allSuppress = new Set<string>();

  for (const rule of rules) {
    for (const s of rule.skillBoosts) allBoosts.add(s.toLowerCase());
    for (const s of rule.skillSuppress) allSuppress.add(s.toLowerCase());
  }

  const gaps = baseGaps.map((gap) => {
    const skillLower = gap.skill.toLowerCase();
    const boosted = allBoosts.has(skillLower) || [...allBoosts].some((b) => skillLower.includes(b) || b.includes(skillLower));
    const suppressed = allSuppress.has(skillLower) || [...allSuppress].some((s) => skillLower.includes(s) || s.includes(skillLower));

    if (boosted && !suppressed) {
      // Promote importance
      const promoted = gap.importance === "low" ? "medium" : "high";
      return { ...gap, importance: promoted as GapEntry["importance"] };
    }
    if (suppressed && !boosted) {
      // Demote importance
      const demoted = gap.importance === "high" ? "medium" : "low";
      return { ...gap, importance: demoted as GapEntry["importance"] };
    }
    return { ...gap };
  });

  // Add boosted skills that aren't already in gaps
  const existingSkillNames = new Set(gaps.map((g) => g.skill.toLowerCase()));
  for (const rule of rules) {
    for (const boost of rule.skillBoosts) {
      if (!existingSkillNames.has(boost.toLowerCase())) {
        gaps.push({
          skill: boost,
          importance: "medium",
        });
        existingSkillNames.add(boost.toLowerCase());
      }
    }
  }

  // Sort gaps: high → medium → low
  const importanceOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  gaps.sort((a, b) => (importanceOrder[a.importance] ?? 1) - (importanceOrder[b.importance] ?? 1));

  // ── 3. Milestone insertion ──────────────────────────────────────────

  const milestones = [...baseMilestones];
  const inserts: { milestone: MilestoneEntry; position: "start" | "end" | number }[] = [];

  for (const rule of rules) {
    if (rule.milestoneInsert) {
      const mi = rule.milestoneInsert;
      inserts.push({
        milestone: {
          title: mi.title,
          description: mi.description,
          tasks: mi.tasks,
          estimatedWeeks: mi.estimatedWeeks,
        },
        position: mi.position,
      });
    }
  }

  // Sort inserts so positional ones don't shift indices unexpectedly.
  // Process "end" last, "start" first, numeric in ascending order.
  inserts.sort((a, b) => {
    const posA = a.position === "start" ? -1 : a.position === "end" ? Infinity : a.position;
    const posB = b.position === "start" ? -1 : b.position === "end" ? Infinity : b.position;
    return posA - posB;
  });

  let startOffset = 0;
  for (const insert of inserts) {
    if (insert.position === "start") {
      milestones.splice(startOffset, 0, insert.milestone);
      startOffset++;
    } else if (insert.position === "end") {
      milestones.push(insert.milestone);
    } else {
      // Numeric position, clamped to valid range
      const idx = Math.min(Math.max(0, insert.position + startOffset), milestones.length);
      milestones.splice(idx, 0, insert.milestone);
      startOffset++;
    }
  }

  return { summary, gaps, milestones };
}
