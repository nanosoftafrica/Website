// wa.me needs the full international number with no leading 0 or +.
// Kenyan local numbers (07..., 01..., or 9 digits) get the 254 code.
export function waNumber(phone?: string | null, fallback = "254734818350"): string {
  let d = (phone || "").replace(/\D/g, "");
  if (!d) return fallback;
  if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (d.length === 9 && /^[17]/.test(d)) d = "254" + d;
  return d;
}
