# PathWise Career Archetype Naming System

**Document status:** Research & Design  
**Version:** 1.0  
**Date:** 2026-04-06

---

## Purpose

This document defines the complete naming system for PathWise's 30 career archetypes. Each archetype is a stable personality-career signature derived from a user's dominant RIASEC interest codes and Big Five personality trait profile. The system is designed to replace the current `workStyle-experienceLevel` string stored in `personality_type` with a psychologically grounded, narrative-rich identity that users will recognise as true to themselves — the precondition for trusting any career recommendation that follows from it.

The closest public reference point is 16Personalities' MBTI-derived type system: memorable two-word names, second-person narrative descriptions that feel personal rather than clinical, and a structure that is simple enough to communicate in a product UI while sophisticated enough to be defensible to a psychologist. PathWise builds on a stronger empirical foundation because both RIASEC (Holland, 1973) and the Big Five (Costa & McCrae, 1992) have accumulated substantially more predictive validity evidence than MBTI for vocational outcomes.

---

## Theoretical Foundation

### RIASEC Codes

Holland's six interest types describe the work environments and activities a person is drawn to:

**R — Realistic.** Preference for working with tools, machines, physical materials, and the natural world. Concrete problems. Tangible outputs.

**I — Investigative.** Preference for research, analysis, abstract problem-solving. Satisfaction from understanding how things work.

**A — Artistic.** Preference for creative expression, ambiguity, originality. Discomfort with rigid structure.

**S — Social.** Preference for working with and through people. Teaching, counselling, facilitation, community.

**E — Enterprising.** Preference for leading, persuading, competing. Commercial energy. Influence as a goal.

**C — Conventional.** Preference for order, data, procedures, accuracy. Reliability as a value rather than a constraint.

Each user receives a score from 0–100 on all six codes. The dominant code (highest score) determines family membership. The secondary code (second-highest) separates archetypes within the family.

### Big Five Dimensions

The Five Factor Model describes personality on five independent axes. For archetype differentiation, each dimension is treated as a continuous score 0–100, with thresholds applied in the matching algorithm:

**O — Openness to Experience.** Curiosity, aesthetic sensitivity, intellectual breadth, comfort with novelty.  
**C — Conscientiousness.** Self-discipline, organisation, deliberateness, follow-through.  
**E — Extraversion.** Sociability, assertiveness, positive affect, stimulation-seeking.  
**A — Agreeableness.** Cooperativeness, trust, prosocial motivation, conflict-avoidance.  
**N — Neuroticism.** Emotional reactivity, anxiety, susceptibility to negative affect. (Inverse scale: high score = low Emotional Stability.)

For archetype matching, Emotional Stability is used in place of Neuroticism: `emotionalStability = 100 - neuroticism`.

---

## The 30 Archetypes

Scores referenced in trait signatures use directional shorthand: **high** = above 65, **low** = below 40. Traits not listed are considered neutral in the matching logic for that archetype.

---

### FAMILY 1: THE BUILDERS (Realistic-dominant)

*Builders are drawn to making things that exist in the physical world. Their satisfaction is tactile and verifiable — something works, or it does not.*

---

#### 1. The Pragmatic Builder

**RIASEC dominant:** R (primary), I (secondary)  
**Big Five signature:** High Conscientiousness  
**Tagline:** You solve real problems with real solutions — no theory required.

You are the person who gets called when something needs to actually work. You approach problems with a bias toward execution: gather the facts, weigh the options, choose the most reliable path, and see it through. Abstract frameworks interest you only insofar as they produce better outcomes in the physical world. You trust what has been tested, and you test what is new before committing to it. The gap between your completed projects and your peers' half-finished ones is not a matter of talent — it is a matter of discipline.

**Typical careers:** Civil Engineer, Industrial Engineer, Mechanical Engineer, Construction Project Manager, Manufacturing Operations Manager, Quality Assurance Engineer, Infrastructure Architect

**Superpower:** Converting complex constraints into workable builds ahead of schedule and under budget.

**Growth edge:** The preference for proven methods can harden into resistance to approaches that are genuinely better. The world's best solution ignored because it is unfamiliar still costs you.

**Work environment:** Structured organisations where outputs are measurable, projects have clear deliverables, and mastery earns authority.

---

#### 2. The Creative Maker

**RIASEC dominant:** R (primary), A (secondary)  
**Big Five signature:** High Openness  
**Tagline:** You build things that are functional and, somehow, beautiful.

You inhabit the productive tension between craft and creativity. Where most builders want the best solution, you want the best solution that also has elegance — and you are usually right that the two are not mutually exclusive. You gravitate toward work that involves design constraints because constraints, paradoxically, are where your imagination does its best work. The functional object that is also visually striking, the engineered space that also moves people: these are your natural habitat.

**Typical careers:** Industrial Designer, Product Designer, UX Engineer, Architectural Designer, Woodworking Artisan, Fabrication Artist, Game Environment Artist, Furniture Designer

**Superpower:** Producing work at the intersection of function and form that neither pure engineers nor pure artists could achieve alone.

**Growth edge:** The desire for aesthetic coherence can extend project timelines in ways that frustrate collaborators and clients. Not every deliverable needs to be a statement.

**Work environment:** Studios, maker spaces, or design-integrated engineering teams where the brief has room for interpretation.

---

#### 3. The Steady Craftsperson

**RIASEC dominant:** R (primary), C (secondary)  
**Big Five signature:** High Conscientiousness, High Emotional Stability  
**Tagline:** Excellence built incrementally, with no drama and no shortcuts.

You are the professional that every high-stakes environment quietly depends on. Your work is characterised by a combination of technical precision and emotional steadiness that is rarer than most hiring managers realise. You do not need external validation to stay motivated, you do not catastrophise when things go wrong, and you do not cut corners when no one is watching. The quality of your output is effectively constant across conditions — which, in practice, is one of the most commercially valuable traits a skilled worker can have.

**Typical careers:** Machinist, Surgical Technician, Aircraft Maintenance Technician, Carpenter, Electrician, Plumber, Forensic Analyst, Medical Device Technician

**Superpower:** Maintaining elite-level accuracy and composure in conditions — high stakes, repetitive demand, or time pressure — that degrade most workers' performance.

**Growth edge:** Steadiness and routine can become a comfort zone that forecloses development. The skills that got you to mastery are not always the skills that take you further.

**Work environment:** Specialised, technically demanding settings where procedural exactness is non-negotiable and reputation is built over years.

---

#### 4. The Field Engineer

**RIASEC dominant:** R (primary), I (secondary)  
**Big Five signature:** High Conscientiousness, Low Agreeableness  
**Tagline:** You fix what others theorised into existence.

You are most effective when the gap between a blueprint and reality needs to be bridged by someone willing to say what is not working and then do something about it. Your low agreeableness is not a social deficiency — it is a professional asset in environments where the cost of false consensus is a structural failure, a missed deadline, or a safety incident. You do not need people to like you. You need the system to function.

**Typical careers:** Field Service Engineer, Drilling Engineer, Structural Inspector, Plant Engineer, Mining Engineer, Reliability Engineer, Combat Systems Engineer, Geotechnical Engineer

**Superpower:** Delivering technical verdicts that stick — free from the organisational pressure to tell people what they want to hear.

**Growth edge:** The directness that earns trust in the field can damage relationships in managerial or cross-functional settings that require more political navigation.

**Work environment:** Remote, industrial, or infrastructure-critical environments where competence is the primary currency and the work speaks for itself.

---

#### 5. The Green Pioneer

**RIASEC dominant:** R (primary), I (secondary)  
**Big Five signature:** High Openness  
**Tagline:** You build the infrastructure for a world that does not exist yet.

You are motivated by problems at scale — the intersection of engineering rigour and environmental consequence. You are not a campaigner; you are a builder. What distinguishes you from the Pragmatic Builder is that your definition of "what works" explicitly includes externalities that traditional engineering economics discounts. You are drawn to technical domains where the answers have not been fully written because the questions are still being formed.

**Typical careers:** Renewable Energy Engineer, Environmental Engineer, Sustainability Consultant, Climate Tech Founder, Water Systems Engineer, Carbon Capture Engineer, Conservation Technology Specialist, Green Building Architect

**Superpower:** Applying first-principles engineering thinking to problems that most of your peers have not yet recognised as engineering problems.

**Growth edge:** The urgency behind the work can generate impatience with institutional pace. Systemic change moves slower than individual insight.

**Work environment:** Mission-aligned organisations, research institutions, or early-stage ventures where technical work and environmental purpose reinforce each other.

---

#### 6. The Hands-On Leader

**RIASEC dominant:** R (primary), E (secondary)  
**Big Five signature:** High Extraversion  
**Tagline:** You lead from the front, tools in hand.

You are the foreman who knows every trade, the site manager who can do the job she is supervising, the operations director who started on the floor. Your authority is earned through demonstrated competence rather than title, and your teams know the difference. You are most effective in environments where the respect of skilled workers matters — which means your influence depends on staying close to the work even as your scope expands.

**Typical careers:** Construction Superintendent, Plant Manager, Fire Captain, Head of Field Operations, Workshop Manager, Technical Director, Chief of Engineering

**Superpower:** Building technically skilled teams that trust their leader because she has done the work herself.

**Growth edge:** Remaining close to the hands-on work can limit the strategic abstraction required at senior levels. At some point, the tools have to be put down.

**Work environment:** Operational environments where authority is grounded in technical credibility and teams are measured by physical outputs.

---

### FAMILY 2: THE THINKERS (Investigative-dominant)

*Thinkers are energised by problems that resist obvious answers. They are driven by the need to understand before acting — and they are willing to defer certainty longer than most.*

---

#### 7. The Analytical Architect

**RIASEC dominant:** I (primary), R (secondary)  
**Big Five signature:** High Conscientiousness, High Openness  
**Tagline:** You design systems that hold together under conditions their creators never anticipated.

You think in structures — logical, technical, organisational, financial. Your work is characterised by the density of the considerations you hold simultaneously and the rigour with which you reason about interactions between components. You are drawn to design problems because they require both imagination and exactness, and you have an unusual tolerance for the sustained cognitive effort required to get both right in the same artefact. Your deliverables tend to outlive you on a project because they were built to.

**Typical careers:** Solutions Architect, Systems Engineer, Enterprise Architect, Security Architect, Cloud Infrastructure Architect, Database Architect, Technical Program Manager

**Superpower:** Producing designs that are simultaneously coherent, scalable, and honest about their constraints — documentation that saves the teams who inherit it.

**Growth edge:** Perfectionism at the design stage can create the architectural equivalent of analysis paralysis. At some point, you have to build the imperfect version.

**Work environment:** Complex technical organisations where decisions made on whiteboards have six-figure downstream consequences.

---

#### 8. The Research Explorer

**RIASEC dominant:** I (primary), A (secondary)  
**Big Five signature:** High Openness  
**Tagline:** The most interesting question is the one nobody has asked yet.

You are drawn to the boundary of what is known — not as a comfort zone but as a vocation. Your intellectual curiosity does not discriminate well between adjacent domains, which is simultaneously a limitation and a superpower. The unexpected connection between a finding in one field and a problem in another is where your best work tends to originate. You are most productive in environments that tolerate uncertainty and reward genuine discovery rather than the efficient execution of predetermined hypotheses.

**Typical careers:** Research Scientist, Academic Researcher, R&D Specialist, UX Researcher, Anthropologist, Innovation Lead, Science Journalist, Futurist

**Superpower:** Formulating research questions precise enough to be answerable and broad enough to matter.

**Growth edge:** The love of exploration can produce extensive inquiry that never converges on an answer someone can act on. The application step is not always optional.

**Work environment:** Universities, think tanks, or corporate R&D labs where the timeline for intellectual payoff is measured in years rather than sprints.

---

#### 9. The Data Storyteller

**RIASEC dominant:** I (primary), S (secondary)  
**Big Five signature:** High Openness, High Agreeableness  
**Tagline:** You make numbers mean something to the people who need to act on them.

You occupy a position that most organisations desperately need and consistently fail to hire for: the person who can move fluently between rigorous quantitative analysis and clear human communication without sacrificing either. You find satisfaction not only in discovering what the data says but in the moment when the person across the table understands it well enough to make a better decision. The analytical work is the means; the changed behaviour is the end.

**Typical careers:** Data Analyst, Business Intelligence Lead, Data Journalist, Strategy Analyst, Product Analyst, Behavioural Economist, Research Communicator, Public Health Analyst

**Superpower:** Translating statistical complexity into executive-grade clarity without misrepresenting what the evidence actually supports.

**Growth edge:** The desire to be understood can create pressure to simplify past the point of accuracy. The nuance you drop in the name of clarity sometimes turns out to matter.

**Work environment:** Data-rich organisations with decision-makers willing to change course based on evidence rather than instinct.

---

#### 10. The Systems Thinker

**RIASEC dominant:** I (primary), C (secondary)  
**Big Five signature:** High Conscientiousness  
**Tagline:** You see the feedback loops that others mistake for isolated problems.

Where most professionals see a sequence of events, you see a system with interdependencies, time delays, and reinforcing dynamics. This is not a trained competency for you — it is a default cognitive mode. You are attracted to problems that keep recurring despite apparent solutions, because you recognise that recurring problems are usually structural rather than individual. Your analyses tend to be uncomfortable for organisations because they implicate the system rather than exonerating it.

**Typical careers:** Management Consultant, Operations Researcher, Policy Analyst, Supply Chain Strategist, Risk Manager, Business Architect, Process Engineer, Organisational Consultant

**Superpower:** Diagnosing root causes that survive the obvious explanation and persist through multiple rounds of attempted fixes.

**Growth edge:** Systems thinking at its worst produces elaborate models of why nothing will work. The practical implication matters as much as the diagnosis.

**Work environment:** Organisations large enough to have genuine systemic complexity and courageous enough to hear an honest account of it.

---

#### 11. The Scientific Visionary

**RIASEC dominant:** I (primary), A (secondary)  
**Big Five signature:** High Openness, Low Conformity (Low Conscientiousness)  
**Tagline:** You are not interested in confirming what everyone already suspects.

Your research does not follow the standard template because you are drawn to questions that the standard template cannot accommodate. You have an unusually high tolerance for being wrong in public, because you know that the rate of interesting wrong hypotheses is the leading indicator of important eventual discoveries. Your institutional career has been complicated by a genuine inability to feign interest in incremental work. This is not a character flaw — it is a calibration that makes transformative research possible.

**Typical careers:** Principal Scientist, Theoretical Physicist, Computational Biologist, AI Researcher, Biotech Founder, Philosophy of Science Academic, Speculative Designer, Deep Tech Entrepreneur

**Superpower:** Generating hypotheses that are genuinely novel and precisely enough stated to be tested.

**Growth edge:** The institutional friction generated by unconventional approaches consumes energy that might otherwise go into the work itself. Some accommodation of process is not capitulation.

**Work environment:** Research institutions, frontier labs, or early-stage ventures where intellectual ambition is the primary competitive advantage.

---

#### 12. The Clinical Mind

**RIASEC dominant:** I (primary), S (secondary)  
**Big Five signature:** High Conscientiousness, High Emotional Stability  
**Tagline:** You reach the right diagnosis because you do not let urgency contaminate your reasoning.

You are built for high-stakes environments where the pressure to act quickly is in constant tension with the need to act correctly. Your emotional stability is a clinical asset: you maintain the same rigorous reasoning process under crisis conditions that others achieve only in calm ones. You are drawn to the human element of your work — you chose a people-facing application of your analytical gifts deliberately — but you understand that genuine care sometimes requires withholding the answer the patient wants to hear.

**Typical careers:** Physician, Psychiatrist, Clinical Psychologist, Epidemiologist, Medical Researcher, Pharmacist, Forensic Pathologist, Biostatistician, Clinical Trial Manager

**Superpower:** Holding the complexity of a diagnostic or treatment problem steady under pressure long enough to reach a defensible conclusion.

**Growth edge:** The preference for rigour and certainty before action can create distance that patients or clients experience as coldness. Bedside manner is also a clinical outcome.

**Work environment:** Healthcare systems, clinical research organisations, or diagnostic institutions where standards of evidence are treated as non-negotiable.

---

### FAMILY 3: THE CREATORS (Artistic-dominant)

*Creators are motivated by expression, originality, and the making of meaning. They are defined less by what they produce than by their need to produce something that did not exist before.*

---

#### 13. The Creative Catalyst

**RIASEC dominant:** A (primary), E (secondary)  
**Big Five signature:** High Openness, High Extraversion  
**Tagline:** You generate ideas fast enough that the room has to run to keep up.

Your most productive mode is collaborative — not because you need validation but because other people's reactions are fuel. You read an audience in real time and redirect your energy accordingly. What looks to observers like effortless creativity is actually a high-bandwidth feedback loop: you generate, test against the room, integrate the signal, and generate again. The ideas you arrive at through this process are better than the ones you would have produced alone.

**Typical careers:** Creative Director, Brand Strategist, Advertising Executive, Entertainment Producer, Podcast Host, Marketing Innovator, Experience Designer, Chief Creative Officer

**Superpower:** Running creative processes at speed without losing the quality bar — and getting teams to match that pace.

**Growth edge:** The social energy that accelerates ideation can crowd out the sustained solitary work that produces depth. Some of your best ideas need more time alone.

**Work environment:** Fast-moving creative agencies, media companies, or brand-centric organisations where the output is ideas and the currency is attention.

---

#### 14. The Quiet Innovator

**RIASEC dominant:** A (primary), I (secondary)  
**Big Five signature:** High Openness, Low Extraversion  
**Tagline:** Your best work happens in the hours before anyone else arrives.

You are a deeply independent creative who produces most effectively at the edge of long, uninterrupted concentration. You are not shy — you simply find that the internal creative process requires protection from social interruption. Your work tends to have a singular coherence that collaborative creative output often lacks, because it comes from one sustained vision rather than committee. The world consistently underestimates quiet people who make things.

**Typical careers:** Author, Game Designer, Composer, Software Engineer, Independent Filmmaker, Research Designer, Illustrator, Cryptographer, Conceptual Artist

**Superpower:** Sustaining the focused creative effort over weeks and months that produces work with genuine intellectual or aesthetic depth.

**Growth edge:** The preference for working alone can produce work that is brilliant but inaccessible, or finished products that nobody knows about.

**Work environment:** Independent or small-team settings with protected deep-work time and minimal coordination overhead.

---

#### 15. The Experience Designer

**RIASEC dominant:** A (primary), S (secondary)  
**Big Five signature:** High Openness, High Agreeableness  
**Tagline:** You design the moment and then watch people live inside it.

Your creative work is oriented toward the experience of another person — not the object you produce but the feeling it generates in someone else. This orientation makes you unusually effective as a collaborator with end users, because you are genuinely motivated by their perspective rather than treating user research as a compliance exercise. The products, spaces, and services you design tend to feel considered in ways that users can sense even if they cannot articulate why.

**Typical careers:** UX Designer, Service Designer, Museum Curator, Events Designer, Learning Experience Designer, Customer Experience Lead, Interior Designer, Theatre Director

**Superpower:** Mapping the emotional arc of an interaction and designing backwards from the moment you want the user to feel.

**Growth edge:** The deep empathy for users can make it difficult to make decisions that disappoint them, even when those decisions are strategically necessary.

**Work environment:** Human-centred design teams, cultural institutions, or experience-led businesses where the customer journey is treated as a designed artefact.

---

#### 16. The Visual Storyteller

**RIASEC dominant:** A (primary), R (secondary)  
**Big Five signature:** High Openness  
**Tagline:** You see the image before you see the words.

Your thinking is fundamentally visual. The spatial, compositional, and tonal vocabulary that others acquire through training is your native language, which means you often communicate most precisely through images rather than text — and that you notice visual incoherence in the world with the same involuntary irritation that others feel toward grammatical errors. You are drawn to work that involves translating complex realities into visual representations that carry meaning without losing accuracy.

**Typical careers:** Photographer, Videographer, Motion Graphics Designer, Data Visualisation Specialist, Architectural Renderer, Documentary Filmmaker, Creative Technologist, Visual Development Artist

**Superpower:** Constructing images — static or moving — that communicate in a fraction of the time that text or speech would require.

**Growth edge:** The visual frame can become a constraint rather than a tool when the problem requires verbal or numerical precision. Not every truth has a good visual analogue.

**Work environment:** Studios, production companies, or organisations where visual communication is central to the product rather than a support function.

---

#### 17. The Cultural Curator

**RIASEC dominant:** A (primary), S (secondary)  
**Big Five signature:** High Openness, High Benevolence  
**Tagline:** You know what matters and you know how to make other people care about it.

You are motivated by the circulation of ideas, art, and culture through communities that would not otherwise encounter them. Your role is intermediary — you do not always make the thing, but you select, contextualise, and amplify it in ways that change how people understand themselves and the world. This is not curation in the boutique retail sense; it is the serious work of deciding what a community pays attention to and why.

**Typical careers:** Arts Administrator, Cultural Programme Director, Editorial Director, Librarian, Museum Director, Public Radio Producer, Humanities Academic, Book Editor, Festival Director

**Superpower:** Identifying work or ideas with genuine resonance before the broader culture has caught up, and building the audience infrastructure to match.

**Growth edge:** The commitment to cultural value over commercial value can create persistent resource constraints that drain energy from the curatorial work itself.

**Work environment:** Cultural institutions, media organisations, or educational settings where the mission is explicit and the audience's development over time is the metric.

---

#### 18. The Boundary Breaker

**RIASEC dominant:** A (primary), E (secondary)  
**Big Five signature:** High Openness, Low Conformity  
**Tagline:** You do not ask permission to try the thing that has not been done before.

You are constitutionally incapable of treating existing conventions as constraints rather than starting points. This produces friction in institutional settings and a disproportionate creative output in environments designed to accommodate it. Your best work tends to come from problems that the field has given up on or has not yet noticed — and your willingness to be wrong in highly visible ways is the price you pay for the asymmetric upside of being spectacularly right.

**Typical careers:** Experimental Artist, Creative Technologist, Disruptive Brand Founder, Performance Artist, Avant-Garde Designer, Innovation Researcher, Unconventional Entrepreneur, Art Director

**Superpower:** Producing work that redefines the problem rather than solving the one that was given.

**Growth edge:** The resistance to convention can become reflexive contrarianism. Not every established approach is wrong, and some battles are not worth having.

**Work environment:** Independent practice, experimental labs, or organisations that have deliberately built a tolerance for unresolved ideas and incomplete attempts.

---

### FAMILY 4: THE CONNECTORS (Social/Enterprising-dominant)

*Connectors draw energy from human contact and direct their ability toward influence, guidance, and collective action. Their medium is the relationship.*

---

#### 19. The Empathetic Guide

**RIASEC dominant:** S (primary), A (secondary)  
**Big Five signature:** High Agreeableness, High Openness  
**Tagline:** You meet people exactly where they are, and then move them forward.

Your effectiveness as a guide or counsellor comes from a quality that cannot be trained in the standard sense: the genuine desire to understand another person's interior life before offering any response. You do not impose frameworks; you build them from what people tell you. Your high openness means you can tolerate ambiguity in a conversation — you do not rush to resolution — which creates the safety people need to tell you the true version of what is happening.

**Typical careers:** Therapist, Career Coach, School Counsellor, Diversity & Inclusion Consultant, Life Coach, Social Worker, Pastoral Care Worker, Chaplain, Community Psychologist

**Superpower:** Holding difficult conversations that produce genuine insight rather than performed resolution.

**Growth edge:** The depth of your investment in individual people can create an unsustainable emotional load. The oxygen mask instruction is professionally literal for you.

**Work environment:** One-to-one or small-group settings where the quality of the relationship is the primary mechanism of change and follow-through is measured over time.

---

#### 20. The Community Builder

**RIASEC dominant:** S (primary), E (secondary)  
**Big Five signature:** High Extraversion, High Agreeableness  
**Tagline:** You turn a group of individuals into something that looks after itself.

You are drawn to the challenge of creating conditions under which people with aligned interests begin to coordinate without you. The communities you build have a distinctive quality: they hold together when you step back, because you designed for sustainability rather than dependency. You are energised by the connective work — introductions, gatherings, rituals, shared narratives — but your deeper satisfaction comes from watching the network operate on its own logic.

**Typical careers:** Community Manager, Nonprofit Executive Director, Union Organiser, Social Enterprise Founder, HR Director, Membership Organisations Leader, Civic Leader, Employee Experience Lead

**Superpower:** Designing community structures that generate collective trust faster than the natural default rate.

**Growth edge:** The investment in other people's success can lead to neglecting your own professional development and visibility. Communities need champions, not just architects.

**Work environment:** Mission-driven organisations, civic institutions, or people-first companies where the culture is treated as a product rather than a byproduct.

---

#### 21. The Strategic Leader

**RIASEC dominant:** E (primary), I (secondary)  
**Big Five signature:** High Extraversion, High Conscientiousness  
**Tagline:** You set direction, and then you prove it was right.

You combine the assertive confidence required to stake a strategic position with the analytical discipline required to back it up. This is less common than it sounds. Many strategic leaders are strong on vision or strong on rigour; you hold both simultaneously, which means you can defend your positions in detail without losing the conviction that makes others want to follow. You earn credibility with two very different audiences — the board and the engineering team — by being genuinely fluent in both their languages.

**Typical careers:** Chief Executive Officer, Chief Technology Officer, VP of Strategy, Management Consultant, Programme Director, General Manager, Political Leader, Investment Banker

**Superpower:** Building organisational alignment around a strategic position that you can defend analytically under pressure from credible critics.

**Growth edge:** The combination of extraversion and high conscientiousness can produce an impatience with the pace of others that damages the trust required to lead effectively.

**Work environment:** Complex organisations where decisions have long time horizons, multiple stakeholders, and material financial or operational consequences.

---

#### 22. The Visionary Entrepreneur

**RIASEC dominant:** E (primary), A (secondary)  
**Big Five signature:** High Openness, Low Agreeableness  
**Tagline:** You build what the market does not yet know it wants.

Your entrepreneurial engine runs on a specific combination: the creative ability to see a future state that does not currently exist and the low agreeableness to pursue it without waiting for permission or consensus. The friction this creates with investors, partners, and early employees is a known cost of your operating model. The ventures that succeed do so because the vision was real enough that the friction was worth paying.

**Typical careers:** Startup Founder, Creative Entrepreneur, Product Visionary, Chief Innovation Officer, Venture-backed CEO, Brand Builder, Creative Agency Founder, Platform Founder

**Superpower:** Articulating a product or market vision with sufficient precision and conviction that talented people choose to build it with you.

**Growth edge:** The low agreeableness that protects the vision in early stages can become a liability at scale, when the organisation needs collaborative decision-making rather than founder authority.

**Work environment:** Early to growth-stage ventures where the founding vision is still the primary competitive asset and organisational structure is still being invented.

---

#### 23. The People Catalyst

**RIASEC dominant:** E (primary), S (secondary)  
**Big Five signature:** High Extraversion, High Agreeableness  
**Tagline:** You make everyone in the room more effective than they would be without you.

Your primary mode of value creation is relational. You are not the best individual contributor in most rooms you enter, and you are entirely comfortable with this — because you understand, in an intuitive and practical sense, that the organisation's output is determined by how well its people operate in relation to each other, and you are exceptionally good at improving that. You read group dynamics in real time, redirect unproductive energy, surface unspoken conflict before it calcifies, and leave teams in a better state than you found them.

**Typical careers:** Chief People Officer, Executive Coach, Organisational Development Consultant, Head of Talent, Learning & Development Lead, Team Coach, People Operations Director, Culture Strategist

**Superpower:** Diagnosing the real obstacle to a team's performance — which is rarely the one the team identifies — and intervening at the right level.

**Growth edge:** The energy invested in enabling others can create the impression that you have no independent strategic agenda, which limits your upward influence in organisations that reward individual achievement.

**Work environment:** Scaling organisations where the rate-limiting factor is people coordination rather than capital or technology.

---

#### 24. The Diplomatic Navigator

**RIASEC dominant:** S (primary), C (secondary)  
**Big Five signature:** High Agreeableness, High Conscientiousness  
**Tagline:** You find the path that respects every constraint and still gets somewhere.

You are the professional who makes complex multi-stakeholder environments function. Where others see incompatible positions, you see a negotiation with a solution that has not been found yet. Your agreeableness creates the trust that allows parties to be honest about their actual constraints, and your conscientiousness means you follow through on commitments with enough reliability that your word is genuinely worth something. These two traits together produce the rarest of diplomatic assets: people believe you, and you deliver.

**Typical careers:** Diplomat, Mediator, Policy Analyst, Government Relations Director, International Affairs Officer, Corporate Counsel, HR Business Partner, Contract Manager, Change Management Lead

**Superpower:** Getting parties with genuinely competing interests to commit to an agreement that each finds acceptable — and holding them to it.

**Growth edge:** The commitment to preserving relationships can produce agreements that defer rather than resolve underlying conflicts. Some things need to be decided rather than negotiated.

**Work environment:** Multi-stakeholder environments — government, international organisations, large corporations, regulated industries — where formal and informal authority are both required to move anything.

---

### FAMILY 5: THE ORGANIZERS (Conventional/mixed-dominant)

*Organisers are motivated by bringing order to complexity. They find satisfaction where others find administrative burden — in the structure that makes everything else possible.*

---

#### 25. The Precision Architect

**RIASEC dominant:** C (primary), I (secondary)  
**Big Five signature:** High Conscientiousness  
**Tagline:** You build the systems that carry the weight of everything else.

You are motivated by getting things exactly right — not approximately right, exactly right — and you have the patience to do the work required to achieve this. In environments defined by high consequence for error, you are not merely competent but genuinely irreplaceable. Your investigative secondary code means you are also interested in how and why systems work at the level below the visible procedure, which makes you capable of improving the systems you maintain rather than simply operating them.

**Typical careers:** Financial Accountant, Actuary, Compliance Officer, Database Administrator, Quality Systems Manager, Tax Specialist, Financial Modeller, Regulatory Affairs Specialist

**Superpower:** Constructing systems of accuracy — financial, technical, or procedural — that hold up under audit, stress testing, and adversarial scrutiny.

**Growth edge:** The precision orientation can create discomfort with ambiguity that is sometimes unavoidable. In early-stage or rapidly changing environments, "good enough now" is often the right answer.

**Work environment:** Regulated industries, financial institutions, or quality-critical operations where the cost of errors is asymmetric and accuracy is the primary deliverable.

---

#### 26. The Operations Commander

**RIASEC dominant:** C (primary), E (secondary)  
**Big Five signature:** High Conscientiousness, High Extraversion  
**Tagline:** You run things at scale, and you do not lose track of any of it.

You have an unusual combination of organisational precision and the interpersonal authority to direct others in executing complex operational plans. You do not merely manage processes — you own outcomes. The operational environments you thrive in are the ones that would visibly degrade without your coordination: multiple dependencies, external commitments, time-sensitive deliverables, and a team that needs someone willing to make the call when the situation is ambiguous.

**Typical careers:** Chief Operating Officer, Logistics Director, Hospital Administrator, Military Operations Officer, Supply Chain Director, City Manager, Airline Operations Director, Production Director

**Superpower:** Running high-complexity operational environments at peak efficiency across time zones, dependencies, and unexpected disruptions.

**Growth edge:** The emphasis on operational control can create inflexibility in environments that require adaptive leadership rather than execution precision.

**Work environment:** Large, operationally complex organisations where multiple functions must be coordinated simultaneously and performance is measured by whether the service runs.

---

#### 27. The Reliable Guardian

**RIASEC dominant:** C (primary), S (secondary)  
**Big Five signature:** High Conscientiousness, High Agreeableness  
**Tagline:** You are the person others build their plans around.

Your professional reputation rests on a combination of attributes that organisations chronically undervalue until they are absent: absolute reliability, procedural integrity, and a genuine orientation toward the people the organisation exists to serve. You do not produce the most spectacular results in any given quarter, but the foundation you maintain makes spectacular results possible for others. The trust your colleagues place in you is rational — because you have earned it consistently over time rather than in a single dramatic moment.

**Typical careers:** School Administrator, Healthcare Coordinator, Administrative Manager, Customer Service Director, Records Manager, Benefits Administrator, Compliance Manager, Office Manager

**Superpower:** Creating the reliable infrastructure of trust — procedural, relational, and institutional — that allows other people to take productive risks.

**Growth edge:** The orientation toward reliability and service can leave you underrepresented in decisions about direction and strategy, which means your institutional knowledge goes untapped.

**Work environment:** Service organisations, educational institutions, or healthcare settings where consistency of care over time is the core professional obligation.

---

#### 28. The Process Innovator

**RIASEC dominant:** C (primary), A (secondary)  
**Big Five signature:** High Conscientiousness, High Openness  
**Tagline:** You make things work better without breaking what already works.

You occupy the rare productive space between the person who defends existing processes and the person who wants to redesign everything from scratch. You start from a genuine understanding of why the current process exists — what constraints it was designed to accommodate, what failure modes it was built to prevent — and then find the modifications that improve performance without introducing new fragility. This is harder than either pure maintenance or pure redesign, and organisations that have found someone who does it well tend to keep them.

**Typical careers:** Business Analyst, Process Engineer, Digital Transformation Lead, Lean/Six Sigma Consultant, Operations Analyst, Product Operations Manager, IT Project Manager, Continuous Improvement Manager

**Superpower:** Redesigning processes with the precision of an engineer and the creativity of a designer, while respecting institutional constraints that pure innovators ignore.

**Growth edge:** The balanced orientation can make it difficult to advocate for the level of change that is sometimes genuinely required. Some systems need replacement, not iteration.

**Work environment:** Established organisations undergoing operational or digital transformation, where the challenge is improvement without discontinuity.

---

#### 29. The Analytical Strategist

**RIASEC dominant:** C (primary), I (secondary), E (tertiary)  
**Big Five signature:** High Conscientiousness, High Extraversion  
**Tagline:** You see the data, form the conclusion, and then make it happen.

You are the rare combination of analytical depth, strategic clarity, and the interpersonal assertiveness to drive decisions through organisations that would prefer not to make them. Your tricode (C+I+E) means you can operate credibly across the spreadsheet, the whiteboard, and the boardroom — and you have learned that most strategic failures are not failures of analysis but failures of implementation, which is why you stay close to both.

**Typical careers:** Strategy Consultant, Chief Strategy Officer, Finance Director, Business Development Lead, Corporate Strategy Analyst, Investment Analyst, Competitive Intelligence Director, M&A Analyst

**Superpower:** Connecting a rigorous quantitative analysis to an actionable strategic narrative that executives can commit to and operators can execute against.

**Growth edge:** The span of competence across analysis, strategy, and execution can produce a leadership style that is difficult to delegate to — because you believe (often correctly) that you can do it better yourself.

**Work environment:** Strategy functions, professional services firms, or corporate headquarters where the output is a decision rather than a deliverable.

---

#### 30. The Detail-Driven Creator

**RIASEC dominant:** C (primary), A (secondary)  
**Big Five signature:** High Conscientiousness, High Openness  
**Tagline:** Your work is imaginative at the concept level and flawless at the execution level.

You are one of the most commercially productive creative professionals in any field you enter — because you combine genuine creative vision with the technical discipline to execute it to a high standard, on time, without the organisational chaos that follows many creative people through their careers. Clients and employers learn quickly that commissioning you is not a gamble. The brief will be interpreted with insight, the delivery will be exact, and the work will be what you said it would be.

**Typical careers:** Technical Writer, Graphic Designer, Copy Editor, Content Strategist, UX Writer, Brand Designer, Publications Manager, Creative Project Manager, Instructional Designer

**Superpower:** Producing creative work at a level of technical finish that most creative professionals achieve only when the deadline pressure is removed.

**Growth edge:** The precision orientation can generate anxiety about creative work that is, by nature, unresolvable before release. At some point, the detail work has to stop and the work has to ship.

**Work environment:** Professional creative environments — agencies, publishing, in-house brand teams — where the quality bar is non-negotiable and the schedule is real.

---

## Mapping Algorithm

The TypeScript implementation below lives at `backend/assessment/archetype-engine.ts`. It is designed to slot cleanly into the existing assessment pipeline: the same `SubmitAssessmentParams` flow that calls `getTopCareerMatches` can pipe RIASEC and Big Five scores into `determineArchetype` before writing `personality_type` to the database.

```typescript
// backend/assessment/archetype-engine.ts

/**
 * PathWise Archetype Engine
 *
 * Determines a user's career archetype from RIASEC interest scores
 * and Big Five personality trait scores using a two-stage weighted
 * distance algorithm.
 *
 * Stage 1: Filter to the candidate pool whose primary RIASEC code
 *          matches the user's dominant interest code.
 * Stage 2: Rank candidates by weighted Euclidean distance across
 *          Big Five dimensions, with RIASEC secondary code as a
 *          tiebreaker boost.
 *
 * This replaces the current `workStyle-experienceLevel` string
 * stored in assessments.personality_type.
 */

export interface RIASECScores {
  R: number; // Realistic       — 0 to 100
  I: number; // Investigative   — 0 to 100
  A: number; // Artistic        — 0 to 100
  S: number; // Social          — 0 to 100
  E: number; // Enterprising    — 0 to 100
  C: number; // Conventional    — 0 to 100
}

export interface BigFiveScores {
  openness:             number; // 0 to 100
  conscientiousness:    number; // 0 to 100
  extraversion:         number; // 0 to 100
  agreeableness:        number; // 0 to 100
  emotionalStability:   number; // 0 to 100 — inverse of Neuroticism
}

export interface ArchetypeDefinition {
  id: string;
  name: string;
  family: "Builders" | "Thinkers" | "Creators" | "Connectors" | "Organizers";
  riasecPrimary: keyof RIASECScores;
  riasecSecondary: keyof RIASECScores;
  riasecTertiary?: keyof RIASECScores;
  // Ideal Big Five profile — the archetype's centroid in trait space.
  // Neutral dimensions (no strong directional signal) are set to 50.
  bigFiveCentroid: BigFiveScores;
  // Dimensional weights for distance calculation.
  // Higher weight = that dimension contributes more to matching.
  // Dimensions that are defining characteristics of this archetype
  // receive a weight of 2.0; neutral dimensions receive 0.5.
  bigFiveWeights: BigFiveScores;
  tagline: string;
}

// ─── Archetype Registry ────────────────────────────────────────────────────

export const ARCHETYPES: ArchetypeDefinition[] = [

  // ── The Builders ──────────────────────────────────────────────────────────

  {
    id: "pragmatic_builder",
    name: "The Pragmatic Builder",
    family: "Builders",
    riasecPrimary: "R",
    riasecSecondary: "I",
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
    tagline: "You solve real problems with real solutions — no theory required.",
  },

  {
    id: "creative_maker",
    name: "The Creative Maker",
    family: "Builders",
    riasecPrimary: "R",
    riasecSecondary: "A",
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
    tagline: "You build things that are functional and, somehow, beautiful.",
  },

  {
    id: "steady_craftsperson",
    name: "The Steady Craftsperson",
    family: "Builders",
    riasecPrimary: "R",
    riasecSecondary: "C",
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
    tagline: "Excellence built incrementally, with no drama and no shortcuts.",
  },

  {
    id: "field_engineer",
    name: "The Field Engineer",
    family: "Builders",
    riasecPrimary: "R",
    riasecSecondary: "I",
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
    tagline: "You fix what others theorised into existence.",
  },

  {
    id: "green_pioneer",
    name: "The Green Pioneer",
    family: "Builders",
    riasecPrimary: "R",
    riasecSecondary: "I",
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
    tagline: "You build the infrastructure for a world that does not exist yet.",
  },

  {
    id: "hands_on_leader",
    name: "The Hands-On Leader",
    family: "Builders",
    riasecPrimary: "R",
    riasecSecondary: "E",
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
    tagline: "You lead from the front, tools in hand.",
  },

  // ── The Thinkers ──────────────────────────────────────────────────────────

  {
    id: "analytical_architect",
    name: "The Analytical Architect",
    family: "Thinkers",
    riasecPrimary: "I",
    riasecSecondary: "R",
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
    tagline: "You design systems that hold together under conditions their creators never anticipated.",
  },

  {
    id: "research_explorer",
    name: "The Research Explorer",
    family: "Thinkers",
    riasecPrimary: "I",
    riasecSecondary: "A",
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
    tagline: "The most interesting question is the one nobody has asked yet.",
  },

  {
    id: "data_storyteller",
    name: "The Data Storyteller",
    family: "Thinkers",
    riasecPrimary: "I",
    riasecSecondary: "S",
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
    tagline: "You make numbers mean something to the people who need to act on them.",
  },

  {
    id: "systems_thinker",
    name: "The Systems Thinker",
    family: "Thinkers",
    riasecPrimary: "I",
    riasecSecondary: "C",
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
    tagline: "You see the feedback loops that others mistake for isolated problems.",
  },

  {
    id: "scientific_visionary",
    name: "The Scientific Visionary",
    family: "Thinkers",
    riasecPrimary: "I",
    riasecSecondary: "A",
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
    tagline: "You are not interested in confirming what everyone already suspects.",
  },

  {
    id: "clinical_mind",
    name: "The Clinical Mind",
    family: "Thinkers",
    riasecPrimary: "I",
    riasecSecondary: "S",
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
    tagline: "You reach the right diagnosis because you do not let urgency contaminate your reasoning.",
  },

  // ── The Creators ──────────────────────────────────────────────────────────

  {
    id: "creative_catalyst",
    name: "The Creative Catalyst",
    family: "Creators",
    riasecPrimary: "A",
    riasecSecondary: "E",
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
    tagline: "You generate ideas fast enough that the room has to run to keep up.",
  },

  {
    id: "quiet_innovator",
    name: "The Quiet Innovator",
    family: "Creators",
    riasecPrimary: "A",
    riasecSecondary: "I",
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
    tagline: "Your best work happens in the hours before anyone else arrives.",
  },

  {
    id: "experience_designer",
    name: "The Experience Designer",
    family: "Creators",
    riasecPrimary: "A",
    riasecSecondary: "S",
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
    tagline: "You design the moment and then watch people live inside it.",
  },

  {
    id: "visual_storyteller",
    name: "The Visual Storyteller",
    family: "Creators",
    riasecPrimary: "A",
    riasecSecondary: "R",
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
    tagline: "You see the image before you see the words.",
  },

  {
    id: "cultural_curator",
    name: "The Cultural Curator",
    family: "Creators",
    riasecPrimary: "A",
    riasecSecondary: "S",
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
    tagline: "You know what matters and you know how to make other people care about it.",
  },

  {
    id: "boundary_breaker",
    name: "The Boundary Breaker",
    family: "Creators",
    riasecPrimary: "A",
    riasecSecondary: "E",
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
    tagline: "You do not ask permission to try the thing that has not been done before.",
  },

  // ── The Connectors ────────────────────────────────────────────────────────

  {
    id: "empathetic_guide",
    name: "The Empathetic Guide",
    family: "Connectors",
    riasecPrimary: "S",
    riasecSecondary: "A",
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
    tagline: "You meet people exactly where they are, and then move them forward.",
  },

  {
    id: "community_builder",
    name: "The Community Builder",
    family: "Connectors",
    riasecPrimary: "S",
    riasecSecondary: "E",
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
    tagline: "You turn a group of individuals into something that looks after itself.",
  },

  {
    id: "strategic_leader",
    name: "The Strategic Leader",
    family: "Connectors",
    riasecPrimary: "E",
    riasecSecondary: "I",
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
    tagline: "You set direction, and then you prove it was right.",
  },

  {
    id: "visionary_entrepreneur",
    name: "The Visionary Entrepreneur",
    family: "Connectors",
    riasecPrimary: "E",
    riasecSecondary: "A",
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
    tagline: "You build what the market does not yet know it wants.",
  },

  {
    id: "people_catalyst",
    name: "The People Catalyst",
    family: "Connectors",
    riasecPrimary: "E",
    riasecSecondary: "S",
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
    tagline: "You make everyone in the room more effective than they would be without you.",
  },

  {
    id: "diplomatic_navigator",
    name: "The Diplomatic Navigator",
    family: "Connectors",
    riasecPrimary: "S",
    riasecSecondary: "C",
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
    tagline: "You find the path that respects every constraint and still gets somewhere.",
  },

  // ── The Organizers ────────────────────────────────────────────────────────

  {
    id: "precision_architect",
    name: "The Precision Architect",
    family: "Organizers",
    riasecPrimary: "C",
    riasecSecondary: "I",
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
    tagline: "You build the systems that carry the weight of everything else.",
  },

  {
    id: "operations_commander",
    name: "The Operations Commander",
    family: "Organizers",
    riasecPrimary: "C",
    riasecSecondary: "E",
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
    tagline: "You run things at scale, and you do not lose track of any of it.",
  },

  {
    id: "reliable_guardian",
    name: "The Reliable Guardian",
    family: "Organizers",
    riasecPrimary: "C",
    riasecSecondary: "S",
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
    tagline: "You are the person others build their plans around.",
  },

  {
    id: "process_innovator",
    name: "The Process Innovator",
    family: "Organizers",
    riasecPrimary: "C",
    riasecSecondary: "A",
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
    tagline: "You make things work better without breaking what already works.",
  },

  {
    id: "analytical_strategist",
    name: "The Analytical Strategist",
    family: "Organizers",
    riasecPrimary: "C",
    riasecSecondary: "I",
    riasecTertiary: "E",
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
    tagline: "You see the data, form the conclusion, and then make it happen.",
  },

  {
    id: "detail_driven_creator",
    name: "The Detail-Driven Creator",
    family: "Organizers",
    riasecPrimary: "C",
    riasecSecondary: "A",
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
    tagline: "Your work is imaginative at the concept level and flawless at the execution level.",
  },
];

// ─── Archetype Matching Engine ────────────────────────────────────────────────

/**
 * Returns the sorted RIASEC codes from highest to lowest score.
 */
function rankRIASEC(scores: RIASECScores): Array<keyof RIASECScores> {
  return (Object.keys(scores) as Array<keyof RIASECScores>).sort(
    (a, b) => scores[b] - scores[a]
  );
}

/**
 * Computes weighted Euclidean distance between a user's Big Five scores
 * and an archetype's centroid, scaled by the archetype's dimensional weights.
 *
 * A lower distance means a closer match.
 *
 * Formula: sqrt( sum_i( weight_i * (user_i - centroid_i)^2 ) )
 */
function weightedBigFiveDistance(
  user: BigFiveScores,
  centroid: BigFiveScores,
  weights: BigFiveScores
): number {
  const dimensions: Array<keyof BigFiveScores> = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "emotionalStability",
  ];

  const sum = dimensions.reduce((acc, dim) => {
    const diff = user[dim] - centroid[dim];
    return acc + weights[dim] * diff * diff;
  }, 0);

  return Math.sqrt(sum);
}

/**
 * Applies a RIASEC secondary code bonus to reduce the distance for archetypes
 * whose secondary code matches the user's second-ranked RIASEC interest.
 *
 * A 10% distance reduction rewards the correct secondary code without
 * overriding a stronger Big Five match.
 */
const SECONDARY_CODE_BONUS = 0.10;

/**
 * Determines the best-fit career archetype for a user given their
 * RIASEC interest scores and Big Five personality trait scores.
 *
 * The algorithm runs in two stages:
 *
 * Stage 1 — Primary filter:
 *   Build a candidate pool of all archetypes whose `riasecPrimary` code
 *   matches the user's top-ranked RIASEC interest code. If this pool is
 *   empty (edge case: no archetypes defined for a primary code), fall back
 *   to the full archetype set.
 *
 * Stage 2 — Big Five ranking:
 *   For each candidate, compute the weighted Euclidean distance between
 *   the user's Big Five scores and the archetype's centroid. Apply a
 *   secondary RIASEC code bonus to reduce the distance for candidates
 *   whose secondary code matches the user's second-ranked interest.
 *   Return the archetype with the smallest adjusted distance.
 *
 * @param riasec  User's RIASEC interest scores (each 0–100)
 * @param bigFive User's Big Five personality scores (each 0–100)
 * @returns       The best-matching ArchetypeDefinition
 */
export function determineArchetype(
  riasec: RIASECScores,
  bigFive: BigFiveScores
): ArchetypeDefinition {
  const rankedRIASEC = rankRIASEC(riasec);
  const dominantCode = rankedRIASEC[0];
  const secondaryCode = rankedRIASEC[1];

  // Stage 1: Filter to archetypes matching the dominant RIASEC code
  let candidates = ARCHETYPES.filter(
    (a) => a.riasecPrimary === dominantCode
  );

  // Fallback: if no candidates found (should not occur with full registry),
  // open to all archetypes — ensures the function always returns a result
  if (candidates.length === 0) {
    candidates = ARCHETYPES;
  }

  // Stage 2: Rank by weighted Big Five distance, with secondary code bonus
  let bestArchetype: ArchetypeDefinition = candidates[0];
  let bestDistance = Infinity;

  for (const archetype of candidates) {
    let distance = weightedBigFiveDistance(
      bigFive,
      archetype.bigFiveCentroid,
      archetype.bigFiveWeights
    );

    // Apply secondary code bonus: reduce distance if secondary RIASEC matches
    if (archetype.riasecSecondary === secondaryCode) {
      distance *= (1 - SECONDARY_CODE_BONUS);
    }

    // Tertiary code provides a smaller additional bonus
    if (archetype.riasecTertiary && archetype.riasecTertiary === rankedRIASEC[2]) {
      distance *= 0.97;
    }

    if (distance < bestDistance) {
      bestDistance = distance;
      bestArchetype = archetype;
    }
  }

  return bestArchetype;
}

/**
 * Returns the top N closest archetypes in rank order.
 * Useful for displaying secondary archetype suggestions in the UI
 * ("You also have strong characteristics of...").
 *
 * Uses the same two-stage algorithm but returns the full ranked list
 * across all 30 archetypes, not just the dominant-code candidates.
 */
export function rankArchetypes(
  riasec: RIASECScores,
  bigFive: BigFiveScores,
  topN: number = 3
): ArchetypeDefinition[] {
  const rankedRIASEC = rankRIASEC(riasec);
  const secondaryCode = rankedRIASEC[1];

  const ranked = ARCHETYPES.map((archetype) => {
    let distance = weightedBigFiveDistance(
      bigFive,
      archetype.bigFiveCentroid,
      archetype.bigFiveWeights
    );

    // RIASEC primary code matching: weight primary match most heavily
    if (archetype.riasecPrimary !== rankedRIASEC[0]) {
      distance *= 1.40; // 40% penalty for wrong family
    }

    if (archetype.riasecSecondary === secondaryCode) {
      distance *= (1 - SECONDARY_CODE_BONUS);
    }

    return { archetype, distance };
  });

  ranked.sort((a, b) => a.distance - b.distance);

  return ranked.slice(0, topN).map((r) => r.archetype);
}

/**
 * Convenience function that returns the archetype's display name and ID only.
 * Useful for storing in the assessments table as a lightweight reference.
 */
export function getArchetypeLabel(
  riasec: RIASECScores,
  bigFive: BigFiveScores
): { id: string; name: string; family: string } {
  const archetype = determineArchetype(riasec, bigFive);
  return {
    id: archetype.id,
    name: archetype.name,
    family: archetype.family,
  };
}
```

---

## Integration Notes

### Storing the Archetype

The `personality_type` column in the `assessments` table currently stores a simple `workStyle-experienceLevel` string. The intended migration is to store the archetype `id` instead (e.g., `"analytical_architect"`), which is stable, human-readable, and maps directly to the full definition in `ARCHETYPES`. The `name` and `family` fields can be derived from the registry at query time and do not need to be stored separately.

The migration path is non-breaking: the new value format is a plain string with underscores, which is syntactically distinct from the old `workStyle-experienceLevel` format. Existing rows can be identified and re-scored if historical RIASEC and Big Five inputs were retained in `raw_answers`.

### Deriving RIASEC and Big Five from Existing Assessment Inputs

The current `SubmitAssessmentParams` schema does not directly capture RIASEC or Big Five scores — it captures `workStyle`, `interests`, `strengths`, and `values` as free-form strings and arrays. A scoring layer is required to map these inputs to the 0–100 scale expected by `determineArchetype`. That mapping belongs in a separate `assessment-scoring.ts` module and is outside the scope of this document.

### Archetype in Career Matching

Once `determineArchetype` is integrated into `getTopCareerMatches`, the archetype can serve as an additional weighting signal. Careers listed under "Typical careers" in each archetype definition can receive a small score boost when the user's archetype matches, improving match quality without replacing the existing multi-dimensional scoring logic in `career-brain.ts`.

---

## Design Decisions

**Why RIASEC primary code as the hard filter in Stage 1.** RIASEC interest codes are the strongest single predictor of vocational choice in the literature — stronger than personality traits alone. Using the dominant code as a hard family assignment before applying Big Five distance ensures that the algorithm does not assign a fundamentally wrong family type due to a locally optimal Big Five match across families.

**Why weighted rather than unweighted Euclidean distance.** The Big Five dimensions are not equally diagnostic for every archetype. For the Steady Craftsperson, Conscientiousness and Emotional Stability are the defining traits; Extraversion is essentially irrelevant. Treating all dimensions equally would dilute the signal from the traits that actually define the archetype. The weight matrix in each `ArchetypeDefinition` makes this domain knowledge explicit and adjustable.

**Why a 10% secondary code bonus rather than a hard secondary filter.** Some archetypes share primary and secondary codes but differ primarily on Big Five traits (for example, Pragmatic Builder and Field Engineer are both R+I, differentiated by Agreeableness). A hard secondary filter would reduce these to a coin flip decided by whichever secondary code appeared first. A proportional bonus preserves the Big Five distance calculation as the primary differentiator while still rewarding correct secondary alignment.

**Why 30 archetypes in five families of six.** This cardinality is large enough to produce genuinely differentiated identities across the realistic range of user profiles, and small enough to be comprehensible to a product team building UI around the results. Fewer than 20 archetypes would produce low-fidelity matches at the tails of each family distribution. More than 40 would create distinction without a difference for most users and complicate the UI design problem significantly.
