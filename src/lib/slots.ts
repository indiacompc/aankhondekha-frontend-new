/**
 * Slot generation patterns per event. Derived from the real production data:
 * both locations run 15-min slots from 09:00 to 22:00 (52 slots/day).
 *   Orchha (1):        15-min, 09:00–22:00, cap 6
 *   MPT Boat Club (3): 15-min, 09:00–22:00, cap 10
 */

export interface SlotPattern {
  startMin: number;
  endMin: number;
  intervalMin: number;
  capacity: number;
}

export const SLOT_PATTERNS: Record<string, SlotPattern> = {
  "1": { startMin: 9 * 60, endMin: 22 * 60, intervalMin: 15, capacity: 6 },
  "3": { startMin: 9 * 60, endMin: 22 * 60, intervalMin: 15, capacity: 10 },
};

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

/** All slots a given event would have on a date, per its pattern. */
export function slotsForDate(eventId: string, slotDate: string): GeneratedSlot[] {
  const p = SLOT_PATTERNS[eventId];
  if (!p) return [];
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
