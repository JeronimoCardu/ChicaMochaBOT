import { Message } from "@/types";

// ── Date grouping ─────────────────────────────────────────────────────────────
const TZ = "America/Argentina/Buenos_Aires";

function dayKey(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getDayLabel(date: Date): string {
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const key = dayKey(date);
  if (key === dayKey(today))     return "Hoy";
  if (key === dayKey(yesterday)) return "Ayer";

  return date.toLocaleDateString("es-AR", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type MessageDayGroup = { label: string; messages: Message[] };

export function groupMessagesByDay(messages: Message[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = [];
  for (const msg of messages) {
    const label = getDayLabel(new Date(msg.created_at));
    const last  = groups[groups.length - 1];
    if (last && last.label === label) last.messages.push(msg);
    else groups.push({ label, messages: [msg] });
  }
  return groups;
}

// ── Search normalization ──────────────────────────────────────────────────────

/**
 * Remove accents, lowercase, collapse special chars to spaces.
 *   "Jeronimo Mendez"  <- "Jerónimo Méndez"
 *   "espana"           <- "España"
 *   "54 9 2325 1890"   <- "+54 9 2325-1890"
 */
// Unicode range U+0300-U+036F = combining diacritical marks
const COMBINING_RE = new RegExp("[\\u0300-\\u036f]", "g");
const NON_ALPHANUM_RE = /[^a-z0-9\s]/g;
const MULTI_SPACE_RE  = /\s+/g;

export function normalizeText(s: string): string {
  return (s ?? "")
    .normalize("NFD")              // é  ->  e + combining-accent
    .replace(COMBINING_RE, "")     // strip diacritics
    .toLowerCase()
    .replace(NON_ALPHANUM_RE, " ") // non-alphanum  ->  space
    .replace(MULTI_SPACE_RE, " ")  // collapse
    .trim();
}

/** Keep only digits — for phone number comparison. */
export function normalizePhone(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Multi-word AND match on pre-normalized strings.
 * Every space-separated token in normalizedQuery must appear in normalizedText.
 *
 *   matchesAllWords("jeronimo mendez", "jero men")  ->  true
 *   matchesAllWords("jeronimo mendez", "jero per")  ->  false
 */
export function matchesAllWords(normalizedText: string, normalizedQuery: string): boolean {
  const words = normalizedQuery.split(" ").filter(Boolean);
  return words.length > 0 && words.every((w) => normalizedText.includes(w));
}

// ── Accent-insensitive highlight regex ────────────────────────────────────────
const ACCENT_MAP: Record<string, string> = {
  a: "[aáàâäã]",
  e: "[eéèêë]",
  i: "[iíìîï]",
  o: "[oóòôöõ]",
  u: "[uúùûü]",
  n: "[nñ]",
  c: "[cç]",
};

/**
 * Build a single capturing-group regex that matches any of the query words
 * accent-insensitively.  Used with split(): matches land at odd indices.
 *
 *   buildHighlightRegex("jero men")
 *   ->  /(j[eéèêë]r[oóòôöõ]|m[eéèêë]n)/gi
 *   ->  highlights "Jeró" and "Mén" in "Jerónimo Méndez"
 */
export function buildHighlightRegex(rawQuery: string): RegExp | null {
  const words = normalizeText(rawQuery).split(" ").filter(Boolean);
  if (!words.length) return null;

  const patterns = words.map((word) =>
    word
      .split("")
      .map((ch) => ACCENT_MAP[ch] ?? ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("")
  );

  return new RegExp(`(${patterns.join("|")})`, "gi");
}
