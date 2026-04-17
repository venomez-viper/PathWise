import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("encore.dev/config", () => ({
  secret: (_name: string) => () => "test-key",
}));

const mockChatComplete = vi.fn();
const mockTranscribe = vi.fn();

vi.mock("@mistralai/mistralai", () => ({
  Mistral: class {
    chat = { complete: (...args: unknown[]) => mockChatComplete(...args) };
    audio = { transcriptions: { complete: (...args: unknown[]) => mockTranscribe(...args) } };
  },
}));

beforeEach(() => {
  mockChatComplete.mockReset();
  mockTranscribe.mockReset();
});

describe("chatCompletion", () => {
  it("returns message content", async () => {
    mockChatComplete.mockResolvedValue({ choices: [{ message: { content: "hi" } }] });
    const { chatCompletion } = await import("../mistral-client");
    expect(
      await chatCompletion({ model: "ministral-8b-latest", messages: [{ role: "user", content: "x" }] })
    ).toBe("hi");
  });

  it("throws descriptive on failure", async () => {
    mockChatComplete.mockRejectedValue(new Error("boom"));
    const { chatCompletion } = await import("../mistral-client");
    await expect(
      chatCompletion({ model: "ministral-8b-latest", messages: [{ role: "user", content: "x" }] })
    ).rejects.toThrow(/mistral chat failed/i);
  });
});

describe("transcribeAudio", () => {
  it("returns transcript text", async () => {
    mockTranscribe.mockResolvedValue({ text: "hello" });
    const { transcribeAudio } = await import("../mistral-client");
    expect(await transcribeAudio({ audio: Buffer.from("x"), filename: "a.webm" })).toBe("hello");
  });

  it("throws descriptive on failure", async () => {
    mockTranscribe.mockRejectedValue(new Error("down"));
    const { transcribeAudio } = await import("../mistral-client");
    await expect(
      transcribeAudio({ audio: Buffer.from("x"), filename: "a.webm" })
    ).rejects.toThrow(/mistral stt failed/i);
  });
});
