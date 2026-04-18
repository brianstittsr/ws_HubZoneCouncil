"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import { ReferralForm } from "@/components/zenthium/ReferralForm";
import { useUserProfile } from "@/contexts/user-profile-context";

export default function NewZenthiumReferralPage() {
  const { profile } = useUserProfile();

  const userId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("svp_firebase_uid") ?? profile.email ?? "anonymous"
      : profile.email ?? "anonymous";

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/admin/zenthium-referrals">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Submit New Site Referral</h1>
              <p className="text-sm text-muted-foreground">Submit a data center site to Zenthium for evaluation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width form */}
      <ReferralForm userId={userId} />
    </div>
  );
}
