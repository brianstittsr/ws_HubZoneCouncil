"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, MapPin, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceAboutDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

type FormData = {
  eventName: string;
  tagline: string;
  description: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  timezone: string;
  locationType: "virtual" | "in-person" | "hybrid";
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  virtualLink: string;
  bannerImageUrl: string;
  logoUrl: string;
  websiteUrl: string;
  theme: string;
  expectedAttendees: string;
  status: "draft" | "published" | "cancelled" | "completed";
  isFeatured: boolean;
};

const defaultForm: FormData = {
  eventName: "",
  tagline: "",
  description: "",
  shortDescription: "",
  startDate: "",
  endDate: "",
  timezone: "America/New_York",
  locationType: "in-person",
  venue: "",
  address: "",
  city: "",
  state: "",
  country: "United States",
  virtualLink: "",
  bannerImageUrl: "",
  logoUrl: "",
  websiteUrl: "",
  theme: "",
  expectedAttendees: "",
  status: "draft",
  isFeatured: false,
};

function statusColor(status: string) {
  if (status === "published") return "bg-green-100 text-green-800";
  if (status === "completed") return "bg-blue-100 text-blue-800";
  if (status === "cancelled") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

function toDateStr(ts: Timestamp | undefined): string {
  if (!ts) return "";
  try {
    return ts.toDate().toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export default function ConferenceAboutPage() {
  const [items, setItems] = useState<ConferenceAboutDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceAboutDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/about");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load conferences");
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

  function openEdit(item: ConferenceAboutDoc) {
    setEditItem(item);
    setForm({
      eventName: item.eventName,
      tagline: item.tagline ?? "",
      description: item.description,
      shortDescription: item.shortDescription ?? "",
      startDate: toDateStr(item.startDate),
      endDate: toDateStr(item.endDate),
      timezone: item.timezone,
      locationType: item.locationType,
      venue: item.venue ?? "",
      address: item.address ?? "",
      city: item.city ?? "",
      state: item.state ?? "",
      country: item.country ?? "United States",
      virtualLink: item.virtualLink ?? "",
      bannerImageUrl: item.bannerImageUrl ?? "",
      logoUrl: item.logoUrl ?? "",
      websiteUrl: item.websiteUrl ?? "",
      theme: item.theme ?? "",
      expectedAttendees: item.expectedAttendees ? String(item.expectedAttendees) : "",
      status: item.status,
      isFeatured: item.isFeatured ?? false,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.eventName || !form.startDate || !form.endDate) {
      toast.error("Event name, start date, and end date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : undefined,
      };
      if (editItem) {
        await fetch(`/api/conference/about/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Conference updated");
      } else {
        await fetch("/api/conference/about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Conference created");
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
      await fetch(`/api/conference/about/${deleteId}`, { method: "DELETE" });
      toast.success("Conference deleted");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">About Event</h1>
          <p className="text-muted-foreground text-sm">Manage conference details and settings</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Conference</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No conferences yet. Create your first one.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Conference</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.eventName}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(item.status)}`}>{item.status}</span>
                      {item.isFeatured && <Badge variant="secondary">Featured</Badge>}
                    </div>
                    {item.tagline && <p className="text-sm text-muted-foreground">{item.tagline}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{toDateStr(item.startDate)} → {toDateStr(item.endDate)}</span>
                  {item.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.city}{item.state ? `, ${item.state}` : ""}</span>}
                  {item.websiteUrl && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{item.websiteUrl}</span>}
                  <Badge variant="outline" className="text-xs">{item.locationType}</Badge>
                </div>
                {item.shortDescription && <p className="text-sm mt-2 line-clamp-2">{item.shortDescription}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Conference" : "New Conference"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Event Name *</Label>
                <Input value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} placeholder="Annual Summit 2025" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Tagline</Label>
                <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short catchy tagline" />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="America/New_York" />
              </div>
              <div className="space-y-2">
                <Label>Location Type</Label>
                <Select value={form.locationType} onValueChange={(v) => setForm({ ...form, locationType: v as FormData["locationType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(form.locationType === "in-person" || form.locationType === "hybrid") && (
                <>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Convention Center Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  </div>
                </>
              )}
              {(form.locationType === "virtual" || form.locationType === "hybrid") && (
                <div className="md:col-span-2 space-y-2">
                  <Label>Virtual Link</Label>
                  <Input value={form.virtualLink} onChange={(e) => setForm({ ...form, virtualLink: e.target.value })} placeholder="https://zoom.us/j/..." />
                </div>
              )}
              <div className="md:col-span-2 space-y-2">
                <Label>Short Description</Label>
                <Input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="Brief summary for listings" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Full Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed event description..." />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://myconference.com" />
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="Innovation & Growth" />
              </div>
              <div className="space-y-2">
                <Label>Expected Attendees</Label>
                <Input type="number" value={form.expectedAttendees} onChange={(e) => setForm({ ...form, expectedAttendees: e.target.value })} placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as FormData["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input value={form.bannerImageUrl} onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <Label>Featured Event</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Create Conference"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conference?</AlertDialogTitle>
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
