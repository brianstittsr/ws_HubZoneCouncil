"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  Video,
  Link2,
  ShieldCheck,
  ShieldOff,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceVirtualAccessDoc } from "@/lib/schema";

type Platform = "zoom" | "teams" | "meet" | "webex" | "youtube" | "other";
type AccessStatus = "active" | "revoked" | "expired";

type FormData = {
  conferenceId: string;
  sessionId: string;
  sessionTitle: string;
  attendeeEmail: string;
  attendeeName: string;
  ticketType: string;
  ticketId: string;
  virtualPlatform: Platform;
  virtualLink: string;
  virtualMeetingId: string;
  virtualPasscode: string;
  accessCode: string;
  status: AccessStatus;
  expiresAt: string;
  notes: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  sessionId: "",
  sessionTitle: "",
  attendeeEmail: "",
  attendeeName: "",
  ticketType: "",
  ticketId: "",
  virtualPlatform: "zoom",
  virtualLink: "",
  virtualMeetingId: "",
  virtualPasscode: "",
  accessCode: "",
  status: "active",
  expiresAt: "",
  notes: "",
};

const platformLabels: Record<Platform, string> = {
  zoom: "Zoom",
  teams: "Microsoft Teams",
  meet: "Google Meet",
  webex: "Cisco Webex",
  youtube: "YouTube Live",
  other: "Other",
};

const platformColors: Record<Platform, string> = {
  zoom: "bg-blue-100 text-blue-800",
  teams: "bg-purple-100 text-purple-800",
  meet: "bg-green-100 text-green-800",
  webex: "bg-cyan-100 text-cyan-800",
  youtube: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors: Record<AccessStatus, string> = {
  active: "bg-green-100 text-green-800",
  revoked: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-600",
};

function toDatetimeStr(ts: { seconds: number } | undefined | null): string {
  if (!ts) return "";
  try {
    return new Date(ts.seconds * 1000).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function VirtualAccessPage() {
  const [items, setItems] = useState<ConferenceVirtualAccessDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceVirtualAccessDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [filterSession, setFilterSession] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/virtual-access");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load virtual access records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  function openCreate() {
    setEditItem(null);
    setForm({ ...defaultForm, accessCode: generateAccessCode() });
    setDialogOpen(true);
  }

  function openEdit(item: ConferenceVirtualAccessDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      sessionId: item.sessionId,
      sessionTitle: item.sessionTitle,
      attendeeEmail: item.attendeeEmail,
      attendeeName: item.attendeeName ?? "",
      ticketType: item.ticketType ?? "",
      ticketId: item.ticketId ?? "",
      virtualPlatform: item.virtualPlatform,
      virtualLink: item.virtualLink,
      virtualMeetingId: item.virtualMeetingId ?? "",
      virtualPasscode: item.virtualPasscode ?? "",
      accessCode: item.accessCode ?? "",
      status: item.status,
      expiresAt: toDatetimeStr(item.expiresAt as unknown as { seconds: number }),
      notes: item.notes ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.attendeeEmail || !form.virtualLink || !form.sessionTitle) {
      toast.error("Attendee email, session title, and virtual link are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt || null,
      };
      if (editItem) {
        await fetch(`/api/conference/virtual-access/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Access record updated");
      } else {
        await fetch("/api/conference/virtual-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Access record created");
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
      await fetch(`/api/conference/virtual-access/${deleteId}`, { method: "DELETE" });
      toast.success("Access record deleted");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleRevoke(item: ConferenceVirtualAccessDoc) {
    try {
      await fetch(`/api/conference/virtual-access/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "revoked" }),
      });
      toast.success(`Access revoked for ${item.attendeeEmail}`);
      fetchItems();
    } catch {
      toast.error("Failed to revoke access");
    }
  }

  async function handleReactivate(item: ConferenceVirtualAccessDoc) {
    try {
      await fetch(`/api/conference/virtual-access/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      toast.success(`Access reactivated for ${item.attendeeEmail}`);
      fetchItems();
    } catch {
      toast.error("Failed to reactivate access");
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  }

  const filtered = items.filter((item) => {
    const matchSession = filterSession
      ? item.sessionTitle.toLowerCase().includes(filterSession.toLowerCase()) ||
        item.sessionId.includes(filterSession)
      : true;
    const matchStatus = filterStatus === "all" ? true : item.status === filterStatus;
    return matchSession && matchStatus;
  });

  const grouped = filtered.reduce<Record<string, ConferenceVirtualAccessDoc[]>>((acc, item) => {
    const key = item.sessionTitle || item.sessionId || "Unknown Session";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const activeCount = items.filter((i) => i.status === "active").length;
  const revokedCount = items.filter((i) => i.status === "revoked").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Virtual Session Access</h1>
          <p className="text-muted-foreground text-sm">
            Manage Zoom, Teams, and other virtual meeting links and attendee access
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Grant Access</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Video className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{items.length}</p>
                <p className="text-xs text-muted-foreground">Total Access Grants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <ShieldOff className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{revokedCount}</p>
                <p className="text-xs text-muted-foreground">Revoked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Filter by session name or ID..."
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">No virtual access records yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Grant attendees access to virtual sessions via Zoom, Teams, or other platforms.
            </p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />Grant Access
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).sort().map((sessionName) => (
            <div key={sessionName}>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {sessionName}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {grouped[sessionName].length} attendee{grouped[sessionName].length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="space-y-2">
                {grouped[sessionName].map((item) => (
                  <Card key={item.id} className={item.status === "revoked" ? "opacity-60" : ""}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Platform badge */}
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${platformColors[item.virtualPlatform]}`}>
                            {platformLabels[item.virtualPlatform]}
                          </span>

                          {/* Attendee info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{item.attendeeEmail}</span>
                              {item.attendeeName && (
                                <span className="text-xs text-muted-foreground truncate">({item.attendeeName})</span>
                              )}
                              {item.ticketType && (
                                <Badge variant="outline" className="text-xs shrink-0">{item.ticketType}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                                {item.virtualLink}
                              </span>
                              {item.virtualMeetingId && (
                                <span className="text-xs text-muted-foreground">ID: {item.virtualMeetingId}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Copy link"
                            onClick={() => copyToClipboard(item.virtualLink, "Meeting link")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <a href={item.virtualLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Open link">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                          {item.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => handleRevoke(item)}
                            >
                              <ShieldOff className="h-3 w-3 mr-1" />Revoke
                            </Button>
                          ) : item.status === "revoked" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                              onClick={() => handleReactivate(item)}
                            >
                              <ShieldCheck className="h-3 w-3 mr-1" />Restore
                            </Button>
                          ) : null}
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              {editItem ? "Edit Virtual Access" : "Grant Virtual Access"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Session info */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Session Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Session Title *</Label>
                  <Input
                    value={form.sessionTitle}
                    onChange={(e) => setForm({ ...form, sessionTitle: e.target.value })}
                    placeholder="Opening Keynote"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Session ID</Label>
                  <Input
                    value={form.sessionId}
                    onChange={(e) => setForm({ ...form, sessionId: e.target.value })}
                    placeholder="Firestore document ID"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Conference ID</Label>
                  <Input
                    value={form.conferenceId}
                    onChange={(e) => setForm({ ...form, conferenceId: e.target.value })}
                    placeholder="Conference document ID"
                  />
                </div>
              </div>
            </div>

            {/* Attendee info */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Attendee</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Attendee Email *</Label>
                  <Input
                    type="email"
                    value={form.attendeeEmail}
                    onChange={(e) => setForm({ ...form, attendeeEmail: e.target.value })}
                    placeholder="attendee@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Attendee Name</Label>
                  <Input
                    value={form.attendeeName}
                    onChange={(e) => setForm({ ...form, attendeeName: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Ticket Type</Label>
                  <Input
                    value={form.ticketType}
                    onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
                    placeholder="VIP, Virtual, General..."
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Ticket / Order ID</Label>
                  <Input
                    value={form.ticketId}
                    onChange={(e) => setForm({ ...form, ticketId: e.target.value })}
                    placeholder="Registration or order reference"
                  />
                </div>
              </div>
            </div>

            {/* Virtual link details */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Virtual Meeting Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <Select
                    value={form.virtualPlatform}
                    onValueChange={(v) => setForm({ ...form, virtualPlatform: v as Platform })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(platformLabels) as Platform[]).map((p) => (
                        <SelectItem key={p} value={p}>{platformLabels[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Meeting ID</Label>
                  <Input
                    value={form.virtualMeetingId}
                    onChange={(e) => setForm({ ...form, virtualMeetingId: e.target.value })}
                    placeholder="e.g. 123 456 7890"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Meeting / Join Link *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.virtualLink}
                      onChange={(e) => setForm({ ...form, virtualLink: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                      className="flex-1"
                    />
                    {form.virtualLink && (
                      <a href={form.virtualLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" type="button">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Passcode</Label>
                  <Input
                    value={form.virtualPasscode}
                    onChange={(e) => setForm({ ...form, virtualPasscode: e.target.value })}
                    placeholder="Meeting passcode"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Access Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.accessCode}
                      onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                      placeholder="Internal access token"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      title="Generate"
                      onClick={() => setForm({ ...form, accessCode: generateAccessCode() })}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & expiry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AccessStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Expires At</Label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes about this access grant..."
              />
            </div>

            {/* Quick copy panel when editing */}
            {editItem && editItem.status === "active" && (
              <div className="p-3 border border-dashed rounded-lg space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Mail className="h-3 w-3" />Quick Copy for Email
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => copyToClipboard(editItem.virtualLink, "Meeting link")}
                  >
                    <Copy className="h-3 w-3 mr-1" />Copy Link
                  </Button>
                  {editItem.virtualMeetingId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => copyToClipboard(editItem.virtualMeetingId!, "Meeting ID")}
                    >
                      <Copy className="h-3 w-3 mr-1" />Copy Meeting ID
                    </Button>
                  )}
                  {editItem.virtualPasscode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => copyToClipboard(editItem.virtualPasscode!, "Passcode")}
                    >
                      <Copy className="h-3 w-3 mr-1" />Copy Passcode
                    </Button>
                  )}
                  {editItem.accessCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => copyToClipboard(editItem.accessCode!, "Access code")}
                    >
                      <Copy className="h-3 w-3 mr-1" />Copy Access Code
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Grant Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Access Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the virtual access grant. The attendee will lose access
              to the meeting link. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
