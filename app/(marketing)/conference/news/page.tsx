"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Newspaper } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { ConferenceNewsDoc } from "@/lib/schema";

export default function NewsPage() {
  const [news, setNews] = useState<ConferenceNewsDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, COLLECTIONS.CONFERENCE_NEWS),
          where("isPublished", "==", true),
          orderBy("publishedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ConferenceNewsDoc[];
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30 mb-4">
            Latest Updates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Event <span className="text-[#c9a227]">News</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Stay informed with the latest announcements, speaker reveals, and 
            conference updates.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading news...</div>
            </div>
          ) : news.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <Card key={item.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#1e3a5f]/10">
                        <Newspaper className="h-12 w-12 text-[#1e3a5f]/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      {item.publishedAt?.toDate?.().toLocaleDateString() || "Coming Soon"}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {item.excerpt || item.content?.substring(0, 150) + "..."}
                    </p>
                    <button className="text-[#c9a227] hover:underline text-sm font-medium">
                      Read More →
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">News updates coming soon.</p>
              <p className="text-sm text-muted-foreground">
                Check back for speaker announcements, schedule updates, and conference news.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
