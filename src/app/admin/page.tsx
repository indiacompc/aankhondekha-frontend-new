"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { adminHome } from "@/components/AdminGuard";

const inputClass =
  "w-full pl-10 pr-3 py-2 bg-[#595959] text-white placeholder:text-white/70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] focus:border-transparent outline-none";

export default function AdminLogin() {
  const router = useRouter();
  const { admin, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → go to role home.
  useEffect(() => {
    if (!loading && admin) router.replace(adminHome(admin.role));
  }, [admin, loading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const a = await login(email.trim(), password);
      toast.success(`Welcome, ${a.name}`);
      router.replace(adminHome(a.role));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Login failed. Check credentials.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#595959] rounded-xl p-6 shadow-lg"
      >
        <div className="flex flex-col items-center mb-6 text-white">
          <ShieldCheck className="w-10 h-10 text-[#96FF00]" />
          <h1 className="text-xl font-bold mt-2">Admin Login</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Email"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#99160B] text-white font-medium disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
