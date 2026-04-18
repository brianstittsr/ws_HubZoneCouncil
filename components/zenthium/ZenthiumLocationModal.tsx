"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PropertyType = "vacant_land" | "warehouse" | "industrial" | "office" | "data_center" | "power_plant" | "other";
type PowerType = "grid" | "behind_meter" | "renewable" | "combined" | "unknown";
type OwnershipType = "own" | "lease" | "option" | "other";
type EnvClearance = "clean" | "phase1_done" | "phase2_done" | "unknown" | "issues";

interface FormState {
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterCompany: string;
  propertyName: string;
  propertyType: PropertyType | "";
  propertyTypeOther: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  squareFootage: string;
  acreage: string;
  powerAvailableMW: string;
  powerType: PowerType | "";
  hasBackupPower: boolean;
  ceilingHeightFt: string;
  isSingleStory: boolean;
  isFloor: boolean;
  fiberAvailable: boolean;
  fiberProviders: string;
  waterAvailable: boolean;
  waterSource: string;
  coolingCapacity: string;
  hvacInstalled: boolean;
  zoningClassification: string;
  ownershipType: OwnershipType | "";
  askingPrice: string;
  leaseRate: string;
  timeline: string;
  environmentalClearance: EnvClearance | "";
  floodZone: boolean;
  coordinates: string;
  additionalNotes: string;
}

const EMPTY_FORM: FormState = {
  submitterName: "", submitterEmail: "", submitterPhone: "", submitterCompany: "",
  propertyName: "", propertyType: "", propertyTypeOther: "",
  address: "", city: "", state: "", zip: "", country: "US",
  squareFootage: "", acreage: "",
  powerAvailableMW: "", powerType: "", hasBackupPower: false,
  ceilingHeightFt: "", isSingleStory: true, isFloor: true,
  fiberAvailable: false, fiberProviders: "",
  waterAvailable: false, waterSource: "",
  coolingCapacity: "", hvacInstalled: false,
  zoningClassification: "",
  ownershipType: "", askingPrice: "", leaseRate: "", timeline: "",
  environmentalClearance: "", floodZone: false,
  coordinates: "", additionalNotes: "",
};

const STEP_LABELS = ["Your Info", "Property", "Infrastructure", "Financials"];

interface ZenthiumLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ZenthiumLocationModal({ open, onOpenChange, onSuccess }: ZenthiumLocationModalProps) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setForm({ ...EMPTY_FORM });
      setStep(1);
      setSubmitted(false);
    }
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    if (!form.submitterName || !form.submitterEmail || !form.propertyName || !form.city || !form.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    const sqft = Number(form.squareFootage);
    const mw = Number(form.powerAvailableMW);
    if (sqft < 10000) { toast.error("Minimum 10,000 sq ft required"); return; }
    if (mw < 20) { toast.error("Minimum 20 MW of power required"); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        squareFootage: sqft,
        acreage: form.acreage ? Number(form.acreage) : undefined,
        powerAvailableMW: mw,
        ceilingHeightFt: form.ceilingHeightFt ? Number(form.ceilingHeightFt) : undefined,
        powerType: form.powerType || undefined,
        propertyType: form.propertyType || "other",
        ownershipType: form.ownershipType || undefined,
        environmentalClearance: form.environmentalClearance || undefined,
      };

      const res = await fetch("/api/zenthium/location-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Submission failed");
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            Submit a Data Center Location
          </DialogTitle>
          <DialogDescription>
            Complete the form below to submit your property for Zenthium evaluation.
            Our team reviews every submission within 5 business days.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="p-4 rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Submission Received!</h3>
            <p className="text-muted-foreground max-w-sm">
              Thank you for submitting your location. Our team will review your property
              and reach out within 5 business days.
            </p>
            <Button onClick={() => handleOpenChange(false)} className="mt-4">Close</Button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Step tabs */}
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {STEP_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setStep(i + 1)}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                    step === i + 1
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step 1: Contact Info */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Contact Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.submitterName} onChange={(e) => set("submitterName", e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company / Organization</Label>
                    <Input value={form.submitterCompany} onChange={(e) => set("submitterCompany", e.target.value)} placeholder="Smith Properties LLC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input type="email" value={form.submitterEmail} onChange={(e) => set("submitterEmail", e.target.value)} placeholder="jane@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={form.submitterPhone} onChange={(e) => set("submitterPhone", e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Property */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Property Details</p>
                <div className="space-y-2">
                  <Label>Property Name / Description *</Label>
                  <Input value={form.propertyName} onChange={(e) => set("propertyName", e.target.value)} placeholder="Desert Ridge Warehouse Complex" />
                </div>
                <div className="space-y-2">
                  <Label>Property Type *</Label>
                  <Select value={form.propertyType} onValueChange={(v) => set("propertyType", v as PropertyType)}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacant_land">Vacant / Greenfield Land</SelectItem>
                      <SelectItem value="warehouse">Vacant Warehouse</SelectItem>
                      <SelectItem value="industrial">Industrial Building / Facility</SelectItem>
                      <SelectItem value="office">Office / Commercial Building</SelectItem>
                      <SelectItem value="data_center">Existing Data Center</SelectItem>
                      <SelectItem value="power_plant">Power Plant / Energy Facility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.propertyType === "other" && (
                  <div className="space-y-2">
                    <Label>Describe Property Type</Label>
                    <Input value={form.propertyTypeOther} onChange={(e) => set("propertyTypeOther", e.target.value)} placeholder="Steel mill, brownfield site, etc." />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Street Address *</Label>
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="1234 Industrial Blvd" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>City *</Label>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Phoenix" />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="AZ" maxLength={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Square Footage * (min 10,000)</Label>
                    <Input type="number" min={10000} value={form.squareFootage} onChange={(e) => set("squareFootage", e.target.value)} placeholder="250000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Acreage</Label>
                    <Input type="number" min={0} value={form.acreage} onChange={(e) => set("acreage", e.target.value)} placeholder="25" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-singleStory" checked={form.isSingleStory} onCheckedChange={(v) => set("isSingleStory", !!v)} />
                    <Label htmlFor="m-singleStory" className="cursor-pointer">Single-story building (no upper floors)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-flatFloor" checked={form.isFloor} onCheckedChange={(v) => set("isFloor", !!v)} />
                    <Label htmlFor="m-flatFloor" className="cursor-pointer">Level, flat floor (no elevation changes)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-floodZone" checked={form.floodZone} onCheckedChange={(v) => set("floodZone", !!v)} />
                    <Label htmlFor="m-floodZone" className="cursor-pointer">Located in a FEMA flood zone</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zoning Classification</Label>
                  <Input value={form.zoningClassification} onChange={(e) => set("zoningClassification", e.target.value)} placeholder="M-1 Heavy Industrial, M-2, etc." />
                </div>
              </div>
            )}

            {/* Step 3: Infrastructure */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Power & Infrastructure</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Available Power (MW) * (min 20)</Label>
                    <Input type="number" min={20} value={form.powerAvailableMW} onChange={(e) => set("powerAvailableMW", e.target.value)} placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Power Configuration</Label>
                    <Select value={form.powerType} onValueChange={(v) => set("powerType", v as PowerType)}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid-Connected</SelectItem>
                        <SelectItem value="behind_meter">Behind-the-Meter</SelectItem>
                        <SelectItem value="renewable">Renewable / Solar / Wind</SelectItem>
                        <SelectItem value="combined">Combined / Hybrid</SelectItem>
                        <SelectItem value="unknown">Unknown / TBD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="m-backup" checked={form.hasBackupPower} onCheckedChange={(v) => set("hasBackupPower", !!v)} />
                  <Label htmlFor="m-backup" className="cursor-pointer">Backup / redundant power available</Label>
                </div>
                <div className="space-y-2">
                  <Label>Clear Ceiling Height (ft)</Label>
                  <Input type="number" min={0} value={form.ceilingHeightFt} onChange={(e) => set("ceilingHeightFt", e.target.value)} placeholder="24" />
                  <p className="text-xs text-muted-foreground">18 ft minimum preferred; 24+ ft ideal</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-fiber" checked={form.fiberAvailable} onCheckedChange={(v) => set("fiberAvailable", !!v)} />
                    <Label htmlFor="m-fiber" className="cursor-pointer">Fiber connectivity on or near site</Label>
                  </div>
                  {form.fiberAvailable && (
                    <div className="ml-7 space-y-2">
                      <Label>Fiber Providers</Label>
                      <Input value={form.fiberProviders} onChange={(e) => set("fiberProviders", e.target.value)} placeholder="AT&T, Lumen, Zayo, etc." />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-water" checked={form.waterAvailable} onCheckedChange={(v) => set("waterAvailable", !!v)} />
                    <Label htmlFor="m-water" className="cursor-pointer">Water access available</Label>
                  </div>
                  {form.waterAvailable && (
                    <div className="ml-7 space-y-2">
                      <Label>Water Source</Label>
                      <Input value={form.waterSource} onChange={(e) => set("waterSource", e.target.value)} placeholder="Municipal, well, reclaimed, etc." />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Environmental Status</Label>
                  <Select value={form.environmentalClearance} onValueChange={(v) => set("environmentalClearance", v as EnvClearance)}>
                    <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clean">Clean — no known issues</SelectItem>
                      <SelectItem value="phase1_done">Phase I ESA completed — clean</SelectItem>
                      <SelectItem value="phase2_done">Phase II ESA completed — remediated</SelectItem>
                      <SelectItem value="unknown">Unknown / not assessed</SelectItem>
                      <SelectItem value="issues">Known environmental issues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Financials */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ownership & Financials</p>
                <div className="space-y-2">
                  <Label>Your Relationship to the Property</Label>
                  <Select value={form.ownershipType} onValueChange={(v) => set("ownershipType", v as OwnershipType)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">I own this property outright</SelectItem>
                      <SelectItem value="lease">I hold a lease / master lease</SelectItem>
                      <SelectItem value="option">I hold a purchase option</SelectItem>
                      <SelectItem value="other">Other / Broker / Representative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asking / Sale Price</Label>
                    <Input value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)} placeholder="$15,000,000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lease Rate</Label>
                    <Input value={form.leaseRate} onChange={(e) => set("leaseRate", e.target.value)} placeholder="$X/sq ft or $X/acre/yr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timeline / Availability</Label>
                  <Input value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="Available immediately / Q3 2025" />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} placeholder="Any other relevant details..." rows={3} />
                </div>

                {/* Checklist */}
                <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                  <p className="text-sm font-medium">Pre-Submission Checklist</p>
                  {[
                    { label: "Square footage ≥ 10,000 sq ft", ok: Number(form.squareFootage) >= 10000 },
                    { label: "Power availability ≥ 20 MW", ok: Number(form.powerAvailableMW) >= 20 },
                    { label: "Contact info provided", ok: !!form.submitterName && !!form.submitterEmail },
                    { label: "Property location provided", ok: !!form.city && !!form.state },
                  ].map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-sm">
                      {check.ok
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : <AlertCircle className="h-4 w-4 text-orange-500" />}
                      <span className={check.ok ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2 border-t">
              <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : handleOpenChange(false)}>
                {step === 1 ? "Cancel" : "Back"}
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Location
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
