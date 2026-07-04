"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, Star, Zap, Award, Crown } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceSponsorshipPackageDoc } from "@/lib/schema";

const CONFERENCE_ID = "hubzone-rise-2026";
const sponsorTiers = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "custom", label: "Custom / Undecided" },
];

export default function SponsorshipPage() {
  const [packages, setPackages] = useState<ConferenceSponsorshipPackageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    tier: "",
    message: "",
  });

  useEffect(() => {
    const fetchPackages = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_SPONSORSHIP_PACKAGES),
          where("isActive", "==", true),
          orderBy("price", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceSponsorshipPackageDoc[];
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const defaultPackages = [
    {
      id: "platinum",
      name: "Platinum Sponsor",
      price: 25000,
      description: "Premier visibility and exclusive benefits",
      benefits: [
        { label: "Premium booth space (20x20)", included: true },
        { label: "Keynote speaking opportunity", included: true },
        { label: "Logo on all conference materials", included: true },
        { label: "20 complimentary registrations", included: true },
        { label: "VIP reception access", included: true },
        { label: "Full-page program ad", included: true },
        { label: "Social media promotion", included: true },
      ],
      tier: "platinum" as const,
      icon: Crown,
    },
    {
      id: "gold",
      name: "Gold Sponsor",
      price: 15000,
      description: "High visibility and networking opportunities",
      benefits: [
        { label: "Large booth space (10x20)", included: true },
        { label: "Panel speaking opportunity", included: true },
        { label: "Logo on conference website", included: true },
        { label: "10 complimentary registrations", included: true },
        { label: "Networking event access", included: true },
        { label: "Half-page program ad", included: true },
        { label: "Social media mentions", included: true },
      ],
      tier: "gold" as const,
      icon: Award,
    },
    {
      id: "silver",
      name: "Silver Sponsor",
      price: 7500,
      description: "Great visibility and brand recognition",
      benefits: [
        { label: "Standard booth space (10x10)", included: true },
        { label: "Logo on conference website", included: true },
        { label: "5 complimentary registrations", included: true },
        { label: "Networking event access", included: true },
        { label: "Quarter-page program ad", included: true },
        { label: "Email recognition", included: true },
      ],
      tier: "silver" as const,
      icon: Star,
    },
    {
      id: "bronze",
      name: "Bronze Sponsor",
      price: 3500,
      description: "Entry-level sponsorship with solid benefits",
      benefits: [
        { label: "Logo on conference website", included: true },
        { label: "2 complimentary registrations", included: true },
        { label: "Name in program", included: true },
        { label: "Social media thank you", included: true },
      ],
      tier: "bronze" as const,
      icon: Zap,
    },
  ];

  const displayPackages = packages.length > 0 
    ? packages.map((p) => ({ ...p, icon: defaultPackages.find(d => d.tier === p.tier)?.icon || Star }))
    : defaultPackages;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organizationName || !form.contactName || !form.contactEmail || !form.tier) {
      toast.error("Please fill out organization, contact name, email, and tier.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/conference/sponsor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId: CONFERENCE_ID,
          ...form,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      toast.success("Sponsor inquiry submitted. We will be in touch soon.");
    } catch (error) {
      console.error(error);
      toast.error("Could not submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            Partnership Opportunities
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Sponsorship <span className="text-[#c9a227]">Packages</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Partner with the National HUBZone Conference and connect with 500+ 
            federal contractors, agencies, and industry leaders.
          </p>
        </div>
      </section>

      {/* Why Sponsor */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Why Sponsor?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Reach decision-makers and support the HUBZone business community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Brand Visibility", desc: "Showcase your brand to 500+ attendees" },
              { title: "Networking", desc: "Connect with federal agencies and primes" },
              { title: "Thought Leadership", desc: "Position your company as an industry leader" },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">Loading packages...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayPackages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <Card
                    key={pkg.id}
                    className={`relative ${pkg.tier === "platinum" ? "border-[#c9a227] shadow-xl scale-105" : ""}`}
                  >
                    {pkg.tier === "platinum" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#c9a227] text-[#1a2b4a] px-4 py-1">
                          Best Value
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="mx-auto p-3 bg-[#1e3a5f]/10 rounded-full w-fit mb-4">
                        <Icon className="h-6 w-6 text-[#1e3a5f]" />
                      </div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-center mb-6">
                        <span className="text-3xl font-bold">${pkg.price.toLocaleString()}</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {(pkg.benefits || []).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {benefit.label}
                            {"details" in benefit && benefit.details && <span className="text-muted-foreground ml-1">({benefit.details})</span>}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full ${pkg.tier === "platinum" ? "bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a]" : "bg-[#1e3a5f] hover:bg-[#152a45]"}`}
                        asChild
                      >
                        <a href="mailto:info@hubzonecouncil.org">Inquire Now</a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Custom Sponsorship / Inquiry Form */}
      <section className="py-16 bg-[#1e3a5f] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Submit your inquiry below or contact us for a tailored sponsorship package.
            </p>
          </div>
          {submitted ? (
            <Card className="bg-white text-foreground">
              <CardContent className="p-8 text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thank You</h3>
                <p className="text-muted-foreground">Your sponsorship inquiry has been received. Our team will contact you soon.</p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="bg-white text-foreground">
                <CardContent className="p-8 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization *</Label>
                      <Input
                        id="organizationName"
                        value={form.organizationName}
                        onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        value={form.contactPhone}
                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website</Label>
                      <Input
                        id="websiteUrl"
                        value={form.websiteUrl}
                        onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tier">Sponsorship Tier *</Label>
                      <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })} required>
                        <SelectTrigger id="tier">
                          <SelectValue placeholder="Select a tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {sponsorTiers.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message / Goals</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your organization and sponsorship goals..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold"
                    >
                      {submitting ? "Submitting..." : "Submit Sponsorship Inquiry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                      asChild
                    >
                      <a href="mailto:info@hubzonecouncil.org">Email Us Instead</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
