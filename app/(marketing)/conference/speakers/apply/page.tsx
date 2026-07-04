"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2, Mic2, User, FileText, Sparkles } from "lucide-react";

const steps = [
  { label: "Profile", icon: User },
  { label: "Proposal", icon: FileText },
  { label: "Logistics", icon: Sparkles },
  { label: "Submit", icon: Check },
];

const thinkTankOptions = [
  "Workforce Development & Access to Capital",
  "Defense and National Security",
  "Energy, Infrastructure & Critical Minerals",
  "Manufacturing and Supply Chain",
  "Agriculture and Healthcare",
  "General Session",
];

const sessionFormats = [
  { value: "keynote", label: "Keynote" },
  { value: "panel", label: "Panel" },
  { value: "workshop", label: "Workshop" },
  { value: "breakout", label: "Breakout" },
  { value: "lightning", label: "Lightning Talk" },
];

const CONFERENCE_ID = "hubzone-rise-2026";

export default function SpeakerApplicationPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    organization: "",
    bio: "",
    photoUrl: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    websiteUrl: "",
    proposedSessionTitle: "",
    proposedSessionDescription: "",
    preferredTrack: "",
    sessionFormat: "",
    coSpeakerNames: "",
    travelNeeds: "",
    avNeeds: "",
    availability: "",
  });

  const progress = ((step + 1) / steps.length) * 100;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/conference/speaker-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId: CONFERENCE_ID,
          ...form,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to submit application");
        return;
      }
      setSubmitted(true);
      toast.success("Speaker application submitted!");
    } catch (error) {
      console.error("Speaker application error:", error);
      toast.error("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  const isStep0Valid = form.firstName && form.lastName && form.title && form.organization && form.bio && form.email;
  const isStep1Valid = form.proposedSessionTitle && form.proposedSessionDescription && form.sessionFormat;

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            <Mic2 className="h-3 w-3 mr-1" />
            Speaker Applications
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Apply to <span className="text-[#c9a227]">Speak</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Share your expertise with 500+ HUBZone business leaders, federal officials, and policymakers.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <Card className="text-center">
              <CardHeader>
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Application Received</CardTitle>
                <CardDescription>
                  Thank you for applying to speak at HUBZone on the Rise. Our team will review your proposal and contact you soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-[#1e3a5f] hover:bg-[#152a45] text-white" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  {steps.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            i <= step ? "bg-[#c9a227] text-[#1a2b4a]" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{steps[step].label}</CardTitle>
                  <CardDescription>
                    {step === 0 && "Tell us about yourself and your expertise."}
                    {step === 1 && "Tell us about your proposed session."}
                    {step === 2 && "Help us plan logistics for your participation."}
                    {step === 3 && "Review your application before submitting."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {step === 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Title / Role *</Label>
                        <Input
                          id="title"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization *</Label>
                        <Input
                          id="organization"
                          value={form.organization}
                          onChange={(e) => setForm({ ...form, organization: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio *</Label>
                        <Textarea
                          id="bio"
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          rows={4}
                          required
                          placeholder="Share your background and relevant expertise."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="photoUrl">Photo URL</Label>
                        <Input
                          id="photoUrl"
                          value={form.photoUrl}
                          onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={form.linkedinUrl}
                            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={form.websiteUrl}
                            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sessionTitle">Proposed Session Title *</Label>
                        <Input
                          id="sessionTitle"
                          value={form.proposedSessionTitle}
                          onChange={(e) => setForm({ ...form, proposedSessionTitle: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sessionDescription">Session Description *</Label>
                        <Textarea
                          id="sessionDescription"
                          value={form.proposedSessionDescription}
                          onChange={(e) => setForm({ ...form, proposedSessionDescription: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="track">Preferred Track / Think Tank</Label>
                        <Select value={form.preferredTrack} onValueChange={(value) => setForm({ ...form, preferredTrack: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a track" />
                          </SelectTrigger>
                          <SelectContent>
                            {thinkTankOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="format">Session Format *</Label>
                        <Select value={form.sessionFormat} onValueChange={(value) => setForm({ ...form, sessionFormat: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            {sessionFormats.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                {format.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coSpeakers">Co-Speaker Names</Label>
                        <Input
                          id="coSpeakers"
                          value={form.coSpeakerNames}
                          onChange={(e) => setForm({ ...form, coSpeakerNames: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="travel">Travel Needs</Label>
                        <Textarea
                          id="travel"
                          value={form.travelNeeds}
                          onChange={(e) => setForm({ ...form, travelNeeds: e.target.value })}
                          placeholder="Do you require travel or lodging assistance?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="av">A/V Requirements</Label>
                        <Textarea
                          id="av"
                          value={form.avNeeds}
                          onChange={(e) => setForm({ ...form, avNeeds: e.target.value })}
                          placeholder="Slides, video, audio, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        <Textarea
                          id="availability"
                          value={form.availability}
                          onChange={(e) => setForm({ ...form, availability: e.target.value })}
                          placeholder="Any date/time constraints on July 21-22, 2026?"
                        />
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {form.firstName} {form.lastName}</p>
                      <p><span className="text-muted-foreground">Title:</span> {form.title}</p>
                      <p><span className="text-muted-foreground">Organization:</span> {form.organization}</p>
                      <p><span className="text-muted-foreground">Email:</span> {form.email}</p>
                      <p><span className="text-muted-foreground">Session:</span> {form.proposedSessionTitle}</p>
                      <p><span className="text-muted-foreground">Track:</span> {form.preferredTrack || "Not specified"}</p>
                      <p><span className="text-muted-foreground">Format:</span> {form.sessionFormat}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    {step < steps.length - 1 ? (
                      <Button
                        disabled={step === 0 ? !isStep0Valid : step === 1 ? !isStep1Valid : false}
                        onClick={() => setStep((s) => s + 1)}
                        className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !isStep0Valid || !isStep1Valid}
                        className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <Check className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
