"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Building2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceTicketDoc } from "@/lib/schema";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<ConferenceTicketDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_TICKETS),
          where("isActive", "==", true),
          orderBy("price", "asc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceTicketDoc[];
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const defaultTickets = [
    {
      id: "member",
      name: "Member Registration",
      price: 95,
      description: "For current HubZone Council members",
      features: ["Full conference access", "All sessions & workshops", "Networking events", "Lunch included"],
      highlight: false,
    },
    {
      id: "non-member",
      name: "Non-Member Registration",
      price: 195,
      description: "Standard conference registration",
      features: ["Full conference access", "All sessions & workshops", "Networking events", "Lunch included"],
      highlight: true,
    },
    {
      id: "government",
      name: "Government Registration",
      price: 0,
      description: "For federal and state government employees",
      features: ["Full conference access", "All sessions & workshops", "Networking events", "Lunch included"],
      highlight: false,
    },
  ];

  const displayTickets = tickets.length > 0 ? tickets : defaultTickets;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            Register Today
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Registration & <span className="text-[#c9a227]">Tickets</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Secure your spot at the premier HUBZone conference. Members save big 
            on registration fees!
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">Loading ticket options...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {displayTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`relative ${ticket.highlight ? "border-[#c9a227] shadow-xl" : ""}`}
                >
                  {ticket.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#c9a227] text-[#1a2b4a] px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{ticket.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold">${ticket.price}</span>
                      <span className="text-muted-foreground">/person</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {(ticket.features || []).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${ticket.highlight ? "bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a]" : "bg-[#1e3a5f] hover:bg-[#152a45]"}`}
                      asChild
                    >
                      <a
                        href="https://www.eventbrite.com/e/2026-national-hubzone-conference-tickets-1275284506879"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Register Now
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hotel CTA */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#1e3a5f] text-white border-0">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Building2 className="h-8 w-8 text-[#c9a227]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">Need Accommodations?</h3>
                    <p className="text-white/70">Special room block at Westfields Marriott</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#1e3a5f]"
                  asChild
                >
                  <a
                    href="https://www.marriott.com/event-reservations/reservation-link.mi?id=1749599567357&key=GRP&app=resvlink"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Hotel
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
