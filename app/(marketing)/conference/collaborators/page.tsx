"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceCollaboratorDoc } from "@/lib/schema";

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<ConferenceCollaboratorDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_COLLABORATORS),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceCollaboratorDoc[];
        setCollaborators(data);
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollaborators();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            Partnership
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-[#c9a227]">Collaborators</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Meet the organizations and agencies partnering with us to make the 
            2026 National HUBZone Conference a success.
          </p>
        </div>
      </section>

      {/* Collaborators Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading collaborators...</div>
            </div>
          ) : collaborators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collaborators.map((collab) => (
                <Card key={collab.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {collab.logoUrl ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={collab.logoUrl}
                            alt={collab.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-[#1e3a5f]" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{collab.name}</h3>
                        <p className="text-sm text-muted-foreground">{collab.type}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{collab.description}</p>
                    {collab.website && (
                      <a
                        href={collab.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#c9a227] hover:underline text-sm"
                      >
                        Visit Website →
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Collaborator information coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
