"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Phone, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toE164, digitsOnly, isValidMobile } from "@/lib/phone";
import { useCustomer, type Customer } from "@/components/CustomerProvider";
import { useBooking } from "@/components/BookingProvider";

const inputClass =
  "w-full pl-10 pr-3 py-2 bg-[#595959] text-white placeholder:text-white/70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] focus:border-transparent outline-none";

export default function LoginPage() {
  const router = useRouter();
  const { setCustomer } = useCustomer();
  const { event } = useBooking();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const resetRecaptcha = () => {
    try {
      recaptchaRef.current?.clear();
    } catch {
      /* ignore */
    }
    recaptchaRef.current = null;
    const el = document.getElementById("recaptcha-login");
    if (el) el.innerHTML = "";
  };

  const getRecaptcha = () => {
    if (!recaptchaRef.current) {
      const el = document.getElementById("recaptcha-login");
      if (el) el.innerHTML = "";
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-login", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  };

  useEffect(() => resetRecaptcha, []);

  const phoneValid = isValidMobile(phone);

  const sendOtp = async () => {
    const e164 = toE164(phone);
    if (!phoneValid || !e164) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      confirmationRef.current = await signInWithPhoneNumber(
        auth,
        e164,
        getRecaptcha(),
      );
      toast.success(`OTP sent to ${e164}`);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationRef.current) {
      toast.error("Please request and enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      const snap = await getDoc(doc(db, "customers", cred.user.uid));
      if (!snap.exists()) {
        // Authenticated but never registered a profile.
        await signOut(auth);
        toast.error("No account found. Please register first.");
        router.push("/register");
        return;
      }
      // Stamp the uid from the auth session; older/migrated docs don't store it.
      setCustomer({ ...(snap.data() as Customer), uid: cred.user.uid });
      toast.success("Logged in");
      router.push(event ? "/ticket-type" : "/");
    } catch (err) {
      console.error(err);
      toast.error("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md"
            aria-label="Go home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-5 font-bold text-[24px] text-white">Login</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#595959] rounded-xl p-6 shadow-lg"
        >
          <form onSubmit={verify} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value, 10))}
                  className={inputClass}
                  placeholder="10-digit mobile number"
                  disabled={otpSent}
                  required
                />
              </div>
              {phone && !phoneValid && (
                <p className="text-red-300 text-xs mt-1">
                  Enter a valid 10-digit mobile number
                </p>
              )}
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading || !phoneValid}
                className="mt-2 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send OTP"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            ) : (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-white mb-1">
                    OTP Verification
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(digitsOnly(e.target.value, 6))}
                      className={inputClass}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="mt-2 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying…" : "Verify & Login"}
                </button>
              </>
            )}
          </form>

          <p className="text-center text-white/70 text-sm mt-4">
            New here?{" "}
            <Link href="/register" className="text-[#96FF00] hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>

        {/* Invisible reCAPTCHA mount point (required by Firebase Phone Auth) */}
        <div id="recaptcha-login" />
      </div>
    </div>
  );
}
