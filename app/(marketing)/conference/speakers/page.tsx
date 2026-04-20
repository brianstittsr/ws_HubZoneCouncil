"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mic2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceSpeakerDoc } from "@/lib/schema";

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<ConferenceSpeakerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeakers = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_SPEAKERS),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceSpeakerDoc[];
        setSpeakers(data);
      } catch (error) {
        console.error("Error fetching speakers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpeakers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            50+ Featured Speakers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-[#c9a227]">Speakers</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Industry leaders, policymakers, and successful HUBZone business owners 
            sharing insights and strategies for federal contracting success.
          </p>
        </div>
      </section>

      {/* Keynote Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Keynote Speakers</h2>
            <p className="text-muted-foreground">Headlining our main stage sessions</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading speakers...</div>
            </div>
          ) : speakers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {speakers.map((speaker) => (
                <Card key={speaker.id} className="border-0 shadow-lg overflow-hidden">
                  <div className="relative h-64 bg-gray-100">
                    {speaker.photoUrl ? (
                      <Image
                        src={speaker.photoUrl}
                        alt={`${speaker.firstName} ${speaker.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#1e3a5f]/10">
                        <Mic2 className="h-16 w-16 text-[#1e3a5f]/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-1">
                      {speaker.firstName} {speaker.lastName}
                    </h3>
                    <p className="text-[#c9a227] font-medium text-sm mb-2">{speaker.title}</p>
                    <p className="text-muted-foreground text-sm mb-4">{speaker.organization}</p>
                    <p className="text-muted-foreground text-sm line-clamp-3">{speaker.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mic2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Speaker lineup coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
