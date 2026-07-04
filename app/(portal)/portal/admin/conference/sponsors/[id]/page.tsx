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
import { ArrowLeft, Building2, Pencil, Trash2, Loader2, Mail, Phone, Globe, ExternalLink, CheckCircle2 } from "lucide-react";
import type { ConferenceSponsorDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

const formatDate = (timestamp?: Timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString();
};

export default function SponsorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [sponsor, setSponsor] = useState<ConferenceSponsorDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const res = await fetch(`/api/conference/sponsors/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load sponsor");
        setSponsor(data.data);
      } catch (error) {
        console.error("Sponsor detail error:", error);
        toast.error("Failed to load sponsor details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSponsor();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this sponsor?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/sponsors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Sponsor removed");
      router.push("/portal/admin/conference/sponsors");
    } catch (error) {
      console.error("Delete sponsor error:", error);
      toast.error("Failed to remove sponsor");
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

  if (!sponsor) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Sponsor not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/sponsors">Back to Sponsors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/sponsors">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Sponsor Details</h1>
          <p className="text-muted-foreground text-sm">View and manage sponsor information</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/sponsors?id=${id}`}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Link>
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Remove
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {sponsor.logoUrl ? (
              <img src={sponsor.logoUrl} alt={sponsor.name} className="h-24 w-24 rounded-lg object-contain bg-muted" />
            ) : (
              <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="capitalize">{sponsor.sponsorTier}</Badge>
                <Badge variant={sponsor.isPublic ? "default" : "secondary"}>{sponsor.isPublic ? "Public" : "Hidden"}</Badge>
                {sponsor.isFeatured && <Badge variant="outline">Featured</Badge>}
                {sponsor.contractSignedAt && <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" /> Contract Signed</Badge>}
                {sponsor.paymentReceivedAt && <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</Badge>}
              </div>
              <h2 className="text-xl font-bold">{sponsor.name}</h2>
              <p className="text-muted-foreground">{sponsor.packageName}</p>
              {sponsor.contributionAmount !== undefined && (
                <p className="text-lg font-semibold mt-1">${sponsor.contributionAmount.toFixed(2)}</p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sponsor.description || "No description provided."}</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Contact & Links</h3>
              {sponsor.contactName && <p className="text-sm text-muted-foreground">Contact: {sponsor.contactName}</p>}
              {sponsor.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${sponsor.contactEmail}`} className="text-primary hover:underline">{sponsor.contactEmail}</a>
                </div>
              )}
              {sponsor.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{sponsor.contactPhone}</span>
                </div>
              )}
              {sponsor.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{sponsor.websiteUrl}</a>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold">Contract Signed:</span> {formatDate(sponsor.contractSignedAt)}
            </div>
            <div>
              <span className="font-semibold">Payment Received:</span> {formatDate(sponsor.paymentReceivedAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
