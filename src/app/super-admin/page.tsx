"use client";

import { QrCode, Ticket, CalendarPlus, BarChart3 } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function SuperAdminDashboard() {
  return (
    <AdminGuard allowedRoles={["Super Admin"]}>
      <AdminHub
        title="Super Admin"
        items={[
          { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
          { label: "Generate Slots", href: "/slot-generator", icon: CalendarPlus },
          { label: "Verify / Check-in Ticket", href: "/ticket-verification", icon: QrCode },
          { label: "Book a Ticket", href: "/location", icon: Ticket },
        ]}
      />
    </AdminGuard>
  );
}
