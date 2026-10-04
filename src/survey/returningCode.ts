// Random returning code (see docs/DESIGN.md §6). Generated in the browser and never
// derived from anything about the person. The server only stores a hash of it.

// No 0/O, 1/I/L or U, so the code is easy to read and type.
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const GROUPS = 3;
const GROUP_LENGTH = 4; // 12 chars × log2(30) ≈ 59 bits

export function generateCode(): string {
  const bytes = new Uint8Array(GROUPS * GROUP_LENGTH);
  const chars: string[] = [];
  while (chars.length < bytes.length) {
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      // Rejection sampling avoids modulo bias (240 = 8 × 30).
      if (b < 240 && chars.length < GROUPS * GROUP_LENGTH) chars.push(ALPHABET[b % ALPHABET.length]);
    }
  }
  const groups = [];
  for (let i = 0; i < GROUPS; i++) groups.push(chars.slice(i * GROUP_LENGTH, (i + 1) * GROUP_LENGTH).join(""));
  return groups.join("-");
}

/** Uppercases and strips separators. Returns null if it is not a valid code. */
export function normalizeCode(input: string): string | null {
  const raw = input.toUpperCase().replace(/[\s-]/g, "");
  if (raw.length !== GROUPS * GROUP_LENGTH) return null;
  for (const ch of raw) if (!ALPHABET.includes(ch)) return null;
  return raw;
}

export function formatCode(normalized: string): string {
  return normalized.match(new RegExp(`.{${GROUP_LENGTH}}`, "g"))!.join("-");
}
