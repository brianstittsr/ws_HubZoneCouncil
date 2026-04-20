"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceOrganizerDoc } from "@/lib/schema";

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<ConferenceOrganizerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizers = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_ORGANIZERS),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceOrganizerDoc[];
        setOrganizers(data);
      } catch (error) {
        console.error("Error fetching organizers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            Behind the Event
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Organizer <span className="text-[#c9a227]">Details</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Meet the team working to make the 2026 National HUBZone Conference 
            an unforgettable experience.
          </p>
        </div>
      </section>

      {/* About HubZone Council */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">
                About HubZone Council
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The HubZone Contractors National Council is dedicated to empowering 
                businesses in Historically Underutilized Business Zones through education, 
                advocacy, and networking opportunities.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We work to connect HUBZone-certified businesses with federal contracting 
                opportunities, prime contractors, and the resources needed to grow and 
                succeed in the government marketplace.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to strengthen communities by supporting the businesses 
                that create local jobs and economic opportunity.
              </p>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-[#c9a227]" />
                      <span>240-442-1787</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[#c9a227]" />
                      <a href="mailto:info@hubzonecouncil.org" className="hover:underline">
                        info@hubzonecouncil.org
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Mailing Address</h3>
                  <p className="text-muted-foreground">
                    PO Box 355<br />
                    Oakland, MD 21550
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Organizers Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a5f] mb-4">Conference Team</h2>
            <p className="text-muted-foreground">The people making this event possible</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading team...</div>
            </div>
          ) : organizers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {organizers.map((organizer) => (
                <Card key={organizer.id} className="border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                      {organizer.photoUrl ? (
                        <Image
                          src={organizer.photoUrl}
                          alt={organizer.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1e3a5f]/10">
                          <Users className="h-10 w-10 text-[#1e3a5f]/30" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{organizer.name}</h3>
                    <p className="text-[#c9a227] text-sm mb-2">{organizer.role}</p>
                    <p className="text-muted-foreground text-sm">{organizer.department}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Team information coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
