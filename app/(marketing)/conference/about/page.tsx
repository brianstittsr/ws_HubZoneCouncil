"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceAboutDoc } from "@/lib/schema";

export default function AboutEventPage() {
  const [aboutData, setAboutData] = useState<ConferenceAboutDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_ABOUT),
          where("isPublished", "==", true)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setAboutData({ id: doc.id, ...doc.data() } as ConferenceAboutDoc);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-[#1e3a5f] text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-6">
              2026 National Conference
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About the <span className="text-[#c9a227]">Event</span>
            </h1>
            <p className="text-lg text-white/80">
              The nation's premier gathering for HUBZone businesses, federal contractors, 
              and government agencies committed to economic growth and opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Info Cards */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-[#c9a227]/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-[#c9a227]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">When</h3>
                    <p className="text-muted-foreground">July 21-22, 2026</p>
                    <p className="text-sm text-muted-foreground">7:00 AM - 5:00 PM</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-[#c9a227]/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-[#c9a227]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Where</h3>
                    <p className="text-muted-foreground">Westfields Marriott Washington Dulles</p>
                    <p className="text-sm text-muted-foreground">14750 Conference Center Dr, Chantilly, VA 20151</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-[#c9a227]/10 rounded-lg">
                    <Users className="h-6 w-6 text-[#c9a227]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Who</h3>
                    <p className="text-muted-foreground">500+ Expected Attendees</p>
                    <p className="text-sm text-muted-foreground">HUBZone businesses, federal agencies, prime contractors</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 bg-[#c9a227]/10 rounded-lg">
                    <Clock className="h-6 w-6 text-[#c9a227]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Schedule</h3>
                    <p className="text-muted-foreground">30+ Sessions & Workshops</p>
                    <p className="text-sm text-muted-foreground">2 Days of learning, networking, and growth</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Description */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#1e3a5f]">
                Advancing Opportunity, Advocacy & Growth
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The 2026 National HUBZone Conference brings together the nation's leading 
                HUBZone businesses, federal agencies, and industry partners for two 
                transformative days of education, networking, and collaboration.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This premier event focuses on federal contracting opportunities, policy 
                advocacy, supply chain development, workforce empowerment, and innovative 
                growth strategies designed specifically for businesses in Historically 
                Underutilized Business Zones.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild className="bg-[#1e3a5f] hover:bg-[#152a45]">
                  <Link href="/conference/tickets">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/conference/schedule">View Schedule</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Conference Highlights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover what makes the National HUBZone Conference the must-attend event 
              for federal contractors and small business advocates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Federal Contracting", desc: "Learn strategies to win government contracts" },
              { title: "Policy & Advocacy", desc: "Shape the future of HUBZone legislation" },
              { title: "Networking", desc: "Connect with federal buyers and primes" },
              { title: "Supply Chain", desc: "Strengthen American manufacturing" },
              { title: "Workforce Dev", desc: "Empower HUBZone communities" },
              { title: "Innovation", desc: "Discover cutting-edge tools and programs" },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
