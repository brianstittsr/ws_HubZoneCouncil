"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Zap,
  Building2,
  Network,
  Droplets,
  CheckCircle2,
  ArrowRight,
  MapPin,
  SquareStack,
  Globe,
  Server,
  Flame,
  Shield,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { ZenthiumLocationModal } from "@/components/zenthium/ZenthiumLocationModal";

const SITE_REQUIREMENTS = [
  {
    icon: SquareStack,
    title: "Minimum 10,000 Square Feet",
    description: "The facility must offer at least 10,000 sq ft of usable floor space. Larger facilities (100,000+ sq ft) are strongly preferred for hyperscale deployments.",
    required: true,
  },
  {
    icon: Zap,
    title: "20+ Megawatts of Power",
    description: "The location must be able to receive or generate a minimum of 20 MW of electrical power on-site. Grid-connected, behind-the-meter, and renewable configurations are all considered.",
    required: true,
  },
  {
    icon: Building2,
    title: "High Ceilings (18 ft+ Clear Height)",
    description: "Data center infrastructure requires significant vertical clearance for server racks, cooling systems, and cable management. Minimum 18 ft clear ceiling height preferred.",
    required: true,
  },
  {
    icon: MapPin,
    title: "Single-Story & Flat Floor",
    description: "The facility must be single-story with no elevated second floors. Data center equipment requires level, reinforced floor loading of 150–300 lbs/sq ft.",
    required: true,
  },
  {
    icon: Globe,
    title: "Eligible Property Types",
    description: "We consider: vacant/greenfield land, vacant warehouses, industrial buildings, steel mills, decommissioned facilities, brownfield sites, and power-rich properties.",
    required: true,
  },
  {
    icon: Droplets,
    title: "Water Access for Cooling",
    description: "Cooling is one of the highest demands in data centers. Access to municipal water, reclaimed water, or on-site water sources (lakes, rivers) is a strong advantage.",
    required: false,
  },
  {
    icon: Network,
    title: "Fiber Connectivity",
    description: "Proximity to existing fiber infrastructure (dark or lit) from multiple carriers is preferred. Locations near major fiber routes or carrier hotels score higher.",
    required: false,
  },
  {
    icon: Shield,
    title: "Industrial or Commercial Zoning",
    description: "The property should be zoned for heavy industrial, light industrial, or commercial use. M-1, M-2, or equivalent zoning classifications are ideal.",
    required: false,
  },
  {
    icon: Flame,
    title: "Environmental Clearance",
    description: "Phase I Environmental Site Assessment (ESA) completed with no known contamination preferred. Brownfield sites with documented remediation are also considered.",
    required: false,
  },
  {
    icon: Server,
    title: "Grid Stability & Substation Access",
    description: "Proximity to a high-voltage substation (115kV or higher) or dedicated utility feed is critical. Redundant grid feeds or N+1 power configurations are ideal.",
    required: false,
  },
];

const FAQS = [
  {
    question: "What types of properties does Zenthium consider for data center deployment?",
    answer: "Zenthium considers a wide range of property types including vacant land, idle warehouses, decommissioned industrial buildings, steel mills, gas plants, brownfield sites, and any power-rich property. The common thread is available power — if you have the power, we bring the demand.",
  },
  {
    question: "What is the minimum power requirement?",
    answer: "Zenthium requires a minimum of 20 Megawatts (MW) of power capacity at the site. Most hyperscale deployments scale from 20 MW up to hundreds of MW. We work with grid-connected, behind-the-meter, and renewable energy configurations.",
  },
  {
    question: "Does the building need to already exist, or can it be vacant land?",
    answer: "Both work. Zenthium partners with landowners for ground-up greenfield development on vacant land, and also pursues adaptive reuse of existing industrial or commercial buildings. Powered land with no structure is equally valuable if the electrical infrastructure is in place.",
  },
  {
    question: "What lease terms does Zenthium offer?",
    answer: "Zenthium structures long-term commitments — typically 15- and 20-year lease agreements — that provide stable, predictable income for property owners and operators. We also explore joint venture arrangements to maximize long-term asset value.",
  },
  {
    question: "Does the location need to be near a city or data center hub?",
    answer: "Not necessarily. While proximity to fiber routes and substations is important, Zenthium actively develops in secondary and tertiary markets where power is abundant and land costs are competitive. Rural areas with strong utility infrastructure are actively considered.",
  },
  {
    question: "What happens after I submit a location?",
    answer: "Our team reviews every submission within 5 business days. If your property meets initial criteria, a Zenthium representative will reach out to schedule an introductory call and begin the site qualification process. Qualified sites proceed to formal due diligence and term negotiations.",
  },
  {
    question: "Is water cooling mandatory?",
    answer: "Water access is highly preferred but not always mandatory. Zenthium's energy-efficient infrastructure supports both air-cooled and liquid-cooled configurations. Sites with cooling tower capability, access to municipal water, or proximity to natural water sources receive priority consideration.",
  },
  {
    question: "What is the typical size of a Zenthium data center deployment?",
    answer: "Zenthium's deployments start at 10,000 square feet / 20 MW for edge deployments and scale to 500,000+ sq ft / 500+ MW for hyperscale campuses. We match deployment size to available power capacity and site footprint.",
  },
  {
    question: "Does Zenthium handle permitting and construction?",
    answer: "Yes. Zenthium manages end-to-end execution including site development, utility coordination, permitting, construction, and commissioning. Property owners provide the asset — Zenthium provides the capital, expertise, and committed customer demand.",
  },
  {
    question: "Who are Zenthium's customers?",
    answer: "Zenthium places demand from global hyperscalers (cloud providers, AI companies) and Fortune 500 enterprises. With 10+ gigawatts of active demand in our pipeline, we are one of the most active data infrastructure placement platforms in the industry.",
  },
];

const PARTNER_TYPES = [
  "Commercial real estate owners",
  "Industrial property operators",
  "Landowners with existing power access",
  "Renewable energy operators with stranded power",
  "Upstream oil & gas power producers",
  "Brownfield and underutilized industrial sites",
];

const STATS = [
  { value: "10+ GW", label: "Active Demand Pipeline" },
  { value: "20-yr", label: "Lease Commitments" },
  { value: "20+ MW", label: "Minimum Deployment" },
  { value: "F500", label: "Customer Base" },
];

export default function ZenthiumPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a", color: "#fff" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#0a0a0a" }}>
        {/* Background image */}
        <Image
          src="https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.88) 60%, #0a0a0a 100%)" }} />
        {/* Amber grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2000_1px,transparent_1px),linear-gradient(to_bottom,#2a2000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <Badge variant="outline" className="mb-6 text-sm" style={{ borderColor: "rgba(245,166,35,0.6)", color: "#F5A623" }}>
            Strategic Partners Wanted
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Powering the{" "}
            <span style={{ color: "#F5A623" }}>AI Infrastructure</span>{" "}
            Revolution
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-4" style={{ color: "#ccc" }}>
            Zenthium is at the forefront of the global AI and data infrastructure expansion.
            With <strong className="text-white">10+ gigawatts of demand</strong> from global hyperscalers
            and Fortune 500 companies, we are actively building the next generation of high-performance
            digital infrastructure across the globe.
          </p>
          <p className="text-base max-w-2xl mx-auto mb-10" style={{ color: "#999" }}>
            The opportunity is massive — and we are seeking strategic joint venture partners ready to build alongside us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 rounded-full text-base font-semibold px-8 py-3 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#F5A623", color: "#000" }}
            >
              Submit a Location
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="https://zenthium.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full text-base font-semibold px-8 py-3 border transition-all hover:bg-white/5"
              style={{ borderColor: "#F5A623", color: "#F5A623" }}
            >
              Visit Zenthium.ai
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-10" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold" style={{ color: "#F5A623" }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: "#888" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }} />
      </section>

      {/* What Zenthium Delivers */}
      <section className="py-20" style={{ backgroundColor: "#111" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4 text-white">What Zenthium Delivers</h2>
            <p className="max-w-2xl mx-auto" style={{ color: "#999" }}>
              Zenthium secures and places long-term hyperscale and enterprise demand through structured, long-term partnerships.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: "15 & 20-Year Leases", desc: "Long-term commitments that provide stable, predictable revenue for property owners." },
              { icon: Zap, title: "10–20 MW+ Deployments", desc: "Minimum 10–20 MW deployments with scalable expansion paths to hundreds of MW." },
              { icon: Server, title: "End-to-End Execution", desc: "From site identification through commissioning, Zenthium manages the full development lifecycle." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-6 border" style={{ backgroundColor: "#1a1a1a", borderColor: "rgba(245,166,35,0.2)" }}>
                <div className="p-3 rounded-lg w-fit mb-4" style={{ backgroundColor: "rgba(245,166,35,0.12)" }}>
                  <item.icon className="h-6 w-6" style={{ color: "#F5A623" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-sm" style={{ color: "#999" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed data center image banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "420px" }}>
        <Image
          src="https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80"
          alt="Hyperscale data center — global digital infrastructure"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.3) 100%)" }} />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F5A623" }}>The Scale of Opportunity</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                The world needs 10x more data center capacity by 2030.
              </h2>
              <p className="text-base" style={{ color: "#bbb" }}>
                AI workloads, cloud migration, and autonomous systems are creating an unprecedented infrastructure gap.
                Zenthium is actively closing it — one strategic site at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* We Are Looking For */}
      <section className="py-20" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">We Are Looking for New Data Center Locations</h2>
              <p className="mb-6" style={{ color: "#aaa" }}>
                Zenthium partners with owners of energy-rich properties and industrial assets to transform
                underutilized real estate into high-value digital infrastructure hubs. Whether it's a
                warehouse, steel mill, gas plant, industrial facility, or powered land — we bring the committed demand.
              </p>
              <p className="mb-8" style={{ color: "#aaa" }}>
                If you control power and want to participate in one of the fastest-growing sectors in history,
                now is the time. You supply the power. We'll bring the demand.
              </p>
              <div className="space-y-3">
                {PARTNER_TYPES.map((type) => (
                  <div key={type} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#F5A623" }} />
                    <span className="text-sm text-white">{type}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={openModal}
                className="mt-8 inline-flex items-center gap-2 rounded-full font-semibold px-8 py-3 transition-all hover:opacity-90"
                style={{ backgroundColor: "#F5A623", color: "#000" }}
              >
                Submit Your Location
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Industrial property image */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(245,166,35,0.2)" }}>
                <Image
                  src="https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=900&q=80"
                  alt="Industrial warehouse suitable for data center conversion"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 60%)" }} />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold text-sm">Idle warehouses, steel mills, industrial facilities</p>
                  <p className="text-xs mt-0.5" style={{ color: "#F5A623" }}>Transform underutilized assets into high-value infrastructure</p>
                </div>
              </div>

              <div className="rounded-xl p-5 border" style={{ backgroundColor: "rgba(245,166,35,0.06)", borderColor: "rgba(245,166,35,0.25)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5" style={{ color: "#F5A623" }} />
                  <span className="font-semibold text-white">Why Partner with Zenthium?</span>
                </div>
                <ul className="space-y-2 text-sm" style={{ color: "#aaa" }}>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#F5A623" }} />10+ GW of contracted and active demand pipeline</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#F5A623" }} />Direct relationships with hyperscalers and Fortune 500 companies</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#F5A623" }} />Expertise in utility coordination and infrastructure execution</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#F5A623" }} />Global expansion footprint across North America and beyond</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#F5A623" }} />Strategic joint venture structure to maximize long-term asset value</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-image property mosaic */}
      <div className="py-16" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "#F5A623" }}>The types of sites we evaluate</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { src: "https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=700&q=80", label: "Power Substations & Grid Assets", sub: "High-voltage infrastructure" },
              { src: "https://images.pexels.com/photos/1624600/pexels-photo-1624600.jpeg?auto=compress&cs=tinysrgb&w=700&q=80", label: "Vacant Industrial Land", sub: "Greenfield & brownfield parcels" },
              { src: "https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=700&q=80", label: "Idle Warehouses & Mills", sub: "Adaptive reuse opportunities" },
            ].map((img) => (
              <div key={img.label} className="relative rounded-2xl overflow-hidden" style={{ height: "220px" }}>
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.15) 55%)" }} />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-semibold text-xs leading-tight">{img.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#F5A623" }}>{img.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Site Requirements */}
      <section className="py-20" style={{ backgroundColor: "#111" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4 text-white">Data Center Site Requirements</h2>
            <p className="max-w-2xl mx-auto" style={{ color: "#999" }}>
              Zenthium evaluates every location against the following criteria. Required items are non-negotiable;
              preferred items significantly improve a site's score and deployment timeline.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {SITE_REQUIREMENTS.map((req) => (
              <div
                key={req.title}
                className="rounded-xl p-5 border flex gap-4"
                style={{
                  backgroundColor: "#1a1a1a",
                  borderColor: req.required ? "rgba(245,166,35,0.35)" : "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="p-2.5 rounded-lg h-fit shrink-0"
                  style={{ backgroundColor: req.required ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.06)" }}
                >
                  <req.icon className="h-5 w-5" style={{ color: req.required ? "#F5A623" : "#777" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-white">{req.title}</h3>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={req.required
                        ? { backgroundColor: "rgba(245,166,35,0.15)", color: "#F5A623" }
                        : { backgroundColor: "rgba(255,255,255,0.08)", color: "#aaa" }
                      }
                    >
                      {req.required ? "Required" : "Preferred"}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "#999" }}>{req.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-full font-semibold px-8 py-3 transition-all hover:opacity-90"
              style={{ backgroundColor: "#F5A623", color: "#000" }}
            >
              Submit a Location for Review
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Full-bleed power grid banner */}
      <div className="relative w-full overflow-hidden" style={{ height: "360px" }}>
        <Image
          src="https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80"
          alt="High-voltage power transmission lines at dusk"
          fill
          className="object-cover object-bottom"
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to left, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.3) 100%)" }} />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-end">
            <div className="max-w-lg text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#F5A623" }}>Power Is the Asset</p>
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                If you control power, you control the future.
              </h3>
              <p className="text-base" style={{ color: "#bbb" }}>
                Grid access, substations, and stranded energy are now the most sought-after real estate on earth.
                Zenthium turns your energy asset into long-term cash flow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <section className="py-20" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p style={{ color: "#999" }}>Everything you need to know about partnering with Zenthium.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl px-5"
                style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#111" }}
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-4 text-white">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4" style={{ color: "#aaa" }}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #1a1000 0%, #0a0a0a 100%)", borderTop: "1px solid rgba(245,166,35,0.2)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Partner with Zenthium?</h2>
          <p className="mb-8 text-lg" style={{ color: "#aaa" }}>
            Submit your property today. Our team reviews every submission and responds within 5 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-full font-semibold px-8 py-3 transition-all hover:opacity-90 text-lg"
              style={{ backgroundColor: "#F5A623", color: "#000" }}
            >
              Submit a Location
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full font-semibold px-8 py-3 border transition-all hover:bg-white/5 text-lg"
              style={{ borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      <ZenthiumLocationModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
