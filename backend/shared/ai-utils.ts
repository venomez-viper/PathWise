import Anthropic from "@anthropic-ai/sdk";

/**
 * Robust AI call with retry, JSON cleaning, and fallback.
 * Strips markdown fences, dashes, and other artifacts before parsing.
 */
export async function callClaudeWithRetry(opts: {
  apiKey: string;
  model: string;
  maxTokens: number;
  prompt: string;
  retries?: number;
  fallback?: any;
}): Promise<any> {
  const { apiKey, model, maxTokens, prompt, retries = 2, fallback } = opts;
  const client = new Anthropic({ apiKey });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== "text") throw new Error("Unexpected AI response type");

      const parsed = extractJSON(content.text);
      if (parsed !== null) return parsed;

      throw new Error("Could not extract JSON from AI response");
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on auth/permission errors
      if (lastError.message.includes("401") || lastError.message.includes("403") || lastError.message.includes("invalid_api_key")) {
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  // If we have a fallback, use it instead of crashing
  if (fallback !== undefined) {
    console.error(`AI call failed after ${retries + 1} attempts, using fallback:`, lastError?.message);
    return fallback;
  }

  throw lastError ?? new Error("AI call failed");
}

/**
 * Extract JSON from Claude's response text.
 * Handles: raw JSON, markdown code fences, dashes, extra whitespace.
 */
function extractJSON(text: string): any | null {
  // Step 1: Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");

  // Step 2: Remove leading/trailing dashes, equals, or decorative lines
  cleaned = cleaned.replace(/^[\s\-=~*]+/gm, "").replace(/[\s\-=~*]+$/gm, "");

  // Step 3: Remove any "Here is..." or explanation text before the JSON
  cleaned = cleaned.replace(/^[^[{]*(?=[\[{])/s, "");

  // Step 4: Try to find JSON object or array
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);

  // Prefer object if both exist and object comes first
  const match = objMatch && arrMatch
    ? (objMatch.index! <= arrMatch.index! ? objMatch : arrMatch)
    : objMatch || arrMatch;

  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    // Try fixing common JSON issues
    try {
      // Fix trailing commas
      const fixed = match[0].replace(/,\s*([\]}])/g, "$1");
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}
