"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  return {
    session,
    user,
    role: user?.role as string | undefined,
    isAuthenticated: !!session?.user,
    isGuardian: user?.role === "GUARDIAN",
    isCaregiver: user?.role === "CAREGIVER",
    isLoading: status === "loading",
  };
}
