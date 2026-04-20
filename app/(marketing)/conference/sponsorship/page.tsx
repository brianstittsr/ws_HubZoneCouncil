"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Award, Crown } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceSponsorshipPackageDoc } from "@/lib/schema";

export default function SponsorshipPage() {
  const [packages, setPackages] = useState<ConferenceSponsorshipPackageDoc[]>([]);
  const [loading, setLoading] = useState(true);

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
        "Premium booth space (20x20)",
        "Keynote speaking opportunity",
        "Logo on all conference materials",
        "20 complimentary registrations",
        "VIP reception access",
        "Full-page program ad",
        "Social media promotion",
      ],
      tier: "Platinum",
      icon: Crown,
    },
    {
      id: "gold",
      name: "Gold Sponsor",
      price: 15000,
      description: "High visibility and networking opportunities",
      benefits: [
        "Large booth space (10x20)",
        "Panel speaking opportunity",
        "Logo on conference website",
        "10 complimentary registrations",
        "Networking event access",
        "Half-page program ad",
        "Social media mentions",
      ],
      tier: "Gold",
      icon: Award,
    },
    {
      id: "silver",
      name: "Silver Sponsor",
      price: 7500,
      description: "Great visibility and brand recognition",
      benefits: [
        "Standard booth space (10x10)",
        "Logo on conference website",
        "5 complimentary registrations",
        "Networking event access",
        "Quarter-page program ad",
        "Email recognition",
      ],
      tier: "Silver",
      icon: Star,
    },
    {
      id: "bronze",
      name: "Bronze Sponsor",
      price: 3500,
      description: "Entry-level sponsorship with solid benefits",
      benefits: [
        "Logo on conference website",
        "2 complimentary registrations",
        "Name in program",
        "Social media thank you",
      ],
      tier: "Bronze",
      icon: Zap,
    },
  ];

  const displayPackages = packages.length > 0 
    ? packages.map((p) => ({ ...p, icon: defaultPackages.find(d => d.tier === p.tier)?.icon || Star }))
    : defaultPackages;

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
                    className={`relative ${pkg.tier === "Platinum" ? "border-[#c9a227] shadow-xl scale-105" : ""}`}
                  >
                    {pkg.tier === "Platinum" && (
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
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full ${pkg.tier === "Platinum" ? "bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a]" : "bg-[#1e3a5f] hover:bg-[#152a45]"}`}
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

      {/* Custom Sponsorship */}
      <section className="py-16 bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Package?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            We can create a tailored sponsorship package that meets your specific 
            marketing and networking goals.
          </p>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1e3a5f]" asChild>
            <a href="mailto:info@hubzonecouncil.org">Contact Us</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
