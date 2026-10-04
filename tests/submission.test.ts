import { describe, expect, it } from "vitest";
import { validateSubmission } from "@/survey/submission";
import { makeAnswers } from "./helpers";

const now = new Date("2026-10-04T16:20:00Z");
const body = (extra: object = {}) => ({ locale: "en", answers: makeAnswers(), durationSeconds: 300, ...extra });

describe("validateSubmission", () => {
  it("stores a valid response with month-only time and no flags", () => {
    const r = validateSubmission(body(), now);
    expect(r.kind).toBe("store");
    if (r.kind !== "store") return;
    expect(r.response.submittedMonth).toBe("2026-10");
    expect(r.response.returningHash).toBeNull();
    expect(r.response.qualityFlags).toEqual(["straightlined"]);
  });

  it("rejects missing, unknown and out-of-range answers", () => {
    const missing = makeAnswers();
    delete missing["demo.age"];
    expect(validateSubmission(body({ answers: missing }), now).kind).toBe("invalid");
    expect(validateSubmission(body({ answers: { ...makeAnswers(), extra: 1 } }), now).kind).toBe("invalid");
    expect(validateSubmission(body({ answers: { ...makeAnswers(), "core.lead.1": 6 } }), now).kind).toBe("invalid");
    expect(validateSubmission(body({ answers: { ...makeAnswers(), "demo.country": "XX" } }), now).kind).toBe("invalid");
  });

  it("rejects unknown locales", () => {
    expect(validateSubmission(body({ locale: "xx" }), now).kind).toBe("invalid");
  });

  it("silently discards honeypot submissions", () => {
    expect(validateSubmission(body({ website: "spam" }), now).kind).toBe("discard");
  });

  it("hashes the returning code and never stores it in plain text", () => {
    const a = validateSubmission(body({ returningCode: "abcd-efgh-2345" }), now);
    const b = validateSubmission(body({ returningCode: "ABCDEFGH2345" }), now);
    if (a.kind !== "store" || b.kind !== "store") throw new Error("expected store");
    expect(a.response.returningHash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.response.returningHash).toBe(b.response.returningHash);
    expect(JSON.stringify(a.response)).not.toContain("ABCD");
    expect(validateSubmission(body({ returningCode: "too-short" }), now).kind).toBe("invalid");
  });

  it("flags fast, inattentive and straight-lined responses", () => {
    const answers = makeAnswers(4);
    answers["check.attention"] = 5;
    const r = validateSubmission(body({ answers, durationSeconds: 30 }), now);
    if (r.kind !== "store") throw new Error("expected store");
    expect(r.response.qualityFlags).toEqual(["too_fast", "attention_failed", "straightlined"]);
  });
});
