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
import { ArrowLeft, Ticket, Calendar, DollarSign, Trash2, Loader2, Pencil, CheckCircle2 } from "lucide-react";
import type { ConferenceTicketDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString();
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [ticket, setTicket] = useState<ConferenceTicketDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/conference/tickets/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load ticket");
        setTicket(data.data);
      } catch (error) {
        console.error("Ticket detail error:", error);
        toast.error("Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicket();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this ticket tier?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Ticket deleted");
      router.push("/portal/admin/conference/tickets");
    } catch (error) {
      console.error("Delete ticket error:", error);
      toast.error("Failed to delete ticket");
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

  if (!ticket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Ticket not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/tickets">Back to Tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/tickets">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Ticket Details</h1>
          <p className="text-muted-foreground text-sm">View and manage ticket tier information</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/tickets?id=${id}`}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Link>
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="capitalize">{ticket.ticketType}</Badge>
                <Badge variant={ticket.isActive ? "default" : "secondary"}>{ticket.isActive ? "On Sale" : "Inactive"}</Badge>
                <Badge variant={ticket.isPublic ? "outline" : "secondary"}>{ticket.isPublic ? "Public" : "Hidden"}</Badge>
              </div>
              <h2 className="text-xl font-bold">{ticket.name}</h2>
              <p className="text-3xl font-bold mt-2">
                {ticket.price === 0 ? "Free" : `$${ticket.price.toFixed(2)}`}
                {ticket.price > 0 && <span className="text-base font-normal text-muted-foreground"> {ticket.currency}</span>}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Ticket className="h-8 w-8" />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Details</h3>
              {ticket.description && <p className="text-sm text-muted-foreground">{ticket.description}</p>}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Sale: {formatDate(ticket.saleStartDate)} — {formatDate(ticket.saleEndDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span>Available: {ticket.availableQuantity ?? "Unlimited"} · Sold: {ticket.soldQuantity ?? 0}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Included Perks</h3>
              {ticket.perks && ticket.perks.length > 0 ? (
                <ul className="space-y-1">
                  {ticket.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> {perk}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No perks listed.</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                {ticket.includesMeals && <Badge variant="outline">Includes Meals</Badge>}
                {ticket.includesHousing && <Badge variant="outline">Includes Housing</Badge>}
                {ticket.includesRecordings && <Badge variant="outline">Includes Recordings</Badge>}
              </div>
            </div>
          </div>

          {(ticket.stripeProductId || ticket.stripePriceId) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="font-semibold">Stripe Integration</h3>
                {ticket.stripeProductId && <p className="text-sm text-muted-foreground">Product: {ticket.stripeProductId}</p>}
                {ticket.stripePriceId && <p className="text-sm text-muted-foreground">Price: {ticket.stripePriceId}</p>}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
