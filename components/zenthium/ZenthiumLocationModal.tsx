"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface DirectContactOption {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  active: boolean;
}

const STEPS = [
  { id: 1, title: "Site Information",    description: "Basic property details" },
  { id: 2, title: "Infrastructure",      description: "Power, fiber, and utilities" },
  { id: 3, title: "Ownership & Pricing", description: "Ownership structure and pricing" },
  { id: 4, title: "Contacts",            description: "Point of contact information" },
  { id: 5, title: "Additional Notes",    description: "Environmental and other notes" },
];

const EMPTY_CONTACT = { name: "", email: "", phone: "", company: "" };

interface FormState {
  title: string;
  propertyName: string;
  address: { street: string; city: string; state: string; zip: string; country: string };
  coordinates: string;
  parcelNumber: string;
  acreage: number | undefined;
  squareFootage: number | undefined;
  powerCapacityMW: number | undefined;
  utilities: string;
  fiberAvailability: string;
  waterAvailability: string;
  zoning: string;
  ownership: string;
  pricing: string;
  description: string;
  environmentalNotes: string;
  timeline: string;
  poc: { name: string; email: string; phone: string; company: string };
  directContact: { name: string; email: string; phone: string; company: string };
}

const DEFAULT_FORM: FormState = {
  title: "",
  propertyName: "",
  address: { street: "", city: "", state: "", zip: "", country: "US" },
  coordinates: "",
  parcelNumber: "",
  acreage: undefined,
  squareFootage: undefined,
  powerCapacityMW: undefined,
  utilities: "",
  fiberAvailability: "",
  waterAvailability: "",
  zoning: "",
  ownership: "",
  pricing: "",
  description: "",
  environmentalNotes: "",
  timeline: "",
  poc: { ...EMPTY_CONTACT },
  directContact: { ...EMPTY_CONTACT },
};

interface ZenthiumLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ZenthiumLocationModal({ open, onOpenChange, onSuccess }: ZenthiumLocationModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directContactOptions, setDirectContactOptions] = useState<DirectContactOption[]>([]);
  const [selectedDirectContactId, setSelectedDirectContactId] = useState<string>("");

  useEffect(() => {
    fetch("/api/zenthium/direct-contacts")
      .then((r) => r.json())
      .then((data) =>
        setDirectContactOptions((data.contacts ?? []).filter((c: DirectContactOption) => c.active))
      )
      .catch(console.error);
  }, []);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setAddress = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));

  const setPoc = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, poc: { ...prev.poc, [field]: value } }));

  const setDirectContact = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, directContact: { ...prev.directContact, [field]: value } }));

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setForm({ ...DEFAULT_FORM });
      setStep(1);
      setSubmitted(false);
      setError(null);
      setSelectedDirectContactId("");
    }
    onOpenChange(v);
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.title.trim()) return "Title is required";
      if (!form.propertyName.trim()) return "Property name is required";
      if (!form.address.city.trim()) return "City is required";
      if (!form.address.state.trim()) return "State is required";
      if (!form.description.trim()) return "Description is required";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/zenthium/location-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to submit");
      }

      setSubmitted(true);
      onSuccess?.();
      toast.success("Location submitted successfully!");
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
          <div className="space-y-5 py-1">
            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step indicator — full width top bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">{STEPS[step - 1].title}</span>
                <span>Step {step} of {STEPS.length}</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              <div className="flex gap-1">
                {STEPS.map((s) => {
                  const isComplete = s.id < step;
                  const isCurrent = s.id === step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => isComplete && setStep(s.id)}
                      disabled={!isComplete}
                      title={s.title}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                          ? "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="h-3 w-3" /> : <span>{s.id}</span>}
                      <span className="hidden sm:inline truncate">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full-width form fields */}
            <div className="space-y-4">

              {/* ── STEP 1: Site Information ── */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="m-title">Referral Title *</Label>
                    <Input id="m-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="125-Acre Industrial Site — Phoenix, AZ" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-propertyName">Property Name *</Label>
                    <Input id="m-propertyName" value={form.propertyName} onChange={(e) => set("propertyName", e.target.value)} placeholder="Desert Ridge Industrial Park" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-street">Street Address</Label>
                    <Input id="m-street" value={form.address.street} onChange={(e) => setAddress("street", e.target.value)} placeholder="1234 Industrial Blvd" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="m-city">City *</Label>
                      <Input id="m-city" value={form.address.city} onChange={(e) => setAddress("city", e.target.value)} placeholder="Phoenix" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-state">State *</Label>
                      <Input id="m-state" value={form.address.state} onChange={(e) => setAddress("state", e.target.value)} placeholder="AZ" maxLength={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-zip">ZIP Code</Label>
                      <Input id="m-zip" value={form.address.zip} onChange={(e) => setAddress("zip", e.target.value)} placeholder="85001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-country">Country</Label>
                      <Input id="m-country" value={form.address.country} onChange={(e) => setAddress("country", e.target.value)} placeholder="US" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-coords">Coordinates (lat,lng)</Label>
                      <Input id="m-coords" value={form.coordinates} onChange={(e) => set("coordinates", e.target.value)} placeholder="33.4484,-112.0740" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-parcel">Parcel Number</Label>
                      <Input id="m-parcel" value={form.parcelNumber} onChange={(e) => set("parcelNumber", e.target.value)} placeholder="123-45-678" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-acreage">Acreage</Label>
                      <Input id="m-acreage" type="number" min={0} value={form.acreage ?? ""} onChange={(e) => set("acreage", e.target.value ? Number(e.target.value) : undefined)} placeholder="125" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-sqft">Square Footage</Label>
                      <Input id="m-sqft" type="number" min={0} value={form.squareFootage ?? ""} onChange={(e) => set("squareFootage", e.target.value ? Number(e.target.value) : undefined)} placeholder="500000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-desc">Description *</Label>
                    <Textarea id="m-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property and its data center potential..." rows={3} />
                  </div>
                </>
              )}

              {/* ── STEP 2: Infrastructure ── */}
              {step === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="m-power">Power Capacity (MW)</Label>
                      <Input id="m-power" type="number" min={0} step={0.1} value={form.powerCapacityMW ?? ""} onChange={(e) => set("powerCapacityMW", e.target.value ? Number(e.target.value) : undefined)} placeholder="50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="m-zoning">Zoning Classification</Label>
                      <Input id="m-zoning" value={form.zoning} onChange={(e) => set("zoning", e.target.value)} placeholder="M-1 Industrial" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-utilities">Utilities Description</Label>
                    <Textarea id="m-utilities" value={form.utilities} onChange={(e) => set("utilities", e.target.value)} placeholder="APS electric service, SRP backup, natural gas available..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-fiber">Fiber Availability</Label>
                    <Textarea id="m-fiber" value={form.fiberAvailability} onChange={(e) => set("fiberAvailability", e.target.value)} placeholder="CenturyLink, Cox, and Zayo fiber on-site..." rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-water">Water Availability</Label>
                    <Textarea id="m-water" value={form.waterAvailability} onChange={(e) => set("waterAvailability", e.target.value)} placeholder="City municipal water, reclaimed water available for cooling..." rows={2} />
                  </div>
                </>
              )}

              {/* ── STEP 3: Ownership & Pricing ── */}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="m-ownership">Ownership Structure</Label>
                    <Textarea id="m-ownership" value={form.ownership} onChange={(e) => set("ownership", e.target.value)} placeholder="Fee simple ownership, single entity, no encumbrances..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-pricing">Pricing / Asking Price</Label>
                    <Textarea id="m-pricing" value={form.pricing} onChange={(e) => set("pricing", e.target.value)} placeholder="$15M asking price, willing to ground lease at $XX/acre/year..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="m-timeline">Transaction Timeline</Label>
                    <Input id="m-timeline" value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="Available immediately / 6-month due diligence period" />
                  </div>
                </>
              )}

              {/* ── STEP 4: Contacts ── */}
              {step === 4 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Point of Contact (POC)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={form.poc.name} onChange={(e) => setPoc("name", e.target.value)} placeholder="Jane Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={form.poc.company} onChange={(e) => setPoc("company", e.target.value)} placeholder="Property Owner LLC" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={form.poc.email} onChange={(e) => setPoc("email", e.target.value)} placeholder="jane@owner.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={form.poc.phone} onChange={(e) => setPoc("phone", e.target.value)} placeholder="(602) 555-1234" />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Direct Contact</p>
                    <div className="space-y-2 mb-3">
                      <Label>Select Contact</Label>
                      <Select
                        value={selectedDirectContactId}
                        onValueChange={(contactId) => {
                          setSelectedDirectContactId(contactId);
                          const found = directContactOptions.find((c) => c.id === contactId);
                          if (found) {
                            setForm((prev) => ({
                              ...prev,
                              directContact: { name: found.name, email: found.email, phone: found.phone, company: found.company },
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a Zenthium contact..." />
                        </SelectTrigger>
                        <SelectContent>
                          {directContactOptions.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}{c.company ? ` — ${c.company}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Fields below are auto-filled but can be overridden.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={form.directContact.name} onChange={(e) => setDirectContact("name", e.target.value)} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input value={form.directContact.company} onChange={(e) => setDirectContact("company", e.target.value)} placeholder="Broker Realty Group" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={form.directContact.email} onChange={(e) => setDirectContact("email", e.target.value)} placeholder="john@broker.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={form.directContact.phone} onChange={(e) => setDirectContact("phone", e.target.value)} placeholder="(602) 555-5678" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 5: Additional Notes ── */}
              {step === 5 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="m-env">Environmental Notes</Label>
                    <Textarea id="m-env" value={form.environmentalNotes} onChange={(e) => set("environmentalNotes", e.target.value)} placeholder="Phase I ESA completed, no known contamination..." rows={4} />
                  </div>
                  <div className="p-4 bg-muted rounded-lg space-y-1.5">
                    <p className="text-sm font-semibold">Review Summary</p>
                    <p className="text-sm text-muted-foreground"><span className="font-medium">Property:</span> {form.propertyName || "—"}</p>
                    <p className="text-sm text-muted-foreground"><span className="font-medium">Location:</span> {form.address.city ? `${form.address.city}, ${form.address.state}` : "—"}</p>
                    <p className="text-sm text-muted-foreground"><span className="font-medium">Power Capacity:</span> {form.powerCapacityMW ? `${form.powerCapacityMW} MW` : "—"}</p>
                    <p className="text-sm text-muted-foreground"><span className="font-medium">POC:</span> {form.poc.name || "—"}</p>
                  </div>
                </>
              )}

            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2 border-t">
              <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {step < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4 mr-2" />Submit Location</>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
