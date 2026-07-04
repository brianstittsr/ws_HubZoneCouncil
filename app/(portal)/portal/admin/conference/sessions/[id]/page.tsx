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
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, Video, ExternalLink, Loader2, Trash2 } from "lucide-react";
import type { ConferenceSessionDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

const formatTime = (timestamp?: Timestamp) => {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [session, setSession] = useState<ConferenceSessionDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/conference/sessions/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load session");
        setSession(data.data);
      } catch (error) {
        console.error("Session detail error:", error);
        toast.error("Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSession();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Session deleted");
      router.push("/portal/admin/conference/sessions");
    } catch (error) {
      console.error("Delete session error:", error);
      toast.error("Failed to delete session");
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

  if (!session) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Session not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/sessions">Back to Schedule</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/sessions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Session Details</h1>
          <p className="text-muted-foreground text-sm">View and manage session information</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/sessions?id=${id}`}>Edit</Link>
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="capitalize">{session.sessionType}</Badge>
            <Badge variant={session.isPublic ? "default" : "secondary"}>{session.isPublic ? "Public" : "Draft"}</Badge>
          </div>
          <h2 className="text-xl font-bold mb-2">{session.title}</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{session.description || "No description provided."}</p>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Schedule</h3>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Day {session.day}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(session.startTime)} — {formatTime(session.endTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{session.room || "No room assigned"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Speakers & Attendance</h3>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{session.speakerNames || "No speakers assigned"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Max attendees: {session.maxAttendees ?? "Unlimited"}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Track: {session.track || "General"}
              </div>
            </div>
          </div>

          {session.isVirtual && (
            <>
              <Separator className="my-6" />
              <div className="space-y-3">
                <h3 className="font-semibold">Virtual Access</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{session.virtualPlatform}</span>
                  <Badge variant="outline" className="capitalize">{session.virtualAccessType}</Badge>
                </div>
                {session.virtualLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a href={session.virtualLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">{session.virtualLink}</a>
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
