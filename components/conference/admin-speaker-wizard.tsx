"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Check, User, FileText, Sparkles, Send, Upload } from "lucide-react";

const steps = [
  { label: "Profile", icon: User },
  { label: "Details", icon: FileText },
  { label: "Visibility", icon: Sparkles },
  { label: "Review", icon: Check },
];

const speakerTypes = [
  { value: "keynote", label: "Keynote" },
  { value: "featured", label: "Featured" },
  { value: "panelist", label: "Panelist" },
  { value: "workshop", label: "Workshop" },
  { value: "lightning", label: "Lightning Talk" },
  { value: "other", label: "Other" },
];

const CONFERENCE_ID = "hubzone-rise-2026";

interface SpeakerWizardDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function SpeakerWizardDialog({ open, onClose, onSaved }: SpeakerWizardDialogProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    conferenceId: CONFERENCE_ID,
    firstName: "",
    lastName: "",
    title: "",
    organization: "",
    bio: "",
    photoUrl: "",
    photoBase64: "",
    email: "",
    phone: "",
    websiteUrl: "",
    linkedinUrl: "",
    twitterHandle: "",
    speakerType: "panelist" as const,
    isPublic: true,
    isFeatured: false,
    displayOrder: "0",
  });

  const progress = ((step + 1) / steps.length) * 100;

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setForm((prev) => ({ ...prev, photoBase64: result, photoUrl: "" }));
    };
    reader.onerror = () => toast.error("Failed to read photo");
    reader.readAsDataURL(file);
  }

  function clearPhoto() {
    setForm((prev) => ({ ...prev, photoBase64: "", photoUrl: "" }));
  }

  const isStep0Valid = form.firstName && form.lastName && form.title && form.organization;
  const isStep1Valid = form.bio;

  async function handleSubmit() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        displayOrder: parseInt(form.displayOrder) || 0,
      };
      const res = await fetch("/api/conference/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Speaker added successfully");
      onSaved();
      onClose();
      setStep(0);
      setForm({
        conferenceId: CONFERENCE_ID,
        firstName: "",
        lastName: "",
        title: "",
        organization: "",
        bio: "",
        photoUrl: "",
        photoBase64: "",
        email: "",
        phone: "",
        websiteUrl: "",
        linkedinUrl: "",
        twitterHandle: "",
        speakerType: "panelist",
        isPublic: true,
        isFeatured: false,
        displayOrder: "0",
      });
    } catch {
      toast.error("Failed to add speaker");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Speaker Wizard</DialogTitle>
        </DialogHeader>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      i <= step ? "bg-[#c9a227] text-[#1a2b4a]" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4 py-2">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title / Role *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="CEO, Director, Professor" />
              </div>
              <div className="space-y-2">
                <Label>Organization *</Label>
                <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Bio *</Label>
                <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Speaker Photo</Label>
                <div className="flex items-center gap-4">
                  {(form.photoBase64 || form.photoUrl) ? (
                    <img
                      src={form.photoBase64 || form.photoUrl}
                      alt="Speaker preview"
                      className="h-16 w-16 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No photo
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor="wizard-photo-upload"
                      className="flex items-center justify-center gap-2 cursor-pointer border border-input rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Upload className="h-4 w-4" />
                      Upload photo
                      <input
                        id="wizard-photo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handlePhotoChange}
                      />
                    </Label>
                    {(form.photoBase64 || form.photoUrl) && (
                      <Button type="button" variant="ghost" size="sm" onClick={clearPhoto} className="h-auto px-2 py-1 text-xs">
                        Clear photo
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Max 2MB. JPG, PNG, or WebP recommended.</p>
              </div>
              <div className="space-y-2">
                <Label>Photo URL (optional)</Label>
                <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value, photoBase64: "" })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Twitter Handle</Label>
                <Input value={form.twitterHandle} onChange={(e) => setForm({ ...form, twitterHandle: e.target.value })} placeholder="@handle" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Speaker Type</Label>
                <Select value={form.speakerType} onValueChange={(v) => setForm({ ...form, speakerType: v as typeof form.speakerType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {speakerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                  <Label>Public</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                  <Label>Featured</Label>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {form.firstName} {form.lastName}</p>
              <p><span className="text-muted-foreground">Title:</span> {form.title}</p>
              <p><span className="text-muted-foreground">Organization:</span> {form.organization}</p>
              <p><span className="text-muted-foreground">Email:</span> {form.email}</p>
              <p><span className="text-muted-foreground">Type:</span> {form.speakerType}</p>
              <p><span className="text-muted-foreground">Public:</span> {form.isPublic ? "Yes" : "No"}</p>
              <p><span className="text-muted-foreground">Featured:</span> {form.isFeatured ? "Yes" : "No"}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={saving}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={saving || (step === 0 ? !isStep0Valid : step === 1 ? !isStep1Valid : false)}
              className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving || !isStep0Valid || !isStep1Valid}
              className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Add Speaker</>}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
