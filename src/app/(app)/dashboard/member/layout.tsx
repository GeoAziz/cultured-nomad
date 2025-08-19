"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="MEMBER">{children}</AuthGuard>;
}
