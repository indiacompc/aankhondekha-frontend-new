/**
 * Fire-and-forget client helper to trigger WhatsApp + SMS via /api/notify.
 * Never throws — messaging failures must not break the booking flow.
 */
export type NotifyPayload =
  | { type: "booking"; mobile: string; date: string; time: string }
  | { type: "gift"; mobile: string; name: string }
  | { type: "welcome"; mobile: string }
  | { type: "thankyou"; mobile: string };

export function notify(payload: NotifyPayload): void {
  try {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
