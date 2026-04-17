import { describe, it, expect, vi } from "vitest";

const mockChat = vi.fn();
vi.mock("../mistral-client", () => ({ chatCompletion: mockChat }));

describe("generateTags", () => {
  it("returns parsed tags", async () => {
    mockChat.mockResolvedValue('["win", "learning"]');
    const { generateTags } = await import("../tagging");
    expect(await generateTags("body")).toEqual(["win", "learning"]);
  });

  it("filters invalid tags", async () => {
    mockChat.mockResolvedValue('["win", "not-real", "motivation"]');
    const { generateTags } = await import("../tagging");
    expect(await generateTags("body")).toEqual(["win", "motivation"]);
  });

  it("returns [] on bad JSON", async () => {
    mockChat.mockResolvedValue("not json");
    const { generateTags } = await import("../tagging");
    expect(await generateTags("body")).toEqual([]);
  });

  it("returns [] on throw", async () => {
    mockChat.mockRejectedValue(new Error("x"));
    const { generateTags } = await import("../tagging");
    expect(await generateTags("body")).toEqual([]);
  });
});
