import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("generateSummary", () => {
  it("returns summary", async () => {
    mockChat.mockResolvedValue("You seem focused on interview prep.");
    const { generateSummary } = await import("../summary");
    const s = await generateSummary([
      { body: "leetcode", createdAt: "2026-04-10T10:00:00Z" },
    ]);
    expect(s).toBe("You seem focused on interview prep.");
  });

  it("returns null on failure", async () => {
    mockChat.mockRejectedValue(new Error("x"));
    const { generateSummary } = await import("../summary");
    expect(await generateSummary([{ body: "x", createdAt: "2026-04-10T10:00:00Z" }])).toBeNull();
  });

  it("returns null on empty", async () => {
    const { generateSummary } = await import("../summary");
    expect(await generateSummary([])).toBeNull();
  });
});
