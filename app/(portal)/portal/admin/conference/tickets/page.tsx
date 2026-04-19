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
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Ticket } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceTicketDoc } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";

type TicketType = "free" | "paid" | "vip" | "student" | "virtual" | "in-person" | "combo";

type FormData = {
  conferenceId: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  ticketType: TicketType;
  availableQuantity: string;
  saleStartDate: string;
  saleEndDate: string;
  perks: string;
  includesMeals: boolean;
  includesHousing: boolean;
  includesRecordings: boolean;
  isPublic: boolean;
  isActive: boolean;
  stripeProductId: string;
  stripePriceId: string;
  registrationFormUrl: string;
  displayOrder: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  name: "",
  description: "",
  price: "0",
  currency: "USD",
  ticketType: "paid",
  availableQuantity: "",
  saleStartDate: "",
  saleEndDate: "",
  perks: "",
  includesMeals: false,
  includesHousing: false,
  includesRecordings: false,
  isPublic: true,
  isActive: true,
  stripeProductId: "",
  stripePriceId: "",
  registrationFormUrl: "",
  displayOrder: "0",
};

function toDateStr(ts: Timestamp | undefined): string {
  if (!ts) return "";
  try { return ts.toDate().toISOString().split("T")[0]; } catch { return ""; }
}

const tierBadge: Record<TicketType, string> = {
  free: "bg-green-100 text-green-800",
  paid: "bg-blue-100 text-blue-800",
  vip: "bg-yellow-100 text-yellow-800",
  student: "bg-purple-100 text-purple-800",
  virtual: "bg-cyan-100 text-cyan-800",
  "in-person": "bg-orange-100 text-orange-800",
  combo: "bg-pink-100 text-pink-800",
};

export default function TicketsPage() {
  const [items, setItems] = useState<ConferenceTicketDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceTicketDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/tickets");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load tickets");
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

  function openEdit(item: ConferenceTicketDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      currency: item.currency,
      ticketType: item.ticketType,
      availableQuantity: item.availableQuantity ? String(item.availableQuantity) : "",
      saleStartDate: toDateStr(item.saleStartDate),
      saleEndDate: toDateStr(item.saleEndDate),
      perks: (item.perks ?? []).join("\n"),
      includesMeals: item.includesMeals ?? false,
      includesHousing: item.includesHousing ?? false,
      includesRecordings: item.includesRecordings ?? false,
      isPublic: item.isPublic,
      isActive: item.isActive,
      stripeProductId: item.stripeProductId ?? "",
      stripePriceId: item.stripePriceId ?? "",
      registrationFormUrl: item.registrationFormUrl ?? "",
      displayOrder: String(item.displayOrder),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name) { toast.error("Ticket name is required."); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        availableQuantity: form.availableQuantity ? parseInt(form.availableQuantity) : undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
        perks: form.perks ? form.perks.split("\n").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        await fetch(`/api/conference/tickets/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Ticket updated");
      } else {
        await fetch("/api/conference/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Ticket created");
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
      await fetch(`/api/conference/tickets/${deleteId}`, { method: "DELETE" });
      toast.success("Ticket deleted");
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
          <h1 className="text-2xl font-bold">Registration / Tickets</h1>
          <p className="text-muted-foreground text-sm">Manage ticket tiers, pricing, and availability</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Ticket</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No ticket tiers yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Ticket</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className={!item.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadge[item.ticketType]}`}>{item.ticketType}</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      {item.price === 0 ? "Free" : `$${item.price.toFixed(2)}`}
                      {item.price > 0 && <span className="text-sm font-normal text-muted-foreground"> {item.currency}</span>}
                    </p>
                  </div>
                  {!item.isActive && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
                  {item.availableQuantity && <span>Capacity: {item.availableQuantity}</span>}
                  <span>Sold: {item.soldQuantity}</span>
                </div>
                {item.perks && item.perks.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {item.perks.slice(0, 3).map((p, i) => <li key={i}>✓ {p}</li>)}
                    {item.perks.length > 3 && <li className="text-xs">+{item.perks.length - 3} more</li>}
                  </ul>
                )}
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Ticket" : "Add Ticket Tier"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Ticket Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="General Admission" />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ticket Type</Label>
                <Select value={form.ticketType} onValueChange={(v) => setForm({ ...form, ticketType: v as TicketType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["free","paid","vip","student","virtual","in-person","combo"] as TicketType[]).map((t) => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Available Quantity</Label>
                <Input type="number" value={form.availableQuantity} onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })} placeholder="Leave blank for unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Sale Start Date</Label>
                <Input type="date" value={form.saleStartDate} onChange={(e) => setForm({ ...form, saleStartDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sale End Date</Label>
                <Input type="date" value={form.saleEndDate} onChange={(e) => setForm({ ...form, saleEndDate: e.target.value })} />
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
            <div className="space-y-2">
              <Label>Perks (one per line)</Label>
              <Textarea rows={4} value={form.perks} onChange={(e) => setForm({ ...form, perks: e.target.value })} placeholder="Access to all sessions&#10;Networking lunch&#10;Conference materials" />
            </div>
            <div className="space-y-2">
              <Label>Registration Form URL</Label>
              <Input value={form.registrationFormUrl} onChange={(e) => setForm({ ...form, registrationFormUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Stripe Product ID</Label>
              <Input value={form.stripeProductId} onChange={(e) => setForm({ ...form, stripeProductId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Stripe Price ID</Label>
              <Input value={form.stripePriceId} onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <Switch checked={form.includesMeals} onCheckedChange={(v) => setForm({ ...form, includesMeals: v })} />
                <Label>Includes Meals</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.includesHousing} onCheckedChange={(v) => setForm({ ...form, includesHousing: v })} />
                <Label>Includes Housing</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.includesRecordings} onCheckedChange={(v) => setForm({ ...form, includesRecordings: v })} />
                <Label>Includes Recordings</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                <Label>Public</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label>Active (on sale)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Create Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
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
