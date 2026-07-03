"use client";

import { Ticket, Users, BarChart3 } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHub } from "@/components/AdminHub";

export default function OpsDashboard() {
  return (
    <AdminGuard allowedRoles={["Ops Admin"]}>
      <AdminHub
        items={[
          { label: "Book a ticket", description: "Book tickets for customers", href: "/location", icon: Ticket },
          { label: "View Report", description: "View and download information", href: "/report", icon: Users },
          { label: "Dashboard", description: "Quick Summaries & Visual Insights at a Glance", href: "/dashboard", icon: BarChart3 },
          { label: "Employee Attendance", description: "View and download employee attendance", href: "/attendance", icon: Users },
        ]}
      />
    </AdminGuard>
  );
}
