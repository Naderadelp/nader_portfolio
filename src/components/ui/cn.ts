/** Minimal class-name joiner. No dependency, no merge semantics — order wins. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
