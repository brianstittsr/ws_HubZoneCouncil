"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  MapPin,
  Zap,
  Network,
  Droplets,
  User,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PropertyType = "vacant_land" | "warehouse" | "industrial" | "office" | "data_center" | "power_plant" | "other";
type PowerType = "grid" | "behind_meter" | "renewable" | "combined" | "unknown";
type OwnershipType = "own" | "lease" | "option" | "other";
type EnvClearance = "clean" | "phase1_done" | "phase2_done" | "unknown" | "issues";

interface DirectContactOption {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  active: boolean;
}

interface SubmissionDetail {
  id: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterCompany: string;
  propertyName: string;
  propertyType: PropertyType;
  propertyTypeOther: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  coordinates: string;
  squareFootage: number;
  acreage?: number;
  powerAvailableMW: number;
  powerType?: PowerType;
  hasBackupPower: boolean;
  ceilingHeightFt?: number;
  isSingleStory: boolean;
  isFloor: boolean;
  fiberAvailable: boolean;
  fiberProviders: string;
  waterAvailable: boolean;
  waterSource: string;
  coolingCapacity: string;
  hvacInstalled: boolean;
  zoningClassification: string;
  directContactId: string;
  directContactName: string;
  directContactEmail: string;
  directContactPhone: string;
  directContactCompany: string;
  ownershipType?: OwnershipType;
  askingPrice: string;
  leaseRate: string;
  timeline: string;
  environmentalClearance?: EnvClearance;
  floodZone: boolean;
  additionalNotes: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  vacant_land: "Vacant / Greenfield Land",
  warehouse: "Vacant Warehouse",
  industrial: "Industrial Building",
  office: "Office / Commercial",
  data_center: "Existing Data Center",
  power_plant: "Power Plant / Energy Facility",
  other: "Other",
};

const STATUS_OPTIONS = ["Submitted", "Under Review", "Screening Complete", "Follow-Up Requested", "Meeting Scheduled", "Accepted", "Declined", "Closed"];

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm">{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</span>
    </div>
  );
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [directContacts, setDirectContacts] = useState<DirectContactOption[]>([]);

  const [edits, setEdits] = useState<Partial<SubmissionDetail>>({});
  const setE = <K extends keyof SubmissionDetail>(field: K, value: SubmissionDetail[K]) =>
    setEdits((prev) => ({ ...prev, [field]: value }));

  const get = <K extends keyof SubmissionDetail>(field: K): SubmissionDetail[K] =>
    (field in edits ? edits[field] : data?.[field]) as SubmissionDetail[K];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subRes, contactRes] = await Promise.all([
        fetch(`/api/zenthium/location-submissions/${id}`),
        fetch("/api/zenthium/direct-contacts"),
      ]);
      if (!subRes.ok) throw new Error("Not found");
      const subData = await subRes.json();
      const contactData = await contactRes.json();
      setData(subData.submission);
      setDirectContacts((contactData.contacts ?? []).filter((c: DirectContactOption) => c.active));
    } catch {
      toast.error("Failed to load submission");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (Object.keys(edits).length === 0) { toast.info("No changes to save"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/zenthium/location-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edits),
      });
      if (!res.ok) throw new Error();
      toast.success("Submission updated");
      setEdits({});
      fetchData();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/zenthium/location-submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Submission deleted");
      router.push("/portal/admin/zenthium-referrals/submissions");
    } catch {
      toast.error("Failed to delete submission");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Submission not found.</p>
        <Button asChild variant="outline">
          <Link href="/portal/admin/zenthium-referrals/submissions">Back to Submissions</Link>
        </Button>
      </div>
    );
  }

  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/admin/zenthium-referrals/submissions">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Submissions
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.propertyName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.city}, {data.state} — submitted by {data.submitterName} on{" "}
              {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Submitter */}
          <Card>
            <CardHeader><CardTitle className="text-base">Submitter Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
                <Input value={get("submitterName") ?? ""} onChange={(e) => setE("submitterName", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Company</Label>
                <Input value={get("submitterCompany") ?? ""} onChange={(e) => setE("submitterCompany", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                <Input type="email" value={get("submitterEmail") ?? ""} onChange={(e) => setE("submitterEmail", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</Label>
                <Input value={get("submitterPhone") ?? ""} onChange={(e) => setE("submitterPhone", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Property */}
          <Card>
            <CardHeader><CardTitle className="text-base">Property Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Property Name</Label>
                  <Input value={get("propertyName") ?? ""} onChange={(e) => setE("propertyName", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Property Type</Label>
                  <Select value={get("propertyType") ?? ""} onValueChange={(v) => setE("propertyType", v as PropertyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Street Address</Label>
                  <Input value={get("address") ?? ""} onChange={(e) => setE("address", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">City</Label>
                  <Input value={get("city") ?? ""} onChange={(e) => setE("city", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">State</Label>
                  <Input value={get("state") ?? ""} onChange={(e) => setE("state", e.target.value)} maxLength={2} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">ZIP</Label>
                  <Input value={get("zip") ?? ""} onChange={(e) => setE("zip", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Coordinates</Label>
                  <Input value={get("coordinates") ?? ""} onChange={(e) => setE("coordinates", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Square Footage</Label>
                  <Input type="number" value={get("squareFootage") ?? ""} onChange={(e) => setE("squareFootage", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Acreage</Label>
                  <Input type="number" value={get("acreage") ?? ""} onChange={(e) => setE("acreage", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Zoning Classification</Label>
                  <Input value={get("zoningClassification") ?? ""} onChange={(e) => setE("zoningClassification", e.target.value)} />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                {[
                  { id: "edit-single", field: "isSingleStory" as const, label: "Single-story building" },
                  { id: "edit-flat", field: "isFloor" as const, label: "Level, flat floor" },
                  { id: "edit-flood", field: "floodZone" as const, label: "Located in FEMA flood zone" },
                ].map(({ id: cid, field, label }) => (
                  <div key={cid} className="flex items-center gap-3">
                    <Checkbox
                      id={cid}
                      checked={!!get(field)}
                      onCheckedChange={(v) => setE(field, !!v as SubmissionDetail[typeof field])}
                    />
                    <Label htmlFor={cid} className="cursor-pointer text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" />Infrastructure</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Power (MW)</Label>
                  <Input type="number" value={get("powerAvailableMW") ?? ""} onChange={(e) => setE("powerAvailableMW", Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Power Type</Label>
                  <Select value={get("powerType") ?? ""} onValueChange={(v) => setE("powerType", v as PowerType)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid-Connected</SelectItem>
                      <SelectItem value="behind_meter">Behind-the-Meter</SelectItem>
                      <SelectItem value="renewable">Renewable</SelectItem>
                      <SelectItem value="combined">Combined / Hybrid</SelectItem>
                      <SelectItem value="unknown">Unknown / TBD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Ceiling Height (ft)</Label>
                  <Input type="number" value={get("ceilingHeightFt") ?? ""} onChange={(e) => setE("ceilingHeightFt", e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Environmental Status</Label>
                  <Select value={get("environmentalClearance") ?? ""} onValueChange={(v) => setE("environmentalClearance", v as EnvClearance)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clean">Clean</SelectItem>
                      <SelectItem value="phase1_done">Phase I — Clean</SelectItem>
                      <SelectItem value="phase2_done">Phase II — Remediated</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="issues">Known Issues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Network className="h-3.5 w-3.5" />Fiber Providers</Label>
                  <Input value={get("fiberProviders") ?? ""} onChange={(e) => setE("fiberProviders", e.target.value)} placeholder="AT&T, Lumen, Zayo..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Droplets className="h-3.5 w-3.5" />Water Source</Label>
                  <Input value={get("waterSource") ?? ""} onChange={(e) => setE("waterSource", e.target.value)} placeholder="Municipal, well..." />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cooling Capacity</Label>
                  <Input value={get("coolingCapacity") ?? ""} onChange={(e) => setE("coolingCapacity", e.target.value)} placeholder="System type or capacity" />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { id: "edit-backup", field: "hasBackupPower" as const, label: "Backup / redundant power available" },
                  { id: "edit-fiber", field: "fiberAvailable" as const, label: "Fiber connectivity on site" },
                  { id: "edit-water", field: "waterAvailable" as const, label: "Water access available" },
                  { id: "edit-hvac", field: "hvacInstalled" as const, label: "HVAC / cooling installed" },
                ].map(({ id: cid, field, label }) => (
                  <div key={cid} className="flex items-center gap-3">
                    <Checkbox
                      id={cid}
                      checked={!!get(field)}
                      onCheckedChange={(v) => setE(field, !!v as SubmissionDetail[typeof field])}
                    />
                    <Label htmlFor={cid} className="cursor-pointer text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ownership */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ownership & Financials</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Ownership Type</Label>
                <Select value={get("ownershipType") ?? ""} onValueChange={(v) => setE("ownershipType", v as OwnershipType)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">Owner outright</SelectItem>
                    <SelectItem value="lease">Holds lease / master lease</SelectItem>
                    <SelectItem value="option">Holds purchase option</SelectItem>
                    <SelectItem value="other">Other / Broker / Rep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Asking / Sale Price</Label>
                  <Input value={get("askingPrice") ?? ""} onChange={(e) => setE("askingPrice", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Lease Rate</Label>
                  <Input value={get("leaseRate") ?? ""} onChange={(e) => setE("leaseRate", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Timeline</Label>
                  <Input value={get("timeline") ?? ""} onChange={(e) => setE("timeline", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Additional Notes</Label>
                <Textarea value={get("additionalNotes") ?? ""} onChange={(e) => setE("additionalNotes", e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={get("status") ?? "Submitted"} onValueChange={(v) => setE("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasChanges && (
                <Button onClick={handleSave} disabled={isSaving} className="w-full" size="sm">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save All Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Direct Contact */}
          <Card>
            <CardHeader><CardTitle className="text-base">Direct Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Select Contact</Label>
                <Select
                  value={get("directContactId") ?? ""}
                  onValueChange={(cid) => {
                    const found = directContacts.find((c) => c.id === cid);
                    setEdits((prev) => ({
                      ...prev,
                      directContactId: cid,
                      directContactName: found?.name ?? "",
                      directContactEmail: found?.email ?? "",
                      directContactPhone: found?.phone ?? "",
                      directContactCompany: found?.company ?? "",
                    }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Choose contact..." /></SelectTrigger>
                  <SelectContent>
                    {directContacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.company ? ` — ${c.company}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              {[
                { icon: User, field: "directContactName" as const, label: "Name" },
                { icon: Building2, field: "directContactCompany" as const, label: "Company" },
                { icon: Mail, field: "directContactEmail" as const, label: "Email" },
                { icon: Phone, field: "directContactPhone" as const, label: "Phone" },
              ].map(({ icon: Icon, field, label }) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" />{label}
                  </Label>
                  <Input
                    value={get(field) ?? ""}
                    onChange={(e) => setE(field, e.target.value)}
                    placeholder={label}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader><CardTitle className="text-base">Admin Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={get("adminNotes") ?? ""}
                onChange={(e) => setE("adminNotes", e.target.value)}
                placeholder="Internal notes about this submission..."
                rows={5}
              />
              {hasChanges && (
                <Button onClick={handleSave} disabled={isSaving} className="w-full" size="sm" variant="outline">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Notes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader><CardTitle className="text-base">Record Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Submission ID" value={data.id} />
              <InfoRow label="Submitted" value={new Date(data.createdAt).toLocaleString()} />
              <InfoRow label="Last Updated" value={new Date(data.updatedAt).toLocaleString()} />
              <InfoRow label="Source" value="Public /zenthium form" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete the submission for{" "}
              <span className="font-semibold">{data.propertyName}</span> from{" "}
              <span className="font-semibold">{data.submitterName}</span>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
