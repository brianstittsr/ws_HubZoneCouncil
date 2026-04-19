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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceCollaboratorDoc } from "@/lib/schema";

type FormData = {
  conferenceId: string;
  name: string;
  organization: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  websiteUrl: string;
  linkedinUrl: string;
  photoUrl: string;
  isPublic: boolean;
  displayOrder: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  name: "",
  organization: "",
  role: "",
  bio: "",
  email: "",
  phone: "",
  websiteUrl: "",
  linkedinUrl: "",
  photoUrl: "",
  isPublic: true,
  displayOrder: "0",
};

export default function CollaboratorsPage() {
  const [items, setItems] = useState<ConferenceCollaboratorDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceCollaboratorDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/collaborators");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load collaborators");
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

  function openEdit(item: ConferenceCollaboratorDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      name: item.name,
      organization: item.organization,
      role: item.role,
      bio: item.bio ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      websiteUrl: item.websiteUrl ?? "",
      linkedinUrl: item.linkedinUrl ?? "",
      photoUrl: item.photoUrl ?? "",
      isPublic: item.isPublic,
      displayOrder: String(item.displayOrder),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.organization || !form.role) {
      toast.error("Name, organization, and role are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
      if (editItem) {
        await fetch(`/api/conference/collaborators/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Collaborator updated");
      } else {
        await fetch("/api/conference/collaborators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Collaborator added");
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
      await fetch(`/api/conference/collaborators/${deleteId}`, { method: "DELETE" });
      toast.success("Collaborator removed");
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
          <h1 className="text-2xl font-bold">Collaborators</h1>
          <p className="text-muted-foreground text-sm">Manage co-organizers and collaborating organizations</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Collaborator</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No collaborators yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Collaborator</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.role} · {item.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!item.isPublic && <Badge variant="outline" className="text-xs">Private</Badge>}
                    <Button variant="outline" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              {(item.bio || item.email) && (
                <CardContent className="pt-0">
                  {item.bio && <p className="text-sm text-muted-foreground line-clamp-2">{item.bio}</p>}
                  {item.email && <p className="text-xs text-muted-foreground mt-1">{item.email}</p>}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Collaborator" : "Add Collaborator"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} placeholder="Conference document ID" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Organization *</Label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Co-Organizer" />
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
              <Label>Website URL</Label>
              <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
              <Label>Visible to public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Add Collaborator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator?</AlertDialogTitle>
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
