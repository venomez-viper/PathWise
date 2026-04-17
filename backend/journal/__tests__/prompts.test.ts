import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("generateDailyPrompt", () => {
  it("returns trimmed prompt", async () => {
    mockChat.mockResolvedValue('  What did you learn today?  ');
    const { generateDailyPrompt } = await import("../prompts");
    expect(await generateDailyPrompt()).toBe("What did you learn today?");
  });

  it("falls back on failure", async () => {
    mockChat.mockRejectedValue(new Error("x"));
    const { generateDailyPrompt, FALLBACK_PROMPTS } = await import("../prompts");
    expect(FALLBACK_PROMPTS).toContain(await generateDailyPrompt());
  });
});
