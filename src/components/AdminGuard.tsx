"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import type { AdminRole } from "@/lib/types";

/**
 * Gates admin pages by role. Redirects to /admin if not signed in, or to the
 * admin's own home if their role isn't allowed here.
 */
export function AdminGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: AdminRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { admin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!admin) {
      router.replace("/admin");
    } else if (!allowedRoles.includes(admin.role)) {
      router.replace(adminHome(admin.role));
    }
  }, [admin, loading, allowedRoles, router]);

  if (loading || !admin || !allowedRoles.includes(admin.role)) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white/60">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}

export function adminHome(role: AdminRole): string {
  if (role === "Super Admin") return "/super-admin";
  if (role === "Ops Admin") return "/admin-ops";
  return "/admin-dashboard";
}
