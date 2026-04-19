"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, CalendarDays, Clock, Video, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceSessionDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

type SessionType = "keynote" | "panel" | "workshop" | "breakout" | "networking" | "break" | "lunch" | "opening" | "closing" | "other";

type VirtualPlatform = "zoom" | "teams" | "meet" | "webex" | "youtube" | "other";
type VirtualAccessType = "public" | "registered" | "ticket-required";

type FormData = {
  conferenceId: string;
  title: string;
  description: string;
  sessionType: SessionType;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  track: string;
  speakerNames: string;
  maxAttendees: string;
  isPublic: boolean;
  requiresRegistration: boolean;
  isVirtual: boolean;
  virtualPlatform: VirtualPlatform;
  virtualLink: string;
  virtualMeetingId: string;
  virtualPasscode: string;
  virtualAccessType: VirtualAccessType;
  tags: string;
  materialUrl: string;
  recordingUrl: string;
  displayOrder: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  title: "",
  description: "",
  sessionType: "panel",
  day: "1",
  startTime: "",
  endTime: "",
  room: "",
  track: "",
  speakerNames: "",
  maxAttendees: "",
  isPublic: true,
  requiresRegistration: false,
  isVirtual: false,
  virtualPlatform: "zoom",
  virtualLink: "",
  virtualMeetingId: "",
  virtualPasscode: "",
  virtualAccessType: "public",
  tags: "",
  materialUrl: "",
  recordingUrl: "",
  displayOrder: "0",
};

const typeColors: Record<SessionType, string> = {
  keynote: "bg-yellow-100 text-yellow-800",
  panel: "bg-blue-100 text-blue-800",
  workshop: "bg-green-100 text-green-800",
  breakout: "bg-purple-100 text-purple-800",
  networking: "bg-pink-100 text-pink-800",
  break: "bg-gray-100 text-gray-600",
  lunch: "bg-orange-100 text-orange-800",
  opening: "bg-cyan-100 text-cyan-800",
  closing: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800",
};

function toTimeStr(ts: Timestamp | undefined): string {
  if (!ts) return "";
  try {
    return ts.toDate().toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export default function SessionsPage() {
  const [items, setItems] = useState<ConferenceSessionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceSessionDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/sessions");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  function openCreate() {
    setEditItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(item: ConferenceSessionDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      title: item.title,
      description: item.description ?? "",
      sessionType: item.sessionType,
      day: String(item.day),
      startTime: toTimeStr(item.startTime),
      endTime: toTimeStr(item.endTime),
      room: item.room ?? "",
      track: item.track ?? "",
      speakerNames: (item.speakerNames ?? []).join(", "),
      maxAttendees: item.maxAttendees ? String(item.maxAttendees) : "",
      isPublic: item.isPublic,
      requiresRegistration: item.requiresRegistration,
      isVirtual: item.isVirtual ?? false,
      virtualPlatform: (item.virtualPlatform as VirtualPlatform) ?? "zoom",
      virtualLink: item.virtualLink ?? "",
      virtualMeetingId: item.virtualMeetingId ?? "",
      virtualPasscode: item.virtualPasscode ?? "",
      virtualAccessType: (item.virtualAccessType as VirtualAccessType) ?? "public",
      tags: (item.tags ?? []).join(", "),
      materialUrl: item.materialUrl ?? "",
      recordingUrl: item.recordingUrl ?? "",
      displayOrder: String(item.displayOrder),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.startTime || !form.endTime) {
      toast.error("Title, start time, and end time are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        day: parseInt(form.day) || 1,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
        speakerNames: form.speakerNames ? form.speakerNames.split(",").map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        await fetch(`/api/conference/sessions/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Session updated");
      } else {
        await fetch("/api/conference/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Session created");
      }
      setDialogOpen(false);
      fetchItems();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/conference/sessions/${deleteId}`, { method: "DELETE" });
      toast.success("Session deleted");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const grouped = items.reduce<Record<number, ConferenceSessionDoc[]>>((acc, s) => {
    const day = s.day ?? 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Event Schedule</h1>
          <p className="text-muted-foreground text-sm">Manage sessions, tracks, and agenda</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Session</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No sessions yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Session</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).sort().map((day) => (
            <div key={day}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Day {day}</h2>
              <div className="space-y-2">
                {grouped[Number(day)].map((item) => (
                  <Card key={item.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {toTimeStr(item.startTime).split("T")[1] ?? ""} – {toTimeStr(item.endTime).split("T")[1] ?? ""}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{item.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[item.sessionType]}`}>{item.sessionType}</span>
                              {item.track && <Badge variant="outline" className="text-xs">{item.track}</Badge>}
                              {item.room && <Badge variant="outline" className="text-xs">{item.room}</Badge>}
                              {item.isVirtual && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-0 flex items-center gap-0.5">
                                  <Video className="h-2.5 w-2.5" />{item.virtualPlatform ?? "Virtual"}
                                </Badge>
                              )}
                            </div>
                            {item.speakerNames && item.speakerNames.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.speakerNames.join(", ")}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="icon" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Session" : "Add Session"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} placeholder="Conference document ID" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select value={form.sessionType} onValueChange={(v) => setForm({ ...form, sessionType: v as SessionType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["keynote","panel","workshop","breakout","networking","break","lunch","opening","closing","other"] as SessionType[]).map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Input type="number" min={1} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Hall A" />
              </div>
              <div className="space-y-2">
                <Label>Track</Label>
                <Input value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })} placeholder="Tech, Business..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Speakers (comma-separated names)</Label>
                <Input value={form.speakerNames} onChange={(e) => setForm({ ...form, speakerNames: e.target.value })} placeholder="Jane Doe, John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Max Attendees</Label>
                <Input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Materials URL</Label>
              <Input value={form.materialUrl} onChange={(e) => setForm({ ...form, materialUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Recording URL</Label>
              <Input value={form.recordingUrl} onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })} />
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                <Label>Public</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.requiresRegistration} onCheckedChange={(v) => setForm({ ...form, requiresRegistration: v })} />
                <Label>Requires Registration</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isVirtual} onCheckedChange={(v) => setForm({ ...form, isVirtual: v })} />
                <Label className="flex items-center gap-1"><Video className="h-3 w-3" />Virtual Session</Label>
              </div>
            </div>
            {form.isVirtual && (
              <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Video className="h-3 w-3" />Virtual Meeting Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={form.virtualPlatform} onValueChange={(v) => setForm({ ...form, virtualPlatform: v as VirtualPlatform })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                        <SelectItem value="meet">Google Meet</SelectItem>
                        <SelectItem value="webex">Cisco Webex</SelectItem>
                        <SelectItem value="youtube">YouTube Live</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Access Type</Label>
                    <Select value={form.virtualAccessType} onValueChange={(v) => setForm({ ...form, virtualAccessType: v as VirtualAccessType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (anyone)</SelectItem>
                        <SelectItem value="registered">Registered attendees</SelectItem>
                        <SelectItem value="ticket-required">Ticket required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Meeting / Join Link</Label>
                    <div className="flex gap-2">
                      <Input value={form.virtualLink} onChange={(e) => setForm({ ...form, virtualLink: e.target.value })} placeholder="https://zoom.us/j/..." className="flex-1" />
                      {form.virtualLink && (
                        <a href={form.virtualLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" type="button"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Meeting ID</Label>
                    <Input value={form.virtualMeetingId} onChange={(e) => setForm({ ...form, virtualMeetingId: e.target.value })} placeholder="e.g. 123 456 7890" />
                  </div>
                  <div className="space-y-2">
                    <Label>Passcode</Label>
                    <Input value={form.virtualPasscode} onChange={(e) => setForm({ ...form, virtualPasscode: e.target.value })} placeholder="Meeting passcode" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Add Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
