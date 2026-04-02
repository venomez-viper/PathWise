export interface SkillGapEntry { skill: string; importance: "high" | "medium" | "low"; learningResource: string; }
export interface CertEntry { skill: string; certName: string; provider: string; url: string; duration: string; level: string; cost: string; whyRecommended: string; }
export interface RecEntry { type: "portfolio" | "networking" | "job_application"; title: string; description: string; platform?: string; url?: string; difficulty?: string; timeEstimate?: string; why: string; actionStep: string; }
export interface MilestoneEntry { title: string; description: string; tasks: string[]; estimatedWeeks: number; }
export interface CareerProfile {
  id: string; title: string; domain: string; description: string;
  interests: string[]; problemTypes: string[]; archetypes: string[];
  workStyles: string[]; decisionStyle: string[]; collaboration: string[];
  ambiguityStyle: string[]; coreValues: string[]; tradeoffs: string[];
  frustrations: string[]; rewards: string[]; environments: string[];
  teamSizes: string[]; paces: string[]; managementStyles: string[];
  careerStages: string[]; riskLevels: string[]; trajectories: string[];
  groupRoles: string[]; requiredSkills: string[]; experienceLevels: string[];
  domains: string[]; pathwayTime: string;
  skillGaps: SkillGapEntry[]; certifications: CertEntry[];
  portfolioProjects: RecEntry[]; networkingRecs: RecEntry[];
  jobTargets: RecEntry[]; milestones: MilestoneEntry[];
}

export const CAREER_PROFILES_PART1: CareerProfile[] = [
  // 1. Frontend Developer
  {
    id: "frontend-dev", title: "Frontend Developer", domain: "Technology",
    description: "Build interactive user interfaces and web applications using modern frameworks.",
    interests: ["artistic", "realistic"], problemTypes: ["technical", "creative"], archetypes: ["builder"],
    workStyles: ["open", "organized"], decisionStyle: ["thinking"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["mastery", "autonomy"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["monotony", "micromanaged"], rewards: ["learning", "recognition"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building", "pivoting"],
    riskLevels: ["high", "moderate"], trajectories: ["specialist", "generalist"],
    groupRoles: ["doer", "ideator"], requiredSkills: ["JavaScript/TypeScript", "React", "CSS", "Git", "Testing"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Technology", "Design & UX"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "React", importance: "high", learningResource: "React.dev official tutorial" },
      { skill: "TypeScript", importance: "high", learningResource: "TypeScript Handbook" },
      { skill: "CSS/Tailwind", importance: "medium", learningResource: "Tailwind CSS docs" },
    ],
    certifications: [
      { skill: "Frontend", certName: "Meta Front-End Developer Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer", duration: "7 months", level: "Beginner", cost: "$49/month", whyRecommended: "Industry-recognized frontend credential" },
      { skill: "JavaScript", certName: "JavaScript Algorithms and Data Structures", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", duration: "3 months", level: "Beginner", cost: "Free", whyRecommended: "Hands-on JS fundamentals" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Personal Portfolio Site", description: "Build a responsive portfolio with React and Tailwind.", why: "Shows real frontend skills to employers.", actionStep: "Set up a Vite + React project today." },
      { type: "portfolio", title: "Task Management App", description: "Build a Trello-like board with drag-and-drop.", why: "Demonstrates state management and UI complexity.", actionStep: "Start with a basic kanban board component." },
    ],
    networkingRecs: [
      { type: "networking", title: "Reactiflux Discord", description: "Largest React community on Discord.", platform: "Discord", url: "https://www.reactiflux.com/", why: "Direct access to React developers.", actionStep: "Join and introduce yourself in #introductions." },
      { type: "networking", title: "Frontend Mentor", description: "Practice challenges with community feedback.", platform: "Web", url: "https://www.frontendmentor.io/", why: "Build portfolio while getting peer reviews.", actionStep: "Complete one challenge this week." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Frontend Jobs", description: "Search for Junior Frontend Developer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Largest professional job board.", actionStep: "Set up job alerts for 'Frontend Developer' and apply to 3 this week." },
      { type: "job_application", title: "Wellfound (AngelList)", description: "Startup-focused job board.", platform: "Wellfound", url: "https://wellfound.com/", why: "Startups hire junior devs more readily.", actionStep: "Create profile and apply to 2 startups." },
    ],
    milestones: [
      { title: "HTML, CSS & JS Foundations", description: "Master core web technologies", tasks: ["Complete freeCodeCamp Responsive Web Design", "Build 3 static pages from scratch", "Learn CSS Flexbox and Grid"], estimatedWeeks: 3 },
      { title: "React Fundamentals", description: "Learn component-based UI development", tasks: ["Complete React.dev tutorial", "Build a todo app with React", "Learn React Router basics"], estimatedWeeks: 4 },
      { title: "TypeScript & Tooling", description: "Add type safety and modern tooling", tasks: ["Complete TypeScript handbook", "Convert React app to TypeScript", "Set up ESLint and Prettier"], estimatedWeeks: 3 },
      { title: "Portfolio Projects", description: "Build showcase projects", tasks: ["Build personal portfolio site", "Create a full CRUD app", "Deploy projects to Vercel"], estimatedWeeks: 4 },
      { title: "Testing & Best Practices", description: "Write tests and learn patterns", tasks: ["Learn Vitest and React Testing Library", "Add tests to portfolio projects", "Study accessibility basics"], estimatedWeeks: 3 },
      { title: "Job Search", description: "Apply and interview", tasks: ["Polish resume and LinkedIn", "Apply to 10+ positions", "Practice coding challenges"], estimatedWeeks: 4 },
    ],
  },

  // 2. Backend Developer
  {
    id: "backend-dev", title: "Backend Developer", domain: "Technology",
    description: "Design and build server-side logic, APIs, and database systems.",
    interests: ["investigative", "realistic"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["mastery", "impact"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["tech_debt", "unclear_requirements"], rewards: ["learning", "problem_solving"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "fast"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "low"], trajectories: ["specialist", "generalist"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Node.js/Python/Go", "SQL", "REST APIs", "Git", "Docker"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Technology"],
    pathwayTime: "4-8 months",
    skillGaps: [
      { skill: "Node.js or Python", importance: "high", learningResource: "The Odin Project backend path" },
      { skill: "SQL & Databases", importance: "high", learningResource: "SQLBolt interactive tutorials" },
      { skill: "Docker", importance: "medium", learningResource: "Docker Getting Started docs" },
    ],
    certifications: [
      { skill: "Backend", certName: "Meta Back-End Developer Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/meta-back-end-developer", duration: "8 months", level: "Beginner", cost: "$49/month", whyRecommended: "Comprehensive backend curriculum" },
      { skill: "AWS", certName: "AWS Cloud Practitioner", provider: "AWS", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/", duration: "2 months", level: "Beginner", cost: "$100", whyRecommended: "Cloud fundamentals for backend devs" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "REST API with Auth", description: "Build a CRUD API with JWT authentication.", why: "Core backend skill every employer expects.", actionStep: "Set up Express/FastAPI with a user model today." },
      { type: "portfolio", title: "URL Shortener Service", description: "Build a URL shortener with analytics.", why: "Shows DB design, caching, and API skills.", actionStep: "Design the database schema first." },
    ],
    networkingRecs: [
      { type: "networking", title: "Node.js Discord", description: "Active Node.js community.", platform: "Discord", url: "https://discord.gg/nodejs", why: "Get help and share knowledge.", actionStep: "Join and answer a question this week." },
      { type: "networking", title: "Dev.to", description: "Write and share technical articles.", platform: "Web", url: "https://dev.to/", why: "Build reputation through writing.", actionStep: "Write your first article about something you learned." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Backend Jobs", description: "Search for Backend Developer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most backend jobs are posted here.", actionStep: "Apply to 3 backend roles this week." },
      { type: "job_application", title: "Indeed", description: "Broad job search platform.", platform: "Indeed", url: "https://www.indeed.com/", why: "High volume of backend listings.", actionStep: "Set alerts for 'Backend Developer' in your area." },
    ],
    milestones: [
      { title: "Programming Fundamentals", description: "Master a backend language", tasks: ["Complete a Node.js or Python course", "Build CLI tools", "Learn data structures basics"], estimatedWeeks: 4 },
      { title: "Databases & SQL", description: "Learn relational and NoSQL databases", tasks: ["Complete SQLBolt tutorials", "Set up PostgreSQL locally", "Build CRUD operations"], estimatedWeeks: 3 },
      { title: "API Development", description: "Build RESTful APIs", tasks: ["Learn Express or FastAPI", "Implement authentication", "Add input validation"], estimatedWeeks: 4 },
      { title: "DevOps Basics", description: "Learn deployment and containers", tasks: ["Dockerize an application", "Deploy to a cloud provider", "Set up CI/CD pipeline"], estimatedWeeks: 3 },
      { title: "Portfolio Projects", description: "Build production-quality projects", tasks: ["Build a REST API with auth", "Create a microservice", "Write API documentation"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply and interview prep", tasks: ["Polish GitHub profile", "Practice system design basics", "Apply to 10+ positions"], estimatedWeeks: 4 },
    ],
  },

  // 3. Full-Stack Developer
  {
    id: "fullstack-dev", title: "Full-Stack Developer", domain: "Technology",
    description: "Build complete web applications spanning frontend, backend, and databases.",
    interests: ["realistic", "investigative"], problemTypes: ["technical", "creative"], archetypes: ["builder", "generalist"],
    workStyles: ["open", "organized"], decisionStyle: ["thinking", "pragmatic"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["mastery", "autonomy"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["monotony", "siloed_work"], rewards: ["learning", "ownership"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["building", "pivoting"],
    riskLevels: ["moderate", "high"], trajectories: ["generalist", "leader"],
    groupRoles: ["doer", "connector"], requiredSkills: ["JavaScript/TypeScript", "React", "Node.js", "SQL", "Git", "Docker"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Technology"],
    pathwayTime: "6-12 months",
    skillGaps: [
      { skill: "Full-Stack Frameworks", importance: "high", learningResource: "Next.js official docs" },
      { skill: "Database Design", importance: "high", learningResource: "PostgreSQL Tutorial" },
      { skill: "Deployment/CI-CD", importance: "medium", learningResource: "Vercel + GitHub Actions docs" },
    ],
    certifications: [
      { skill: "Full-Stack", certName: "IBM Full Stack Software Developer", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer", duration: "4 months", level: "Beginner", cost: "$49/month", whyRecommended: "End-to-end full-stack coverage" },
      { skill: "Full-Stack", certName: "Responsive Web Design + APIs", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/", duration: "6 months", level: "Beginner", cost: "Free", whyRecommended: "Free hands-on full-stack learning" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "SaaS Starter App", description: "Build a full-stack SaaS with auth, payments, and dashboard.", why: "Proves you can ship a complete product.", actionStep: "Scaffold a Next.js app with NextAuth today." },
      { type: "portfolio", title: "Real-Time Chat App", description: "Build a chat app with WebSockets.", why: "Shows real-time data handling skills.", actionStep: "Set up Socket.io with a basic server." },
    ],
    networkingRecs: [
      { type: "networking", title: "Indie Hackers", description: "Community of developers building products.", platform: "Web", url: "https://www.indiehackers.com/", why: "Connect with builders shipping full-stack apps.", actionStep: "Share your project in the forum." },
      { type: "networking", title: "Local Meetups", description: "Attend JavaScript or web dev meetups.", platform: "Meetup", url: "https://www.meetup.com/", why: "In-person networking leads to referrals.", actionStep: "RSVP to one meetup this month." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Full-Stack Jobs", description: "Search for Full-Stack Developer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most common platform for these roles.", actionStep: "Apply to 3 full-stack roles this week." },
      { type: "job_application", title: "Wellfound Startups", description: "Startups love full-stack developers.", platform: "Wellfound", url: "https://wellfound.com/", why: "Startups value versatile developers.", actionStep: "Apply to 2 startups this week." },
    ],
    milestones: [
      { title: "Frontend Foundations", description: "Master React and modern CSS", tasks: ["Complete React.dev tutorial", "Build 2 responsive UIs", "Learn state management"], estimatedWeeks: 4 },
      { title: "Backend Foundations", description: "Build APIs and work with databases", tasks: ["Learn Node.js/Express", "Set up PostgreSQL", "Build REST endpoints"], estimatedWeeks: 4 },
      { title: "Full-Stack Integration", description: "Connect frontend to backend", tasks: ["Build a Next.js full-stack app", "Implement authentication", "Add form handling and validation"], estimatedWeeks: 4 },
      { title: "DevOps & Deployment", description: "Ship and monitor applications", tasks: ["Deploy to Vercel/Railway", "Set up CI/CD with GitHub Actions", "Add error monitoring"], estimatedWeeks: 3 },
      { title: "Portfolio Projects", description: "Build 2 impressive full-stack apps", tasks: ["Build a SaaS starter", "Build a real-time app", "Write project READMEs"], estimatedWeeks: 5 },
      { title: "Job Search", description: "Apply and interview", tasks: ["Update resume and portfolio", "Apply to 15+ positions", "Practice full-stack interview questions"], estimatedWeeks: 4 },
    ],
  },

  // 4. Mobile Developer
  {
    id: "mobile-dev", title: "Mobile Developer", domain: "Technology",
    description: "Create native and cross-platform mobile applications for iOS and Android.",
    interests: ["artistic", "realistic"], problemTypes: ["technical", "creative"], archetypes: ["builder"],
    workStyles: ["organized", "open"], decisionStyle: ["thinking"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["mastery", "creativity"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["fragmentation", "slow_releases"], rewards: ["seeing_users_use_product", "learning"],
    environments: ["remote", "hybrid", "office"], teamSizes: ["small", "medium"], paces: ["fast", "steady"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist", "generalist"],
    groupRoles: ["doer", "ideator"], requiredSkills: ["React Native/Flutter", "JavaScript/Dart", "Mobile UI", "REST APIs", "Git"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Technology", "Design & UX"],
    pathwayTime: "4-8 months",
    skillGaps: [
      { skill: "React Native or Flutter", importance: "high", learningResource: "React Native docs or Flutter.dev" },
      { skill: "Mobile UI Patterns", importance: "high", learningResource: "Material Design guidelines" },
      { skill: "App Store Deployment", importance: "medium", learningResource: "Apple/Google developer docs" },
    ],
    certifications: [
      { skill: "Mobile", certName: "Meta React Native Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/meta-react-native", duration: "5 months", level: "Intermediate", cost: "$49/month", whyRecommended: "React Native from Meta engineers" },
      { skill: "Flutter", certName: "Flutter & Dart Complete Guide", provider: "Udemy", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", duration: "3 months", level: "Beginner", cost: "$15", whyRecommended: "Comprehensive Flutter course" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Weather App", description: "Build a mobile weather app with API integration.", why: "Shows API handling and mobile UI skills.", actionStep: "Set up React Native and fetch from OpenWeather API." },
      { type: "portfolio", title: "Expense Tracker", description: "Build an app to track daily expenses with charts.", why: "Demonstrates local storage and data visualization.", actionStep: "Design the data model and main screen layout." },
    ],
    networkingRecs: [
      { type: "networking", title: "React Native Community Discord", description: "Active React Native developer community.", platform: "Discord", url: "https://www.reactnative.dev/community/overview", why: "Get help with React Native issues.", actionStep: "Join and share your first project." },
      { type: "networking", title: "Flutter Community", description: "Official Flutter community resources.", platform: "Web", url: "https://flutter.dev/community", why: "Connect with Flutter developers.", actionStep: "Join the Flutter Discord server." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Mobile Jobs", description: "Search for Mobile Developer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Best platform for mobile dev roles.", actionStep: "Apply to 3 mobile developer positions." },
      { type: "job_application", title: "RemoteOK", description: "Remote mobile development positions.", platform: "RemoteOK", url: "https://remoteok.com/", why: "Mobile dev is highly remote-friendly.", actionStep: "Filter for React Native or Flutter roles." },
    ],
    milestones: [
      { title: "Mobile Fundamentals", description: "Learn mobile development basics", tasks: ["Set up React Native or Flutter", "Build a Hello World app", "Understand mobile navigation"], estimatedWeeks: 3 },
      { title: "UI & Components", description: "Master mobile UI patterns", tasks: ["Build reusable components", "Implement navigation flows", "Handle different screen sizes"], estimatedWeeks: 4 },
      { title: "Data & APIs", description: "Connect to backends and manage state", tasks: ["Fetch data from REST APIs", "Implement local storage", "Add state management"], estimatedWeeks: 3 },
      { title: "Native Features", description: "Use device capabilities", tasks: ["Access camera and location", "Implement push notifications", "Handle offline mode"], estimatedWeeks: 3 },
      { title: "Portfolio Apps", description: "Build 2 polished mobile apps", tasks: ["Build weather app", "Build expense tracker", "Publish to app store"], estimatedWeeks: 5 },
      { title: "Job Search", description: "Apply for mobile dev roles", tasks: ["Record app demo videos", "Apply to 10+ positions", "Practice mobile-specific interview topics"], estimatedWeeks: 4 },
    ],
  },

  // 5. DevOps/SRE Engineer
  {
    id: "devops-sre", title: "DevOps/SRE Engineer", domain: "Technology",
    description: "Automate infrastructure, CI/CD pipelines, and ensure system reliability at scale.",
    interests: ["investigative", "realistic"], problemTypes: ["technical", "analytical"], archetypes: ["optimizer", "builder"],
    workStyles: ["methodical", "organized"], decisionStyle: ["analytical", "thinking"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["mastery", "impact"], tradeoffs: ["stability_over_wealth"],
    frustrations: ["firefighting", "lack_of_automation"], rewards: ["problem_solving", "efficiency"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "fast"],
    managementStyles: ["handsoff", "collaborative"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "leader"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud (AWS/GCP)", "Terraform"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Technology"],
    pathwayTime: "6-12 months",
    skillGaps: [
      { skill: "Kubernetes", importance: "high", learningResource: "Kubernetes.io official tutorials" },
      { skill: "Terraform/IaC", importance: "high", learningResource: "HashiCorp Learn tutorials" },
      { skill: "CI/CD Pipelines", importance: "medium", learningResource: "GitHub Actions documentation" },
    ],
    certifications: [
      { skill: "Cloud", certName: "AWS Solutions Architect Associate", provider: "AWS", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", duration: "3 months", level: "Intermediate", cost: "$150", whyRecommended: "Most in-demand cloud certification" },
      { skill: "Kubernetes", certName: "CKA: Certified Kubernetes Administrator", provider: "CNCF", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", duration: "3 months", level: "Intermediate", cost: "$395", whyRecommended: "Gold standard for K8s skills" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "K8s Cluster Setup", description: "Deploy a multi-service app on Kubernetes.", why: "Proves hands-on K8s experience.", actionStep: "Set up Minikube and deploy a sample app." },
      { type: "portfolio", title: "CI/CD Pipeline", description: "Build a full CI/CD pipeline with GitHub Actions.", why: "Shows automation and DevOps thinking.", actionStep: "Create a pipeline for an existing project." },
    ],
    networkingRecs: [
      { type: "networking", title: "DevOps Subreddit", description: "Active DevOps discussion community.", platform: "Reddit", url: "https://www.reddit.com/r/devops/", why: "Learn from real-world DevOps practitioners.", actionStep: "Participate in weekly discussions." },
      { type: "networking", title: "KubeCon Events", description: "Kubernetes and cloud-native conferences.", platform: "CNCF", url: "https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/", why: "Premier networking for cloud-native engineers.", actionStep: "Attend virtual or in-person sessions." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn DevOps Jobs", description: "Search for DevOps/SRE Engineer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Largest job board for DevOps roles.", actionStep: "Apply to 3 DevOps roles this week." },
      { type: "job_application", title: "Hired.com", description: "Platform where companies apply to you.", platform: "Hired", url: "https://hired.com/", why: "DevOps engineers are in high demand here.", actionStep: "Create a profile highlighting cloud skills." },
    ],
    milestones: [
      { title: "Linux & Networking", description: "Master Linux administration basics", tasks: ["Complete Linux admin course", "Set up a home lab server", "Learn networking fundamentals"], estimatedWeeks: 4 },
      { title: "Containers & Docker", description: "Learn containerization", tasks: ["Dockerize 3 applications", "Use Docker Compose for multi-container", "Learn image optimization"], estimatedWeeks: 3 },
      { title: "CI/CD & Automation", description: "Build automated pipelines", tasks: ["Set up GitHub Actions workflows", "Implement automated testing", "Add deployment automation"], estimatedWeeks: 3 },
      { title: "Cloud & IaC", description: "Learn cloud infrastructure as code", tasks: ["Get AWS free tier account", "Write Terraform configurations", "Deploy infrastructure to AWS"], estimatedWeeks: 4 },
      { title: "Kubernetes", description: "Learn container orchestration", tasks: ["Complete K8s tutorials", "Deploy app to K8s cluster", "Set up monitoring with Prometheus"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for DevOps/SRE positions", tasks: ["Get AWS or CKA certification", "Apply to 10+ positions", "Practice system design interviews"], estimatedWeeks: 4 },
    ],
  },

  // 6. QA/Test Engineer
  {
    id: "qa-engineer", title: "QA/Test Engineer", domain: "Technology",
    description: "Ensure software quality through manual and automated testing strategies.",
    interests: ["investigative", "conventional"], problemTypes: ["analytical", "technical"], archetypes: ["optimizer", "guardian"],
    workStyles: ["methodical", "organized"], decisionStyle: ["analytical"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure"], coreValues: ["quality", "reliability"], tradeoffs: ["stability_over_wealth"],
    frustrations: ["rushed_releases", "ignored_bugs"], rewards: ["problem_solving", "quality"],
    environments: ["hybrid", "office"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["collaborative", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "leader"],
    groupRoles: ["analyst", "critic"], requiredSkills: ["Test Automation", "Selenium/Cypress", "API Testing", "SQL", "CI/CD"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Technology"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Test Automation", importance: "high", learningResource: "Cypress.io documentation" },
      { skill: "API Testing", importance: "high", learningResource: "Postman Learning Center" },
      { skill: "Performance Testing", importance: "medium", learningResource: "K6 documentation" },
    ],
    certifications: [
      { skill: "QA", certName: "ISTQB Foundation Level", provider: "ISTQB", url: "https://www.istqb.org/certifications/certified-tester-foundation-level", duration: "2 months", level: "Beginner", cost: "$250", whyRecommended: "Industry standard QA certification" },
      { skill: "Automation", certName: "Google IT Automation with Python", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-it-automation", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Automation skills from Google" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Automated Test Suite", description: "Build an E2E test suite for a web app with Cypress.", why: "Shows practical automation skills.", actionStep: "Pick an open-source app and write 10 E2E tests." },
      { type: "portfolio", title: "API Test Framework", description: "Build a reusable API testing framework.", why: "Demonstrates systematic testing approach.", actionStep: "Set up a Postman collection with test scripts." },
    ],
    networkingRecs: [
      { type: "networking", title: "Ministry of Testing", description: "Global software testing community.", platform: "Web", url: "https://www.ministryoftesting.com/", why: "Best community for QA professionals.", actionStep: "Join the free community forum." },
      { type: "networking", title: "Test Automation University", description: "Free courses and community.", platform: "Web", url: "https://testautomationu.applitools.com/", why: "Learn and connect with QA engineers.", actionStep: "Complete one free course." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn QA Jobs", description: "Search for QA Engineer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most QA positions listed here.", actionStep: "Apply to 3 QA roles this week." },
      { type: "job_application", title: "Indeed QA Jobs", description: "Search for test engineer positions.", platform: "Indeed", url: "https://www.indeed.com/", why: "Broad range of QA job listings.", actionStep: "Set up alerts for 'QA Engineer'." },
    ],
    milestones: [
      { title: "Testing Fundamentals", description: "Learn test methodology and manual testing", tasks: ["Study ISTQB syllabus", "Practice test case writing", "Learn bug reporting best practices"], estimatedWeeks: 3 },
      { title: "Programming Basics", description: "Learn a scripting language for automation", tasks: ["Learn JavaScript or Python basics", "Understand OOP concepts", "Practice coding challenges"], estimatedWeeks: 3 },
      { title: "Test Automation", description: "Build automated UI tests", tasks: ["Learn Cypress or Selenium", "Write 20 automated test cases", "Integrate tests with CI/CD"], estimatedWeeks: 4 },
      { title: "API & Performance Testing", description: "Test APIs and system performance", tasks: ["Learn Postman and API testing", "Write API test scripts", "Run a basic load test with K6"], estimatedWeeks: 3 },
      { title: "Portfolio & Frameworks", description: "Build reusable test frameworks", tasks: ["Create a test automation framework", "Document your testing approach", "Contribute to open-source testing"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for QA positions", tasks: ["Get ISTQB certification", "Apply to 10+ positions", "Practice QA interview questions"], estimatedWeeks: 4 },
    ],
  },

  // 7. Data Scientist
  {
    id: "data-scientist", title: "Data Scientist", domain: "Data & Analytics",
    description: "Extract insights from data using statistics, ML models, and visualization.",
    interests: ["investigative", "artistic"], problemTypes: ["analytical", "research"], archetypes: ["explorer", "analyst"],
    workStyles: ["open", "methodical"], decisionStyle: ["analytical", "thinking"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["experiment", "explore"], coreValues: ["mastery", "curiosity"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["dirty_data", "unclear_goals"], rewards: ["discovery", "learning"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist", "generalist"],
    groupRoles: ["analyst", "ideator"], requiredSkills: ["Python", "Statistics", "ML/sklearn", "SQL", "Data Visualization"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Data & Analytics", "Technology"],
    pathwayTime: "6-12 months",
    skillGaps: [
      { skill: "Machine Learning", importance: "high", learningResource: "Andrew Ng's ML Specialization on Coursera" },
      { skill: "Statistics", importance: "high", learningResource: "Khan Academy Statistics" },
      { skill: "Python/Pandas", importance: "medium", learningResource: "Kaggle Learn Python" },
    ],
    certifications: [
      { skill: "Data Science", certName: "IBM Data Science Professional Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/ibm-data-science", duration: "5 months", level: "Beginner", cost: "$49/month", whyRecommended: "Comprehensive data science path" },
      { skill: "ML", certName: "Machine Learning Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction", duration: "3 months", level: "Intermediate", cost: "$49/month", whyRecommended: "Andrew Ng's gold-standard ML course" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Kaggle Competition Entry", description: "Compete in a Kaggle prediction challenge.", why: "Shows practical ML and data wrangling skills.", actionStep: "Pick a beginner Kaggle competition and submit a baseline." },
      { type: "portfolio", title: "EDA Blog Post", description: "Publish an exploratory data analysis on a real dataset.", why: "Demonstrates communication of data insights.", actionStep: "Pick a dataset from Kaggle Datasets and start analysis." },
    ],
    networkingRecs: [
      { type: "networking", title: "Kaggle Community", description: "Data science competition and learning platform.", platform: "Web", url: "https://www.kaggle.com/", why: "Best platform for data science practice.", actionStep: "Complete a Kaggle Learn course this week." },
      { type: "networking", title: "r/datascience", description: "Reddit data science community.", platform: "Reddit", url: "https://www.reddit.com/r/datascience/", why: "Career advice from working data scientists.", actionStep: "Read the FAQ and ask a question." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Data Science Jobs", description: "Search for Data Scientist roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Top platform for data science hiring.", actionStep: "Apply to 3 data science roles this week." },
      { type: "job_application", title: "Glassdoor", description: "Job listings with company reviews.", platform: "Glassdoor", url: "https://www.glassdoor.com/", why: "Compare salary and culture before applying.", actionStep: "Research 5 companies and apply to top picks." },
    ],
    milestones: [
      { title: "Python & Math Foundations", description: "Learn Python and statistics", tasks: ["Complete Python for data science course", "Study probability and statistics", "Learn NumPy and Pandas"], estimatedWeeks: 4 },
      { title: "Data Analysis & Viz", description: "Master exploratory data analysis", tasks: ["Complete Kaggle Pandas course", "Learn Matplotlib and Seaborn", "Analyze 3 real datasets"], estimatedWeeks: 4 },
      { title: "Machine Learning", description: "Learn core ML algorithms", tasks: ["Complete Andrew Ng's ML course", "Implement models with scikit-learn", "Practice feature engineering"], estimatedWeeks: 5 },
      { title: "Deep Learning Basics", description: "Learn neural networks", tasks: ["Complete a deep learning intro course", "Build a simple neural network", "Try a computer vision project"], estimatedWeeks: 4 },
      { title: "Portfolio Projects", description: "Build impressive data science projects", tasks: ["Complete a Kaggle competition", "Publish an EDA blog post", "Build an ML-powered web app"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply and interview", tasks: ["Polish GitHub and Kaggle profiles", "Practice SQL and stats interviews", "Apply to 10+ positions"], estimatedWeeks: 4 },
    ],
  },

  // 8. Data Analyst
  {
    id: "data-analyst", title: "Data Analyst", domain: "Data & Analytics",
    description: "Analyze business data to produce actionable insights and dashboards.",
    interests: ["investigative", "conventional"], problemTypes: ["analytical", "business"], archetypes: ["analyst", "advisor"],
    workStyles: ["organized", "methodical"], decisionStyle: ["analytical"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure", "clarify"], coreValues: ["impact", "accuracy"], tradeoffs: ["stability_over_wealth"],
    frustrations: ["dirty_data", "ignored_insights"], rewards: ["impact", "problem_solving"],
    environments: ["hybrid", "office"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["collaborative", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "generalist"],
    groupRoles: ["analyst", "presenter"], requiredSkills: ["SQL", "Excel", "Tableau/Power BI", "Python/R", "Statistics"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Data & Analytics", "Finance"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "SQL", importance: "high", learningResource: "Mode Analytics SQL Tutorial" },
      { skill: "Tableau/Power BI", importance: "high", learningResource: "Tableau Public free training" },
      { skill: "Statistics", importance: "medium", learningResource: "Khan Academy Statistics" },
    ],
    certifications: [
      { skill: "Data Analytics", certName: "Google Data Analytics Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-data-analytics", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Most popular analytics certification" },
      { skill: "Tableau", certName: "Tableau Desktop Specialist", provider: "Tableau", url: "https://www.tableau.com/learn/certification/desktop-specialist", duration: "2 months", level: "Beginner", cost: "$100", whyRecommended: "Industry-recognized viz certification" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Sales Dashboard", description: "Build an interactive Tableau dashboard from sample sales data.", why: "Core skill for every data analyst role.", actionStep: "Download a sample dataset and build your first dashboard." },
      { type: "portfolio", title: "SQL Analysis Report", description: "Write complex SQL queries to answer business questions.", why: "SQL is the #1 skill employers test for.", actionStep: "Complete 5 intermediate SQL challenges on LeetCode." },
    ],
    networkingRecs: [
      { type: "networking", title: "Tableau Community", description: "Official Tableau user community.", platform: "Web", url: "https://community.tableau.com/", why: "Get feedback on your viz work.", actionStep: "Publish your first viz to Tableau Public." },
      { type: "networking", title: "Data Analytics LinkedIn Groups", description: "Professional analytics communities.", platform: "LinkedIn", url: "https://www.linkedin.com/groups/", why: "Connect with hiring managers.", actionStep: "Join 2 analytics groups and engage." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Data Analyst Jobs", description: "Search for Data Analyst roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Highest volume of analyst listings.", actionStep: "Apply to 3 analyst roles this week." },
      { type: "job_application", title: "Indeed", description: "Broad range of data analyst positions.", platform: "Indeed", url: "https://www.indeed.com/", why: "Many entry-level analyst roles.", actionStep: "Set up alerts for 'Data Analyst'." },
    ],
    milestones: [
      { title: "Excel & Spreadsheets", description: "Master advanced Excel skills", tasks: ["Learn pivot tables and VLOOKUP", "Build a financial model", "Create charts and dashboards"], estimatedWeeks: 2 },
      { title: "SQL Mastery", description: "Write complex SQL queries", tasks: ["Complete SQL tutorial", "Practice joins and subqueries", "Solve 20 SQL challenges"], estimatedWeeks: 3 },
      { title: "Data Visualization", description: "Learn Tableau or Power BI", tasks: ["Complete Tableau training", "Build 3 interactive dashboards", "Publish to Tableau Public"], estimatedWeeks: 4 },
      { title: "Statistics & Python", description: "Learn basic stats and Python", tasks: ["Study descriptive statistics", "Learn Python pandas basics", "Analyze a dataset with Python"], estimatedWeeks: 3 },
      { title: "Portfolio Projects", description: "Create analysis portfolio", tasks: ["Build a business dashboard", "Write an analysis report", "Present findings clearly"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for analyst roles", tasks: ["Get Google Data Analytics cert", "Apply to 10+ positions", "Practice SQL interview questions"], estimatedWeeks: 4 },
    ],
  },

  // 9. ML Engineer
  {
    id: "ml-engineer", title: "ML Engineer", domain: "Data & Analytics",
    description: "Build and deploy production machine learning systems and pipelines.",
    interests: ["investigative", "realistic"], problemTypes: ["technical", "research"], archetypes: ["builder", "optimizer"],
    workStyles: ["methodical", "open"], decisionStyle: ["analytical", "thinking"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "explore"], coreValues: ["mastery", "innovation"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["infra_complexity", "slow_iteration"], rewards: ["learning", "building"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Python", "TensorFlow/PyTorch", "MLOps", "Docker", "SQL", "Cloud"],
    experienceLevels: ["mid", "senior"], domains: ["Data & Analytics", "Technology"],
    pathwayTime: "8-14 months",
    skillGaps: [
      { skill: "Deep Learning", importance: "high", learningResource: "fast.ai Practical Deep Learning" },
      { skill: "MLOps", importance: "high", learningResource: "Made With ML MLOps course" },
      { skill: "Cloud ML Services", importance: "medium", learningResource: "AWS SageMaker tutorials" },
    ],
    certifications: [
      { skill: "ML", certName: "AWS Machine Learning Specialty", provider: "AWS", url: "https://aws.amazon.com/certification/certified-machine-learning-specialty/", duration: "3 months", level: "Advanced", cost: "$300", whyRecommended: "Top ML cloud certification" },
      { skill: "Deep Learning", certName: "Deep Learning Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/deep-learning", duration: "4 months", level: "Intermediate", cost: "$49/month", whyRecommended: "Andrew Ng's deep learning masterclass" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "End-to-End ML Pipeline", description: "Build a model training and serving pipeline.", why: "Shows MLOps and production ML skills.", actionStep: "Set up MLflow for experiment tracking." },
      { type: "portfolio", title: "Model API Service", description: "Deploy an ML model as a REST API.", why: "Proves you can ship ML to production.", actionStep: "Wrap a trained model with FastAPI." },
    ],
    networkingRecs: [
      { type: "networking", title: "MLOps Community", description: "Slack community for ML in production.", platform: "Slack", url: "https://mlops.community/", why: "Connect with MLOps practitioners.", actionStep: "Join Slack and introduce yourself." },
      { type: "networking", title: "Papers with Code", description: "ML research with implementations.", platform: "Web", url: "https://paperswithcode.com/", why: "Stay current with ML research.", actionStep: "Reproduce one paper's results." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn ML Jobs", description: "Search for ML Engineer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most ML engineer roles are posted here.", actionStep: "Apply to 3 ML engineer roles." },
      { type: "job_application", title: "AI-Jobs.net", description: "AI and ML focused job board.", platform: "Web", url: "https://ai-jobs.net/", why: "Specialized ML/AI job listings.", actionStep: "Browse and apply to matching roles." },
    ],
    milestones: [
      { title: "Python & ML Foundations", description: "Master Python and ML basics", tasks: ["Complete Andrew Ng's ML course", "Implement algorithms from scratch", "Learn scikit-learn thoroughly"], estimatedWeeks: 5 },
      { title: "Deep Learning", description: "Learn neural networks and frameworks", tasks: ["Complete fast.ai course", "Build models with PyTorch", "Train on GPU instances"], estimatedWeeks: 5 },
      { title: "MLOps & Infrastructure", description: "Learn production ML tooling", tasks: ["Set up MLflow tracking", "Learn Docker for ML", "Build a training pipeline"], estimatedWeeks: 4 },
      { title: "Cloud ML Services", description: "Deploy ML on cloud platforms", tasks: ["Learn AWS SageMaker or GCP Vertex AI", "Deploy a model endpoint", "Set up model monitoring"], estimatedWeeks: 4 },
      { title: "Portfolio Projects", description: "Build end-to-end ML systems", tasks: ["Build an ML pipeline project", "Deploy model as API", "Write technical documentation"], estimatedWeeks: 5 },
      { title: "Job Search", description: "Apply for ML engineer roles", tasks: ["Get AWS ML certification", "Apply to 10+ positions", "Practice ML system design interviews"], estimatedWeeks: 4 },
    ],
  },

  // 10. Data Engineer
  {
    id: "data-engineer", title: "Data Engineer", domain: "Data & Analytics",
    description: "Design and build data pipelines, warehouses, and ETL systems.",
    interests: ["realistic", "investigative"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["mastery", "reliability"], tradeoffs: ["stability_over_wealth"],
    frustrations: ["tech_debt", "data_quality"], rewards: ["building", "efficiency"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "fast"],
    managementStyles: ["handsoff", "collaborative"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "leader"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["SQL", "Python", "Spark", "Airflow", "Cloud (AWS/GCP)", "Data Modeling"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Data & Analytics", "Technology"],
    pathwayTime: "6-10 months",
    skillGaps: [
      { skill: "Apache Spark", importance: "high", learningResource: "Databricks Academy free courses" },
      { skill: "Airflow/Orchestration", importance: "high", learningResource: "Apache Airflow documentation" },
      { skill: "Data Modeling", importance: "medium", learningResource: "Kimball Group data warehouse toolkit" },
    ],
    certifications: [
      { skill: "Data Engineering", certName: "Google Professional Data Engineer", provider: "Google Cloud", url: "https://cloud.google.com/learn/certification/data-engineer", duration: "3 months", level: "Intermediate", cost: "$200", whyRecommended: "Top cloud data engineering cert" },
      { skill: "Data Engineering", certName: "Databricks Data Engineer Associate", provider: "Databricks", url: "https://www.databricks.com/learn/certification/data-engineer-associate", duration: "2 months", level: "Intermediate", cost: "$200", whyRecommended: "Industry-standard Spark certification" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "ETL Pipeline", description: "Build a data pipeline with Airflow and Spark.", why: "Core skill for every data engineer role.", actionStep: "Set up Airflow locally and create your first DAG." },
      { type: "portfolio", title: "Data Warehouse", description: "Design and build a star schema warehouse.", why: "Shows data modeling and warehousing skills.", actionStep: "Model a sample business domain in PostgreSQL." },
    ],
    networkingRecs: [
      { type: "networking", title: "Data Engineering Subreddit", description: "Active data engineering community.", platform: "Reddit", url: "https://www.reddit.com/r/dataengineering/", why: "Real-world advice from data engineers.", actionStep: "Read top posts and engage in discussions." },
      { type: "networking", title: "dbt Community", description: "Analytics engineering community.", platform: "Slack", url: "https://www.getdbt.com/community/", why: "dbt is essential for modern data engineering.", actionStep: "Join Slack and complete the dbt tutorial." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Data Engineering Jobs", description: "Search for Data Engineer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most data engineering roles posted here.", actionStep: "Apply to 3 data engineer roles this week." },
      { type: "job_application", title: "Dice", description: "Tech-focused job board.", platform: "Dice", url: "https://www.dice.com/", why: "Good for technical data roles.", actionStep: "Create profile and apply to roles." },
    ],
    milestones: [
      { title: "SQL & Python Mastery", description: "Master core data engineering languages", tasks: ["Complete advanced SQL course", "Learn Python for data processing", "Practice complex queries"], estimatedWeeks: 4 },
      { title: "Data Modeling", description: "Learn dimensional modeling", tasks: ["Study Kimball methodology", "Design a star schema", "Build a sample warehouse"], estimatedWeeks: 3 },
      { title: "ETL & Pipelines", description: "Build data pipelines", tasks: ["Learn Apache Airflow", "Build 3 ETL pipelines", "Handle error and retry logic"], estimatedWeeks: 4 },
      { title: "Big Data Tools", description: "Learn distributed processing", tasks: ["Complete Spark basics course", "Process large datasets with PySpark", "Learn data partitioning strategies"], estimatedWeeks: 4 },
      { title: "Cloud Data Services", description: "Use cloud data platforms", tasks: ["Learn BigQuery or Redshift", "Set up a cloud data pipeline", "Implement data quality checks"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for data engineer roles", tasks: ["Get a cloud data certification", "Apply to 10+ positions", "Practice data pipeline design interviews"], estimatedWeeks: 4 },
    ],
  },

  // 11. BI Analyst
  {
    id: "bi-analyst", title: "BI Analyst", domain: "Data & Analytics",
    description: "Build business intelligence dashboards and reporting systems for decision-makers.",
    interests: ["conventional", "investigative"], problemTypes: ["analytical", "business"], archetypes: ["analyst", "advisor"],
    workStyles: ["organized", "methodical"], decisionStyle: ["analytical"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure", "clarify"], coreValues: ["impact", "accuracy"], tradeoffs: ["stability_over_wealth"],
    frustrations: ["unclear_requirements", "data_silos"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "office"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["collaborative", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["low"], trajectories: ["specialist", "generalist"],
    groupRoles: ["presenter", "analyst"], requiredSkills: ["SQL", "Power BI/Tableau", "Excel", "Data Modeling", "ETL Basics"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Data & Analytics", "Finance"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Power BI", importance: "high", learningResource: "Microsoft Learn Power BI path" },
      { skill: "SQL", importance: "high", learningResource: "W3Schools SQL Tutorial" },
      { skill: "DAX", importance: "medium", learningResource: "SQLBI DAX Guide" },
    ],
    certifications: [
      { skill: "Power BI", certName: "Microsoft Power BI Data Analyst (PL-300)", provider: "Microsoft", url: "https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/", duration: "3 months", level: "Intermediate", cost: "$165", whyRecommended: "Most valued BI certification" },
      { skill: "BI", certName: "Google Business Intelligence Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-business-intelligence", duration: "4 months", level: "Beginner", cost: "$49/month", whyRecommended: "Google-backed BI credential" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Executive Dashboard", description: "Build a Power BI dashboard for business KPIs.", why: "Core deliverable for BI analysts.", actionStep: "Download sample data and build a KPI dashboard." },
      { type: "portfolio", title: "Sales Analysis Report", description: "Create an end-to-end sales analysis with insights.", why: "Shows analytical and presentation skills.", actionStep: "Use AdventureWorks sample data to start." },
    ],
    networkingRecs: [
      { type: "networking", title: "Power BI Community", description: "Official Microsoft Power BI community.", platform: "Web", url: "https://community.powerbi.com/", why: "Get help and share dashboards.", actionStep: "Post your first dashboard for feedback." },
      { type: "networking", title: "Analytics Vidhya", description: "Analytics learning community.", platform: "Web", url: "https://www.analyticsvidhya.com/", why: "Articles and discussions on BI topics.", actionStep: "Read 3 articles on BI best practices." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn BI Jobs", description: "Search for BI Analyst roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most BI roles are listed here.", actionStep: "Apply to 3 BI analyst roles this week." },
      { type: "job_application", title: "Robert Half", description: "Staffing firm for analytics roles.", platform: "Robert Half", url: "https://www.roberthalf.com/", why: "Many contract-to-hire BI positions.", actionStep: "Submit your resume for BI roles." },
    ],
    milestones: [
      { title: "Excel & Data Basics", description: "Master Excel for analysis", tasks: ["Learn pivot tables and formulas", "Build a financial dashboard in Excel", "Understand data types and cleaning"], estimatedWeeks: 2 },
      { title: "SQL Fundamentals", description: "Learn SQL for data extraction", tasks: ["Complete SQL basics course", "Practice joins and aggregations", "Write 15 business queries"], estimatedWeeks: 3 },
      { title: "Power BI / Tableau", description: "Master a BI visualization tool", tasks: ["Complete Power BI learning path", "Build 3 interactive dashboards", "Learn DAX formulas"], estimatedWeeks: 4 },
      { title: "Data Modeling", description: "Understand data warehouse concepts", tasks: ["Learn star and snowflake schemas", "Build a data model in Power BI", "Connect multiple data sources"], estimatedWeeks: 3 },
      { title: "Portfolio Dashboards", description: "Create showcase BI projects", tasks: ["Build an executive dashboard", "Create a sales analysis report", "Publish to Power BI Service"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for BI analyst roles", tasks: ["Get PL-300 certification", "Apply to 10+ positions", "Practice BI interview scenarios"], estimatedWeeks: 4 },
    ],
  },

  // 12. UX Designer
  {
    id: "ux-designer", title: "UX Designer", domain: "Design & UX",
    description: "Design user-centered digital experiences through research, wireframes, and prototypes.",
    interests: ["artistic", "social"], problemTypes: ["creative", "human-centered"], archetypes: ["creator", "advisor"],
    workStyles: ["open", "collaborative"], decisionStyle: ["feeling", "intuitive"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["explore", "experiment"], coreValues: ["empathy", "creativity"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["ignored_research", "rushed_design"], rewards: ["user_impact", "creativity"],
    environments: ["hybrid", "office"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["collaborative", "mentorship"], careerStages: ["exploring", "building", "pivoting"],
    riskLevels: ["moderate", "low"], trajectories: ["specialist", "generalist"],
    groupRoles: ["ideator", "facilitator"], requiredSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Design & UX"],
    pathwayTime: "4-8 months",
    skillGaps: [
      { skill: "Figma", importance: "high", learningResource: "Figma official tutorials" },
      { skill: "User Research", importance: "high", learningResource: "NNGroup articles on UX research" },
      { skill: "Prototyping", importance: "medium", learningResource: "Figma prototyping docs" },
    ],
    certifications: [
      { skill: "UX", certName: "Google UX Design Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Most popular UX certification" },
      { skill: "UX", certName: "Interaction Design Foundation Membership", provider: "IDF", url: "https://www.interaction-design.org/", duration: "Ongoing", level: "Beginner", cost: "$12/month", whyRecommended: "Comprehensive UX curriculum" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "App Redesign Case Study", description: "Redesign an existing app and document the process.", why: "Case studies are the #1 hiring factor for UX.", actionStep: "Pick a popular app and identify 3 UX issues." },
      { type: "portfolio", title: "End-to-End UX Project", description: "Complete a project from research to prototype.", why: "Shows full UX design process.", actionStep: "Define a problem statement and interview 5 users." },
    ],
    networkingRecs: [
      { type: "networking", title: "ADPList", description: "Free mentorship platform for designers.", platform: "Web", url: "https://adplist.org/", why: "Get free mentorship from senior designers.", actionStep: "Book your first mentor session." },
      { type: "networking", title: "Dribbble", description: "Design portfolio and community platform.", platform: "Web", url: "https://dribbble.com/", why: "Showcase work and discover design trends.", actionStep: "Create a profile and upload 3 shots." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn UX Jobs", description: "Search for UX Designer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most UX roles are posted here.", actionStep: "Apply to 3 UX designer roles this week." },
      { type: "job_application", title: "Dribbble Jobs", description: "Design-focused job board.", platform: "Dribbble", url: "https://dribbble.com/jobs", why: "Jobs from design-forward companies.", actionStep: "Browse and apply to 2 roles." },
    ],
    milestones: [
      { title: "UX Foundations", description: "Learn core UX design principles", tasks: ["Complete Google UX Design course", "Study Nielsen's usability heuristics", "Read 'Don't Make Me Think'"], estimatedWeeks: 4 },
      { title: "User Research", description: "Learn research methods", tasks: ["Conduct 5 user interviews", "Create user personas", "Build a user journey map"], estimatedWeeks: 3 },
      { title: "Figma & Prototyping", description: "Master design tools", tasks: ["Complete Figma tutorials", "Build wireframes for 2 projects", "Create interactive prototypes"], estimatedWeeks: 4 },
      { title: "Usability Testing", description: "Learn to test designs", tasks: ["Conduct 3 usability tests", "Analyze test results", "Iterate based on findings"], estimatedWeeks: 3 },
      { title: "Portfolio Case Studies", description: "Build UX portfolio", tasks: ["Write 2 detailed case studies", "Build a portfolio website", "Get peer feedback"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for UX roles", tasks: ["Polish portfolio and resume", "Apply to 10+ positions", "Practice design challenge interviews"], estimatedWeeks: 4 },
    ],
  },

  // 13. UI Designer
  {
    id: "ui-designer", title: "UI Designer", domain: "Design & UX",
    description: "Create visually polished, pixel-perfect interfaces and design systems.",
    interests: ["artistic", "realistic"], problemTypes: ["creative", "visual"], archetypes: ["creator", "craftsperson"],
    workStyles: ["open", "detail-oriented"], decisionStyle: ["feeling", "intuitive"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "explore"], coreValues: ["creativity", "mastery"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["inconsistent_branding", "no_design_system"], rewards: ["aesthetics", "recognition"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "low"], trajectories: ["specialist"],
    groupRoles: ["ideator", "doer"], requiredSkills: ["Figma", "Visual Design", "Typography", "Color Theory", "Design Systems"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Design & UX"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Figma Advanced", importance: "high", learningResource: "Figma community tutorials" },
      { skill: "Design Systems", importance: "high", learningResource: "Figma Design Systems guide" },
      { skill: "Typography", importance: "medium", learningResource: "Typewolf resources" },
    ],
    certifications: [
      { skill: "UI", certName: "Google UX Design Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Covers visual design fundamentals" },
      { skill: "UI", certName: "UI Design Specialization", provider: "CalArts/Coursera", url: "https://www.coursera.org/specializations/ui-ux-design", duration: "4 months", level: "Beginner", cost: "$49/month", whyRecommended: "Focused on visual and UI design" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Design System", description: "Create a reusable design system with components.", why: "Design systems are crucial for UI roles.", actionStep: "Start with buttons, inputs, and typography tokens." },
      { type: "portfolio", title: "Mobile App UI", description: "Design a polished mobile app interface.", why: "Shows visual design skill and attention to detail.", actionStep: "Pick an app idea and create high-fidelity screens." },
    ],
    networkingRecs: [
      { type: "networking", title: "Dribbble", description: "Visual design showcase platform.", platform: "Web", url: "https://dribbble.com/", why: "The go-to platform for UI designers.", actionStep: "Upload 5 UI design shots." },
      { type: "networking", title: "Figma Community", description: "Share and discover Figma files.", platform: "Web", url: "https://www.figma.com/community", why: "Get inspiration and share your work.", actionStep: "Publish a design file to the community." },
    ],
    jobTargets: [
      { type: "job_application", title: "Dribbble Jobs", description: "Design-focused job listings.", platform: "Dribbble", url: "https://dribbble.com/jobs", why: "Companies here value visual design.", actionStep: "Apply to 2 UI designer positions." },
      { type: "job_application", title: "LinkedIn UI Jobs", description: "Search for UI Designer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most UI design jobs listed here.", actionStep: "Apply to 3 UI roles this week." },
    ],
    milestones: [
      { title: "Design Fundamentals", description: "Learn visual design principles", tasks: ["Study color theory and typography", "Learn layout and composition", "Analyze 10 well-designed apps"], estimatedWeeks: 3 },
      { title: "Figma Mastery", description: "Become proficient in Figma", tasks: ["Complete Figma tutorials", "Build auto-layout components", "Learn Figma variables"], estimatedWeeks: 3 },
      { title: "Design Systems", description: "Create reusable component libraries", tasks: ["Study existing design systems", "Build a component library", "Document usage guidelines"], estimatedWeeks: 4 },
      { title: "Mobile & Web Design", description: "Design for multiple platforms", tasks: ["Design a mobile app UI", "Design a web dashboard", "Create responsive layouts"], estimatedWeeks: 4 },
      { title: "Portfolio", description: "Build a stunning portfolio", tasks: ["Create 3 polished case studies", "Build portfolio website", "Get feedback from designers"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for UI roles", tasks: ["Polish Dribbble and Behance profiles", "Apply to 10+ positions", "Prepare for design whiteboard sessions"], estimatedWeeks: 4 },
    ],
  },

  // 14. UX Researcher
  {
    id: "ux-researcher", title: "UX Researcher", domain: "Design & UX",
    description: "Conduct user research to inform product design decisions with evidence.",
    interests: ["social", "investigative"], problemTypes: ["human-centered", "research"], archetypes: ["explorer", "analyst"],
    workStyles: ["methodical", "collaborative"], decisionStyle: ["analytical", "feeling"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["explore", "clarify"], coreValues: ["empathy", "truth"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["ignored_research", "small_sample_sizes"], rewards: ["discovery", "user_impact"],
    environments: ["hybrid", "office"], teamSizes: ["medium", "small"], paces: ["steady"],
    managementStyles: ["collaborative", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist"],
    groupRoles: ["analyst", "facilitator"], requiredSkills: ["User Interviews", "Survey Design", "Usability Testing", "Data Analysis", "Research Synthesis"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Design & UX"],
    pathwayTime: "4-8 months",
    skillGaps: [
      { skill: "Qualitative Research", importance: "high", learningResource: "NNGroup UX research articles" },
      { skill: "Survey Design", importance: "high", learningResource: "Qualtrics survey methodology guide" },
      { skill: "Data Analysis", importance: "medium", learningResource: "Google Data Analytics basics" },
    ],
    certifications: [
      { skill: "UX Research", certName: "Google UX Design Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Covers UX research fundamentals" },
      { skill: "Research", certName: "Research Methods Specialization", provider: "Coursera/UMich", url: "https://www.coursera.org/specializations/research-methods", duration: "4 months", level: "Intermediate", cost: "$49/month", whyRecommended: "Rigorous research methodology training" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Usability Study Report", description: "Conduct a usability study and present findings.", why: "Core deliverable for UX researchers.", actionStep: "Recruit 5 participants and test an existing app." },
      { type: "portfolio", title: "Research Case Study", description: "Document a complete research project end-to-end.", why: "Shows the full research process.", actionStep: "Define research questions for a product you use." },
    ],
    networkingRecs: [
      { type: "networking", title: "Mixed Methods Podcast", description: "UX research podcast and community.", platform: "Web", url: "https://www.mixed-methods.org/", why: "Learn from experienced UX researchers.", actionStep: "Listen to 3 episodes and take notes." },
      { type: "networking", title: "UXR Collective", description: "UX research community and resources.", platform: "Web", url: "https://www.userresearch.com/", why: "Connect with other UX researchers.", actionStep: "Join the community and engage." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn UXR Jobs", description: "Search for UX Researcher roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most UX research roles listed here.", actionStep: "Apply to 3 UX researcher roles." },
      { type: "job_application", title: "Glassdoor", description: "Research company culture before applying.", platform: "Glassdoor", url: "https://www.glassdoor.com/", why: "Understand team dynamics before joining.", actionStep: "Research and apply to 3 companies." },
    ],
    milestones: [
      { title: "Research Fundamentals", description: "Learn core research methods", tasks: ["Study qualitative vs quantitative methods", "Learn interview techniques", "Understand research ethics"], estimatedWeeks: 3 },
      { title: "User Interviews", description: "Master interview and moderation skills", tasks: ["Conduct 10 practice interviews", "Learn affinity mapping", "Synthesize interview data"], estimatedWeeks: 4 },
      { title: "Surveys & Quantitative", description: "Learn survey design and analytics", tasks: ["Design a user survey", "Learn basic statistics", "Analyze survey results"], estimatedWeeks: 3 },
      { title: "Usability Testing", description: "Run usability studies", tasks: ["Plan a usability study", "Moderate 5 test sessions", "Write a findings report"], estimatedWeeks: 4 },
      { title: "Research Portfolio", description: "Build research case studies", tasks: ["Write 2 detailed case studies", "Create a portfolio website", "Present research findings"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for UXR roles", tasks: ["Polish resume and portfolio", "Apply to 10+ positions", "Practice research presentation skills"], estimatedWeeks: 4 },
    ],
  },

  // 15. Product Designer
  {
    id: "product-designer", title: "Product Designer", domain: "Design & UX",
    description: "Own end-to-end design of digital products from research through visual polish.",
    interests: ["artistic", "social", "investigative"], problemTypes: ["creative", "human-centered", "business"], archetypes: ["creator", "generalist"],
    workStyles: ["open", "collaborative"], decisionStyle: ["intuitive", "thinking"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["explore", "experiment"], coreValues: ["creativity", "impact"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["no_user_access", "feature_factories"], rewards: ["user_impact", "ownership"],
    environments: ["hybrid", "remote"], teamSizes: ["small", "medium"], paces: ["fast", "steady"],
    managementStyles: ["collaborative", "handsoff"], careerStages: ["building", "advancing"],
    riskLevels: ["moderate"], trajectories: ["generalist", "leader"],
    groupRoles: ["ideator", "facilitator"], requiredSkills: ["Figma", "User Research", "Prototyping", "Visual Design", "Design Thinking"],
    experienceLevels: ["mid", "senior"], domains: ["Design & UX", "Technology"],
    pathwayTime: "6-10 months",
    skillGaps: [
      { skill: "Design Thinking", importance: "high", learningResource: "IDEO Design Thinking resources" },
      { skill: "Figma Advanced", importance: "high", learningResource: "Figma official tutorials" },
      { skill: "Product Strategy", importance: "medium", learningResource: "Reforge Product Design course" },
    ],
    certifications: [
      { skill: "Product Design", certName: "Google UX Design Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "End-to-end product design process" },
      { skill: "Design", certName: "Interaction Design Foundation Courses", provider: "IDF", url: "https://www.interaction-design.org/courses", duration: "Ongoing", level: "Intermediate", cost: "$12/month", whyRecommended: "Deep dives into product design topics" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Product Redesign", description: "Redesign a product with full case study.", why: "Shows end-to-end product design skill.", actionStep: "Pick a product and identify key user pain points." },
      { type: "portfolio", title: "0-to-1 Product Design", description: "Design a new product from scratch.", why: "Demonstrates product thinking and creativity.", actionStep: "Define a problem space and create a design brief." },
    ],
    networkingRecs: [
      { type: "networking", title: "ADPList", description: "Free design mentorship.", platform: "Web", url: "https://adplist.org/", why: "Get mentored by senior product designers.", actionStep: "Book 2 mentorship sessions." },
      { type: "networking", title: "Designer Fund Bridge", description: "Product design community and resources.", platform: "Web", url: "https://designerfund.com/bridge", why: "Network with top product designers.", actionStep: "Apply to the community program." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Product Design Jobs", description: "Search for Product Designer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Best platform for product design roles.", actionStep: "Apply to 3 product designer positions." },
      { type: "job_application", title: "Dribbble Jobs", description: "Design-focused job board.", platform: "Dribbble", url: "https://dribbble.com/jobs", why: "Companies that value design post here.", actionStep: "Apply to 2 product design roles." },
    ],
    milestones: [
      { title: "Design Thinking", description: "Master human-centered design process", tasks: ["Study IDEO design thinking", "Practice problem framing", "Run a design sprint exercise"], estimatedWeeks: 3 },
      { title: "User Research", description: "Learn research methods", tasks: ["Conduct 5 user interviews", "Create personas and journey maps", "Synthesize research findings"], estimatedWeeks: 4 },
      { title: "Figma & Prototyping", description: "Build design skills", tasks: ["Master Figma components", "Create interactive prototypes", "Build a design system"], estimatedWeeks: 4 },
      { title: "Visual Design", description: "Polish visual craft", tasks: ["Study typography and color", "Design high-fidelity screens", "Learn motion design basics"], estimatedWeeks: 3 },
      { title: "Portfolio Case Studies", description: "Build product design portfolio", tasks: ["Write 3 detailed case studies", "Build portfolio website", "Get peer and mentor feedback"], estimatedWeeks: 5 },
      { title: "Job Search", description: "Apply for product design roles", tasks: ["Polish portfolio and resume", "Apply to 10+ positions", "Practice design critique sessions"], estimatedWeeks: 4 },
    ],
  },

  // 16. Product Manager
  {
    id: "product-manager", title: "Product Manager", domain: "Product Management",
    description: "Define product strategy, prioritize features, and align teams around outcomes.",
    interests: ["enterprising", "social"], problemTypes: ["business", "strategic"], archetypes: ["strategist", "connector"],
    workStyles: ["collaborative", "organized"], decisionStyle: ["thinking", "intuitive"], collaboration: ["team"],
    ambiguityStyle: ["clarify", "explore"], coreValues: ["impact", "leadership"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["no_authority", "scope_creep"], rewards: ["ownership", "impact"],
    environments: ["hybrid", "office"], teamSizes: ["medium", "large"], paces: ["fast", "steady"],
    managementStyles: ["collaborative", "mentorship"], careerStages: ["building", "advancing", "pivoting"],
    riskLevels: ["moderate", "high"], trajectories: ["leader", "generalist"],
    groupRoles: ["facilitator", "connector"], requiredSkills: ["Product Strategy", "Prioritization", "Data Analysis", "User Research", "Roadmapping"],
    experienceLevels: ["mid", "senior"], domains: ["Product Management", "Technology"],
    pathwayTime: "4-8 months",
    skillGaps: [
      { skill: "Product Strategy", importance: "high", learningResource: "Inspired by Marty Cagan (book)" },
      { skill: "Data-Driven Decisions", importance: "high", learningResource: "Google Data Analytics basics" },
      { skill: "Roadmapping", importance: "medium", learningResource: "ProductPlan roadmapping guide" },
    ],
    certifications: [
      { skill: "PM", certName: "Google Project Management Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-project-management", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Solid PM fundamentals from Google" },
      { skill: "Product", certName: "Product Management by University of Virginia", provider: "Coursera", url: "https://www.coursera.org/specializations/product-management", duration: "4 months", level: "Intermediate", cost: "$49/month", whyRecommended: "Academic product management training" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Product Spec Document", description: "Write a PRD for a product feature.", why: "Core PM deliverable that shows strategic thinking.", actionStep: "Pick a product and write a 1-page PRD for a new feature." },
      { type: "portfolio", title: "Product Teardown", description: "Analyze a product's strategy and propose improvements.", why: "Shows product thinking and analytical skills.", actionStep: "Choose a product you use daily and write a teardown." },
    ],
    networkingRecs: [
      { type: "networking", title: "Lenny's Newsletter Community", description: "Top product management community.", platform: "Slack", url: "https://www.lennysnewsletter.com/", why: "Learn from senior PMs at top companies.", actionStep: "Subscribe and join the Slack group." },
      { type: "networking", title: "Product Hunt", description: "Discover and discuss new products.", platform: "Web", url: "https://www.producthunt.com/", why: "Stay current with product launches.", actionStep: "Comment on 3 product launches." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn PM Jobs", description: "Search for Product Manager roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Largest PM job listing platform.", actionStep: "Apply to 3 PM roles this week." },
      { type: "job_application", title: "Product Manager HQ Jobs", description: "PM-focused job board.", platform: "Web", url: "https://productmanagerhq.com/jobs/", why: "Curated PM-specific listings.", actionStep: "Browse and apply to 2 roles." },
    ],
    milestones: [
      { title: "PM Foundations", description: "Learn core PM skills", tasks: ["Read 'Inspired' by Marty Cagan", "Study product strategy frameworks", "Learn prioritization methods"], estimatedWeeks: 3 },
      { title: "User Research & Data", description: "Learn to make data-driven decisions", tasks: ["Conduct 5 user interviews", "Learn SQL basics", "Analyze product metrics"], estimatedWeeks: 4 },
      { title: "Roadmapping & Execution", description: "Learn to plan and ship products", tasks: ["Create a product roadmap", "Write a PRD", "Learn Agile/Scrum basics"], estimatedWeeks: 3 },
      { title: "Stakeholder Communication", description: "Master PM communication", tasks: ["Practice executive presentations", "Run a stakeholder alignment meeting", "Write product update emails"], estimatedWeeks: 3 },
      { title: "Portfolio Projects", description: "Build PM portfolio", tasks: ["Write 2 product teardowns", "Create a feature spec", "Build a PM portfolio page"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for PM roles", tasks: ["Polish resume for PM", "Apply to 10+ positions", "Practice PM interview cases"], estimatedWeeks: 4 },
    ],
  },

  // 17. Project Manager
  {
    id: "project-manager", title: "Project Manager", domain: "Product Management",
    description: "Plan, execute, and deliver projects on time and within budget.",
    interests: ["enterprising", "conventional"], problemTypes: ["organizational", "business"], archetypes: ["coordinator", "guardian"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "pragmatic"], collaboration: ["team"],
    ambiguityStyle: ["structure", "clarify"], coreValues: ["reliability", "leadership"], tradeoffs: ["stability_over_wealth"],
    frustrations: ["scope_creep", "resource_constraints"], rewards: ["completion", "team_success"],
    environments: ["hybrid", "office"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["collaborative", "directive"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["leader", "generalist"],
    groupRoles: ["coordinator", "facilitator"], requiredSkills: ["Project Planning", "Agile/Scrum", "Risk Management", "Budgeting", "Stakeholder Management"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Product Management", "Consulting"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Agile/Scrum", importance: "high", learningResource: "Scrum.org learning path" },
      { skill: "Project Planning", importance: "high", learningResource: "Google Project Management Certificate" },
      { skill: "Risk Management", importance: "medium", learningResource: "PMI risk management resources" },
    ],
    certifications: [
      { skill: "PM", certName: "Google Project Management Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-project-management", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Industry-recognized PM certification" },
      { skill: "Agile", certName: "PMI Agile Certified Practitioner (PMI-ACP)", provider: "PMI", url: "https://www.pmi.org/certifications/agile-acp", duration: "3 months", level: "Intermediate", cost: "$435", whyRecommended: "Top agile certification" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Project Plan Template", description: "Create a comprehensive project plan template.", why: "Shows practical project management skills.", actionStep: "Build a Gantt chart and risk register template." },
      { type: "portfolio", title: "Process Improvement Case Study", description: "Document a process improvement initiative.", why: "Demonstrates analytical and leadership skills.", actionStep: "Identify a process to improve and document results." },
    ],
    networkingRecs: [
      { type: "networking", title: "PMI Local Chapter", description: "Local Project Management Institute chapter.", platform: "PMI", url: "https://www.pmi.org/membership/chapters", why: "Professional network and events.", actionStep: "Find and join your local PMI chapter." },
      { type: "networking", title: "LinkedIn PM Groups", description: "Project management professional groups.", platform: "LinkedIn", url: "https://www.linkedin.com/groups/", why: "Connect with other PMs.", actionStep: "Join 2 PM groups and participate." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn PM Jobs", description: "Search for Project Manager roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most PM jobs posted here.", actionStep: "Apply to 3 PM roles this week." },
      { type: "job_application", title: "Indeed", description: "Broad range of PM positions.", platform: "Indeed", url: "https://www.indeed.com/", why: "Many entry-level PM roles.", actionStep: "Set alerts for 'Project Manager'." },
    ],
    milestones: [
      { title: "PM Fundamentals", description: "Learn core project management skills", tasks: ["Study project management frameworks", "Learn WBS and Gantt charts", "Understand project lifecycle phases"], estimatedWeeks: 3 },
      { title: "Agile & Scrum", description: "Master agile methodologies", tasks: ["Complete Scrum.org learning path", "Understand Kanban vs Scrum", "Practice sprint planning"], estimatedWeeks: 3 },
      { title: "Tools & Execution", description: "Learn PM tools", tasks: ["Master Jira or Asana", "Learn budgeting basics", "Practice status reporting"], estimatedWeeks: 3 },
      { title: "Risk & Stakeholders", description: "Manage risks and stakeholders", tasks: ["Create a risk register", "Practice stakeholder mapping", "Learn conflict resolution"], estimatedWeeks: 3 },
      { title: "Portfolio & Certification", description: "Build credentials", tasks: ["Complete Google PM certificate", "Build project plan portfolio", "Document a case study"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for PM roles", tasks: ["Polish resume with PM keywords", "Apply to 10+ positions", "Practice PM scenario interviews"], estimatedWeeks: 4 },
    ],
  },

  // 18. Scrum Master
  {
    id: "scrum-master", title: "Scrum Master", domain: "Product Management",
    description: "Facilitate Scrum ceremonies and help teams deliver software effectively.",
    interests: ["social", "enterprising"], problemTypes: ["organizational", "people"], archetypes: ["facilitator", "coach"],
    workStyles: ["collaborative", "organized"], decisionStyle: ["feeling", "pragmatic"], collaboration: ["team"],
    ambiguityStyle: ["clarify", "structure"], coreValues: ["teamwork", "growth"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["anti-patterns", "resistance_to_change"], rewards: ["team_success", "growth"],
    environments: ["hybrid", "office"], teamSizes: ["small", "medium"], paces: ["steady", "fast"],
    managementStyles: ["collaborative", "servant_leader"], careerStages: ["building", "pivoting"],
    riskLevels: ["low", "moderate"], trajectories: ["leader", "specialist"],
    groupRoles: ["facilitator", "coach"], requiredSkills: ["Scrum Framework", "Facilitation", "Coaching", "Jira", "Conflict Resolution"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Product Management", "Technology"],
    pathwayTime: "2-4 months",
    skillGaps: [
      { skill: "Scrum Framework", importance: "high", learningResource: "Scrum Guide (scrumguides.org)" },
      { skill: "Facilitation", importance: "high", learningResource: "Liberating Structures" },
      { skill: "Agile Coaching", importance: "medium", learningResource: "Agile Coaching Institute resources" },
    ],
    certifications: [
      { skill: "Scrum", certName: "Professional Scrum Master I (PSM I)", provider: "Scrum.org", url: "https://www.scrum.org/assessments/professional-scrum-master-i-certification", duration: "1 month", level: "Beginner", cost: "$150", whyRecommended: "Most respected Scrum certification" },
      { skill: "Scrum", certName: "Certified ScrumMaster (CSM)", provider: "Scrum Alliance", url: "https://www.scrumalliance.org/get-certified/scrum-master-track/certified-scrummaster", duration: "1 month", level: "Beginner", cost: "$495", whyRecommended: "Well-known Scrum credential" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Scrum Implementation Plan", description: "Document a Scrum adoption plan for a team.", why: "Shows practical Scrum facilitation skills.", actionStep: "Design a 3-month Scrum rollout plan." },
      { type: "portfolio", title: "Retrospective Toolkit", description: "Create a collection of retrospective formats.", why: "Demonstrates facilitation creativity.", actionStep: "Document 5 different retro formats with guidelines." },
    ],
    networkingRecs: [
      { type: "networking", title: "Scrum.org Community", description: "Official Scrum practitioner community.", platform: "Web", url: "https://www.scrum.org/forum", why: "Connect with Scrum practitioners.", actionStep: "Participate in forum discussions." },
      { type: "networking", title: "Agile Alliance", description: "Global agile community.", platform: "Web", url: "https://www.agilealliance.org/", why: "Access to events and resources.", actionStep: "Attend a local agile meetup." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Scrum Jobs", description: "Search for Scrum Master roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most Scrum Master roles listed here.", actionStep: "Apply to 3 Scrum Master roles." },
      { type: "job_application", title: "Indeed", description: "Broad Scrum Master listings.", platform: "Indeed", url: "https://www.indeed.com/", why: "Many companies hiring Scrum Masters.", actionStep: "Set alerts for 'Scrum Master'." },
    ],
    milestones: [
      { title: "Scrum Fundamentals", description: "Master the Scrum framework", tasks: ["Read the Scrum Guide thoroughly", "Study Scrum roles and events", "Take PSM I practice exams"], estimatedWeeks: 2 },
      { title: "Facilitation Skills", description: "Learn to facilitate ceremonies", tasks: ["Practice running daily standups", "Design sprint planning sessions", "Learn retrospective formats"], estimatedWeeks: 3 },
      { title: "Coaching Skills", description: "Develop team coaching abilities", tasks: ["Study coaching techniques", "Practice active listening", "Learn conflict resolution"], estimatedWeeks: 3 },
      { title: "Tools & Metrics", description: "Master Scrum tools", tasks: ["Learn Jira administration", "Track velocity and burndown", "Create team dashboards"], estimatedWeeks: 2 },
      { title: "Certification", description: "Get certified", tasks: ["Study for PSM I exam", "Take practice assessments", "Pass the PSM I certification"], estimatedWeeks: 3 },
      { title: "Job Search", description: "Apply for Scrum Master roles", tasks: ["Highlight facilitation experience", "Apply to 10+ positions", "Practice Scrum scenario interviews"], estimatedWeeks: 4 },
    ],
  },

  // 19. Technical Program Manager
  {
    id: "technical-program-manager", title: "Technical Program Manager", domain: "Technology",
    description: "Drive cross-team technical programs from planning through delivery.",
    interests: ["enterprising", "investigative"], problemTypes: ["organizational", "technical"], archetypes: ["coordinator", "strategist"],
    workStyles: ["organized", "collaborative"], decisionStyle: ["thinking", "pragmatic"], collaboration: ["team"],
    ambiguityStyle: ["structure", "clarify"], coreValues: ["impact", "leadership"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["misaligned_teams", "unclear_ownership"], rewards: ["completion", "impact"],
    environments: ["hybrid", "office"], teamSizes: ["large", "medium"], paces: ["fast", "steady"],
    managementStyles: ["collaborative", "directive"], careerStages: ["advancing", "building"],
    riskLevels: ["moderate"], trajectories: ["leader"],
    groupRoles: ["coordinator", "connector"], requiredSkills: ["Program Management", "Technical Knowledge", "Stakeholder Mgmt", "Risk Mgmt", "Communication"],
    experienceLevels: ["mid", "senior"], domains: ["Technology", "Product Management"],
    pathwayTime: "6-12 months",
    skillGaps: [
      { skill: "Program Management", importance: "high", learningResource: "Google Project Management Certificate" },
      { skill: "Technical Architecture", importance: "high", learningResource: "System Design Primer (GitHub)" },
      { skill: "Stakeholder Communication", importance: "medium", learningResource: "Crucial Conversations (book)" },
    ],
    certifications: [
      { skill: "Program Mgmt", certName: "PgMP (Program Management Professional)", provider: "PMI", url: "https://www.pmi.org/certifications/program-management-pgmp", duration: "4 months", level: "Advanced", cost: "$555", whyRecommended: "Top program management credential" },
      { skill: "Technical PM", certName: "Google Project Management Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-project-management", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Strong PM foundation" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Cross-Team Program Plan", description: "Design a program plan for a multi-team initiative.", why: "Core TPM deliverable.", actionStep: "Create a program charter and RACI matrix." },
      { type: "portfolio", title: "Technical Roadmap", description: "Build a technical roadmap with dependencies.", why: "Shows technical and planning skills.", actionStep: "Map out a 6-month technical program." },
    ],
    networkingRecs: [
      { type: "networking", title: "TPM Community (Rands)", description: "Rands Leadership Slack has a TPM channel.", platform: "Slack", url: "https://randsinrepose.com/welcome-to-rands-leadership-slack/", why: "Connect with TPMs at top companies.", actionStep: "Join and introduce yourself in #tpm." },
      { type: "networking", title: "PMI Events", description: "Project Management Institute events.", platform: "PMI", url: "https://www.pmi.org/events", why: "Professional development and networking.", actionStep: "Attend a virtual PMI event." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn TPM Jobs", description: "Search for Technical Program Manager roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most TPM roles listed here.", actionStep: "Apply to 3 TPM roles this week." },
      { type: "job_application", title: "Hired", description: "Platform for tech roles.", platform: "Hired", url: "https://hired.com/", why: "TPMs are in high demand.", actionStep: "Create a profile highlighting technical programs." },
    ],
    milestones: [
      { title: "PM Foundations", description: "Build core project management skills", tasks: ["Complete Google PM certificate", "Learn program vs project management", "Study governance frameworks"], estimatedWeeks: 4 },
      { title: "Technical Depth", description: "Build technical understanding", tasks: ["Study system design basics", "Learn software development lifecycle", "Understand CI/CD and architecture"], estimatedWeeks: 4 },
      { title: "Stakeholder Management", description: "Master cross-team coordination", tasks: ["Practice RACI creation", "Learn executive communication", "Study influence without authority"], estimatedWeeks: 3 },
      { title: "Risk & Dependencies", description: "Manage complex programs", tasks: ["Create dependency maps", "Build risk mitigation plans", "Practice program status reporting"], estimatedWeeks: 3 },
      { title: "Portfolio", description: "Build TPM portfolio", tasks: ["Document a program case study", "Create program templates", "Get endorsements from peers"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for TPM roles", tasks: ["Tailor resume for TPM", "Apply to 10+ positions", "Practice behavioral interviews"], estimatedWeeks: 4 },
    ],
  },

  // 20. Digital Marketer
  {
    id: "digital-marketer", title: "Digital Marketer", domain: "Marketing",
    description: "Plan and execute digital marketing campaigns across channels.",
    interests: ["enterprising", "artistic"], problemTypes: ["creative", "business"], archetypes: ["strategist", "creator"],
    workStyles: ["open", "collaborative"], decisionStyle: ["intuitive", "thinking"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["experiment", "explore"], coreValues: ["creativity", "impact"], tradeoffs: ["growth_over_comfort"],
    frustrations: ["vanity_metrics", "budget_cuts"], rewards: ["creativity", "results"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "collaborative"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "high"], trajectories: ["generalist", "leader"],
    groupRoles: ["ideator", "doer"], requiredSkills: ["Google Ads", "Social Media", "Analytics", "Email Marketing", "Content Strategy"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Marketing"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Google Ads", importance: "high", learningResource: "Google Skillshop" },
      { skill: "Analytics", importance: "high", learningResource: "Google Analytics Academy" },
      { skill: "Email Marketing", importance: "medium", learningResource: "Mailchimp resources" },
    ],
    certifications: [
      { skill: "Digital Marketing", certName: "Google Digital Marketing Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Comprehensive digital marketing path" },
      { skill: "Ads", certName: "Google Ads Certification", provider: "Google Skillshop", url: "https://skillshop.withgoogle.com/", duration: "1 month", level: "Beginner", cost: "Free", whyRecommended: "Essential Google Ads credential" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Marketing Campaign Plan", description: "Design a multi-channel marketing campaign.", why: "Shows strategic marketing thinking.", actionStep: "Pick a product and create a campaign brief." },
      { type: "portfolio", title: "Landing Page A/B Test", description: "Create and test two landing page variants.", why: "Demonstrates data-driven marketing.", actionStep: "Build a landing page with Google Optimize." },
    ],
    networkingRecs: [
      { type: "networking", title: "Marketing Twitter/X", description: "Follow top marketing voices.", platform: "Twitter/X", url: "https://twitter.com/", why: "Stay current with marketing trends.", actionStep: "Follow 10 marketing leaders and engage." },
      { type: "networking", title: "GrowthHackers Community", description: "Growth marketing community.", platform: "Web", url: "https://growthhackers.com/", why: "Learn growth marketing strategies.", actionStep: "Read 3 top posts and comment." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Marketing Jobs", description: "Search for Digital Marketing roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most marketing roles posted here.", actionStep: "Apply to 3 digital marketing roles." },
      { type: "job_application", title: "Indeed", description: "Broad marketing job listings.", platform: "Indeed", url: "https://www.indeed.com/", why: "Many entry-level marketing roles.", actionStep: "Set alerts for 'Digital Marketer'." },
    ],
    milestones: [
      { title: "Marketing Fundamentals", description: "Learn core digital marketing concepts", tasks: ["Complete Google Digital Marketing cert", "Study the marketing funnel", "Learn key marketing metrics"], estimatedWeeks: 4 },
      { title: "Paid Advertising", description: "Master Google and social ads", tasks: ["Get Google Ads certified", "Run a practice campaign", "Learn Facebook Ads basics"], estimatedWeeks: 3 },
      { title: "Analytics & SEO", description: "Learn to measure and optimize", tasks: ["Set up Google Analytics", "Learn SEO fundamentals", "Build a reporting dashboard"], estimatedWeeks: 3 },
      { title: "Email & Content", description: "Learn email and content marketing", tasks: ["Set up an email campaign", "Write 5 marketing emails", "Create a content calendar"], estimatedWeeks: 3 },
      { title: "Portfolio Campaigns", description: "Build marketing portfolio", tasks: ["Document a campaign strategy", "Create sample ad creatives", "Write case study results"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for marketing roles", tasks: ["Polish LinkedIn for marketing", "Apply to 10+ positions", "Prepare marketing interview presentations"], estimatedWeeks: 4 },
    ],
  },

  // 21. Content Strategist
  {
    id: "content-strategist", title: "Content Strategist", domain: "Marketing",
    description: "Plan and manage content that drives engagement and business goals.",
    interests: ["artistic", "social"], problemTypes: ["creative", "business"], archetypes: ["creator", "strategist"],
    workStyles: ["open", "organized"], decisionStyle: ["intuitive", "thinking"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["explore", "experiment"], coreValues: ["creativity", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["content_mills", "no_strategy"], rewards: ["creativity", "influence"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "collaborative"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "generalist"],
    groupRoles: ["ideator", "presenter"], requiredSkills: ["Writing", "SEO", "Content Planning", "Analytics", "CMS"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Marketing", "Media & Entertainment"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Content Strategy", importance: "high", learningResource: "Content Strategy for the Web (book)" },
      { skill: "SEO Writing", importance: "high", learningResource: "Yoast SEO blog" },
      { skill: "Analytics", importance: "medium", learningResource: "Google Analytics Academy" },
    ],
    certifications: [
      { skill: "Content", certName: "HubSpot Content Marketing Certification", provider: "HubSpot", url: "https://academy.hubspot.com/courses/content-marketing", duration: "1 month", level: "Beginner", cost: "Free", whyRecommended: "Respected content marketing credential" },
      { skill: "Digital Marketing", certName: "Google Digital Marketing Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Broad digital marketing skills" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Content Strategy Plan", description: "Create a content strategy for a brand.", why: "Core deliverable for content strategists.", actionStep: "Pick a brand and audit their current content." },
      { type: "portfolio", title: "Blog Series", description: "Write and publish a 5-part blog series.", why: "Shows writing skill and consistency.", actionStep: "Choose a topic and outline 5 posts." },
    ],
    networkingRecs: [
      { type: "networking", title: "Content Marketing Institute", description: "Leading content marketing community.", platform: "Web", url: "https://contentmarketinginstitute.com/", why: "Industry-standard content resources.", actionStep: "Subscribe to the newsletter." },
      { type: "networking", title: "Superpath", description: "Content marketing community.", platform: "Slack", url: "https://www.superpath.co/", why: "Connect with content professionals.", actionStep: "Join the Slack community." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Content Jobs", description: "Search for Content Strategist roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most content roles listed here.", actionStep: "Apply to 3 content strategist roles." },
      { type: "job_application", title: "MediaBistro", description: "Media and content job board.", platform: "MediaBistro", url: "https://www.mediabistro.com/", why: "Specialized content and media roles.", actionStep: "Browse and apply to 2 roles." },
    ],
    milestones: [
      { title: "Writing Foundations", description: "Sharpen core writing skills", tasks: ["Complete a copywriting course", "Write 10 blog posts", "Learn headline and CTA writing"], estimatedWeeks: 3 },
      { title: "SEO & Analytics", description: "Learn SEO and content measurement", tasks: ["Complete SEO fundamentals course", "Learn Google Analytics", "Do keyword research for 3 topics"], estimatedWeeks: 3 },
      { title: "Content Strategy", description: "Learn strategic content planning", tasks: ["Study content strategy frameworks", "Create a content audit template", "Build a content calendar"], estimatedWeeks: 3 },
      { title: "CMS & Tools", description: "Master content management tools", tasks: ["Learn WordPress or similar CMS", "Use SEO tools like Ahrefs", "Set up content workflows"], estimatedWeeks: 3 },
      { title: "Portfolio", description: "Build content portfolio", tasks: ["Publish a 5-part blog series", "Create a content strategy doc", "Build a portfolio website"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for content roles", tasks: ["Get HubSpot content certification", "Apply to 10+ positions", "Prepare writing samples"], estimatedWeeks: 4 },
    ],
  },

  // 22. SEO Specialist
  {
    id: "seo-specialist", title: "SEO Specialist", domain: "Marketing",
    description: "Optimize websites to rank higher in search engines and drive organic traffic.",
    interests: ["investigative", "enterprising"], problemTypes: ["analytical", "technical"], archetypes: ["optimizer", "analyst"],
    workStyles: ["methodical", "organized"], decisionStyle: ["analytical", "thinking"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["mastery", "results"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["algorithm_changes", "slow_results"], rewards: ["results", "learning"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "low"], trajectories: ["specialist"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["Technical SEO", "Keyword Research", "Content Optimization", "Analytics", "Link Building"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Marketing", "E-commerce"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Technical SEO", importance: "high", learningResource: "Google Search Central docs" },
      { skill: "Keyword Research", importance: "high", learningResource: "Ahrefs Academy" },
      { skill: "Content Optimization", importance: "medium", learningResource: "Moz Beginner's Guide to SEO" },
    ],
    certifications: [
      { skill: "SEO", certName: "Google SEO Fundamentals", provider: "Coursera/UC Davis", url: "https://www.coursera.org/learn/seo-fundamentals", duration: "2 months", level: "Beginner", cost: "$49/month", whyRecommended: "University-backed SEO training" },
      { skill: "SEO", certName: "HubSpot SEO Certification", provider: "HubSpot", url: "https://academy.hubspot.com/courses/seo-training", duration: "1 month", level: "Beginner", cost: "Free", whyRecommended: "Free respected SEO credential" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "SEO Audit Report", description: "Conduct a full SEO audit of a website.", why: "Core deliverable for SEO specialists.", actionStep: "Audit a small website using Screaming Frog." },
      { type: "portfolio", title: "Keyword Strategy", description: "Create a keyword strategy for a niche.", why: "Shows research and strategic skills.", actionStep: "Research keywords for a topic with free tools." },
    ],
    networkingRecs: [
      { type: "networking", title: "SEO Twitter/X", description: "Follow SEO practitioners on Twitter.", platform: "Twitter/X", url: "https://twitter.com/", why: "SEO news breaks on Twitter first.", actionStep: "Follow 10 SEO experts and engage." },
      { type: "networking", title: "r/SEO", description: "Reddit SEO community.", platform: "Reddit", url: "https://www.reddit.com/r/SEO/", why: "Practical SEO advice and discussions.", actionStep: "Read top posts and ask a question." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn SEO Jobs", description: "Search for SEO Specialist roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most SEO roles listed here.", actionStep: "Apply to 3 SEO roles this week." },
      { type: "job_application", title: "Indeed", description: "Broad SEO job listings.", platform: "Indeed", url: "https://www.indeed.com/", why: "Many agencies hiring SEO specialists.", actionStep: "Set alerts for 'SEO Specialist'." },
    ],
    milestones: [
      { title: "SEO Fundamentals", description: "Learn how search engines work", tasks: ["Read Moz Beginner's Guide to SEO", "Study Google Search Central docs", "Understand crawling and indexing"], estimatedWeeks: 2 },
      { title: "Keyword Research", description: "Master keyword research", tasks: ["Learn to use Ahrefs or SEMrush", "Research keywords for 3 niches", "Understand search intent"], estimatedWeeks: 3 },
      { title: "Technical SEO", description: "Learn technical optimization", tasks: ["Run a site audit with Screaming Frog", "Fix common technical issues", "Learn schema markup"], estimatedWeeks: 3 },
      { title: "Content & On-Page SEO", description: "Optimize content for search", tasks: ["Optimize 5 existing pages", "Write 3 SEO-optimized articles", "Learn internal linking strategies"], estimatedWeeks: 3 },
      { title: "Link Building", description: "Learn off-page SEO", tasks: ["Study link building strategies", "Conduct outreach for 1 project", "Analyze competitor backlinks"], estimatedWeeks: 3 },
      { title: "Job Search", description: "Apply for SEO roles", tasks: ["Get HubSpot SEO certification", "Apply to 10+ positions", "Prepare SEO case studies"], estimatedWeeks: 4 },
    ],
  },

  // 23. Growth Hacker
  {
    id: "growth-hacker", title: "Growth Hacker", domain: "Marketing",
    description: "Drive rapid user acquisition and revenue growth through experimentation.",
    interests: ["enterprising", "investigative"], problemTypes: ["business", "analytical"], archetypes: ["optimizer", "explorer"],
    workStyles: ["open", "fast-paced"], decisionStyle: ["thinking", "pragmatic"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "explore"], coreValues: ["results", "innovation"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["slow_bureaucracy", "no_data_access"], rewards: ["results", "learning"],
    environments: ["remote", "hybrid"], teamSizes: ["small"], paces: ["fast", "burst"],
    managementStyles: ["handsoff"], careerStages: ["building", "exploring"],
    riskLevels: ["high", "moderate"], trajectories: ["generalist", "leader"],
    groupRoles: ["ideator", "doer"], requiredSkills: ["Analytics", "A/B Testing", "Paid Ads", "SQL", "Product Sense"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Marketing", "E-commerce"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "A/B Testing", importance: "high", learningResource: "Optimizely Academy" },
      { skill: "Analytics & SQL", importance: "high", learningResource: "Mode Analytics SQL tutorial" },
      { skill: "Paid Acquisition", importance: "medium", learningResource: "Google Skillshop" },
    ],
    certifications: [
      { skill: "Growth", certName: "Reforge Growth Series", provider: "Reforge", url: "https://www.reforge.com/growth-series", duration: "2 months", level: "Intermediate", cost: "$1995/year", whyRecommended: "Gold standard growth program" },
      { skill: "Analytics", certName: "Google Analytics Certification", provider: "Google Skillshop", url: "https://skillshop.withgoogle.com/", duration: "1 month", level: "Beginner", cost: "Free", whyRecommended: "Essential analytics credential" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Growth Experiment Doc", description: "Document a growth experiment with hypothesis and results.", why: "Shows experimental mindset and data skills.", actionStep: "Run an A/B test on a landing page." },
      { type: "portfolio", title: "Funnel Analysis", description: "Analyze a product funnel and propose improvements.", why: "Demonstrates analytical growth thinking.", actionStep: "Map a product's conversion funnel." },
    ],
    networkingRecs: [
      { type: "networking", title: "GrowthHackers Community", description: "Largest growth marketing community.", platform: "Web", url: "https://growthhackers.com/", why: "Learn from growth practitioners.", actionStep: "Read 5 top experiments and comment." },
      { type: "networking", title: "Demand Curve", description: "Growth marketing newsletter and community.", platform: "Web", url: "https://www.demandcurve.com/", why: "Actionable growth playbooks.", actionStep: "Subscribe and read the growth guide." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Growth Jobs", description: "Search for Growth roles at startups.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Many startup growth roles here.", actionStep: "Apply to 3 growth roles this week." },
      { type: "job_application", title: "Wellfound", description: "Startup job board.", platform: "Wellfound", url: "https://wellfound.com/", why: "Startups actively hire growth hackers.", actionStep: "Apply to 2 startup growth roles." },
    ],
    milestones: [
      { title: "Growth Fundamentals", description: "Learn growth frameworks", tasks: ["Study AARRR pirate metrics", "Learn growth loop models", "Read 'Hacking Growth' book"], estimatedWeeks: 2 },
      { title: "Analytics & Data", description: "Master data-driven decisions", tasks: ["Learn Google Analytics", "Study SQL basics", "Build a metrics dashboard"], estimatedWeeks: 3 },
      { title: "Experimentation", description: "Run growth experiments", tasks: ["Learn A/B testing methodology", "Run 3 experiments", "Document results systematically"], estimatedWeeks: 4 },
      { title: "Acquisition Channels", description: "Master growth channels", tasks: ["Learn paid ads basics", "Study SEO for growth", "Explore viral and referral loops"], estimatedWeeks: 3 },
      { title: "Portfolio", description: "Build growth portfolio", tasks: ["Document 3 growth experiments", "Create a funnel analysis", "Write a growth strategy doc"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply for growth roles", tasks: ["Get Google Analytics certified", "Apply to 10+ positions", "Prepare growth case study presentations"], estimatedWeeks: 4 },
    ],
  },

  // 24. Social Media Manager
  {
    id: "social-media-manager", title: "Social Media Manager", domain: "Marketing",
    description: "Manage brand presence and engagement across social media platforms.",
    interests: ["artistic", "social"], problemTypes: ["creative", "communication"], archetypes: ["creator", "connector"],
    workStyles: ["open", "collaborative"], decisionStyle: ["intuitive", "feeling"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["experiment", "explore"], coreValues: ["creativity", "connection"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["algorithm_changes", "content_burnout"], rewards: ["creativity", "engagement"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "collaborative"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["generalist", "specialist"],
    groupRoles: ["ideator", "presenter"], requiredSkills: ["Content Creation", "Copywriting", "Analytics", "Community Mgmt", "Paid Social"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Marketing", "Media & Entertainment"],
    pathwayTime: "2-4 months",
    skillGaps: [
      { skill: "Content Creation", importance: "high", learningResource: "Canva Design School" },
      { skill: "Social Analytics", importance: "high", learningResource: "Meta Blueprint" },
      { skill: "Community Management", importance: "medium", learningResource: "Sprout Social resources" },
    ],
    certifications: [
      { skill: "Social Media", certName: "Meta Social Media Marketing Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/facebook-social-media-marketing", duration: "5 months", level: "Beginner", cost: "$49/month", whyRecommended: "Meta-backed social media credential" },
      { skill: "Social", certName: "HubSpot Social Media Certification", provider: "HubSpot", url: "https://academy.hubspot.com/courses/social-media", duration: "1 month", level: "Beginner", cost: "Free", whyRecommended: "Free social media marketing cert" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Social Media Strategy", description: "Create a 30-day social media plan for a brand.", why: "Core deliverable for social media roles.", actionStep: "Pick a brand and create a content calendar." },
      { type: "portfolio", title: "Content Portfolio", description: "Create 20 sample social media posts with graphics.", why: "Shows content creation skills.", actionStep: "Design 5 posts in Canva today." },
    ],
    networkingRecs: [
      { type: "networking", title: "Social Media Examiner", description: "Leading social media marketing resource.", platform: "Web", url: "https://www.socialmediaexaminer.com/", why: "Stay updated on social media trends.", actionStep: "Subscribe to the podcast." },
      { type: "networking", title: "LinkedIn Marketing Groups", description: "Social media professional groups.", platform: "LinkedIn", url: "https://www.linkedin.com/groups/", why: "Connect with other social media managers.", actionStep: "Join 2 groups and share insights." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Social Media Jobs", description: "Search for Social Media Manager roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most social media roles listed here.", actionStep: "Apply to 3 social media roles." },
      { type: "job_application", title: "MediaBistro", description: "Media and marketing job board.", platform: "MediaBistro", url: "https://www.mediabistro.com/", why: "Social media roles at media companies.", actionStep: "Browse and apply to 2 roles." },
    ],
    milestones: [
      { title: "Social Media Basics", description: "Learn platform best practices", tasks: ["Study each major platform's features", "Learn posting best practices", "Understand social media algorithms"], estimatedWeeks: 2 },
      { title: "Content Creation", description: "Master content creation tools", tasks: ["Learn Canva for graphics", "Practice short-form video editing", "Write 20 social media captions"], estimatedWeeks: 3 },
      { title: "Strategy & Planning", description: "Build social media strategies", tasks: ["Create a content calendar template", "Learn social media scheduling tools", "Study competitor social strategies"], estimatedWeeks: 3 },
      { title: "Analytics & Paid", description: "Learn measurement and paid social", tasks: ["Learn social media analytics tools", "Run a practice paid campaign", "Build a reporting template"], estimatedWeeks: 3 },
      { title: "Portfolio", description: "Build social media portfolio", tasks: ["Create a 30-day content plan", "Build a content creation portfolio", "Document campaign results"], estimatedWeeks: 3 },
      { title: "Job Search", description: "Apply for social media roles", tasks: ["Get Meta social media cert", "Apply to 10+ positions", "Prepare content samples"], estimatedWeeks: 4 },
    ],
  },

  // 25. Management Consultant
  {
    id: "management-consultant", title: "Management Consultant", domain: "Consulting",
    description: "Advise organizations on strategy, operations, and organizational challenges.",
    interests: ["enterprising", "investigative"], problemTypes: ["strategic", "business"], archetypes: ["strategist", "advisor"],
    workStyles: ["organized", "collaborative"], decisionStyle: ["analytical", "thinking"], collaboration: ["team"],
    ambiguityStyle: ["structure", "clarify"], coreValues: ["impact", "mastery"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["politics", "slow_implementation"], rewards: ["problem_solving", "variety"],
    environments: ["office", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast"],
    managementStyles: ["mentorship", "collaborative"], careerStages: ["exploring", "building", "advancing"],
    riskLevels: ["moderate", "high"], trajectories: ["leader", "generalist"],
    groupRoles: ["analyst", "presenter"], requiredSkills: ["Problem Solving", "Data Analysis", "Presentation", "Excel/Modeling", "Communication"],
    experienceLevels: ["student", "junior", "mid", "senior"], domains: ["Consulting", "Finance"],
    pathwayTime: "4-8 months",
    skillGaps: [
      { skill: "Case Interview Prep", importance: "high", learningResource: "Case in Point (book)" },
      { skill: "Financial Modeling", importance: "high", learningResource: "Wall Street Prep free resources" },
      { skill: "Slide Storytelling", importance: "medium", learningResource: "McKinsey presentation guides" },
    ],
    certifications: [
      { skill: "Consulting", certName: "McKinsey Forward Program", provider: "McKinsey", url: "https://www.mckinsey.com/forward/overview", duration: "2 months", level: "Beginner", cost: "Free", whyRecommended: "Free McKinsey problem-solving training" },
      { skill: "Business", certName: "Business Strategy Specialization", provider: "Coursera/UVA", url: "https://www.coursera.org/specializations/business-strategy", duration: "4 months", level: "Intermediate", cost: "$49/month", whyRecommended: "Strategy fundamentals from top school" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Strategy Case Study", description: "Analyze a company's strategy and propose recommendations.", why: "Shows structured problem-solving skills.", actionStep: "Pick a public company and analyze their strategy." },
      { type: "portfolio", title: "Market Sizing Exercise", description: "Complete 5 market sizing problems with documentation.", why: "Core consulting skill for interviews.", actionStep: "Practice 1 market sizing problem per day." },
    ],
    networkingRecs: [
      { type: "networking", title: "Management Consulted", description: "Consulting career community.", platform: "Web", url: "https://managementconsulted.com/", why: "Consulting recruiting resources.", actionStep: "Read the consulting recruiting guide." },
      { type: "networking", title: "LinkedIn Consulting Groups", description: "Consulting professional groups.", platform: "LinkedIn", url: "https://www.linkedin.com/groups/", why: "Network with consultants.", actionStep: "Join 2 groups and engage." },
    ],
    jobTargets: [
      { type: "job_application", title: "Firm Career Pages", description: "Apply directly to consulting firms.", platform: "Web", url: "https://www.mckinsey.com/careers", why: "Direct applications preferred by firms.", actionStep: "Apply to 3 consulting firms." },
      { type: "job_application", title: "LinkedIn Consulting Jobs", description: "Search for consulting roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Boutique firms post here.", actionStep: "Apply to 3 consulting roles." },
    ],
    milestones: [
      { title: "Problem Solving Frameworks", description: "Learn structured thinking", tasks: ["Read 'Case in Point'", "Practice issue trees and MECE", "Complete 10 case frameworks"], estimatedWeeks: 3 },
      { title: "Quantitative Skills", description: "Build analytical foundation", tasks: ["Learn Excel modeling", "Practice market sizing", "Study basic accounting and finance"], estimatedWeeks: 4 },
      { title: "Communication", description: "Master consulting communication", tasks: ["Learn pyramid principle writing", "Build a slide deck", "Practice executive presentations"], estimatedWeeks: 3 },
      { title: "Case Interview Prep", description: "Prepare for case interviews", tasks: ["Complete 20 practice cases", "Find a case partner", "Practice mental math"], estimatedWeeks: 4 },
      { title: "Industry Knowledge", description: "Build business acumen", tasks: ["Read business news daily", "Study 3 industry analyses", "Write a company strategy memo"], estimatedWeeks: 4 },
      { title: "Job Search", description: "Apply to consulting firms", tasks: ["Network with consultants", "Apply to 10+ firms", "Practice behavioral interviews"], estimatedWeeks: 4 },
    ],
  },
];
