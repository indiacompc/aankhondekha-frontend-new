/**
 * Booking business rules, ported from the original frontend.
 *  - GST is 18% *inclusive* of the displayed price.
 *  - Complimentary tickets: buy 4 get 1 free  -> floor(qty / 4).
 *  - Free 30-min tour guide: event 2 (Bhopal) when qty >= 10.
 *  - Max quantity per booking varies by event.
 */

export const GST_RATE = 0.18;

/**
 * Pricing model (matches the original app):
 *   ticket `price` is the PRE-GST base. 18% GST is added on top.
 *   subtotal = price × qty · taxes = subtotal × 18% · total = subtotal + taxes.
 */

/** GST portion of a GST-inclusive total: total * 18/118 (== subtotal × 18%). */
export function gstInclusive(total: number): number {
  return Math.round(((total * GST_RATE) / (1 + GST_RATE)) * 100) / 100;
}

/** Per-ticket price including 18% GST (used for the struck-through comparison). */
export function withGst(price: number): number {
  return Math.round(price * (1 + GST_RATE) * 100) / 100;
}

export function subtotalFor(price: number, quantity: number): number {
  return Math.round(price * quantity * 100) / 100;
}

/** 18% tax on a subtotal. */
export function taxesFor(subtotal: number): number {
  return Math.round(subtotal * GST_RATE);
}

export function complimentaryFor(quantity: number): number {
  return Math.floor(quantity / 4);
}

export function maxQuantityFor(eventId: string): number {
  if (eventId === "1") return 5; // Orchha
  if (eventId === "3") return 8; // Bhopal Boat Club
  return 16;
}

export function hasTourGuide(eventId: string, quantity: number): boolean {
  return eventId === "2" && quantity >= 10;
}

/** Total payable = (price × qty) + 18% GST, rounded. */
export function totalFor(price: number, quantity: number): number {
  const subtotal = price * quantity;
  return Math.round(subtotal + subtotal * GST_RATE);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
