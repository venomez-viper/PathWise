export type BlogReference = {
  label: string;
  href: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogImage = {
  src: string;
  alt: string;
  credit: string;
  creditHref: string;
};

export type BlogArticle = {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  accent: string;
  featured?: boolean;
  image: BlogImage;
  intro: string[];
  sections: BlogSection[];
  takeaways: string[];
  references: BlogReference[];
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    slug: 'how-to-find-your-career-identity-in-5-steps',
    category: 'Career Discovery',
    title: 'How to Find Your Career Identity in 5 Steps',
    excerpt:
      'Career clarity rarely appears in one big epiphany. It usually comes from noticing your patterns, testing them in the real world, and being honest about what fits.',
    author: 'PathWise Editorial',
    date: 'March 20, 2026',
    readTime: '9 min read',
    accent: '#8b5cf6',
    featured: true,
    image: {
      src: 'https://images.unsplash.com/photo-1759984782211-3a02ca78e6ac?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'A woman writing notes beside a laptop while planning her next steps.',
      credit: 'Photo by Julio Lopez on Unsplash',
      creditHref:
        'https://unsplash.com/photos/a-young-woman-studying-and-writing-notes-at-a-desk-Juj-Mi2b0DA',
    },
    intro: [
      'Most people begin career planning with titles. That sounds practical, but it usually creates confusion. Titles are tidy. Real work is not. Two people with the same title can spend their days doing completely different things.',
      'A better place to start is identity. Notice what gives you energy, what values matter to you, and what kind of problems you enjoy solving. That gives you a path you can test, not a fantasy you have to keep defending.',
    ],
    sections: [
      {
        heading: 'Start with your energy',
        paragraphs: [
          'Keep a simple note after projects, classes, or meetings. What pulled your attention in? What drained you? Energy is often a better clue than current skill because many people are competent at work they do not want more of.',
          'Once you spot patterns, put them into plain language. Maybe you like explaining ideas, organizing moving parts, mentoring people, or building something from scratch. Those patterns matter more than a title that only sounds impressive.',
        ],
      },
      {
        heading: 'Define the values your work needs to protect',
        paragraphs: [
          'Career confusion often comes from treating every opportunity like it should matter equally. It does not. Some people care most about stability, some about freedom, some about income, and some about impact. None of those are wrong, but they lead to different choices.',
          'Pick your top three values and write what each one means in real life. If flexibility matters, define it. If impact matters, say what kind. The clearer your values are, the easier it becomes to say yes and no with confidence.',
        ],
      },
      {
        heading: 'Test your ideas in the market',
        paragraphs: [
          'Use tools like My Next Move and the Occupational Outlook Handbook to compare your self-knowledge with real occupations. Read what people actually do, how roles are described, and what skills appear again and again.',
          'Then talk to a few people doing the work. Informational interviews are often where vague interest becomes real clarity. You do not need a life plan. You need enough truth to make the next move on purpose.',
        ],
      },
    ],
    takeaways: [
      'Track energy after real work, not imagined work.',
      'Name your values in concrete language.',
      'Research daily tasks, not only titles.',
      'Use conversations and small experiments to test fit.',
    ],
    references: [
      {
        label: 'My Next Move: Careers sorted by interests',
        href: 'https://www.mynextmove.org/find/interests',
      },
      {
        label: 'U.S. Bureau of Labor Statistics: Occupational Outlook Handbook',
        href: 'https://www.bls.gov/ooh/',
      },
      {
        label: 'CareerOneStop: Job search checklist',
        href: 'https://blog.careeronestop.org/job-search-checklist/',
      },
    ],
  },
  {
    id: 2,
    slug: 'the-skill-gap-is-real-heres-how-to-close-it-faster',
    category: 'Skill Development',
    title: "The Skill Gap Is Real. Here's How to Close It Faster",
    excerpt:
      'Skill gaps stay scary when they remain abstract. Progress gets faster once you turn them into visible behaviors, visible practice, and visible proof.',
    author: 'PathWise Editorial',
    date: 'March 18, 2026',
    readTime: '8 min read',
    accent: '#0f766e',
    image: {
      src: 'https://images.unsplash.com/photo-1554902843-260acd0993f8?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'Three people working together around a table with laptops and notes.',
      credit: 'Photo by CoWomen on Unsplash',
      creditHref:
        'https://unsplash.com/photos/three-women-sitting-around-table-using-laptops-7Zy2KV76Mts',
    },
    intro: [
      'A lot of people say they need to upskill, but fewer can explain what better would actually look like on the job. That is the gap inside the gap.',
      'The fastest improvement comes from building against a target role. Not a vague goal like get stronger at analysis, but a real one like clean messy data, explain findings clearly, or lead a client conversation without losing the thread.',
    ],
    sections: [
      {
        heading: 'Turn vague skills into observable behaviors',
        paragraphs: [
          'Communication, leadership, and problem solving sound useful because they are useful. They are also easy to hide behind. Ask what those skills look like in the role you want. Is communication writing clear updates, running meetings, pitching ideas, or translating data into decisions?',
          'Once a skill becomes visible, it becomes trainable. That is when your learning plan stops feeling like a pile of resources and starts feeling like practice with a purpose.',
        ],
      },
      {
        heading: 'Learn in the order the job uses the skill',
        paragraphs: [
          'The World Economic Forum notes that skill gaps remain a major barrier for employers. That makes sequencing important. Start with the capabilities that unlock useful work first, then build the layers that make you more advanced later.',
          'If you want a role in operations, for example, reliability and structured thinking may matter before flashy strategy language. If you want a role in product or marketing, customer understanding and clear writing may come before deeper analytics.',
        ],
      },
      {
        heading: 'Keep proof while you learn',
        paragraphs: [
          'Do not wait until the end to package your growth. Save project links, screenshots, case studies, before-and-after examples, and short notes on what changed because of your work.',
          'Proof is what turns learning into momentum. It also makes interviews easier because you are no longer talking about potential in general terms. You are showing what you have already done.',
        ],
      },
    ],
    takeaways: [
      'Define skills through behaviors people can observe.',
      'Sequence learning around the role you want next.',
      'Practice in public whenever you can.',
      'Keep proof as you go instead of rebuilding it later.',
    ],
    references: [
      {
        label: 'World Economic Forum: Future of Jobs Report 2025, Workforce strategies',
        href: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/4-workforce-strategies/',
      },
      {
        label: 'NACE: What is career readiness?',
        href: 'https://www.naceweb.org/career-readiness/competencies/career-readiness-defined/',
      },
      {
        label: 'CareerOneStop: Earn certifications to boost your career',
        href: 'https://blog.careeronestop.org/earn-certifications-to-boost-your-career/',
      },
    ],
  },
  {
    id: 3,
    slug: 'career-switching-at-30-what-no-one-tells-you',
    category: 'Career Switching',
    title: 'Career Switching at 30: What No One Tells You',
    excerpt:
      'Career changes in your thirties are rarely clean breaks. They usually involve portable strengths, awkward identity shifts, and a lot of practical tradeoffs.',
    author: 'PathWise Editorial',
    date: 'March 15, 2026',
    readTime: '10 min read',
    accent: '#f59e0b',
    image: {
      src: 'https://images.unsplash.com/photo-1551836022-aadb801c60ae?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'Two professionals in conversation across a table during a career discussion.',
      credit: 'Photo by Amy Hirschi on Unsplash',
      creditHref:
        'https://unsplash.com/photos/man-and-woman-talking-inside-office-W7aXY5F2pBo',
    },
    intro: [
      'Switching careers at 30 can feel disorienting because you are not starting from nothing, but you are not established in the new lane either. You have enough experience to know what is wrong and enough responsibility to make the leap feel risky.',
      'The best switches do not erase the past. They translate it. Your previous work still matters. The trick is figuring out what actually travels with you.',
    ],
    sections: [
      {
        heading: 'You are carrying more than you think',
        paragraphs: [
          'People talk about career changes as if they mean starting over. That is emotionally understandable, but strategically weak. Judgment, communication, project ownership, reliability, and stakeholder management often transfer further than people expect.',
          'Make a list of the things people already trust you with. Then separate what is domain-specific from what is portable. The portable list becomes the spine of your next story.',
        ],
      },
      {
        heading: 'The identity shift is harder than the resume rewrite',
        paragraphs: [
          'Learning new tools takes effort, but the deeper challenge is often identity. You may go from expert to beginner in public. You may need to explain yourself differently. You may feel slow next to people who have been in the field for years.',
          'That discomfort does not mean you are failing. It means you are in the honest middle of change. Give yourself permission to be early without treating yourself like you are empty.',
        ],
      },
      {
        heading: 'Use bridge moves before huge leaps',
        paragraphs: [
          'Before making a dramatic jump, look for experiments that reduce uncertainty. That can mean internal projects, freelance work, volunteer assignments, certifications tied to real tasks, or informational interviews with people already in the field.',
          'Those smaller moves do more than build confidence. They give you language, evidence, and examples. That is often what makes a career switch believable to other people and steady for you.',
        ],
      },
    ],
    takeaways: [
      'Inventory what transfers before obsessing over what is missing.',
      'Expect an identity dip while the new path becomes real.',
      'Use bridge projects to lower uncertainty.',
      'Tell a forward-looking story backed by evidence.',
    ],
    references: [
      {
        label: 'CareerOneStop: Job search checklist',
        href: 'https://blog.careeronestop.org/job-search-checklist/',
      },
      {
        label: 'CareerOneStop: I scheduled an informational interview. . . now what?',
        href: 'https://blog.careeronestop.org/i-scheduled-an-informational-interview-now-what/',
      },
      {
        label: 'U.S. Bureau of Labor Statistics: Occupational Outlook Handbook',
        href: 'https://www.bls.gov/ooh/',
      },
    ],
  },
  {
    id: 4,
    slug: 'your-career-readiness-score-what-it-means-and-how-to-improve-it',
    category: 'Job Readiness',
    title: 'Your Career Readiness Score: What It Means and How to Improve It',
    excerpt:
      'A readiness score only helps if it leads to action. The real value is not the number. It is the honest conversation the number forces you to have.',
    author: 'PathWise Editorial',
    date: 'March 12, 2026',
    readTime: '7 min read',
    accent: '#ef4444',
    image: {
      src: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'A team meeting in a glass conference room with laptops open.',
      credit: 'Photo by Campaign Creators on Unsplash',
      creditHref:
        'https://unsplash.com/fr/photos/people-sitting-near-table-with-laptop-computer-qCi_MzVODoU',
    },
    intro: [
      'Plenty of people are active in their search without being fully prepared. They are applying, networking, and learning, but the basics employers actually screen for are still uneven.',
      'A good readiness score should feel like a diagnostic, not a grade. It should show what is already strong, where you are exposed, and what changes will make the biggest difference first.',
    ],
    sections: [
      {
        heading: 'Readiness is broader than qualifications',
        paragraphs: [
          'Being qualified matters, but readiness is bigger than that. Employers also care about communication, teamwork, professionalism, technology use, judgment, and follow-through. NACE frames these as career readiness competencies because they show up across roles and industries.',
          'That means your readiness score should reflect both technical fit and execution fit. Can you do the work, and can people trust the way you do it?',
        ],
      },
      {
        heading: 'Weak scores often point to missing proof',
        paragraphs: [
          'Many candidates are stronger than their materials make them appear. They have done useful work but have not translated it into examples, outcomes, or a story someone else can quickly understand.',
          'Ask whether the low area reflects a missing skill or missing proof. If the skill is there, better examples and clearer packaging may move the score faster than another course ever will.',
        ],
      },
      {
        heading: 'Improve the basics before the overhaul',
        paragraphs: [
          'The fastest gains usually come from the unglamorous work. Sharper resume bullets, better interview stories, stronger project evidence, and cleaner follow-up habits affect every application and every conversation.',
          'Once those basics are solid, then broader upskilling makes more sense. Start with the levers that change outcomes quickly. Momentum matters here.',
        ],
      },
    ],
    takeaways: [
      'Readiness includes habits, not only credentials.',
      'Separate missing skill from missing proof.',
      'Fix high-leverage basics before big rewrites.',
      'Use the score as a weekly feedback tool.',
    ],
    references: [
      {
        label: 'NACE: What is career readiness?',
        href: 'https://www.naceweb.org/career-readiness/competencies/career-readiness-defined/',
      },
      {
        label: 'U.S. Bureau of Labor Statistics: Occupational Outlook Handbook',
        href: 'https://www.bls.gov/ooh/',
      },
      {
        label: 'CareerOneStop: Job search checklist',
        href: 'https://blog.careeronestop.org/job-search-checklist/',
      },
    ],
  },
  {
    id: 5,
    slug: 'how-ai-is-changing-career-planning-forever',
    category: 'AI & Careers',
    title: 'How AI Is Changing Career Planning Forever',
    excerpt:
      'AI does not remove the need for judgment. It raises the standard for it. The real edge comes from using AI to think better, not to think less.',
    author: 'PathWise Editorial',
    date: 'March 10, 2026',
    readTime: '9 min read',
    accent: '#6366f1',
    image: {
      src: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'A close view of an AI chip on a circuit board.',
      credit: 'Photo by Igor Omilaev on Unsplash',
      creditHref:
        'https://unsplash.com/photos/a-computer-chip-with-the-letter-a-on-top-of-it-eGGFZ5X2LnA',
    },
    intro: [
      'Career planning used to be slow and fragmented. You read job descriptions, looked at trends, talked to a few people, and tried to stitch together a plan from incomplete pieces.',
      'AI changes that by making synthesis faster. It can compare roles, surface skill gaps, summarize labor signals, and help people rehearse their story. But it also creates a new challenge: knowing when to trust the tool and when to think harder for yourself.',
    ],
    sections: [
      {
        heading: 'AI is strong at pattern-finding',
        paragraphs: [
          'AI can scan large amounts of career information quickly. That makes it useful for clustering repeated skills, identifying adjacent roles, and translating experience from one field into the language of another.',
          'For someone who feels buried under too many options, that speed matters. It can shorten the path from confusion to a workable starting point.',
        ],
      },
      {
        heading: 'The human job is still judgment',
        paragraphs: [
          'The OECD work on AI and skills is a good reminder that capability is not just a technical checklist. Judgment, context, values, and lived constraints still shape the right decision.',
          'AI can show likely routes, but it cannot decide what tradeoff you are willing to make or what kind of life you want your work to support. That part remains human.',
        ],
      },
      {
        heading: 'Thoughtful users will get the most from it',
        paragraphs: [
          'The strongest workflows use AI to sharpen thinking, not replace it. That might mean practicing interviews, rewriting bullet points, comparing job descriptions, or generating project ideas that you then refine.',
          'Passive use makes your output generic. Thoughtful use helps you move faster while still sounding like yourself. That difference will matter more and more.',
        ],
      },
    ],
    takeaways: [
      'Use AI to compress research and reveal patterns.',
      'Keep final decisions grounded in human judgment.',
      'Verify and edit AI output before you trust it.',
      'Treat AI as a collaborator, not a substitute.',
    ],
    references: [
      {
        label: 'OECD: AI and the Future of Skills, Volume 1',
        href: 'https://www.oecd.org/en/publications/ai-and-the-future-of-skills-volume-1_5ee71f34-en.html',
      },
      {
        label: 'World Economic Forum: Future of Jobs Report 2025',
        href: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/',
      },
      {
        label: 'U.S. Bureau of Labor Statistics: Occupational Outlook Handbook',
        href: 'https://www.bls.gov/ooh/',
      },
    ],
  },
  {
    id: 6,
    slug: 'strategic-networking-quality-over-quantity',
    category: 'Networking',
    title: 'Strategic Networking: Quality Over Quantity',
    excerpt:
      'Strong networking is not collecting names. It is building a small circle of real relationships and showing up well enough that people trust your name when you are not in the room.',
    author: 'PathWise Editorial',
    date: 'March 8, 2026',
    readTime: '8 min read',
    accent: '#0891b2',
    image: {
      src: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      alt: 'A professional meeting with people gathered around a large conference table.',
      credit: 'Photo by Christina @ wocintechchat.com M on Unsplash',
      creditHref:
        'https://unsplash.com/photos/group-of-people-sitting-beside-rectangular-wooden-table-with-laptops-faEfWCdOKIg',
    },
    intro: [
      'Networking advice often sounds fake because it is framed like a volume game. Message more people. Attend more events. Post more often. None of that guarantees trust.',
      'Real networking is quieter than that. It is one thoughtful conversation, one useful follow-up, and one meaningful contribution at a time.',
    ],
    sections: [
      {
        heading: 'Start with people who are one step away',
        paragraphs: [
          'Most people overlook the easiest place to begin: former classmates, coworkers, mentors, professors, and community connections. Warm context is often more useful than a cold message sent to a stranger with a nice title.',
          'Make a short list of people who are adjacent to the field you want. You are not only looking for job leads. You are looking for context, language, and perspective.',
        ],
      },
      {
        heading: 'Ask better questions',
        paragraphs: [
          'Weak networking asks for too much too quickly. Better networking asks focused questions. What skill matters most in your first year? What do people misunderstand about this role? If you were starting again, where would you spend your time first?',
          'Those questions are easier to answer and much more likely to start a real conversation. They also make it clear that you are serious about learning, not just collecting favors.',
        ],
      },
      {
        heading: 'Use communities where relationships can repeat',
        paragraphs: [
          'Professional associations, alumni groups, and recurring industry events are useful because they create repeated exposure. Trust rarely appears in one perfect moment. It usually grows from seeing the same people, showing curiosity, and contributing something useful over time.',
          'A strong follow-up helps too. Mention one idea you are still thinking about or one action you took because of the conversation. That makes the relationship feel real instead of transactional.',
        ],
      },
    ],
    takeaways: [
      'Build outward from real relationships you already have.',
      'Ask focused questions that invite honest answers.',
      'Use professional communities for repeated exposure.',
      'Follow up with specifics so people remember you clearly.',
    ],
    references: [
      {
        label: 'CareerOneStop: How to build a professional network',
        href: 'https://blog.careeronestop.org/how-to-build-a-professional-network/',
      },
      {
        label: 'CareerOneStop: 5 ways professional associations can help you boost your career',
        href: 'https://blog.careeronestop.org/5-ways-to-boost-your-career-via-a-professional-association/',
      },
      {
        label: 'CareerOneStop: I scheduled an informational interview. . . now what?',
        href: 'https://blog.careeronestop.org/i-scheduled-an-informational-interview-now-what/',
      },
    ],
  },
];

export const BLOG_CATEGORIES = ['All', ...new Set(BLOG_ARTICLES.map((article) => article.category))];

export const getBlogArticleBySlug = (slug: string) =>
  BLOG_ARTICLES.find((article) => article.slug === slug);
