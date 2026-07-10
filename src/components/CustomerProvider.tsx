"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/** The registered customer profile, mirrored from Firestore customers/{uid}. */
export interface Customer {
  uid: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  ageGroup: string;
}

interface CustomerContextValue {
  customer: Customer | null;
  setCustomer: (c: Customer | null) => void;
  clearCustomer: () => void;
}

const CustomerContext = createContext<CustomerContextValue>({
  customer: null,
  setCustomer: () => {},
  clearCustomer: () => {},
});

const STORAGE_KEY = "customerDetails";

/**
 * The old (Vite) site used this same localStorage key on aankhondekha.com but
 * stored a different shape (`mobile_no`, no `uid`). Casting that blindly leaves
 * `uid` undefined, which Firestore rejects when the ticket is written. Only
 * accept a profile that has the fields the booking flow actually needs.
 */
function isValidCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.uid === "string" &&
    c.uid.length > 0 &&
    typeof c.mobile === "string" &&
    c.mobile.length > 0
  );
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null);

  // Hydrate from localStorage on mount, discarding anything malformed or stale.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (isValidCustomer(parsed)) setCustomerState(parsed);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setCustomer = (c: Customer | null) => {
    setCustomerState(c);
    if (c) localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const clearCustomer = () => setCustomer(null);

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, clearCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);
