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
import { ArrowLeft, MapPin, Users, Trash2, Loader2, Pencil, DoorOpen } from "lucide-react";
import type { ConferenceRoomDoc } from "@/lib/schema";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<ConferenceRoomDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/conference/rooms/${roomId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load room");
        setRoom(data.data);
      } catch (error) {
        console.error("Room detail error:", error);
        toast.error("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchRoom();
  }, [roomId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Room deleted");
      router.push(`/portal/admin/conference/venue/${venueId}`);
    } catch (error) {
      console.error("Delete room error:", error);
      toast.error("Failed to delete room");
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

  if (!room) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Room not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href={`/portal/admin/conference/venue/${venueId}`}>Back to Venue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/portal/admin/conference/venue/${venueId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Room Details</h1>
          <p className="text-muted-foreground text-sm">View and manage room information</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/venue/${venueId}/rooms?id=${roomId}`}>
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
          <div className="flex items-start gap-6">
            {room.photoUrl ? (
              <img src={room.photoUrl} alt={room.name} className="h-32 w-48 rounded-lg object-cover" />
            ) : (
              <div className="h-32 w-48 rounded-lg bg-muted flex items-center justify-center">
                <DoorOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="capitalize">{room.roomType}</Badge>
                <Badge variant={room.isPublic ? "default" : "secondary"}>{room.isPublic ? "Public" : "Hidden"}</Badge>
              </div>
              <h2 className="text-xl font-bold">{room.name}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap mt-2">{room.description || "No description provided."}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Location</h3>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Floor {room.floor || "Not specified"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Capacity</h3>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{room.capacity ?? "Not specified"} attendees</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
