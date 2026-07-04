"use client";

import { useUserProfile } from "@/contexts/user-profile-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, linkedTeamMember, profile } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  const role = linkedTeamMember?.role || profile.role;
  const isAdmin = role === "admin" || role === "superadmin";
  const isTeamMember = role === "team" || role === "team_member";
  const isConferenceRoute = pathname?.startsWith("/portal/admin/conference");
  const canAccess = isAdmin || (isTeamMember && isConferenceRoute);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !canAccess) {
      router.push("/portal");
    }
  }, [isLoading, isAuthenticated, canAccess, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to access admin pages.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
