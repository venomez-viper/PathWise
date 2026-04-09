/**
 * PathWise Career Archetype Engine
 *
 * Defines all 30 career archetypes and provides matching functions to determine
 * a user's best-fit archetype from RIASEC interest scores and Big Five personality
 * trait scores using a two-stage weighted distance algorithm.
 *
 * Stage 1: Filter to the candidate pool whose primary RIASEC code matches the
 *          user's dominant interest code.
 * Stage 2: Rank candidates by weighted Euclidean distance across Big Five
 *          dimensions, with RIASEC secondary code as a tiebreaker boost.
 *
 * Based on: docs/research/archetype-naming-system.md
 */

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface RIASECScores {
  realistic: number;      // 0 to 100
  investigative: number;  // 0 to 100
  artistic: number;       // 0 to 100
  social: number;         // 0 to 100
  enterprising: number;   // 0 to 100
  conventional: number;   // 0 to 100
}

export interface BigFiveScores {
  openness: number;            // 0 to 100
  conscientiousness: number;   // 0 to 100
  extraversion: number;        // 0 to 100
  agreeableness: number;       // 0 to 100
  emotionalStability: number;  // 0 to 100 — inverse of Neuroticism (emotionalStability = 100 - neuroticism)
}

export interface Archetype {
  id: string;
  name: string;              // e.g., "The Analytical Architect"
  family: string;            // Builders | Thinkers | Creators | Connectors | Organizers
  tagline: string;           // one-line description
  primaryRIASEC: string;     // R | I | A | S | E | C
  secondaryRIASEC: string;
  tertiaryRIASEC?: string;
  bigFiveCentroid: BigFiveScores;  // ideal trait levels 0-100
  // Dimensional weights: higher = that dimension matters more for this archetype.
  // Defining traits use 2.0, neutral dimensions use 0.5.
  bigFiveWeights: BigFiveScores;
  description: string;       // 3-sentence narrative (second person)
  typicalCareers: string[];  // 5-8 career titles
  superpower: string;
  growthEdge: string;
  idealEnvironment: string;
}

// ─── Archetype Registry ───────────────────────────────────────────────────────

export const ARCHETYPES: Archetype[] = [

  // ── FAMILY 1: THE BUILDERS (Realistic-dominant) ───────────────────────────

  {
    id: "pragmatic_builder",
    name: "The Pragmatic Builder",
    family: "Builders",
    tagline: "You solve real problems with real solutions — no theory required.",
    primaryRIASEC: "R",
    secondaryRIASEC: "I",
    bigFiveCentroid: {
      openness: 45,
      conscientiousness: 80,
      extraversion: 50,
      agreeableness: 50,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 1.0,
    },
    description:
      "You are the person who gets called when something needs to actually work. You approach problems with a bias toward execution: gather the facts, weigh the options, choose the most reliable path, and see it through. The gap between your completed projects and your peers' half-finished ones is not a matter of talent — it is a matter of discipline.",
    typicalCareers: [
      "Civil Engineer",
      "Industrial Engineer",
      "Mechanical Engineer",
      "Construction Project Manager",
      "Manufacturing Operations Manager",
      "Quality Assurance Engineer",
      "Infrastructure Architect",
    ],
    superpower:
      "Converting complex constraints into workable builds ahead of schedule and under budget.",
    growthEdge:
      "The preference for proven methods can harden into resistance to approaches that are genuinely better. The world's best solution ignored because it is unfamiliar still costs you.",
    idealEnvironment:
      "Structured organisations where outputs are measurable, projects have clear deliverables, and mastery earns authority.",
  },

  {
    id: "creative_maker",
    name: "The Creative Maker",
    family: "Builders",
    tagline: "You build things that are functional and, somehow, beautiful.",
    primaryRIASEC: "R",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 80,
      conscientiousness: 55,
      extraversion: 50,
      agreeableness: 55,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 1.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "You inhabit the productive tension between craft and creativity. Where most builders want the best solution, you want the best solution that also has elegance — and you are usually right that the two are not mutually exclusive. The functional object that is also visually striking, the engineered space that also moves people: these are your natural habitat.",
    typicalCareers: [
      "Industrial Designer",
      "Product Designer",
      "UX Engineer",
      "Architectural Designer",
      "Woodworking Artisan",
      "Fabrication Artist",
      "Game Environment Artist",
      "Furniture Designer",
    ],
    superpower:
      "Producing work at the intersection of function and form that neither pure engineers nor pure artists could achieve alone.",
    growthEdge:
      "The desire for aesthetic coherence can extend project timelines in ways that frustrate collaborators and clients. Not every deliverable needs to be a statement.",
    idealEnvironment:
      "Studios, maker spaces, or design-integrated engineering teams where the brief has room for interpretation.",
  },

  {
    id: "steady_craftsperson",
    name: "The Steady Craftsperson",
    family: "Builders",
    tagline: "Excellence built incrementally, with no drama and no shortcuts.",
    primaryRIASEC: "R",
    secondaryRIASEC: "C",
    bigFiveCentroid: {
      openness: 40,
      conscientiousness: 82,
      extraversion: 40,
      agreeableness: 55,
      emotionalStability: 82,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 2.0,
    },
    description:
      "You are the professional that every high-stakes environment quietly depends on. Your work is characterised by a combination of technical precision and emotional steadiness that is rarer than most hiring managers realise. The quality of your output is effectively constant across conditions — which, in practice, is one of the most commercially valuable traits a skilled worker can have.",
    typicalCareers: [
      "Machinist",
      "Surgical Technician",
      "Aircraft Maintenance Technician",
      "Carpenter",
      "Electrician",
      "Plumber",
      "Forensic Analyst",
      "Medical Device Technician",
    ],
    superpower:
      "Maintaining elite-level accuracy and composure in conditions — high stakes, repetitive demand, or time pressure — that degrade most workers' performance.",
    growthEdge:
      "Steadiness and routine can become a comfort zone that forecloses development. The skills that got you to mastery are not always the skills that take you further.",
    idealEnvironment:
      "Specialised, technically demanding settings where procedural exactness is non-negotiable and reputation is built over years.",
  },

  {
    id: "field_engineer",
    name: "The Field Engineer",
    family: "Builders",
    tagline: "You fix what others theorised into existence.",
    primaryRIASEC: "R",
    secondaryRIASEC: "I",
    bigFiveCentroid: {
      openness: 45,
      conscientiousness: 80,
      extraversion: 50,
      agreeableness: 30,
      emotionalStability: 65,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 2.0, // Low agreeableness is the key differentiator from pragmatic_builder
      emotionalStability: 1.0,
    },
    description:
      "You are most effective when the gap between a blueprint and reality needs to be bridged by someone willing to say what is not working and then do something about it. Your low agreeableness is not a social deficiency — it is a professional asset in environments where the cost of false consensus is a structural failure, a missed deadline, or a safety incident. You do not need people to like you. You need the system to function.",
    typicalCareers: [
      "Field Service Engineer",
      "Drilling Engineer",
      "Structural Inspector",
      "Plant Engineer",
      "Mining Engineer",
      "Reliability Engineer",
      "Combat Systems Engineer",
      "Geotechnical Engineer",
    ],
    superpower:
      "Delivering technical verdicts that stick — free from the organisational pressure to tell people what they want to hear.",
    growthEdge:
      "The directness that earns trust in the field can damage relationships in managerial or cross-functional settings that require more political navigation.",
    idealEnvironment:
      "Remote, industrial, or infrastructure-critical environments where competence is the primary currency and the work speaks for itself.",
  },

  {
    id: "green_pioneer",
    name: "The Green Pioneer",
    family: "Builders",
    tagline: "You build the infrastructure for a world that does not exist yet.",
    primaryRIASEC: "R",
    secondaryRIASEC: "I",
    bigFiveCentroid: {
      openness: 80,
      conscientiousness: 60,
      extraversion: 50,
      agreeableness: 65,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 1.0,
      extraversion: 0.5,
      agreeableness: 1.0, // Values-driven — higher agreeableness separates from field_engineer
      emotionalStability: 0.5,
    },
    description:
      "You are motivated by problems at scale — the intersection of engineering rigour and environmental consequence. You are not a campaigner; you are a builder. What distinguishes you is that your definition of 'what works' explicitly includes externalities that traditional engineering economics discounts, and you are drawn to technical domains where the answers have not been fully written because the questions are still being formed.",
    typicalCareers: [
      "Renewable Energy Engineer",
      "Environmental Engineer",
      "Sustainability Consultant",
      "Climate Tech Founder",
      "Water Systems Engineer",
      "Carbon Capture Engineer",
      "Conservation Technology Specialist",
      "Green Building Architect",
    ],
    superpower:
      "Applying first-principles engineering thinking to problems that most of your peers have not yet recognised as engineering problems.",
    growthEdge:
      "The urgency behind the work can generate impatience with institutional pace. Systemic change moves slower than individual insight.",
    idealEnvironment:
      "Mission-aligned organisations, research institutions, or early-stage ventures where technical work and environmental purpose reinforce each other.",
  },

  {
    id: "hands_on_leader",
    name: "The Hands-On Leader",
    family: "Builders",
    tagline: "You lead from the front, tools in hand.",
    primaryRIASEC: "R",
    secondaryRIASEC: "E",
    bigFiveCentroid: {
      openness: 50,
      conscientiousness: 70,
      extraversion: 80,
      agreeableness: 55,
      emotionalStability: 65,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 1.0,
      extraversion: 2.0,
      agreeableness: 0.5,
      emotionalStability: 1.0,
    },
    description:
      "You are the foreman who knows every trade, the site manager who can do the job she is supervising, the operations director who started on the floor. Your authority is earned through demonstrated competence rather than title, and your teams know the difference. You are most effective in environments where the respect of skilled workers matters — which means your influence depends on staying close to the work even as your scope expands.",
    typicalCareers: [
      "Construction Superintendent",
      "Plant Manager",
      "Fire Captain",
      "Head of Field Operations",
      "Workshop Manager",
      "Technical Director",
      "Chief of Engineering",
    ],
    superpower:
      "Building technically skilled teams that trust their leader because she has done the work herself.",
    growthEdge:
      "Remaining close to the hands-on work can limit the strategic abstraction required at senior levels. At some point, the tools have to be put down.",
    idealEnvironment:
      "Operational environments where authority is grounded in technical credibility and teams are measured by physical outputs.",
  },

  // ── FAMILY 2: THE THINKERS (Investigative-dominant) ──────────────────────

  {
    id: "analytical_architect",
    name: "The Analytical Architect",
    family: "Thinkers",
    tagline: "You design systems that hold together under conditions their creators never anticipated.",
    primaryRIASEC: "I",
    secondaryRIASEC: "R",
    bigFiveCentroid: {
      openness: 78,
      conscientiousness: 80,
      extraversion: 40,
      agreeableness: 50,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 1.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "You think in structures — logical, technical, organisational, financial. Your work is characterised by the density of the considerations you hold simultaneously and the rigour with which you reason about interactions between components. Your deliverables tend to outlive you on a project because they were built to.",
    typicalCareers: [
      "Solutions Architect",
      "Systems Engineer",
      "Enterprise Architect",
      "Security Architect",
      "Cloud Infrastructure Architect",
      "Database Architect",
      "Technical Program Manager",
    ],
    superpower:
      "Producing designs that are simultaneously coherent, scalable, and honest about their constraints — documentation that saves the teams who inherit it.",
    growthEdge:
      "Perfectionism at the design stage can create the architectural equivalent of analysis paralysis. At some point, you have to build the imperfect version.",
    idealEnvironment:
      "Complex technical organisations where decisions made on whiteboards have six-figure downstream consequences.",
  },

  {
    id: "research_explorer",
    name: "The Research Explorer",
    family: "Thinkers",
    tagline: "The most interesting question is the one nobody has asked yet.",
    primaryRIASEC: "I",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 88,
      conscientiousness: 50,
      extraversion: 45,
      agreeableness: 55,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "You are drawn to the boundary of what is known — not as a comfort zone but as a vocation. Your intellectual curiosity does not discriminate well between adjacent domains, which is simultaneously a limitation and a superpower. The unexpected connection between a finding in one field and a problem in another is where your best work tends to originate.",
    typicalCareers: [
      "Research Scientist",
      "Academic Researcher",
      "R&D Specialist",
      "UX Researcher",
      "Anthropologist",
      "Innovation Lead",
      "Science Journalist",
      "Futurist",
    ],
    superpower:
      "Formulating research questions precise enough to be answerable and broad enough to matter.",
    growthEdge:
      "The love of exploration can produce extensive inquiry that never converges on an answer someone can act on. The application step is not always optional.",
    idealEnvironment:
      "Universities, think tanks, or corporate R&D labs where the timeline for intellectual payoff is measured in years rather than sprints.",
  },

  {
    id: "data_storyteller",
    name: "The Data Storyteller",
    family: "Thinkers",
    tagline: "You make numbers mean something to the people who need to act on them.",
    primaryRIASEC: "I",
    secondaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 78,
      conscientiousness: 60,
      extraversion: 55,
      agreeableness: 72,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 1.5,
      conscientiousness: 0.5,
      extraversion: 1.0,
      agreeableness: 2.0,
      emotionalStability: 0.5,
    },
    description:
      "You occupy a position that most organisations desperately need and consistently fail to hire for: the person who can move fluently between rigorous quantitative analysis and clear human communication without sacrificing either. You find satisfaction not only in discovering what the data says but in the moment when the person across the table understands it well enough to make a better decision. The analytical work is the means; the changed behaviour is the end.",
    typicalCareers: [
      "Data Analyst",
      "Business Intelligence Lead",
      "Data Journalist",
      "Strategy Analyst",
      "Product Analyst",
      "Behavioural Economist",
      "Research Communicator",
      "Public Health Analyst",
    ],
    superpower:
      "Translating statistical complexity into executive-grade clarity without misrepresenting what the evidence actually supports.",
    growthEdge:
      "The desire to be understood can create pressure to simplify past the point of accuracy. The nuance you drop in the name of clarity sometimes turns out to matter.",
    idealEnvironment:
      "Data-rich organisations with decision-makers willing to change course based on evidence rather than instinct.",
  },

  {
    id: "systems_thinker",
    name: "The Systems Thinker",
    family: "Thinkers",
    tagline: "You see the feedback loops that others mistake for isolated problems.",
    primaryRIASEC: "I",
    secondaryRIASEC: "C",
    bigFiveCentroid: {
      openness: 65,
      conscientiousness: 80,
      extraversion: 40,
      agreeableness: 45,
      emotionalStability: 62,
    },
    bigFiveWeights: {
      openness: 1.0,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "Where most professionals see a sequence of events, you see a system with interdependencies, time delays, and reinforcing dynamics. This is not a trained competency for you — it is a default cognitive mode. Your analyses tend to be uncomfortable for organisations because they implicate the system rather than exonerating it.",
    typicalCareers: [
      "Management Consultant",
      "Operations Researcher",
      "Policy Analyst",
      "Supply Chain Strategist",
      "Risk Manager",
      "Business Architect",
      "Process Engineer",
      "Organisational Consultant",
    ],
    superpower:
      "Diagnosing root causes that survive the obvious explanation and persist through multiple rounds of attempted fixes.",
    growthEdge:
      "Systems thinking at its worst produces elaborate models of why nothing will work. The practical implication matters as much as the diagnosis.",
    idealEnvironment:
      "Organisations large enough to have genuine systemic complexity and courageous enough to hear an honest account of it.",
  },

  {
    id: "scientific_visionary",
    name: "The Scientific Visionary",
    family: "Thinkers",
    tagline: "You are not interested in confirming what everyone already suspects.",
    primaryRIASEC: "I",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 92,
      conscientiousness: 35,
      extraversion: 45,
      agreeableness: 45,
      emotionalStability: 50,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 2.0, // Low conscientiousness is the differentiator from research_explorer
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "Your research does not follow the standard template because you are drawn to questions that the standard template cannot accommodate. You have an unusually high tolerance for being wrong in public, because you know that the rate of interesting wrong hypotheses is the leading indicator of important eventual discoveries. Your institutional career has been complicated by a genuine inability to feign interest in incremental work.",
    typicalCareers: [
      "Principal Scientist",
      "Theoretical Physicist",
      "Computational Biologist",
      "AI Researcher",
      "Biotech Founder",
      "Philosophy of Science Academic",
      "Speculative Designer",
      "Deep Tech Entrepreneur",
    ],
    superpower:
      "Generating hypotheses that are genuinely novel and precisely enough stated to be tested.",
    growthEdge:
      "The institutional friction generated by unconventional approaches consumes energy that might otherwise go into the work itself. Some accommodation of process is not capitulation.",
    idealEnvironment:
      "Research institutions, frontier labs, or early-stage ventures where intellectual ambition is the primary competitive advantage.",
  },

  {
    id: "clinical_mind",
    name: "The Clinical Mind",
    family: "Thinkers",
    tagline: "You reach the right diagnosis because you do not let urgency contaminate your reasoning.",
    primaryRIASEC: "I",
    secondaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 60,
      conscientiousness: 85,
      extraversion: 45,
      agreeableness: 60,
      emotionalStability: 85,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 1.0,
      emotionalStability: 2.0, // High emotional stability separates from data_storyteller
    },
    description:
      "You are built for high-stakes environments where the pressure to act quickly is in constant tension with the need to act correctly. Your emotional stability is a clinical asset: you maintain the same rigorous reasoning process under crisis conditions that others achieve only in calm ones. You chose a people-facing application of your analytical gifts deliberately — but you understand that genuine care sometimes requires withholding the answer the patient wants to hear.",
    typicalCareers: [
      "Physician",
      "Psychiatrist",
      "Clinical Psychologist",
      "Epidemiologist",
      "Medical Researcher",
      "Pharmacist",
      "Forensic Pathologist",
      "Clinical Trial Manager",
    ],
    superpower:
      "Holding the complexity of a diagnostic or treatment problem steady under pressure long enough to reach a defensible conclusion.",
    growthEdge:
      "The preference for rigour and certainty before action can create distance that patients or clients experience as coldness. Bedside manner is also a clinical outcome.",
    idealEnvironment:
      "Healthcare systems, clinical research organisations, or diagnostic institutions where standards of evidence are treated as non-negotiable.",
  },

  // ── FAMILY 3: THE CREATORS (Artistic-dominant) ────────────────────────────

  {
    id: "creative_catalyst",
    name: "The Creative Catalyst",
    family: "Creators",
    tagline: "You generate ideas fast enough that the room has to run to keep up.",
    primaryRIASEC: "A",
    secondaryRIASEC: "E",
    bigFiveCentroid: {
      openness: 85,
      conscientiousness: 50,
      extraversion: 82,
      agreeableness: 55,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 0.5,
      extraversion: 2.0,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "Your most productive mode is collaborative — not because you need validation but because other people's reactions are fuel. You read an audience in real time and redirect your energy accordingly. What looks to observers like effortless creativity is actually a high-bandwidth feedback loop: you generate, test against the room, integrate the signal, and generate again.",
    typicalCareers: [
      "Creative Director",
      "Brand Strategist",
      "Advertising Executive",
      "Entertainment Producer",
      "Podcast Host",
      "Marketing Innovator",
      "Experience Designer",
      "Chief Creative Officer",
    ],
    superpower:
      "Running creative processes at speed without losing the quality bar — and getting teams to match that pace.",
    growthEdge:
      "The social energy that accelerates ideation can crowd out the sustained solitary work that produces depth. Some of your best ideas need more time alone.",
    idealEnvironment:
      "Fast-moving creative agencies, media companies, or brand-centric organisations where the output is ideas and the currency is attention.",
  },

  {
    id: "quiet_innovator",
    name: "The Quiet Innovator",
    family: "Creators",
    tagline: "Your best work happens in the hours before anyone else arrives.",
    primaryRIASEC: "A",
    secondaryRIASEC: "I",
    bigFiveCentroid: {
      openness: 85,
      conscientiousness: 55,
      extraversion: 28,
      agreeableness: 50,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 0.5,
      extraversion: 2.0, // Low extraversion is defining — key contrast with creative_catalyst
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "You are a deeply independent creative who produces most effectively at the edge of long, uninterrupted concentration. You are not shy — you simply find that the internal creative process requires protection from social interruption. Your work tends to have a singular coherence that collaborative creative output often lacks, because it comes from one sustained vision rather than committee.",
    typicalCareers: [
      "Author",
      "Game Designer",
      "Composer",
      "Software Engineer",
      "Independent Filmmaker",
      "Research Designer",
      "Illustrator",
      "Cryptographer",
    ],
    superpower:
      "Sustaining the focused creative effort over weeks and months that produces work with genuine intellectual or aesthetic depth.",
    growthEdge:
      "The preference for working alone can produce work that is brilliant but inaccessible, or finished products that nobody knows about.",
    idealEnvironment:
      "Independent or small-team settings with protected deep-work time and minimal coordination overhead.",
  },

  {
    id: "experience_designer",
    name: "The Experience Designer",
    family: "Creators",
    tagline: "You design the moment and then watch people live inside it.",
    primaryRIASEC: "A",
    secondaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 80,
      conscientiousness: 55,
      extraversion: 55,
      agreeableness: 78,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 1.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 2.0,
      emotionalStability: 0.5,
    },
    description:
      "Your creative work is oriented toward the experience of another person — not the object you produce but the feeling it generates in someone else. This orientation makes you unusually effective as a collaborator with end users, because you are genuinely motivated by their perspective rather than treating user research as a compliance exercise. The products, spaces, and services you design tend to feel considered in ways that users can sense even if they cannot articulate why.",
    typicalCareers: [
      "UX Designer",
      "Service Designer",
      "Museum Curator",
      "Events Designer",
      "Learning Experience Designer",
      "Customer Experience Lead",
      "Interior Designer",
      "Theatre Director",
    ],
    superpower:
      "Mapping the emotional arc of an interaction and designing backwards from the moment you want the user to feel.",
    growthEdge:
      "The deep empathy for users can make it difficult to make decisions that disappoint them, even when those decisions are strategically necessary.",
    idealEnvironment:
      "Human-centred design teams, cultural institutions, or experience-led businesses where the customer journey is treated as a designed artefact.",
  },

  {
    id: "visual_storyteller",
    name: "The Visual Storyteller",
    family: "Creators",
    tagline: "You see the image before you see the words.",
    primaryRIASEC: "A",
    secondaryRIASEC: "R",
    bigFiveCentroid: {
      openness: 82,
      conscientiousness: 55,
      extraversion: 50,
      agreeableness: 50,
      emotionalStability: 55,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "Your thinking is fundamentally visual. The spatial, compositional, and tonal vocabulary that others acquire through training is your native language, which means you often communicate most precisely through images rather than text. You are drawn to work that involves translating complex realities into visual representations that carry meaning without losing accuracy.",
    typicalCareers: [
      "Photographer",
      "Videographer",
      "Motion Graphics Designer",
      "Data Visualisation Specialist",
      "Architectural Renderer",
      "Documentary Filmmaker",
      "Creative Technologist",
      "Visual Development Artist",
    ],
    superpower:
      "Constructing images — static or moving — that communicate in a fraction of the time that text or speech would require.",
    growthEdge:
      "The visual frame can become a constraint rather than a tool when the problem requires verbal or numerical precision. Not every truth has a good visual analogue.",
    idealEnvironment:
      "Studios, production companies, or organisations where visual communication is central to the product rather than a support function.",
  },

  {
    id: "cultural_curator",
    name: "The Cultural Curator",
    family: "Creators",
    tagline: "You know what matters and you know how to make other people care about it.",
    primaryRIASEC: "A",
    secondaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 82,
      conscientiousness: 55,
      extraversion: 55,
      agreeableness: 80,
      emotionalStability: 58,
    },
    bigFiveWeights: {
      openness: 1.5,
      conscientiousness: 0.5,
      extraversion: 1.0,
      agreeableness: 2.0,
      emotionalStability: 0.5,
    },
    description:
      "You are motivated by the circulation of ideas, art, and culture through communities that would not otherwise encounter them. Your role is intermediary — you do not always make the thing, but you select, contextualise, and amplify it in ways that change how people understand themselves and the world. This is the serious work of deciding what a community pays attention to and why.",
    typicalCareers: [
      "Arts Administrator",
      "Cultural Programme Director",
      "Editorial Director",
      "Librarian",
      "Museum Director",
      "Public Radio Producer",
      "Book Editor",
      "Festival Director",
    ],
    superpower:
      "Identifying work or ideas with genuine resonance before the broader culture has caught up, and building the audience infrastructure to match.",
    growthEdge:
      "The commitment to cultural value over commercial value can create persistent resource constraints that drain energy from the curatorial work itself.",
    idealEnvironment:
      "Cultural institutions, media organisations, or educational settings where the mission is explicit and the audience's development over time is the metric.",
  },

  {
    id: "boundary_breaker",
    name: "The Boundary Breaker",
    family: "Creators",
    tagline: "You do not ask permission to try the thing that has not been done before.",
    primaryRIASEC: "A",
    secondaryRIASEC: "E",
    bigFiveCentroid: {
      openness: 92,
      conscientiousness: 30,
      extraversion: 70,
      agreeableness: 35,
      emotionalStability: 50,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 1.5, // Low conscientiousness separates from creative_catalyst
      extraversion: 1.0,
      agreeableness: 1.5, // Low agreeableness separates from experience_designer
      emotionalStability: 0.5,
    },
    description:
      "You are constitutionally incapable of treating existing conventions as constraints rather than starting points. This produces friction in institutional settings and a disproportionate creative output in environments designed to accommodate it. Your willingness to be wrong in highly visible ways is the price you pay for the asymmetric upside of being spectacularly right.",
    typicalCareers: [
      "Experimental Artist",
      "Creative Technologist",
      "Disruptive Brand Founder",
      "Performance Artist",
      "Avant-Garde Designer",
      "Innovation Researcher",
      "Unconventional Entrepreneur",
      "Art Director",
    ],
    superpower:
      "Producing work that redefines the problem rather than solving the one that was given.",
    growthEdge:
      "The resistance to convention can become reflexive contrarianism. Not every established approach is wrong, and some battles are not worth having.",
    idealEnvironment:
      "Independent practice, experimental labs, or organisations that have deliberately built a tolerance for unresolved ideas and incomplete attempts.",
  },

  {
    id: "digital_storyteller",
    name: "The Digital Storyteller",
    family: "Creators",
    tagline: "You turn everyday moments into content that millions want to watch.",
    primaryRIASEC: "A",
    secondaryRIASEC: "E",
    tertiaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 80,
      conscientiousness: 60,
      extraversion: 75,
      agreeableness: 60,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 1.5,
      conscientiousness: 1.5,
      extraversion: 2.0,
      agreeableness: 1.0,
      emotionalStability: 0.5,
    },
    description:
      "You think in hooks, thumbnails, and scroll-stopping moments. Your creative instinct is matched by a strategic mind — you understand that great content is equal parts art and distribution. You read audiences intuitively, adapt your voice across platforms, and treat every post as both an experiment and a product. Where others see a camera, you see a publishing pipeline.",
    typicalCareers: [
      "Content Creator",
      "YouTuber",
      "Podcast Host",
      "Social Media Manager",
      "Brand Content Strategist",
      "Video Producer",
      "Newsletter Writer",
      "Influencer & Personal Brand",
    ],
    superpower:
      "Turning ideas into audience-resonant content at a pace and consistency that compounds into real influence.",
    growthEdge:
      "The algorithm can become the audience. The most durable creator brands are built on a point of view that exists independent of any single platform's reward system.",
    idealEnvironment:
      "Independent creator studios, media startups, or brand teams that value creative autonomy and measure impact in audience growth rather than hours logged.",
  },

  // ── FAMILY 4: THE CONNECTORS (Social/Enterprising-dominant) ──────────────

  {
    id: "empathetic_guide",
    name: "The Empathetic Guide",
    family: "Connectors",
    tagline: "You meet people exactly where they are, and then move them forward.",
    primaryRIASEC: "S",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 78,
      conscientiousness: 55,
      extraversion: 50,
      agreeableness: 85,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 1.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 2.0,
      emotionalStability: 1.0,
    },
    description:
      "Your effectiveness as a guide or counsellor comes from a quality that cannot be trained in the standard sense: the genuine desire to understand another person's interior life before offering any response. You do not impose frameworks; you build them from what people tell you. Your high openness means you can tolerate ambiguity in a conversation, which creates the safety people need to tell you the true version of what is happening.",
    typicalCareers: [
      "Therapist",
      "Career Coach",
      "School Counsellor",
      "Diversity & Inclusion Consultant",
      "Life Coach",
      "Social Worker",
      "Pastoral Care Worker",
      "Community Psychologist",
    ],
    superpower:
      "Holding difficult conversations that produce genuine insight rather than performed resolution.",
    growthEdge:
      "The depth of your investment in individual people can create an unsustainable emotional load. The oxygen mask instruction is professionally literal for you.",
    idealEnvironment:
      "One-to-one or small-group settings where the quality of the relationship is the primary mechanism of change and follow-through is measured over time.",
  },

  {
    id: "community_builder",
    name: "The Community Builder",
    family: "Connectors",
    tagline: "You turn a group of individuals into something that looks after itself.",
    primaryRIASEC: "S",
    secondaryRIASEC: "E",
    bigFiveCentroid: {
      openness: 62,
      conscientiousness: 60,
      extraversion: 80,
      agreeableness: 80,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 2.0,
      agreeableness: 2.0,
      emotionalStability: 0.5,
    },
    description:
      "You are drawn to the challenge of creating conditions under which people with aligned interests begin to coordinate without you. The communities you build have a distinctive quality: they hold together when you step back, because you designed for sustainability rather than dependency. Your deeper satisfaction comes from watching the network operate on its own logic.",
    typicalCareers: [
      "Community Manager",
      "Nonprofit Executive Director",
      "Union Organiser",
      "Social Enterprise Founder",
      "HR Director",
      "Membership Organisations Leader",
      "Civic Leader",
      "Employee Experience Lead",
    ],
    superpower:
      "Designing community structures that generate collective trust faster than the natural default rate.",
    growthEdge:
      "The investment in other people's success can lead to neglecting your own professional development and visibility. Communities need champions, not just architects.",
    idealEnvironment:
      "Mission-driven organisations, civic institutions, or people-first companies where the culture is treated as a product rather than a byproduct.",
  },

  {
    id: "strategic_leader",
    name: "The Strategic Leader",
    family: "Connectors",
    tagline: "You set direction, and then you prove it was right.",
    primaryRIASEC: "E",
    secondaryRIASEC: "I",
    bigFiveCentroid: {
      openness: 65,
      conscientiousness: 80,
      extraversion: 82,
      agreeableness: 50,
      emotionalStability: 68,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 2.0,
      agreeableness: 0.5,
      emotionalStability: 1.0,
    },
    description:
      "You combine the assertive confidence required to stake a strategic position with the analytical discipline required to back it up. Many strategic leaders are strong on vision or strong on rigour; you hold both simultaneously. You earn credibility with two very different audiences — the board and the engineering team — by being genuinely fluent in both their languages.",
    typicalCareers: [
      "Chief Executive Officer",
      "Chief Technology Officer",
      "VP of Strategy",
      "Management Consultant",
      "Programme Director",
      "General Manager",
      "Political Leader",
      "Investment Banker",
    ],
    superpower:
      "Building organisational alignment around a strategic position that you can defend analytically under pressure from credible critics.",
    growthEdge:
      "The combination of extraversion and high conscientiousness can produce an impatience with the pace of others that damages the trust required to lead effectively.",
    idealEnvironment:
      "Complex organisations where decisions have long time horizons, multiple stakeholders, and material financial or operational consequences.",
  },

  {
    id: "visionary_entrepreneur",
    name: "The Visionary Entrepreneur",
    family: "Connectors",
    tagline: "You build what the market does not yet know it wants.",
    primaryRIASEC: "E",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 85,
      conscientiousness: 55,
      extraversion: 72,
      agreeableness: 28,
      emotionalStability: 58,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 0.5,
      extraversion: 1.0,
      agreeableness: 2.0, // Low agreeableness is defining
      emotionalStability: 0.5,
    },
    description:
      "Your entrepreneurial engine runs on a specific combination: the creative ability to see a future state that does not currently exist and the low agreeableness to pursue it without waiting for permission or consensus. The friction this creates with investors, partners, and early employees is a known cost of your operating model. The ventures that succeed do so because the vision was real enough that the friction was worth paying.",
    typicalCareers: [
      "Startup Founder",
      "Creative Entrepreneur",
      "Product Visionary",
      "Chief Innovation Officer",
      "Venture-backed CEO",
      "Brand Builder",
      "Creative Agency Founder",
      "Platform Founder",
    ],
    superpower:
      "Articulating a product or market vision with sufficient precision and conviction that talented people choose to build it with you.",
    growthEdge:
      "The low agreeableness that protects the vision in early stages can become a liability at scale, when the organisation needs collaborative decision-making rather than founder authority.",
    idealEnvironment:
      "Early to growth-stage ventures where the founding vision is still the primary competitive asset and organisational structure is still being invented.",
  },

  {
    id: "people_catalyst",
    name: "The People Catalyst",
    family: "Connectors",
    tagline: "You make everyone in the room more effective than they would be without you.",
    primaryRIASEC: "E",
    secondaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 62,
      conscientiousness: 60,
      extraversion: 82,
      agreeableness: 78,
      emotionalStability: 62,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 2.0,
      agreeableness: 2.0,
      emotionalStability: 0.5,
    },
    description:
      "Your primary mode of value creation is relational. You are not the best individual contributor in most rooms you enter, and you are entirely comfortable with this. You read group dynamics in real time, redirect unproductive energy, surface unspoken conflict before it calcifies, and leave teams in a better state than you found them.",
    typicalCareers: [
      "Chief People Officer",
      "Executive Coach",
      "Organisational Development Consultant",
      "Head of Talent",
      "Learning & Development Lead",
      "Team Coach",
      "People Operations Director",
      "Culture Strategist",
    ],
    superpower:
      "Diagnosing the real obstacle to a team's performance — which is rarely the one the team identifies — and intervening at the right level.",
    growthEdge:
      "The energy invested in enabling others can create the impression that you have no independent strategic agenda, which limits your upward influence in organisations that reward individual achievement.",
    idealEnvironment:
      "Scaling organisations where the rate-limiting factor is people coordination rather than capital or technology.",
  },

  {
    id: "diplomatic_navigator",
    name: "The Diplomatic Navigator",
    family: "Connectors",
    tagline: "You find the path that respects every constraint and still gets somewhere.",
    primaryRIASEC: "S",
    secondaryRIASEC: "C",
    bigFiveCentroid: {
      openness: 58,
      conscientiousness: 78,
      extraversion: 55,
      agreeableness: 82,
      emotionalStability: 65,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 1.5,
      extraversion: 0.5,
      agreeableness: 2.0,
      emotionalStability: 1.0,
    },
    description:
      "You are the professional who makes complex multi-stakeholder environments function. Where others see incompatible positions, you see a negotiation with a solution that has not been found yet. Your agreeableness creates the trust that allows parties to be honest about their actual constraints, and your conscientiousness means you follow through on commitments with enough reliability that your word is genuinely worth something.",
    typicalCareers: [
      "Diplomat",
      "Mediator",
      "Policy Analyst",
      "Government Relations Director",
      "International Affairs Officer",
      "Corporate Counsel",
      "HR Business Partner",
      "Change Management Lead",
    ],
    superpower:
      "Getting parties with genuinely competing interests to commit to an agreement that each finds acceptable — and holding them to it.",
    growthEdge:
      "The commitment to preserving relationships can produce agreements that defer rather than resolve underlying conflicts. Some things need to be decided rather than negotiated.",
    idealEnvironment:
      "Multi-stakeholder environments — government, international organisations, large corporations, regulated industries — where formal and informal authority are both required to move anything.",
  },

  // ── FAMILY 5: THE ORGANIZERS (Conventional-dominant) ─────────────────────

  {
    id: "precision_architect",
    name: "The Precision Architect",
    family: "Organizers",
    tagline: "You build the systems that carry the weight of everything else.",
    primaryRIASEC: "C",
    secondaryRIASEC: "I",
    bigFiveCentroid: {
      openness: 50,
      conscientiousness: 88,
      extraversion: 38,
      agreeableness: 50,
      emotionalStability: 65,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 1.0,
    },
    description:
      "You are motivated by getting things exactly right — not approximately right, exactly right — and you have the patience to do the work required to achieve this. Your investigative secondary code means you are also interested in how and why systems work at the level below the visible procedure, which makes you capable of improving the systems you maintain rather than simply operating them.",
    typicalCareers: [
      "Financial Accountant",
      "Actuary",
      "Compliance Officer",
      "Database Administrator",
      "Quality Systems Manager",
      "Tax Specialist",
      "Financial Modeller",
      "Regulatory Affairs Specialist",
    ],
    superpower:
      "Constructing systems of accuracy — financial, technical, or procedural — that hold up under audit, stress testing, and adversarial scrutiny.",
    growthEdge:
      "The precision orientation can create discomfort with ambiguity that is sometimes unavoidable. In early-stage or rapidly changing environments, 'good enough now' is often the right answer.",
    idealEnvironment:
      "Regulated industries, financial institutions, or quality-critical operations where the cost of errors is asymmetric and accuracy is the primary deliverable.",
  },

  {
    id: "operations_commander",
    name: "The Operations Commander",
    family: "Organizers",
    tagline: "You run things at scale, and you do not lose track of any of it.",
    primaryRIASEC: "C",
    secondaryRIASEC: "E",
    bigFiveCentroid: {
      openness: 48,
      conscientiousness: 85,
      extraversion: 80,
      agreeableness: 50,
      emotionalStability: 70,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 2.0,
      agreeableness: 0.5,
      emotionalStability: 1.0,
    },
    description:
      "You have an unusual combination of organisational precision and the interpersonal authority to direct others in executing complex operational plans. You do not merely manage processes — you own outcomes. The operational environments you thrive in are the ones that would visibly degrade without your coordination: multiple dependencies, external commitments, time-sensitive deliverables, and a team that needs someone willing to make the call when the situation is ambiguous.",
    typicalCareers: [
      "Chief Operating Officer",
      "Logistics Director",
      "Hospital Administrator",
      "Military Operations Officer",
      "Supply Chain Director",
      "City Manager",
      "Airline Operations Director",
      "Production Director",
    ],
    superpower:
      "Running high-complexity operational environments at peak efficiency across time zones, dependencies, and unexpected disruptions.",
    growthEdge:
      "The emphasis on operational control can create inflexibility in environments that require adaptive leadership rather than execution precision.",
    idealEnvironment:
      "Large, operationally complex organisations where multiple functions must be coordinated simultaneously and performance is measured by whether the service runs.",
  },

  {
    id: "reliable_guardian",
    name: "The Reliable Guardian",
    family: "Organizers",
    tagline: "You are the person others build their plans around.",
    primaryRIASEC: "C",
    secondaryRIASEC: "S",
    bigFiveCentroid: {
      openness: 42,
      conscientiousness: 82,
      extraversion: 50,
      agreeableness: 80,
      emotionalStability: 68,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 2.0,
      emotionalStability: 1.0,
    },
    description:
      "Your professional reputation rests on a combination of attributes that organisations chronically undervalue until they are absent: absolute reliability, procedural integrity, and a genuine orientation toward the people the organisation exists to serve. You do not produce the most spectacular results in any given quarter, but the foundation you maintain makes spectacular results possible for others.",
    typicalCareers: [
      "School Administrator",
      "Healthcare Coordinator",
      "Administrative Manager",
      "Customer Service Director",
      "Records Manager",
      "Benefits Administrator",
      "Compliance Manager",
      "Office Manager",
    ],
    superpower:
      "Creating the reliable infrastructure of trust — procedural, relational, and institutional — that allows other people to take productive risks.",
    growthEdge:
      "The orientation toward reliability and service can leave you underrepresented in decisions about direction and strategy, which means your institutional knowledge goes untapped.",
    idealEnvironment:
      "Service organisations, educational institutions, or healthcare settings where consistency of care over time is the core professional obligation.",
  },

  {
    id: "process_innovator",
    name: "The Process Innovator",
    family: "Organizers",
    tagline: "You make things work better without breaking what already works.",
    primaryRIASEC: "C",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 72,
      conscientiousness: 78,
      extraversion: 50,
      agreeableness: 55,
      emotionalStability: 60,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "You occupy the rare productive space between the person who defends existing processes and the person who wants to redesign everything from scratch. You start from a genuine understanding of why the current process exists — what constraints it was designed to accommodate, what failure modes it was built to prevent — and then find the modifications that improve performance without introducing new fragility.",
    typicalCareers: [
      "Business Analyst",
      "Process Engineer",
      "Digital Transformation Lead",
      "Lean/Six Sigma Consultant",
      "Operations Analyst",
      "Product Operations Manager",
      "IT Project Manager",
      "Continuous Improvement Manager",
    ],
    superpower:
      "Redesigning processes with the precision of an engineer and the creativity of a designer, while respecting institutional constraints that pure innovators ignore.",
    growthEdge:
      "The balanced orientation can make it difficult to advocate for the level of change that is sometimes genuinely required. Some systems need replacement, not iteration.",
    idealEnvironment:
      "Established organisations undergoing operational or digital transformation, where the challenge is improvement without discontinuity.",
  },

  {
    id: "analytical_strategist",
    name: "The Analytical Strategist",
    family: "Organizers",
    tagline: "You see the data, form the conclusion, and then make it happen.",
    primaryRIASEC: "C",
    secondaryRIASEC: "I",
    tertiaryRIASEC: "E",
    bigFiveCentroid: {
      openness: 62,
      conscientiousness: 85,
      extraversion: 75,
      agreeableness: 45,
      emotionalStability: 65,
    },
    bigFiveWeights: {
      openness: 0.5,
      conscientiousness: 2.0,
      extraversion: 2.0, // High extraversion separates from precision_architect
      agreeableness: 0.5,
      emotionalStability: 1.0,
    },
    description:
      "You are the rare combination of analytical depth, strategic clarity, and the interpersonal assertiveness to drive decisions through organisations that would prefer not to make them. You can operate credibly across the spreadsheet, the whiteboard, and the boardroom — and you have learned that most strategic failures are not failures of analysis but failures of implementation, which is why you stay close to both.",
    typicalCareers: [
      "Strategy Consultant",
      "Chief Strategy Officer",
      "Finance Director",
      "Business Development Lead",
      "Corporate Strategy Analyst",
      "Investment Analyst",
      "Competitive Intelligence Director",
      "M&A Analyst",
    ],
    superpower:
      "Connecting a rigorous quantitative analysis to an actionable strategic narrative that executives can commit to and operators can execute against.",
    growthEdge:
      "The span of competence across analysis, strategy, and execution can produce a leadership style that is difficult to delegate to — because you believe (often correctly) that you can do it better yourself.",
    idealEnvironment:
      "Strategy functions, professional services firms, or corporate headquarters where the output is a decision rather than a deliverable.",
  },

  {
    id: "detail_driven_creator",
    name: "The Detail-Driven Creator",
    family: "Organizers",
    tagline: "Your work is imaginative at the concept level and flawless at the execution level.",
    primaryRIASEC: "C",
    secondaryRIASEC: "A",
    bigFiveCentroid: {
      openness: 75,
      conscientiousness: 82,
      extraversion: 45,
      agreeableness: 58,
      emotionalStability: 58,
    },
    bigFiveWeights: {
      openness: 2.0,
      conscientiousness: 2.0,
      extraversion: 0.5,
      agreeableness: 0.5,
      emotionalStability: 0.5,
    },
    description:
      "You are one of the most commercially productive creative professionals in any field you enter — because you combine genuine creative vision with the technical discipline to execute it to a high standard, on time, without the organisational chaos that follows many creative people through their careers. Clients and employers learn quickly that commissioning you is not a gamble.",
    typicalCareers: [
      "Technical Writer",
      "Graphic Designer",
      "Copy Editor",
      "Content Strategist",
      "UX Writer",
      "Brand Designer",
      "Publications Manager",
      "Instructional Designer",
    ],
    superpower:
      "Producing creative work at a level of technical finish that most creative professionals achieve only when the deadline pressure is removed.",
    growthEdge:
      "The precision orientation can generate anxiety about creative work that is, by nature, unresolvable before release. At some point, the detail work has to stop and the work has to ship.",
    idealEnvironment:
      "Professional creative environments — agencies, publishing, in-house brand teams — where the quality bar is non-negotiable and the schedule is real.",
  },
];

// ─── Internal RIASEC Helpers ──────────────────────────────────────────────────

/** Map verbose RIASEC keys to single-letter codes */
const RIASEC_CODE_MAP: Record<keyof RIASECScores, string> = {
  realistic: "R",
  investigative: "I",
  artistic: "A",
  social: "S",
  enterprising: "E",
  conventional: "C",
};

/**
 * Get the dominant (highest) RIASEC type from scores.
 * Returns a single-letter code: R | I | A | S | E | C
 */
function getDominantRIASEC(scores: RIASECScores): string {
  const keys = Object.keys(scores) as Array<keyof RIASECScores>;
  const dominant = keys.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  return RIASEC_CODE_MAP[dominant];
}

/**
 * Get the secondary (second-highest) RIASEC type from scores.
 * Returns a single-letter code: R | I | A | S | E | C
 */
function getSecondaryRIASEC(scores: RIASECScores): string {
  const entries = (Object.keys(scores) as Array<keyof RIASECScores>)
    .map((k) => ({ key: k, score: scores[k] }))
    .sort((a, b) => b.score - a.score);
  return RIASEC_CODE_MAP[entries[1].key];
}

/**
 * Get the tertiary (third-highest) RIASEC type from scores.
 * Returns a single-letter code: R | I | A | S | E | C
 */
function getTertiaryRIASEC(scores: RIASECScores): string {
  const entries = (Object.keys(scores) as Array<keyof RIASECScores>)
    .map((k) => ({ key: k, score: scores[k] }))
    .sort((a, b) => b.score - a.score);
  return RIASEC_CODE_MAP[entries[2].key];
}

// ─── Distance Calculation ─────────────────────────────────────────────────────

/**
 * Weighted Euclidean distance between a user's Big Five scores and an
 * archetype's centroid, scaled by the archetype's dimensional weights.
 *
 * Formula: sqrt( sum_i( weight_i * (user_i - centroid_i)^2 ) )
 *
 * A lower distance = a closer match.
 *
 * @param user     User's Big Five scores (each 0–100)
 * @param centroid Archetype's ideal Big Five centroid (each 0–100)
 * @param weights  Optional custom weights; defaults to equal weight of 1.0
 */
export function bigFiveDistance(
  user: BigFiveScores,
  centroid: BigFiveScores,
  weights: Record<string, number> = {},
): number {
  const dimensions: Array<keyof BigFiveScores> = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "emotionalStability",
  ];

  const sum = dimensions.reduce((acc, dim) => {
    const w = weights[dim] ?? 1.0;
    const diff = user[dim] - centroid[dim];
    return acc + w * diff * diff;
  }, 0);

  return Math.sqrt(sum);
}

// ─── Secondary Code Bonus ─────────────────────────────────────────────────────

/** 10% distance reduction when secondary RIASEC code matches */
const SECONDARY_CODE_BONUS = 0.10;

/** 3% distance reduction when tertiary RIASEC code matches */
const TERTIARY_CODE_BONUS = 0.03;

// ─── Primary Matching Function ────────────────────────────────────────────────

/**
 * Determine the user's primary archetype from their RIASEC and Big Five scores.
 *
 * Algorithm:
 *   Stage 1 — Primary filter:
 *     Build a candidate pool of all archetypes whose primaryRIASEC code matches
 *     the user's dominant interest code. Falls back to the full set if no
 *     candidates match (should not occur with the full 30-archetype registry).
 *
 *   Stage 2 — Big Five ranking:
 *     For each candidate, compute the weighted Euclidean distance between the
 *     user's Big Five scores and the archetype's centroid. Apply a secondary
 *     RIASEC code bonus (10% reduction) when the secondary code matches, and a
 *     smaller tertiary bonus (3% reduction) when applicable. Return the
 *     archetype with the smallest adjusted distance.
 *
 * @param riasec  User's RIASEC interest scores (each 0–100)
 * @param bigFive User's Big Five personality scores (each 0–100)
 * @returns       The best-matching Archetype
 */
export function determineArchetype(
  riasec: RIASECScores,
  bigFive: BigFiveScores,
): Archetype {
  const dominant = getDominantRIASEC(riasec);
  const secondary = getSecondaryRIASEC(riasec);
  const tertiary = getTertiaryRIASEC(riasec);

  // Stage 1: Filter to archetypes whose primary RIASEC matches the dominant code
  let candidates = ARCHETYPES.filter((a) => a.primaryRIASEC === dominant);

  // Fallback: should not occur with the complete registry, but ensures safety
  if (candidates.length === 0) {
    candidates = ARCHETYPES;
  }

  // Stage 2: Rank by weighted Big Five distance with secondary/tertiary bonuses
  let bestArchetype: Archetype = candidates[0];
  let bestDistance = Infinity;

  for (const archetype of candidates) {
    let distance = bigFiveDistance(
      bigFive,
      archetype.bigFiveCentroid,
      archetype.bigFiveWeights,
    );

    // Secondary RIASEC code match: 10% distance reduction
    if (archetype.secondaryRIASEC === secondary) {
      distance *= (1 - SECONDARY_CODE_BONUS);
    }

    // Tertiary RIASEC code match: additional 3% reduction
    if (archetype.tertiaryRIASEC && archetype.tertiaryRIASEC === tertiary) {
      distance *= (1 - TERTIARY_CODE_BONUS);
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      bestArchetype = archetype;
    }
  }

  return bestArchetype;
}

// ─── Ranking Function ─────────────────────────────────────────────────────────

/**
 * Return the top N closest archetypes across all families, ranked by adjusted
 * Big Five distance. Applies a 40% distance penalty for archetypes outside the
 * user's dominant RIASEC family to preserve family relevance while still
 * surfacing meaningful cross-family matches.
 *
 * Useful for "You're also similar to..." secondary suggestions in the UI.
 *
 * @param riasec  User's RIASEC interest scores (each 0–100)
 * @param bigFive User's Big Five personality scores (each 0–100)
 * @param count   Number of archetypes to return (default 3)
 * @returns       Array of Archetype objects in ascending distance order
 */
export function rankArchetypes(
  riasec: RIASECScores,
  bigFive: BigFiveScores,
  count: number = 3,
): Archetype[] {
  const dominant = getDominantRIASEC(riasec);
  const secondary = getSecondaryRIASEC(riasec);

  const ranked = ARCHETYPES.map((archetype) => {
    let distance = bigFiveDistance(
      bigFive,
      archetype.bigFiveCentroid,
      archetype.bigFiveWeights,
    );

    // 40% penalty for archetypes outside the user's dominant RIASEC family
    if (archetype.primaryRIASEC !== dominant) {
      distance *= 1.40;
    }

    // 10% reduction for matching secondary code
    if (archetype.secondaryRIASEC === secondary) {
      distance *= (1 - SECONDARY_CODE_BONUS);
    }

    return { archetype, distance };
  });

  ranked.sort((a, b) => a.distance - b.distance);

  return ranked.slice(0, count).map((r) => r.archetype);
}

// ─── Convenience Helpers ──────────────────────────────────────────────────────

/**
 * Get an archetype by its ID string (e.g., "analytical_architect").
 * Returns undefined if not found.
 */
export function getArchetypeById(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}

/**
 * Get all archetypes belonging to a given family.
 * Family values: "Builders" | "Thinkers" | "Creators" | "Connectors" | "Organizers"
 */
export function getArchetypesByFamily(family: string): Archetype[] {
  return ARCHETYPES.filter((a) => a.family === family);
}

/**
 * Convenience wrapper that returns just the archetype ID, name, and family.
 * Useful for storing a lightweight reference in the assessments table.
 */
export function getArchetypeLabel(
  riasec: RIASECScores,
  bigFive: BigFiveScores,
): { id: string; name: string; family: string } {
  const archetype = determineArchetype(riasec, bigFive);
  return {
    id: archetype.id,
    name: archetype.name,
    family: archetype.family,
  };
}
