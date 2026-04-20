"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Users,
  Mic2,
  Building2,
  Star,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  Handshake,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const eventDetails = {
  name: "2026 National HUBZone Conference",
  tagline: "Advancing Opportunity, Advocacy & Growth",
  fullName: "HUBZone Contractors National Conference",
  dates: "July 21-22, 2026",
  startDate: "July 21, 2026",
  endDate: "July 22, 2026",
  startTime: "7:00 AM",
  endTime: "5:00 PM",
  venue: "Westfields Marriott",
  address: "14750 Conference Center Dr, Chantilly, VA 20151",
  hotelUrl: "https://book.passkey.com/event/51134479/owner/13564/home?utm_campaign=298709199",
  registerUrl: "https://hubzonecouncil.org/event-6249547",
  sponsorUrl: "https://hubzonecouncil.org/event-6458966/Registration",
  contactPhone: "240-442-1787",
  contactEmail: "info@hubzonecouncil.org",
};

const tickets = [
  {
    type: "General Admission",
    tiers: [
      { label: "Member", price: "$650" },
      { label: "Non-Member", price: "$750" },
    ],
    cta: "Register Today",
    href: eventDetails.registerUrl,
    highlight: false,
    description: "Full access to all sessions, workshops, policy discussions, networking events, and meals.",
    includes: [
      "All general sessions",
      "Workshop access",
      "Networking reception",
      "Conference materials",
      "Lunch & refreshments",
      "July 21-22, 2026",
    ],
  },
  {
    type: "Exhibitor",
    tiers: [
      { label: "Member", price: "$2,150" },
      { label: "Non-Member", price: "$2,550" },
    ],
    cta: "Register as Exhibitor",
    href: eventDetails.registerUrl,
    highlight: true,
    description: "8x8 exhibit space with 6ft table, 2 chairs, and 2 conference tickets included.",
    includes: [
      "8x8 dedicated exhibit space",
      "6ft table + 2 chairs",
      "2 conference tickets",
      "All general sessions",
      "Matchmaking opportunities",
      "Premium placement in program",
    ],
  },
  {
    type: "Government",
    tiers: [
      { label: "Full Registration", price: "$250" },
    ],
    cta: "Govt Registration",
    href: eventDetails.registerUrl,
    highlight: false,
    description: "For federal, state, and local government representatives. Includes full access and dedicated matchmaking table.",
    includes: [
      "Full access to all activities",
      "All meals included",
      "Dedicated matchmaking table",
      "Networking with HUBZone businesses",
      "Conference materials",
    ],
  },
];

const tracks = [
  {
    icon: TrendingUp,
    title: "Federal Contracting Access",
    description: "Expand access to federal contracting opportunities and build the strategies needed to win government contracts in HUBZone-designated areas.",
    color: "bg-blue-500/10 text-blue-600",
    image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
  },
  {
    icon: Lightbulb,
    title: "Policy & Advocacy",
    description: "Engage directly with policymakers and federal agency representatives shaping the future of the HUBZone program and small business legislation.",
    color: "bg-purple-500/10 text-purple-600",
    image: "https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
  },
  {
    icon: Handshake,
    title: "Networking & Matchmaking",
    description: "Connect with federal buyers, prime contractors, and fellow HUBZone businesses through structured matchmaking and informal networking sessions.",
    color: "bg-green-500/10 text-green-600",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
  },
  {
    icon: Building2,
    title: "Supply Chain & Manufacturing",
    description: "Strengthen American supply chains, revitalize manufacturing, and build resilient local economies in distressed communities.",
    color: "bg-orange-500/10 text-orange-600",
    image: "https://images.pexels.com/photos/236093/pexels-photo-236093.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
  },
  {
    icon: Users,
    title: "Workforce Development",
    description: "Address economic inequity and workforce gaps through collaborative strategies that empower HUBZone communities and their residents.",
    color: "bg-pink-500/10 text-pink-600",
    image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
  },
  {
    icon: Award,
    title: "Innovation & Growth",
    description: "Discover cutting-edge tools, programs, and partnerships that drive industrial innovation and inclusive prosperity for HUBZone businesses.",
    color: "bg-cyan-500/10 text-cyan-600",
    image: "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=800&q=80",
  },
];

const stats = [
  { value: "500+", label: "Expected Attendees" },
  { value: "50+", label: "Speakers & Panelists" },
  { value: "30+", label: "Sessions & Workshops" },
  { value: "20+", label: "Federal Agencies" },
];

const whyAttend = [
  "Connect with senior officials from SBA, DoD, and other key federal agencies",
  "Participate in structured matchmaking with prime contractors and federal buyers",
  "Learn strategies to win and grow federal contracts in HUBZone communities",
  "Influence legislation and policy shaping the future of the HUBZone program",
  "Build lasting partnerships with fellow small business leaders nationwide",
  "Discover resources to expand capacity, workforce, and economic impact",
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function ConferenceLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white min-h-[92vh] flex items-center">
        {/* Background image - Business professionals at conference */}
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80"
            alt="Business professionals collaborating at conference"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-[#0a1628]/80" />
        </div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        {/* Gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          {/* Event badge */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge className="bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30 text-sm px-4 py-1.5 font-medium">
              National Conference · 2026
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white text-sm px-4 py-1.5">
              <MapPin className="h-3 w-3 mr-1" />
              Chantilly, VA
            </Badge>
          </div>

          {/* Main headline */}
          <div className="text-center max-w-5xl mx-auto">
            <p className="text-[#c9a227] font-semibold text-lg mb-3 uppercase tracking-widest">
              HUBZone Contractors National Council Presents
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
              2026 National<br />
              <span className="text-[#c9a227]">HUBZone</span> Conference
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium mb-4">
              Advancing Opportunity, Advocacy & Growth
            </p>
            <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto mb-10">
              The nation&apos;s premier event dedicated to strengthening small businesses in Historically Underutilized Business Zones and the communities they serve.
            </p>

            {/* Event info bar */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#c9a227]" />
                <span>July 21-22, 2026 · 7:00 AM - 5:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#c9a227]" />
                <span>Westfields Marriott · Chantilly, VA</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#c9a227]" />
                <span>500+ Attendees Expected</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="text-base px-8 py-6 bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold shadow-lg shadow-[#c9a227]/30 border-0" asChild>
                <a href={eventDetails.registerUrl} target="_blank" rel="noopener noreferrer">
                  Register Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-white/40 text-white bg-white/5 hover:bg-white/15 hover:text-white" asChild>
                <a href={eventDetails.hotelUrl} target="_blank" rel="noopener noreferrer">
                  <Building2 className="mr-2 h-5 w-5" />
                  Book Hotel
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 border-[#c9a227]/60 text-[#c9a227] bg-[#c9a227]/10 hover:bg-[#c9a227]/20 hover:text-[#c9a227]" asChild>
                <a href={eventDetails.sponsorUrl} target="_blank" rel="noopener noreferrer">
                  Become a Sponsor
                </a>
              </Button>
            </div>
          </div>

          {/* Countdown / trust bar */}
          <div className="mt-16 pt-10 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-[#c9a227]">{stat.value}</p>
                  <p className="text-xs text-white/60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">About the Conference</Badge>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Where Opportunity<br />Meets <span className="text-primary">Advocacy</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                The HUBZone Contractors National Conference is the nation&apos;s premier event dedicated to strengthening small businesses in Historically Underutilized Business Zones and the communities they serve.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Rooted in the mission of the HUBZone Program—to spark economic growth and create sustainable jobs in distressed areas—the conference brings together federal agencies, small‑business leaders, manufacturers, and policymakers to drive solutions that matter.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                From revitalizing American manufacturing to building resilient local economies, this event is where change begins. More than a conference, it&apos;s a catalyst for inclusive prosperity—ensuring that when HUBZone businesses thrive, America&apos;s communities thrive with them.
              </p>
              <Button asChild>
                <a href={eventDetails.registerUrl} target="_blank" rel="noopener noreferrer">
                  Secure Your Spot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Why attend */}
            <div className="bg-muted/40 rounded-2xl p-8 border">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Why You Should Attend
              </h3>
              <ul className="space-y-3">
                {whyAttend.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONFERENCE TRACKS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">Conference Tracks</Badge>
            <h2 className="text-4xl font-bold mb-4">
              Sessions That <span className="text-primary">Drive Results</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Through workshops, policy discussions, and powerful networking, attendees collaborate to expand access to federal contracting, strengthen supply chains, and shape national strategy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <Card key={track.title} className="hover:shadow-lg transition-shadow border-0 bg-background overflow-hidden">
                  {/* Track Image */}
                  <div className="relative h-40 w-full">
                    <Image
                      src={track.image}
                      alt={track.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className={`inline-flex p-2 rounded-lg ${track.color} bg-white/90`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{track.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{track.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION & TICKETS ────────────────────────────────────────────── */}
      <section id="register" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">Registration</Badge>
            <h2 className="text-4xl font-bold mb-4">
              Choose Your <span className="text-primary">Registration</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Members save on every registration tier. Not a member yet?{" "}
              <a href="https://hubzonecouncil.org/Get_Involved" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                Join today
              </a>{" "}
              and unlock member pricing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tickets.map((ticket) => (
              <Card
                key={ticket.type}
                className={`relative flex flex-col ${ticket.highlight ? "border-[#c9a227] shadow-lg shadow-[#c9a227]/10 scale-105" : "border"}`}
              >
                {ticket.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#c9a227] text-[#1a2b4a] px-4 py-1 shadow-md font-semibold">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-7 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2">{ticket.type}</h3>
                  <p className="text-muted-foreground text-sm mb-5">{ticket.description}</p>

                  {/* Pricing */}
                  <div className="space-y-2 mb-6">
                    {ticket.tiers.map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-muted-foreground">{tier.label}</span>
                        <span className="font-bold text-lg text-[#c9a227]">{tier.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Includes */}
                  <ul className="space-y-2 mb-8 flex-1">
                    {ticket.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-[#c9a227] shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${ticket.highlight ? "bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold" : "border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"}`}
                    variant={ticket.highlight ? "default" : "outline"}
                    asChild
                  >
                    <a href={ticket.href} target="_blank" rel="noopener noreferrer">
                      {ticket.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENUE ────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-[#c9a227] border-[#c9a227]/30">Venue & Hotel</Badge>
              <h2 className="text-4xl font-bold mb-6">
                Westfields <span className="text-[#c9a227]">Marriott</span>
              </h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-[#c9a227] mt-1 shrink-0" />
                <div>
                  <p className="font-semibold">14750 Conference Center Dr</p>
                  <p className="text-muted-foreground">Chantilly, VA 20151</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Experience world-class conference facilities at the Westfields Marriott in Chantilly, Virginia—conveniently located near Dulles International Airport and the nation&apos;s capital. A special room block has been reserved for conference attendees.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#1e3a5f] hover:bg-[#152a45] text-white" asChild>
                  <a href={eventDetails.hotelUrl} target="_blank" rel="noopener noreferrer">
                    <Building2 className="mr-2 h-4 w-4" />
                    Book Hotel Accommodations
                  </a>
                </Button>
                <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white" asChild>
                  <a
                    href="https://maps.google.com/?q=14750+Conference+Center+Dr+Chantilly+VA+20151"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>

            {/* Map placeholder card */}
            <div className="rounded-2xl overflow-hidden border shadow-sm bg-background h-72 md:h-80 flex flex-col">
              <iframe
                title="Westfields Marriott Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.7!2d-77.4486!3d38.9011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b64d2b0a1b0a1b%3A0x1!2sWestfields+Marriott+Washington+Dulles%2C+14750+Conference+Center+Dr%2C+Chantilly%2C+VA+20151!5e0!3m2!1sen!2sus!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, flex: 1 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0a1628] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-primary/20 text-primary border border-primary/30 mb-6 text-sm px-4 py-1.5">
            HUBZone Contractors National Council
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Not a Member Yet?
          </h2>
          <p className="text-white/70 text-lg mb-4 max-w-2xl mx-auto">
            Join the HUBZone Contractors National Council today to access member pricing, exclusive resources, and a powerful network of advocates driving change in distressed communities across America.
          </p>
          <p className="text-white/50 text-sm mb-10">
            Members save on conference registration — join before you register!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" asChild>
              <a href="https://hubzonecouncil.org/Get_Involved" target="_blank" rel="noopener noreferrer">
                Join Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10" asChild>
              <a href={eventDetails.registerUrl} target="_blank" rel="noopener noreferrer">
                Register for Conference
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── SPONSORSHIP ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <div className="bg-muted/40 rounded-2xl p-8 border order-2 md:order-1">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Sponsorship Benefits Include
              </h3>
              <ul className="space-y-3">
                {[
                  "Premier brand visibility to 500+ HUBZone business leaders",
                  "Speaking and panel opportunities in front of key decision-makers",
                  "Featured placement in conference program and marketing materials",
                  "Priority exhibit space on the conference floor",
                  "Direct access to federal agency officials and prime contractors",
                  "Post-conference attendee engagement report",
                  "Year-round recognition as a Council sponsor",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 md:order-2">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30">Sponsorship Opportunities</Badge>
              <h2 className="text-4xl font-bold mb-6">
                Elevate Your Brand.<br />
                <span className="text-primary">Advance the Mission.</span>
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                The 2026 National HUBZone Conference offers unparalleled sponsorship opportunities to connect your organization with hundreds of small business leaders, federal officials, and policymakers who shape the future of federal contracting.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Multiple sponsorship tiers are available to fit your goals and budget—from title sponsorships to luncheon, reception, and session-level packages.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <a href={eventDetails.sponsorUrl} target="_blank" rel="noopener noreferrer">
                    View Sponsorship Packages
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://hubzonecouncil.org/page-18253" target="_blank" rel="noopener noreferrer">
                    Meet Our Sponsors
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPEAKERS TEASER ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">Speakers</Badge>
          <h2 className="text-4xl font-bold mb-4">
            World-Class <span className="text-primary">Speakers</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-10">
            Hear from leading voices in federal contracting, small business advocacy, manufacturing, and public policy. Speaker announcements coming soon.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Federal Agency Officials", "SBA Leadership", "Prime Contractors", "Policy Makers", "Industry Innovators", "HUBZone Champions"].map((role) => (
              <div key={role} className="flex items-center gap-2 bg-background border rounded-full px-4 py-2 text-sm">
                <Mic2 className="h-3.5 w-3.5 text-primary" />
                <span>{role}</span>
              </div>
            ))}
          </div>
          <Button asChild>
            <a href="https://hubzonecouncil.org/SPEAKERS" target="_blank" rel="noopener noreferrer">
              View Conference Speakers
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Join Us in <span className="text-primary">2026?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Don&apos;t miss your chance to be part of the nation&apos;s most impactful gathering of HUBZone business leaders, federal agencies, and community advocates.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <a href={eventDetails.registerUrl} target="_blank" rel="noopener noreferrer">
                  Register Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
                <a href={eventDetails.sponsorUrl} target="_blank" rel="noopener noreferrer">
                  Become a Sponsor
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
                <a href={eventDetails.hotelUrl} target="_blank" rel="noopener noreferrer">
                  Reserve Hotel Room
                </a>
              </Button>
            </div>

            {/* Contact */}
            <div className="border-t border-primary/10 pt-8">
              <p className="text-sm text-muted-foreground mb-4 font-medium">Questions? Contact the HUBZone Contractors National Council</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <a href="tel:240-442-1787" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  240-442-1787
                </a>
                <a href="mailto:info@hubzonecouncil.org" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  info@hubzonecouncil.org
                </a>
                <a href="https://hubzonecouncil.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Globe className="h-4 w-4" />
                  hubzonecouncil.org
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-4">PO Box 355 · Oakland, MD 21550</p>
              <p className="text-xs text-muted-foreground mt-1">HUBZone Contractors National Council is a 501(c)6 non-profit organization.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
