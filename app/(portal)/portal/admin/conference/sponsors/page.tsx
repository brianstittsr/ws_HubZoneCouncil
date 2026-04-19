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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Building2, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceSponsorDoc } from "@/lib/schema";

type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "community" | "media" | "in-kind" | "custom";

type FormData = {
  conferenceId: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  sponsorshipPackageId: string;
  packageName: string;
  sponsorTier: SponsorTier;
  contributionAmount: string;
  isPublic: boolean;
  isFeatured: boolean;
  displayOrder: string;
  contractSignedAt: string;
  paymentReceivedAt: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  name: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  sponsorshipPackageId: "",
  packageName: "",
  sponsorTier: "bronze",
  contributionAmount: "",
  isPublic: true,
  isFeatured: false,
  displayOrder: "0",
  contractSignedAt: "",
  paymentReceivedAt: "",
};

const tierStyles: Record<SponsorTier, { badge: string; border: string }> = {
  platinum: { badge: "bg-slate-100 text-slate-800", border: "border-l-4 border-l-slate-400" },
  gold: { badge: "bg-yellow-100 text-yellow-800", border: "border-l-4 border-l-yellow-400" },
  silver: { badge: "bg-gray-100 text-gray-700", border: "border-l-4 border-l-gray-400" },
  bronze: { badge: "bg-orange-100 text-orange-800", border: "border-l-4 border-l-orange-400" },
  community: { badge: "bg-green-100 text-green-800", border: "border-l-4 border-l-green-400" },
  media: { badge: "bg-blue-100 text-blue-800", border: "border-l-4 border-l-blue-400" },
  "in-kind": { badge: "bg-purple-100 text-purple-800", border: "border-l-4 border-l-purple-400" },
  custom: { badge: "bg-pink-100 text-pink-800", border: "border-l-4 border-l-pink-400" },
};

export default function SponsorsPage() {
  const [items, setItems] = useState<ConferenceSponsorDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceSponsorDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/sponsors");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load sponsors");
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

  function openEdit(item: ConferenceSponsorDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      name: item.name,
      description: item.description ?? "",
      logoUrl: item.logoUrl ?? "",
      websiteUrl: item.websiteUrl ?? "",
      contactName: item.contactName ?? "",
      contactEmail: item.contactEmail ?? "",
      contactPhone: item.contactPhone ?? "",
      sponsorshipPackageId: item.sponsorshipPackageId ?? "",
      packageName: item.packageName ?? "",
      sponsorTier: item.sponsorTier,
      contributionAmount: item.contributionAmount ? String(item.contributionAmount) : "",
      isPublic: item.isPublic,
      isFeatured: item.isFeatured,
      displayOrder: String(item.displayOrder),
      contractSignedAt: "",
      paymentReceivedAt: "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name) { toast.error("Sponsor name is required."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        contributionAmount: form.contributionAmount ? parseFloat(form.contributionAmount) : undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
        contractSignedAt: form.contractSignedAt || undefined,
        paymentReceivedAt: form.paymentReceivedAt || undefined,
      };
      if (editItem) {
        await fetch(`/api/conference/sponsors/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Sponsor updated");
      } else {
        await fetch("/api/conference/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Sponsor added");
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
      await fetch(`/api/conference/sponsors/${deleteId}`, { method: "DELETE" });
      toast.success("Sponsor removed");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const grouped = items.reduce<Record<SponsorTier, ConferenceSponsorDoc[]>>((acc, s) => {
    if (!acc[s.sponsorTier]) acc[s.sponsorTier] = [];
    acc[s.sponsorTier].push(s);
    return acc;
  }, {} as Record<SponsorTier, ConferenceSponsorDoc[]>);

  const tierOrder: SponsorTier[] = ["platinum", "gold", "silver", "bronze", "community", "media", "in-kind", "custom"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Event Sponsors</h1>
          <p className="text-muted-foreground text-sm">Track sponsors, contracts, and payments</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Sponsor</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No sponsors yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Sponsor</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tierOrder.filter((t) => grouped[t]?.length > 0).map((tier) => (
            <div key={tier}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierStyles[tier].badge}`}>{tier}</span>
                <span>({grouped[tier].length})</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {grouped[tier].map((item) => (
                  <Card key={item.id} className={tierStyles[item.sponsorTier].border}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {item.logoUrl ? (
                            <img src={item.logoUrl} alt={item.name} className="h-10 w-10 object-contain rounded" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs font-bold">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm">{item.name}</CardTitle>
                              {item.isFeatured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                            </div>
                            {item.packageName && <p className="text-xs text-muted-foreground">{item.packageName}</p>}
                            {item.contributionAmount && (
                              <p className="text-xs font-medium text-green-700">${item.contributionAmount.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    {item.contactName && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">{item.contactName}{item.contactEmail ? ` · ${item.contactEmail}` : ""}</p>
                      </CardContent>
                    )}
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
            <DialogTitle>{editItem ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Sponsor Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sponsor Tier</Label>
                <Select value={form.sponsorTier} onValueChange={(v) => setForm({ ...form, sponsorTier: v as SponsorTier })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["platinum","gold","silver","bronze","community","media","in-kind","custom"] as SponsorTier[]).map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contribution Amount ($)</Label>
                <Input type="number" value={form.contributionAmount} onChange={(e) => setForm({ ...form, contributionAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contract Signed Date</Label>
                <Input type="date" value={form.contractSignedAt} onChange={(e) => setForm({ ...form, contractSignedAt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Received Date</Label>
                <Input type="date" value={form.paymentReceivedAt} onChange={(e) => setForm({ ...form, paymentReceivedAt: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." />
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
              {editItem ? "Save Changes" : "Add Sponsor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Sponsor?</AlertDialogTitle>
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
