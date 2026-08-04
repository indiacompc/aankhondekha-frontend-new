/**
 * Slot generation patterns per event (15-min slots).
 *   Orchha (1):        08:00–19:30, cap 6   (open every day, no closures)
 *   MPT Boat Club (3): 16:00–20:00, cap 10  (shut on the dates in closures.json)
 *
 * Closure dates live in `closures.json` so the app and the admin scripts (.mjs)
 * read one source. Regenerate it from India_2026_Special_Days_Holidays.xlsx
 * when the holiday list changes.
 */
import closuresJson from "./closures.json";

export interface SlotPattern {
  startMin: number;
  endMin: number;
  intervalMin: number;
  capacity: number;
}

export const SLOT_PATTERNS: Record<string, SlotPattern> = {
  "1": { startMin: 8 * 60, endMin: 19 * 60 + 30, intervalMin: 15, capacity: 6 },
  "3": { startMin: 16 * 60, endMin: 20 * 60, intervalMin: 15, capacity: 10 },
};

/** eventId -> { "YYYY-MM-DD": reason }. Events absent here never close. */
export const CLOSURES: Record<string, Record<string, string>> = closuresJson;

/** Why the event is shut on that date, or null when it is open. */
export function closureReason(eventId: string, slotDate: string): string | null {
  return CLOSURES[eventId]?.[slotDate] ?? null;
}

export function isClosed(eventId: string, slotDate: string): boolean {
  return closureReason(eventId, slotDate) !== null;
}

export function fmtTime(minutes: number): string {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export interface GeneratedSlot {
  id: string; // deterministic: `${eventId}_${date}_${startMin}`
  eventId: string;
  slotDate: string;
  slotTime: string;
  maxCapacity: number;
  availableSeats: number;
}

/** All slots a given event would have on a date, per its pattern. Empty when closed. */
export function slotsForDate(eventId: string, slotDate: string): GeneratedSlot[] {
  const p = SLOT_PATTERNS[eventId];
  if (!p || isClosed(eventId, slotDate)) return [];
  const out: GeneratedSlot[] = [];
  for (let t = p.startMin; t < p.endMin; t += p.intervalMin) {
    out.push({
      id: `${eventId}_${slotDate}_${t}`,
      eventId,
      slotDate,
      slotTime: `${fmtTime(t)} - ${fmtTime(t + p.intervalMin)}`,
      maxCapacity: p.capacity,
      availableSeats: p.capacity,
    });
  }
  return out;
}
