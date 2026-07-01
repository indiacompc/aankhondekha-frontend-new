import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { gstInclusive, todayISO } from "./booking";
import { slotsForDate } from "./slots";
import type {
  EventDoc,
  FieldVisit,
  PaymentOption,
  PaymentStatus,
  Slot,
  Ticket,
  TicketType,
} from "./types";

/* ----------------------------- reads ----------------------------- */

export async function getEvents(): Promise<EventDoc[]> {
  const snap = await getDocs(query(collection(db, "events"), orderBy("eventId")));
  return snap.docs.map((d) => d.data() as EventDoc);
}

export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  const snap = await getDocs(
    query(collection(db, "ticketTypes"), where("eventId", "==", eventId)),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<TicketType, "id">) }))
    .sort((a, b) => a.price - b.price);
}

/** Parse "11:00 AM" -> minutes since midnight. */
function startMinutes(slotTime: string): number {
  const m = slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const pm = m[3].toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h * 60 + min;
}

/**
 * Available slots for an event on a date. Mirrors the old GET /slots/{date}:
 * only slots with seats left, and for non-admins on *today* hides past times.
 */
export async function getSlots(
  eventId: string,
  slotDate: string,
  isAdmin = false,
): Promise<Slot[]> {
  const snap = await getDocs(
    query(
      collection(db, "slots"),
      where("eventId", "==", eventId),
      where("slotDate", "==", slotDate),
    ),
  );
  let slots = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Slot, "id">) }))
    .filter((s) => s.availableSeats > 0);

  if (!isAdmin && slotDate === todayISO()) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    slots = slots.filter((s) => startMinutes(s.slotTime) > nowMin);
  }

  return slots.sort((a, b) => startMinutes(a.slotTime) - startMinutes(b.slotTime));
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const ref = doc(db, "tickets", id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Ticket) : null;
}

/* ----------------------------- writes ----------------------------- */

export interface BookingInput {
  uid: string;
  mobile: string;
  event: EventDoc;
  ticketType: TicketType;
  slot: Slot;
  bookingDate: string;
  quantity: number;
  complimentaryTicket: number;
  totalAmount: number;
  paymentOption: PaymentOption;
  paymentStatus: PaymentStatus;
  adminId?: string | null;
}

/**
 * Create a confirmed ticket and decrement slot capacity atomically.
 * Replaces the seat-hold + payment-verify dance with a single transaction
 * that re-reads the slot to prevent overbooking. Returns the new ticket id.
 */
export async function bookTicket(input: BookingInput): Promise<string> {
  const slotRef = doc(db, "slots", input.slot.id);
  const ticketRef = doc(collection(db, "tickets"));
  const totalRequested = input.quantity + input.complimentaryTicket;

  await runTransaction(db, async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists()) throw new Error("Slot no longer exists");
    const available = (slotSnap.data() as Slot).availableSeats;
    if (available < totalRequested) {
      throw new Error("Not enough seats available for this slot");
    }

    const ticket: Omit<Ticket, "id"> = {
      uid: input.uid,
      mobile: input.mobile,
      eventId: input.event.eventId,
      location: input.event.location,
      ticketTypeId: input.ticketType.id,
      typeName: input.ticketType.typeName,
      slotId: input.slot.id,
      slotDate: input.slot.slotDate,
      slotTime: input.slot.slotTime,
      bookingDate: input.bookingDate,
      quantity: input.quantity,
      complimentaryTicket: input.complimentaryTicket,
      totalAmount: input.totalAmount,
      gstAmount: gstInclusive(input.totalAmount),
      paymentOption: input.paymentOption,
      paymentStatus: input.paymentStatus,
      isValid: true,
      adminId: input.adminId ?? null,
    };

    tx.update(slotRef, { availableSeats: available - totalRequested });
    tx.set(ticketRef, { ...ticket, createdAt: serverTimestamp() });
  });

  return ticketRef.id;
}

/** Mark a ticket checked-in (used). Returns the ticket if it existed. */
export async function checkInTicket(id: string): Promise<Ticket | null> {
  const ticket = await getTicketById(id);
  if (!ticket) return null;
  await updateDoc(doc(db, "tickets", id), { isValid: false });
  return { ...ticket, isValid: false };
}

/* --------------------------- admin: slots --------------------------- */

/**
 * Create the standard slots for an event on a date. Idempotent: existing slots
 * (by deterministic id) are left untouched so booked capacity is preserved.
 * Returns how many were created vs. already existed.
 */
export async function createSlotsForDate(
  eventId: string,
  slotDate: string,
): Promise<{ created: number; skipped: number }> {
  const planned = slotsForDate(eventId, slotDate);
  if (planned.length === 0) return { created: 0, skipped: 0 };

  const existing = await getDocs(
    query(
      collection(db, "slots"),
      where("eventId", "==", eventId),
      where("slotDate", "==", slotDate),
    ),
  );
  const existingIds = new Set(existing.docs.map((d) => d.id));

  const toCreate = planned.filter((s) => !existingIds.has(s.id));
  const batch = writeBatch(db);
  for (const s of toCreate) {
    const { id, ...data } = s;
    batch.set(doc(db, "slots", id), data);
  }
  if (toCreate.length) await batch.commit();

  return { created: toCreate.length, skipped: planned.length - toCreate.length };
}

/* --------------------------- admin: reports --------------------------- */

/** Tickets booked within an inclusive date range (by bookingDate, "YYYY-MM-DD"). */
export async function getTicketsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Ticket[]> {
  const snap = await getDocs(
    query(
      collection(db, "tickets"),
      where("bookingDate", ">=", startDate),
      where("bookingDate", "<=", endDate),
      orderBy("bookingDate"),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ticket);
}

/* --------------------------- field visits --------------------------- */

export type FieldVisitInput = Omit<FieldVisit, "id" | "photoUrl" | "timestamp">;

/** Upload the attendance photo to Storage, then write the field-visit record. */
export async function createFieldVisit(
  input: FieldVisitInput,
  photo: File,
): Promise<string> {
  const stamp = new Date().toISOString();
  const path = `fieldVisits/${stamp.replace(/[:.]/g, "-")}-${input.employeeMobile}.jpg`;
  const snap = await uploadBytes(ref(storage, path), photo, {
    contentType: photo.type || "image/jpeg",
  });
  const photoUrl = await getDownloadURL(snap.ref);

  const docRef = await addDoc(collection(db, "fieldVisits"), {
    ...input,
    photoUrl,
    timestamp: stamp,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Field-visit records within an inclusive date range (newest first). */
export async function getFieldVisitsByDateRange(
  startDate: string,
  endDate: string,
): Promise<FieldVisit[]> {
  const snap = await getDocs(
    query(
      collection(db, "fieldVisits"),
      where("timestamp", ">=", `${startDate}T00:00:00`),
      where("timestamp", "<=", `${endDate}T23:59:59`),
      orderBy("timestamp", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FieldVisit);
}
