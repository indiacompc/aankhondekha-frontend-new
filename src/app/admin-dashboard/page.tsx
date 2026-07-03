"use client";

import { Ticket } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function ReceptionDashboard() {
  return (
    <AdminGuard allowedRoles={["Reception Admin", "Ops Admin", "Super Admin"]}>
      <AdminHub
        items={[
          { label: "Book a ticket", description: "Book tickets for customers", href: "/location", icon: Ticket },
        ]}
      />
    </AdminGuard>
  );
}
