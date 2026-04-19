"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Users, Target, Briefcase, ShieldCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Affiliate {
  id: string;
  name: string;
  title: string;
  company?: string;
  expertise: string[];
  imageUrl?: string;
  slug?: string;
  isActive: boolean;
}

const defaultAffiliates: Omit<Affiliate, "id">[] = [
  {
    name: "Quality Systems Expert",
    title: "ISO & QMS Specialist",
    expertise: ["ISO 9001", "IATF 16949", "Quality Auditing"],
    slug: "quality-expert",
    isActive: true,
  },
  {
    name: "Lean Manufacturing Consultant",
    title: "Process Improvement",
    expertise: ["Lean Six Sigma", "Value Stream Mapping", "Kaizen"],
    slug: "lean-consultant",
    isActive: true,
  },
  {
    name: "Automation Specialist",
    title: "Industry 4.0 Expert",
    expertise: ["Robotics", "PLC Programming", "Digital Twins"],
    slug: "automation-specialist",
    isActive: true,
  },
];

const benefits = [
  {
    title: "Aligned work, clear outcomes",
    description: "Work is organized around readiness milestones and measurable deliverables.",
    icon: Target,
  },
  {
    title: "High-trust introductions",
    description: "Manufacturers come in with real needs and a clear intent to improve.",
    icon: Users,
  },
  {
    title: "Protect your reputation",
    description: "Structured delivery reduces scope drift and improves client outcomes.",
    icon: ShieldCheck,
  },
];

const expectations = [
  "Deep expertise in a domain that impacts supplier readiness",
  "Professional delivery with clear communication",
  "Collaboration with SV+ team and other affiliates",
  "Commitment to measurable outcomes",
];

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliates = async () => {
      if (!db) {
        setAffiliates(defaultAffiliates.map((a, i) => ({ ...a, id: `default-${i}` })));
        setIsLoading(false);
        return;
      }

      try {
        // Fetch affiliates from Firestore
        const affiliatesRef = collection(db, "affiliates");
        const snapshot = await getDocs(affiliatesRef);
        
        if (snapshot.empty) {
          setAffiliates(defaultAffiliates.map((a, i) => ({ ...a, id: `default-${i}` })));
        } else {
          const affiliateData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Affiliate[];
          setAffiliates(affiliateData.filter(a => a.isActive));
        }

        // Fetch matching images
        const imagesRef = collection(db, "image_assets");
        const imagesSnapshot = await getDocs(imagesRef);
        
        setAffiliates(prev => prev.map(affiliate => {
          const nameParts = affiliate.name.toLowerCase().split(" ");
          const matchingImage = imagesSnapshot.docs.find(doc => {
            const imgName = doc.data().name?.toLowerCase() || "";
            return nameParts.some(part => part.length > 2 && imgName.includes(part));
          });
          
          if (matchingImage) {
            return { ...affiliate, imageUrl: matchingImage.data().url };
          }
          return affiliate;
        }));

      } catch (error) {
        console.error("Error fetching affiliates:", error);
        setAffiliates(defaultAffiliates.map((a, i) => ({ ...a, id: `default-${i}` })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliates();
  }, []);

  const renderAffiliateCard = (affiliate: Affiliate) => (
    <Card key={affiliate.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Image - fills card width, top of head visible, bottom can crop */}
          <div className="aspect-[4/5] overflow-hidden">
            {affiliate.imageUrl ? (
              <img
                src={affiliate.imageUrl}
                alt={affiliate.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {affiliate.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900">{affiliate.name}</h3>
            <p className="text-blue-600 font-semibold mt-1">{affiliate.title}</p>
            {affiliate.company && (
              <p className="text-gray-500 text-sm mt-1">{affiliate.company}</p>
            )}
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {affiliate.expertise.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                  >
                    {skill}
                  </Badge>
                ))}
                {affiliate.expertise.length > 3 && (
                  <Badge className="text-xs bg-gray-100 text-gray-600 border-0">
                    +{affiliate.expertise.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Profile Link */}
            {affiliate.slug && (
              <Link 
                href={`/affiliates/${affiliate.slug}`}
                className="mt-5 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium group/link"
              >
                View Profile
                <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Affiliate Network
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Bring your expertise. <span className="text-primary">Help suppliers get qualified.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              Join a delivery network focused on supplier readiness and OEM qualification. We match manufacturers to the
              right experts—when they need them—so progress is fast, accountable, and measurable.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/contact">
                  Apply / Start a Conversation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white/20 hover:bg-white/10" asChild>
                <Link href="/">See Manufacturer Path</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Network Members */}
      <section className="py-16 md:py-24 bg-stone-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Affiliate Network</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert consultants ready to help manufacturers achieve OEM qualification.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {affiliates.map(renderAffiliateCard)}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What we’re looking for</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Affiliates who can deliver value in supplier readiness programs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Common domains
                  </CardTitle>
                  <CardDescription>Quality, ISO/QMS, lean, automation, supply chain, finance, workforce.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    If you have a repeatable approach that helps manufacturers close readiness gaps, you’re a fit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Expectations
                  </CardTitle>
                  <CardDescription>Professional delivery and collaborative execution.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {expectations.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Interested in joining?</h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Tell us what you do best and the outcomes you deliver—we’ll follow up.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact">
              Apply now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
