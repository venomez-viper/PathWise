import { chatCompletion } from "./mistral-client";

export const FALLBACK_PROMPTS = [
  "What's one small win from your career journey this week?",
  "Name one skill you want to strengthen this month — why that one?",
  "What conversation at work do you keep replaying in your head?",
  "What's been getting in the way of the progress you want to make?",
  "If today were a good day, what would have happened by 5pm?",
];

const SYSTEM_PROMPT = `You write single-sentence career reflection prompts.
Gentle, curious tone. No bullet points. No preamble. Respond with ONLY the prompt sentence.
Vary the angle: wins, blockers, skills, relationships, values.`;

export async function generateDailyPrompt(): Promise<string> {
  try {
    const raw = await chatCompletion({
      model: "ministral-8b-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Give me today's prompt." },
      ],
      maxTokens: 60,
      temperature: 0.8,
    });
    const trimmed = raw.trim().replace(/^["']|["']$/g, "");
    return trimmed || pickFallback();
  } catch {
    return pickFallback();
  }
}

function pickFallback(): string {
  return FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
}
