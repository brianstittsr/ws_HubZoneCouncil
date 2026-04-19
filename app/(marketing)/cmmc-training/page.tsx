import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Target,
  Zap,
  Lock,
  Star,
  Building2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "CMMC Training - KDM Consortium | Strategic Value+",
  description:
    "Register for the next CMMC Training Cohort. Get DoD cybersecurity compliance certification with the KDM Consortium powered by Strategic Value Plus Solutions.",
  keywords: "CMMC, CMMC Training, CMMC Certification, DoD Compliance, Cybersecurity, NIST 800-171, DFARS, Defense Contractors",
};

const phases = [
  {
    phase: "Phase 1",
    period: "November 2025 - November 2026",
    status: "ACTIVE NOW",
    title: "Initial Enforcement In Effect",
    description: "DoD may require CMMC Level 1 (Self-Assessment) or Level 2 (Self/C3PAO) in solicitations. SPRS score and CMMC UID become mandatory for eligibility.",
    urgent: true,
  },
  {
    phase: "Phase 2",
    period: "2026 - 2027",
    status: "UPCOMING",
    title: "Certification Requirement",
    description: "Third-party C3PAO audits become standard for most Level 2 contracts. Self-assessments no longer sufficient for medium and high-risk contracts.",
    urgent: false,
  },
  {
    phase: "Phase 3",
    period: "2027 - 2028",
    status: "PLANNED",
    title: "Enhanced Requirements",
    description: "Level 3 (DIBCAC) controls added for highest-risk programs. Prime contractors enforce stricter subcontractor flow-down requirements across the supply chain.",
    urgent: false,
  },
  {
    phase: "Phase 4",
    period: "2028 - Onward",
    status: "FULL ENFORCEMENT",
    title: "Complete Compliance Mandatory",
    description: "Complete CMMC compliance mandatory across all DoD contracts. Non-compliant organizations are excluded from defense industrial base opportunities.",
    urgent: false,
  },
];

const steps = [
  {
    number: "1",
    title: "Readiness Assessment",
    description: "Identify gaps, risks, required controls, and missing documentation.",
    icon: Target,
  },
  {
    number: "2",
    title: "Remediation & Documentation",
    description: "Fix gaps, implement controls, build the evidence pack, and train your team.",
    icon: FileCheck,
  },
  {
    number: "3",
    title: "SSP & POA&M Development",
    description: "Create mandatory documents showing your system boundaries and remediation plan.",
    icon: Shield,
  },
  {
    number: "4",
    title: "Pre-Assessment Review",
    description: "Validate evidence before scheduling a C3PAO (Certified Third-Party Assessment Organization).",
    icon: CheckCircle,
  },
  {
    number: "5",
    title: "Formal CMMC Assessment",
    description: "An independent assessor reviews practices, documentation, and evidence.",
    icon: Award,
  },
  {
    number: "6",
    title: "Certification Decision",
    description: "Pass, remediate, or re-test depending on findings.",
    icon: Lock,
  },
];

const testimonials = [
  {
    title: "About KDM & Associates",
    quote: "KDM & Associates understands the unique challenges facing DoD contractors and utilizes the Singularity-IT Governance platform to deliver measurable results quickly through their comprehensive whole-of-government approach.",
  },
  {
    title: "Whole of Government Approach",
    quote: "Team-Based Compliance — The Cohort Program brings organizations together in a collaborative environment, allowing them to share best practices, learn from each other's experiences, and achieve compliance faster as a group.",
  },
  {
    title: "Purpose-Built for SMBs",
    quote: "Specifically designed for small and mid-sized defense contractors who need fast, reliable compliance without massive consulting fees or lengthy implementation cycles.",
  },
  {
    title: "Expert Guidance",
    quote: "Receive hands-on support from compliance experts who understand the intricacies of CMMC, DFARS, and NIST 800-171 requirements for defense contractors.",
  },
];

const faqs = [
  {
    question: "Do we really need CMMC certification if we're only a subcontractor and not a prime?",
    answer: "Yes. CMMC requirements flow down through the entire supply chain. Prime contractors are required to ensure their subcontractors meet the same compliance standards. Without certification, you risk losing existing contracts and being excluded from future opportunities.",
  },
  {
    question: "How long does it take to become CMMC audit-ready?",
    answer: "Manufacturers who follow a structured approach through our Cohort Program often achieve compliance in 90–180 days. The timeline depends on your current security posture, the complexity of your systems, and your team's availability for implementation.",
  },
  {
    question: "What's the difference between a readiness assessment and the formal CMMC certification audit?",
    answer: "A readiness assessment is an internal review to identify gaps and prepare your organization. The formal CMMC certification audit is conducted by an independent C3PAO (Certified Third-Party Assessment Organization) and results in your official certification status.",
  },
  {
    question: "Is CMMC a one-time certification or an ongoing requirement?",
    answer: "CMMC certification requires ongoing maintenance. You must continuously demonstrate compliance, maintain documentation, and undergo periodic reassessments to retain your certification status.",
  },
  {
    question: "Will CMMC become the standard for cybersecurity beyond the Department of Defense?",
    answer: "Nearly every indicator suggests yes. CMMC requirements are already influencing cybersecurity expectations across federal agencies, Tier-1 OEMs, insurers, and even commercial supply chains. Cyber insurance providers, aerospace programs, and critical infrastructure sectors are adopting CMMC-aligned frameworks as minimum security posture. Manufacturers who invest now will be positioned ahead of competitors as security becomes a procurement requirement—not an option.",
  },
];

export default function CMMCTrainingPage() {
  return (
    <>
      {/* Hero Section - Full Screen with Lock Background */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cmmc/agefis-qh-mar1Tzo8-unsplash.jpg"
            alt="Cybersecurity Team"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* V+ and KDM Collaboration Logos */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center gap-6 md:gap-10">
                <Image
                  src="/VPlus_logo.webp"
                  alt="Strategic Value+ Logo"
                  width={120}
                  height={60}
                  className="h-12 md:h-16 w-auto object-contain"
                />
                <Image
                  src="/cmmc/blue_KDMAssocLogo.png"
                  alt="KDM & Associates Logo"
                  width={160}
                  height={60}
                  className="h-12 md:h-16 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-lg md:text-xl font-semibold text-white/90 mt-3 tracking-wide uppercase">Collaboration</p>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl mb-8">
              Register for the Next{" "}
              <span className="text-primary drop-shadow-lg">CMMC CyberSecurity Compliance Training Cohort</span>
            </h1>
            
            {/* Risk Highlight Box */}
            <div className="bg-red-900/80 border-2 border-red-500 rounded-xl p-6 mb-8 max-w-3xl mx-auto backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-2xl font-bold text-red-300">IMMEDIATE RISKS</h2>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <ul className="text-left space-y-3 text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">❌</span>
                  <span><strong className="text-red-300">Contract Disqualification</strong> — Without proper SPRS scores</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">❌</span>
                  <span><strong className="text-red-300">Immediate Ineligibility</strong> — For new contract awards</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">❌</span>
                  <span><strong className="text-red-300">Lost Business</strong> — Risk to existing relationships</span>
                </li>
              </ul>
            </div>

            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10">
              <strong className="text-white text-2xl">Don't lose your DoD contracts.</strong><br />
              Join the KDM Consortium Cohort Program and get certified in <span className="text-primary font-bold">90-180 days</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-xl px-10 py-7 font-bold shadow-lg shadow-primary/50 animate-pulse" asChild>
                <Link href="https://www.paypal.com/ncp/payment/Y5MWA6CR8NSXQ">
                  <Calendar className="w-6 h-6 mr-2" />
                  SECURE YOUR SEAT
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* KDM Consortium Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              CMMC Cohort Program
            </h2>
            <p className="text-xl text-gray-600">
              The KDM Consortium brings a <strong>team-based approach</strong> to cybersecurity compliance 
              through the CMMC Cohorts, powered by Strategic Value Plus Solutions, LLC (V+).
              We help you get ready for your third-party C3PAO assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Fast Track Certification</h3>
                <p className="text-gray-600">
                  Achieve compliance in <strong>90-180 days</strong> with our structured cohort approach.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Team-Based Learning</h3>
                <p className="text-gray-600">
                  Learn alongside peers, share best practices, and achieve compliance <strong>faster as a group</strong>.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Built for SMBs</h3>
                <p className="text-gray-600">
                  Designed for small and mid-sized contractors — <strong>no massive consulting fees</strong>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-24 md:py-32 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-6 border-red-500/50 text-red-600">
              <Clock className="w-4 h-4 mr-2" />
              Time-Sensitive
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Critical Compliance Timeline
            </h2>
            <p className="text-xl text-gray-600">
              The CMMC rollout follows a strict four-phase enforcement schedule. 
              <strong> Organizations must act now.</strong>
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {phases.map((phase, index) => (
              <Card 
                key={index} 
                className={`border-2 ${phase.urgent ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-shrink-0">
                      <Badge 
                        className={`${phase.urgent ? 'bg-red-600' : 'bg-slate-600'} text-white px-3 py-1`}
                      >
                        {phase.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{phase.phase}: {phase.title}</h3>
                        <span className="text-gray-500 text-sm">({phase.period})</span>
                      </div>
                      <p className="text-gray-600">{phase.description}</p>
                    </div>
                    {phase.urgent && (
                      <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-8 p-6 bg-amber-50 border-2 border-amber-400 rounded-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-amber-800 mb-2">Critical Warning</p>
                <p className="text-amber-700">
                  The enforcement timeline is accelerating. Organizations that wait until later phases 
                  will face compressed implementation schedules, higher costs, and increased risk of 
                  non-compliance penalties.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6" asChild>
              <Link href="https://www.paypal.com/ncp/payment/Y5MWA6CR8NSXQ">
                SECURE YOUR SEAT
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-16">
            <div>
              <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
                Turnkey Solution
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Turnkey Compliance for Defense Contractors
              </h2>
              <p className="text-xl text-gray-600">
                KDM & Associates leverages the power of the <strong>CMMC Accelerator</strong> to deliver 
                the Cohort Program — a turnkey solution purpose-built for small and mid-sized contractors.
              </p>
            </div>
            <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/cmmc/karim-ben-van-F2reN77g_gg-unsplash.jpg"
                alt="Cloud Security Keyboard"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <Card key={index} className="border-2 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                      {step.number}
                    </div>
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <p className="text-xl text-gray-700 mb-8">
              Manufacturers who follow a structured approach often achieve compliance in{" "}
              <strong className="text-primary">90–180 days</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="register" className="py-24 md:py-32 bg-slate-800">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Protect Your Contracts. Protect Your Future.
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join us for a clear, practical roadmap to CMMC readiness and certification. 
              Click the button below to join the next CMMC Cohort and learn how to acquire, 
              retain, and level-up your CMMC status.
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90 text-lg px-10 py-6 font-bold"
              asChild
            >
              <Link href="https://www.paypal.com/ncp/payment/Y5MWA6CR8NSXQ">
                <Calendar className="w-5 h-5 mr-2" />
                SECURE YOUR SEAT
              </Link>
            </Button>
            <p className="mt-6 text-gray-400 text-sm">
              Limited spots available per cohort. Secure your place today.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-white border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">"{testimonial.quote}"</p>
                    <p className="font-bold text-primary">{testimonial.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Image
              src="/cmmc/white_KDMAssocLogo.png"
              alt="KDM & Associates"
              width={300}
              height={75}
              className="mx-auto mb-8"
            />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Contact the KDM Consortium CMMC Team Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              <strong>Don't Wait.</strong> Start Your Compliance Journey Now.
            </p>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Contact our team today to schedule your free readiness assessment and learn how 
              the KDM CMMC Accelerator can accelerate your path to DoD cyber compliance.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 font-bold"
              asChild
            >
              <Link href="https://www.paypal.com/ncp/payment/Y5MWA6CR8NSXQ">
                <Calendar className="w-5 h-5 mr-2" />
                SECURE YOUR SEAT
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
