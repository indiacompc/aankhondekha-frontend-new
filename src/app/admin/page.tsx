"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { adminHome } from "@/components/AdminGuard";

const inputClass =
  "w-full pl-10 pr-10 py-2 bg-[#595959] text-white placeholder:text-white/70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] focus:border-transparent outline-none";

// Staff log in with their Admin ID (e.g. "MP04201"); the migrated accounts use
// <id>@aankhondekha.local as the Firebase email. A full email (with "@") is
// used as-is, so the admin@aankhondekha.com super admin still works.
const ADMIN_EMAIL_DOMAIN = "aankhondekha.local";
function resolveAdminEmail(input: string): string {
  const raw = input.trim();
  return (raw.includes("@") ? raw : `${raw}@${ADMIN_EMAIL_DOMAIN}`).toLowerCase();
}

export default function AdminLogin() {
  const router = useRouter();
  const { admin, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && admin) router.replace(adminHome(admin.role));
  }, [admin, loading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const a = await login(resolveAdminEmail(email), password);
      toast.success("✅ Welcome, Admin!");
      router.replace(adminHome(a.role));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Login failed. Check credentials.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        {/* Top: back + centered logo */}
        <div className="flex items-center justify-between mb-4 relative">
          <button
            onClick={() => router.push("/location")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md absolute left-0"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-grow flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/TellMe VR Centre Aankhon Dekha Logo.png"
              alt="Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#595959] backdrop-blur-sm rounded-xl p-6 shadow-lg"
        >
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Admin ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <input
                  id="email"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Enter your Admin ID"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#99160B] text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition duration-300 disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Login"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
