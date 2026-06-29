"use client";

import { QrCode, Ticket } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function ReceptionDashboard() {
  return (
    <AdminGuard allowedRoles={["Reception Admin", "Ops Admin", "Super Admin"]}>
      <AdminHub
        title="Reception"
        items={[
          { label: "Verify / Check-in Ticket", href: "/ticket-verification", icon: QrCode },
          { label: "Book a Ticket", href: "/location", icon: Ticket },
        ]}
      />
    </AdminGuard>
  );
}
