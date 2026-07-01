"use client";

import { Users, BarChart3, CalendarPlus, Ticket, QrCode } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function SuperAdminDashboard() {
  return (
    <AdminGuard allowedRoles={["Super Admin"]}>
      <AdminHub
        items={[
          { label: "View Report", description: "View and download information", href: "/dashboard", icon: Users },
          { label: "Dashboard", description: "Quick Summaries & Visual Insights at a Glance", href: "/dashboard", icon: BarChart3 },
          { label: "Add Slots", description: "Add slots for the locations", href: "/slot-generator", icon: CalendarPlus },
          { label: "Verify / Check-in", description: "Verify and check-in tickets", href: "/ticket-verification", icon: QrCode },
          { label: "Book a Ticket", description: "Book tickets for customers", href: "/location", icon: Ticket },
          { label: "Employee Attendance", description: "View and download employee attendance", href: "/attendance", icon: Users },
        ]}
      />
    </AdminGuard>
  );
}
