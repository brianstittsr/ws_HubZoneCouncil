"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Linkedin, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

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

// Default bios for fallback
const defaultBios: Record<string, { member: Omit<TeamMember, "id">, fullBio: string }> = {
  "nelinia-varenas": {
    member: {
      name: "Nelinia Varenas",
      title: "V+ CEO",
      category: "leadership",
      expertise: ["AI, Automation, & Digital Twins", "Reshoring", "Sales & Marketing", "ISO", "Six Sigma", "Affiliate Marketing"],
      slug: "nelinia-varenas",
      order: 1,
      isActive: true,
    },
    fullBio: `Nelinia Varenas is the Chief Executive Officer of Strategic Value Plus Solutions, LLC, where she leads the company's mission to transform U.S. manufacturing through innovative supplier qualification and operational excellence programs.

With decades of experience in manufacturing, quality management, and business transformation, Nelinia brings a unique combination of strategic vision and hands-on expertise to every engagement.

Her background includes extensive work in AI and automation implementation, digital twin technologies, and reshoring initiatives that help bring manufacturing jobs back to America. She is a certified Six Sigma practitioner and has helped numerous organizations achieve ISO certification.

Nelinia is passionate about empowering small and mid-sized manufacturers to compete and win in the global marketplace, making enterprise-grade capabilities accessible to companies with 25 to 500 employees.`,
  },
  "roy-dickan": {
    member: {
      name: "Roy Dickan",
      title: "V+ CRO",
      category: "leadership",
      expertise: ["AI Optimization Architect", "Automations", "Sales & Marketing", "Lead Generation", "Int/Ext Communication"],
      slug: "roy-dickan",
      order: 2,
      isActive: true,
    },
    fullBio: `Roy Dickan serves as the Chief Revenue Officer at Strategic Value Plus Solutions, LLC, where he drives growth strategies and revenue optimization across all business lines.

As an AI Optimization Architect, Roy specializes in implementing intelligent automation solutions that streamline operations and accelerate business growth. His expertise spans sales and marketing automation, lead generation systems, and internal/external communication optimization.

Roy has a proven track record of helping manufacturing companies modernize their go-to-market strategies while maintaining the personal relationships that are essential in B2B environments.

His approach combines cutting-edge technology with proven sales methodologies to create sustainable revenue growth for Strategic Value Plus and its clients.`,
  },
  "brian-stitt": {
    member: {
      name: "Brian Stitt",
      title: "V+ CTO",
      category: "leadership",
      expertise: ["AI Visionary & Developer", "Digital Transformation Expert", "Robotics and Digital Twins Innovator"],
      slug: "brian-stitt",
      order: 3,
      isActive: true,
    },
    fullBio: `Brian Stitt is the Chief Technology Officer of Strategic Value Plus Solutions, LLC, where he leads technology strategy, communications, and solution design across multiple industry verticals.

As an AI visionary and developer, Brian oversees the integration of platforms and data, ensuring seamless collaboration and clear communication between affiliates, stakeholders, and strategic partners while driving scalable, value-focused solutions.

His expertise in robotics and digital twins has helped numerous manufacturing clients visualize and optimize their operations before making significant capital investments. Brian's approach to digital transformation focuses on practical, ROI-driven implementations rather than technology for technology's sake.

Brian is passionate about making advanced technologies accessible to small and mid-sized manufacturers, democratizing capabilities that were once only available to large enterprises.`,
  },
  "keith-moore": {
    member: {
      name: "Keith Moore",
      title: "KDM & Associates CEO",
      category: "partner",
      imageUrl: "/Affiliartes/Keith_Moore3.png",
      expertise: ["Government Affairs", "Small Business Advocacy", "Community Development", "Public Policy"],
      slug: "keith-moore",
      order: 1,
      isActive: true,
    },
    fullBio: `The CEO of both KDM and Associates, and Founder of Open GovTV, leads a team of experts to provide government, institutions, communities, and companies technical solutions to some of the nation's most pressing societal challenges. Keith Moore brings to the team, knowledge of Government, Community, Small Business, and the historical challenges associated with Government meeting socio economic goals, and job expansion, and revenue growth for small businesses.

In 2003-KDM was issued a two year marketing Agreement to represent a minority owned Engineering government contracting information technology small business. In 2005-the firm was awarded a $1 Billion dollar contract thanks to strategic relationship building and KDM helping the firm develop a teaming strategy to partner with DOE. Keith's command of public policy has benefited communities, businesses, government agencies, and has empowered those most vulnerable, and least financed.

Keith as a result of his success in the waterfront community of Asbury Park, became a frequent guest on NJN Network and Comcast, and was characterized as a community leader, and one who believed in the development of innovative approaches to community development. EXODUS House offered drug and alcohol rehabilitation services to addicted men and women for six months with housing, education, job training, and a second chance at a productive life. In 1997, the State of New Jersey agreed to purchase the facility located one block from the Asbury Park beach. Once the EXODUS House was purchased, Keith was appointed in 1997 by the Governor of New Jersey and Secretary of Commerce to the position of Account Executive to the New Jersey Commerce & Economic Growth Commission.

His appointment led to a position as Director of Public Affairs and Community Relations working directly for Governor Christie Todd Whitman in the Governor's Camden New Jersey office helping to advance the allocation of over $250 million dollars of revitalization funds into the city of Camden. Today, Keith Moore, a nationally renowned community activist, small business advocate, and government affairs expert communicates his firm's grasp of public policy as OGTV leads the nation by example.

OGTV, founded by Keith Moore December 31, 2009, is the first internet TV program in America to film, and promote the White House's Executive Order on the Open Government Directive by concentrating on the policy's attention on small business. OGTV as a Division of KDM, and web based video platform, engages large businesses, and helps small businesses succeed in government contracting. KDM, thanks to OGTV, is well positioned to help government, and large businesses meet their small business diversity goals, and NGO's to meet their mission by using innovative online approaches to education and outreach.`,
  },
  "icy-williams": {
    member: {
      name: "Icy Williams",
      title: "Strategic Partner",
      category: "partner",
      imageUrl: "/Williams_Icy.png",
      expertise: ["Operations Excellence", "Process Improvement"],
      slug: "icy-williams",
      order: 2,
      isActive: true,
    },
    fullBio: `Icy Williams is a Strategic Partner at Strategic Value Plus Solutions, LLC, specializing in operations excellence and process improvement initiatives.

With a deep background in manufacturing operations, Icy helps clients identify inefficiencies, implement lean methodologies, and achieve measurable improvements in productivity and quality.

Her hands-on approach ensures that process improvements are not just designed but successfully implemented and sustained over time.`,
  },
  "nate-hallums": {
    member: {
      name: "Nate Hallums",
      title: "Strategic Partner",
      category: "partner",
      expertise: ["Manufacturing Solutions", "Supply Chain"],
      slug: "nate-hallums",
      order: 3,
      isActive: true,
    },
    fullBio: `Nate Hallums is a Strategic Partner at Strategic Value Plus Solutions, LLC, focusing on manufacturing solutions and supply chain optimization.

Nate brings practical experience in helping manufacturers streamline their supply chains, reduce costs, and improve delivery performance. His expertise includes supplier development, inventory optimization, and logistics improvement.

He works closely with clients to develop customized solutions that address their specific supply chain challenges while building resilience for the future.`,
  },
};

export default function BiographyPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [member, setMember] = useState<TeamMember | null>(null);
  const [fullBio, setFullBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      // Check for default bio first
      const defaultData = defaultBios[slug];
      
      if (!db) {
        if (defaultData) {
          setMember({ ...defaultData.member, id: `default-${slug}` });
          setFullBio(defaultData.fullBio);
        }
        setIsLoading(false);
        return;
      }

      try {
        // Try to fetch from Firestore
        const membersRef = collection(db, "leadership_members");
        const snapshot = await getDocs(membersRef);
        
        const foundMember = snapshot.docs.find(doc => {
          const data = doc.data();
          return data.slug === slug;
        });

        if (foundMember) {
          const data = foundMember.data() as Omit<TeamMember, "id">;
          setMember({ ...data, id: foundMember.id });
          setFullBio(data.bio || defaultData?.fullBio || "Biography coming soon.");
        } else if (defaultData) {
          // Use default if not in Firestore
          setMember({ ...defaultData.member, id: `default-${slug}` });
          setFullBio(defaultData.fullBio);
        }

        // Fetch matching image
        const imagesRef = collection(db, "image_assets");
        const imagesSnapshot = await getDocs(imagesRef);
        
        imagesSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const name = data.name?.toLowerCase() || "";
          const slugParts = slug.split("-");
          
          if (slugParts.some(part => name.includes(part))) {
            setMember(prev => prev ? { ...prev, imageUrl: data.url } : null);
          }
        });

      } catch (error) {
        console.error("Error fetching member:", error);
        if (defaultData) {
          setMember({ ...defaultData.member, id: `default-${slug}` });
          setFullBio(defaultData.fullBio);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Team Member Not Found</h1>
        <Button asChild>
          <Link href="/leadership">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leadership
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-8 text-gray-300 hover:text-white" asChild>
            <Link href="/leadership">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leadership
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Image - fills width, top of head visible, bottom can crop */}
            <div className="w-full md:w-80 shrink-0">
              <div className="aspect-[4/5] rounded-xl overflow-hidden">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                      {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
                {member.category === "leadership" ? "Leadership Team" : "Strategic Partner"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">{member.name}</h1>
              <p className="text-2xl text-primary font-semibold mt-2">{member.title}</p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {member.expertise.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>

              {(member.email || member.linkedin) && (
                <div className="mt-8 flex gap-4">
                  {member.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${member.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                  {member.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Biography */}
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Biography</h2>
          <div className="prose prose-lg max-w-none">
            {fullBio.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Want to Connect?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule a consultation to discuss how our team can help transform your manufacturing operations.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/contact">
              Schedule a Consultation
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
