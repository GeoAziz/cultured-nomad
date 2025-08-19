"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function SeekerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="SEEKER">{children}</AuthGuard>;
}
