/**
 * Firestore data model for the booking system.
 * Ported from the original FastAPI schema (events/ticket_types/slots/tickets).
 *
 * Collections:
 *   events/{eventId}        — locations (doc id = "1".."4", mirroring old event_id)
 *   ticketTypes/{id}        — ticket types, each tied to an eventId
 *   slots/{id}              — bookable time slots with capacity
 *   customers/{uid}         — registered customer profile (keyed by auth uid)
 *   tickets/{id}            — confirmed bookings (doc id = ticket id, shown in QR)
 *   admins/{uid}            — staff users with a role flag
 */

export type AdminRole = "Reception Admin" | "Ops Admin" | "Super Admin";

export type PaymentOption = "online" | "cash" | "qr" | "Free Ticket";
export type PaymentStatus = "paid" | "pending";

export interface EventDoc {
  eventId: string; // "1".."4"
  location: string; // e.g. "Bhopal"
}

export interface TicketType {
  id: string;
  typeName: string;
  eventId: string;
  durationMinutes: number;
  price: number; // selling price (GST-inclusive)
  originalPrice?: number;
  description?: string;
  offer?: string;
  note1?: string;
  note2?: string;
  note3?: string;
}

export interface Slot {
  id: string;
  eventId: string;
  slotDate: string; // "YYYY-MM-DD"
  slotTime: string; // "11:00 AM - 12:00 PM"
  maxCapacity: number;
  availableSeats: number;
}

export interface Ticket {
  id: string; // doc id, encoded in the QR code
  uid: string;
  mobile: string;
  eventId: string;
  location: string;
  ticketTypeId: string;
  typeName: string;
  slotId: string;
  slotDate: string;
  slotTime: string;
  bookingDate: string; // "YYYY-MM-DD"
  quantity: number;
  complimentaryTicket: number;
  totalAmount: number;
  gstAmount: number;
  paymentOption: PaymentOption;
  paymentStatus: PaymentStatus;
  isValid: boolean; // false after check-in
  adminId?: string | null;
}

export interface AdminDoc {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  eventId?: string | null; // assigned location (Reception Admin)
}

export interface FieldVisit {
  id: string;
  employeeName: string;
  employeeMobile: string;
  latitude: number;
  longitude: number;
  category: string; // "check-in" | "check-out"
  photoUrl: string;
  isFieldVisit: boolean;
  customerName?: string;
  customerAddress?: string;
  pincode?: string;
  notes?: string;
  timestamp: string; // ISO datetime
}
