"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function TechieDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="TECHIE">{children}</AuthGuard>;
}
