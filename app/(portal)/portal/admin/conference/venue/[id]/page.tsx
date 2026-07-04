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
import { ArrowLeft, MapPin, Phone, Globe, ExternalLink, Loader2, Trash2, Pencil, Building2 } from "lucide-react";
import type { ConferenceVenueDoc, ConferenceRoomDoc } from "@/lib/schema";

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [venue, setVenue] = useState<ConferenceVenueDoc | null>(null);
  const [rooms, setRooms] = useState<ConferenceRoomDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const [venueRes, roomsRes] = await Promise.all([
          fetch(`/api/conference/venues/${id}`),
          fetch(`/api/conference/rooms?venueId=${id}`),
        ]);
        const venueData = await venueRes.json();
        const roomsData = await roomsRes.json();
        if (!venueRes.ok) throw new Error(venueData.error || "Failed to load venue");
        setVenue(venueData.data);
        setRooms(roomsData.data ?? []);
      } catch (error) {
        console.error("Venue detail error:", error);
        toast.error("Failed to load venue details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVenue();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this venue?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conference/venues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Venue deleted");
      router.push("/portal/admin/conference/venue");
    } catch (error) {
      console.error("Delete venue error:", error);
      toast.error("Failed to delete venue");
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

  if (!venue) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Venue not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/portal/admin/conference/venue">Back to Venues</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference/venue">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Venue Details</h1>
          <p className="text-muted-foreground text-sm">View and manage venue information</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/portal/admin/conference/venue?id=${id}`}>
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
            {venue.photoUrl ? (
              <img src={venue.photoUrl} alt={venue.name} className="h-32 w-48 rounded-lg object-cover" />
            ) : (
              <div className="h-32 w-48 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {venue.isPrimary && <Badge>Primary Venue</Badge>}
                <Badge variant="outline">{venue.city}, {venue.state}</Badge>
              </div>
              <h2 className="text-xl font-bold">{venue.name}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap mt-2">{venue.description || "No description provided."}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Address</h3>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{venue.address}</p>
                  <p>{venue.city}, {venue.state} {venue.zip}</p>
                  <p>{venue.country}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              {venue.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{venue.phone}</span>
                </div>
              )}
              {venue.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={venue.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{venue.websiteUrl}</a>
                </div>
              )}
              {venue.bookingUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a href={venue.bookingUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Booking Link</a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Rooms</h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/portal/admin/conference/venue/${id}/rooms/new`}>Add Room</Link>
          </Button>
        </div>
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No rooms added for this venue yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/portal/admin/conference/venue/${id}/rooms/${room.id}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-base">{room.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">{room.roomType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{room.description || "No description"}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {room.floor && <span>Floor {room.floor}</span>}
                      {room.capacity && <span>Capacity: {room.capacity}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
