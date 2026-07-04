"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Check, ChevronLeft, Loader2, Ticket, User, CreditCard, Calendar, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceTicketDoc } from "@/lib/schema";

const steps = [
  { label: "Ticket", icon: Ticket },
  { label: "Details", icon: User },
  { label: "Checkout", icon: CreditCard },
  { label: "Confirm", icon: Check },
];

const CONFERENCE_ID = "hubzone-rise-2026";

function ConferenceRegisterContent() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<ConferenceTicketDoc[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<ConferenceTicketDoc | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    title: "",
    dietaryRestrictions: "",
    accessibilityNeeds: "",
    isMember: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const registrationParam = searchParams.get("registration");

  useEffect(() => {
    if (sessionId && registrationParam) {
      confirmPayment(sessionId, registrationParam);
    }
  }, [sessionId, registrationParam]);

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      try {
        const ticketQuery = query(
          collection(db, COLLECTIONS.CONFERENCE_TICKETS),
          where("conferenceId", "==", CONFERENCE_ID),
          where("isActive", "==", true),
          orderBy("displayOrder", "asc")
        );
        const ticketSnap = await getDocs(ticketQuery);
        const ticketData = ticketSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ConferenceTicketDoc);
        setTickets(ticketData);
      } catch (error) {
        console.error("Error loading tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
    }
    loadData();
  }, []);

  async function confirmPayment(sessionId: string, registrationId: string) {
    try {
      const res = await fetch(`/api/conference/register/confirm?session_id=${sessionId}&registration=${registrationId}`);
      const json = await res.json();
      if (json.status === "confirmed") {
        setRegistrationId(registrationId);
        setStep(3);
        toast.success("Registration confirmed!");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Could not confirm payment.");
    }
  }

  function getDiscountedPrice(ticket: ConferenceTicketDoc, code: string) {
    const normalized = code.trim().toUpperCase();
    if (normalized === "EARLYBIRD") return Math.max(0, ticket.price - 50);
    if (normalized === "GROUP10") return Math.max(0, ticket.price * 0.9);
    return ticket.price;
  }

  async function handleSubmit() {
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      const amount = getDiscountedPrice(selectedTicket, couponCode);
      const successUrl = `${window.location.origin}/conference/register`;
      const cancelUrl = `${window.location.origin}/conference/tickets`;
      const payload = {
        conferenceId: CONFERENCE_ID,
        ticketId: selectedTicket.id,
        ...form,
        couponCode,
        successUrl,
        cancelUrl,
      };
      const res = await fetch("/api/conference/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Registration failed");
        return;
      }
      setRegistrationId(json.registrationId);
      if (json.amountPaid === 0) {
        setStep(3);
        toast.success("Registration confirmed!");
      } else if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to submit registration.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            <Calendar className="h-3 w-3 mr-1" />
            July 21-22, 2026
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Register for <span className="text-[#c9a227]">HUBZone on the Rise</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Secure your spot at the 2026 National HUBZone Conference.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Select Your Ticket</CardTitle>
                <CardDescription>Choose the registration option that fits your needs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingTickets ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ticket className="h-10 w-10 mx-auto mb-3" />
                    <p>Tickets are not yet available. Please check back soon.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`cursor-pointer border rounded-xl p-5 transition-all ${
                          selectedTicket?.id === ticket.id
                            ? "border-[#c9a227] bg-[#c9a227]/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg">{ticket.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                            {ticket.perks && (
                              <ul className="flex flex-wrap gap-2 mt-2">
                                {ticket.perks.map((perk, i) => (
                                  <li key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                                    {perk}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#c9a227]">
                              ${getDiscountedPrice(ticket, couponCode)}
                            </p>
                            <p className="text-xs text-muted-foreground">{ticket.currency || "USD"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label>Promo Code</Label>
                    <Input
                      placeholder="Try EARLYBIRD or GROUP10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={!selectedTicket || loadingTickets}
                    onClick={() => setStep(1)}
                    className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
                  >
                    Continue
                    <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && selectedTicket && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Attendee Information</CardTitle>
                <CardDescription>Tell us about yourself so we can prepare for your arrival.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietary">Dietary Restrictions</Label>
                  <Textarea
                    id="dietary"
                    value={form.dietaryRestrictions}
                    onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })}
                    placeholder="Vegetarian, allergies, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessibility">Accessibility Needs</Label>
                  <Textarea
                    id="accessibility"
                    value={form.accessibilityNeeds}
                    onChange={(e) => setForm({ ...form, accessibilityNeeds: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="member"
                    checked={form.isMember}
                    onCheckedChange={(checked) => setForm({ ...form, isMember: checked === true })}
                  />
                  <Label htmlFor="member" className="font-normal">
                    I am a HUBZone Contractors National Council member
                  </Label>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    disabled={!form.firstName || !form.lastName || !form.email}
                    onClick={() => setStep(2)}
                    className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
                  >
                    Continue
                    <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && selectedTicket && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Review & Checkout</CardTitle>
                <CardDescription>Confirm your registration details and complete payment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ticket</span>
                    <span className="font-medium">{selectedTicket.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attendee</span>
                    <span className="font-medium">{form.firstName} {form.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{form.email}</span>
                  </div>
                  {form.organization && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Organization</span>
                      <span className="font-medium">{form.organization}</span>
                    </div>
                  )}
                  {couponCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Promo Code</span>
                      <span className="font-medium uppercase">{couponCode}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-[#c9a227]">
                      ${getDiscountedPrice(selectedTicket, couponCode)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to Stripe to complete payment securely. Government registration and free tickets will be confirmed immediately.
                </p>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Complete Registration
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && registrationId && (
            <Card>
              <CardHeader className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Registration Confirmed</CardTitle>
                <CardDescription>
                  Thank you for registering for HUBZone on the Rise. A confirmation email is on its way.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Registration ID</p>
                  <p className="text-lg font-mono font-medium">{registrationId}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white" asChild>
                    <Link href="/conference/schedule">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/conference/venue">
                      <MapPin className="h-4 w-4 mr-2" />
                      Venue & Hotel
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ConferenceRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ConferenceRegisterContent />
    </Suspense>
  );
}
