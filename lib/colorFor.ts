/** Deterministic name → brand-palette color, ported from interactive.js.
 * Plain utility (no "use client") so both Server and Client Components can
 * call it directly. */
export function colorFor(str: string | undefined | null): string {
  const palette = ["#0096D6", "#0369A1", "#075985", "#0E7490", "#1D4ED8"];
  let h = 0;
  const s = str || "";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
