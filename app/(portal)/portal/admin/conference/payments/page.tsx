"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ArrowLeft, DollarSign, CreditCard, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { ConferenceRegistrationDoc } from "@/lib/schema";

export default function PaymentsAdminPage() {
  const [registrations, setRegistrations] = useState<ConferenceRegistrationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/registrations");
      const json = await res.json();
      setRegistrations(json.data ?? []);
    } catch {
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const paidRegistrations = registrations.filter(
    (r) => r.status === "confirmed" || r.status === "checked-in"
  );
  const totalRevenue = paidRegistrations.reduce((sum, r) => sum + r.amountPaid, 0);
  const pendingPayments = registrations.filter((r) => r.status === "pending").length;

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/admin/conference">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Payments</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-[#c9a227]" />
            <div>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{paidRegistrations.length}</p>
              <p className="text-xs text-muted-foreground">Paid Registrations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{pendingPayments}</p>
              <p className="text-xs text-muted-foreground">Pending Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : paidRegistrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No confirmed payments yet.</p>
          ) : (
            <div className="divide-y">
              {paidRegistrations.map((reg) => (
                <div key={reg.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {reg.firstName} {reg.lastName}
                      </h3>
                      <Badge className="bg-green-100 text-green-800">{reg.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reg.email}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Ticket:</span> {reg.ticketName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#c9a227]">${reg.amountPaid.toFixed(2)}</p>
                    {reg.stripePaymentIntentId && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {reg.stripePaymentIntentId}
                      </p>
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
