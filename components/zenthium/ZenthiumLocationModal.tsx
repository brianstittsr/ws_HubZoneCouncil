"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  coordinates: string;
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
  directContactId: string;
  directContactName: string;
  directContactEmail: string;
  directContactPhone: string;
  directContactCompany: string;
  ownershipType: OwnershipType | "";
  askingPrice: string;
  leaseRate: string;
  timeline: string;
  environmentalClearance: EnvClearance | "";
  floodZone: boolean;
  additionalNotes: string;
}

const EMPTY_FORM: FormState = {
  submitterName: "", submitterEmail: "", submitterPhone: "", submitterCompany: "",
  propertyName: "", propertyType: "", propertyTypeOther: "",
  address: "", city: "", state: "", zip: "", country: "US", coordinates: "",
  squareFootage: "", acreage: "",
  powerAvailableMW: "", powerType: "", hasBackupPower: false,
  ceilingHeightFt: "", isSingleStory: true, isFloor: true,
  fiberAvailable: false, fiberProviders: "",
  waterAvailable: false, waterSource: "",
  coolingCapacity: "", hvacInstalled: false,
  zoningClassification: "",
  directContactId: "", directContactName: "", directContactEmail: "",
  directContactPhone: "", directContactCompany: "",
  ownershipType: "", askingPrice: "", leaseRate: "", timeline: "",
  environmentalClearance: "", floodZone: false,
  additionalNotes: "",
};

const STEPS = [
  { id: 1, title: "Your Information",   description: "Contact details" },
  { id: 2, title: "Property Details",   description: "Location & physical specs" },
  { id: 3, title: "Infrastructure",     description: "Power, fiber & utilities" },
  { id: 4, title: "Direct Contact",     description: "Assign a Zenthium contact" },
  { id: 5, title: "Ownership & Notes",  description: "Financials & environmental" },
];

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
  const [error, setError] = useState<string | null>(null);
  const [directContacts, setDirectContacts] = useState<DirectContactOption[]>([]);

  useEffect(() => {
    fetch("/api/zenthium/direct-contacts")
      .then((r) => r.json())
      .then((data) =>
        setDirectContacts((data.contacts ?? []).filter((c: DirectContactOption) => c.active))
      )
      .catch(console.error);
  }, []);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenChange = (v: boolean) => {
    if (!v) { setForm({ ...EMPTY_FORM }); setStep(1); setSubmitted(false); setError(null); }
    onOpenChange(v);
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.submitterName.trim()) return "Full name is required";
      if (!form.submitterEmail.trim()) return "Email address is required";
    }
    if (step === 2) {
      if (!form.propertyName.trim()) return "Property name is required";
      if (!form.propertyType) return "Property type is required";
      if (!form.address.trim()) return "Street address is required";
      if (!form.city.trim()) return "City is required";
      if (!form.state.trim()) return "State is required";
      if (form.squareFootage && Number(form.squareFootage) < 10000) return "Minimum 10,000 sq ft required";
    }
    if (step === 3) {
      if (form.powerAvailableMW && Number(form.powerAvailableMW) < 20) return "Minimum 20 MW required";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handleBack = () => { setError(null); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (!form.submitterName || !form.submitterEmail || !form.propertyName || !form.city || !form.state) {
      setError("Please fill in all required fields before submitting");
      return;
    }
    const sqft = Number(form.squareFootage);
    const mw = Number(form.powerAvailableMW);
    if (sqft < 10000) { setError("Minimum 10,000 sq ft required"); return; }
    if (mw < 20) { setError("Minimum 20 MW of power required"); return; }

    setIsSubmitting(true);
    setError(null);
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? "Submission failed");
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            Submit a Data Center Location
          </DialogTitle>
          <DialogDescription>
            Complete all steps to submit your property for Zenthium evaluation.
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
          <div className="space-y-5 py-2">
            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium">{STEPS[step - 1].title}</span>
                <span>Step {step} of {STEPS.length}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              {/* Step pill nav */}
              <div className="flex gap-1 pt-1">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => s.id < step && setStep(s.id)}
                    disabled={s.id > step}
                    className={cn(
                      "flex-1 rounded-md py-1 text-xs font-medium transition-colors",
                      s.id === step
                        ? "bg-primary text-primary-foreground"
                        : s.id < step
                        ? "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {s.id}. {s.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* ── Step 1: Your Information ── */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Contact Information</p>
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

            {/* ── Step 2: Property Details ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Property Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Property Name *</Label>
                    <Input value={form.propertyName} onChange={(e) => set("propertyName", e.target.value)} placeholder="Desert Ridge Warehouse Complex" />
                  </div>
                  <div className="col-span-2 space-y-2">
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
                    <div className="col-span-2 space-y-2">
                      <Label>Describe Property Type</Label>
                      <Input value={form.propertyTypeOther} onChange={(e) => set("propertyTypeOther", e.target.value)} placeholder="Steel mill, brownfield site, etc." />
                    </div>
                  )}
                  <div className="col-span-2 space-y-2">
                    <Label>Street Address *</Label>
                    <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="1234 Industrial Blvd" />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Phoenix" />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="AZ" maxLength={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="85001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Coordinates (lat, lng)</Label>
                    <Input value={form.coordinates} onChange={(e) => set("coordinates", e.target.value)} placeholder="33.4484, -112.0740" />
                  </div>
                  <div className="space-y-2">
                    <Label>Square Footage * (min 10,000)</Label>
                    <Input type="number" min={10000} value={form.squareFootage} onChange={(e) => set("squareFootage", e.target.value)} placeholder="250000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Acreage</Label>
                    <Input type="number" min={0} value={form.acreage} onChange={(e) => set("acreage", e.target.value)} placeholder="25" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Zoning Classification</Label>
                    <Input value={form.zoningClassification} onChange={(e) => set("zoningClassification", e.target.value)} placeholder="M-1 Heavy Industrial, M-2, etc." />
                  </div>
                </div>
                <div className="space-y-3 pt-1">
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
              </div>
            )}

            {/* ── Step 3: Infrastructure ── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Power & Infrastructure</p>
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
                  <div className="col-span-2 space-y-2">
                    <Label>Clear Ceiling Height (ft)</Label>
                    <Input type="number" min={0} value={form.ceilingHeightFt} onChange={(e) => set("ceilingHeightFt", e.target.value)} placeholder="24" />
                    <p className="text-xs text-muted-foreground">18 ft minimum preferred; 24+ ft ideal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-backup" checked={form.hasBackupPower} onCheckedChange={(v) => set("hasBackupPower", !!v)} />
                    <Label htmlFor="m-backup" className="cursor-pointer">Backup / redundant power available</Label>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <Checkbox id="m-hvac" checked={form.hvacInstalled} onCheckedChange={(v) => set("hvacInstalled", !!v)} />
                    <Label htmlFor="m-hvac" className="cursor-pointer">HVAC / cooling system installed</Label>
                  </div>
                  {form.hvacInstalled && (
                    <div className="ml-7 space-y-2">
                      <Label>Cooling Capacity</Label>
                      <Input value={form.coolingCapacity} onChange={(e) => set("coolingCapacity", e.target.value)} placeholder="Capacity or system type" />
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

            {/* ── Step 4: Direct Contact ── */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Zenthium Direct Contact</p>
                <div className="space-y-2">
                  <Label>Select Contact</Label>
                  <Select
                    value={form.directContactId}
                    onValueChange={(id) => {
                      const found = directContacts.find((c) => c.id === id);
                      setForm((prev) => ({
                        ...prev,
                        directContactId: id,
                        directContactName: found?.name ?? "",
                        directContactEmail: found?.email ?? "",
                        directContactPhone: found?.phone ?? "",
                        directContactCompany: found?.company ?? "",
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Choose a Zenthium contact..." /></SelectTrigger>
                    <SelectContent>
                      {directContacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}{c.company ? ` — ${c.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Fields below auto-fill on selection but can be overridden.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.directContactName} onChange={(e) => set("directContactName", e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={form.directContactCompany} onChange={(e) => set("directContactCompany", e.target.value)} placeholder="Strategic Value+" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.directContactEmail} onChange={(e) => set("directContactEmail", e.target.value)} placeholder="john@svp.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.directContactPhone} onChange={(e) => set("directContactPhone", e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: Ownership & Notes ── */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ownership & Financials</p>
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
                  <Textarea value={form.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} placeholder="Any other relevant details about the property..." rows={3} />
                </div>

                {/* Pre-submission checklist */}
                <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                  <p className="text-sm font-medium">Pre-Submission Checklist</p>
                  {[
                    { label: "Contact info provided", ok: !!form.submitterName && !!form.submitterEmail },
                    { label: "Property name & address", ok: !!form.propertyName && !!form.city && !!form.state },
                    { label: "Square footage ≥ 10,000 sq ft", ok: Number(form.squareFootage) >= 10000 },
                    { label: "Power availability ≥ 20 MW", ok: Number(form.powerAvailableMW) >= 20 },
                    { label: "Property type selected", ok: !!form.propertyType },
                  ].map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-sm">
                      {check.ok
                        ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        : <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />}
                      <span className={check.ok ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2 border-t">
              <Button variant="outline" onClick={() => step > 1 ? handleBack() : handleOpenChange(false)}>
                {step === 1 ? "Cancel" : <><ChevronLeft className="h-4 w-4 mr-1" />Back</>}
              </Button>
              {step < STEPS.length ? (
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    : <><CheckCircle2 className="mr-2 h-4 w-4" />Submit Location</>}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
