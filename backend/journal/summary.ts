import { chatCompletion } from "./mistral-client";

export interface SummaryInput {
  body: string;
  createdAt: string;
}

const SYSTEM_PROMPT = `You are a warm career coach.
The user shares recent journal entries. In 2-3 sentences, reflect back patterns you notice:
themes, progress, tension points. No lists. No headers. Speak to them directly ("You...").
Be specific to the entries — avoid generic advice.`;

export async function generateSummary(entries: SummaryInput[]): Promise<string | null> {
  if (entries.length === 0) return null;
  try {
    const corpus = entries
      .map(e => `[${e.createdAt.slice(0, 10)}] ${e.body}`)
      .join("\n\n");
    const raw = await chatCompletion({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: corpus.slice(0, 8000) },
      ],
      maxTokens: 200,
      temperature: 0.5,
    });
    return raw.trim() || null;
  } catch {
    return null;
  }
}
