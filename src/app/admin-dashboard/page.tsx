"use client";

import { QrCode, Ticket } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function ReceptionDashboard() {
  return (
    <AdminGuard allowedRoles={["Reception Admin", "Ops Admin", "Super Admin"]}>
      <AdminHub
        items={[
          { label: "Verify / Check-in", description: "Verify and check-in tickets", href: "/ticket-verification", icon: QrCode },
          { label: "Book a ticket", description: "Book tickets for customers", href: "/location", icon: Ticket },
        ]}
      />
    </AdminGuard>
  );
}
