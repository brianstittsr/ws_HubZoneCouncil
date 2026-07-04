"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Loader2, ArrowLeft, Trash2, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceSponsorRequestDoc } from "@/lib/schema";

type RequestStatus = ConferenceSponsorRequestDoc["status"];

const statusStyles: Record<RequestStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  negotiating: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  declined: "bg-gray-100 text-gray-800",
};

const CONFERENCE_ID = "hubzone-rise-2026";

export default function SponsorRequestsPage() {
  const [items, setItems] = useState<ConferenceSponsorRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch(`/api/conference/sponsor-requests?conferenceId=${CONFERENCE_ID}`);
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load sponsor requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  async function updateStatus(id: string, status: RequestStatus) {
    try {
      await fetch(`/api/conference/sponsor-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
      fetchItems();
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/conference/sponsor-requests/${deleteId}`, { method: "DELETE" });
      toast.success("Request removed");
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
          <h1 className="text-2xl font-bold">Sponsor Requests</h1>
          <p className="text-muted-foreground text-sm">Track inbound sponsorship inquiries</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No sponsor requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{item.organizationName}</CardTitle>
                      <Badge className={statusStyles[item.status]}>{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.contactName} · {item.contactEmail}</p>
                    {item.contactPhone && <p className="text-sm text-muted-foreground">{item.contactPhone}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Tier: {item.tier}</p>
                    {item.websiteUrl && <p className="text-xs text-muted-foreground">{item.websiteUrl}</p>}
                    {item.message && <p className="text-sm mt-2">{item.message}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v as RequestStatus)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="negotiating">Negotiating</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/portal/admin/conference/sponsor-requests/${item.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Request?</AlertDialogTitle>
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
