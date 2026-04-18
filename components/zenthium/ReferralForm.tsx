"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ZenthiumReferralInput } from "@/types/zenthium";

const STEPS = [
  { id: 1, title: "Site Information", description: "Basic property details" },
  { id: 2, title: "Infrastructure", description: "Power, fiber, and utilities" },
  { id: 3, title: "Ownership & Pricing", description: "Ownership structure and pricing" },
  { id: 4, title: "Contacts", description: "Point of contact information" },
  { id: 5, title: "Additional Notes", description: "Environmental and other notes" },
];

const EMPTY_CONTACT = { name: "", email: "", phone: "", company: "" };

const DEFAULT_FORM: ZenthiumReferralInput = {
  userId: "",
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
  status: "Submitted",
};

interface ReferralFormProps {
  userId: string;
}

export function ReferralForm({ userId }: ReferralFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ZenthiumReferralInput>({ ...DEFAULT_FORM, userId });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setAddress = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));

  const setPoc = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, poc: { ...prev.poc, [field]: value } }));

  const setDirectContact = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, directContact: { ...prev.directContact, [field]: value } }));

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
    if (err) {
      setError(err);
      return;
    }
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
      const res = await fetch("/api/zenthium/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit referral");
      }

      const data = await res.json();
      toast.success("Referral submitted successfully");
      router.push(`/portal/admin/zenthium-referrals/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{STEPS[step - 1].title}</span>
          <span className="text-muted-foreground">Step {step} of {STEPS.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="hidden sm:flex justify-between">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id < step && setStep(s.id)}
              className={`text-xs ${s.id < step ? "text-primary cursor-pointer hover:underline" : s.id === step ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1].title}</CardTitle>
          <CardDescription>{STEPS[step - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── STEP 1: Site Information ── */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Referral Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="125-Acre Industrial Site — Phoenix, AZ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name *</Label>
                <Input id="propertyName" value={form.propertyName} onChange={(e) => set("propertyName", e.target.value)} placeholder="Desert Ridge Industrial Park" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" value={form.address.street} onChange={(e) => setAddress("street", e.target.value)} placeholder="1234 Industrial Blvd" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.address.city} onChange={(e) => setAddress("city", e.target.value)} placeholder="Phoenix" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" value={form.address.state} onChange={(e) => setAddress("state", e.target.value)} placeholder="AZ" maxLength={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" value={form.address.zip} onChange={(e) => setAddress("zip", e.target.value)} placeholder="85001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={form.address.country} onChange={(e) => setAddress("country", e.target.value)} placeholder="US" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates (lat,lng)</Label>
                  <Input id="coordinates" value={form.coordinates ?? ""} onChange={(e) => set("coordinates", e.target.value)} placeholder="33.4484,-112.0740" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcelNumber">Parcel Number</Label>
                  <Input id="parcelNumber" value={form.parcelNumber ?? ""} onChange={(e) => set("parcelNumber", e.target.value)} placeholder="123-45-678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acreage">Acreage</Label>
                  <Input id="acreage" type="number" min={0} value={form.acreage ?? ""} onChange={(e) => set("acreage", e.target.value ? Number(e.target.value) : undefined)} placeholder="125" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squareFootage">Square Footage</Label>
                  <Input id="squareFootage" type="number" min={0} value={form.squareFootage ?? ""} onChange={(e) => set("squareFootage", e.target.value ? Number(e.target.value) : undefined)} placeholder="500000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the property and its data center potential..." rows={4} />
              </div>
            </>
          )}

          {/* ── STEP 2: Infrastructure ── */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="powerCapacityMW">Power Capacity (MW)</Label>
                  <Input id="powerCapacityMW" type="number" min={0} step={0.1} value={form.powerCapacityMW ?? ""} onChange={(e) => set("powerCapacityMW", e.target.value ? Number(e.target.value) : undefined)} placeholder="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoning">Zoning Classification</Label>
                  <Input id="zoning" value={form.zoning ?? ""} onChange={(e) => set("zoning", e.target.value)} placeholder="M-1 Industrial" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="utilities">Utilities Description</Label>
                <Textarea id="utilities" value={form.utilities ?? ""} onChange={(e) => set("utilities", e.target.value)} placeholder="APS electric service, SRP backup, natural gas available..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiberAvailability">Fiber Availability</Label>
                <Textarea id="fiberAvailability" value={form.fiberAvailability ?? ""} onChange={(e) => set("fiberAvailability", e.target.value)} placeholder="CenturyLink, Cox, and Zayo fiber on-site..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterAvailability">Water Availability</Label>
                <Textarea id="waterAvailability" value={form.waterAvailability ?? ""} onChange={(e) => set("waterAvailability", e.target.value)} placeholder="City municipal water, reclaimed water available for cooling..." rows={2} />
              </div>
            </>
          )}

          {/* ── STEP 3: Ownership & Pricing ── */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ownership">Ownership Structure</Label>
                <Textarea id="ownership" value={form.ownership ?? ""} onChange={(e) => set("ownership", e.target.value)} placeholder="Fee simple ownership, single entity, no encumbrances..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing / Asking Price</Label>
                <Textarea id="pricing" value={form.pricing ?? ""} onChange={(e) => set("pricing", e.target.value)} placeholder="$15M asking price, willing to ground lease at $XX/acre/year..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Transaction Timeline</Label>
                <Input id="timeline" value={form.timeline ?? ""} onChange={(e) => set("timeline", e.target.value)} placeholder="Available immediately / 6-month due diligence period" />
              </div>
            </>
          )}

          {/* ── STEP 4: Contacts ── */}
          {step === 4 && (
            <>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Point of Contact (POC)</p>
              <div className="grid grid-cols-2 gap-4">
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

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Direct Contact</p>
                <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="environmentalNotes">Environmental Notes</Label>
                <Textarea id="environmentalNotes" value={form.environmentalNotes ?? ""} onChange={(e) => set("environmentalNotes", e.target.value)} placeholder="Phase I ESA completed, no known contamination..." rows={4} />
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-1">
                <p className="text-sm font-medium">Review Summary</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium">Property:</span> {form.propertyName || "—"}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium">Location:</span> {form.address.city ? `${form.address.city}, ${form.address.state}` : "—"}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium">Power Capacity:</span> {form.powerCapacityMW ? `${form.powerCapacityMW} MW` : "—"}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium">POC:</span> {form.poc.name || "—"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
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
              <><CheckCircle2 className="h-4 w-4 mr-2" />Submit Referral</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
