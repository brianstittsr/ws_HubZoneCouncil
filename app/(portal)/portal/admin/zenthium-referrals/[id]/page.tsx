"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Database,
  MapPin,
  Zap,
  Network,
  Droplets,
  User,
  Phone,
  Mail,
  Building2,
  CalendarClock,
  Loader2,
  Save,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { ReferralStatusBadge } from "@/components/zenthium/ReferralStatusBadge";
import { ReferralTimeline } from "@/components/zenthium/ReferralTimeline";
import { MeetingScheduler } from "@/components/zenthium/MeetingScheduler";
import type { ZenthiumReferralStatus } from "@/types/zenthium";
import { useUserProfile } from "@/contexts/user-profile-context";

const VALID_STATUSES: ZenthiumReferralStatus[] = [
  "Submitted",
  "Under Review",
  "Screening Complete",
  "Follow-Up Requested",
  "Meeting Scheduled",
  "Accepted",
  "Declined",
  "Closed",
];

interface ReferralDetail {
  id: string;
  title: string;
  propertyName: string;
  address: { street: string; city: string; state: string; zip: string; country: string };
  coordinates?: string;
  parcelNumber?: string;
  acreage?: number;
  squareFootage?: number;
  powerCapacityMW?: number;
  utilities?: string;
  fiberAvailability?: string;
  waterAvailability?: string;
  zoning?: string;
  ownership?: string;
  pricing?: string;
  description: string;
  environmentalNotes?: string;
  timeline?: string;
  poc: { name: string; email: string; phone: string; company: string };
  directContact: { name: string; email: string; phone: string; company: string };
  status: ZenthiumReferralStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusHistoryEntry {
  id: string;
  previousStatus: ZenthiumReferralStatus | null;
  newStatus: ZenthiumReferralStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

interface MeetingEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  agenda?: string;
  zoomJoinUrl?: string;
  createdAt: string;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function ContactCard({ title, contact }: { title: string; contact: { name: string; email: string; phone: string; company: string } }) {
  if (!contact.name && !contact.email) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="space-y-1">
        {contact.name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {contact.name}
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            {contact.company}
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ZenthiumReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useUserProfile();
  const isAdmin = profile.role === "admin" || profile.role === "superadmin";

  const userId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("svp_firebase_uid") ?? profile.email ?? "anonymous"
      : "anonymous";

  const [referral, setReferral] = useState<ReferralDetail | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newStatus, setNewStatus] = useState<ZenthiumReferralStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/zenthium/referrals/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      // Record lives in ZENTHIUM_LOCATION_SUBMISSIONS — redirect to the right page
      if (data.redirect) {
        router.replace(data.redirect);
        return;
      }
      setReferral(data.referral);
      setStatusHistory(data.statusHistory ?? []);
      setMeetings(data.meetings ?? []);
      setAdminNotes(data.referral.adminNotes ?? "");
      setNewStatus(data.referral.status);
    } catch (err) {
      console.error("Failed to load referral:", err);
      toast.error("Failed to load referral");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !referral) return;
    setIsSavingStatus(true);
    try {
      const res = await fetch(`/api/zenthium/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, changedBy: userId, note: statusNote }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Status updated");
      setStatusNote("");
      fetchDetail();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/zenthium/referrals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Referral not found.</p>
        <Button asChild variant="outline">
          <Link href="/portal/admin/zenthium-referrals">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/admin/zenthium-referrals">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{referral.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <ReferralStatusBadge status={referral.status} />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {referral.address.city}, {referral.address.state}
              </span>
              <span className="text-xs text-muted-foreground">
                Submitted {new Date(referral.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => setMeetingOpen(true)} variant="outline" className="shrink-0">
          <Video className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{referral.description}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Property Name" value={referral.propertyName} />
                <InfoRow label="Full Address" value={`${referral.address.street ? referral.address.street + ", " : ""}${referral.address.city}, ${referral.address.state} ${referral.address.zip}`} />
                <InfoRow label="Coordinates" value={referral.coordinates} />
                <InfoRow label="Parcel Number" value={referral.parcelNumber} />
                <InfoRow label="Acreage" value={referral.acreage != null ? `${referral.acreage} acres` : null} />
                <InfoRow label="Square Footage" value={referral.squareFootage != null ? `${referral.squareFootage.toLocaleString()} sq ft` : null} />
                <InfoRow label="Zoning" value={referral.zoning} />
                <InfoRow label="Timeline" value={referral.timeline} />
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {referral.powerCapacityMW != null && (
                  <div className="flex items-start gap-3">
                    <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Power Capacity</p>
                      <p className="text-sm">{referral.powerCapacityMW} MW</p>
                    </div>
                  </div>
                )}
                {referral.utilities && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Utilities</p>
                    <p className="text-sm">{referral.utilities}</p>
                  </div>
                )}
                {referral.fiberAvailability && (
                  <div className="flex items-start gap-3">
                    <Network className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fiber Availability</p>
                      <p className="text-sm">{referral.fiberAvailability}</p>
                    </div>
                  </div>
                )}
                {referral.waterAvailability && (
                  <div className="flex items-start gap-3">
                    <Droplets className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Water Availability</p>
                      <p className="text-sm">{referral.waterAvailability}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ownership & Pricing */}
          {(referral.ownership || referral.pricing) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ownership & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Ownership" value={referral.ownership} />
                <InfoRow label="Pricing" value={referral.pricing} />
              </CardContent>
            </Card>
          )}

          {/* Environmental Notes */}
          {referral.environmentalNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Environmental Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{referral.environmentalNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Meetings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Meetings</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setMeetingOpen(true)}>
                <CalendarClock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meetings scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {meetings.map((m) => (
                    <div key={m.id} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.date} at {m.time}</p>
                        {m.agenda && <p className="text-xs text-muted-foreground">{m.agenda}</p>}
                      </div>
                      {m.zoomJoinUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={m.zoomJoinUrl} target="_blank" rel="noopener noreferrer">
                            <Video className="h-3.5 w-3.5 mr-1" />
                            Join
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContactCard title="Point of Contact" contact={referral.poc} />
              <Separator />
              <ContactCard title="Direct Contact" contact={referral.directContact} />
            </CardContent>
          </Card>

          {/* Status Update (Admin) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as ZenthiumReferralStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <Label className="text-xs">Note (optional)</Label>
                  <Textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Reason for status change..."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={isSavingStatus || newStatus === referral.status}
                  className="w-full"
                  size="sm"
                >
                  {isSavingStatus && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Status
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this referral..."
                  rows={5}
                />
                <Button onClick={handleSaveNotes} disabled={isSavingNotes} className="w-full" size="sm" variant="outline">
                  {isSavingNotes ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralTimeline entries={statusHistory} />
            </CardContent>
          </Card>
        </div>
      </div>

      <MeetingScheduler
        referralId={id}
        referralTitle={referral.title}
        userId={userId}
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        onSuccess={fetchDetail}
      />
    </div>
  );
}
