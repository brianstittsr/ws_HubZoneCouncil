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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, PackageOpen, Check, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceSponsorshipPackageDoc } from "@/lib/schema";

type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "community" | "media" | "in-kind" | "custom";

interface BenefitRow {
  label: string;
  included: boolean;
  details: string;
}

type FormData = {
  conferenceId: string;
  name: string;
  tier: SponsorTier;
  price: string;
  currency: string;
  description: string;
  maxSponsors: string;
  isPublic: boolean;
  isActive: boolean;
  highlightColor: string;
  displayOrder: string;
  benefits: BenefitRow[];
};

const defaultForm: FormData = {
  conferenceId: "",
  name: "",
  tier: "gold",
  price: "",
  currency: "USD",
  description: "",
  maxSponsors: "",
  isPublic: true,
  isActive: true,
  highlightColor: "",
  displayOrder: "0",
  benefits: [
    { label: "Logo on event website", included: true, details: "" },
    { label: "Logo on conference materials", included: true, details: "" },
    { label: "Social media mention", included: true, details: "" },
    { label: "Exhibitor table", included: false, details: "" },
    { label: "Speaking opportunity", included: false, details: "" },
  ],
};

const tierBadge: Record<SponsorTier, string> = {
  platinum: "bg-slate-100 text-slate-800 border border-slate-300",
  gold: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  silver: "bg-gray-100 text-gray-700 border border-gray-300",
  bronze: "bg-orange-100 text-orange-800 border border-orange-300",
  community: "bg-green-100 text-green-800 border border-green-300",
  media: "bg-blue-100 text-blue-800 border border-blue-300",
  "in-kind": "bg-purple-100 text-purple-800 border border-purple-300",
  custom: "bg-pink-100 text-pink-800 border border-pink-300",
};

export default function PackagesPage() {
  const [items, setItems] = useState<ConferenceSponsorshipPackageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceSponsorshipPackageDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/packages");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load packages");
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

  function openEdit(item: ConferenceSponsorshipPackageDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      name: item.name,
      tier: item.tier,
      price: String(item.price),
      currency: item.currency,
      description: item.description,
      maxSponsors: item.maxSponsors ? String(item.maxSponsors) : "",
      isPublic: item.isPublic,
      isActive: item.isActive,
      highlightColor: item.highlightColor ?? "",
      displayOrder: String(item.displayOrder),
      benefits: item.benefits.map((b) => ({ label: b.label, included: b.included, details: b.details ?? "" })),
    });
    setDialogOpen(true);
  }

  function updateBenefit(index: number, field: keyof BenefitRow, value: string | boolean) {
    const updated = [...form.benefits];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, benefits: updated });
  }

  function addBenefit() {
    setForm({ ...form, benefits: [...form.benefits, { label: "", included: true, details: "" }] });
  }

  function removeBenefit(index: number) {
    setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== index) });
  }

  async function handleSave() {
    if (!form.name || !form.price) { toast.error("Name and price are required."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        maxSponsors: form.maxSponsors ? parseInt(form.maxSponsors) : undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
        benefits: form.benefits.filter((b) => b.label.trim()),
      };
      if (editItem) {
        await fetch(`/api/conference/packages/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Package updated");
      } else {
        await fetch("/api/conference/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Package created");
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
      await fetch(`/api/conference/packages/${deleteId}`, { method: "DELETE" });
      toast.success("Package deleted");
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
          <h1 className="text-2xl font-bold">Sponsorship Packages</h1>
          <p className="text-muted-foreground text-sm">Define tiers, pricing, and benefits for sponsors</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Package</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No sponsorship packages yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Package</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className={`relative ${!item.isActive ? "opacity-60" : ""}`}
              style={item.highlightColor ? { borderTopColor: item.highlightColor, borderTopWidth: 3 } : {}}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadge[item.tier]}`}>{item.tier}</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">${item.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground"> {item.currency}</span></p>
                    {item.maxSponsors && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.currentSponsors}/{item.maxSponsors} sponsors</p>
                    )}
                  </div>
                  {!item.isActive && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                <ul className="space-y-1">
                  {item.benefits.slice(0, 5).map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {b.included
                        ? <Check className="h-3 w-3 text-green-600 shrink-0" />
                        : <X className="h-3 w-3 text-muted-foreground shrink-0" />}
                      <span className={b.included ? "" : "text-muted-foreground"}>{b.label}</span>
                    </li>
                  ))}
                  {item.benefits.length > 5 && <li className="text-xs text-muted-foreground">+{item.benefits.length - 5} more benefits</li>}
                </ul>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Package" : "New Sponsorship Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Package Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Gold Sponsor Package" />
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v as SponsorTier })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["platinum","gold","silver","bronze","community","media","in-kind","custom"] as SponsorTier[]).map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input type="number" step="100" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Sponsors</Label>
                <Input type="number" value={form.maxSponsors} onChange={(e) => setForm({ ...form, maxSponsors: e.target.value })} placeholder="Leave blank for unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Highlight Color (hex)</Label>
                <div className="flex gap-2">
                  <Input value={form.highlightColor} onChange={(e) => setForm({ ...form, highlightColor: e.target.value })} placeholder="#F59E0B" />
                  {form.highlightColor && (
                    <div className="h-9 w-9 rounded border shrink-0" style={{ backgroundColor: form.highlightColor }} />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Benefits</Label>
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {form.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Switch checked={benefit.included} onCheckedChange={(v) => updateBenefit(idx, "included", v)} />
                    <Input
                      className="flex-1"
                      placeholder="Benefit label"
                      value={benefit.label}
                      onChange={(e) => updateBenefit(idx, "label", e.target.value)}
                    />
                    <Input
                      className="w-32"
                      placeholder="Details"
                      value={benefit.details}
                      onChange={(e) => updateBenefit(idx, "details", e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeBenefit(idx)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                <Label>Public</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Create Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
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
