"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import GlassCard from "@/components/GlassCard";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/components/AuthProvider";

export interface HubItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export function AdminHub({ items }: { title?: string; items: HubItem[] }) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.replace("/admin");
  };

  return (
    <PageTransition>
      <div className="bg-black min-h-screen px-4 pb-8">
        {/* Header */}
        <div className="relative w-full flex flex-col items-center justify-center min-h-[20vh] mb-6">
          <div className="absolute top-4 left-4 text-sm font-semibold text-white opacity-50">
            Admin
          </div>
          <div className="w-40 h-auto mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/TellMe VR Centre Aankhon Dekha Logo.png" alt="Logo" />
          </div>
          <div className="absolute top-4 right-4">
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#595959] hover:bg-[#666] transition-colors text-white"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Today's bookings */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-[#2C410E] rounded-xl p-4 text-center border border-[#96FF00]">
            <h3 className="text-2xl font-bold text-white">Today&apos;s Bookings</h3>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {items.map(({ label, description, href, icon: Icon }, index) => (
            <GlassCard
              key={href + label}
              className="cursor-pointer border-transparent hover:border-[#96FF00] hover:bg-[#2C410E] transition-all duration-300 text-white"
              onClick={() => router.push(href)}
              delay={index}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4">
                  <Icon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{label}</h3>
                  <p className="text-sm">{description}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <Link
          href="/"
          className="block w-full text-center py-3 rounded-lg text-white bg-[#99160B] border border-transparent hover:border-[#96FF00] hover:bg-[#96FF00]/20 transition-all duration-300"
        >
          Switch to Customer View
        </Link>
      </div>
    </PageTransition>
  );
}
