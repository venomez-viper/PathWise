import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("answerQuestion", () => {
  it("returns answer + citations", async () => {
    mockChat.mockResolvedValue("You've been focused on networking.");
    const { answerQuestion } = await import("../search");
    const r = await answerQuestion("networking?", [
      { id: "e1", body: "coffee chat", createdAt: "2026-04-10T10:00:00Z" },
    ]);
    expect(r.answer).toBe("You've been focused on networking.");
    expect(r.citations.length).toBeGreaterThanOrEqual(1);
  });

  it("empty-state answer when no entries", async () => {
    const { answerQuestion } = await import("../search");
    const r = await answerQuestion("hi", []);
    expect(r.answer).toMatch(/couldn't find|no entries|try writing/i);
    expect(r.citations).toEqual([]);
  });
});
