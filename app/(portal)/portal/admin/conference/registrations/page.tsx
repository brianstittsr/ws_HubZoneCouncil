"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Search, DollarSign, Users, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import type { ConferenceRegistrationDoc } from "@/lib/schema";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "checked-in": "bg-blue-100 text-blue-800",
};

export default function RegistrationsAdminPage() {
  const [registrations, setRegistrations] = useState<ConferenceRegistrationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchRegistrations() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/registrations");
      const json = await res.json();
      setRegistrations(json.data ?? []);
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = registrations.filter((reg) => {
    const term = search.toLowerCase();
    return (
      reg.firstName.toLowerCase().includes(term) ||
      reg.lastName.toLowerCase().includes(term) ||
      reg.email.toLowerCase().includes(term) ||
      reg.ticketName.toLowerCase().includes(term) ||
      (reg.organization || "").toLowerCase().includes(term)
    );
  });

  const totalRevenue = registrations
    .filter((r) => r.status === "confirmed" || r.status === "checked-in")
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter((r) => r.status === "confirmed" || r.status === "checked-in").length,
    pending: registrations.filter((r) => r.status === "pending").length,
    revenue: totalRevenue,
  };

  async function checkIn(id: string) {
    try {
      const res = await fetch(`/api/conference/registrations/${id}/check-in`, { method: "POST" });
      if (!res.ok) throw new Error("Check-in failed");
      toast.success("Attendee checked in");
      fetchRegistrations();
    } catch {
      toast.error("Failed to check in");
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/admin/conference">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Registrations</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-[#1e3a5f]" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Registrations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-[#c9a227]" />
            <div>
              <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Confirmed Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Attendee Registrations</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No registrations found.</p>
          ) : (
            <div className="divide-y">
              {filtered.map((reg) => (
                <div key={reg.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {reg.firstName} {reg.lastName}
                      </h3>
                      <Badge className={statusStyles[reg.status]}>{reg.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reg.email}</p>
                    {reg.organization && <p className="text-sm text-muted-foreground">{reg.organization}</p>}
                    <p className="text-sm mt-1">
                      <span className="font-medium">Ticket:</span> {reg.ticketName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Paid:</span> ${reg.amountPaid.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/portal/admin/conference/registrations/${reg.id}`}>View</Link>
                    </Button>
                    {reg.status === "confirmed" && (
                      <Button size="sm" onClick={() => checkIn(reg.id)}>
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
