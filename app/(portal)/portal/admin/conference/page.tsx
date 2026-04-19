"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Users,
  Mic2,
  CalendarDays,
  Ticket,
  Newspaper,
  Building2,
  PackageOpen,
  UserCog,
  Video,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    title: "About Event",
    description: "Manage conference details, dates, venue, and event status.",
    href: "/portal/admin/conference/about",
    icon: Info,
    color: "bg-blue-500/10 text-blue-600",
    badge: "Core",
  },
  {
    title: "Collaborators",
    description: "Add and manage co-organizers and collaborating organizations.",
    href: "/portal/admin/conference/collaborators",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600",
    badge: null,
  },
  {
    title: "Speakers",
    description: "Manage keynote speakers, panelists, and workshop presenters.",
    href: "/portal/admin/conference/speakers",
    icon: Mic2,
    color: "bg-green-500/10 text-green-600",
    badge: null,
  },
  {
    title: "Event Schedule",
    description: "Build the full agenda — sessions, tracks, rooms, and time slots.",
    href: "/portal/admin/conference/sessions",
    icon: CalendarDays,
    color: "bg-orange-500/10 text-orange-600",
    badge: null,
  },
  {
    title: "Registration / Tickets",
    description: "Configure ticket tiers, pricing, availability, and sale windows.",
    href: "/portal/admin/conference/tickets",
    icon: Ticket,
    color: "bg-pink-500/10 text-pink-600",
    badge: null,
  },
  {
    title: "Event News",
    description: "Publish announcements, speaker spotlights, and event updates.",
    href: "/portal/admin/conference/news",
    icon: Newspaper,
    color: "bg-cyan-500/10 text-cyan-600",
    badge: null,
  },
  {
    title: "Event Sponsors",
    description: "Track sponsors, their tiers, contract status, and payment.",
    href: "/portal/admin/conference/sponsors",
    icon: Building2,
    color: "bg-yellow-500/10 text-yellow-600",
    badge: null,
  },
  {
    title: "Sponsorship Packages",
    description: "Define sponsorship tiers with benefits, pricing, and availability.",
    href: "/portal/admin/conference/packages",
    icon: PackageOpen,
    color: "bg-indigo-500/10 text-indigo-600",
    badge: null,
  },
  {
    title: "Organizer Details",
    description: "Manage lead organizers, co-organizers, and fiscal sponsors.",
    href: "/portal/admin/conference/organizers",
    icon: UserCog,
    color: "bg-rose-500/10 text-rose-600",
    badge: null,
  },
  {
    title: "Virtual Access",
    description: "Manage Zoom, Teams, and other virtual meeting links and per-attendee access grants.",
    href: "/portal/admin/conference/virtual-access",
    icon: Video,
    color: "bg-sky-500/10 text-sky-600",
    badge: "NEW",
  },
];

export default function ConferenceAdminHubPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conference Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all aspects of your conference from a single hub.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${mod.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {mod.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {mod.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-sm">{mod.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Manage</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
