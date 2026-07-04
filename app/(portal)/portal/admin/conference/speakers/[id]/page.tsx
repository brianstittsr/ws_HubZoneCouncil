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
import { ArrowLeft, Pencil, Trash2, Loader2, Mic2, Star, Mail, Phone, Globe, Linkedin, Twitter } from "lucide-react";
import type { ConferenceSpeakerDoc } from "@/lib/schema";

export default function SpeakerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [speaker, setSpeaker] = useState<ConferenceSpeakerDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSpeaker = async () => {
      try {
        const res = await fetch(`/api/conference/speakers/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load speaker");
        setSpeaker(data.data);
      } catch (error) {
        console.error("Speaker detail error:", error);
        toast.error("Failed to load speaker details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSpeaker();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this speaker?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/speakers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Speaker removed");
      router.push("/portal/admin/conference/speakers");
    } catch (error) {
      console.error("Delete speaker error:", error);
      toast.error("Failed to remove speaker");
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

  if (!speaker) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Speaker not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/speakers">Back to Speakers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${speaker.firstName.charAt(0)}${speaker.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/speakers">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Speaker Details</h1>
          <p className="text-muted-foreground text-sm">View and manage speaker information</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/speakers?id=${id}`}>
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
            {speaker.photoUrl ? (
              <img src={speaker.photoUrl} alt={`${speaker.firstName} ${speaker.lastName}`} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-medium">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{speaker.firstName} {speaker.lastName}</h2>
                {speaker.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                <Badge variant={speaker.isPublic ? "default" : "secondary"}>{speaker.isPublic ? "Public" : "Draft"}</Badge>
              </div>
              <p className="text-muted-foreground">{speaker.title}</p>
              <p className="text-sm font-medium">{speaker.organization}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="capitalize">{speaker.speakerType}</Badge>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Biography</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{speaker.bio || "No biography provided."}</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Contact & Links</h3>
              {speaker.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${speaker.email}`} className="text-primary hover:underline">{speaker.email}</a>
                </div>
              )}
              {speaker.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{speaker.phone}</span>
                </div>
              )}
              {speaker.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={speaker.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{speaker.websiteUrl}</a>
                </div>
              )}
              {speaker.linkedinUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a href={speaker.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">LinkedIn</a>
                </div>
              )}
              {speaker.twitterHandle && (
                <div className="flex items-center gap-2 text-sm">
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                  <span>{speaker.twitterHandle}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
