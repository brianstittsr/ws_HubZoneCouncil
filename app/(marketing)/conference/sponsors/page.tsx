"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceSponsorDoc } from "@/lib/schema";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<ConferenceSponsorDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_SPONSORS),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceSponsorDoc[];
        setSponsors(data);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  const tiers = ["Platinum", "Gold", "Silver", "Bronze"];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            Our Partners
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Event <span className="text-[#c9a227]">Sponsors</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Thank you to our generous sponsors who make the National HUBZone 
            Conference possible.
          </p>
        </div>
      </section>

      {/* Become a Sponsor CTA */}
      <section className="py-8 bg-[#f8fafc] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-[#c9a227]" />
              <span className="font-medium">Interested in sponsoring?</span>
            </div>
            <Button className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a]" asChild>
              <a href="mailto:info@hubzonecouncil.org">Become a Sponsor</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Sponsors by Tier */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">Loading sponsors...</div>
          ) : sponsors.length > 0 ? (
            tiers.map((tier) => {
              const tierSponsors = sponsors.filter((s) => s.level === tier);
              if (tierSponsors.length === 0) return null;

              return (
                <div key={tier} className="mb-16 last:mb-0">
                  <div className="flex items-center gap-3 mb-8">
                    <Award className="h-6 w-6 text-[#c9a227]" />
                    <h2 className="text-2xl font-bold text-[#1e3a5f]">{tier} Sponsors</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tierSponsors.map((sponsor) => (
                      <Card key={sponsor.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="relative h-24 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                            {sponsor.logoUrl ? (
                              <Image
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                fill
                                className="object-contain p-4"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Award className="h-8 w-8 text-[#1e3a5f]/30" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-center">{sponsor.name}</h3>
                          {sponsor.website && (
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#c9a227] hover:underline text-sm block text-center mt-2"
                            >
                              Visit Website →
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Sponsor information coming soon.</p>
              <p className="text-sm text-muted-foreground mb-6">
                We're grateful for the support of organizations committed to HUBZone success.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:info@hubzonecouncil.org">Become a Sponsor</a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
