import { describe, expect, it } from "vitest";
import { formatCode, generateCode, normalizeCode } from "@/survey/returningCode";

describe("returning code", () => {
  it("generates well-formed, unique codes", () => {
    const codes = new Set(Array.from({ length: 1000 }, generateCode));
    expect(codes.size).toBe(1000);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      expect(formatCode(normalizeCode(code)!)).toBe(code);
    }
  });

  it("normalizes user input and rejects ambiguous characters", () => {
    expect(normalizeCode(" abcd efgh 2345 ")).toBe("ABCDEFGH2345");
    expect(normalizeCode("ABCD-EFGH-2340")).toBeNull(); // 0 is not in the alphabet
    expect(normalizeCode("ABCD-EFGH")).toBeNull();
  });
});
