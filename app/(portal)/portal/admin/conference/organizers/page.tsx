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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, UserCog, Globe, Mail, Phone, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceOrganizerDoc } from "@/lib/schema";

type OrganizerType = "lead" | "co-organizer" | "supporting" | "fiscal-sponsor";

type FormData = {
  conferenceId: string;
  organizationName: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactTitle: string;
  socialLinkedIn: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  isMainOrganizer: boolean;
  organizerType: OrganizerType;
  displayOrder: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  organizationName: "",
  logoUrl: "",
  websiteUrl: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "United States",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  primaryContactTitle: "",
  socialLinkedIn: "",
  socialTwitter: "",
  socialFacebook: "",
  socialInstagram: "",
  socialYoutube: "",
  isMainOrganizer: false,
  organizerType: "lead",
  displayOrder: "0",
};

const typeBadge: Record<OrganizerType, string> = {
  lead: "bg-blue-100 text-blue-800",
  "co-organizer": "bg-purple-100 text-purple-800",
  supporting: "bg-green-100 text-green-800",
  "fiscal-sponsor": "bg-orange-100 text-orange-800",
};

export default function OrganizersPage() {
  const [items, setItems] = useState<ConferenceOrganizerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceOrganizerDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/organizers");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load organizers");
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

  function openEdit(item: ConferenceOrganizerDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      organizationName: item.organizationName,
      logoUrl: item.logoUrl ?? "",
      websiteUrl: item.websiteUrl ?? "",
      description: item.description ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      address: item.address ?? "",
      city: item.city ?? "",
      state: item.state ?? "",
      country: item.country ?? "United States",
      primaryContactName: item.primaryContactName,
      primaryContactEmail: item.primaryContactEmail,
      primaryContactPhone: item.primaryContactPhone ?? "",
      primaryContactTitle: item.primaryContactTitle ?? "",
      socialLinkedIn: item.socialLinks?.linkedin ?? "",
      socialTwitter: item.socialLinks?.twitter ?? "",
      socialFacebook: item.socialLinks?.facebook ?? "",
      socialInstagram: item.socialLinks?.instagram ?? "",
      socialYoutube: item.socialLinks?.youtube ?? "",
      isMainOrganizer: item.isMainOrganizer,
      organizerType: item.organizerType,
      displayOrder: String(item.displayOrder),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.organizationName || !form.primaryContactName || !form.primaryContactEmail) {
      toast.error("Organization name and primary contact info are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        conferenceId: form.conferenceId,
        organizationName: form.organizationName,
        logoUrl: form.logoUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
        description: form.description || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        country: form.country || undefined,
        primaryContactName: form.primaryContactName,
        primaryContactEmail: form.primaryContactEmail,
        primaryContactPhone: form.primaryContactPhone || undefined,
        primaryContactTitle: form.primaryContactTitle || undefined,
        socialLinks: {
          linkedin: form.socialLinkedIn || undefined,
          twitter: form.socialTwitter || undefined,
          facebook: form.socialFacebook || undefined,
          instagram: form.socialInstagram || undefined,
          youtube: form.socialYoutube || undefined,
        },
        isMainOrganizer: form.isMainOrganizer,
        organizerType: form.organizerType,
        displayOrder: parseInt(form.displayOrder) || 0,
      };
      if (editItem) {
        await fetch(`/api/conference/organizers/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Organizer updated");
      } else {
        await fetch("/api/conference/organizers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Organizer added");
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
      await fetch(`/api/conference/organizers/${deleteId}`, { method: "DELETE" });
      toast.success("Organizer removed");
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
          <h1 className="text-2xl font-bold">Organizer Details</h1>
          <p className="text-muted-foreground text-sm">Manage lead organizers, co-organizers, and fiscal sponsors</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Organizer</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <UserCog className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No organizers added yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Organizer</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.organizationName} className="h-12 w-12 object-contain rounded border" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-sm font-bold">
                        {item.organizationName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{item.organizationName}</CardTitle>
                        {item.isMainOrganizer && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[item.organizerType]}`}>{item.organizerType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <p className="text-sm font-medium">{item.primaryContactName}
                  {item.primaryContactTitle && <span className="font-normal text-muted-foreground"> · {item.primaryContactTitle}</span>}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {item.primaryContactEmail && (
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.primaryContactEmail}</span>
                  )}
                  {item.phone && (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.phone}</span>
                  )}
                  {item.websiteUrl && (
                    <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Globe className="h-3 w-3" />{item.websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                {item.city && <p className="text-xs text-muted-foreground">{item.city}{item.state ? `, ${item.state}` : ""}{item.country ? ` · ${item.country}` : ""}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Organizer" : "Add Organizer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Organization Name *</Label>
                <Input value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Organizer Type</Label>
                <Select value={form.organizerType} onValueChange={(v) => setForm({ ...form, organizerType: v as OrganizerType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead Organizer</SelectItem>
                    <SelectItem value="co-organizer">Co-Organizer</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="fiscal-sponsor">Fiscal Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Website URL</Label>
                <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-semibold mb-3">Primary Contact</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contact Name *</Label>
                  <Input value={form.primaryContactName} onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.primaryContactTitle} onChange={(e) => setForm({ ...form, primaryContactTitle: e.target.value })} placeholder="Executive Director" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email *</Label>
                  <Input type="email" value={form.primaryContactEmail} onChange={(e) => setForm({ ...form, primaryContactEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={form.primaryContactPhone} onChange={(e) => setForm({ ...form, primaryContactPhone: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-semibold mb-3">Social Links</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={form.socialLinkedIn} onChange={(e) => setForm({ ...form, socialLinkedIn: e.target.value })} placeholder="https://linkedin.com/company/..." />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input value={form.socialTwitter} onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })} placeholder="@handle" />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input value={form.socialFacebook} onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={form.socialInstagram} onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>YouTube</Label>
                  <Input value={form.socialYoutube} onChange={(e) => setForm({ ...form, socialYoutube: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isMainOrganizer} onCheckedChange={(v) => setForm({ ...form, isMainOrganizer: v })} />
              <Label>Lead / Main Organizer</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Add Organizer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Organizer?</AlertDialogTitle>
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
