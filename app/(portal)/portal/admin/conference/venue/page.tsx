"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import type { ConferenceVenueDoc, ConferenceRoomDoc } from "@/lib/schema";

const CONFERENCE_ID = "hubzone-rise-2026";

const roomTypeOptions = [
  { value: "ballroom", label: "Ballroom" },
  { value: "breakout", label: "Breakout" },
  { value: "boardroom", label: "Boardroom" },
  { value: "exhibit", label: "Exhibit" },
  { value: "networking", label: "Networking" },
  { value: "other", label: "Other" },
];

export default function VenueAdminPage() {
  const [venues, setVenues] = useState<ConferenceVenueDoc[]>([]);
  const [rooms, setRooms] = useState<ConferenceRoomDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [venueDialog, setVenueDialog] = useState(false);
  const [roomDialog, setRoomDialog] = useState(false);
  const [editVenue, setEditVenue] = useState<ConferenceVenueDoc | null>(null);
  const [editRoom, setEditRoom] = useState<ConferenceRoomDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [venueForm, setVenueForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    websiteUrl: "",
    bookingUrl: "",
    isPrimary: false,
    mapEmbedUrl: "",
    displayOrder: "0",
  });
  const [roomForm, setRoomForm] = useState({
    venueId: "",
    name: "",
    description: "",
    floor: "",
    capacity: "",
    roomType: "",
    isPublic: true,
    displayOrder: "0",
  });

  async function fetchData() {
    setLoading(true);
    try {
      const [venueRes, roomRes] = await Promise.all([
        fetch("/api/conference/venues"),
        fetch("/api/conference/rooms"),
      ]);
      const venueJson = await venueRes.json();
      const roomJson = await roomRes.json();
      setVenues(venueJson.data ?? []);
      setRooms(roomJson.data ?? []);
    } catch {
      toast.error("Failed to load venue data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openVenueDialog(venue?: ConferenceVenueDoc) {
    setEditVenue(venue || null);
    setVenueForm(
      venue
        ? {
            name: venue.name,
            description: venue.description || "",
            address: venue.address || "",
            city: venue.city || "",
            state: venue.state || "",
            zip: venue.zip || "",
            phone: venue.phone || "",
            websiteUrl: venue.websiteUrl || "",
            bookingUrl: venue.bookingUrl || "",
            isPrimary: venue.isPrimary,
            mapEmbedUrl: venue.mapEmbedUrl || "",
            displayOrder: String(venue.displayOrder || 0),
          }
        : {
            name: "",
            description: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            websiteUrl: "",
            bookingUrl: "",
            isPrimary: false,
            mapEmbedUrl: "",
            displayOrder: String(venues.length),
          }
    );
    setVenueDialog(true);
  }

  function openRoomDialog(room?: ConferenceRoomDoc) {
    setEditRoom(room || null);
    setRoomForm(
      room
        ? {
            venueId: room.venueId,
            name: room.name,
            description: room.description || "",
            floor: room.floor || "",
            capacity: room.capacity ? String(room.capacity) : "",
            roomType: room.roomType || "",
            isPublic: room.isPublic,
            displayOrder: String(room.displayOrder || 0),
          }
        : {
            venueId: venues[0]?.id || "",
            name: "",
            description: "",
            floor: "",
            capacity: "",
            roomType: "",
            isPublic: true,
            displayOrder: "0",
          }
    );
    setRoomDialog(true);
  }

  async function saveVenue() {
    setSaving(true);
    try {
      const payload = {
        conferenceId: CONFERENCE_ID,
        ...venueForm,
        displayOrder: parseInt(venueForm.displayOrder) || 0,
      };
      const url = editVenue ? `/api/conference/venues/${editVenue.id}` : "/api/conference/venues";
      const res = await fetch(url, {
        method: editVenue ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editVenue ? "Venue updated" : "Venue created");
      setVenueDialog(false);
      fetchData();
    } catch {
      toast.error("Failed to save venue");
    } finally {
      setSaving(false);
    }
  }

  async function saveRoom() {
    setSaving(true);
    try {
      const payload = {
        conferenceId: CONFERENCE_ID,
        ...roomForm,
        capacity: roomForm.capacity ? parseInt(roomForm.capacity) : undefined,
        displayOrder: parseInt(roomForm.displayOrder) || 0,
      };
      const url = editRoom ? `/api/conference/rooms/${editRoom.id}` : "/api/conference/rooms";
      const res = await fetch(url, {
        method: editRoom ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editRoom ? "Room updated" : "Room created");
      setRoomDialog(false);
      fetchData();
    } catch {
      toast.error("Failed to save room");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVenue(id: string) {
    if (!confirm("Delete this venue and all its rooms?")) return;
    try {
      await fetch(`/api/conference/venues/${id}`, { method: "DELETE" });
      toast.success("Venue deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete venue");
    }
  }

  async function deleteRoom(id: string) {
    if (!confirm("Delete this room?")) return;
    try {
      await fetch(`/api/conference/rooms/${id}`, { method: "DELETE" });
      toast.success("Room deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete room");
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/admin/conference">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Venue & Rooms</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openVenueDialog()}>
            <Plus className="h-4 w-4 mr-1" /> Add Venue
          </Button>
          <Button size="sm" variant="outline" onClick={() => openRoomDialog()} disabled={venues.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Add Room
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Venues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {venues.length === 0 ? (
                <p className="text-muted-foreground">No venues configured yet.</p>
              ) : (
                <div className="divide-y">
                  {venues.map((venue) => (
                    <div key={venue.id} className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{venue.name}</h3>
                          {venue.isPrimary && <span className="text-xs bg-[#c9a227] text-[#1a2b4a] px-2 py-0.5 rounded-full">Primary</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {venue.address}, {venue.city}, {venue.state} {venue.zip}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openVenueDialog(venue)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteVenue(venue.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <p className="text-muted-foreground">No rooms configured yet.</p>
              ) : (
                <div className="divide-y">
                  {rooms.map((room) => (
                    <div key={room.id} className="py-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {room.roomType} {room.capacity && `• Capacity: ${room.capacity}`} {room.floor && `• Floor: ${room.floor}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openRoomDialog(room)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => deleteRoom(room.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={venueDialog} onOpenChange={setVenueDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editVenue ? "Edit Venue" : "Add Venue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={venueForm.city} onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={venueForm.state} onChange={(e) => setVenueForm({ ...venueForm, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input value={venueForm.zip} onChange={(e) => setVenueForm({ ...venueForm, zip: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={venueForm.phone} onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={venueForm.websiteUrl} onChange={(e) => setVenueForm({ ...venueForm, websiteUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Booking URL</Label>
              <Input value={venueForm.bookingUrl} onChange={(e) => setVenueForm({ ...venueForm, bookingUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Map Embed URL</Label>
              <Input value={venueForm.mapEmbedUrl} onChange={(e) => setVenueForm({ ...venueForm, mapEmbedUrl: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={venueForm.isPrimary}
                onCheckedChange={(checked) => setVenueForm({ ...venueForm, isPrimary: checked })}
              />
              <Label>Primary Venue</Label>
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input value={venueForm.displayOrder} onChange={(e) => setVenueForm({ ...venueForm, displayOrder: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVenueDialog(false)}>Cancel</Button>
            <Button onClick={saveVenue} disabled={saving || !venueForm.name} className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roomDialog} onOpenChange={setRoomDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRoom ? "Edit Room" : "Add Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Venue *</Label>
              <Select value={roomForm.venueId} onValueChange={(value) => setRoomForm({ ...roomForm, venueId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={roomForm.description} onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={roomForm.roomType} onValueChange={(value) => setRoomForm({ ...roomForm, roomType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={roomForm.isPublic}
                onCheckedChange={(checked) => setRoomForm({ ...roomForm, isPublic: checked })}
              />
              <Label>Public</Label>
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input value={roomForm.displayOrder} onChange={(e) => setRoomForm({ ...roomForm, displayOrder: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialog(false)}>Cancel</Button>
            <Button onClick={saveRoom} disabled={saving || !roomForm.name || !roomForm.venueId} className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
