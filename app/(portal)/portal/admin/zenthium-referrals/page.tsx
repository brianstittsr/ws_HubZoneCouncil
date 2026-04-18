"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Database,
  ClipboardList,
  Clock,
  CheckCircle2,
  CalendarClock,
  Search,
} from "lucide-react";
import { ReferralTable, type ReferralRow } from "@/components/zenthium/ReferralTable";
import type { ZenthiumReferralStatus } from "@/types/zenthium";

const ALL_STATUSES: ZenthiumReferralStatus[] = [
  "Submitted",
  "Under Review",
  "Screening Complete",
  "Follow-Up Requested",
  "Meeting Scheduled",
  "Accepted",
  "Declined",
  "Closed",
];

export default function ZenthiumDashboardPage() {
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/zenthium/referrals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch Zenthium referrals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const filtered = referrals.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.propertyName.toLowerCase().includes(q) ||
      r.address.city.toLowerCase().includes(q) ||
      r.address.state.toLowerCase().includes(q)
    );
  });

  const total = referrals.length;
  const active = referrals.filter((r) =>
    ["Submitted", "Under Review", "Screening Complete", "Follow-Up Requested"].includes(r.status)
  ).length;
  const underReview = referrals.filter((r) => r.status === "Under Review").length;
  const meetingsScheduled = referrals.filter((r) => r.status === "Meeting Scheduled").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Zenthium DC Referral Portal</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-14">
            Manage data center site referrals submitted to Zenthium
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/zenthium-referrals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Referral
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <ClipboardList className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Search className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <CalendarClock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meetings Scheduled</p>
                <p className="text-2xl font-bold">{meetingsScheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Referrals</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, property, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ReferralTable referrals={filtered} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
