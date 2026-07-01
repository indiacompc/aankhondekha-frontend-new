"use client";

import { QrCode, Ticket, BarChart3, Users } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function OpsDashboard() {
  return (
    <AdminGuard allowedRoles={["Ops Admin"]}>
      <AdminHub
        title="Operations"
        items={[
          { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
          { label: "Attendance", href: "/attendance", icon: Users },
          { label: "Book a Ticket", href: "/location", icon: Ticket },
          { label: "Verify / Check-in Ticket", href: "/ticket-verification", icon: QrCode },
        ]}
      />
    </AdminGuard>
  );
}
