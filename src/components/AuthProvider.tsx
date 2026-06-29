"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AdminDoc } from "@/lib/types";

interface AuthContextValue {
  admin: AdminDoc | null;
  loading: boolean;
  isAdmin: boolean;
  /** Returns the signed-in admin doc, or throws with a friendly message. */
  login: (email: string, password: string) => Promise<AdminDoc>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  admin: null,
  loading: true,
  isAdmin: false,
  login: async () => {
    throw new Error("not ready");
  },
  logout: async () => {},
});

async function loadAdmin(uid: string): Promise<AdminDoc | null> {
  const snap = await getDoc(doc(db, "admins", uid));
  return snap.exists() ? (snap.data() as AdminDoc) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep admin role in sync with the Firebase auth session.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdmin(await loadAdmin(user.uid));
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string): Promise<AdminDoc> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const adminDoc = await loadAdmin(cred.user.uid);
    if (!adminDoc) {
      await signOut(auth);
      throw new Error("This account is not authorised as an admin.");
    }
    setAdmin(adminDoc);
    return adminDoc;
  };

  const logout = async () => {
    await signOut(auth);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{ admin, loading, isAdmin: !!admin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
