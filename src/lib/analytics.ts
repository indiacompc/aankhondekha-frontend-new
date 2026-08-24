/**
 * Purchase conversion tracking for the ticket booking funnel.
 *
 * The site had a complete funnel — location, date, slot, ticket type, quantity,
 * payment, confirmation — and a GA4 tag that recorded only pageviews. No
 * purchase event was ever sent, so there was no revenue figure in GA4, no
 * conversion to import into Google Ads, and therefore no way to compute cost
 * per acquisition or return on ad spend for any campaign.
 *
 * Two things are sent from the confirmation screen:
 *
 *   1. A GA4 `purchase` event. This is the standard ecommerce event and works
 *      immediately with the existing G-XYEM1V4MB3 tag — no extra setup.
 *
 *   2. Optionally, a Google Ads conversion, but only when the account is
 *      configured (see below). There is no Google Ads account referenced
 *      anywhere in this codebase, so rather than hardcode an invented ID the
 *      call no-ops until the two env vars are set.
 *
 * To turn on Google Ads conversions, set both of these and redeploy. Get them
 * from Google Ads > Tools > Conversions > (your "Purchase" action) > Tag setup:
 *
 *   NEXT_PUBLIC_ADS_CONVERSION_ID=AW-XXXXXXXXXX
 *   NEXT_PUBLIC_ADS_PURCHASE_LABEL=AbC-D_efG-h12_3-45
 */

export const ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_ADS_CONVERSION_ID;
export const ADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_ADS_PURCHASE_LABEL;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

export interface PurchaseParams {
  /** Ticket or gift-ticket document id — used as the dedupe key. */
  transactionId: string;
  /** Order value in rupees (major units, not paise). */
  value: number;
  currency?: string;
  /** Which centre the booking is for. */
  location?: string;
  /** Ticket type name, e.g. "Adult". */
  ticketType?: string;
  quantity?: number;
}

/**
 * Report a completed booking, at most once per ticket.
 *
 * The confirmation screen re-runs its data load on every mount, and users
 * refresh it or return to it from their ticket link, so the same booking would
 * otherwise be counted several times and inflate reported revenue. The
 * sessionStorage guard is keyed on the ticket id.
 */
export function trackPurchase(params: PurchaseParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!params.transactionId) return;

  const guardKey = `ad_purchase_sent_${params.transactionId}`;
  try {
    if (sessionStorage.getItem(guardKey)) return;
    sessionStorage.setItem(guardKey, "1");
  } catch {
    // sessionStorage unavailable (private mode, blocked storage). Fall through
    // and report anyway — an occasional double count is less harmful than
    // silently losing every conversion for those users.
  }

  const currency = params.currency ?? "INR";

  window.gtag("event", "purchase", {
    transaction_id: params.transactionId,
    value: params.value,
    currency,
    items: [
      {
        item_id: params.ticketType ?? "ticket",
        item_name: params.ticketType ?? "VR Experience Ticket",
        item_category: params.location,
        price: params.value,
        quantity: params.quantity ?? 1,
      },
    ],
  });

  // Google Ads conversion — only when an account has been configured.
  if (ADS_CONVERSION_ID && ADS_PURCHASE_LABEL) {
    window.gtag("event", "conversion", {
      send_to: `${ADS_CONVERSION_ID}/${ADS_PURCHASE_LABEL}`,
      transaction_id: params.transactionId,
      value: params.value,
      currency,
    });
  }
}
