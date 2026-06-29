"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export interface HubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function AdminHub({
  title,
  items,
}: {
  title: string;
  items: HubItem[];
}) {
  const router = useRouter();
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-[22px] text-white">{title}</h1>
            {admin && (
              <p className="text-white/60 text-sm">
                {admin.name} · {admin.role}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-white/80 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="space-y-3">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href + label}
              href={href}
              className="flex items-center gap-4 bg-[#595959] hover:bg-[#666] text-white rounded-xl p-5 shadow-lg transition-colors"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#96FF00]/10 text-[#96FF00]">
                <Icon className="w-5 h-5" />
              </span>
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
