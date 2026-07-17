import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "All your saved forms in one place.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
