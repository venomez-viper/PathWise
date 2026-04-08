// ─── Narrative Profile Generator ─────────────────────────────────────────────
// Assembles a 500–800 word second-person narrative from modular paragraph
// templates, selected by a deterministic algorithm keyed to Big Five scores,
// RIASEC dominance, environment preferences, and trajectory intent.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
}

export interface RIASECScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface EnvironmentPrefs {
  remote: boolean;
  teamSize: string;
  pace: string;
}

export type TrajectoryType =
  | "specialist"
  | "generalist"
  | "manager"
  | "entrepreneur"
  | "portfolio"
  | "explorer";

export interface NarrativeProfile {
  headline: string;
  tagline: string;
  opening: string;
  workStyle: string;
  strengths: string;
  growthEdge: string;
  idealEnvironment: string;
  careerDirection: string;
  fullNarrative: string;
  shareQuote: string;
}

// ─── Template Paragraphs ────────────────────────────────────────────────────

// 20 Opening paragraphs: 2 per Big Five trait (high/low), 2 variants each

const OPENING_PARAGRAPHS: Record<string, string> = {
  // ── Openness ──
  openness_high_a:
    "You approach the world as though everything is still to be discovered. Ideas that most people find abstract or half-formed are the ones you find most compelling, because you understand that ambiguity is not a problem to be solved — it is an invitation to think more carefully. You are the person who reads about a topic that has nothing to do with your job and then, somehow, finds a way to make it relevant to everything you are working on. Your ability to hold contradiction and complexity without needing to resolve it prematurely is rarer than you think, and it gives you access to creative territory that more conventional thinkers cannot reach.",

  openness_high_b:
    "Curiosity is not a hobby for you — it is a cognitive default. You move through your career the way a good researcher moves through a library: pulling threads, following tangents, discovering connections that only become visible once you stop looking for the obvious path. You are drawn to roles that change shape, problems that have not been solved yet, and teams that are still figuring out what they are building. The uncertainty that makes others slow down tends to accelerate you, because new information is not a threat to your sense of direction — it is the raw material you work with best.",

  openness_low_a:
    "You know what works and you do not abandon it without a good reason. While some people chase novelty for its own sake, you have learned that consistency, precision, and proven technique are what actually produce results at scale. Your thinking is concrete and grounded — you prefer a clear brief to an open-ended mandate, and you deliver more reliably when the problem is well-defined than when everything is still up for debate. In an industry that frequently confuses experimentation with progress, your instinct to validate before committing is an asset that compounds over time.",

  openness_low_b:
    "You are a practitioner, not a theorist. You trust what you can see, test, and build — and you carry a healthy skepticism toward frameworks that sound compelling in a presentation but fall apart on contact with real constraints. This groundedness is a professional superpower in environments that need someone to translate big ideas into executable plans. Where others get lost in possibility, you stay focused on what is achievable now, what needs to come next, and how to measure whether it worked. That clarity of focus is increasingly valuable in a world that has more ideas than execution.",

  // ── Conscientiousness ──
  conscientiousness_high_a:
    "You finish what you start, and you do it well. This sounds simple, but it describes a discipline that most people talk about and few actually practice. You set a standard for yourself and then hold yourself to it without needing external pressure, which means the quality of your work does not fluctuate depending on who is watching. You are the kind of professional colleagues come to rely on not because you volunteer for everything, but because when you say something will be done, it gets done — on time, at the level of quality you agreed to, without the last-minute drama that wastes everyone's energy.",

  conscientiousness_high_b:
    "Structure is not a constraint for you — it is a tool. You have an instinct for breaking complex goals into ordered steps, and a genuine satisfaction in checking things off as they move from intention to reality. Your career tends to advance steadily rather than in bursts, because you build trust through demonstrated reliability rather than through visibility or self-promotion. The compounding effect of consistent follow-through over months and years is an advantage that does not show up on a single performance review, but it shows up everywhere else: in your reputation, in the quality of your work, and in the number of people who want to work alongside you again.",

  conscientiousness_low_a:
    "You thrive in the white space between rules. Where rigid processes make others feel safe, you find them constraining — you do your best thinking when you can respond to what is actually happening rather than what was planned three sprints ago. Your value to a team is not found on a Gantt chart; it is found in the moments when something unexpected happens and you are the one who figures out how to adapt without losing momentum. The flexibility you bring to any environment is a genuine asset, particularly in early-stage or rapidly shifting contexts where the plan is always provisional anyway.",

  conscientiousness_low_b:
    "You see the whole before you worry about the parts. This is a creative and strategic strength, even if it sometimes puts you at odds with colleagues who need detailed timelines and structured updates before they can move forward. You are most effective when you have a clear destination, a collaborator who handles the operational detail, and enough autonomy to find your own path to the finish line. The careers that suit you best are the ones that reward original thinking and tolerance for ambiguity over procedural compliance — and there are many more of them than most people realize.",

  // ── Extraversion ──
  extraversion_high_a:
    "You gain energy from the room, not from time away from it. Other people are not a drain on your bandwidth — they are the medium through which you do your best thinking, because your ideas sharpen when you put them in front of someone who will push back on them. You are naturally expressive, and your ability to communicate with enthusiasm and clarity tends to pull others into alignment faster than a memo or a slide deck ever could. In collaborative environments, you are often the person who raises the energy in a room and makes it easier for everyone else to contribute — a function that is harder to measure than output, but rarely harder to notice.",

  extraversion_high_b:
    "You are action-oriented in the most literal sense: you figure things out by doing them, talking through them, and testing them with other people in real time. Waiting for perfect information before moving is not your natural mode, and in fast-moving environments that turns out to be an advantage. You are effective in client-facing roles, leadership positions, and any context where communication velocity matters as much as technical depth. Your social intelligence — the ability to read a room, adjust your register, and make people feel heard — is a form of professional capital that tends to appreciate over the course of a career.",

  extraversion_low_a:
    "You do your best thinking alone, and you bring that finished thinking to the team. This is not the same as being withdrawn — it means you arrive at conversations better prepared than almost anyone in the room, because you have already worked through the problem before anyone else has opened the agenda document. You are naturally drawn to depth over breadth, and your preference for small, trusted working groups over large social networks is a deliberate trade-off, not a limitation. The careers that reward deep expertise, independent contribution, and sustained concentration play directly to the way you work best.",

  extraversion_low_b:
    "Your inner life is rich, and that is a professional asset more than most job descriptions acknowledge. You notice things that faster-moving colleagues miss, because you are not performing your thinking out loud — you are doing the actual work of it. You recharge through solitude, which means you tend to protect your focus more deliberately than extroverts do, and that protection pays off in the depth and quality of what you produce. The environments that suit you best give you ownership over your schedule, minimal performative collaboration, and work that rewards precision over presence.",

  // ── Agreeableness ──
  agreeableness_high_a:
    "People trust you quickly, and they are right to. You have a genuine interest in the people around you — not as resources or obstacles, but as collaborators with their own context, pressures, and contributions to make. This empathy is not a soft trait; it is a strategic one. You tend to resolve interpersonal friction before it metastasizes, create conditions where teams communicate honestly, and build the kind of psychological safety that makes good work possible. The phrase \"hard to work with\" is not in your professional vocabulary, and the list of people who would work alongside you again is long.",

  agreeableness_high_b:
    "You are the kind of colleague who makes organizations function better than their org charts suggest they should. You build bridges across team boundaries, carry context from one group to the next, and create the informal connective tissue that formal process cannot replace. Your instinct is always toward cooperation over confrontation, and you are unusually skilled at finding the outcome that makes both sides of a disagreement feel heard. In leadership, this shows up as the ability to build genuine followership rather than positional compliance — a quality that becomes increasingly rare and increasingly valuable the higher you go.",

  agreeableness_low_a:
    "You say what you think, and you do not need the room to agree with you before you say it. This directness is uncomfortable in cultures that reward social lubrication over intellectual honesty, but it is invaluable in environments that need clear thinking under pressure. You are not indifferent to other people — you respect them enough to tell them the truth rather than the comfortable version of it. Your capacity to hold an unpopular position without social anxiety is the kind of professional courage that most decision-making environments need more of, and most people are not trained to provide.",

  agreeableness_low_b:
    "You are independently-minded by default. You form your own view of a situation based on evidence and reasoning, and you do not adjust that view to match the room. This makes you particularly valuable in roles that require objective analysis, competitive assessment, or honest evaluation of ideas that have accumulated political momentum without commensurate merit. You are comfortable with conflict when the conflict is substantive, and your ability to separate the argument from the person makes you a more productive intellectual sparring partner than people who either avoid disagreement or make it personal.",

  // ── Emotional Stability ──
  emotionalStability_high_a:
    "Pressure reveals character, and yours holds up well under examination. When the stakes are high and the outcome is uncertain, you do not oscillate between panic and overconfidence — you stay in the narrow band of calm, analytical attention where good decisions actually get made. Your colleagues lean on this steadiness more than they may say aloud, because in a crisis the most valuable thing in the room is often not the most technically capable person but the most grounded one. Your composure is not indifference to outcomes — it is evidence that you have thought carefully about them in advance and know what you will do regardless.",

  emotionalStability_high_b:
    "You have a long time horizon, emotionally and professionally. Short-term setbacks do not recalibrate your sense of direction, and criticism — even when it is unfair — does not destabilize your confidence in your own judgment. This resilience is a durable competitive advantage: over a long career, the professionals who compound their growth most effectively are usually not the ones with the highest peaks, but the ones with the shallowest valleys. Your ability to return to baseline quickly after adversity means more of your energy goes toward building, and less goes toward recovery.",

  emotionalStability_low_a:
    "You feel things sharply, and that sensitivity is not a flaw in your wiring — it is a signal processing advantage. You pick up on tension in a room before it surfaces in language, you notice when a project is going sideways before the metrics confirm it, and you carry a genuine concern for outcomes that most people who describe themselves as \"passionate\" do not actually demonstrate. The challenge is not your depth of feeling but the management of its cost: learning to distinguish between useful signal and ambient noise, and building working rhythms that protect your energy rather than exhaust it. When you get that balance right, your emotional intelligence becomes one of your most irreplaceable professional attributes.",

  emotionalStability_low_b:
    "You bring intensity to your work in a way that makes the output matter to you on a personal level — and that shows. There is a difference between someone who produces work and someone who cares about the work they produce, and your colleagues can feel that difference. Your emotional responsiveness makes you a more honest collaborator, a more attentive mentor, and a more creative thinker than your more impassive peers, because you are genuinely invested in the outcome rather than just executing against a brief. The growth edge here is learning to hold that investment without letting it become the source of unnecessary pressure — because the same sensitivity that makes you great at your best can make difficult moments harder than they need to be.",
};

// 6 Work Style paragraphs: 1 per RIASEC type

const RIASEC_PARAGRAPHS: Record<string, string> = {
  realistic:
    "Your best work happens when there is something real to show at the end of it. You are not interested in frameworks that exist only as frameworks, or strategies that never make contact with a material outcome. You gravitate toward problems where the solution has a physical, functional, or measurable form — a system that works, a product that ships, a structure that stands. In a professional landscape increasingly dominated by abstraction, your insistence on tangibility is a corrective force that teams and organizations genuinely need. You are at your most effective when the brief is clear, the constraints are real, and the success criteria are something you can verify with your own eyes.",

  investigative:
    "You treat every problem as a research question, and you do not stop until you understand the mechanism. Surface-level explanations frustrate you — you want to know why the pattern exists, what is driving the variable, and whether the conclusion holds when you stress-test it with contradictory evidence. This analytical orientation makes you a natural fit for roles that require original thinking under uncertainty, because you are comfortable operating in the space between what is known and what needs to be figured out. You build intellectual models that other people borrow for years after a conversation with you, and your value to any team compounds in proportion to the difficulty of the problems you are pointed at.",

  artistic:
    "You see possibilities in the spaces between what currently exists and what could. Your work is not about executing a defined brief — it is about defining what the brief should have been in the first place. You bring an original perspective to whatever you are building, an instinctive resistance to the obvious solution, and a genuine belief that how something looks, sounds, or feels is not decorative but functional. In organizations that understand this, your contribution is the difference between a product people use and a product people remember. In organizations that do not, your work will always feel slightly undervalued — which is important career information worth acting on.",

  social:
    "You are in this work because it connects to other people's lives in a meaningful way. The motivation that drives you is not technical complexity or financial optimization — it is the knowledge that what you build, teach, or support changes the way someone experiences their day or their career. You have a high tolerance for the interpersonal friction that comes with helping people through difficult changes, and a genuine patience for the time it takes for growth to become visible. Roles that put you face-to-face with the impact of your work energize you in ways that remote analytical contributions simply do not.",

  enterprising:
    "You think about leverage before you think about tasks — how do you get more done with the same effort, and how does the thing you are building now create future options? You are drawn to the front end of problems: the pitch, the vision, the recruitment of other people to a shared goal. Your energy is forward-facing and your natural idiom is persuasion rather than analysis. You are rarely the person who needs to be convinced that something is worth attempting; you are more often the person trying to convince everyone else. The careers that suit you best give you a territory to define and defend, and the autonomy to decide how you are going to win it.",

  conventional:
    "You take systematic thinking seriously as a craft, not just as a means to an end. Where others see process as bureaucracy, you see it as the architecture that makes everything else reliable. Your professional instinct is to find the most efficient path between current state and desired state, to eliminate the friction points that other people have learned to tolerate, and to build systems that continue delivering value long after the initial effort has been forgotten. In organizations under pressure, the people who understand how everything actually works — not just how it is supposed to work — are the ones who keep the operation running when everything else is in flux.",
};

// 10 Strengths paragraphs: trait combinations

const STRENGTHS_PARAGRAPHS: Record<string, string> = {
  analytical_creative:
    "You combine rigorous thinking with creative leaps in a way that is genuinely unusual. Most people can do one or the other — hold a framework tightly, or break outside it — but few can do both within the same problem, which is what you do. You bring a creative instinct to problems that most analysts would solve by formula, and an analytical discipline to creative work that most creatives would execute on instinct alone. The result is output that is both original and defensible, which is a rare thing to be able to offer in most professional environments. Teams that understand what they have in you will structure roles to make use of both dimensions.",

  empathetic_organized:
    "Your rare combination of deep empathy and structural thinking makes you the kind of professional that organizations build systems around. You understand what people need, and you also understand how to turn that understanding into something repeatable and scalable. This is the combination behind every good manager, every excellent program director, and every operator who somehow makes the complex feel simple. You do not just care about outcomes — you care about building the conditions that produce good outcomes consistently, and that concern for the process is what separates the people who get results once from the people who get results reliably.",

  visionary_practical:
    "You dream big, but you build small — and that is exactly why your ideas actually happen. The graveyard of ambitious plans is full of visionaries who could not translate direction into execution, and executors who never thought big enough to make the execution worth doing. You occupy both positions, which means you can hold the long horizon in mind while also deciding what needs to happen in the next two weeks. This is the combination that makes founders, product leaders, and ambitious operators effective: the ability to stay oriented toward a future state while dealing honestly with present constraints.",

  independent_collaborative:
    "You bring your best work to teams because you have already thought deeply alone. This sequencing — private preparation followed by public contribution — is not antisocial; it is a form of intellectual respect for the people you are working with. You arrive with a formed perspective, which gives collaborative conversations real material to work with rather than the circling ambiguity that happens when everyone is figuring it out in real time. Your independence is not distance from the team — it is the thing that makes your contribution to the team actually worth having.",

  resilient_ambitious:
    "Setbacks do not stop you — they recalibrate you. You carry a high tolerance for the friction that comes with pursuing difficult goals: the failed attempts, the rejected proposals, the projects that ran for months and then stalled. Where other people update their ambition downward after enough of these experiences, you tend to update your approach instead. This resilience is not stubbornness; it is pattern recognition. You learn from the evidence faster than most, which means each attempt starts from a higher baseline than the one before it. Over a long career, this compounds into the kind of momentum that looks, from the outside, like exceptional talent.",

  detail_bigpicture:
    "You see the forest and the trees with unusual clarity, and you can switch between those two resolutions without losing your orientation in either one. This cognitive range is genuinely rare — most people have a dominant register and struggle to operate outside it. You can zoom out to assess whether a strategy is sound and zoom in to catch the implementation error that would undermine it, often in the same meeting. This makes you extraordinarily useful in roles that sit at the intersection of strategy and execution, where the failure mode is usually one without the other.",

  creative_systematic:
    "Your creativity is not chaotic — it is structured. You do not generate ideas indiscriminately and hope one of them survives contact with reality. You build creative processes: frameworks for generating options, criteria for evaluating them, and systematic methods for refining the ones worth pursuing. This disciplined approach to creative work makes you more productive than the purely intuitive creative, and more original than the purely procedural operator. The work you produce has an internal logic that rewards close examination, and a surface quality that earns attention before anyone looks closely enough to notice.",

  people_data:
    "You read spreadsheets and rooms with equal facility, which makes you one of the more complete professionals in any team you join. You can follow an argument through a dataset and also sense when the person presenting it is more confident than the data warrants. You understand that decisions are made by humans under social and political pressures, not by algorithms, and that navigating those pressures requires a different kind of intelligence than the one that built the model in the first place. This dual fluency — quantitative rigor and interpersonal calibration — is the combination that tends to define the most effective operators in data-adjacent roles.",

  patient_driven:
    "You understand that great things take time, and you never stop moving toward them anyway. This is not a contradiction — it is a mature operating philosophy that most ambitious people do not develop until much later in their careers, if they develop it at all. You can sustain effort across the long timelines that genuinely important work requires, without mistaking slow progress for no progress. This patience does not mean passivity: you are still pushing, still making decisions, still moving the work forward. You have simply learned that urgency and impatience are not the same thing, and that confusing the two is one of the most expensive mistakes a professional can make.",

  adaptable_principled:
    "You flex your approach without compromising your values, and that combination makes you someone who can be trusted in a wide range of situations. You are not rigid — you read what the context requires and adjust accordingly — but you carry a set of non-negotiable standards into every situation, and people learn quickly that there are lines you will not cross regardless of the incentive to do so. This principled adaptability is what distinguishes the professional who is flexible because they have good judgment from the one who is flexible because they have none. It is also the foundation of long-term reputational capital, which is the only kind that actually compounds.",
};

// 10 Growth Edge paragraphs: extreme traits

const GROWTH_EDGE_PARAGRAPHS: Record<string, string> = {
  autonomy:
    "The same independence that drives the quality of your work can, at certain moments, make collaboration harder than it needs to be. You have high standards for what \"good\" looks like, and when other people's contributions fall short of those standards, your instinct may be to do the work yourself rather than invest in bringing them up. This works in the short run. Over time, it creates bottlenecks in you, and it deprives the people around you of the development opportunity that struggling through hard problems actually provides. The growth edge here is learning to identify the moments when a slower, messier, shared process produces a better long-term outcome than a faster, cleaner, solitary one — and then choosing the former deliberately.",

  empathy:
    "You absorb the emotional states of the people around you, which makes you a perceptive and supportive colleague — and also means that other people's stress has a way of becoming your stress without anyone intending it. This is one of the costs of genuine empathy, and it is worth naming honestly. The development opportunity is not to care less, but to build clearer internal boundaries around which concerns are yours to carry and which belong to the person who brought them. High-empathy professionals who master this boundary tend to sustain their effectiveness over long careers; those who do not tend to burn out in roles that were actually well-suited to their strengths.",

  perfectionism:
    "You hold your work to a standard that most people never reach, and that commitment to quality is real and valuable. The risk is that the same standard that elevates your best work can delay work that is good enough from shipping at all. There is a meaningful difference between raising quality and indefinitely postponing completion, and in fast-moving environments that distinction has real consequences. The development opportunity here is building an explicit internal threshold for \"done\" that is separate from \"perfect\" — not because the difference doesn't matter, but because shipping something excellent tomorrow is usually more valuable than shipping something perfect next quarter.",

  risk_taking:
    "You are comfortable moving fast on incomplete information, and in the right environments that bias for action is a genuine asset. The watch-out is that your comfort with uncertainty can lead to underweighting the planning that prevents entirely avoidable failures. Not all risks are worth taking, and some of the most costly ones are structural — insufficient runway, unclear ownership, dependencies that were never mapped. The development opportunity is building the habit of a brief but deliberate pre-mortem before committing resources: asking what would have to go wrong for this to fail, and whether any of those things are preventable before you start.",

  introversion:
    "You protect your time and energy deliberately, which generally serves your work well. The area to watch is that the same preference for selective engagement can mean you stay outside the informal networks that carry information, opportunity, and sponsorship through most organizations. Mentors, advocates, and unexpected collaborators rarely appear through formal channels — they come from the conversations you almost did not have and the events you almost did not attend. The development opportunity is treating networking not as performance but as research: a low-stakes, intellectually honest way of finding out who is doing interesting work and what they need from someone with your specific skills.",

  agreeableness:
    "Your instinct for harmony and your discomfort with unresolved conflict are professional assets in most situations. The area to develop is the specific scenario where necessary conflict is being avoided — where a plan has a flaw everyone can see but no one will name, where a team member's behavior is affecting output and everyone is working around it rather than addressing it. Feedback is a form of professional care, and the most helpful thing you can do for someone is often the honest conversation you have been postponing. The growth edge here is building a clear framework for when harmony should yield to honesty, and then executing that framework reliably.",

  novelty_seeking:
    "You are most energized at the beginning of things — when the problem is still open, the approach is still being designed, and every day brings a genuinely new challenge. The risk is that this preference for the early stage can make the later stages of a project feel less engaging than they actually are, and can lead to moving on before the original idea has had time to deliver. The development opportunity is distinguishing between the feeling that something is finished (which often arrives early, when the interesting part is over) and the evidence that something is finished (which usually arrives later, when the work has been tested and the results are in).",

  structure_need:
    "You do excellent work inside a well-defined system, and you build those systems carefully where they do not yet exist. The development area is what happens when the system genuinely cannot be built in advance — when the problem is too novel, the constraints are still shifting, or the organization is moving faster than any process can accommodate. Pure ambiguity is uncomfortable for you by design, but some of the most valuable career opportunities live in exactly that space. The growth edge is building a tolerance for the early phase of ambiguity — not as a permanent operating mode, but as a temporary state you can navigate without needing to resolve it before you are ready to move.",

  competitiveness:
    "You perform better when there is something at stake, and your drive to win has probably been responsible for some of your best work. The watch-out is that this same orientation can sometimes read as zero-sum in collaborative contexts where it is not: treating a colleague's success as a relative cost to your own, or optimizing for standing in the room at the expense of the shared outcome. The development opportunity is channeling the competitive energy toward shared goals rather than relative position — a distinction that is easier to articulate than to practice, but that makes you a significantly more effective collaborator in the environments where the work is genuinely collective.",

  idealism:
    "You entered this work with a genuine belief in what it could produce, and that belief is one of your most valuable professional qualities. The growth edge is managing the gap between what you believe work should be and what it often is in practice — the compromises, the constraints, the institutional inertia that slows good ideas. High-idealism professionals who do not develop this tolerance often oscillate between enthusiasm and disillusionment in ways that drain their energy and limit their effectiveness. The development opportunity is building a realistic theory of change: understanding how much friction is normal, what can be moved and what cannot, and how to make progress inside imperfect systems rather than waiting for perfect ones.",
};

// 8 Ideal Environment paragraphs

const ENVIRONMENT_PARAGRAPHS: Record<string, string> = {
  remote_small_fast:
    "You are most effective when you are trusted to own your work entirely and move at your natural speed. Remote settings suit you because they strip away the ambient social overhead that slows you down — no performative availability, no open-office distraction, no meetings that could have been a message. You do your best in small, high-trust teams where everyone is operating at a high level and coordination happens through shared context rather than constant check-ins. Fast-moving environments energize rather than exhaust you, because you thrive on the signal that the work actually matters enough to move quickly on.",

  hybrid_medium_steady:
    "You work best in a structure that gives you the benefits of both collaboration and independent focus. Hybrid arrangements let you design your week around the rhythm of your best thinking — team days when you need alignment and energy, home days when you need depth. Medium-sized teams give you enough diversity of perspective to produce genuinely good work, without the diffusion of accountability that comes with large organizations. A steady pace suits you because it allows quality to compound: you produce better output when you are not in permanent crisis mode, and you can sustain that output over the long timelines that ambitious work actually requires.",

  onsite_large_structured:
    "You are effective in environments that have clear structures, established processes, and enough organizational surface area to create real career pathways. Onsite work gives you access to the informal channels — the hallway conversations, the spontaneous collaboration, the institutional knowledge that never makes it into any document — that tend to advance careers in large organizations. Structure is not a constraint for you; it is the operating environment inside which you do your best work. You understand how to navigate institutional complexity, and you tend to thrive in organizations where that navigation is itself a professional skill.",

  remote_solo_selfdirected:
    "Your ideal work environment is one where you set the agenda, define the standards, and execute without needing to account for your process to anyone who is not paying attention to the output. Remote, self-directed work suits the way you actually operate — deep concentration without interruption, schedule control that matches your cognitive rhythms, and the intellectual ownership of being the person who decided how to solve the problem rather than the person who was told how. This mode requires a high degree of self-discipline and internal motivation, both of which you carry in reliable supply.",

  hybrid_small_mentorship:
    "You grow fastest in environments where proximity to experienced practitioners is built into the work structure rather than left to individual initiative. A mentorship-heavy culture signals that the organization takes professional development seriously as an operational priority, not just a benefit on a careers page. Hybrid settings give you the face time that makes mentoring relationships actually work — trust builds faster in person, even if most of the work happens remotely. Small teams mean your contribution is visible and your development is someone's explicit responsibility, rather than something that gets lost in the noise of a large organization.",

  onsite_medium_collaborative:
    "You are at your best in environments where the work is fundamentally shared — where the quality of what you produce depends on the quality of what the people around you produce, and where proximity creates the kind of continuous communication that makes that interdependence function well. Onsite, medium-team contexts give you the social density and working proximity that collaboration actually requires, without the bureaucratic overhead of a large organization. You tend to pull up the quality of the groups you are part of, and you need to be in environments where that effect is possible and valued.",

  flexible_portfolio_variable:
    "You are most effective when you can move between projects, clients, or problem types based on where your attention is most useful and most engaged. A portfolio or freelance structure gives you the variety that sustains your motivation, the ownership that sustains your standards, and the market feedback that keeps your skills calibrated to what is actually valuable. You are comfortable with income variability and contractual ambiguity because the alternative — a fixed role with a fixed scope — costs you more in motivation than it gains in security. Your professional identity is not attached to a single employer; it is attached to the quality of the work itself.",

  remote_large_async:
    "You work best in organizations large enough to have genuine career pathways and diverse problems, but structured around async communication that respects your need for focused work time. Remote-first cultures with strong async norms tend to produce better documentation, more deliberate decision-making, and fewer meetings that exist because no one thought carefully enough about whether they were necessary. You thrive in this environment because the incentive structure rewards the quality of your thinking over the loudness of your presence — a trade-off that suits both your working style and the kind of output you are most proud of.",
};

// 6 Career Direction paragraphs

const CAREER_DIRECTION_PARAGRAPHS: Record<string, string> = {
  specialist:
    "You are building toward the kind of mastery that most people talk about but few actually pursue with the discipline it requires. The specialist path rewards a particular kind of ambition — not the ambition to do everything, but the ambition to do one thing better than almost anyone. This means turning down opportunities that are interesting but tangential, investing in depth at the expense of breadth, and accepting that your career progression will be measured in expertise rather than title changes. The payoff for this commitment is a professional identity that becomes increasingly difficult to replicate: in a world of generalists, genuine mastery has pricing power, and it tends to compound in ways that broad skills do not.",

  generalist:
    "You are building a career that moves horizontally as often as it moves vertically, accumulating a range of experience that most specialists do not have and most organizations cannot easily create internally. The generalist path is not the absence of direction — it is a deliberate strategy for creating value at the intersections where most organizations have the biggest gaps. Your competitive advantage grows in proportion to the number of domains you can connect, and the most interesting problems in almost every industry live at exactly those intersections. The challenge is developing enough depth in each area to be credible, while resisting the pressure to narrow before you have the range that makes the combination genuinely powerful.",

  manager:
    "You have recognized that the most important thing you can do now is not produce work directly, but create the conditions in which other people can produce exceptional work. This is a meaningful shift in professional identity — from being the best individual contributor in the room to being the reason the room performs well. Management done well is not a softer version of the work you were doing before; it is a different craft that happens to require everything you have learned about the work itself, plus a whole new vocabulary for developing other people, building trust under pressure, and making decisions with incomplete information on behalf of a group. The leaders who make the biggest impact are the ones who made this transition deliberately and invested in the new craft the same way they invested in the first one.",

  entrepreneur:
    "You are building something of your own, which means you are signing up for a set of challenges that employment structures specifically exist to shield people from. This is not a caution — it is a description of the deal you have chosen. The upside is full ownership of the outcome, the ability to define the problem rather than inherit it, and the possibility of building something that outlasts the role. The work ahead requires tolerance for uncertainty that would be professionally paralyzing in other contexts, a high capacity for context-switching between the strategic and the operational, and the resilience to maintain clear thinking when external feedback is scarce or negative. You will learn more in the next two years than in any equivalent period of your career.",

  portfolio:
    "You are choosing to run multiple professional tracks simultaneously rather than sequentially, which requires a different relationship to identity, income, and progress than conventional career structures assume. The portfolio path rewards people who are energized by variety, capable of managing without institutional support, and willing to accept the complexity of maintaining several professional relationships at once. Your career arc will not look like a ladder — it will look like a lattice, and that is by design. The skill to develop is the ability to make explicit the through-line that connects your various activities: the coherent professional identity that makes clients and collaborators understand why you do what you do, even when the what changes frequently.",

  explorer:
    "You are still determining the shape of the career you actually want, which is a more honest position than it might feel right now. Premature career commitment costs far more than the discomfort of continued exploration: it produces professionals who are technically competent at something they find deeply unrewarding, which is a hard problem to solve at mid-career. The productive use of this phase is not waiting for clarity but creating the conditions for it — taking roles that expose you to real work across different domains, building relationships with people whose career satisfaction you admire, and treating each new experience as a data point in a narrowing experiment rather than a commitment you have to honor indefinitely. Clarity usually comes through action, not through planning.",
};

// ─── Utility Functions ──────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectVariant(userId: string, variants: string[], index: number): string {
  const hash = simpleHash(userId + String(index));
  return variants[hash % variants.length];
}

// ─── Selection Helpers ──────────────────────────────────────────────────────

type BigFiveTrait = keyof BigFiveScores;
type RIASECType = keyof RIASECScores;

function rankBigFive(scores: BigFiveScores): BigFiveTrait[] {
  return (Object.keys(scores) as BigFiveTrait[])
    .sort((a, b) => scores[b] - scores[a]);
}

function getDominantRIASEC(riasec: RIASECScores): RIASECType {
  return (Object.keys(riasec) as RIASECType[])
    .reduce((a, b) => riasec[a] > riasec[b] ? a : b);
}

function getMostExtremeTrait(bigFive: BigFiveScores): BigFiveTrait {
  return (Object.keys(bigFive) as BigFiveTrait[])
    .reduce((a, b) => Math.abs(bigFive[a] - 50) > Math.abs(bigFive[b] - 50) ? a : b);
}

function selectOpening(
  primaryTrait: BigFiveTrait,
  bigFive: BigFiveScores,
  variantSeed: number,
): string {
  const score = bigFive[primaryTrait];
  const isHigh = score >= 50;
  const variant = variantSeed === 0 ? "a" : "b";
  const key = `${primaryTrait}_${isHigh ? "high" : "low"}_${variant}`;
  return OPENING_PARAGRAPHS[key];
}

function selectStrengths(
  primaryTrait: BigFiveTrait,
  secondaryTrait: BigFiveTrait,
  bigFive: BigFiveScores,
  riasec: RIASECScores,
): string {
  const traitCombinationMap: Record<string, string> = {
    "openness_conscientiousness":            "analytical_creative",
    "conscientiousness_openness":            "creative_systematic",
    "openness_agreeableness":                "empathetic_organized",
    "agreeableness_conscientiousness":       "empathetic_organized",
    "openness_extraversion":                 "visionary_practical",
    "conscientiousness_emotionalStability":  "resilient_ambitious",
    "emotionalStability_conscientiousness":  "resilient_ambitious",
    "openness_emotionalStability":           "adaptable_principled",
    "extraversion_agreeableness":            "people_data",
    "conscientiousness_extraversion":        "detail_bigpicture",
    "extraversion_conscientiousness":        "independent_collaborative",
    "agreeableness_extraversion":            "patient_driven",
  };

  const combinationKey = `${primaryTrait}_${secondaryTrait}`;
  const mapped = traitCombinationMap[combinationKey]
    ?? inferStrengthsFromDominant(primaryTrait);

  return STRENGTHS_PARAGRAPHS[mapped];
}

function inferStrengthsFromDominant(primaryTrait: BigFiveTrait): string {
  const fallbackMap: Record<string, string> = {
    openness:           "analytical_creative",
    conscientiousness:  "detail_bigpicture",
    extraversion:       "independent_collaborative",
    agreeableness:      "empathetic_organized",
    emotionalStability: "resilient_ambitious",
  };
  return fallbackMap[primaryTrait] ?? "adaptable_principled";
}

function selectGrowthEdge(
  mostExtremeTrait: BigFiveTrait,
  bigFive: BigFiveScores,
): string {
  const score = bigFive[mostExtremeTrait];
  const isHigh = score >= 50;

  const growthEdgeMap: Record<string, string> = {
    "openness_high":             "novelty_seeking",
    "openness_low":              "structure_need",
    "conscientiousness_high":    "perfectionism",
    "conscientiousness_low":     "risk_taking",
    "extraversion_high":         "competitiveness",
    "extraversion_low":          "introversion",
    "agreeableness_high":        "agreeableness",
    "agreeableness_low":         "autonomy",
    "emotionalStability_high":   "idealism",
    "emotionalStability_low":    "empathy",
  };

  const key = `${mostExtremeTrait}_${isHigh ? "high" : "low"}`;
  return GROWTH_EDGE_PARAGRAPHS[growthEdgeMap[key] ?? "autonomy"];
}

function selectEnvironment(prefs: EnvironmentPrefs): string {
  const { remote, teamSize, pace } = prefs;

  if (remote && teamSize === "solo")
    return ENVIRONMENT_PARAGRAPHS["remote_solo_selfdirected"];
  if (remote && teamSize === "small" && pace === "fast")
    return ENVIRONMENT_PARAGRAPHS["remote_small_fast"];
  if (remote && teamSize === "large")
    return ENVIRONMENT_PARAGRAPHS["remote_large_async"];
  if (remote)
    return ENVIRONMENT_PARAGRAPHS["remote_small_fast"];

  if (!remote && teamSize === "large")
    return ENVIRONMENT_PARAGRAPHS["onsite_large_structured"];
  if (!remote && teamSize === "medium" && pace === "steady")
    return ENVIRONMENT_PARAGRAPHS["hybrid_medium_steady"];
  if (!remote && teamSize === "medium")
    return ENVIRONMENT_PARAGRAPHS["onsite_medium_collaborative"];
  if (!remote && teamSize === "small")
    return ENVIRONMENT_PARAGRAPHS["hybrid_small_mentorship"];
  if (pace === "variable")
    return ENVIRONMENT_PARAGRAPHS["flexible_portfolio_variable"];

  // Default
  return ENVIRONMENT_PARAGRAPHS["hybrid_medium_steady"];
}

// ─── Headline / Tagline / Share Quote ───────────────────────────────────────

const RIASEC_DESCRIPTORS: Record<string, string> = {
  realistic:     "builds things that work",
  investigative: "solves problems that matter",
  artistic:      "creates what doesn't yet exist",
  social:        "advances others' potential",
  enterprising:  "builds momentum from vision",
  conventional:  "creates order that scales",
};

const TRAJECTORY_DESCRIPTORS: Record<string, string> = {
  specialist:   "going deep",
  generalist:   "connecting across domains",
  manager:      "growing through people",
  entrepreneur: "building independently",
  portfolio:    "running multiple tracks",
  explorer:     "finding the right path",
};

const TRAIT_PHRASES: Record<string, string> = {
  openness:           "I think best at the edge of what I know",
  conscientiousness:  "I finish what I start, and I do it well",
  extraversion:       "I do my best thinking with the right people in the room",
  agreeableness:      "The work matters more when it matters to someone",
  emotionalStability: "I'm the person you want around when the stakes are high",
};

// ─── Main Generator ─────────────────────────────────────────────────────────

export function generateNarrative(
  archetypeName: string,
  archetypeTagline: string,
  riasec: RIASECScores,
  bigFive: BigFiveScores,
  trajectory: TrajectoryType,
  environmentPrefs: EnvironmentPrefs,
  userId?: string,
): NarrativeProfile {
  const seed = userId ?? "default";
  const variantSeed = simpleHash(seed) % 2;

  // Rank Big Five traits
  const bigFiveRanked = rankBigFive(bigFive);
  const primaryTrait = bigFiveRanked[0];
  const secondaryTrait = bigFiveRanked[1];

  // Select paragraphs
  const opening = selectOpening(primaryTrait, bigFive, variantSeed);
  const dominantRIASEC = getDominantRIASEC(riasec);
  const workStyle = RIASEC_PARAGRAPHS[dominantRIASEC];
  const strengths = selectStrengths(primaryTrait, secondaryTrait, bigFive, riasec);
  const mostExtremeTrait = getMostExtremeTrait(bigFive);
  const growthEdge = selectGrowthEdge(mostExtremeTrait, bigFive);
  const idealEnvironment = selectEnvironment(environmentPrefs);
  const careerDirection = CAREER_DIRECTION_PARAGRAPHS[trajectory];

  // Headline and tagline
  const headline = `You are The ${archetypeName}`;
  const tagline = archetypeTagline
    || `Someone who ${RIASEC_DESCRIPTORS[dominantRIASEC]} — ${TRAJECTORY_DESCRIPTORS[trajectory]}.`;

  // Share quote
  const shareQuote = `"${TRAIT_PHRASES[primaryTrait]}" — My PathWise career profile (The ${archetypeName})`;

  // Full narrative
  const fullNarrative = [opening, workStyle, strengths, growthEdge, idealEnvironment, careerDirection].join("\n\n");

  return {
    headline,
    tagline,
    opening,
    workStyle,
    strengths,
    growthEdge,
    idealEnvironment,
    careerDirection,
    fullNarrative,
    shareQuote,
  };
}
