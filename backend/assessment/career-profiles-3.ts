import type { CareerProfile } from "./career-profiles";

export const CAREER_PROFILES_3: CareerProfile[] = [

  // ── LAW ────────────────────────────────────────────────────────────────

  // 1. Lawyer
  {
    id: "lawyer", title: "Lawyer", domain: "Law & Policy",
    description: "Advise clients and represent them in legal matters, from contracts and litigation to regulatory compliance.",
    interests: ["investigative", "enterprising"], problemTypes: ["analytical", "strategic"], archetypes: ["thinker", "advocate"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["prestige", "mastery"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["unclear_requirements", "no_impact"], rewards: ["recognition", "impact"],
    environments: ["onsite", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["leader", "analyst"], requiredSkills: ["Legal Research", "Contract Drafting", "Negotiation", "Oral Advocacy", "Client Counseling"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Law & Policy", "Consulting"],
    pathwayTime: "3-7 years (JD required)",
    skillGaps: [
      { skill: "Legal Research", importance: "high", learningResource: "Westlaw and LexisNexis tutorials via law school access" },
      { skill: "Contract Drafting", importance: "high", learningResource: "American Bar Association Contract Drafting courses" },
      { skill: "Oral Advocacy", importance: "high", learningResource: "National Institute for Trial Advocacy (NITA) programs" },
      { skill: "Legal Writing", importance: "medium", learningResource: "Plain English for Lawyers by Richard Wydick" },
    ],
    certifications: [
      { skill: "Law", certName: "Juris Doctor (JD)", provider: "ABA-accredited law school", url: "https://www.americanbar.org/groups/legal_education/resources/aba_approved_law_schools/", duration: "3 years full-time", level: "Graduate", cost: "$30,000–$70,000/year", whyRecommended: "Required to practice law in all US states" },
      { skill: "Bar Exam", certName: "Uniform Bar Exam (UBE)", provider: "National Conference of Bar Examiners", url: "https://www.ncbex.org/exams/ube/", duration: "2-day exam", level: "Professional Licensure", cost: "$500–$1,000", whyRecommended: "Required licensure to practice law; UBE score is portable across many states" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Law Review Article", description: "Write a publishable legal note or comment on a timely legal issue for your school's law review.", why: "Demonstrates research and writing ability; strong credential for firm hiring.", actionStep: "Identify a circuit split or emerging legal issue and write a 15-page analysis." },
      { type: "portfolio", title: "Moot Court Brief", description: "Compete in a moot court competition and include the brief in application materials.", why: "Signals oral advocacy skills and competitive drive to hiring partners.", actionStep: "Sign up for your school's moot court competition or a regional ABA competition." },
    ],
    networkingRecs: [
      { type: "networking", title: "American Bar Association (ABA)", description: "Join ABA and its relevant section (e.g., Litigation, Business Law).", platform: "ABA", url: "https://www.americanbar.org/", why: "Access to CLE events, mentors, and the nation's largest legal network.", actionStep: "Join ABA as a law student member at reduced cost and attend one CLE webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "NALP Attorney Job Board", description: "The National Association for Law Placement posts associate and clerkship openings.", platform: "NALP", url: "https://www.nalp.org/", why: "Purpose-built for law graduates seeking entry-level and lateral positions.", actionStep: "Create a profile and apply to 5 associate positions or one judicial clerkship." },
    ],
    milestones: [
      { title: "Law School Foundation", description: "Survive 1L and build core legal skills", tasks: ["Pass all 1L courses (Contracts, Torts, Civil Procedure, Property, Con Law)", "Join a law journal or moot court team", "Secure a summer associate position"], estimatedWeeks: 52 },
      { title: "Specialization & Internships", description: "Develop practice-area expertise through clinical work", tasks: ["Complete a legal clinic (criminal defense, civil rights, etc.)", "Secure a 2L summer associate position at a firm or government agency", "Publish a law review note or comment"], estimatedWeeks: 52 },
      { title: "Bar Exam & Licensure", description: "Pass the bar and enter the profession", tasks: ["Complete Barbri or Themis bar prep course", "Pass the Multistate Professional Responsibility Exam (MPRE)", "Pass the state bar exam"], estimatedWeeks: 16 },
    ],
  },

  // 2. Paralegal
  {
    id: "paralegal", title: "Paralegal", domain: "Law & Policy",
    description: "Assist attorneys with legal research, document preparation, case management, and client communication.",
    interests: ["investigative", "conventional"], problemTypes: ["analytical", "technical"], archetypes: ["optimizer", "thinker"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["structure"], coreValues: ["mastery", "purpose"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "monotony"], rewards: ["learning", "recognition"],
    environments: ["onsite", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["mentorship", "targets"], careerStages: ["exploring", "building"],
    riskLevels: ["low"], trajectories: ["specialist"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Legal Research", "Document Management", "Case Management Software", "Legal Writing", "Client Communication"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Law & Policy"],
    pathwayTime: "1-2 years",
    skillGaps: [
      { skill: "Legal Research", importance: "high", learningResource: "Paralegal Studies textbooks; free LexisNexis academic access" },
      { skill: "Case Management Software", importance: "high", learningResource: "Clio Academy (free training for Clio practice management)" },
      { skill: "Legal Writing", importance: "medium", learningResource: "NALA Paralegal Certification study materials" },
    ],
    certifications: [
      { skill: "Paralegal", certName: "Certified Paralegal (CP)", provider: "NALA – The Paralegal Association", url: "https://nala.org/certification/", duration: "Self-study, exam in 1 day", level: "Professional", cost: "$250 (NALA members) / $370 (non-members)", whyRecommended: "Most widely recognized paralegal credential in the US" },
      { skill: "Paralegal", certName: "Advanced Paralegal Certificate (APC)", provider: "NALA", url: "https://nala.org/certification/advanced-paralegal-certification/", duration: "Online self-paced", level: "Advanced", cost: "$175–$275 per specialty", whyRecommended: "Specialty credential for litigation, contracts, or corporate law" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Legal Research Memo", description: "Draft a research memo analyzing a legal question and cite primary/secondary sources.", why: "Directly mirrors the core daily task of a paralegal and demonstrates competency.", actionStep: "Pick a recent court case from Google Scholar and write a 3-page analysis." },
      { type: "portfolio", title: "Sample Pleadings Packet", description: "Create a set of sample litigation documents (complaint, answer, discovery requests) using court form templates.", why: "Shows practical document-drafting skills employers look for immediately.", actionStep: "Download court forms from your state's judicial website and complete a set." },
    ],
    networkingRecs: [
      { type: "networking", title: "NALA Community", description: "Join NALA's online community and local affiliate for networking and CLE.", platform: "NALA", url: "https://nala.org/", why: "Direct access to paralegal-specific jobs, mentors, and continuing education.", actionStep: "Create a free NALA account and join your state's paralegal association." },
    ],
    jobTargets: [
      { type: "job_application", title: "Robert Half Legal", description: "Specialized legal staffing agency placing paralegals in firms and corporate law departments.", platform: "Robert Half", url: "https://www.roberthalf.com/us/en/legal", why: "The largest legal staffing firm; high placement rate for paralegals.", actionStep: "Submit your resume and request a consultation with a legal recruiter." },
    ],
    milestones: [
      { title: "Paralegal Certificate Program", description: "Complete accredited paralegal education", tasks: ["Enroll in an ABA-approved paralegal certificate program", "Complete legal research and writing coursework", "Complete an internship at a law firm"], estimatedWeeks: 32 },
      { title: "Certification & Job Search", description: "Earn credential and land first role", tasks: ["Study for and pass the NALA CP exam", "Create a resume with legal research and writing samples", "Apply to 10 law firm or corporate legal department positions"], estimatedWeeks: 12 },
      { title: "First Year Practice", description: "Grow competency in a live legal environment", tasks: ["Master the firm's case management software", "Draft 10+ substantive legal documents", "Request mentorship from a supervising attorney"], estimatedWeeks: 52 },
    ],
  },

  // 3. Compliance Officer
  {
    id: "compliance-officer", title: "Compliance Officer", domain: "Law & Policy",
    description: "Ensure that organizations operate within legal, regulatory, and ethical frameworks by developing and enforcing policies.",
    interests: ["investigative", "conventional"], problemTypes: ["analytical", "strategic"], archetypes: ["optimizer", "thinker"],
    workStyles: ["cautious", "organized"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["purpose", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "tech_debt"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["targets", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "manager"],
    groupRoles: ["analyst", "leader"], requiredSkills: ["Regulatory Knowledge", "Risk Assessment", "Policy Writing", "Audit Management", "Data Privacy (GDPR/CCPA)"],
    experienceLevels: ["mid", "senior"], domains: ["Law & Policy", "Finance", "Healthcare"],
    pathwayTime: "2-4 years",
    skillGaps: [
      { skill: "Regulatory Frameworks (GDPR, SOX, HIPAA)", importance: "high", learningResource: "IAPP Privacy Law training; COSO framework guides" },
      { skill: "Risk Assessment", importance: "high", learningResource: "RIMS Risk Management fundamentals course" },
      { skill: "Policy Writing", importance: "medium", learningResource: "SCCE Compliance & Ethics training library" },
    ],
    certifications: [
      { skill: "Compliance", certName: "Certified Compliance & Ethics Professional (CCEP)", provider: "Society of Corporate Compliance and Ethics (SCCE)", url: "https://www.corporatecompliance.org/certifications", duration: "Self-study + exam", level: "Professional", cost: "$400–$600", whyRecommended: "Gold standard compliance credential recognized across industries" },
      { skill: "Data Privacy", certName: "Certified Information Privacy Professional (CIPP/US)", provider: "IAPP", url: "https://iapp.org/certify/cipp/", duration: "Self-study + exam", level: "Professional", cost: "$550 (members) / $650 (non-members)", whyRecommended: "Essential for compliance roles with data privacy responsibilities" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Compliance Risk Matrix", description: "Build a regulatory risk matrix mapping applicable laws to business functions and rating risk levels.", why: "Directly demonstrates the analytical framework compliance officers use daily.", actionStep: "Select a mid-size company (use public filings) and map their top 10 compliance risks." },
      { type: "portfolio", title: "Internal Policy Draft", description: "Draft a sample data privacy or anti-corruption policy suitable for a mid-size company.", why: "Shows policy-writing competency, a core hiring criterion.", actionStep: "Use GDPR Article 30 requirements as a framework and draft a data processing policy." },
    ],
    networkingRecs: [
      { type: "networking", title: "SCCE Compliance Community", description: "Join SCCE for access to webinars, conferences, and peer discussion forums.", platform: "SCCE", url: "https://www.corporatecompliance.org/", why: "Largest compliance professional community; job board and mentorship available.", actionStep: "Attend one free SCCE webinar and connect with speakers on LinkedIn." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Compliance Jobs", description: "Search for Compliance Officer, Risk & Compliance Analyst, or Chief Compliance Officer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most compliance roles are posted on LinkedIn due to the professional nature of the field.", actionStep: "Set job alerts for 'Compliance Officer' and apply to 3 roles in your target industry." },
    ],
    milestones: [
      { title: "Regulatory Foundations", description: "Learn key regulatory frameworks relevant to your industry", tasks: ["Study GDPR, SOX, or HIPAA depending on target industry", "Complete IAPP Foundation of Privacy Law training", "Shadow a compliance professional for one week"], estimatedWeeks: 8 },
      { title: "CCEP Certification", description: "Earn the primary compliance credential", tasks: ["Purchase SCCE CCEP study guide", "Complete 20 hours of practice questions", "Pass the CCEP exam"], estimatedWeeks: 16 },
      { title: "Job Placement & First Projects", description: "Land a role and deliver early wins", tasks: ["Apply to 10+ compliance analyst positions", "Complete a compliance audit in first 90 days", "Build relationships with Legal and Internal Audit teams"], estimatedWeeks: 20 },
    ],
  },

  // ── ARCHITECTURE & CONSTRUCTION ───────────────────────────────────────

  // 4. Architect
  {
    id: "architect", title: "Architect", domain: "Architecture & Construction",
    description: "Design buildings and structures, balancing aesthetics, functionality, safety codes, and sustainability.",
    interests: ["artistic", "realistic"], problemTypes: ["creative", "technical"], archetypes: ["builder", "ideator"],
    workStyles: ["organized", "open"], decisionStyle: ["thinking", "intuiting"], collaboration: ["mixed"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["mastery", "purpose"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["monotony", "micromanaged"], rewards: ["recognition", "impact"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["moderate", "low"], trajectories: ["specialist", "generalist"],
    groupRoles: ["ideator", "leader"], requiredSkills: ["AutoCAD", "Revit (BIM)", "Building Codes", "Structural Systems", "Sustainable Design"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Architecture & Construction", "Design & UX"],
    pathwayTime: "5-8 years (licensure required)",
    skillGaps: [
      { skill: "Revit / BIM Modeling", importance: "high", learningResource: "Autodesk Revit official tutorials on Autodesk Learning" },
      { skill: "Building Codes (IBC)", importance: "high", learningResource: "International Building Code study guides via ICC" },
      { skill: "Sustainable Design (LEED)", importance: "medium", learningResource: "USGBC LEED credentials study guide" },
      { skill: "Construction Documents", importance: "high", learningResource: "AIA Contract Documents overview; Schiff Hardin CDs course" },
    ],
    certifications: [
      { skill: "Architecture", certName: "Architect Registration Exam (ARE 5.0)", provider: "National Council of Architectural Registration Boards (NCARB)", url: "https://www.ncarb.org/pass-the-are", duration: "6 divisions, self-paced", level: "Professional Licensure", cost: "$235 per division", whyRecommended: "Required to become a licensed architect in the US" },
      { skill: "Sustainable Design", certName: "LEED Green Associate", provider: "U.S. Green Building Council", url: "https://www.usgbc.org/credentials/leed-green-associate", duration: "Self-study + exam", level: "Beginner", cost: "$250 (professionals)", whyRecommended: "Demonstrates sustainable design knowledge increasingly required by clients" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Residential Design Package", description: "Design a complete single-family residence including site plan, floor plans, elevations, and sections.", why: "Core deliverable architects produce; shows technical drafting and design judgment.", actionStep: "Pick a vacant lot in your area and develop full schematic design documents in Revit." },
      { type: "portfolio", title: "Adaptive Reuse Concept", description: "Develop a concept design to convert an industrial building to mixed-use housing.", why: "Hot area of practice; shows creativity and code knowledge.", actionStep: "Find a derelict warehouse in your city and sketch an adaptive reuse scheme." },
    ],
    networkingRecs: [
      { type: "networking", title: "American Institute of Architects (AIA)", description: "Join AIA and attend local chapter events and the national AIA Conference on Architecture.", platform: "AIA", url: "https://www.aia.org/", why: "Primary professional organization; access to mentorship, ARE prep resources, and job board.", actionStep: "Join as an associate AIA member and attend one local chapter event this month." },
    ],
    jobTargets: [
      { type: "job_application", title: "ArchitectCrossing Job Board", description: "Architecture-specific job board aggregating firm and public sector postings.", platform: "ArchitectCrossing", url: "https://www.architectcrossing.com/", why: "Curated for architecture roles across firm sizes and specializations.", actionStep: "Create a profile and apply to 5 architectural designer positions." },
    ],
    milestones: [
      { title: "BIM & Technical Foundations", description: "Master the primary software tools and technical drawing standards", tasks: ["Complete Autodesk Revit certification course", "Build 3 model projects of increasing complexity in Revit", "Study IBC building codes relevant to residential and commercial occupancies"], estimatedWeeks: 12 },
      { title: "Portfolio Development", description: "Build a compelling design portfolio", tasks: ["Design 2 portfolio projects from schematic to construction documents", "Document each project in a case study format", "Post portfolio on Archinect.com"], estimatedWeeks: 16 },
      { title: "ARE Exam Prep & Licensure", description: "Progress through NCARB AXP and pass ARE divisions", tasks: ["Log required AXP experience hours with an NCARB-registered firm", "Pass all 6 ARE 5.0 divisions", "Apply for state architectural license"], estimatedWeeks: 104 },
    ],
  },

  // 5. Civil Engineer
  {
    id: "civil-engineer", title: "Civil Engineer", domain: "Architecture & Construction",
    description: "Design and oversee infrastructure projects including roads, bridges, water systems, and public buildings.",
    interests: ["realistic", "investigative"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed"],
    ambiguityStyle: ["structure"], coreValues: ["impact", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["tech_debt", "unclear_requirements"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["targets", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["doer", "leader"], requiredSkills: ["AutoCAD Civil 3D", "Structural Analysis", "Hydrology", "Geotechnical Engineering", "Project Management"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Architecture & Construction"],
    pathwayTime: "4-6 years",
    skillGaps: [
      { skill: "AutoCAD Civil 3D", importance: "high", learningResource: "Autodesk Civil 3D official learning path on Autodesk University" },
      { skill: "Structural Analysis (STAAD/SAP2000)", importance: "high", learningResource: "Bentley STAAD.Pro tutorials and ASCE training resources" },
      { skill: "Hydrology & Stormwater Design", importance: "medium", learningResource: "ASCE continuing education; Bentley WaterGEMS tutorials" },
    ],
    certifications: [
      { skill: "Engineering", certName: "Professional Engineer (PE) License", provider: "NCEES", url: "https://ncees.org/engineering/pe/", duration: "4+ years experience + exam", level: "Professional Licensure", cost: "$375 exam fee", whyRecommended: "Required to sign off on public infrastructure designs; greatly increases earning potential" },
      { skill: "Engineering", certName: "Fundamentals of Engineering (FE) Exam", provider: "NCEES", url: "https://ncees.org/engineering/fe/", duration: "One-day computer-based exam", level: "Entry-Level", cost: "$175", whyRecommended: "First step toward PE licensure; taken near graduation" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Site Grading & Drainage Design", description: "Create a complete grading and stormwater management plan for a 5-acre commercial site using Civil 3D.", why: "Core deliverable in civil engineering practice; shows software proficiency.", actionStep: "Download a DEM from USGS and design a site grading plan in Civil 3D." },
      { type: "portfolio", title: "Bridge Load Analysis Report", description: "Perform a structural load analysis on a simple beam bridge and document design decisions.", why: "Demonstrates structural engineering fundamentals and analytical rigor.", actionStep: "Use SAP2000 student version to model a simple bridge and document results." },
    ],
    networkingRecs: [
      { type: "networking", title: "American Society of Civil Engineers (ASCE)", description: "Join ASCE and your local younger member group.", platform: "ASCE", url: "https://www.asce.org/", why: "Largest civil engineering organization; access to job board, technical resources, and PE prep.", actionStep: "Join ASCE as a student/graduate member and attend one local section event." },
    ],
    jobTargets: [
      { type: "job_application", title: "EngineeringCrossing", description: "Engineering-specific job board with civil, structural, and infrastructure postings.", platform: "EngineeringCrossing", url: "https://www.engineeringcrossing.com/", why: "Curated engineering roles from government agencies, firms, and contractors.", actionStep: "Search for 'Civil Engineer EIT' or 'Junior Civil Engineer' and apply to 5 roles." },
    ],
    milestones: [
      { title: "FE Exam & Technical Tools", description: "Pass FE exam and master key software", tasks: ["Complete NCEES FE Civil practice exam", "Pass the FE Civil exam", "Build proficiency in AutoCAD Civil 3D through 3 practice projects"], estimatedWeeks: 20 },
      { title: "Industry Experience", description: "Gain supervised field and office experience", tasks: ["Complete 4 years of progressive engineering experience under a PE", "Work on at least 2 project types (transportation, site, structural)", "Attend 2 ASCE continuing education courses"], estimatedWeeks: 208 },
      { title: "PE Licensure", description: "Achieve professional engineering licensure", tasks: ["Complete NCEES PE Civil study schedule (PPI2pass)", "Pass the PE Civil exam", "Apply for state PE license"], estimatedWeeks: 20 },
    ],
  },

  // 6. Construction Manager
  {
    id: "construction-manager", title: "Construction Manager", domain: "Architecture & Construction",
    description: "Plan, coordinate, and oversee construction projects from pre-construction through closeout, managing budget, schedule, and teams.",
    interests: ["realistic", "enterprising"], problemTypes: ["strategic", "technical"], archetypes: ["builder", "leader"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["impact", "mastery"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["unclear_requirements", "micromanaged"], rewards: ["impact", "recognition"],
    environments: ["onsite", "hybrid"], teamSizes: ["medium", "large"], paces: ["fast", "burst"],
    managementStyles: ["targets", "autonomy"], careerStages: ["advancing", "building"],
    riskLevels: ["moderate", "high"], trajectories: ["manager", "specialist"],
    groupRoles: ["leader", "doer"], requiredSkills: ["Scheduling (Primavera/MS Project)", "Cost Estimating", "Contract Administration", "Safety (OSHA 30)", "Subcontractor Management"],
    experienceLevels: ["mid", "senior"], domains: ["Architecture & Construction"],
    pathwayTime: "4-8 years",
    skillGaps: [
      { skill: "Primavera P6 Scheduling", importance: "high", learningResource: "Oracle Primavera P6 free tutorials on Oracle University" },
      { skill: "Cost Estimating (Procore/Bluebeam)", importance: "high", learningResource: "Procore Certification free online training" },
      { skill: "OSHA 30-Hour Safety", importance: "high", learningResource: "OSHA.gov 30-hour online course via authorized OSHA outreach trainers" },
    ],
    certifications: [
      { skill: "Construction Management", certName: "Certified Construction Manager (CCM)", provider: "Construction Management Association of America (CMAA)", url: "https://www.cmaanet.org/professional-development/certifications/ccm", duration: "Experience + exam", level: "Professional", cost: "$400–$650", whyRecommended: "Industry-leading credential for construction managers; required by many public agencies" },
      { skill: "Safety", certName: "OSHA 30-Hour Construction", provider: "OSHA Outreach Training Program", url: "https://www.osha.gov/training/outreach/construction", duration: "30 hours online or in-person", level: "Professional", cost: "$150–$300", whyRecommended: "Required or strongly preferred by most general contractors and project owners" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Construction Schedule (Primavera P6)", description: "Build a fully-linked CPM schedule for a hypothetical commercial building project.", why: "Demonstrates scheduling software skill — the #1 technical competency employers test.", actionStep: "Download Oracle Primavera P6 trial and schedule a 6-month office building build." },
      { type: "portfolio", title: "Project Cost Estimate", description: "Develop a detailed quantity takeoff and cost estimate for a residential construction project.", why: "Estimating is the gateway skill into construction management roles.", actionStep: "Use Bluebeam Revu to perform a takeoff from publicly available construction drawings." },
    ],
    networkingRecs: [
      { type: "networking", title: "Construction Management Association of America (CMAA)", description: "Join CMAA and attend regional chapter events and annual conference.", platform: "CMAA", url: "https://www.cmaanet.org/", why: "Primary networking organization for construction managers; connects owners, contractors, and CMs.", actionStep: "Join CMAA as a student or associate member and attend one chapter event." },
    ],
    jobTargets: [
      { type: "job_application", title: "iHireConstruction", description: "Job board dedicated to construction and building industry roles.", platform: "iHireConstruction", url: "https://www.ihireconstruction.com/", why: "Specialized board with superintendent, PM, and CM roles from contractors nationwide.", actionStep: "Create a profile and apply to 5 Assistant PM or Project Engineer positions." },
    ],
    milestones: [
      { title: "Technical Tools & Safety", description: "Build scheduling, estimating, and safety credentials", tasks: ["Complete Procore Certification (free online)", "Pass OSHA 30-Hour Construction", "Build a practice schedule in Primavera P6"], estimatedWeeks: 10 },
      { title: "Field Experience", description: "Accumulate supervised project experience", tasks: ["Work as a project engineer or assistant superintendent on 2+ projects", "Manage a subcontractor scope of work independently", "Attend owner-contractor-architect coordination meetings"], estimatedWeeks: 104 },
      { title: "CCM Certification", description: "Achieve professional construction management credential", tasks: ["Document 48 months of CM experience for CCM application", "Complete CMAA CCM exam prep course", "Pass the CCM exam"], estimatedWeeks: 20 },
    ],
  },

  // ── MEDIA & JOURNALISM ────────────────────────────────────────────────

  // 7. Journalist
  {
    id: "journalist", title: "Journalist", domain: "Media & Journalism",
    description: "Investigate, research, and report on news and events across print, digital, broadcast, or multimedia formats.",
    interests: ["investigative", "artistic"], problemTypes: ["analytical", "creative"], archetypes: ["thinker", "advocate"],
    workStyles: ["open", "organized"], decisionStyle: ["thinking", "intuiting"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["experiment", "consult"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "micromanaged"], rewards: ["impact", "recognition"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist", "generalist"],
    groupRoles: ["ideator", "doer"], requiredSkills: ["News Writing", "Investigative Research", "Source Development", "Multimedia Production", "AP Style"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Media & Journalism"],
    pathwayTime: "1-3 years",
    skillGaps: [
      { skill: "Investigative Research & FOIA", importance: "high", learningResource: "IRE (Investigative Reporters and Editors) tipsheets and training" },
      { skill: "Data Journalism", importance: "high", learningResource: "Knight Center for Journalism MOOC: Introduction to Data Journalism" },
      { skill: "Multimedia Production", importance: "medium", learningResource: "Adobe Premiere Pro tutorials on Adobe Learn" },
    ],
    certifications: [
      { skill: "Journalism", certName: "NCTJ Diploma in Journalism", provider: "National Council for the Training of Journalists (NCTJ)", url: "https://www.nctj.com/", duration: "6–12 months", level: "Professional", cost: "£2,500–£8,000 depending on provider", whyRecommended: "Internationally recognized journalism qualification; widely used in broadcast and print hiring" },
      { skill: "Data Journalism", certName: "Google News Initiative Training", provider: "Google News Initiative", url: "https://newsinitiative.withgoogle.com/training/", duration: "Self-paced", level: "Beginner–Intermediate", cost: "Free", whyRecommended: "Practical data and tools training from the world's largest news partner" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Original Investigative Feature", description: "Report and write a 2,000-word investigative article with 5+ on-record sources, FOIA documents, and data analysis.", why: "Longer-form investigative work is the gold standard for editorial hiring committees.", actionStep: "Identify a local government spending story and file a FOIA request this week." },
      { type: "portfolio", title: "Data-Driven Story", description: "Obtain a public dataset, analyze it, and produce an explanatory story with data visualizations.", why: "Data journalism skills are increasingly required; sets you apart from narrative-only writers.", actionStep: "Download a city crime or budget dataset and build a story with Datawrapper charts." },
    ],
    networkingRecs: [
      { type: "networking", title: "SPJ (Society of Professional Journalists)", description: "Join SPJ and attend regional conferences.", platform: "SPJ", url: "https://www.spj.org/", why: "Largest US journalism organization; ethics resources, job board, and fellowships.", actionStep: "Join SPJ as a student member and submit one piece to a student journalism award." },
    ],
    jobTargets: [
      { type: "job_application", title: "JournalismJobs.com", description: "Largest US-based job board for journalism, communications, and media roles.", platform: "JournalismJobs", url: "https://www.journalismjobs.com/", why: "Aggregates openings from local TV, newspapers, digital-native outlets, and magazines.", actionStep: "Set job alerts by beat (politics, health, local news) and apply to 5 roles." },
    ],
    milestones: [
      { title: "Portfolio Building", description: "Produce a body of published or publishable work", tasks: ["Publish 10 articles in student or local publications", "File your first FOIA request", "Learn data journalism tools (Datawrapper, Google Sheets)"], estimatedWeeks: 16 },
      { title: "Beat Coverage & Sourcing", description: "Develop expertise in a specific beat", tasks: ["Cover a local government or court beat for 6 months", "Develop 5 regular on-record sources", "Break one original story"], estimatedWeeks: 24 },
      { title: "Job Search & Staff Position", description: "Land a staff or freelance position", tasks: ["Build a Contently or journalism portfolio site", "Apply to 15+ staff reporter roles", "Pitch 5 freelance stories to national outlets"], estimatedWeeks: 12 },
    ],
  },

  // 8. PR Specialist
  {
    id: "pr-specialist", title: "PR Specialist", domain: "Media & Journalism",
    description: "Manage an organization's public image by crafting press releases, pitching media stories, and handling crisis communications.",
    interests: ["enterprising", "artistic"], problemTypes: ["creative", "strategic"], archetypes: ["communicator", "ideator"],
    workStyles: ["open", "organized"], decisionStyle: ["feeling", "thinking"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["experiment", "consult"], coreValues: ["impact", "recognition"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["no_impact", "monotony"], rewards: ["recognition", "learning"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["mentorship", "targets"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate"], trajectories: ["specialist", "generalist"],
    groupRoles: ["communicator", "ideator"], requiredSkills: ["Press Release Writing", "Media Relations", "Crisis Communications", "Cision/Meltwater", "Social Media Strategy"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Media & Journalism", "Marketing"],
    pathwayTime: "1-2 years",
    skillGaps: [
      { skill: "Press Release Writing & AP Style", importance: "high", learningResource: "Associated Press Stylebook; PR Daily writing workshops" },
      { skill: "Media Database Tools (Cision)", importance: "high", learningResource: "Cision free demo and training videos on Cision.com" },
      { skill: "Crisis Communications", importance: "medium", learningResource: "PRSA Crisis Communications Certificate Program" },
    ],
    certifications: [
      { skill: "Public Relations", certName: "Accredited in Public Relations (APR)", provider: "Public Relations Society of America (PRSA)", url: "https://www.prsa.org/professional-development/apr/", duration: "Self-study + panel review + exam", level: "Professional", cost: "$385 (members) / $505 (non-members)", whyRecommended: "The most recognized voluntary credential in the PR profession" },
      { skill: "Social Media", certName: "Hootsuite Social Marketing Certification", provider: "Hootsuite Academy", url: "https://education.hootsuite.com/courses/social-marketing", duration: "6 hours self-paced", level: "Beginner", cost: "Free", whyRecommended: "Demonstrates social media management skills commonly required in PR roles" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Press Release & Media Pitch", description: "Write a press release and accompanying media pitch for a fictional product launch.", why: "Press release writing is the core PR deliverable tested in interviews.", actionStep: "Choose a real product announcement and rewrite the press release, then draft a pitch email." },
      { type: "portfolio", title: "Crisis Communication Plan", description: "Develop a full crisis comms plan for a hypothetical brand facing a social media scandal.", why: "Crisis management is a key differentiator at senior PR levels.", actionStep: "Pick a past corporate crisis and write an alternative response strategy." },
    ],
    networkingRecs: [
      { type: "networking", title: "PRSA Chapters", description: "Join PRSA and attend local chapter Happy Hours and national PRSSA events.", platform: "PRSA", url: "https://www.prsa.org/", why: "Primary US PR professional organization; large mentorship and job placement network.", actionStep: "Attend one PRSA local chapter event and introduce yourself to 3 agency professionals." },
    ],
    jobTargets: [
      { type: "job_application", title: "PRWeek Job Board", description: "PR industry-focused job board with agency, in-house, and nonprofit communications roles.", platform: "PRWeek", url: "https://www.prweek.com/us/jobs", why: "Industry-specific board with roles from top agencies (Edelman, Weber Shandwick) and brands.", actionStep: "Search 'PR Coordinator' or 'Media Relations Specialist' and apply to 5 roles." },
    ],
    milestones: [
      { title: "Writing & Tools Foundation", description: "Master AP style, PR writing, and media database tools", tasks: ["Complete AP Stylebook online learning center course", "Build proficiency in Cision or Meltwater using free demos", "Write 5 practice press releases for real company news"], estimatedWeeks: 8 },
      { title: "Internship & Client Work", description: "Get hands-on agency or in-house experience", tasks: ["Secure a PR internship at an agency or brand", "Execute one media campaign with measurable placements", "Build a media list of 50 journalists in a target beat"], estimatedWeeks: 24 },
      { title: "APR Certification", description: "Achieve professional PR credential", tasks: ["Complete 5 years of PR experience for APR eligibility", "Prepare APR panel presentation on a campaign you managed", "Pass the APR examination"], estimatedWeeks: 52 },
    ],
  },

  // ── REAL ESTATE ───────────────────────────────────────────────────────

  // 9. Real Estate Agent
  {
    id: "real-estate-agent", title: "Real Estate Agent", domain: "Real Estate",
    description: "Help clients buy, sell, and rent residential or commercial properties; guide them through negotiations and the transaction process.",
    interests: ["enterprising", "social"], problemTypes: ["strategic", "human"], archetypes: ["communicator", "leader"],
    workStyles: ["open", "organized"], decisionStyle: ["feeling", "thinking"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["experiment", "consult"], coreValues: ["autonomy", "wealth"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["monotony", "micromanaged"], rewards: ["wealth", "recognition"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "solo"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "autonomy"], careerStages: ["exploring", "building"],
    riskLevels: ["high", "moderate"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["communicator", "doer"], requiredSkills: ["Client Relationships", "Contract Negotiation", "Market Analysis (CMAs)", "MLS Platforms", "Lead Generation"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Real Estate"],
    pathwayTime: "3-6 months",
    skillGaps: [
      { skill: "Real Estate Law & Contracts", importance: "high", learningResource: "State real estate pre-license course (Kaplan or Champions School)" },
      { skill: "Comparative Market Analysis (CMA)", importance: "high", learningResource: "NAR Center for REALTOR Development courses" },
      { skill: "Lead Generation & CRM", importance: "medium", learningResource: "Tom Ferry's free YouTube coaching and KW Command CRM training" },
    ],
    certifications: [
      { skill: "Real Estate", certName: "Real Estate Salesperson License", provider: "State Real Estate Commission", url: "https://www.arello.com/regulatory-agency-database/", duration: "40–180 hours pre-license education + exam", level: "Professional Licensure", cost: "$200–$800 total", whyRecommended: "Required by law to represent buyers and sellers in real estate transactions" },
      { skill: "Real Estate", certName: "NAR REALTOR Membership + ABR Designation", provider: "National Association of REALTORS", url: "https://www.nar.realtor/designations-and-certifications", duration: "2-day course", level: "Professional", cost: "$259", whyRecommended: "Accredited Buyer's Representative (ABR) designation improves buyer client trust and transactions" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Market Analysis Report", description: "Prepare a Comparative Market Analysis (CMA) for a real home in your target market.", why: "CMAs are how agents win listings; demonstrating this skill impresses team leads.", actionStep: "Pull sold comps from Zillow or MLS access and build a CMA in a Google Slides presentation." },
      { type: "portfolio", title: "Property Listing Package", description: "Create a full listing marketing package: photos, property description, social media posts, and flyer.", why: "Listing marketing is the most visible agent deliverable; a strong package gets referrals.", actionStep: "Work with a friend or family member to practice staging and photographing a property." },
    ],
    networkingRecs: [
      { type: "networking", title: "NAR Young Professionals Network (YPN)", description: "Join your local REALTOR Association's YPN for networking events and mentorship.", platform: "NAR YPN", url: "https://www.nar.realtor/member-benefits/ypn", why: "Fastest path to agent referrals and learning the business from top producers.", actionStep: "Join your local REALTOR association and attend the next YPN event." },
    ],
    jobTargets: [
      { type: "job_application", title: "Real Estate Express Job Board", description: "Job board focused on real estate brokerage and team opportunities.", platform: "Real Estate Express", url: "https://www.realestateexpress.com/", why: "Lists team and brokerage opportunities for newly licensed agents.", actionStep: "Interview with 3 brokerages to find the best training program for new agents." },
    ],
    milestones: [
      { title: "Licensure", description: "Complete pre-license education and pass state exam", tasks: ["Complete state pre-license course (Kaplan or Champions)", "Pass the state real estate salesperson exam", "Join a brokerage with strong new-agent training"], estimatedWeeks: 10 },
      { title: "First Transactions", description: "Close first 3 deals", tasks: ["Generate 50 leads through sphere of influence outreach", "Set up a CRM and follow-up system", "Close your first buyer and first listing transaction"], estimatedWeeks: 26 },
      { title: "Business Building", description: "Establish a repeatable business", tasks: ["Close 12+ transactions in a year", "Earn NAR ABR designation", "Build a referral pipeline that generates 30% of business"], estimatedWeeks: 52 },
    ],
  },

  // 10. Property Manager
  {
    id: "property-manager", title: "Property Manager", domain: "Real Estate",
    description: "Oversee day-to-day operations of residential, commercial, or industrial properties on behalf of owners.",
    interests: ["enterprising", "conventional"], problemTypes: ["strategic", "human"], archetypes: ["optimizer", "leader"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["mastery", "impact"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "tech_debt"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["targets", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["leader", "doer"], requiredSkills: ["Lease Administration", "Tenant Relations", "Maintenance Coordination", "Budgeting", "Fair Housing Laws"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Real Estate"],
    pathwayTime: "1-3 years",
    skillGaps: [
      { skill: "Property Management Software (AppFolio/Yardi)", importance: "high", learningResource: "AppFolio free training videos; Yardi Voyager training on Yardi Client Central" },
      { skill: "Lease Administration & Fair Housing Law", importance: "high", learningResource: "IREM courses; NAA Lease Addendum training" },
      { skill: "Financial Reporting & Budgeting", importance: "medium", learningResource: "IREM CPM designation course on operations and budgeting" },
    ],
    certifications: [
      { skill: "Property Management", certName: "Certified Property Manager (CPM)", provider: "Institute of Real Estate Management (IREM)", url: "https://www.irem.org/credentials/cpm", duration: "Experience + coursework + exam", level: "Professional", cost: "$1,000–$3,000 total", whyRecommended: "Most respected property management credential; significantly increases salary and advancement" },
      { skill: "Residential Property", certName: "National Apartment Leasing Professional (NALP)", provider: "National Apartment Association", url: "https://www.naahq.org/education/nalp", duration: "Online self-paced", level: "Entry-Level", cost: "$375", whyRecommended: "Entry-level credential for residential leasing and property management roles" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Property Operating Budget", description: "Build a full annual operating budget for a hypothetical 50-unit apartment building.", why: "Financial management is the #1 skill property owners evaluate managers on.", actionStep: "Use IREM's budget template to create a realistic operating and capital budget." },
      { type: "portfolio", title: "Lease Audit Report", description: "Audit 10 sample leases for compliance with Fair Housing Act requirements.", why: "Lease compliance protects owners from liability; demonstrating this skill builds employer trust.", actionStep: "Download sample residential leases from your state's apartment association website." },
    ],
    networkingRecs: [
      { type: "networking", title: "IREM Chapters", description: "Join IREM's local chapter for professional development and networking.", platform: "IREM", url: "https://www.irem.org/", why: "IREM chapters host monthly events, offer CPM mentorship, and connect you with owners.", actionStep: "Attend one IREM chapter luncheon and introduce yourself to two property owners." },
    ],
    jobTargets: [
      { type: "job_application", title: "Indeed Property Management Jobs", description: "Search for Property Manager, Leasing Manager, and Asset Manager roles on Indeed.", platform: "Indeed", url: "https://www.indeed.com/q-property-manager-jobs.html", why: "Wide range of property types (residential, commercial, industrial) and company sizes.", actionStep: "Apply to 5 residential property manager or leasing consultant roles." },
    ],
    milestones: [
      { title: "Foundations & NALP", description: "Build knowledge and earn entry-level credential", tasks: ["Complete NAA NALP online course", "Learn AppFolio or Yardi through free training", "Study Fair Housing Act fundamentals"], estimatedWeeks: 10 },
      { title: "First Property Management Role", description: "Gain hands-on operational experience", tasks: ["Manage daily operations for a portfolio of 50–200 units", "Handle maintenance coordination and vendor management", "Execute full lease renewal cycle"], estimatedWeeks: 52 },
      { title: "CPM Designation", description: "Advance to certified property manager status", tasks: ["Complete IREM CPM coursework (ethics, finance, maintenance)", "Document required management experience for CPM application", "Pass CPM certification exam"], estimatedWeeks: 52 },
    ],
  },

  // ── TRADES ────────────────────────────────────────────────────────────

  // 11. Electrician
  {
    id: "electrician", title: "Electrician", domain: "Trades & Skilled Labor",
    description: "Install, maintain, and repair electrical systems in residential, commercial, and industrial buildings.",
    interests: ["realistic", "investigative"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["structure"], coreValues: ["mastery", "autonomy"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["tech_debt", "monotony"], rewards: ["learning", "recognition"],
    environments: ["onsite"], teamSizes: ["small", "solo"], paces: ["steady"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["NEC Code Knowledge", "Blueprint Reading", "Conduit Bending", "Panel Installation", "Troubleshooting"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Trades & Skilled Labor"],
    pathwayTime: "4-5 years (apprenticeship)",
    skillGaps: [
      { skill: "National Electrical Code (NEC)", importance: "high", learningResource: "Mike Holt NEC Illustrated Guide and free YouTube lectures" },
      { skill: "Blueprint & Schematic Reading", importance: "high", learningResource: "IBEW/NECA apprenticeship training materials" },
      { skill: "Conduit Bending & Installation", importance: "high", learningResource: "NJATC (National Joint Apprenticeship Training Committee) apprenticeship program" },
    ],
    certifications: [
      { skill: "Electrician", certName: "Journeyman Electrician License", provider: "State Electrical Licensing Board", url: "https://www.electrical-licensing.com/state-electrical-licensing.html", duration: "4–5 year apprenticeship + exam", level: "Professional Licensure", cost: "$50–$200 exam fee", whyRecommended: "Required to work as an electrician without direct supervision; major income jump from apprentice" },
      { skill: "Electrician", certName: "OSHA 10-Hour Construction Safety", provider: "OSHA Outreach Training Program", url: "https://www.osha.gov/training/outreach/construction", duration: "10 hours online or classroom", level: "Entry-Level", cost: "$75–$150", whyRecommended: "Required on most commercial jobsites; demonstrates safety knowledge to contractors" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Residential Wiring Project", description: "Wire a complete room addition or detached garage, including panel connection, with permits and inspection.", why: "Passed inspections and permit history are the electrician's portfolio.", actionStep: "Pull an electrical permit for a home project and document each inspection phase." },
      { type: "portfolio", title: "Commercial Panel Installation", description: "Document the installation of a 200A commercial panel including load calculations.", why: "Commercial experience commands higher wages and better job opportunities.", actionStep: "Photograph and document each step of a panel installation with load calc worksheets." },
    ],
    networkingRecs: [
      { type: "networking", title: "IBEW (International Brotherhood of Electrical Workers)", description: "Join your local IBEW chapter for union apprenticeship, benefits, and job dispatch.", platform: "IBEW", url: "https://www.ibew.org/", why: "Union membership provides apprenticeship training, healthcare, pension, and steady work referrals.", actionStep: "Contact your local IBEW chapter to apply for the next apprenticeship class." },
    ],
    jobTargets: [
      { type: "job_application", title: "Indeed Electrician Jobs", description: "Search for Apprentice Electrician, Journeyman Electrician, and Electrical Contractor roles.", platform: "Indeed", url: "https://www.indeed.com/q-electrician-jobs.html", why: "Electrician demand is at record highs; Indeed aggregates union and non-union openings.", actionStep: "Apply to 5 apprenticeship or journeyman positions within 30 miles of your location." },
    ],
    milestones: [
      { title: "Pre-Apprenticeship", description: "Prepare for and enter an apprenticeship program", tasks: ["Complete electrical math and NEC introduction course", "Apply to IBEW or non-union apprenticeship programs", "Pass apprenticeship entrance aptitude test"], estimatedWeeks: 12 },
      { title: "Apprenticeship Years 1-3", description: "Build core field skills under supervision", tasks: ["Complete 2,000 OJT hours per year", "Attend NJATC/JATC related technical instruction (8 hours/week)", "Learn residential, commercial, and industrial systems progressively"], estimatedWeeks: 156 },
      { title: "Journeyman License", description: "Test for and obtain journeyman license", tasks: ["Complete 8,000 total apprenticeship OJT hours", "Study NEC with Mike Holt exam prep materials", "Pass state journeyman electrician license exam"], estimatedWeeks: 52 },
    ],
  },

  // 12. Plumber
  {
    id: "plumber", title: "Plumber", domain: "Trades & Skilled Labor",
    description: "Install and repair piping systems for water, gas, and sewage in residential and commercial buildings.",
    interests: ["realistic"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["structure"], coreValues: ["mastery", "autonomy"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["monotony", "micromanaged"], rewards: ["learning", "wealth"],
    environments: ["onsite"], teamSizes: ["small", "solo"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "autonomy"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["doer"], requiredSkills: ["Pipe Fitting & Soldering", "Plumbing Codes (UPC/IPC)", "Drain-Waste-Vent Systems", "Gas Piping", "Fixture Installation"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Trades & Skilled Labor"],
    pathwayTime: "4-5 years (apprenticeship)",
    skillGaps: [
      { skill: "Uniform Plumbing Code (UPC) / IPC", importance: "high", learningResource: "IAPMO UPC study guide; ICC IPC exam prep books" },
      { skill: "Pipe Fitting & Soldering", importance: "high", learningResource: "UA (United Association) apprenticeship program training materials" },
      { skill: "Gas Piping & Pressure Testing", importance: "high", learningResource: "NFPA 54 National Fuel Gas Code study guide" },
    ],
    certifications: [
      { skill: "Plumbing", certName: "Journeyman Plumber License", provider: "State Plumbing Licensing Board", url: "https://www.plumbing-license.com/", duration: "4–5 year apprenticeship + exam", level: "Professional Licensure", cost: "$50–$200 exam fee", whyRecommended: "Required to work as a plumber without direct supervision in most states" },
      { skill: "Plumbing", certName: "Master Plumber License", provider: "State Plumbing Licensing Board", url: "https://www.plumbing-license.com/", duration: "Additional 2–4 years experience + exam", level: "Advanced Licensure", cost: "$100–$300 exam fee", whyRecommended: "Required to pull permits and run your own plumbing company; dramatically increases income" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Full Bathroom Rough-In & Finish", description: "Complete rough-in plumbing, inspection, and finish plumbing for a full bathroom remodel with documentation.", why: "Bathroom remodels are the most common plumbing project; documenting competency impresses employers.", actionStep: "Photograph and document every stage: rough-in, pressure test, inspection, fixture installation." },
      { type: "portfolio", title: "Water Heater Replacement & Gas Line", description: "Replace a tank water heater, install new gas line, and document pressure testing and CO safety inspection.", why: "Gas work is a high-value specialty; documented safe completions build reputation.", actionStep: "Pull permit, complete installation, pass inspection, and photograph documentation." },
    ],
    networkingRecs: [
      { type: "networking", title: "United Association (UA) Local Union", description: "Apply to your local UA union for apprenticeship, benefits, and job dispatch.", platform: "United Association", url: "https://ua.org/", why: "UA membership provides paid apprenticeship, health insurance, pension, and referrals.", actionStep: "Find your local UA chapter and submit an apprenticeship application." },
    ],
    jobTargets: [
      { type: "job_application", title: "Indeed Plumber Jobs", description: "Search for Apprentice Plumber, Plumber, and Master Plumber openings.", platform: "Indeed", url: "https://www.indeed.com/q-plumber-jobs.html", why: "Severe national shortage of plumbers; strong union and non-union demand.", actionStep: "Apply to 5 plumbing apprenticeship or journeyman positions in your area." },
    ],
    milestones: [
      { title: "Apprenticeship Entry", description: "Enter a plumbing apprenticeship program", tasks: ["Apply to UA or PHCC apprenticeship program", "Pass math and mechanical aptitude entrance test", "Purchase required hand tools and safety equipment"], estimatedWeeks: 10 },
      { title: "Apprenticeship Training", description: "Complete 4-year paid apprenticeship", tasks: ["Complete 2,000 OJT hours per year across residential, commercial, and service work", "Attend plumbing code classes (8 hours/week)", "Learn soldering, PEX, CPVC, cast iron, and gas piping systems"], estimatedWeeks: 208 },
      { title: "Journeyman License & Business Skills", description: "License and grow toward master or ownership", tasks: ["Pass state journeyman plumber exam", "Study for master plumber exam", "Take a small business management course for potential ownership"], estimatedWeeks: 52 },
    ],
  },

  // 13. HVAC Technician
  {
    id: "hvac-technician", title: "HVAC Technician", domain: "Trades & Skilled Labor",
    description: "Install, maintain, and repair heating, ventilation, air conditioning, and refrigeration systems in residential and commercial settings.",
    interests: ["realistic", "investigative"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["structure"], coreValues: ["mastery", "autonomy"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["monotony", "unclear_requirements"], rewards: ["learning", "wealth"],
    environments: ["onsite"], teamSizes: ["small", "solo"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "autonomy"], careerStages: ["exploring", "building"],
    riskLevels: ["low"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Refrigeration Fundamentals", "Electrical Diagnostics", "EPA 608 Certification", "Ductwork Fabrication", "BAS/Controls"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Trades & Skilled Labor"],
    pathwayTime: "2-5 years",
    skillGaps: [
      { skill: "EPA 608 Refrigerant Handling", importance: "high", learningResource: "HVAC Excellence EPA 608 study guide; Esco Group certification prep" },
      { skill: "Electrical Diagnostics & Controls", importance: "high", learningResource: "NATE HVAC technician study guides" },
      { skill: "Load Calculations (Manual J)", importance: "medium", learningResource: "ACCA Manual J Residential Load Calculation software tutorial" },
    ],
    certifications: [
      { skill: "Refrigerants", certName: "EPA Section 608 Certification", provider: "EPA-approved testing organization", url: "https://www.epa.gov/section608", duration: "Self-study + half-day exam", level: "Required by Law", cost: "$20–$50", whyRecommended: "Federally required to purchase and handle refrigerants; must have before any HVAC job" },
      { skill: "HVAC", certName: "NATE Certification (HVAC/R)", provider: "North American Technician Excellence", url: "https://www.natex.org/", duration: "Self-study + exam", level: "Professional", cost: "$120–$225 per exam", whyRecommended: "Industry's most respected HVAC credential; increases pay 10–20% and job access" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "System Commissioning Report", description: "Commission a new HVAC system, document startup procedures, airflow measurements, and refrigerant charge verification.", why: "Commissioning documentation is required by LEED and energy codes; demonstrates advanced competency.", actionStep: "Use ACCA commissioning checklist and document your next system startup completely." },
      { type: "portfolio", title: "Preventive Maintenance Log", description: "Create a detailed PM log for a commercial RTU or split system with photos and measurements.", why: "Documented PM history shows organized and professional service practice.", actionStep: "Design a PM checklist using ASHRAE 180 Standard maintenance guidelines." },
    ],
    networkingRecs: [
      { type: "networking", title: "ACCA (Air Conditioning Contractors of America)", description: "Join ACCA and your local chapter for networking, training, and business resources.", platform: "ACCA", url: "https://www.acca.org/", why: "Primary HVAC contractor organization; training, job referrals, and NATE prep resources.", actionStep: "Join ACCA as a student or associate member and attend one webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "Indeed HVAC Jobs", description: "Search for HVAC Apprentice, HVAC Technician, and Service Technician openings.", platform: "Indeed", url: "https://www.indeed.com/q-HVAC-technician-jobs.html", why: "HVAC technicians are in short supply nationally; strong demand across residential and commercial sectors.", actionStep: "Apply to 5 HVAC apprentice or entry-level technician positions in your area." },
    ],
    milestones: [
      { title: "EPA 608 & Basic Theory", description: "Get the required certification and learn fundamentals", tasks: ["Study and pass EPA Section 608 (Universal) exam", "Complete an HVAC/R technology program or apprenticeship", "Learn refrigeration cycle, electrical basics, and ductwork fundamentals"], estimatedWeeks: 20 },
      { title: "Field Experience & NATE Prep", description: "Build hands-on experience and prepare for NATE", tasks: ["Accumulate 2+ years of field service experience across equipment types", "Study NATE Core and specialty exams (Light Commercial, Residential A/C)", "Pass at least 2 NATE specialty exams"], estimatedWeeks: 104 },
      { title: "Advanced Specialization", description: "Develop high-value specialty skills", tasks: ["Learn Building Automation Systems (BAS) programming basics", "Complete Manual J load calculation training", "Pursue NATE Senior Service Engineer designation"], estimatedWeeks: 52 },
    ],
  },

  // ── GOVERNMENT ────────────────────────────────────────────────────────

  // 14. Policy Analyst
  {
    id: "policy-analyst", title: "Policy Analyst", domain: "Law & Policy",
    description: "Research, analyze, and evaluate government policies and programs, producing reports and recommendations for legislators and agencies.",
    interests: ["investigative", "social"], problemTypes: ["analytical", "strategic"], archetypes: ["thinker", "advocate"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "unclear_requirements"], rewards: ["impact", "learning"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium"], paces: ["steady"],
    managementStyles: ["mentorship", "handsoff"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "generalist"],
    groupRoles: ["analyst", "advocate"], requiredSkills: ["Quantitative Research", "Policy Writing", "Cost-Benefit Analysis", "Statistical Analysis (R/Stata)", "Legislative Process Knowledge"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Law & Policy"],
    pathwayTime: "2-4 years",
    skillGaps: [
      { skill: "Quantitative Policy Research", importance: "high", learningResource: "Urban Institute free policy research methods course" },
      { skill: "Statistical Analysis (R or Stata)", importance: "high", learningResource: "DataCamp Statistical Inference with R course" },
      { skill: "Cost-Benefit Analysis", importance: "medium", learningResource: "Benefit-Cost Analysis textbook by Boardman et al.; OMB Circular A-94" },
    ],
    certifications: [
      { skill: "Policy Analysis", certName: "Master of Public Policy (MPP)", provider: "NASPAA-accredited school", url: "https://www.naspaa.org/find-a-program", duration: "2 years full-time", level: "Graduate", cost: "$20,000–$55,000/year", whyRecommended: "Standard terminal professional degree for federal and state policy analyst careers" },
      { skill: "Data", certName: "Google Data Analytics Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-data-analytics", duration: "6 months", level: "Beginner", cost: "$49/month", whyRecommended: "Fast, accessible credential for data analysis skills required in policy work" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Policy Brief", description: "Write a 4–6 page policy brief on a current government issue with a clear problem statement, evidence review, and 3 policy options.", why: "Policy briefs are the primary work product of analysts; strong writing sample for applications.", actionStep: "Choose a federal or state program and write a brief using the Urban Institute or Brookings format." },
      { type: "portfolio", title: "Program Evaluation Report", description: "Conduct a logic model and outcome evaluation for a federal or state program using publicly available data.", why: "Program evaluation is a core analyst skill; a completed evaluation shows advanced competency.", actionStep: "Use CDC WONDER or BLS data to evaluate the impact of a public health or workforce program." },
    ],
    networkingRecs: [
      { type: "networking", title: "APPAM (Association for Public Policy Analysis & Management)", description: "Join APPAM and attend the annual research conference.", platform: "APPAM", url: "https://www.appam.org/", why: "Primary academic and professional network for policy analysts across government, academia, and think tanks.", actionStep: "Submit a research paper abstract to the APPAM conference; attend even as a student observer." },
    ],
    jobTargets: [
      { type: "job_application", title: "USAJOBS.gov", description: "Official federal government job site for all GS-level policy analyst positions.", platform: "USAJOBS", url: "https://www.usajobs.gov/", why: "All federal policy analyst roles (GS-9 through GS-15) are posted exclusively here.", actionStep: "Create a USAJOBS profile and apply to 3 GS-9/11 policy analyst or program analyst roles." },
    ],
    milestones: [
      { title: "Research Methods Foundation", description: "Build quantitative and qualitative research skills", tasks: ["Complete a statistics course in R or Stata", "Learn cost-benefit analysis from Boardman textbook", "Write one policy brief on a topic of interest"], estimatedWeeks: 16 },
      { title: "Graduate Education or Internship", description: "Deepen expertise through MPP program or federal internship", tasks: ["Apply to Congressional or agency internship program (PMF, Presidential Management Fellows)", "Complete MPP core courses in microeconomics, statistics, and policy analysis", "Publish or present one policy research paper"], estimatedWeeks: 52 },
      { title: "Federal or Think Tank Placement", description: "Land an analyst position", tasks: ["Apply to USAJOBS for GS-9/11 analyst roles", "Apply to urban institutes, Brookings, RAND, or state budget offices", "Complete one policy writing sample demonstrating cost-benefit analysis"], estimatedWeeks: 16 },
    ],
  },

  // 15. Urban Planner
  {
    id: "urban-planner", title: "Urban Planner", domain: "Architecture & Construction",
    description: "Develop land use plans and programs that help communities accommodate population growth, infrastructure needs, and sustainability goals.",
    interests: ["investigative", "social"], problemTypes: ["strategic", "analytical"], archetypes: ["thinker", "builder"],
    workStyles: ["organized", "open"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "unclear_requirements"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium"], paces: ["steady"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "manager"],
    groupRoles: ["analyst", "leader"], requiredSkills: ["GIS (ArcGIS/QGIS)", "Zoning Law", "Community Engagement", "Transportation Planning", "Environmental Review (NEPA/CEQA)"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Architecture & Construction", "Law & Policy"],
    pathwayTime: "3-5 years",
    skillGaps: [
      { skill: "GIS (ArcGIS or QGIS)", importance: "high", learningResource: "Esri ArcGIS training (esri.com/training); QGIS free tutorials on QGIS.org" },
      { skill: "Zoning Law & Entitlements", importance: "high", learningResource: "APA Zoning Practice publication; state planning association training" },
      { skill: "Environmental Review (NEPA/CEQA)", importance: "medium", learningResource: "Council on Environmental Quality NEPA guides; California OPR CEQA guidelines" },
    ],
    certifications: [
      { skill: "Planning", certName: "American Institute of Certified Planners (AICP)", provider: "American Planning Association (APA)", url: "https://www.planning.org/aicp/", duration: "2 years experience + exam", level: "Professional", cost: "$400–$575", whyRecommended: "Industry standard credential; required or strongly preferred for senior planning positions" },
      { skill: "GIS", certName: "Esri Technical Certification (ArcGIS Desktop Associate)", provider: "Esri", url: "https://www.esri.com/training/certification/", duration: "Self-study + exam", level: "Professional", cost: "$250", whyRecommended: "GIS is the #1 technical skill for planners; an Esri credential proves software proficiency" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Land Use Analysis Map", description: "Create a GIS-based land use and zoning analysis map for a specific municipality, identifying development opportunities.", why: "GIS mapping is the core technical deliverable of planning work; a polished map is a strong portfolio piece.", actionStep: "Download zoning shapefiles from a city's open data portal and build an analysis in ArcGIS." },
      { type: "portfolio", title: "Comprehensive Plan Element", description: "Draft a Housing Element for a small municipality, including current conditions analysis and policy recommendations.", why: "Housing Elements are required by state law in many states; demonstrating this skill opens public agency jobs.", actionStep: "Review a recently adopted Housing Element from California HCD and draft your own version." },
    ],
    networkingRecs: [
      { type: "networking", title: "American Planning Association (APA)", description: "Join APA and your state chapter; attend APA National Planning Conference.", platform: "APA", url: "https://www.planning.org/", why: "APA is the central hub for planners; job board, AICP exam prep, and mentorship programs.", actionStep: "Join APA as a student member and attend one local chapter event." },
    ],
    jobTargets: [
      { type: "job_application", title: "APA Jobs Online", description: "APA's planning-specific job board with local, state, and federal government planning openings.", platform: "APA Jobs Online", url: "https://www.planning.org/jobs/", why: "Most municipal planning jobs are posted here; city, county, and regional agency openings.", actionStep: "Search for 'Planner I' or 'Assistant Planner' and apply to 5 municipal roles." },
    ],
    milestones: [
      { title: "GIS & Technical Skills", description: "Build core GIS and planning technical competencies", tasks: ["Complete Esri ArcGIS training certificate", "Create 3 GIS analysis maps for a portfolio", "Study zoning ordinance structure and CEQA/NEPA review processes"], estimatedWeeks: 12 },
      { title: "Graduate School or Internship", description: "Develop professional expertise through education or work", tasks: ["Complete Master of Urban Planning (MUP) core courses or secure a planning internship", "Participate in a community engagement process (public meeting, charette)", "Assist in drafting a planning document (general plan element, specific plan, EIR)"], estimatedWeeks: 52 },
      { title: "AICP Certification", description: "Achieve professional planning credential", tasks: ["Accumulate 2 years of professional planning experience", "Study APA AICP exam prep materials", "Pass the AICP exam"], estimatedWeeks: 26 },
    ],
  },

  // ── ARTS & ENTERTAINMENT ──────────────────────────────────────────────

  // 16. Game Designer
  {
    id: "game-designer", title: "Game Designer", domain: "Arts & Entertainment",
    description: "Conceive, prototype, and iterate on game mechanics, levels, systems, and player experiences for digital or tabletop games.",
    interests: ["artistic", "investigative"], problemTypes: ["creative", "technical"], archetypes: ["ideator", "builder"],
    workStyles: ["open", "organized"], decisionStyle: ["intuiting", "thinking"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["experiment"], coreValues: ["mastery", "autonomy"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["monotony", "micromanaged"], rewards: ["recognition", "learning"],
    environments: ["hybrid", "remote"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist", "generalist"],
    groupRoles: ["ideator", "doer"], requiredSkills: ["Game Design Documentation (GDD)", "Unity or Unreal Engine", "Prototyping", "Player Psychology", "Systems Design"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Arts & Entertainment", "Technology"],
    pathwayTime: "2-4 years",
    skillGaps: [
      { skill: "Unity Game Development", importance: "high", learningResource: "Unity Learn free tutorials (learn.unity.com)" },
      { skill: "Game Design Documentation (GDD)", importance: "high", learningResource: "The Art of Game Design by Jesse Schell; GDC Vault free lectures" },
      { skill: "Level Design", importance: "medium", learningResource: "World of Level Design tutorials; GDC Vault level design talks" },
    ],
    certifications: [
      { skill: "Game Development", certName: "Unity Certified Associate: Game Developer", provider: "Unity Technologies", url: "https://unity.com/products/unity-certifications", duration: "Self-study + exam", level: "Entry-Level", cost: "$150", whyRecommended: "Industry-recognized Unity credential; shows studios you have verified hands-on skills" },
      { skill: "Game Design", certName: "Game Design Certificate", provider: "CGMA (Computer Graphic Master Academy)", url: "https://www.cgmasteracademy.com/", duration: "10 weeks per course", level: "Professional", cost: "$900–$1,500/course", whyRecommended: "Highly regarded by AAA studios; courses taught by industry professionals" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Original Game Prototype", description: "Design and build a playable 15–30 minute game in Unity, with at least 2 levels and a core game loop.", why: "Playable prototypes are the only portfolio piece that truly matters in game design hiring.", actionStep: "Jam with a team at Global Game Jam or design a solo prototype over 2 weekends." },
      { type: "portfolio", title: "Game Design Document", description: "Write a full Game Design Document for an original IP: concept, systems, mechanics, economy, and level flow.", why: "GDDs demonstrate structured design thinking and communication skills valued at every studio.", actionStep: "Choose a genre, research 3 competitor games, and write a 20-page GDD." },
    ],
    networkingRecs: [
      { type: "networking", title: "IGDA (International Game Developers Association)", description: "Join IGDA and your local chapter for events, mentorship, and the annual IGDA Summit.", platform: "IGDA", url: "https://igda.org/", why: "Primary game developer community; access to studio contacts, scholarships, and job listings.", actionStep: "Join IGDA as a student member and attend one local chapter meetup." },
    ],
    jobTargets: [
      { type: "job_application", title: "Hitmarker Games Job Board", description: "Largest gaming-specific job board for design, development, and production roles.", platform: "Hitmarker", url: "https://hitmarker.net/", why: "Covers AAA, indie, mobile, and esports roles; the go-to board for game industry job seekers.", actionStep: "Search 'Game Designer' or 'Level Designer' and apply to 5 roles with your portfolio link." },
    ],
    milestones: [
      { title: "Core Design Skills", description: "Learn game design theory and build first prototypes", tasks: ["Read The Art of Game Design by Jesse Schell", "Complete Unity Learn beginner path", "Participate in one Global Game Jam or similar game jam"], estimatedWeeks: 16 },
      { title: "Portfolio Prototypes", description: "Build 2-3 polished playable games", tasks: ["Build a complete 2D platformer with original mechanics", "Build a puzzle or narrative game in a different genre", "Upload all prototypes to itch.io with documentation"], estimatedWeeks: 24 },
      { title: "Industry Entry", description: "Break into the industry through QA, junior designer, or indie path", tasks: ["Apply to 15+ junior game designer or QA tester positions", "Participate in indie game developer communities (TIGSource, itch.io)", "Attend GDC or a regional game conference"], estimatedWeeks: 16 },
    ],
  },

  // 17. Animator
  {
    id: "animator", title: "Animator", domain: "Arts & Entertainment",
    description: "Create movement and bring characters, objects, and environments to life for film, TV, games, and digital media using 2D or 3D animation tools.",
    interests: ["artistic", "realistic"], problemTypes: ["creative", "technical"], archetypes: ["builder", "ideator"],
    workStyles: ["open", "organized"], decisionStyle: ["intuiting", "thinking"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment"], coreValues: ["mastery", "autonomy"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["monotony", "micromanaged"], rewards: ["recognition", "learning"],
    environments: ["remote", "hybrid"], teamSizes: ["medium", "small"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate"], trajectories: ["specialist"],
    groupRoles: ["doer", "ideator"], requiredSkills: ["Maya or Blender", "12 Principles of Animation", "Character Rigging", "Motion Capture", "Compositing (After Effects/Nuke)"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Arts & Entertainment", "Design & UX"],
    pathwayTime: "2-4 years",
    skillGaps: [
      { skill: "Maya or Blender 3D Animation", importance: "high", learningResource: "AnimSchool free lectures; Blender Guru YouTube channel" },
      { skill: "12 Principles of Animation", importance: "high", learningResource: "The Animator's Survival Kit by Richard Williams" },
      { skill: "Character Rigging", importance: "medium", learningResource: "CGCircuit rigging courses; Rigging Dojo tutorials" },
    ],
    certifications: [
      { skill: "3D Animation", certName: "Autodesk Maya Associate Certification", provider: "Autodesk", url: "https://www.autodesk.com/certification/", duration: "Self-study + exam", level: "Entry-Level", cost: "$150", whyRecommended: "Verified Maya skills boost resume competitiveness for VFX and game studio positions" },
      { skill: "Motion Design", certName: "Adobe Certified Professional in After Effects", provider: "Adobe", url: "https://www.adobe.com/certifications/", duration: "Self-study + exam", level: "Professional", cost: "$180", whyRecommended: "Demonstrates motion graphics capability for broadcast, social media, and digital media roles" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Character Animation Demo Reel", description: "Create a 60–90 second demo reel showcasing body mechanics, acting, and lip sync in 3D.", why: "The demo reel is the only portfolio piece that gets you hired at studios; quality over quantity.", actionStep: "Animate 3 shots: a walk cycle, a physical action, and a dialogue scene." },
      { type: "portfolio", title: "Short Animated Film", description: "Produce a 60–120 second animated short with a complete story, characters, and sound.", why: "A narrative short demonstrates all-around production ability and storytelling judgment.", actionStep: "Write a 1-page story, design characters in 2D or 3D, and produce the full animation." },
    ],
    networkingRecs: [
      { type: "networking", title: "AnimSchool Community", description: "Join AnimSchool's free online community and animation critique sessions.", platform: "AnimSchool", url: "https://animschool.com/", why: "Direct access to Disney, DreamWorks, and Pixar animators for feedback and mentorship.", actionStep: "Post your first animation to the AnimSchool critique forum and ask for feedback." },
    ],
    jobTargets: [
      { type: "job_application", title: "Animation Career Review Job Board", description: "Animation-specific job board aggregating studio, game, and TV animation roles.", platform: "Animation Career Review", url: "https://www.animationcareerreview.com/jobs/", why: "Curated for animators with studio, broadcast, advertising, and game industry postings.", actionStep: "Search 'Junior Animator' and apply to 5 studios with your demo reel." },
    ],
    milestones: [
      { title: "Foundational Animation Skills", description: "Learn the 12 principles and primary software", tasks: ["Read The Animator's Survival Kit cover to cover", "Complete Blender Guru's 3D beginner series", "Animate 5 exercises: bouncing ball, walk cycle, flour sack, pendulum, pendulum with follow-through"], estimatedWeeks: 20 },
      { title: "Character Animation Portfolio", description: "Build a competitive demo reel", tasks: ["Animate 3 acting shots with audio", "Animate 2 physical/body mechanics shots", "Compile a 90-second demo reel"], estimatedWeeks: 24 },
      { title: "Studio Entry", description: "Apply and break into the industry", tasks: ["Post reel on Vimeo and AnimSchool critique", "Apply to 15+ junior animator and animation assistant roles", "Attend CTN Animation Expo or similar industry event"], estimatedWeeks: 16 },
    ],
  },

  // 18. Film Director
  {
    id: "film-director", title: "Film Director", domain: "Arts & Entertainment",
    description: "Lead the creative vision and execution of film, television, or digital media productions, guiding story, performance, and visual style.",
    interests: ["artistic", "enterprising"], problemTypes: ["creative", "strategic"], archetypes: ["ideator", "leader"],
    workStyles: ["open", "organized"], decisionStyle: ["intuiting", "feeling"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["experiment", "consult"], coreValues: ["autonomy", "purpose"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["monotony", "micromanaged"], rewards: ["recognition", "impact"],
    environments: ["onsite", "hybrid"], teamSizes: ["medium", "large"], paces: ["burst", "fast"],
    managementStyles: ["handsoff", "autonomy"], careerStages: ["building", "advancing"],
    riskLevels: ["high"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["leader", "ideator"], requiredSkills: ["Screenwriting", "Cinematography Fundamentals", "Directing Actors", "Production Management", "Post-Production Workflow"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Arts & Entertainment", "Media & Journalism"],
    pathwayTime: "5-10 years",
    skillGaps: [
      { skill: "Screenwriting", importance: "high", learningResource: "Save the Cat! by Blake Snyder; Final Draft 12 screenwriting software" },
      { skill: "Directing Actors", importance: "high", learningResource: "Directing Actors by Judith Weston; Masterclass David Lynch" },
      { skill: "Cinematography & Camera", importance: "high", learningResource: "No Film School; DSLR Video Shooter YouTube channel" },
    ],
    certifications: [
      { skill: "Film", certName: "DGA Training Program", provider: "Directors Guild of America", url: "https://www.dgatrainingprogram.org/", duration: "2-year training program", level: "Professional", cost: "Free (competitive entry)", whyRecommended: "The definitive path to union directing in Hollywood; alumni direct major TV and feature projects" },
      { skill: "Film Production", certName: "MFA in Film Directing", provider: "AFI, NYU Tisch, USC School of Cinematic Arts", url: "https://www.afi.edu/conservatory/", duration: "2 years", level: "Graduate", cost: "$40,000–$60,000/year", whyRecommended: "Top MFA programs provide production resources, industry connections, and graduate thesis films" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Short Film (10–15 Minutes)", description: "Write, direct, produce, and edit an original short film with professional-quality cinematography and sound.", why: "Short films are the director's calling card; festival selections are the primary hiring credential.", actionStep: "Write a 12-page script today, cast from local acting schools, and shoot on a DSLR or mirrorless." },
      { type: "portfolio", title: "Music Video", description: "Direct a music video for a local band or musician.", why: "Music videos demonstrate visual storytelling skill on a tight budget and timeline.", actionStep: "Reach out to 5 local bands on Bandcamp or SoundCloud and offer to direct a video for free." },
    ],
    networkingRecs: [
      { type: "networking", title: "Film Festivals (Sundance, SXSW, Tribeca)", description: "Submit short films to festivals and attend as a filmmaker.", platform: "Film Freeway", url: "https://filmfreeway.com/", why: "Festival selections lead directly to agent representation and studio opportunities.", actionStep: "Submit your short to 10 festivals on FilmFreeway this month." },
    ],
    jobTargets: [
      { type: "job_application", title: "Entertainment Careers.net", description: "Job board for film, TV, and entertainment industry production roles.", platform: "Entertainment Careers", url: "https://www.entertainmentcareers.net/", why: "Lists PA, AD, and director roles at production companies, networks, and streaming platforms.", actionStep: "Apply to 5 Production Assistant, 2nd AD, or Director's Assistant openings." },
    ],
    milestones: [
      { title: "Craft Foundations", description: "Master screenwriting, camera, and directing fundamentals", tasks: ["Write 3 short film scripts using Save the Cat structure", "Shoot 5 short narrative scenes on a DSLR or smartphone", "Study cinematography through DSLR Video Shooter and No Film School"], estimatedWeeks: 20 },
      { title: "First Shorts & Festival Circuit", description: "Produce portfolio short films", tasks: ["Direct and complete a 10-minute short film with a full crew", "Submit to 15+ film festivals via FilmFreeway", "Document production process for online audience"], estimatedWeeks: 32 },
      { title: "Industry Network & First Professional Work", description: "Break into paid directing work", tasks: ["Direct 3 music videos or branded content pieces", "Apply to DGA Training Program or an MFA program", "Build a director's website with reels and credits"], estimatedWeeks: 52 },
    ],
  },

  // 19. Musician (Professional)
  {
    id: "musician", title: "Musician", domain: "Arts & Entertainment",
    description: "Perform, record, and produce original or interpreted music across live, studio, and digital platforms.",
    interests: ["artistic"], problemTypes: ["creative"], archetypes: ["builder", "ideator"],
    workStyles: ["open"], decisionStyle: ["intuiting", "feeling"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["experiment"], coreValues: ["autonomy", "purpose"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["monotony", "micromanaged"], rewards: ["recognition", "learning"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "solo"], paces: ["burst", "steady"],
    managementStyles: ["handsoff", "autonomy"], careerStages: ["exploring", "building"],
    riskLevels: ["high"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["ideator", "doer"], requiredSkills: ["Instrument Proficiency", "Music Theory", "Recording/DAW (Ableton/Logic)", "Music Business & Licensing", "Live Performance"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Arts & Entertainment"],
    pathwayTime: "3-7 years",
    skillGaps: [
      { skill: "Music Production (Ableton or Logic Pro)", importance: "high", learningResource: "Coursera Berklee Online Music Production courses; YouTube: In The Mix" },
      { skill: "Music Business & Licensing", importance: "high", learningResource: "Music Business Worldwide; Billboard Pro; Berklee Online Music Business courses" },
      { skill: "Music Theory & Ear Training", importance: "medium", learningResource: "musictheory.net free lessons; LightNote.ca; Teoria.com" },
    ],
    certifications: [
      { skill: "Music Production", certName: "Berklee Online Certificate in Music Production", provider: "Berklee Online", url: "https://online.berklee.edu/certificate-programs/music-production", duration: "12 months self-paced", level: "Professional", cost: "$6,990", whyRecommended: "The most credible online music production credential; teaches production, mixing, and industry skills" },
      { skill: "Music Business", certName: "Music Business Certificate", provider: "Berklee Online", url: "https://online.berklee.edu/certificate-programs/music-business", duration: "12 months", level: "Professional", cost: "$6,990", whyRecommended: "Teaches artist management, publishing, licensing, and streaming royalties — critical for a sustainable career" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "EP Release (3–5 Songs)", description: "Record, mix, master, and release a 3–5 song EP on Spotify, Apple Music, and Bandcamp.", why: "A released, streaming EP is the minimum credibility threshold for professional bookings and licensing.", actionStep: "Write and record 3 songs in your home studio this month; use DistroKid for distribution." },
      { type: "portfolio", title: "Live Performance Video", description: "Record a professional-quality live performance video at a venue or in a studio session.", why: "Booking agents and venue managers require video evidence of live performance quality.", actionStep: "Book a set at a local open mic or venue and hire a videographer for one song." },
    ],
    networkingRecs: [
      { type: "networking", title: "ASCAP or BMI Membership", description: "Register as a performer and songwriter with ASCAP or BMI.", platform: "ASCAP/BMI", url: "https://www.ascap.com/", why: "PRO membership is required to collect performance royalties; networking events connect you to music supervisors.", actionStep: "Register your catalog with ASCAP or BMI today and file your first song registration." },
    ],
    jobTargets: [
      { type: "job_application", title: "GigSalad & The Bash", description: "Performer marketplaces connecting musicians with private event and corporate booking opportunities.", platform: "GigSalad", url: "https://www.gigsalad.com/", why: "Steady income stream for performing musicians while building reputation for larger venues.", actionStep: "Create a GigSalad profile with your performance video and set your booking rate." },
    ],
    milestones: [
      { title: "Craft & Production Skills", description: "Develop professional-level performance and production capability", tasks: ["Complete a music theory course through musictheory.net or Coursera", "Learn your primary DAW (Ableton or Logic) through 100+ hours of practice", "Record and self-produce 5 original songs"], estimatedWeeks: 26 },
      { title: "First Release & Live Performance", description: "Release music and build a live presence", tasks: ["Release an EP on all major streaming platforms via DistroKid", "Perform at 10 live shows (open mics to ticketed events)", "Register with ASCAP or BMI and file song registrations"], estimatedWeeks: 26 },
      { title: "Business Building", description: "Turn music into a sustainable career", tasks: ["Pitch music to sync licensing companies and music supervisors", "Build email list of 1,000 fans using Mailchimp", "Apply for artist grants (NEA, state arts councils, music foundation grants)"], estimatedWeeks: 52 },
    ],
  },

  // ── AGRICULTURE & ENVIRONMENT ─────────────────────────────────────────

  // 20. Environmental Engineer
  {
    id: "environmental-engineer", title: "Environmental Engineer", domain: "Agriculture & Environment",
    description: "Apply engineering principles to environmental problems, including pollution remediation, water treatment, waste management, and sustainability.",
    interests: ["investigative", "realistic"], problemTypes: ["technical", "scientific"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed"],
    ambiguityStyle: ["structure"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "tech_debt"], rewards: ["impact", "learning"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium"], paces: ["steady"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Environmental Regulations (EPA/CERCLA)", "Remediation Engineering", "Fate & Transport Modeling", "Permitting (NPDES, CAA)", "AutoCAD"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Agriculture & Environment"],
    pathwayTime: "4-6 years",
    skillGaps: [
      { skill: "EPA Regulations (CERCLA, RCRA, NPDES)", importance: "high", learningResource: "EPA.gov training resources; ENSR/Ramboll online regulatory training" },
      { skill: "Fate & Transport Modeling (MODFLOW/BIOSCREEN)", importance: "high", learningResource: "USGS MODFLOW tutorials; EPA groundwater modeling resources" },
      { skill: "Environmental Data Analysis (R or Python)", importance: "medium", learningResource: "DataCamp Environmental Data Science path" },
    ],
    certifications: [
      { skill: "Engineering", certName: "Professional Engineer (PE) – Environmental", provider: "NCEES", url: "https://ncees.org/engineering/pe/environmental/", duration: "FE exam + 4 years experience + PE exam", level: "Professional Licensure", cost: "$375", whyRecommended: "Required to sign environmental engineering design documents; dramatically increases career options" },
      { skill: "Environmental", certName: "CHMM (Certified Hazardous Materials Manager)", provider: "IHMM", url: "https://www.ihmm.org/get-certified/chmm", duration: "Experience + exam", level: "Professional", cost: "$300–$500", whyRecommended: "Recognized credential for environmental compliance, remediation, and hazmat roles" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Remedial Investigation Summary", description: "Compile a sample Remedial Investigation summary for a hypothetical contaminated site using EPA RI/FS framework.", why: "RI/FS documents are the core deliverable of environmental consulting; demonstrating the format impresses employers.", actionStep: "Download a public RI/FS from EPA's CERCLIS database and write a summary analysis." },
      { type: "portfolio", title: "NPDES Permit Application", description: "Prepare a sample NPDES stormwater permit application for a hypothetical industrial facility.", why: "Permitting experience is the most commonly required skill in environmental engineering job postings.", actionStep: "Download a state NPDES permit application form and complete it for a sample facility." },
    ],
    networkingRecs: [
      { type: "networking", title: "Air & Waste Management Association (A&WMA)", description: "Join A&WMA and attend local section meetings and the annual conference.", platform: "A&WMA", url: "https://www.awma.org/", why: "Key network for environmental engineers in air quality, waste, and regulatory compliance.", actionStep: "Join as a young professional member and attend one local section technical meeting." },
    ],
    jobTargets: [
      { type: "job_application", title: "Earthworks Environmental Jobs", description: "Environmental-specific job board with engineering, science, and regulatory roles.", platform: "EarthWorks Jobs", url: "https://www.earthworks-jobs.com/", why: "Curated for environmental science and engineering roles at consulting firms, agencies, and industry.", actionStep: "Search 'Environmental Engineer' and apply to 5 roles at consulting firms (Arcadis, AECOM, Tetra Tech)." },
    ],
    milestones: [
      { title: "FE Exam & Regulatory Knowledge", description: "Pass FE exam and build regulatory foundation", tasks: ["Pass NCEES FE Environmental exam", "Study CERCLA, RCRA, Clean Water Act, and Clean Air Act fundamentals", "Complete a summer internship at an environmental consulting firm"], estimatedWeeks: 24 },
      { title: "Consulting Career Development", description: "Build technical and project delivery skills", tasks: ["Complete 4 years of progressive experience at an environmental consulting firm", "Lead field sampling and remediation oversight on 2+ projects", "Draft a complete RI/FS or Phase II ESA report"], estimatedWeeks: 208 },
      { title: "PE Licensure & Specialization", description: "Achieve PE license and specialty expertise", tasks: ["Pass NCEES PE Environmental exam", "Earn CHMM certification", "Develop specialty in brownfields, groundwater, or air quality"], estimatedWeeks: 20 },
    ],
  },

  // 21. Conservation Biologist
  {
    id: "conservation-biologist", title: "Conservation Biologist", domain: "Agriculture & Environment",
    description: "Study and protect biodiversity, wildlife, and ecosystems through field research, policy advocacy, and habitat restoration.",
    interests: ["investigative", "social"], problemTypes: ["scientific", "strategic"], archetypes: ["thinker", "advocate"],
    workStyles: ["open", "organized"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "monotony"], rewards: ["impact", "learning"],
    environments: ["onsite", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "generalist"],
    groupRoles: ["analyst", "advocate"], requiredSkills: ["Field Data Collection", "GIS Mapping", "Species Identification", "Ecological Statistics (R)", "Grant Writing"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Agriculture & Environment"],
    pathwayTime: "4-6 years",
    skillGaps: [
      { skill: "Ecological Statistics in R", importance: "high", learningResource: "Mixed Effects Models and Extensions in Ecology with R; Coursera Data Science in R" },
      { skill: "GIS for Habitat Analysis", importance: "high", learningResource: "Esri ArcGIS training; QGIS conservation mapping tutorials" },
      { skill: "Grant Writing", importance: "medium", learningResource: "Grantcraft.org; Nature Conservancy grant writing guides" },
    ],
    certifications: [
      { skill: "Biology", certName: "Society for Conservation Biology (SCB) Student Membership", provider: "Society for Conservation Biology", url: "https://conbio.org/", duration: "Annual", level: "Professional", cost: "$25/year", whyRecommended: "Access to the Conservation Biology journal, job board, and global network of conservation professionals" },
      { skill: "GIS", certName: "Esri ArcGIS for Wildlife Management Certificate", provider: "Esri", url: "https://www.esri.com/training/catalog/search/", duration: "Self-paced", level: "Professional", cost: "$200–$400", whyRecommended: "GIS for wildlife habitat analysis is a required skill in most conservation biology jobs" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Species Distribution Model", description: "Use MaxEnt or R to model the habitat suitability for a threatened species using GBIF occurrence data.", why: "SDMs are a core tool in conservation planning; a completed model demonstrates technical competency.", actionStep: "Download occurrence data from GBIF.org and run a MaxEnt model for a declining bird species." },
      { type: "portfolio", title: "Conservation Plan Report", description: "Write a 15-page conservation management plan for a specific threatened ecosystem or species.", why: "Conservation plans are the primary deliverable for NGO and government biology positions.", actionStep: "Choose a local threatened habitat and write a management plan based on a similar NPS or USFWS plan." },
    ],
    networkingRecs: [
      { type: "networking", title: "Society for Conservation Biology (SCB)", description: "Join SCB, attend the International Congress for Conservation Biology (ICCB), and participate in working groups.", platform: "SCB", url: "https://conbio.org/", why: "Primary professional network for conservation biologists globally; job board and grant opportunities.", actionStep: "Join SCB and participate in one working group (marine, freshwater, terrestrial)." },
    ],
    jobTargets: [
      { type: "job_application", title: "USAJOBS – FWS/NPS Biologist Positions", description: "Federal biologist and wildlife refuge positions through USAJOBS.", platform: "USAJOBS", url: "https://www.usajobs.gov/", why: "USFWS and NPS employ the largest number of conservation biologists in the US.", actionStep: "Search 'Fish and Wildlife Biologist' on USAJOBS and apply to 3 GS-9/11 positions." },
    ],
    milestones: [
      { title: "Field Skills & Technical Foundation", description: "Build field research and analysis competencies", tasks: ["Volunteer on a field research project with a university or NGO", "Learn wildlife survey methods (point counts, transects, camera traps)", "Complete R statistical analysis course focused on ecological data"], estimatedWeeks: 24 },
      { title: "Graduate Research", description: "Develop research expertise and scientific credibility", tasks: ["Enroll in an MS program in Conservation Biology or Ecology", "Publish or co-author one peer-reviewed paper", "Apply for NSF Graduate Research Fellowship or similar funding"], estimatedWeeks: 104 },
      { title: "Professional Placement", description: "Secure government or NGO conservation position", tasks: ["Apply to USFWS, NPS, or TNC biologist positions", "Develop a species distribution model portfolio piece", "Present research at one SCB or TWS conference"], estimatedWeeks: 20 },
    ],
  },

  // ── LOGISTICS & OPERATIONS ────────────────────────────────────────────

  // 22. Supply Chain Manager
  {
    id: "supply-chain-manager", title: "Supply Chain Manager", domain: "Logistics & Operations",
    description: "Oversee end-to-end supply chain operations: procurement, inventory management, logistics, supplier relations, and demand planning.",
    interests: ["enterprising", "conventional"], problemTypes: ["analytical", "strategic"], archetypes: ["optimizer", "leader"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["impact", "mastery"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["unclear_requirements", "tech_debt"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium", "large"], paces: ["steady", "fast"],
    managementStyles: ["targets", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["leader", "analyst"], requiredSkills: ["ERP Systems (SAP/Oracle)", "Demand Forecasting", "Vendor Management", "Logistics & Transportation", "Lean/Six Sigma"],
    experienceLevels: ["mid", "senior"], domains: ["Logistics & Operations"],
    pathwayTime: "3-6 years",
    skillGaps: [
      { skill: "SAP SCM or Oracle Supply Chain", importance: "high", learningResource: "SAP Learning Hub free tutorials; Oracle University supply chain courses" },
      { skill: "Demand Planning & Forecasting", importance: "high", learningResource: "APICS CPIM study materials; IBF Demand Planning certification" },
      { skill: "Lean Six Sigma", importance: "medium", learningResource: "ASQ Six Sigma Green Belt study guide; Villanova online Lean Six Sigma course" },
    ],
    certifications: [
      { skill: "Supply Chain", certName: "APICS Certified in Production and Inventory Management (CPIM)", provider: "Association for Supply Chain Management (ASCM)", url: "https://www.ascm.org/cpim/", duration: "Self-study + 2 exams", level: "Professional", cost: "$730 (members) / $995 (non-members)", whyRecommended: "Most recognized supply chain operations credential; standard requirement in manufacturing and retail" },
      { skill: "Supply Chain", certName: "APICS Certified Supply Chain Professional (CSCP)", provider: "ASCM", url: "https://www.ascm.org/cscp/", duration: "Self-study + exam", level: "Professional", cost: "$1,145 (members) / $1,395 (non-members)", whyRecommended: "Strategic supply chain credential covering end-to-end global supply chain; preferred for manager-level roles" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Supply Chain Risk Assessment", description: "Map the supply chain for a publicly traded manufacturer and identify top 5 risk factors with mitigation strategies.", why: "Supply chain risk management is the #1 priority post-COVID; showing this skill differentiates candidates.", actionStep: "Use a company's 10-K filing and supplier disclosures to map their tier 1 and tier 2 supply chain." },
      { type: "portfolio", title: "Inventory Optimization Model", description: "Build an Excel or Python model to optimize reorder points, safety stock, and EOQ for a multi-SKU inventory.", why: "Inventory optimization models are used daily by supply chain analysts and managers.", actionStep: "Use publicly available retail inventory data and build an EOQ/safety stock model in Excel." },
    ],
    networkingRecs: [
      { type: "networking", title: "ASCM (Association for Supply Chain Management)", description: "Join ASCM and your local chapter for events, CPIM study groups, and networking.", platform: "ASCM", url: "https://www.ascm.org/", why: "Largest supply chain professional organization; job board, research, and credential support.", actionStep: "Join ASCM and attend one local chapter networking event or webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Supply Chain Jobs", description: "Search for Supply Chain Analyst, Demand Planner, and Supply Chain Manager roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most corporate supply chain roles are posted on LinkedIn by Fortune 500 companies and 3PLs.", actionStep: "Set job alerts for 'Supply Chain Manager' and apply to 5 roles at manufacturers or retailers." },
    ],
    milestones: [
      { title: "CPIM Certification", description: "Earn the foundational supply chain operations credential", tasks: ["Study APICS CPIM Part 1: Basics of Supply Chain Management", "Pass CPIM Part 1 exam", "Pass CPIM Part 2 exam"], estimatedWeeks: 20 },
      { title: "ERP System Proficiency", description: "Develop hands-on ERP and analytics skills", tasks: ["Complete SAP Learning Hub supply chain module", "Build an inventory optimization model in Excel or Python", "Manage a vendor relationship or RFQ process at work"], estimatedWeeks: 16 },
      { title: "CSCP & Leadership", description: "Achieve strategic supply chain credential and pursue manager roles", tasks: ["Pass APICS CSCP exam", "Lead a supply chain improvement project with documented results", "Apply to supply chain manager positions"], estimatedWeeks: 26 },
    ],
  },

  // 23. Operations Manager
  {
    id: "operations-manager", title: "Operations Manager", domain: "Logistics & Operations",
    description: "Oversee the day-to-day operational functions of a business, optimizing processes, managing teams, and driving efficiency and performance.",
    interests: ["enterprising", "conventional"], problemTypes: ["strategic", "analytical"], archetypes: ["optimizer", "leader"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "analytical"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["impact", "mastery"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["unclear_requirements", "tech_debt"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium", "large"], paces: ["steady", "fast"],
    managementStyles: ["targets", "mentorship"], careerStages: ["advancing", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["manager", "specialist"],
    groupRoles: ["leader", "analyst"], requiredSkills: ["Process Improvement", "KPI Management", "Budget Management", "Team Leadership", "Operations Software (ERP/HRIS)"],
    experienceLevels: ["mid", "senior"], domains: ["Logistics & Operations"],
    pathwayTime: "3-5 years",
    skillGaps: [
      { skill: "Lean Six Sigma Process Improvement", importance: "high", learningResource: "ASQ Lean Six Sigma Green Belt study guide; Coursera Six Sigma Fundamentals" },
      { skill: "Financial Acumen & P&L Management", importance: "high", learningResource: "Harvard Business School Online Finance for Non-Finance Managers" },
      { skill: "Operations Analytics (Tableau/Power BI)", importance: "medium", learningResource: "Tableau Public free training; Microsoft Power BI free learning" },
    ],
    certifications: [
      { skill: "Operations", certName: "Six Sigma Green Belt", provider: "ASQ (American Society for Quality)", url: "https://asq.org/cert/six-sigma-green-belt", duration: "Self-study + exam", level: "Professional", cost: "$438 (members) / $538 (non-members)", whyRecommended: "Most recognized process improvement credential; required or preferred for ops manager roles in manufacturing, healthcare, and tech" },
      { skill: "Project Management", certName: "Project Management Professional (PMP)", provider: "PMI", url: "https://www.pmi.org/certifications/project-management-pmp", duration: "Self-study + exam", level: "Professional", cost: "$405 (members) / $555 (non-members)", whyRecommended: "Cross-industry project management credential widely required for operations leadership" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Process Improvement Case Study", description: "Document a real or hypothetical process improvement project using DMAIC methodology, showing before/after KPIs.", why: "Case studies with quantified results are the #1 tool for proving operations management competency.", actionStep: "Identify an inefficient process in your current role and apply DMAIC to improve it." },
      { type: "portfolio", title: "Operations Dashboard", description: "Build a real-time KPI dashboard in Tableau or Power BI for tracking operational metrics.", why: "Data-driven decision-making is the hallmark of modern operations managers.", actionStep: "Download a public operations dataset and build a 5-metric operations dashboard." },
    ],
    networkingRecs: [
      { type: "networking", title: "APICS / ASCM Local Chapter", description: "Join ASCM and attend local operations and supply chain networking events.", platform: "ASCM", url: "https://www.ascm.org/", why: "Connects operations professionals across manufacturing, distribution, retail, and services.", actionStep: "Attend one local ASCM chapter meeting and follow up with 2 contacts on LinkedIn." },
    ],
    jobTargets: [
      { type: "job_application", title: "Indeed Operations Manager Jobs", description: "Search for Operations Manager, Director of Operations, and Operations Analyst roles.", platform: "Indeed", url: "https://www.indeed.com/q-operations-manager-jobs.html", why: "Operations manager is one of the most common management roles; broad range of industries and company sizes.", actionStep: "Apply to 5 Operations Manager or Senior Operations Analyst positions across industries." },
    ],
    milestones: [
      { title: "Process Improvement & Analytics", description: "Build the technical toolkit for operations leadership", tasks: ["Complete Lean Six Sigma Green Belt certification", "Build an operations KPI dashboard in Tableau or Power BI", "Document and present one process improvement project with ROI"], estimatedWeeks: 20 },
      { title: "Leadership Development", description: "Demonstrate team and financial management capability", tasks: ["Manage a cross-functional project team of 5+ people", "Own a departmental budget and deliver within 5% of target", "Complete PMP certification study and exam"], estimatedWeeks: 26 },
      { title: "Operations Manager Placement", description: "Land a management-level operations role", tasks: ["Apply to 15+ operations manager positions", "Prepare a portfolio of case studies with quantified results", "Negotiate first operations leadership role with direct reports"], estimatedWeeks: 16 },
    ],
  },

  // ── AVIATION ──────────────────────────────────────────────────────────

  // 24. Pilot (Commercial)
  {
    id: "commercial-pilot", title: "Commercial Pilot", domain: "Aviation",
    description: "Fly commercial aircraft transporting passengers or cargo safely according to FAA regulations and airline procedures.",
    interests: ["realistic", "investigative"], problemTypes: ["technical", "analytical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["structure"], coreValues: ["mastery", "prestige"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["unclear_requirements", "monotony"], rewards: ["learning", "recognition"],
    environments: ["onsite"], teamSizes: ["small"], paces: ["steady", "burst"],
    managementStyles: ["targets", "handsoff"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist"],
    groupRoles: ["leader", "doer"], requiredSkills: ["Flight Maneuvers", "Instrument Flying (IFR)", "CRM (Crew Resource Management)", "Aircraft Systems Knowledge", "FAA Regulations (FAR/AIM)"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Aviation"],
    pathwayTime: "3-6 years",
    skillGaps: [
      { skill: "Instrument Flying (IFR)", importance: "high", learningResource: "Sporty's Instrument Rating course; FAA Instrument Flying Handbook (free PDF)" },
      { skill: "FAA Regulations (FAR/AIM)", importance: "high", learningResource: "ASA FAR/AIM annual publication; Sheppard Air FAA exam prep" },
      { skill: "Multi-Engine Flying", importance: "high", learningResource: "AOPA multi-engine training resources; local Part 61/141 flight school" },
    ],
    certifications: [
      { skill: "Flying", certName: "Commercial Pilot Certificate (Multi-Engine Instrument)", provider: "FAA", url: "https://www.faa.gov/pilots/become/", duration: "18–36 months (250+ flight hours)", level: "Professional Licensure", cost: "$60,000–$100,000 total training", whyRecommended: "Required to fly for hire; minimum qualification for regional airline First Officer positions" },
      { skill: "Flying", certName: "Airline Transport Pilot (ATP) Certificate", provider: "FAA", url: "https://www.faa.gov/pilots/become/atp/", duration: "1,500 flight hours + exam", level: "Advanced Licensure", cost: "$3,000–$10,000 for ATP CTP + exam", whyRecommended: "Required by FAA to serve as Pilot in Command (Captain) of any airline aircraft" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "FAA Written Exams (Private, IFR, Commercial)", description: "Pass all FAA knowledge tests with scores above 90% and document them.", why: "High written test scores signal academic rigor and regulatory knowledge to airline recruiters.", actionStep: "Use Sheppard Air to study for your next FAA knowledge exam and aim for 90%+." },
      { type: "portfolio", title: "Flight Logbook (Organized)", description: "Maintain a well-organized logbook documenting flight hours, aircraft types, and special operations.", why: "Airlines scrutinize logbooks; a clean, detailed logbook demonstrates professionalism and attention to detail.", actionStep: "Migrate your flight log to ForeFlight or LogTen Pro for digital documentation and backup." },
    ],
    networkingRecs: [
      { type: "networking", title: "AOPA (Aircraft Owners and Pilots Association)", description: "Join AOPA for training resources, safety seminars, and the career pilot network.", platform: "AOPA", url: "https://www.aopa.org/", why: "Largest pilot organization; access to scholarship database, safety training, and career resources.", actionStep: "Join AOPA and complete one safety WINGS credit course online." },
    ],
    jobTargets: [
      { type: "job_application", title: "Airline Pilot Central Job Board", description: "Comprehensive database of regional and major airline pilot hiring, pay scales, and requirements.", platform: "Airline Pilot Central", url: "https://www.airlinepilotcentral.com/", why: "The definitive resource for pilot hiring timelines, minimums, and career advancement at airlines.", actionStep: "Research regional airline hiring minimums and apply to 3 regional carriers when eligible." },
    ],
    milestones: [
      { title: "Private Pilot & Instrument Rating", description: "Obtain PPL and IFR rating", tasks: ["Complete 40–60 hours and pass Private Pilot checkride", "Complete instrument rating (50 hours cross-country + training)", "Pass all FAA written exams with 85%+ scores"], estimatedWeeks: 52 },
      { title: "Commercial & Multi-Engine Rating", description: "Build hours and earn commercial certificate", tasks: ["Reach 250 total flight hours", "Add Commercial Pilot Certificate (single and multi-engine)", "Build 500+ hours as a flight instructor or other hour-building job"], estimatedWeeks: 78 },
      { title: "Airline Career Entry", description: "Meet ATP minimums and get hired at a regional airline", tasks: ["Reach 1,500 total flight hours (or 1,000 with military/Part 141 ATP pathway)", "Complete ATP-CTP course and written exam", "Apply to regional airlines and complete CJO and INDOC training"], estimatedWeeks: 78 },
    ],
  },

  // 25. Air Traffic Controller
  {
    id: "air-traffic-controller", title: "Air Traffic Controller", domain: "Aviation",
    description: "Direct and coordinate aircraft movements to maintain safe separation between aircraft in controlled airspace and at airports.",
    interests: ["realistic", "conventional"], problemTypes: ["technical", "analytical"], archetypes: ["optimizer", "thinker"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed"],
    ambiguityStyle: ["structure"], coreValues: ["mastery", "impact"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "no_impact"], rewards: ["learning", "recognition"],
    environments: ["onsite"], teamSizes: ["medium"], paces: ["fast", "burst"],
    managementStyles: ["targets", "handsoff"], careerStages: ["building"],
    riskLevels: ["low"], trajectories: ["specialist"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Radar Separation Standards", "Pilot Phraseology", "Aircraft Performance Knowledge", "TRACON/ARTCC Systems", "Emergency Procedures"],
    experienceLevels: ["student", "junior"], domains: ["Aviation"],
    pathwayTime: "3-5 years",
    skillGaps: [
      { skill: "FAA Regulations & Airspace Classification", importance: "high", learningResource: "FAA Aeronautical Information Manual (AIM) free PDF; Sheppard Air study tools" },
      { skill: "Radar Separation & Procedures", importance: "high", learningResource: "FAA JO 7110.65 Air Traffic Control Order (free from FAA.gov)" },
      { skill: "Aviation Weather & NOTAMs", importance: "medium", learningResource: "Aviation Weather Center (aviationweather.gov); King Schools Aviation Weather" },
    ],
    certifications: [
      { skill: "ATC", certName: "FAA Air Traffic Control Specialist Certificate", provider: "FAA (via USAJOBS federal hiring)", url: "https://www.usajobs.gov/", whyRecommended: "Official FAA credential awarded after completing FAA Academy training in Oklahoma City; required for all ATC work", duration: "12–24 months of FAA Academy + field training", level: "Professional Licensure", cost: "Paid training (federal salary)" },
      { skill: "ATC", certName: "CTI (Collegiate Training Initiative) Program", provider: "FAA-approved CTI colleges", url: "https://www.faa.gov/jobs/job_opportunities/air_traffic_jobs/cti/", duration: "2–4 year associate or bachelor's degree", level: "Entry Pathway", cost: "$10,000–$40,000 tuition", whyRecommended: "FAA CTI graduates have priority hiring at FAA facilities; the most reliable entry path into ATC" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "ATC Scenario Practice Log", description: "Use Vatsim or POSCON online ATC simulation to practice live radar separation and log 50+ hours of virtual controlling.", why: "Virtual ATC practice demonstrates commitment and helps develop situational awareness before FAA Academy.", actionStep: "Create a VATSIM account and complete the VATSIM Controller Training Program online." },
      { type: "portfolio", title: "Aviation Weather Decision Log", description: "Document 10 weather scenario analyses, demonstrating ability to read METARs, TAFs, SIGMETs, and PIREPs.", why: "Weather decision-making is tested at every stage of ATC training and evaluation.", actionStep: "Subscribe to Aviation Weather Center daily and practice writing weather briefings in writing." },
    ],
    networkingRecs: [
      { type: "networking", title: "NATCA (National Air Traffic Controllers Association)", description: "Connect with NATCA members and attend annual Communicating for Safety conference.", platform: "NATCA", url: "https://www.natca.org/", why: "NATCA union represents FAA controllers; connections help with facility selection and career advancement.", actionStep: "Attend a NATCA regional summit or student outreach event." },
    ],
    jobTargets: [
      { type: "job_application", title: "USAJOBS – FAA ATC Hiring Announcements", description: "All FAA air traffic controller positions are hired exclusively through USAJOBS.", platform: "USAJOBS", url: "https://www.usajobs.gov/", why: "FAA opens ATC hiring windows periodically; you must apply during an open announcement.", actionStep: "Set USAJOBS email alerts for 'Air Traffic Control Specialist' and apply the moment a window opens." },
    ],
    milestones: [
      { title: "CTI Education & ATSA", description: "Complete CTI program and pass the FAA aptitude test", tasks: ["Enroll in an FAA CTI college program", "Complete aviation fundamentals coursework", "Pass the ATSA (Air Traffic Skills Assessment) aptitude test"], estimatedWeeks: 104 },
      { title: "FAA Academy", description: "Complete Oklahoma City FAA Academy training", tasks: ["Pass FAA pre-employment medical exam", "Complete FAA Academy ATCS course (12 weeks)", "Pass all Academy examinations with 70%+ scores"], estimatedWeeks: 16 },
      { title: "Facility Training & CPC Certification", description: "Earn full CPC certification at assigned facility", tasks: ["Complete On-the-Job Training (OJT) at assigned FAA facility", "Pass all position certifications for assigned area", "Earn full Certified Professional Controller (CPC) status"], estimatedWeeks: 78 },
    ],
  },

  // ── HOSPITALITY ───────────────────────────────────────────────────────

  // 26. Hotel Manager
  {
    id: "hotel-manager", title: "Hotel Manager", domain: "Hospitality & Tourism",
    description: "Oversee daily hotel operations including front desk, housekeeping, food & beverage, revenue management, and guest experience.",
    interests: ["enterprising", "social"], problemTypes: ["strategic", "human"], archetypes: ["leader", "optimizer"],
    workStyles: ["organized", "methodical"], decisionStyle: ["thinking", "feeling"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["impact", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "no_impact"], rewards: ["impact", "recognition"],
    environments: ["onsite"], teamSizes: ["medium", "large"], paces: ["fast", "burst"],
    managementStyles: ["targets", "mentorship"], careerStages: ["advancing", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["manager", "specialist"],
    groupRoles: ["leader", "doer"], requiredSkills: ["Revenue Management", "Property Management Systems (Opera/Maestro)", "F&B Operations", "HR & Scheduling", "Guest Relations"],
    experienceLevels: ["mid", "senior"], domains: ["Hospitality & Tourism"],
    pathwayTime: "4-8 years",
    skillGaps: [
      { skill: "Revenue Management & Yield Optimization", importance: "high", learningResource: "Cornell eCornell Revenue Management course; HSMAI Revenue Management certification" },
      { skill: "Property Management System (Opera)", importance: "high", learningResource: "Oracle Opera free training on Oracle University" },
      { skill: "F&B Cost Control", importance: "medium", learningResource: "American Hotel & Lodging Educational Institute (AHLEI) Food & Beverage courses" },
    ],
    certifications: [
      { skill: "Hospitality", certName: "Certified Hotel Administrator (CHA)", provider: "American Hotel & Lodging Educational Institute (AHLEI)", url: "https://www.ahlei.org/certifications/", duration: "Experience + exam", level: "Professional", cost: "$395", whyRecommended: "Most recognized hotel management credential; required for GM positions at major branded properties" },
      { skill: "Revenue", certName: "CRME (Certified Revenue Management Executive)", provider: "HSMAI", url: "https://americas.hsmai.org/talent/certifications/crme/", duration: "Experience + exam", level: "Professional", cost: "$495 (members) / $695 (non-members)", whyRecommended: "Revenue management is the highest-impact skill for hotel profitability; CRME signals expertise to owners and brands" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Hotel Revenue Management Plan", description: "Develop a 12-month revenue strategy for a 150-room select-service hotel, including rate strategy, channel mix, and demand forecasting.", why: "Revenue management is the key competency evaluated in GM hiring; a documented plan shows business acumen.", actionStep: "Use STR data and a competitor hotel's public rates to build a rate strategy in Excel." },
      { type: "portfolio", title: "Guest Satisfaction Improvement Plan", description: "Analyze TripAdvisor or Google reviews for a real hotel and develop a 90-day action plan to address top guest complaints.", why: "Guest satisfaction scores (GSS/OSAT) are how brands measure hotel manager performance.", actionStep: "Pull 50 recent reviews from TripAdvisor and build a root cause analysis with action items." },
    ],
    networkingRecs: [
      { type: "networking", title: "AHLEI Hospitality Network", description: "Join AHLEI's online community and attend HITEC hospitality technology conference.", platform: "AHLEI", url: "https://www.ahlei.org/", why: "Access to hotel brand hiring pipelines, CHA study resources, and GM mentorship network.", actionStep: "Create an AHLEI account and join one online professional community forum." },
    ],
    jobTargets: [
      { type: "job_application", title: "Hcareers Hospitality Jobs", description: "Largest hospitality-specific job board for hotel, resort, and restaurant management roles.", platform: "Hcareers", url: "https://www.hcareers.com/", why: "Used by Marriott, Hilton, Hyatt, IHG, and independent hotels for all management postings.", actionStep: "Search 'Assistant General Manager' or 'Hotel Manager' and apply to 5 branded property roles." },
    ],
    milestones: [
      { title: "Departmental Mastery", description: "Lead a hotel department and master operations fundamentals", tasks: ["Manage front desk, housekeeping, or F&B department for 2+ years", "Become proficient in Opera or equivalent PMS", "Complete AHLEI Rooms Division Management course"], estimatedWeeks: 104 },
      { title: "Revenue & Financial Skills", description: "Develop GM-level financial competencies", tasks: ["Complete eCornell Revenue Management certification", "Own a departmental P&L and deliver results", "Shadow hotel GM through budget season"], estimatedWeeks: 26 },
      { title: "GM Placement", description: "Achieve first General Manager position", tasks: ["Earn CHA certification", "Apply to AGM or GM positions at select-service properties", "Complete 90-day onboarding plan at first GM role"], estimatedWeeks: 26 },
    ],
  },

  // 27. Event Planner
  {
    id: "event-planner", title: "Event Planner", domain: "Hospitality & Tourism",
    description: "Coordinate and manage all aspects of events — from corporate conferences to weddings — including venue, vendors, logistics, and guest experience.",
    interests: ["enterprising", "artistic"], problemTypes: ["creative", "strategic"], archetypes: ["builder", "leader"],
    workStyles: ["organized", "open"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["impact", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "monotony"], rewards: ["recognition", "impact"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["targets", "handsoff"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["leader", "doer"], requiredSkills: ["Event Budgeting", "Vendor Management", "Event Design", "Contract Negotiation", "CRM & Event Software (Cvent/Eventbrite)"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Hospitality & Tourism"],
    pathwayTime: "1-3 years",
    skillGaps: [
      { skill: "Event Software (Cvent or Eventbrite)", importance: "high", learningResource: "Cvent Academy free certification courses; Eventbrite Organizer free training" },
      { skill: "Event Budgeting & Financial Management", importance: "high", learningResource: "MPI (Meeting Professionals International) budget training; PCMA education" },
      { skill: "Event Design & Décor", importance: "medium", learningResource: "NACE (National Association for Catering and Events) design courses" },
    ],
    certifications: [
      { skill: "Event Planning", certName: "Certified Meeting Professional (CMP)", provider: "Events Industry Council (EIC)", url: "https://eventscouncil.org/cmp/", duration: "Experience + exam", level: "Professional", cost: "$375 (members) / $475 (non-members)", whyRecommended: "Most recognized event planning credential globally; standard for corporate and association events careers" },
      { skill: "Event Planning", certName: "Certified Special Events Professional (CSEP)", provider: "ISES (International Live Events Association)", url: "https://www.ileahub.com/csep", duration: "Experience + exam", level: "Professional", cost: "$350–$500", whyRecommended: "Credential focused on live events and social events including galas, weddings, and festivals" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Corporate Event Proposal", description: "Develop a full event proposal for a 200-person corporate conference: venue, F&B, AV, agenda, and budget.", why: "Event proposals are how planners win business; a polished proposal shows client-ready competency.", actionStep: "Write a sample proposal for a fictional 'TechCorp Annual Sales Summit' as if pitching to a client." },
      { type: "portfolio", title: "Event Website & Registration Page", description: "Build a complete event landing page with registration, agenda, and speaker bios using Eventbrite or Whova.", why: "Digital event management skills are now required for all event planners.", actionStep: "Create a real (even if small) event page for a community or networking event you organize." },
    ],
    networkingRecs: [
      { type: "networking", title: "MPI (Meeting Professionals International)", description: "Join MPI and attend chapter monthly meetings and MPI World Education Congress.", platform: "MPI", url: "https://www.mpi.org/", why: "Largest event planning professional organization; CMP study resources and employer connections.", actionStep: "Join MPI as an emerging professional member and attend one chapter luncheon." },
    ],
    jobTargets: [
      { type: "job_application", title: "Hcareers Events & Catering Jobs", description: "Hospitality job board with event coordinator and event manager roles.", platform: "Hcareers", url: "https://www.hcareers.com/", why: "Lists event roles at hotels, convention centers, nonprofits, and event agencies.", actionStep: "Search 'Event Coordinator' and apply to 5 corporate or hotel event positions." },
    ],
    milestones: [
      { title: "Event Logistics Foundation", description: "Learn event planning fundamentals through training and volunteer events", tasks: ["Complete Cvent Academy certification", "Volunteer to manage logistics for 3 local community events", "Learn event budgeting using MPI's template resources"], estimatedWeeks: 12 },
      { title: "First Paid Events", description: "Build a client portfolio", tasks: ["Coordinate 5 paid events of increasing complexity", "Build an event planning portfolio with photos and testimonials", "Set up an event planning website or LinkedIn portfolio page"], estimatedWeeks: 24 },
      { title: "CMP Certification", description: "Achieve professional event planning credential", tasks: ["Accumulate 36 months of event planning experience for CMP eligibility", "Complete EIC CMP exam prep course", "Pass the CMP examination"], estimatedWeeks: 52 },
    ],
  },

  // 28. Chef (Executive)
  {
    id: "executive-chef", title: "Chef", domain: "Hospitality & Tourism",
    description: "Create menus, lead kitchen brigades, manage food cost and quality, and deliver exceptional culinary experiences in restaurants, hotels, or catering.",
    interests: ["artistic", "realistic"], problemTypes: ["creative", "technical"], archetypes: ["builder", "ideator"],
    workStyles: ["open", "organized"], decisionStyle: ["intuiting", "thinking"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["experiment"], coreValues: ["mastery", "autonomy"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["monotony", "micromanaged"], rewards: ["recognition", "mastery"],
    environments: ["onsite"], teamSizes: ["small", "medium"], paces: ["fast", "burst"],
    managementStyles: ["handsoff", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["leader", "doer"], requiredSkills: ["Classical Knife Skills", "Menu Development", "Food Cost Management", "HACCP Food Safety", "Kitchen Brigade Leadership"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Hospitality & Tourism"],
    pathwayTime: "5-10 years",
    skillGaps: [
      { skill: "Advanced Culinary Techniques (French/Modernist)", importance: "high", learningResource: "CIA Pro Chef textbook; Jacques Pepin Heart & Soul cookbook and YouTube" },
      { skill: "Food Cost Management & Recipe Costing", importance: "high", learningResource: "Restaurant365 free webinars; Chef's pencil food cost calculator guides" },
      { skill: "HACCP Food Safety Management", importance: "high", learningResource: "ServSafe Manager Certification course from NRA" },
    ],
    certifications: [
      { skill: "Food Safety", certName: "ServSafe Food Manager Certification", provider: "National Restaurant Association", url: "https://www.servsafe.com/", duration: "8-hour course + exam", level: "Required in most states", cost: "$125–$175", whyRecommended: "Required by law for food service managers in most US states; absolute first credential for any chef" },
      { skill: "Culinary", certName: "ACF Certified Culinarian (CC) or Certified Chef de Cuisine (CCC)", provider: "American Culinary Federation (ACF)", url: "https://www.acfchefs.org/ACF/Certify/", duration: "Experience + practical exam + written exam", level: "Professional", cost: "$100–$300", whyRecommended: "ACF certifications validate culinary skill levels; CCC is the benchmark for executive chef hiring at major properties" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Original Tasting Menu", description: "Develop and execute a 5-course tasting menu with full recipe documentation, plating guides, and food cost analysis.", why: "An original tasting menu demonstrates creativity, technique, and business acumen together.", actionStep: "Host a dinner for 10 guests, photograph every course, and document all recipes and costs." },
      { type: "portfolio", title: "Restaurant Menu Redesign", description: "Take an existing restaurant's menu and redesign it for profitability: menu engineering analysis, star/dog categorization, and new dishes.", why: "Menu engineering is the #1 business skill that separates line cooks from executive chefs.", actionStep: "Download a public restaurant menu and apply menu engineering principles to redesign it." },
    ],
    networkingRecs: [
      { type: "networking", title: "ACF (American Culinary Federation) Chapters", description: "Join your local ACF chapter for chef competitions, networking dinners, and certification support.", platform: "ACF", url: "https://www.acfchefs.org/", why: "ACF chapters connect line cooks to executive chefs and food industry professionals.", actionStep: "Join your local ACF chapter and compete in one ACF student or young chef competition." },
    ],
    jobTargets: [
      { type: "job_application", title: "Culinary Agents", description: "Hospitality and culinary-specific job board used by top restaurants, hotels, and catering companies.", platform: "Culinary Agents", url: "https://www.culinaryagents.com/", why: "The most widely used job platform in the professional culinary world; used by Michelin-starred restaurants.", actionStep: "Create a Culinary Agents profile with your experience, photos, and knife skills, and apply to 5 roles." },
    ],
    milestones: [
      { title: "Culinary Foundations", description: "Build classical technique and food safety credentials", tasks: ["Pass ServSafe Food Manager certification", "Master all mother sauces and knife skills through daily practice", "Stage (intern) at 2 restaurants of different cuisine types"], estimatedWeeks: 26 },
      { title: "Brigade Experience & Leadership", description: "Advance through kitchen stations to sous chef", tasks: ["Work all stations in a full-service kitchen (cold, hot, pastry)", "Become sous chef or kitchen supervisor at a restaurant", "Develop and cost 10 original dishes for a menu"], estimatedWeeks: 156 },
      { title: "Executive Chef Transition", description: "Lead a kitchen as executive chef", tasks: ["Earn ACF Certified Chef de Cuisine (CCC) credential", "Develop a complete restaurant menu with full cost analysis", "Open or overhaul a restaurant kitchen as executive chef"], estimatedWeeks: 52 },
    ],
  },

  // ── SCIENCE & RESEARCH ────────────────────────────────────────────────

  // 29. Research Scientist
  {
    id: "research-scientist", title: "Research Scientist", domain: "Science & Research",
    description: "Design and conduct original scientific experiments, analyze data, and publish findings to advance knowledge in a specific scientific domain.",
    interests: ["investigative"], problemTypes: ["scientific", "analytical"], archetypes: ["thinker", "optimizer"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["experiment", "structure"], coreValues: ["mastery", "purpose"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "micromanaged"], rewards: ["learning", "impact"],
    environments: ["onsite", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["Experimental Design", "Statistical Analysis", "Scientific Writing", "Python or R", "Literature Review & Citation Management"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Science & Research"],
    pathwayTime: "5-8 years (PhD typically required)",
    skillGaps: [
      { skill: "Experimental Design & DOE", importance: "high", learningResource: "Design of Experiments by Douglas Montgomery; Coursera Research Methods Specialization" },
      { skill: "Statistical Analysis (R or Python)", importance: "high", learningResource: "DataCamp Data Science in Python; StatQuest with Josh Starmer (YouTube)" },
      { skill: "Scientific Writing & Publication", importance: "high", learningResource: "Writing Your Journal Article in Twelve Weeks by Wendy Belcher; Coursera Scientific Writing" },
    ],
    certifications: [
      { skill: "Research", certName: "PhD in Relevant Scientific Discipline", provider: "Accredited research university", url: "https://www.petersons.com/graduate-schools/", duration: "4–6 years", level: "Graduate", cost: "Often fully funded with stipend in STEM fields", whyRecommended: "Required for independent research scientist positions at universities, national labs, and R&D divisions" },
      { skill: "Data Analysis", certName: "SAS Certified Statistical Business Analyst", provider: "SAS Institute", url: "https://www.sas.com/en_us/certification/credentials/advanced-analytics/statistical-business-analyst.html", duration: "Self-study + exam", level: "Professional", cost: "$250", whyRecommended: "Validates advanced statistical analysis skills for industry research scientist positions" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Published or Pre-Print Research Paper", description: "Design, execute, and write up a research study and submit to a peer-reviewed journal or post to bioRxiv/arXiv.", why: "Publications are the primary currency of scientific credibility; even one first-author paper transforms your career.", actionStep: "Identify a gap in existing literature in your field and design a study to address it this semester." },
      { type: "portfolio", title: "Reproducible Data Analysis Pipeline", description: "Build a fully reproducible analysis pipeline in R or Python with documented code and datasets.", why: "Reproducibility is a critical skill in modern science; a public GitHub repo demonstrates computational rigor.", actionStep: "Reanalyze a published paper's dataset and document your pipeline on GitHub." },
    ],
    networkingRecs: [
      { type: "networking", title: "ResearchGate & Academia.edu", description: "Create profiles and share research on ResearchGate and Academia.edu.", platform: "ResearchGate", url: "https://www.researchgate.net/", why: "The primary professional network for researchers; builds citation presence and connects you to collaborators.", actionStep: "Create a ResearchGate profile and upload your papers and current research interests." },
    ],
    jobTargets: [
      { type: "job_application", title: "Science Careers (AAAS)", description: "Job board from the American Association for the Advancement of Science.", platform: "Science Careers", url: "https://jobs.sciencecareers.org/", why: "The most respected scientific job board; lists positions at universities, national labs, biotech, and pharma.", actionStep: "Set up alerts for research scientist roles in your field and apply to 5 industry or academic positions." },
    ],
    milestones: [
      { title: "Graduate Training", description: "Complete advanced scientific training and publish first research", tasks: ["Complete coursework and qualifying exams in PhD program", "Publish or co-author first peer-reviewed paper", "Present research at one national conference (ACS, AAAS, Gordon Research Conference)"], estimatedWeeks: 104 },
      { title: "Postdoctoral Research", description: "Develop independent research agenda and build publication record", tasks: ["Complete 2–3 year postdoctoral fellowship at a leading institution", "Publish 3+ first-author papers", "Apply for independent research grants (NIH K award, NSF CAREER)"], estimatedWeeks: 156 },
      { title: "Independent Scientist", description: "Establish an independent research position", tasks: ["Apply to faculty positions or industry research scientist roles", "Build and lead a research group or cross-functional R&D team", "Secure independent research funding"], estimatedWeeks: 52 },
    ],
  },

  // 30. Pharmacist
  {
    id: "pharmacist", title: "Pharmacist", domain: "Science & Research",
    description: "Dispense medications, counsel patients on drug therapy, review prescriptions for safety, and collaborate with physicians to optimize medication regimens.",
    interests: ["investigative", "social"], problemTypes: ["scientific", "human"], archetypes: ["thinker", "optimizer"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["purpose", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["unclear_requirements", "no_impact"], rewards: ["impact", "learning"],
    environments: ["onsite"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["targets", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "manager"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["Drug Information & Pharmacology", "Clinical Drug Review", "Pharmacy Law & Ethics", "Patient Counseling", "Drug Utilization Review"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Science & Research", "Healthcare"],
    pathwayTime: "6-8 years (PharmD required)",
    skillGaps: [
      { skill: "Clinical Pharmacology & Therapeutics", importance: "high", learningResource: "Pharmacotherapy: A Pathophysiologic Approach (DiPiro et al.) 12th edition" },
      { skill: "Pharmacy Law (HIPAA, DEA Regulations)", importance: "high", learningResource: "Federal Pharmacy Law by Alan Leal (MPJE prep book)" },
      { skill: "Medication Therapy Management (MTM)", importance: "medium", learningResource: "APhA MTM Certificate Training Program" },
    ],
    certifications: [
      { skill: "Pharmacy", certName: "Doctor of Pharmacy (PharmD)", provider: "ACPE-accredited pharmacy school", url: "https://www.acpe-accredit.org/find-an-accredited-program/", duration: "4 years (post-BS)", level: "Graduate", cost: "$30,000–$55,000/year", whyRecommended: "Required degree for pharmacist licensure in the United States" },
      { skill: "Pharmacy", certName: "NAPLEX (North American Pharmacist Licensure Examination)", provider: "NABP", url: "https://nabp.pharmacy/programs/naplex/", duration: "4.25-hour exam", level: "Required Licensure", cost: "$680", whyRecommended: "Required for pharmacist licensure in all US states; measures clinical and pharmaceutical knowledge" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Drug Therapy Case Presentation", description: "Prepare a clinical case presentation on an ambulatory care patient's medication therapy, with SOAP note and therapeutic recommendations.", why: "Case presentations are the primary PharmD clinical competency demonstration; essential for residency matching.", actionStep: "During IPPE/APPE rotations, document one complex patient case with full pharmacist workup." },
      { type: "portfolio", title: "Drug Information Response", description: "Write a formal drug information response to a clinical question using primary literature and evidence grading.", why: "Drug information skills distinguish clinical pharmacists from dispensing-only practitioners.", actionStep: "Answer a clinical pharmacy question using PubMed systematic reviews and evidence-based guidelines." },
    ],
    networkingRecs: [
      { type: "networking", title: "APhA (American Pharmacists Association)", description: "Join APhA as a student and attend the Annual Meeting & Exposition.", platform: "APhA", url: "https://www.pharmacist.com/", why: "Primary national pharmacy organization; job board, residency program resources, and specialty certification.", actionStep: "Join APhA as a student member and attend one virtual continuing education program." },
    ],
    jobTargets: [
      { type: "job_application", title: "RxCareerCenter (APhA Job Board)", description: "Pharmacy-specific job board with retail, clinical, hospital, and ambulatory care pharmacist openings.", platform: "RxCareerCenter", url: "https://www.rxcareercenter.com/", why: "The APhA-affiliated job board; lists pharmacist openings from CVS, Walgreens, hospital systems, and PBMs.", actionStep: "Search for new grad pharmacist or clinical pharmacist positions and apply to 5 roles." },
    ],
    milestones: [
      { title: "PharmD Education", description: "Complete pharmacy school and required clinical rotations", tasks: ["Complete P1–P2 didactic coursework and IPPE rotations", "Match into 3 APPE rotations aligned with your practice interest", "Pass the MPJE (pharmacy law exam) for your state"], estimatedWeeks: 208 },
      { title: "NAPLEX & Licensure", description: "Achieve pharmacist licensure", tasks: ["Study with RxPrep NAPLEX review course", "Pass the NAPLEX exam", "Apply for pharmacist license in your state"], estimatedWeeks: 16 },
      { title: "Specialty Practice", description: "Develop advanced practice credentials", tasks: ["Complete a PGY-1 pharmacy residency (optional but increasingly expected)", "Earn Board Certified Pharmacotherapy Specialist (BCPS) or specialty BPS credential", "Develop clinical niche (oncology, cardiology, ambulatory care, ID)"], estimatedWeeks: 52 },
    ],
  },

  // 31. Veterinarian
  {
    id: "veterinarian", title: "Veterinarian", domain: "Science & Research",
    description: "Diagnose and treat diseases and injuries in animals, advise animal owners, and protect public health through zoonotic disease surveillance.",
    interests: ["investigative", "social"], problemTypes: ["scientific", "human"], archetypes: ["thinker", "optimizer"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["purpose", "mastery"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "monotony"], rewards: ["impact", "learning"],
    environments: ["onsite"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["Clinical Diagnosis", "Surgical Skills", "Pharmacology", "Animal Handling", "Client Communication"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Science & Research", "Healthcare"],
    pathwayTime: "8-10 years (DVM required)",
    skillGaps: [
      { skill: "Clinical Diagnosis & Physical Exam", importance: "high", learningResource: "Small Animal Internal Medicine by Richard Nelson; NAVLE prep resources" },
      { skill: "Surgical Techniques", importance: "high", learningResource: "Veterinary Surgery: Small Animal (Johnston & Tobias); wet-lab surgical training" },
      { skill: "Veterinary Pharmacology", importance: "high", learningResource: "Veterinary Drug Handbook by Donald Plumb; NAVLE pharmacology review" },
    ],
    certifications: [
      { skill: "Veterinary Medicine", certName: "Doctor of Veterinary Medicine (DVM)", provider: "AVMA-accredited veterinary school", url: "https://www.avma.org/education/", duration: "4 years", level: "Graduate", cost: "$30,000–$70,000/year", whyRecommended: "Required degree for veterinarian licensure in the United States" },
      { skill: "Veterinary", certName: "North American Veterinary Licensing Examination (NAVLE)", provider: "NBVME", url: "https://www.nbvme.org/navle/", duration: "6.5-hour computer adaptive exam", level: "Required Licensure", cost: "$635", whyRecommended: "Required for veterinarian licensure in all US states and Canada; tests comprehensive clinical competency" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Clinical Rotation Case Log", description: "Maintain a detailed case log from clinical rotations documenting patient cases, diagnoses, and procedures completed.", why: "A well-documented case log demonstrates clinical breadth and is reviewed during internship and residency applications.", actionStep: "Begin logging every patient case from your clinical year rotations using the Ecovet or Vet Folio app." },
      { type: "portfolio", title: "Community Veterinary Outreach Event", description: "Organize a low-cost vaccine clinic or community pet health fair.", why: "Community service demonstrates leadership and commitment to public health; valued by employers and in residency applications.", actionStep: "Partner with a local animal shelter or community organization to run a vaccine clinic." },
    ],
    networkingRecs: [
      { type: "networking", title: "AVMA (American Veterinary Medical Association)", description: "Join AVMA and your state VMA for networking, CEs, and the AVMA Annual Convention.", platform: "AVMA", url: "https://www.avma.org/", why: "Primary national veterinary professional organization; job board, career resources, and specialty board connections.", actionStep: "Join AVMA as a student member and attend one AVMA continuing education webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "VetJobs (AVMA Career Center)", description: "AVMA-affiliated job board with small animal, large animal, exotic, zoo, and corporate veterinary roles.", platform: "VetJobs", url: "https://veterinarycareercenter.avma.org/", why: "Used by all major veterinary employers: private practices, corporate groups (VCA, Banfield), USDA, military.", actionStep: "Create a profile and apply to 5 associate veterinarian or new grad veterinarian positions." },
    ],
    milestones: [
      { title: "Pre-Vet & Admissions", description: "Build competitive vet school application", tasks: ["Complete biology, chemistry, biochemistry, and physics prerequisites", "Accumulate 300+ hours of veterinary experience (small and large animal)", "Pass GRE and submit VMCAS application to AVMA-accredited schools"], estimatedWeeks: 156 },
      { title: "DVM Education & Clinical Year", description: "Complete veterinary school and clinical rotations", tasks: ["Complete pre-clinical didactic years with strong GPA", "Rotate through all major clinical departments (internal medicine, surgery, emergency)", "Pass NAVLE board exam"], estimatedWeeks: 208 },
      { title: "Career Placement or Residency", description: "Begin independent veterinary practice", tasks: ["Apply to associate veterinarian positions or apply for internship/residency matching", "Earn first state veterinary license", "Join AVMA and state VMA"], estimatedWeeks: 16 },
    ],
  },

  // ── SOCIAL SERVICES ───────────────────────────────────────────────────

  // 32. Social Worker
  {
    id: "social-worker", title: "Social Worker", domain: "Social Services",
    description: "Help individuals and families access resources, cope with challenges, and improve their well-being across community, healthcare, and government settings.",
    interests: ["social", "investigative"], problemTypes: ["human", "strategic"], archetypes: ["advocate", "communicator"],
    workStyles: ["empathetic", "organized"], decisionStyle: ["feeling", "thinking"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["consult", "structure"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "unclear_requirements"], rewards: ["impact", "learning"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "medium"], paces: ["steady"],
    managementStyles: ["mentorship", "handsoff"], careerStages: ["exploring", "building"],
    riskLevels: ["low"], trajectories: ["specialist", "manager"],
    groupRoles: ["advocate", "doer"], requiredSkills: ["Case Management", "Crisis Intervention", "Motivational Interviewing", "DSM Assessment", "Resource Navigation"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Social Services", "Healthcare"],
    pathwayTime: "2-4 years",
    skillGaps: [
      { skill: "Motivational Interviewing", importance: "high", learningResource: "MINT (Motivational Interviewing Network of Trainers) workshops; free MI training videos on YouTube" },
      { skill: "DSM-5 Assessment & Diagnosis", importance: "high", learningResource: "DSM-5-TR; ASWB Clinical Study Guide for LCSW exam" },
      { skill: "Trauma-Informed Practice", importance: "medium", learningResource: "SAMHSA Trauma-Informed Approach guide (free PDF); NASW trauma training" },
    ],
    certifications: [
      { skill: "Social Work", certName: "Licensed Clinical Social Worker (LCSW)", provider: "State Social Work Licensing Board", url: "https://www.aswb.org/", whyRecommended: "Required to practice clinical social work independently; enables private practice and highest billing rates", duration: "MSW + 2 years supervised experience + exam", level: "Advanced Licensure", cost: "$230 (ASWB exam fee)" },
      { skill: "Social Work", certName: "Licensed Master Social Worker (LMSW)", provider: "State Social Work Licensing Board", url: "https://www.aswb.org/", duration: "MSW + exam", level: "Entry Licensure", cost: "$230 (ASWB exam fee)", whyRecommended: "First license after MSW; enables employment in clinical settings under supervision" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Case Assessment & Treatment Plan", description: "Write a complete bio-psycho-social assessment and individualized treatment plan for a hypothetical client.", why: "Case assessments are the core clinical deliverable; this is tested in LCSW exams and job interviews.", actionStep: "Use the NASW practice framework to write a sample assessment for a complex client scenario." },
      { type: "portfolio", title: "Community Needs Assessment", description: "Conduct a mini community needs assessment for your neighborhood using Census data and local service gap analysis.", why: "Macro social work skills are increasingly valued at nonprofits and government agencies.", actionStep: "Download Census ACS data for your zip code and identify 3 unmet social service gaps." },
    ],
    networkingRecs: [
      { type: "networking", title: "NASW (National Association of Social Workers)", description: "Join NASW and your state chapter for networking, CEs, and the NASW Annual Conference.", platform: "NASW", url: "https://www.socialworkers.org/", why: "Primary professional organization for social workers; career center, licensure support, and advocacy network.", actionStep: "Join NASW as a student member and attend one local chapter event or webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "SocialWorkJobBank (NASW)", description: "NASW-affiliated job board with clinical, macro, and school social work openings.", platform: "SocialWorkJobBank", url: "https://www.socialworkjobbank.com/", why: "Used by hospitals, nonprofits, government agencies, and schools seeking licensed social workers.", actionStep: "Search 'LMSW' or 'Social Worker' in your city and apply to 5 open positions." },
    ],
    milestones: [
      { title: "MSW Education & Field Placement", description: "Complete master's social work education with field hours", tasks: ["Complete 60-credit MSW program with clinical concentration", "Complete 900+ field practicum hours across 2 placements", "Learn evidence-based practices: CBT, DBT, motivational interviewing"], estimatedWeeks: 104 },
      { title: "LMSW Licensure", description: "Earn entry-level social work license", tasks: ["Pass ASWB Masters exam", "Apply for state LMSW license", "Secure first position in a clinical or community social work setting"], estimatedWeeks: 12 },
      { title: "LCSW Licensure", description: "Achieve clinical licensure for independent practice", tasks: ["Accumulate 2 years (3,000+ hours) of post-MSW supervised clinical experience", "Pass ASWB Clinical exam", "Apply for state LCSW license"], estimatedWeeks: 104 },
    ],
  },

  // 33. Counselor (Licensed Mental Health)
  {
    id: "counselor", title: "Counselor", domain: "Social Services",
    description: "Provide individual, group, and family counseling to address mental health, substance use, trauma, and life adjustment challenges.",
    interests: ["social", "investigative"], problemTypes: ["human", "scientific"], archetypes: ["advocate", "communicator"],
    workStyles: ["empathetic", "organized"], decisionStyle: ["feeling", "thinking"], collaboration: ["solo", "mixed"],
    ambiguityStyle: ["consult", "structure"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "isolation"], rewards: ["impact", "learning"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "solo"], paces: ["steady"],
    managementStyles: ["mentorship", "handsoff"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["advocate", "doer"], requiredSkills: ["Therapeutic Alliance", "CBT & DBT Techniques", "DSM-5 Diagnosis", "Crisis Intervention", "Documentation & HIPAA"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Social Services", "Healthcare"],
    pathwayTime: "4-6 years",
    skillGaps: [
      { skill: "CBT & DBT Therapy Techniques", importance: "high", learningResource: "Beck Institute CBT training; Marsha Linehan DBT Skills Training Manual" },
      { skill: "DSM-5 Diagnostic Assessment", importance: "high", learningResource: "DSM-5-TR Clinical Cases book; NBCC NCE exam prep resources" },
      { skill: "Trauma-Focused CBT (TF-CBT)", importance: "medium", learningResource: "TF-CBT Web 2.0 free online training at musc.edu" },
    ],
    certifications: [
      { skill: "Counseling", certName: "National Certified Counselor (NCC)", provider: "NBCC (National Board for Certified Counselors)", url: "https://www.nbcc.org/", duration: "Graduate degree + supervised experience + exam", level: "Professional", cost: "$275", whyRecommended: "The primary national counseling credential; accepted in all states and required by many employers" },
      { skill: "Counseling", certName: "Licensed Professional Counselor (LPC) / LMHC", provider: "State Counseling Licensure Board", url: "https://www.counseling.org/knowledge-center/licensure-requirements", duration: "Master's + 2–3 years supervised experience + exam", level: "State Licensure", cost: "$200–$400 exam fee", whyRecommended: "Required for independent practice; enables private pay and insurance panel participation" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Clinical Case Conceptualization", description: "Write a complete case conceptualization using a theoretical framework (CBT, psychodynamic, ACT) for a hypothetical client.", why: "Case conceptualization is the key clinical competency tested in supervision, practicum evaluations, and credentialing.", actionStep: "Choose a fictional client vignette from a counseling textbook and write a 5-page conceptualization." },
      { type: "portfolio", title: "Group Therapy Curriculum", description: "Develop a 6-session psychoeducation group curriculum on anxiety management or depression.", why: "Group therapy skills expand your practice scope and employability at community mental health centers.", actionStep: "Research CBT group therapy protocols and create an original 6-session curriculum with handouts." },
    ],
    networkingRecs: [
      { type: "networking", title: "ACA (American Counseling Association)", description: "Join ACA and your state chapter for annual conference, networking, and licensure advocacy.", platform: "ACA", url: "https://www.counseling.org/", why: "Primary national counseling organization; career services, ethics guidance, and specialty division connections.", actionStep: "Join ACA as a student member and attend one ACA continuing education webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "TherapyJobs.com", description: "Mental health–specific job board with LMHC, LPC, and therapist openings at practices, hospitals, and nonprofits.", platform: "TherapyJobs", url: "https://www.therapyjobs.com/", why: "Specialized for licensed mental health professionals; lists outpatient, inpatient, and telehealth openings.", actionStep: "Search 'LPC' or 'Counselor' in your state and apply to 5 positions." },
    ],
    milestones: [
      { title: "Graduate Education & Practicum", description: "Complete CACREP-accredited counseling program", tasks: ["Complete 60-credit MEd or MACMHC program", "Complete 100+ supervised practicum hours", "Complete 600+ supervised internship hours in a clinical setting"], estimatedWeeks: 104 },
      { title: "NCC Certification & State Licensure", description: "Earn national and state counseling credentials", tasks: ["Pass NBCC NCE exam", "Apply for NCC certification", "Apply for state LPC/LMHC licensure under supervision"], estimatedWeeks: 12 },
      { title: "Full Licensure & Private Practice Option", description: "Complete supervised hours and achieve independent licensure", tasks: ["Accumulate 2–3 years of supervised post-master's clinical hours", "Pass state LPC/LMHC independent licensure exam", "Apply for insurance panel contracts or open private practice"], estimatedWeeks: 104 },
    ],
  },

  // 34. Nonprofit Manager
  {
    id: "nonprofit-manager", title: "Nonprofit Manager", domain: "Social Services",
    description: "Lead programs and operations for mission-driven organizations, managing staff, budgets, grant compliance, and community impact measurement.",
    interests: ["enterprising", "social"], problemTypes: ["strategic", "human"], archetypes: ["leader", "advocate"],
    workStyles: ["organized", "empathetic"], decisionStyle: ["thinking", "feeling"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["consult", "structure"], coreValues: ["purpose", "impact"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "unclear_requirements"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["manager", "specialist"],
    groupRoles: ["leader", "advocate"], requiredSkills: ["Grant Writing", "Program Management", "Budget Management", "Volunteer Management", "Impact Measurement (Logic Models)"],
    experienceLevels: ["mid", "senior"], domains: ["Social Services"],
    pathwayTime: "3-6 years",
    skillGaps: [
      { skill: "Grant Writing & Reporting", importance: "high", learningResource: "GrantSpace.org by Candid; Grant Writing USA workshops" },
      { skill: "Logic Model & Impact Measurement", importance: "high", learningResource: "W.K. Kellogg Foundation Logic Model Development Guide (free PDF)" },
      { skill: "Nonprofit Financial Management", importance: "medium", learningResource: "Nonprofit Finance Fund Financial Management for Nonprofits course" },
    ],
    certifications: [
      { skill: "Nonprofit", certName: "Certified Nonprofit Professional (CNP)", provider: "Nonprofit Leadership Alliance", url: "https://www.nonprofitleadershipalliance.org/cnp", duration: "Education + 300 hour NLA Alliance Member Organization internship + exam", level: "Professional", cost: "$200", whyRecommended: "Most recognized nonprofit management credential; demonstrates sector-specific leadership competency" },
      { skill: "Fundraising", certName: "Certified Fund Raising Executive (CFRE)", provider: "CFRE International", url: "https://www.cfre.org/", duration: "Experience + exam", level: "Professional", cost: "$740 (application + exam)", whyRecommended: "Global fundraising credential; required or preferred for development director and ED positions" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Grant Proposal", description: "Write a complete government or foundation grant proposal for a hypothetical youth services program, including needs statement, goals, outcomes, and budget.", why: "Grant proposals are the primary deliverable in nonprofit management; a strong proposal opens major funding doors.", actionStep: "Find an open government RFP on Grants.gov and write a sample program proposal." },
      { type: "portfolio", title: "Program Logic Model", description: "Develop a program logic model with inputs, activities, outputs, and short/long-term outcomes for an existing or hypothetical program.", why: "Logic models are required by most major funders; demonstrating this skill signals measurement sophistication.", actionStep: "Use the W.K. Kellogg Logic Model template and build a model for a youth mentoring program." },
    ],
    networkingRecs: [
      { type: "networking", title: "Independent Sector & AFP", description: "Join AFP (Association of Fundraising Professionals) and attend your local chapter events.", platform: "AFP", url: "https://afpglobal.org/", why: "AFP connects nonprofit fundraisers and managers to funders, peers, and leadership opportunities.", actionStep: "Attend one AFP local chapter event and introduce yourself to two major gifts officers." },
    ],
    jobTargets: [
      { type: "job_application", title: "Idealist.org", description: "The largest job board for nonprofit, social sector, and government careers.", platform: "Idealist", url: "https://www.idealist.org/", why: "Used by thousands of nonprofits nationally; strong coverage of program manager, development, and ED roles.", actionStep: "Search 'Program Manager' or 'Development Manager' in your city and apply to 5 positions." },
    ],
    milestones: [
      { title: "Sector Knowledge & Grant Writing", description: "Build core nonprofit management skills", tasks: ["Complete GrantSpace Foundation Center free grant writing training", "Develop a program logic model using the Kellogg template", "Volunteer as a grant reviewer for a community foundation"], estimatedWeeks: 12 },
      { title: "Program Management Experience", description: "Lead programs and teams in a nonprofit setting", tasks: ["Manage a program serving 100+ clients with a documented logic model", "Write and win a grant of $25,000 or more", "Manage a team of 3+ staff or volunteers"], estimatedWeeks: 52 },
      { title: "CNP & CFRE Credentials", description: "Achieve recognized nonprofit professional credentials", tasks: ["Complete CNP certification requirements", "Accumulate fundraising experience and pass CFRE exam", "Apply to Program Director or Executive Director positions"], estimatedWeeks: 52 },
    ],
  },

  // ── ADDITIONAL PROFILES (filling out to 40) ───────────────────────────

  // 35. Diplomat / Foreign Service Officer
  {
    id: "diplomat", title: "Diplomat", domain: "Law & Policy",
    description: "Represent and advance national interests abroad through negotiation, policy analysis, consular services, and bilateral relationship management.",
    interests: ["social", "investigative"], problemTypes: ["strategic", "human"], archetypes: ["advocate", "thinker"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["consult", "structure"], coreValues: ["purpose", "prestige"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "micromanaged"], rewards: ["impact", "recognition"],
    environments: ["onsite"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["leader", "advocate"], requiredSkills: ["Foreign Language Proficiency", "International Relations", "Diplomatic Protocol", "Policy Analysis", "Cross-Cultural Communication"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Law & Policy"],
    pathwayTime: "3-5 years",
    skillGaps: [
      { skill: "Foreign Language (FSI Level 3+)", importance: "high", learningResource: "Pimsleur or Rosetta Stone; Defense Language Institute open courseware" },
      { skill: "International Relations & Foreign Policy", importance: "high", learningResource: "Council on Foreign Relations CFR.org resources; Coursera International Relations courses" },
      { skill: "Diplomatic Writing & Cables", importance: "medium", learningResource: "US State Department Writing Style Guide; ADST (Association for Diplomatic Studies) oral history archive" },
    ],
    certifications: [
      { skill: "Foreign Service", certName: "Foreign Service Officer Test (FSOT) & Selection", provider: "US Department of State", url: "https://careers.state.gov/work/foreign-service/officer/", duration: "Multi-stage selection process (6–24 months)", level: "Federal Employment", cost: "Free", whyRecommended: "The competitive entry exam and assessment process for US Foreign Service Officers (FSOs)" },
      { skill: "International Relations", certName: "Master of International Affairs or Public Policy (MIA/MPP)", provider: "SAIS, Fletcher, SIPA, Georgetown SFS", url: "https://www.georgetown.edu/sfs", duration: "2 years", level: "Graduate", cost: "$50,000–$65,000/year", whyRecommended: "Standard graduate credential for diplomatic and international policy careers; strengthens FSOT candidacy" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Country Policy Memo", description: "Write a 6-page policy memo on a bilateral relationship between the US and a country of interest, with strategic recommendations.", why: "Policy memos are the daily work product of FSOs; a strong memo demonstrates analytical and writing ability.", actionStep: "Choose a US bilateral relationship and write a memo based on public State Department cables on WikiLeaks or ADST." },
      { type: "portfolio", title: "UN Resolution Draft", description: "Draft a UN Security Council or General Assembly resolution on a current geopolitical issue.", why: "Resolution drafting demonstrates multilateral diplomacy knowledge and concise policy writing.", actionStep: "Research an active UN agenda item and draft a resolution following UN format and precedent." },
    ],
    networkingRecs: [
      { type: "networking", title: "American Foreign Service Association (AFSA)", description: "Join AFSA and attend Washington DC events and webinars.", platform: "AFSA", url: "https://www.afsa.org/", why: "Primary professional organization for US Foreign Service; connects candidates to active FSOs for mentorship.", actionStep: "Create an AFSA account and attend one FSOT preparation webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "USAJOBS – State Department FSO", description: "All US Foreign Service Officer positions are hired through the FSOT process posted on USAJOBS.", platform: "USAJOBS", url: "https://www.usajobs.gov/", why: "The only official path to becoming a US Foreign Service Officer.", actionStep: "Monitor FSOT registration windows on USAJOBS and register for the next available test date." },
    ],
    milestones: [
      { title: "Academic & Language Foundation", description: "Build international affairs credentials and language skills", tasks: ["Complete IR, history, or political science undergraduate coursework", "Reach FSI Level 2+ in one foreign language", "Intern at a congressional office, think tank, or embassy"], estimatedWeeks: 52 },
      { title: "FSOT & Selection Process", description: "Navigate the multi-stage Foreign Service selection", tasks: ["Pass the FSOT written exam (3-part: job knowledge, biographic questionnaire, English expression)", "Pass the FSOT Qualifications Evaluation Panel (QEP)", "Complete and pass the Foreign Service Oral Assessment (FSOA)"], estimatedWeeks: 26 },
      { title: "A-100 Orientation & First Tour", description: "Begin Foreign Service career", tasks: ["Complete A-100 orientation class at the Foreign Service Institute (FSI)", "Learn assigned cone (political, economic, consular, management, public diplomacy)", "Complete first 2-year overseas assignment"], estimatedWeeks: 104 },
    ],
  },

  // 36. Instructional Designer
  {
    id: "instructional-designer", title: "Instructional Designer", domain: "Education",
    description: "Design and develop engaging learning experiences, courses, and training programs for corporate, higher education, or government clients.",
    interests: ["artistic", "investigative"], problemTypes: ["creative", "technical"], archetypes: ["builder", "optimizer"],
    workStyles: ["organized", "open"], decisionStyle: ["thinking", "intuiting"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["impact", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["monotony", "micromanaged"], rewards: ["learning", "impact"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "generalist"],
    groupRoles: ["doer", "ideator"], requiredSkills: ["ADDIE / SAM Models", "Articulate Storyline or Rise", "LMS Administration", "Learning Objectives Writing", "Needs Assessment"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Education", "Technology"],
    pathwayTime: "1-3 years",
    skillGaps: [
      { skill: "Articulate Storyline 360", importance: "high", learningResource: "Articulate community free tutorials at community.articulate.com" },
      { skill: "Instructional Design Theory (ADDIE, Bloom's Taxonomy)", importance: "high", learningResource: "e-Learning Instructional Design by Clark and Mayer; Coursera Learning Design courses" },
      { skill: "LMS Administration (Canvas/Cornerstone)", importance: "medium", learningResource: "Canvas free training at community.canvaslms.com; Cornerstone training videos" },
    ],
    certifications: [
      { skill: "Instructional Design", certName: "ATD Certified Professional in Learning and Performance (CPLP)", provider: "Association for Talent Development (ATD)", url: "https://www.td.org/certification", duration: "Experience + exam", level: "Professional", cost: "$1,250 (ATD members) / $1,550 (non-members)", whyRecommended: "Most recognized L&D and instructional design credential; preferred by corporate universities and consulting firms" },
      { skill: "E-Learning", certName: "Articulate Storyline Certified", provider: "Articulate", url: "https://community.articulate.com/", duration: "Self-study", level: "Professional", cost: "Free (community credential)", whyRecommended: "Storyline is the dominant e-learning authoring tool; documented proficiency is required in most ID job postings" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "E-Learning Module (Articulate Storyline)", description: "Build a 15-minute e-learning module with branching scenarios, knowledge checks, and SCORM packaging.", why: "A published Storyline module is the primary portfolio piece that gets instructional designers hired.", actionStep: "Use the Articulate free trial to build a module on any workplace topic and publish to Review360." },
      { type: "portfolio", title: "Blended Learning Curriculum Design", description: "Design a complete blended learning curriculum for a 3-day workshop, including facilitator guide, participant workbook, and 2 supporting e-learning modules.", why: "Blended design shows both classroom and digital learning design skills, expanding your market.", actionStep: "Choose a training topic you know well and design the full curriculum using the ADDIE model." },
    ],
    networkingRecs: [
      { type: "networking", title: "ATD (Association for Talent Development)", description: "Join ATD and your local chapter for workshops, the ATD International Conference, and job listings.", platform: "ATD", url: "https://www.td.org/", why: "Primary professional network for L&D and instructional designers; large job board and CPLP credential support.", actionStep: "Join ATD as a member and attend one local chapter event or free ATD webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "LinkedIn Learning & Development Jobs", description: "Search for Instructional Designer, L&D Specialist, and e-Learning Developer roles.", platform: "LinkedIn", url: "https://www.linkedin.com/jobs/", why: "Most corporate L&D roles are posted on LinkedIn; strong presence of Fortune 500 and consulting firm roles.", actionStep: "Set job alerts for 'Instructional Designer' and apply to 5 roles with your e-learning portfolio." },
    ],
    milestones: [
      { title: "Core ID Skills & Authoring Tools", description: "Learn instructional design methodology and primary authoring tools", tasks: ["Complete Articulate Storyline 360 beginner tutorials", "Study ADDIE model and Bloom's Taxonomy fundamentals", "Build your first complete e-learning module"], estimatedWeeks: 12 },
      { title: "Portfolio Development", description: "Build 3 distinct portfolio pieces", tasks: ["Create a Storyline branching scenario module", "Design a blended learning curriculum with facilitator guide", "Publish portfolio on an Articulate Review or personal website"], estimatedWeeks: 16 },
      { title: "CPLP Certification & Career Growth", description: "Achieve professional credential and advance to senior ID roles", tasks: ["Accumulate 2 years of ID work experience", "Pass ATD CPLP exam", "Apply to senior instructional designer or learning experience designer roles"], estimatedWeeks: 52 },
    ],
  },

  // 37. Cybersecurity Analyst
  {
    id: "cybersecurity-analyst", title: "Cybersecurity Analyst", domain: "Technology",
    description: "Monitor, detect, and respond to security threats and vulnerabilities in organizational networks, systems, and applications.",
    interests: ["investigative", "realistic"], problemTypes: ["technical", "analytical"], archetypes: ["optimizer", "thinker"],
    workStyles: ["cautious", "organized"], decisionStyle: ["thinking", "analytical"], collaboration: ["mixed", "solo"],
    ambiguityStyle: ["structure", "experiment"], coreValues: ["mastery", "impact"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["tech_debt", "unclear_requirements"], rewards: ["learning", "recognition"],
    environments: ["remote", "hybrid"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["handsoff", "mentorship"], careerStages: ["exploring", "building"],
    riskLevels: ["moderate", "low"], trajectories: ["specialist", "generalist"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["SIEM (Splunk/Microsoft Sentinel)", "Incident Response", "Network Security", "Penetration Testing Basics", "NIST/ISO 27001 Frameworks"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Technology"],
    pathwayTime: "1-3 years",
    skillGaps: [
      { skill: "SIEM & Log Analysis (Splunk)", importance: "high", learningResource: "Splunk free training at Splunk Education; TryHackMe Splunk learning path" },
      { skill: "Incident Response & Threat Hunting", importance: "high", learningResource: "SANS FOR508 Incident Response course; TryHackMe SOC Level 1 path" },
      { skill: "Network Security & Packet Analysis", importance: "high", learningResource: "Professor Messer CompTIA Security+ free course; Wireshark University" },
    ],
    certifications: [
      { skill: "Security", certName: "CompTIA Security+", provider: "CompTIA", url: "https://www.comptia.org/certifications/security", duration: "Self-study (60–90 hours) + exam", level: "Entry-Level", cost: "$392", whyRecommended: "DoD-approved baseline security certification; standard entry credential for SOC analyst and security analyst roles" },
      { skill: "Security", certName: "CompTIA CySA+ (Cybersecurity Analyst)", provider: "CompTIA", url: "https://www.comptia.org/certifications/cybersecurity-analyst", duration: "Self-study + exam", level: "Intermediate", cost: "$392", whyRecommended: "Role-specific security analyst credential covering threat detection, SIEM, and incident response" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Home SOC Lab & CTF Writeups", description: "Build a home lab with Security Onion or Splunk and document CTF (Capture the Flag) challenge solutions on a GitHub or blog.", why: "Documented CTF writeups are the standard proof of skill for entry-level cybersecurity roles.", actionStep: "Sign up for TryHackMe, complete 10 rooms, and write up your findings on a technical blog." },
      { type: "portfolio", title: "Vulnerability Assessment Report", description: "Run a vulnerability scan with Nessus or OpenVAS on a home lab network and produce a professional remediation report.", why: "Vulnerability assessment is a core analyst deliverable; a sample report demonstrates technical execution.", actionStep: "Set up a vulnerable VM (Metasploitable2) and scan it with OpenVAS, then document findings." },
    ],
    networkingRecs: [
      { type: "networking", title: "ISACA Local Chapter", description: "Join ISACA and your local chapter for CISA/CISM exam prep, networking, and career resources.", platform: "ISACA", url: "https://www.isaca.org/", why: "ISACA connects cybersecurity analysts to CISO-level mentors and governance-focused career opportunities.", actionStep: "Join ISACA as a student member and attend one local chapter virtual meeting." },
    ],
    jobTargets: [
      { type: "job_application", title: "CyberSecJobs.com", description: "Cybersecurity-specific job board aggregating SOC analyst, penetration tester, and security engineer roles.", platform: "CyberSecJobs", url: "https://www.cybersecjobs.com/", why: "Curated for cybersecurity professionals; lists cleared and non-cleared positions across industries.", actionStep: "Search 'SOC Analyst' or 'Cybersecurity Analyst' and apply to 5 entry-level roles." },
    ],
    milestones: [
      { title: "Foundation Certifications", description: "Build technical baseline and earn entry certs", tasks: ["Complete CompTIA Security+ using Professor Messer's free course", "Pass CompTIA Security+ exam", "Complete TryHackMe or HackTheBox beginner learning path"], estimatedWeeks: 16 },
      { title: "Hands-On Skills & Lab Portfolio", description: "Build practical SOC analyst skills", tasks: ["Build a home SOC lab with Security Onion or Splunk", "Complete 20 TryHackMe rooms and write up 5 CTF solutions", "Pass CompTIA CySA+ exam"], estimatedWeeks: 20 },
      { title: "First SOC Role", description: "Land a SOC analyst or security analyst position", tasks: ["Apply to 15+ Tier 1 SOC analyst positions", "Practice SIEM analysis and incident triage in lab", "Obtain DoD Secret clearance if pursuing government roles"], estimatedWeeks: 16 },
    ],
  },

  // 38. HR Business Partner
  {
    id: "hr-business-partner", title: "HR Business Partner", domain: "Human Resources",
    description: "Partner with business leaders to align HR strategy with organizational objectives, driving talent management, employee relations, and workforce planning.",
    interests: ["social", "enterprising"], problemTypes: ["strategic", "human"], archetypes: ["communicator", "optimizer"],
    workStyles: ["organized", "empathetic"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed", "team"],
    ambiguityStyle: ["consult", "structure"], coreValues: ["impact", "mastery"], tradeoffs: ["balance_over_creativity"],
    frustrations: ["no_impact", "unclear_requirements"], rewards: ["impact", "recognition"],
    environments: ["hybrid", "onsite"], teamSizes: ["medium", "large"], paces: ["steady"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low", "moderate"], trajectories: ["specialist", "manager"],
    groupRoles: ["leader", "analyst"], requiredSkills: ["Employee Relations", "Talent Management", "HR Analytics", "Employment Law", "Performance Management"],
    experienceLevels: ["mid", "senior"], domains: ["Human Resources"],
    pathwayTime: "3-6 years",
    skillGaps: [
      { skill: "HR Analytics & Workforce Planning", importance: "high", learningResource: "SHRM HR Analytics Certificate; Coursera People Analytics by UPenn" },
      { skill: "Employment Law (FMLA, ADA, Title VII)", importance: "high", learningResource: "SHRM Learning System; Employment Law for HR Professionals by BLR" },
      { skill: "Compensation & Benefits Design", importance: "medium", learningResource: "WorldatWork Total Rewards certification study materials" },
    ],
    certifications: [
      { skill: "HR", certName: "SHRM-CP (Certified Professional)", provider: "SHRM", url: "https://www.shrm.org/credentials", duration: "Self-study + exam", level: "Professional", cost: "$300 (members) / $400 (non-members)", whyRecommended: "Most recognized HR credential globally; standard requirement for HR generalist and HRBP roles" },
      { skill: "HR", certName: "PHR (Professional in Human Resources)", provider: "HRCI", url: "https://www.hrci.org/credentials/phr", duration: "Self-study + exam", level: "Professional", cost: "$395 (members) / $500 (non-members)", whyRecommended: "US-focused HR credential with strong employer recognition in manufacturing, healthcare, and government" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Workforce Planning Analysis", description: "Build a workforce gap analysis for a hypothetical organization, identifying future talent needs and succession planning risks.", why: "Workforce planning is the hallmark competency of strategic HRBPs; this skill drives C-suite respect.", actionStep: "Use a public company's 10-K to build a workforce plan with a supply/demand gap analysis." },
      { type: "portfolio", title: "Compensation Benchmarking Report", description: "Conduct a compensation benchmarking study using Levels.fyi or Glassdoor data for 3 key roles.", why: "Compensation strategy is the #1 HRBP deliverable; demonstrating it builds credibility with finance leaders.", actionStep: "Pull salary data from Levels.fyi and Glassdoor for 3 software engineer roles and write a benchmark report." },
    ],
    networkingRecs: [
      { type: "networking", title: "SHRM Local Chapter", description: "Join SHRM and your local chapter for monthly meetings, SHRM-CP study groups, and networking.", platform: "SHRM", url: "https://www.shrm.org/", why: "Primary HR professional organization; job board, research, and SHRM-CP/SCP credential support.", actionStep: "Join your local SHRM chapter and attend one chapter event or SHRM webinar." },
    ],
    jobTargets: [
      { type: "job_application", title: "SHRM Jobs HR Career Center", description: "SHRM-affiliated job board with HR generalist, HRBP, and HR director roles.", platform: "SHRM Jobs", url: "https://jobs.shrm.org/", why: "Used by major employers to source credentialed HR professionals; high relevance for HRBP seekers.", actionStep: "Search 'HR Business Partner' and apply to 5 HRBP or Senior HR Generalist roles." },
    ],
    milestones: [
      { title: "HR Generalist Foundation", description: "Build broad HR functional competency", tasks: ["Work as HR coordinator or generalist covering recruiting, employee relations, and benefits for 2 years", "Complete SHRM-CP study program", "Pass SHRM-CP exam"], estimatedWeeks: 104 },
      { title: "Analytics & Business Acumen", description: "Develop strategic HRBP skills", tasks: ["Complete SHRM People Analytics Certificate", "Build a workforce planning model for your business unit", "Present one HR metric dashboard to business leaders"], estimatedWeeks: 20 },
      { title: "HRBP Placement", description: "Transition to a strategic HRBP role", tasks: ["Apply to HRBP or Senior HRBP positions at mid-size to large companies", "Develop a personal brand as an HR thought leader on LinkedIn", "Complete advanced employment law training (FMLA, ADA, Title VII)"], estimatedWeeks: 20 },
    ],
  },

  // 39. Investment Banker
  {
    id: "investment-banker", title: "Investment Banker", domain: "Finance",
    description: "Advise corporations and institutions on mergers, acquisitions, IPOs, and capital raising, executing complex financial transactions in a high-pressure environment.",
    interests: ["enterprising", "investigative"], problemTypes: ["strategic", "analytical"], archetypes: ["thinker", "leader"],
    workStyles: ["organized", "cautious"], decisionStyle: ["thinking", "analytical"], collaboration: ["team", "mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["prestige", "wealth"], tradeoffs: ["wealth_over_stability"],
    frustrations: ["no_impact", "monotony"], rewards: ["wealth", "recognition"],
    environments: ["onsite", "hybrid"], teamSizes: ["medium", "large"], paces: ["fast", "burst"],
    managementStyles: ["targets", "mentorship"], careerStages: ["building", "advancing"],
    riskLevels: ["moderate", "high"], trajectories: ["specialist", "manager"],
    groupRoles: ["analyst", "doer"], requiredSkills: ["Financial Modeling (LBO/DCF)", "Pitch Book Creation", "M&A Process", "Valuation Methods", "Capital Markets"],
    experienceLevels: ["student", "junior", "mid"], domains: ["Finance", "Consulting"],
    pathwayTime: "2-4 years",
    skillGaps: [
      { skill: "LBO & M&A Financial Modeling", importance: "high", learningResource: "Wall Street Prep IB modeling course; Breaking Into Wall Street BIWS" },
      { skill: "Pitch Book & Presentation Design", importance: "high", learningResource: "Macabacus PowerPoint add-in; Practitioner's Guide to IB Pitch Books" },
      { skill: "Accounting & Financial Statement Analysis", importance: "high", learningResource: "Accounting Made Simple by Mike Piper; CFA Institute free reading materials" },
    ],
    certifications: [
      { skill: "Finance", certName: "CFA Level I", provider: "CFA Institute", url: "https://www.cfainstitute.org/", duration: "6 months part-time study + exam", level: "Professional", cost: "$940–$1,200", whyRecommended: "The gold-standard finance credential; CFA Levels I–III significantly improve IB and PE career trajectories" },
      { skill: "Investment Banking", certName: "FINRA Series 79 (Investment Banking Representative)", provider: "FINRA", url: "https://www.finra.org/registration-exams-ce/qualification-exams/series79", duration: "Study + exam", level: "Required License", cost: "$305", whyRecommended: "Required by FINRA to work on M&A, equity offerings, and capital markets transactions at a registered BD" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Full LBO Model", description: "Build a complete leveraged buyout model for a publicly traded company, including purchase price analysis, debt schedule, and IRR calculation.", why: "The LBO model is the single most important technical skill tested in IB interviews at every bank.", actionStep: "Download a 10-K from SEC.gov and build a full LBO model using the Wall Street Prep template." },
      { type: "portfolio", title: "M&A Pitch Book", description: "Create a 20-slide M&A pitch book proposing a strategic acquisition for a real company.", why: "Pitch book creation is the daily work product of IB analysts; a polished book impresses hiring MDs.", actionStep: "Pick two companies in the same sector and build a strategic rationale, synergy, and valuation pitch." },
    ],
    networkingRecs: [
      { type: "networking", title: "IBankingFAQ Community & Alumni Network", description: "Join IBankingFAQ for technical prep and reach out to alumni in target banks on LinkedIn.", platform: "LinkedIn/IBankingFAQ", url: "https://www.ibankingfaq.com/", why: "IB is an extremely relationship-driven industry; informational interviews with current analysts are essential for getting an interview.", actionStep: "Send 10 personalized LinkedIn messages to analysts at target banks this week." },
    ],
    jobTargets: [
      { type: "job_application", title: "eFinancialCareers", description: "Finance-specific job board for investment banking, private equity, and asset management roles.", platform: "eFinancialCareers", url: "https://www.efinancialcareers.com/", why: "The primary job board for financial services; lists analyst, associate, and VP-level IB openings globally.", actionStep: "Create a profile and apply to 5 Investment Banking Analyst or Associate roles." },
    ],
    milestones: [
      { title: "Technical Skills Foundation", description: "Master the financial modeling skills required for IB", tasks: ["Complete Wall Street Prep or BIWS financial modeling course", "Build a full DCF, LBO, and merger model from scratch", "Study accounting through Macroaxis or Accounting Made Simple"], estimatedWeeks: 16 },
      { title: "Recruiting Process", description: "Break into IB through networking and interviews", tasks: ["Send 50 cold outreach messages to current IB analysts on LinkedIn", "Complete 20 technical interview practice sessions (LBO walkthrough, accounting questions)", "Apply to summer analyst or full-time analyst programs at BB and MM banks"], estimatedWeeks: 20 },
      { title: "IB Analyst Career", description: "Perform as an analyst and position for exit opportunities", tasks: ["Survive 2-year analyst program at a bank", "Build expertise in 1 coverage group (TMT, Healthcare, Energy, Industrials)", "Network with PE and growth equity funds for exit opportunities"], estimatedWeeks: 104 },
    ],
  },

  // 40. Physical Therapist
  {
    id: "physical-therapist", title: "Physical Therapist", domain: "Healthcare",
    description: "Evaluate, diagnose, and treat movement dysfunction and pain through manual therapy, therapeutic exercise, and patient education.",
    interests: ["social", "investigative"], problemTypes: ["scientific", "human"], archetypes: ["optimizer", "communicator"],
    workStyles: ["organized", "empathetic"], decisionStyle: ["thinking", "feeling"], collaboration: ["mixed"],
    ambiguityStyle: ["structure", "consult"], coreValues: ["purpose", "mastery"], tradeoffs: ["purpose_over_wealth"],
    frustrations: ["no_impact", "unclear_requirements"], rewards: ["impact", "learning"],
    environments: ["onsite"], teamSizes: ["small", "medium"], paces: ["steady", "burst"],
    managementStyles: ["mentorship", "targets"], careerStages: ["building", "advancing"],
    riskLevels: ["low"], trajectories: ["specialist", "entrepreneur"],
    groupRoles: ["doer", "analyst"], requiredSkills: ["Musculoskeletal Assessment", "Manual Therapy", "Therapeutic Exercise Prescription", "Gait & Movement Analysis", "Documentation (SOAP notes)"],
    experienceLevels: ["junior", "mid", "senior"], domains: ["Healthcare", "Science & Research"],
    pathwayTime: "6-7 years (DPT required)",
    skillGaps: [
      { skill: "Musculoskeletal Assessment & Special Tests", importance: "high", learningResource: "Orthopedic Physical Assessment by Magee; NPTE prep resources by TherapyEd" },
      { skill: "Manual Therapy Techniques", importance: "high", learningResource: "NAIOMT manual therapy courses; AAOMPT continuing education" },
      { skill: "Functional Movement Screening (FMS)", importance: "medium", learningResource: "FMS official certification courses at functionalmovement.com" },
    ],
    certifications: [
      { skill: "Physical Therapy", certName: "Doctor of Physical Therapy (DPT)", provider: "CAPTE-accredited PT program", url: "https://www.capteonline.org/", duration: "3 years post-BS", level: "Graduate", cost: "$25,000–$50,000/year", whyRecommended: "Required degree for physical therapist licensure in the United States" },
      { skill: "PT Licensure", certName: "NPTE (National Physical Therapy Examination)", provider: "FSBPT", url: "https://www.fsbpt.org/", duration: "5-hour computer adaptive exam", level: "Required Licensure", cost: "$485", whyRecommended: "Required for PT licensure in all US states; must be passed before practicing as a physical therapist" },
    ],
    portfolioProjects: [
      { type: "portfolio", title: "Clinical Case Report", description: "Write a detailed clinical case report documenting patient evaluation, diagnosis, treatment, and outcome for a complex musculoskeletal case.", why: "Case reports are the DPT's primary scholarly deliverable; a strong case report supports residency and publication.", actionStep: "Document your most complex clinical rotation case using the APTA case report format." },
      { type: "portfolio", title: "Home Exercise Program Library", description: "Build a digital library of 50 HEP videos demonstrating proper form for common rehabilitation exercises.", why: "HEP compliance drives outcomes; a professional video library demonstrates clinical expertise and patient education skill.", actionStep: "Use HEP2Go or a simple phone camera to record and catalog 50 therapeutic exercises." },
    ],
    networkingRecs: [
      { type: "networking", title: "APTA (American Physical Therapy Association)", description: "Join APTA and your state chapter; attend the APTA Combined Sections Meeting (CSM).", platform: "APTA", url: "https://www.apta.org/", why: "Primary PT professional organization; residency program listings, clinical specialty information, and job board.", actionStep: "Join APTA as a student member and attend the CSM to network with clinical specialists." },
    ],
    jobTargets: [
      { type: "job_application", title: "APTA Career Center", description: "APTA-affiliated job board with outpatient, hospital, home health, and school-based PT openings.", platform: "APTA Career Center", url: "https://aptacareerconnect.apta.org/", why: "Used by PT practices, health systems, and SNFs to recruit licensed PTs; covers all practice settings.", actionStep: "Create an APTA Career Center profile and apply to 5 new grad or licensed PT positions." },
    ],
    milestones: [
      { title: "DPT Education & Clinical Training", description: "Complete doctoral PT education and clinical rotations", tasks: ["Complete 3-year DPT program with 30+ weeks of full-time clinical affiliations", "Rotate through 3+ practice settings (outpatient ortho, acute care, pediatrics/neuro)", "Pass NPTE on first attempt"], estimatedWeeks: 156 },
      { title: "Licensure & First Position", description: "Earn PT licensure and begin clinical practice", tasks: ["Pass NPTE and apply for state PT license", "Negotiate first PT position with a competitive salary and mentorship support", "Develop clinical niche through CEU courses in first year"], estimatedWeeks: 12 },
      { title: "Clinical Specialty Development", description: "Pursue board certification in a specialty", tasks: ["Complete an APTA-accredited clinical residency program (optional but prestigious)", "Earn ABPTS Board Certification in Orthopedics (OCS), Sports (SCS), or Neurology (NCS)", "Publish a clinical case report or research letter"], estimatedWeeks: 78 },
    ],
  },

];
