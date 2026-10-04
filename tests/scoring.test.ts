import { describe, expect, it } from "vitest";
import { computeResult, pickArchetype } from "@/survey/scoring";
import { makeAnswers } from "./helpers";

const flat = (v: number) => ({ curiosity: v, lead: v, follow: v, sensation: v, fantasy: v, exhibition: v });

describe("computeResult", () => {
  it("maps all-minimum answers to vanilla with spice 0", () => {
    const r = computeResult(makeAnswers(1, "not_for_me"));
    expect(r.spiceLevel).toBe(0);
    expect(r.archetype).toBe("vanilla");
    expect(r.dimensions.lead).toBe(0);
    expect(Object.values(r.interests).every((s) => s === "not_for_me")).toBe(true);
  });

  it("maps all-maximum answers to firecracker with spice 100", () => {
    const r = computeResult(makeAnswers(5, "tried"));
    expect(r.spiceLevel).toBe(100);
    expect(r.archetype).toBe("firecracker");
    expect(r.interests.bdsm).toBe("explored");
  });

  it("marks a category explored if any of its activities was tried", () => {
    const answers = makeAnswers(3, "not_for_me");
    answers["act.pet_play"] = "tried";
    answers["act.dirty_talk"] = "curious";
    const r = computeResult(answers);
    expect(r.interests.roleplay).toBe("explored");
    expect(r.interests.verbal).toBe("curious");
    expect(r.interests.toys).toBe("not_for_me");
  });

  it("ignores the attention check in the dimensions", () => {
    expect(computeResult(makeAnswers(5)).dimensions.curiosity).toBe(100);
  });
});

describe("pickArchetype", () => {
  it("picks the strongest dimension", () => {
    expect(pickArchetype({ ...flat(40), fantasy: 70 }, 50)).toBe("storyteller");
    expect(pickArchetype({ ...flat(40), follow: 70 }, 50)).toBe("follower");
  });

  it("picks switch when lead and follow are both high and close", () => {
    expect(pickArchetype({ ...flat(30), lead: 70, follow: 65 }, 50)).toBe("switch");
    expect(pickArchetype({ ...flat(30), lead: 90, follow: 60 }, 50)).toBe("lead");
  });
});
