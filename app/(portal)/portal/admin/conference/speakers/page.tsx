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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Mic2, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceSpeakerDoc } from "@/lib/schema";

type SpeakerType = "keynote" | "featured" | "panelist" | "workshop" | "lightning" | "other";

type FormData = {
  conferenceId: string;
  firstName: string;
  lastName: string;
  title: string;
  organization: string;
  bio: string;
  photoUrl: string;
  email: string;
  phone: string;
  websiteUrl: string;
  linkedinUrl: string;
  twitterHandle: string;
  speakerType: SpeakerType;
  isPublic: boolean;
  isFeatured: boolean;
  displayOrder: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  firstName: "",
  lastName: "",
  title: "",
  organization: "",
  bio: "",
  photoUrl: "",
  email: "",
  phone: "",
  websiteUrl: "",
  linkedinUrl: "",
  twitterHandle: "",
  speakerType: "panelist",
  isPublic: true,
  isFeatured: false,
  displayOrder: "0",
};

const tierBadge: Record<SpeakerType, string> = {
  keynote: "bg-yellow-100 text-yellow-800",
  featured: "bg-purple-100 text-purple-800",
  panelist: "bg-blue-100 text-blue-800",
  workshop: "bg-green-100 text-green-800",
  lightning: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

export default function SpeakersPage() {
  const [items, setItems] = useState<ConferenceSpeakerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceSpeakerDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/speakers");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load speakers");
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

  function openEdit(item: ConferenceSpeakerDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      firstName: item.firstName,
      lastName: item.lastName,
      title: item.title,
      organization: item.organization,
      bio: item.bio,
      photoUrl: item.photoUrl ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      websiteUrl: item.websiteUrl ?? "",
      linkedinUrl: item.linkedinUrl ?? "",
      twitterHandle: item.twitterHandle ?? "",
      speakerType: item.speakerType,
      isPublic: item.isPublic,
      isFeatured: item.isFeatured,
      displayOrder: String(item.displayOrder),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.firstName || !form.lastName || !form.organization) {
      toast.error("First name, last name, and organization are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
      if (editItem) {
        await fetch(`/api/conference/speakers/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Speaker updated");
      } else {
        await fetch("/api/conference/speakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Speaker added");
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
      await fetch(`/api/conference/speakers/${deleteId}`, { method: "DELETE" });
      toast.success("Speaker removed");
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
          <h1 className="text-2xl font-bold">Speakers</h1>
          <p className="text-muted-foreground text-sm">Manage keynotes, panelists, and presenters</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Speaker</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Mic2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No speakers yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Speaker</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={`${item.firstName} ${item.lastName}`} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{item.firstName} {item.lastName}</CardTitle>
                        {item.isFeatured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadge[item.speakerType]}`}>{item.speakerType}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {item.bio && <p className="text-xs text-muted-foreground line-clamp-2">{item.bio}</p>}
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3 mr-1" />Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Speaker" : "Add Speaker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} placeholder="Conference document ID" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Title / Role</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="CEO, Director, Professor" />
              </div>
              <div className="space-y-2">
                <Label>Organization *</Label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Speaker Type</Label>
                <Select value={form.speakerType} onValueChange={(v) => setForm({ ...form, speakerType: v as SpeakerType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="panelist">Panelist</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="lightning">Lightning Talk</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Twitter Handle</Label>
              <Input value={form.twitterHandle} onChange={(e) => setForm({ ...form, twitterHandle: e.target.value })} placeholder="@handle" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                <Label>Public</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Add Speaker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Speaker?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
