"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { EventDoc, Slot, TicketType } from "@/lib/types";

interface BookingState {
  event: EventDoc | null;
  ticketType: TicketType | null;
  isGift: boolean;
  quantity: number;
  complimentaryTickets: number;
  hasTourGuide: boolean;
  date: string | null;
  slot: Slot | null;
}

interface BookingContextValue extends BookingState {
  setEvent: (e: EventDoc | null) => void;
  setTicketType: (t: TicketType | null) => void;
  setIsGift: (v: boolean) => void;
  setQuantity: (n: number) => void;
  setComplimentaryTickets: (n: number) => void;
  setHasTourGuide: (v: boolean) => void;
  setDate: (d: string | null) => void;
  setSlot: (s: Slot | null) => void;
  clearBooking: () => void;
}

const initial: BookingState = {
  event: null,
  ticketType: null,
  isGift: false,
  quantity: 1,
  complimentaryTickets: 0,
  hasTourGuide: false,
  date: null,
  slot: null,
};

const BookingContext = createContext<BookingContextValue>({
  ...initial,
  setEvent: () => {},
  setTicketType: () => {},
  setIsGift: () => {},
  setQuantity: () => {},
  setComplimentaryTickets: () => {},
  setHasTourGuide: () => {},
  setDate: () => {},
  setSlot: () => {},
  clearBooking: () => {},
});

const STORAGE_KEY = "bookingState";

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initial);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState({ ...initial, ...JSON.parse(stored) });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const update = (patch: Partial<BookingState>) =>
    setState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

  const value: BookingContextValue = {
    ...state,
    setEvent: (event) => update({ event }),
    setTicketType: (ticketType) => update({ ticketType }),
    setIsGift: (isGift) => update({ isGift }),
    setQuantity: (quantity) => update({ quantity }),
    setComplimentaryTickets: (complimentaryTickets) =>
      update({ complimentaryTickets }),
    setHasTourGuide: (hasTourGuide) => update({ hasTourGuide }),
    setDate: (date) => update({ date }),
    setSlot: (slot) => update({ slot }),
    clearBooking: () => {
      localStorage.removeItem(STORAGE_KEY);
      setState(initial);
    },
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
