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
import { ArrowLeft, Mail, Phone, Globe, Building2, Loader2, Trash2 } from "lucide-react";
import type { ConferenceSponsorRequestDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  negotiating: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleString();
};

export default function SponsorRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [request, setRequest] = useState<ConferenceSponsorRequestDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/conference/sponsor-requests/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load request");
        setRequest(data.data);
      } catch (error) {
        console.error("Sponsor request detail error:", error);
        toast.error("Failed to load sponsor request details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequest();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sponsor request?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/sponsor-requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Sponsor request deleted");
      router.push("/portal/admin/conference/sponsor-requests");
    } catch (error) {
      console.error("Delete sponsor request error:", error);
      toast.error("Failed to delete sponsor request");
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

  if (!request) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Sponsor request not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/sponsor-requests">Back to Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/sponsor-requests">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Sponsor Request Details</h1>
          <p className="text-muted-foreground text-sm">Review and manage sponsorship inquiry</p>
        </div>
        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Delete
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={`capitalize ${statusBadge[request.status]}`}>{request.status}</Badge>
                <Badge variant="outline" className="capitalize">{request.tier}</Badge>
              </div>
              <h2 className="text-xl font-bold">{request.organizationName}</h2>
              <p className="text-muted-foreground">Contact: {request.contactName}</p>
              <p className="text-xs text-muted-foreground mt-1">Submitted {formatDate(request.createdAt)}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${request.contactEmail}`} className="text-primary hover:underline">{request.contactEmail}</a>
              </div>
              {request.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{request.contactPhone}</span>
                </div>
              )}
              {request.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={request.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{request.websiteUrl}</a>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Message</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.message || "No message provided."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
