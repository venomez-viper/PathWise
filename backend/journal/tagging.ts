import { chatCompletion } from "./mistral-client";
import { JOURNAL_TAGS, JournalTag, isValidTag } from "./tags-taxonomy";

const SYSTEM_PROMPT = `You categorize short career journal entries.
Pick 1-3 tags from this fixed list that best describe the entry:
${JOURNAL_TAGS.join(", ")}.
Respond ONLY with a JSON array of strings. No prose. Example: ["win","learning"]`;

export async function generateTags(body: string): Promise<JournalTag[]> {
  try {
    const raw = await chatCompletion({
      model: "ministral-8b-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: body.slice(0, 2000) },
      ],
      maxTokens: 50,
      temperature: 0.2,
    });
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is string => typeof t === "string")
      .filter(isValidTag)
      .slice(0, 3);
  } catch {
    return [];
  }
}
