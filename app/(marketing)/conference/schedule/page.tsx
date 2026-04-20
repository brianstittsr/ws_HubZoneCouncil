"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Users, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceSessionDoc } from "@/lib/schema";

export default function SchedulePage() {
  const [sessions, setSessions] = useState<ConferenceSessionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_SESSIONS),
          where("isPublished", "==", true),
          orderBy("startTime")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceSessionDoc[];
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const day1Sessions = sessions.filter((s) => s.day === "day1");
  const day2Sessions = sessions.filter((s) => s.day === "day2");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            30+ Sessions
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Event <span className="text-[#c9a227]">Schedule</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Two days of expert-led sessions, workshops, and networking opportunities 
            designed to accelerate your federal contracting success.
          </p>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="day1" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="day1">Day 1 - July 21</TabsTrigger>
              <TabsTrigger value="day2">Day 2 - July 22</TabsTrigger>
            </TabsList>

            <TabsContent value="day1" className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-[#c9a227]" />
                <span className="font-semibold text-lg">Tuesday, July 21, 2026</span>
              </div>
              {loading ? (
                <div className="text-center py-12">Loading schedule...</div>
              ) : day1Sessions.length > 0 ? (
                day1Sessions.map((session) => <SessionCard key={session.id} session={session} />)
              ) : (
                <PlaceholderSchedule day="Day 1" date="July 21, 2026" />
              )}
            </TabsContent>

            <TabsContent value="day2" className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-[#c9a227]" />
                <span className="font-semibold text-lg">Wednesday, July 22, 2026</span>
              </div>
              {loading ? (
                <div className="text-center py-12">Loading schedule...</div>
              ) : day2Sessions.length > 0 ? (
                day2Sessions.map((session) => <SessionCard key={session.id} session={session} />)
              ) : (
                <PlaceholderSchedule day="Day 2" date="July 22, 2026" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

function SessionCard({ session }: { session: ConferenceSessionDoc }) {
  return (
    <Card className="border-l-4 border-l-[#c9a227]">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex items-center gap-2 text-muted-foreground min-w-[120px]">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{session.startTime} - {session.endTime}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{session.type}</Badge>
              <Badge variant="secondary">{session.track}</Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
            <p className="text-muted-foreground text-sm mb-3">{session.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {session.speakers?.join(", ") || "TBA"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {session.room || "TBA"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderSchedule({ day, date }: { day: string; date: string }) {
  const placeholderSessions = [
    { time: "7:00 AM - 8:00 AM", title: "Registration & Breakfast", type: "Networking" },
    { time: "8:00 AM - 9:00 AM", title: "Opening Keynote: The Future of HUBZone", type: "Keynote" },
    { time: "9:15 AM - 10:15 AM", title: "Federal Contracting 101", type: "Workshop" },
    { time: "10:30 AM - 11:30 AM", title: "Networking Break", type: "Networking" },
    { time: "11:45 AM - 12:45 PM", title: "Panel: Winning Government Contracts", type: "Panel" },
    { time: "12:45 PM - 1:45 PM", title: "Lunch & Networking", type: "Networking" },
    { time: "2:00 PM - 3:00 PM", title: "Supply Chain Opportunities", type: "Session" },
    { time: "3:15 PM - 4:15 PM", title: "Closing Remarks", type: "Keynote" },
  ];

  return (
    <div className="space-y-4">
      {placeholderSessions.map((session, i) => (
        <Card key={i} className="border-l-4 border-l-[#c9a227]/50 opacity-70">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex items-center gap-2 text-muted-foreground min-w-[120px]">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{session.time}</span>
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">{session.type}</Badge>
                <h3 className="font-semibold text-lg">{session.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">Schedule details coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
