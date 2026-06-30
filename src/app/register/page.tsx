"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Phone,
  User,
  Lock,
  ArrowLeft,
  ArrowRight,
  Mail,
  Users,
  Calendar,
} from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toE164 } from "@/lib/phone";
import { useCustomer } from "@/components/CustomerProvider";

const GENDERS = ["Male", "Female", "Other"];
const AGE_GROUPS = ["Under 18", "18–25", "26–40", "41–60", "60+"];

const inputClass =
  "w-full pl-10 pr-3 py-2 bg-[#595959] text-white placeholder:text-white/70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#96FF00] focus:border-transparent outline-none";

export default function RegisterPage() {
  const router = useRouter();
  const { setCustomer } = useCustomer();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const getRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return recaptchaRef.current;
  };

  const handleSendOtp = async () => {
    if (!name || !email || !gender || !ageGroup) {
      toast.error("Please fill in all fields first");
      return;
    }
    const e164 = toE164(phone);
    if (!e164) {
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
      console.error("Error sending OTP:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to send OTP. Try again.",
      );
      // Reset the verifier so the next attempt gets a fresh challenge.
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    if (!confirmationRef.current) {
      toast.error("Please request an OTP first");
      return;
    }

    setLoading(true);
    try {
      const cred = await confirmationRef.current.confirm(otp);
      const uid = cred.user.uid;
      const e164 = cred.user.phoneNumber ?? toE164(phone) ?? phone;

      const customer = {
        uid,
        name,
        email,
        mobile: e164,
        gender,
        ageGroup,
      };

      // Persist the profile alongside the auth user.
      await setDoc(
        doc(db, "customers", uid),
        { ...customer, createdAt: serverTimestamp() },
        { merge: true },
      );

      setCustomer(customer);
      toast.success("Registered successfully");
      router.push("/ticket-type");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      toast.error(
        err instanceof Error ? "Invalid or expired OTP" : "Verification failed",
      );
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
          <h1 className="ml-5 font-bold text-[24px] text-white">Register</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#595959] backdrop-blur-sm rounded-xl p-6 shadow-lg"
        >
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter full name"
                  disabled={otpSent}
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-white mb-1">
                Gender
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${inputClass} appearance-none`}
                  disabled={otpSent}
                  required
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g} className="text-black">
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label htmlFor="ageGroup" className="block text-sm font-medium text-white mb-1">
                Age Group
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className={`${inputClass} appearance-none`}
                  disabled={otpSent}
                  required
                >
                  <option value="" disabled>
                    Select age group
                  </option>
                  {AGE_GROUPS.map((a) => (
                    <option key={a} value={a} className="text-black">
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Enter email"
                  disabled={otpSent}
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 h-4 w-4" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="Enter mobile number"
                  disabled={otpSent}
                  required
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="mt-4 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium flex items-center justify-center disabled:opacity-60"
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
                      onChange={(e) => setOtp(e.target.value)}
                      className={inputClass}
                      placeholder="Enter OTP"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full py-3 rounded-xl bg-[#99160B] text-white font-medium disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify OTP"}
                </button>
              </>
            )}
          </form>

          <p className="text-center text-white/70 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#96FF00] hover:underline">
              Login
            </Link>
          </p>
        </motion.div>

        {/* Invisible reCAPTCHA mount point (required by Firebase Phone Auth) */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
