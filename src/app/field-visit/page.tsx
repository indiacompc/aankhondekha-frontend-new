"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { signInAnonymously } from "firebase/auth";
import { toast } from "sonner";
import { Camera, MapPin, CheckCircle, Building2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { EMPLOYEES } from "@/lib/employees";
import { createFieldVisit } from "@/lib/db";
import { digitsOnly } from "@/lib/phone";

const input =
  "w-full px-3 py-2 bg-[#2a2a2a] text-white placeholder-gray-400 border border-cyan-500/30 rounded-lg outline-none focus:border-cyan-400";

export default function FieldVisitPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeMobile, setEmployeeMobile] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("Location not captured");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  const [fieldVisit, setFieldVisit] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const login = () => {
    const cred = EMPLOYEES[username];
    if (cred && cred.password === password) {
      setLoggedIn(true);
      setEmployeeName(username);
      setEmployeeMobile(cred.mobile);
      toast.success("Login successful!");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationStatus("Location captured successfully ✅");
        toast.success("Location captured!");
      },
      () => toast.error("Unable to capture location. Enable location services."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      setPhoto(compressed);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(compressed);
    } catch {
      toast.error("Failed to process image.");
    }
  };

  const submit = async () => {
    if (!latitude || !longitude) return toast.error("Please capture your location.");
    if (!photo) return toast.error("Please take a photo.");
    if (!category) return toast.error("Please select Check-In or Check-Out.");
    if (fieldVisit) {
      if (!customerName || !customerAddress || !pincode)
        return toast.error("Fill all customer details for the field visit.");
      if (!/^\d{6}$/.test(pincode))
        return toast.error("Enter a valid 6-digit pincode.");
    }

    setSubmitting(true);
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      await createFieldVisit(
        {
          employeeName,
          employeeMobile,
          latitude,
          longitude,
          category,
          isFieldVisit: fieldVisit,
          ...(fieldVisit
            ? { customerName, customerAddress, pincode, notes }
            : {}),
        },
        photo,
      );
      toast.success("Attendance marked successfully! ✅");
      setPhoto(null);
      setPreview(null);
      setLatitude(null);
      setLongitude(null);
      setLocationStatus("Location not captured");
      setCategory("");
      setFieldVisit(false);
      setCustomerName("");
      setCustomerAddress("");
      setPincode("");
      setNotes("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-cyan-500/30 rounded-xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Employee Login
          </h1>
          <div className="space-y-3">
            <input
              className={input}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className={input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <button
              onClick={login}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#99160B] to-red-700 rounded-xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-7 w-7" />
            <div>
              <p className="font-bold text-lg">{employeeName}</p>
              <p className="text-sm text-white/80">{employeeMobile}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setLoggedIn(false);
              setUsername("");
              setPassword("");
            }}
            className="border border-white/30 rounded-lg px-3 py-1 text-sm hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {/* Location */}
        <div className="bg-[#1a1a1a] border border-cyan-500/30 rounded-xl p-5">
          <p className="text-white font-semibold flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-cyan-400" /> Location (Required)
          </p>
          <button
            onClick={captureLocation}
            disabled={latitude !== null}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold disabled:opacity-70"
          >
            {latitude && longitude ? "Location Captured ✅" : "Capture Location"}
          </button>
          <p className={`text-sm mt-2 ${latitude ? "text-green-400" : "text-gray-400"}`}>
            {locationStatus}
          </p>
        </div>

        {/* Photo */}
        <div className="bg-[#1a1a1a] border border-cyan-500/30 rounded-xl p-5">
          <p className="text-white font-semibold flex items-center gap-2 mb-3">
            <Camera className="h-5 w-5 text-cyan-400" /> Photo (Required)
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhoto}
            className="block w-full text-white text-sm file:bg-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
          />
          {preview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt="Preview"
              className="mt-4 w-full max-w-sm mx-auto rounded-lg border border-cyan-500/30"
            />
          )}
        </div>

        {/* Attendance type */}
        <div className="bg-[#1a1a1a] border border-cyan-500/30 rounded-xl p-4">
          <p className="text-white mb-3 font-semibold">Select Attendance Type</p>
          <div className="flex space-x-4">
            <button
              onClick={() => setCategory("check-in")}
              className={`flex-1 py-3 font-bold rounded-lg border ${
                category === "check-in"
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-[#2a2a2a] text-gray-300 border-cyan-500/30"
              }`}
            >
              Check-In
            </button>
            <button
              onClick={() => setCategory("check-out")}
              className={`flex-1 py-3 font-bold rounded-lg border ${
                category === "check-out"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-[#2a2a2a] text-gray-300 border-cyan-500/30"
              }`}
            >
              Check-Out
            </button>
          </div>
        </div>

        {/* Field visit */}
        <div className="bg-[#1a1a1a] border border-cyan-500/30 rounded-xl p-5">
          <p className="text-white font-semibold flex items-center gap-2 mb-3">
            <Building2 className="h-5 w-5 text-cyan-400" /> Field Visit (Optional)
          </p>
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={fieldVisit}
              onChange={(e) => setFieldVisit(e.target.checked)}
              className="w-4 h-4 accent-cyan-500"
            />
            I am on a field visit
          </label>

          {fieldVisit && (
            <div className="space-y-3 mt-4 p-4 border border-cyan-500/20 rounded-lg bg-[#2a2a2a]">
              <input
                className={input}
                placeholder="Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <textarea
                className={`${input} min-h-[70px]`}
                placeholder="Customer Address *"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
              <input
                className={input}
                placeholder="Pin Code (6 digits) *"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(digitsOnly(e.target.value, 6))}
              />
              <textarea
                className={`${input} min-h-[70px]`}
                placeholder="Notes (optional) — customer mobile / visit purpose"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={submitting || !latitude || !photo || !category}
          className="w-full py-4 rounded-xl bg-white text-[#99160B] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          {submitting ? "Marking Attendance…" : "Mark Attendance"}
        </button>
      </div>
    </div>
  );
}
