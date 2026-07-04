"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Building2, Phone, Globe, Users, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

type VenueDisplay = {
  id: string;
  conferenceId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  isPrimary: boolean;
  mapEmbedUrl?: string;
  displayOrder: number;
};

type RoomDisplay = {
  id: string;
  conferenceId: string;
  venueId: string;
  name: string;
  description?: string;
  floor?: string;
  capacity?: number;
  roomType?: string;
  isPublic: boolean;
  displayOrder: number;
};

const CONFERENCE_ID = "hubzone-rise-2026";

export default function VenuePage() {
  const [venues, setVenues] = useState<VenueDisplay[]>([]);
  const [rooms, setRooms] = useState<RoomDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVenue, setActiveVenue] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const venueQuery = query(
          collection(db, COLLECTIONS.CONFERENCE_VENUES),
          where("conferenceId", "==", CONFERENCE_ID),
          orderBy("displayOrder", "asc")
        );
        const venueSnap = await getDocs(venueQuery);
        const venueData = venueSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as VenueDisplay);
        setVenues(venueData);
        if (venueData.length > 0) setActiveVenue(venueData[0].id);

        const roomQuery = query(
          collection(db, COLLECTIONS.CONFERENCE_ROOMS),
          where("conferenceId", "==", CONFERENCE_ID),
          orderBy("displayOrder", "asc")
        );
        const roomSnap = await getDocs(roomQuery);
        const roomData = roomSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as RoomDisplay);
        setRooms(roomData);
      } catch (error) {
        console.error("Error loading venue data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const defaultVenue = {
    id: "westfields",
    name: "Westfields Marriott",
    address: "14750 Conference Center Dr",
    city: "Chantilly",
    state: "VA",
    zip: "20151",
    phone: "703-631-0100",
    bookingUrl: "https://book.passkey.com/event/51134479/owner/13564/home?utm_campaign=298709199",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.7!2d-77.4486!3d38.9011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b64d2b0a1b0a1b%3A0x1!2sWestfields+Marriott+Washington+Dulles%2C+14750+Conference+Center+Dr%2C+Chantilly%2C+VA+20151!5e0!3m2!1sen!2sus!4v1",
  };

  const displayVenues = venues.length > 0 ? venues : [defaultVenue as VenueDisplay];
  const activeVenueData = displayVenues.find((v) => v.id === activeVenue) || displayVenues[0];
  const venueRooms = rooms.filter((r) => r.venueId === activeVenueData?.id);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            <Building2 className="h-3 w-3 mr-1" />
            Venue
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Conference <span className="text-[#c9a227]">Venue</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Westfields Marriott in Chantilly, Virginia — convenient to Dulles Airport and Washington, D.C.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Tabs value={activeVenue || displayVenues[0].id} onValueChange={setActiveVenue}>
                  <TabsList className="mb-6">
                    {displayVenues.map((venue) => (
                      <TabsTrigger key={venue.id} value={venue.id}>
                        {venue.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {displayVenues.map((venue) => (
                    <TabsContent key={venue.id} value={venue.id} className="space-y-6">
                      <div className="rounded-2xl overflow-hidden border shadow-sm bg-background h-80 flex flex-col">
                        <iframe
                          title={`${venue.name} Map`}
                          src={
                            venue.mapEmbedUrl ||
                            `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.7!2d-77.4486!3d38.9011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b64d2b0a1b0a1b%3A0x1!2s${encodeURIComponent(
                              venue.name
                            )}!5e0!3m2!1sen!2sus!4v1`
                          }
                          width="100%"
                          height="100%"
                          style={{ border: 0, flex: 1 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {venue.bookingUrl && (
                          <Button className="bg-[#1e3a5f] hover:bg-[#152a45] text-white" asChild>
                            <a href={venue.bookingUrl} target="_blank" rel="noopener noreferrer">
                              <Building2 className="mr-2 h-4 w-4" />
                              Book Hotel
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white" asChild>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              `${venue.address} ${venue.city} ${venue.state} ${venue.zip}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Get Directions
                          </a>
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Conference Rooms</h2>
                  {venueRooms.length === 0 ? (
                    <p className="text-muted-foreground">Room details coming soon.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {venueRooms.map((room) => (
                        <Card key={room.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{room.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {room.capacity && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  Capacity: {room.capacity}
                                </span>
                              )}
                              {room.floor && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  Floor: {room.floor}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{activeVenueData?.name || "Venue"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#c9a227] mt-0.5 shrink-0" />
                      <div>
                        <p>{activeVenueData?.address}</p>
                        <p>
                          {activeVenueData?.city}, {activeVenueData?.state} {activeVenueData?.zip}
                        </p>
                      </div>
                    </div>
                    {activeVenueData?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-[#c9a227] shrink-0" />
                        <a href={`tel:${activeVenueData.phone}`}>{activeVenueData.phone}</a>
                      </div>
                    )}
                    {activeVenueData?.websiteUrl && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-[#c9a227] shrink-0" />
                        <a href={activeVenueData.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    {activeVenueData?.description && (
                      <p className="text-sm text-muted-foreground">{activeVenueData.description}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Getting Here</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Located near Dulles International Airport (IAD), approximately 10 minutes away.</p>
                    <p>Free on-site parking available for conference attendees.</p>
                    <p>Hotel shuttle available from IAD.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
