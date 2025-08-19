"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MentorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="MENTOR">{children}</AuthGuard>;
}
