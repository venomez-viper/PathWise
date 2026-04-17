import { secret } from "encore.dev/config";
import { Mistral } from "@mistralai/mistralai";

const mistralKey = secret("MistralAPIKey");

let client: Mistral | null = null;
function getClient(): Mistral {
  if (!client) client = new Mistral({ apiKey: mistralKey() });
  return client;
}

export type TextModel = "ministral-8b-latest" | "mistral-small-latest";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: TextModel;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function chatCompletion(opts: ChatOptions): Promise<string> {
  try {
    const resp = await getClient().chat.complete({
      model: opts.model,
      messages: opts.messages,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature ?? 0.4,
    });
    const content = resp.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error("empty completion");
    }
    return content;
  } catch (err) {
    throw new Error(`mistral chat failed: ${(err as Error).message}`);
  }
}

export interface TranscribeOptions {
  audio: Buffer;
  filename: string;
  language?: string;
}

export async function transcribeAudio(opts: TranscribeOptions): Promise<string> {
  try {
    const resp = await getClient().audio.transcriptions.create({
      model: "voxtral-mini-2507",
      file: { fileName: opts.filename, content: opts.audio },
      language: opts.language,
    } as any);
    const text = (resp as any)?.text;
    if (typeof text !== "string") throw new Error("no transcript in response");
    return text;
  } catch (err) {
    throw new Error(`mistral stt failed: ${(err as Error).message}`);
  }
}
