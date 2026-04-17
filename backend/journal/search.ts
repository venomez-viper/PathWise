import { chatCompletion } from "./mistral-client";

export interface SearchEntry {
  id: string;
  body: string;
  createdAt: string;
}

export interface AnswerResult {
  answer: string;
  citations: { entryId: string; date: string }[];
}

const SYSTEM_PROMPT = `You answer questions about the user's own career journal entries.
Use only the entries provided — do not invent details.
Speak directly to the user ("You said...", "You've been...").
Keep answers to 2-4 sentences. If the entries don't address the question, say so plainly.`;

export async function answerQuestion(
  question: string,
  entries: SearchEntry[]
): Promise<AnswerResult> {
  if (entries.length === 0) {
    return {
      answer: "I couldn't find anything about that yet — try writing more entries first.",
      citations: [],
    };
  }

  const corpus = entries
    .map(e => `[id=${e.id} date=${e.createdAt.slice(0, 10)}]\n${e.body}`)
    .join("\n\n---\n\n");

  const answer = await chatCompletion({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Entries:\n\n${corpus.slice(0, 10_000)}\n\nQuestion: ${question}` },
    ],
    maxTokens: 250,
    temperature: 0.3,
  });

  return {
    answer: answer.trim(),
    citations: entries.slice(0, 5).map(e => ({ entryId: e.id, date: e.createdAt.slice(0, 10) })),
  };
}
