/**
 * Format a mobile number to E.164 for Firebase Phone Auth.
 * Indian default (+91) for 10-digit input; leaves +-prefixed input as-is.
 * Returns null if it can't produce a plausible number.
 */
export function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/[^\d]/g, "");
    return digits.length >= 11 ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return null;
}
