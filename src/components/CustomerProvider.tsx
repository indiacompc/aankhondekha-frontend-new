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

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomerState(JSON.parse(stored) as Customer);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
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
