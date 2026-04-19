import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  Calendar,
  Users,
  FileText,
  Target,
  Clock,
  Award,
  ArrowRight,
  Star,
  Lock,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CMMC Training Confirmation | Strategic Value+",
  description:
    "Congratulations on taking the first step to securing your digital assets. Join our 12-Week CMMC Readiness Program.",
};

const coreDeliverables = [
  {
    title: "Gap Analysis (CMMC 2.0 Level 2)",
    description: "Comprehensive assessment of your current security posture against CMMC requirements",
    icon: Target,
  },
  {
    title: "System Security Plan (SSP)",
    description: "Complete documentation of your security controls and implementation",
    icon: FileText,
  },
  {
    title: "SPRS Scorecard & POA&M",
    description: "Supplier Performance Risk System score and Plan of Action & Milestones",
    icon: Award,
  },
  {
    title: "Secure CUI Enclave Workshop",
    description: "Hands-on training for protecting Controlled Unclassified Information",
    icon: Lock,
  },
  {
    title: "Compliance Roadmap",
    description: "Clear path to certification with milestones and timelines",
    icon: ArrowRight,
  },
];

const keyBenefits = [
  "Weekly cohort workshops with expert instructors",
  "Small-group Q&A sessions for personalized guidance",
  "Templates & documentation kits ready to use",
  "Collaboration community with fellow contractors",
  "4 months of Singularity-IT™ Governance platform access after course",
];

export default function CMMCTrainingConfirmationPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-red-600 text-white border-0 px-4 py-2 text-sm font-semibold">
              <Users className="w-4 h-4 mr-2" />
              EACH COHORT IS LIMITED TO 15 PARTICIPANTS
            </Badge>
            
            <div className="mb-8">
              <Image
                src="/cmmc/white_KDMAssocLogo.png"
                alt="KDM & Associates"
                width={300}
                height={75}
                className="mx-auto mb-6"
              />
            </div>

            <div className="bg-green-600/20 border-2 border-green-500 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Congratulations on Taking the First Step to{" "}
                <span className="text-primary">Securing Your Digital Assets</span>
              </h1>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              12-Week CMMC Readiness Program
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fast-track to Level 1 & 2 CMMC readiness with{" "}
              <strong className="text-white">AI-driven governance</strong> and{" "}
              <strong className="text-white">expert guidance</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Program Details Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-6 border-primary/50 text-primary px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                12-WEEK CMMC READINESS PROGRAM
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Everything You Need to Achieve CMMC Compliance
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Core Deliverables */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  Core Deliverables
                </h3>
                <div className="space-y-4">
                  {coreDeliverables.map((item, index) => (
                    <Card key={index} className="border-2 hover:border-primary/40 transition-colors">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{item.title}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Star className="w-8 h-8 text-primary" />
                  Key Benefits
                </h3>
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <ul className="space-y-4">
                      {keyBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-lg">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Investment Card */}
                <Card className="mt-8 border-4 border-red-500 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1 rotate-0">
                    LIMITED SPOTS
                  </div>
                  <CardContent className="p-8 text-center">
                    <div className="bg-red-600/20 border border-red-500 rounded-lg px-4 py-2 mb-4 inline-block">
                      <p className="text-red-400 font-bold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        ONLY 15 SEATS PER COHORT — ACT NOW
                      </p>
                    </div>
                    <p className="text-gray-300 mb-2 uppercase tracking-wide font-semibold">
                      Your CMMC Accelerator Investment
                    </p>
                    <div className="text-6xl font-bold text-white mb-2">
                      $7,500
                    </div>
                    <p className="text-green-400 font-semibold mb-4">
                      Save thousands vs. individual consulting
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      One-time payment • Includes all materials & 4 months platform access
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 font-bold w-full"
                      asChild
                    >
                      <a href="https://www.paypal.com/ncp/payment/Y5MWA6CR8NSXQ" target="_blank" rel="noopener noreferrer">
                        <Lock className="w-5 h-5 mr-2" />
                        SECURE YOUR SEAT NOW
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              READY TO BEGIN YOUR CMMC JOURNEY?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Reserve Your Seat with a $7,500 Payment Today
            </p>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
              You will be enrolled in the next available cohort. Spots are limited to ensure 
              personalized attention and maximum results for every participant.
            </p>
            
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-xl px-12 py-8 font-bold shadow-lg shadow-primary/50"
              asChild
            >
              <Link href="/cmmc-training-confirmation">
                <Lock className="w-6 h-6 mr-3" />
                SECURE YOUR SEAT
              </Link>
            </Button>

            <div className="mt-12 flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Limited to 15 Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Next Cohort Starting Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-slate-950 text-gray-500 text-center text-sm">
        <div className="container">
          <p>
            Copyright 2026 | Strategic Value Plus Solutions, LLC (V+) |{" "}
            <Link href="/terms" className="hover:text-primary underline">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
