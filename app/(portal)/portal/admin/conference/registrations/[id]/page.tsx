"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Ticket, CreditCard, CheckCircle2, Calendar, Trash2, Loader2 } from "lucide-react";
import type { ConferenceRegistrationDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  "checked-in": "bg-blue-100 text-blue-800",
};

const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleString();
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
};

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [registration, setRegistration] = useState<ConferenceRegistrationDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/conference/registrations/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load registration");
        setRegistration(data.data);
      } catch (error) {
        console.error("Registration detail error:", error);
        toast.error("Failed to load registration details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRegistration();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to cancel this registration?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/registrations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Registration cancelled");
      router.push("/portal/admin/conference/registrations");
    } catch (error) {
      console.error("Delete registration error:", error);
      toast.error("Failed to cancel registration");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Registration not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/registrations">Back to Registrations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/registrations">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Registration Details</h1>
          <p className="text-muted-foreground text-sm">View attendee registration and payment details</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/registrations?id=${id}`}>Edit</Link>
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl font-medium">
              {registration.firstName.charAt(0)}{registration.lastName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={`capitalize ${statusBadge[registration.status]}`}>{registration.status}</Badge>
                {registration.checkedInAt && <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" /> Checked In</Badge>}
              </div>
              <h2 className="text-xl font-bold">{registration.firstName} {registration.lastName}</h2>
              <p className="text-muted-foreground">{registration.title}</p>
              <p className="text-sm font-medium">{registration.organization}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Contact & Ticket</h3>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${registration.email}`} className="text-primary hover:underline">{registration.email}</a>
              </div>
              {registration.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{registration.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span>{registration.ticketName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Registered {formatDate(registration.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Payment</h3>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">{formatCurrency(registration.amountPaid, registration.currency)}</span>
              </div>
              {registration.discountAmount !== undefined && registration.discountAmount > 0 && (
                <p className="text-sm text-muted-foreground">Discount: {formatCurrency(registration.discountAmount, registration.currency)}</p>
              )}
              {registration.couponCode && <p className="text-sm text-muted-foreground">Coupon: {registration.couponCode}</p>}
              {registration.stripePaymentIntentId && <p className="text-sm text-muted-foreground">Payment Intent: {registration.stripePaymentIntentId}</p>}
              {registration.stripeCheckoutSessionId && <p className="text-sm text-muted-foreground">Checkout: {registration.stripeCheckoutSessionId}</p>}
            </div>
          </div>

          {(registration.dietaryRestrictions || registration.accessibilityNeeds) && (
            <>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registration.dietaryRestrictions && (
                  <div>
                    <h3 className="font-semibold mb-2">Dietary Restrictions</h3>
                    <p className="text-sm text-muted-foreground">{registration.dietaryRestrictions}</p>
                  </div>
                )}
                {registration.accessibilityNeeds && (
                  <div>
                    <h3 className="font-semibold mb-2">Accessibility Needs</h3>
                    <p className="text-sm text-muted-foreground">{registration.accessibilityNeeds}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
