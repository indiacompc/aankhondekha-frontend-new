import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Server-side messaging: WhatsApp (PINBOT) + SMS (smsstriker).
 * Ported from the old FastAPI backend (app/routes/wa.py, app/utils/sms.py).
 *
 * Credentials default to the original account values but can be overridden with
 * env vars on Vercel (PINBOT_PHONE_ID, PINBOT_API_KEY, SMSSTRIKER_USERNAME,
 * SMSSTRIKER_PASSWORD, SMSSTRIKER_FROM).
 */
const PINBOT_PHONE_ID = process.env.PINBOT_PHONE_ID || "291252884082391";
const PINBOT_API_KEY = process.env.PINBOT_API_KEY || "524bdd2b-2e44-11ef-b1d4-02c8a5e042bd";

const SMS = {
  username: process.env.SMSSTRIKER_USERNAME || "indiacomtrans",
  password: process.env.SMSSTRIKER_PASSWORD || "wZSQs9iJv",
  from: process.env.SMSSTRIKER_FROM || "YTELME",
};

/** Normalise any Indian number to "91XXXXXXXXXX" (no +), or null if invalid. */
function toMsisdn(mobile: string): string | null {
  const digits = (mobile || "").replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

async function sendWhatsApp(to: string, template: string, params: string[]): Promise<boolean> {
  try {
    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",
      template: {
        language: { code: "en" },
        name: template,
        components: params.length
          ? [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }]
          : [],
      },
    };
    const res = await fetch(`https://partnersv1.pinbot.ai/v3/${PINBOT_PHONE_ID}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: PINBOT_API_KEY },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (err) {
    console.error("WhatsApp send failed:", err);
    return false;
  }
}

async function sendSms(to: string, msg: string, templateId: string): Promise<boolean> {
  try {
    const url = new URL("https://www.smsstriker.com/API/sms.php");
    url.search = new URLSearchParams({
      username: SMS.username,
      password: SMS.password,
      from: SMS.from,
      to,
      msg,
      type: "1",
      template_id: templateId,
    }).toString();
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    return text.includes("Messages has been sent");
  } catch (err) {
    console.error("SMS send failed:", err);
    return false;
  }
}

export async function POST(req: Request) {
  let payload: {
    type?: "booking" | "gift" | "welcome" | "thankyou";
    mobile?: string;
    date?: string;
    time?: string;
    name?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, mobile = "", date = "", time = "", name = "" } = payload;
  const to = toMsisdn(mobile);
  if (!type || !to) {
    return NextResponse.json({ error: "type and a valid mobile are required" }, { status: 400 });
  }

  let whatsapp = false;
  let sms = false;

  switch (type) {
    case "booking": {
      const dateTime = `${date} at ${time}`;
      [whatsapp, sms] = await Promise.all([
        sendWhatsApp(to, "ad_booking", [dateTime, " https://www.aankhondekha.com/profile"]),
        sendSms(
          to,
          `Booking details AD VR center - ${dateTime}. Please arrive 5 min early. Aakhon Dekha by TellMe Digi!`,
          "1707174584153621523",
        ),
      ]);
      break;
    }
    case "gift": {
      [whatsapp, sms] = await Promise.all([
        sendWhatsApp(to, "ad_gift", [name]),
        sendSms(
          to,
          `${name} has gifted you a ticket on on http://aankhondekha.com/ Register to avail, It's valid for 90 days, experience it soon! -Aakhon Dekha by TellMe!`,
          "1707174366242153754",
        ),
      ]);
      break;
    }
    case "welcome": {
      [whatsapp, sms] = await Promise.all([
        sendWhatsApp(to, "ad_welcome", []),
        sendSms(
          to,
          "Welcome to Aakhon Dekha by TellMe website now you can Login and book your ticket on our website www.aankhondekha.com",
          "1707174410789872780",
        ),
      ]);
      break;
    }
    case "thankyou": {
      [whatsapp, sms] = await Promise.all([
        sendWhatsApp(to, "ad_thankyou", []),
        sendSms(
          to,
          "Thank you for your visit at Aakhon Dekha, hope you had a great experience. We will keep you updated on new content. Stay tune! Aakhon Dekha by TellMe!",
          "1707174426339027856",
        ),
      ]);
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, whatsapp, sms });
}
