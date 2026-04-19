"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// Interface for team members stored in Firestore
interface TeamMember {
  id: string;
  name: string;
  title: string;
  category: "leadership" | "partner";
  imageUrl?: string;
  expertise: string[];
  bio?: string;
  slug?: string;
  order: number;
  email?: string;
  linkedin?: string;
  isActive: boolean;
}

// Default team members (used as fallback and for initial seeding)
const defaultLeadership: Omit<TeamMember, "id">[] = [
  {
    name: "Nelinia Varenas",
    title: "V+ CEO",
    category: "leadership",
    expertise: ["AI, Automation, & Digital Twins", "Reshoring", "Sales & Marketing", "ISO", "Six Sigma", "Affiliate Marketing"],
    slug: "nelinia-varenas",
    order: 1,
    isActive: true,
  },
  {
    name: "Roy Dickan",
    title: "V+ CRO",
    category: "leadership",
    expertise: ["AI Optimization Architect", "Automations", "Sales & Marketing", "Lead Generation", "Int/Ext Communication"],
    slug: "roy-dickan",
    order: 2,
    isActive: true,
  },
  {
    name: "Brian Stitt",
    title: "V+ CTO",
    category: "leadership",
    expertise: ["AI Visionary & Developer", "Digital Transformation Expert", "Robotics and Digital Twins Innovator"],
    slug: "brian-stitt",
    order: 3,
    isActive: true,
  },
];

const defaultPartners: Omit<TeamMember, "id">[] = [
  {
    name: "Keith Moore",
    title: "KDM & Associates CEO",
    category: "partner",
    imageUrl: "/Affiliartes/Keith_Moore3.png",
    expertise: ["Government Affairs", "Small Business Advocacy", "Community Development", "Public Policy"],
    slug: "keith-moore",
    order: 1,
    isActive: true,
  },
  {
    name: "Icy Williams",
    title: "Strategic Partner",
    category: "partner",
    imageUrl: "/Williams_Icy.png",
    expertise: ["Operations Excellence", "Process Improvement"],
    slug: "icy-williams",
    order: 2,
    isActive: true,
  },
  {
    name: "Nate Hallums",
    title: "Strategic Partner",
    category: "partner",
    expertise: ["Manufacturing Solutions", "Supply Chain"],
    slug: "nate-hallums",
    order: 3,
    isActive: true,
  },
];

export default function LeadershipPage() {
  const [leadershipTeam, setLeadershipTeam] = useState<TeamMember[]>([]);
  const [strategicPartners, setStrategicPartners] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!db) {
        // Use defaults if no DB
        setLeadershipTeam(defaultLeadership.map((m, i) => ({ ...m, id: `default-${i}` })));
        setStrategicPartners(defaultPartners.map((m, i) => ({ ...m, id: `default-partner-${i}` })));
        setIsLoading(false);
        return;
      }

      try {
        // Fetch team members from Firestore
        const membersRef = collection(db, "leadership_members");
        const snapshot = await getDocs(membersRef);
        
        if (snapshot.empty) {
          // No data in Firestore, use defaults
          setLeadershipTeam(defaultLeadership.map((m, i) => ({ ...m, id: `default-${i}` })));
          setStrategicPartners(defaultPartners.map((m, i) => ({ ...m, id: `default-partner-${i}` })));
        } else {
          const members = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as TeamMember[];

          // Filter and sort by category
          const leadership = members
            .filter(m => m.category === "leadership" && m.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          
          const partners = members
            .filter(m => m.category === "partner" && m.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          setLeadershipTeam(leadership.length > 0 ? leadership : defaultLeadership.map((m, i) => ({ ...m, id: `default-${i}` })));
          setStrategicPartners(partners.length > 0 ? partners : defaultPartners.map((m, i) => ({ ...m, id: `default-partner-${i}` })));
        }

        // Also fetch images to match with members
        const imagesRef = collection(db, "image_assets");
        const imagesSnapshot = await getDocs(imagesRef);
        const imageMap: Record<string, string> = {};
        
        imagesSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const name = data.name?.toLowerCase() || "";
          
          // Match images by name keywords
          if (name.includes("nelinia") || name.includes("varenas")) {
            imageMap["nelinia-varenas"] = data.url;
          } else if (name.includes("roy") || name.includes("dickan")) {
            imageMap["roy-dickan"] = data.url;
          } else if (name.includes("brian") || name.includes("stitt")) {
            imageMap["brian-stitt"] = data.url;
          } else if (name.includes("keith") || name.includes("moore")) {
            imageMap["keith-moore"] = data.url;
          } else if (name.includes("icy") || name.includes("williams")) {
            imageMap["icy-williams"] = data.url;
          } else if (name.includes("nate") || name.includes("hallums")) {
            imageMap["nate-hallums"] = data.url;
          }
        });

        // Update members with matched images
        setLeadershipTeam(prev => prev.map(m => ({
          ...m,
          imageUrl: m.imageUrl || imageMap[m.slug || ""] || undefined,
        })));
        setStrategicPartners(prev => prev.map(m => ({
          ...m,
          imageUrl: m.imageUrl || imageMap[m.slug || ""] || undefined,
        })));

      } catch (error) {
        console.error("Error fetching team members:", error);
        // Use defaults on error
        setLeadershipTeam(defaultLeadership.map((m, i) => ({ ...m, id: `default-${i}` })));
        setStrategicPartners(defaultPartners.map((m, i) => ({ ...m, id: `default-partner-${i}` })));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);

  const renderMemberCard = (member: TeamMember) => (
    <Card key={member.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Image - fills card width, top of head visible, bottom can crop */}
          <div className="aspect-[4/5] overflow-hidden">
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
            <p className="text-blue-600 font-semibold mt-1">{member.title}</p>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {member.expertise.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                  >
                    {skill}
                  </Badge>
                ))}
                {member.expertise.length > 3 && (
                  <Badge className="text-xs bg-gray-100 text-gray-600 border-0">
                    +{member.expertise.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Biography Link */}
            {member.slug && (
              <Link 
                href={`/leadership/${member.slug}`}
                className="mt-5 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium group/link"
              >
                View Full Biography
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
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Our Leadership
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Leadership <span className="text-primary">Team</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Veteran experts with decades of combined experience in manufacturing, 
              technology, and business transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Team Grid */}
      <section className="py-20 md:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Strategic Value Plus Leadership</h2>
            <p className="mt-4 text-lg text-muted-foreground">Our core leadership team driving transformation.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {leadershipTeam.map(renderMemberCard)}
          </div>
        </div>
      </section>

      {/* Strategic Partners Grid */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Strategic Partners</h2>
            <p className="mt-4 text-lg text-muted-foreground">Trusted partners extending our capabilities.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {strategicPartners.map(renderMemberCard)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Work With Our Team?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule a free consultation to discuss how our leadership team can help 
            transform your manufacturing operations.
          </p>
          <Button size="lg" className="mt-8 text-lg px-8" asChild>
            <Link href="/contact">
              Schedule a Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
