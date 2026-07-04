"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import {
  COLLECTIONS,
  type ConferenceRegistrationDoc,
  type ConferenceSpeakerApplicationDoc,
  type ConferenceSponsorRequestDoc,
} from "@/lib/schema";
import { collection, getDocs, Timestamp } from "firebase/firestore";
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
  ClipboardList,
  MapPin,
  CreditCard,
  Mail,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  MessageSquare,
} from "lucide-react";

interface DashboardStats {
  registrations: number;
  confirmedRegistrations: number;
  pendingRegistrations: number;
  revenue: number;
  speakers: number;
  speakerApplications: number;
  pendingSpeakerApplications: number;
  sessions: number;
  sponsors: number;
  sponsorRequests: number;
  pendingSponsorRequests: number;
  publishedNews: number;
  chatQuestions: number;
  wikiEntries: number;
  publicWikiEntries: number;
  checkIns: number;
}

interface ActionItem {
  id: string;
  type: "registration" | "speaker" | "sponsor" | "payment" | "chat" | "session" | "news";
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
  timestamp?: Timestamp;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp?: Timestamp;
  href?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (timestamp?: Timestamp) => {
  if (!timestamp) return "—";
  return new Date(timestamp.seconds * 1000).toLocaleString();
};

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
    title: "Conference Wiki",
    description: "Manage the AI knowledge base, documents, and chat logs.",
    href: "/portal/admin/conference/wiki",
    icon: BookOpen,
    color: "bg-violet-500/10 text-violet-600",
    badge: "AI",
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
    title: "Registrations",
    description: "View attendee registrations, payment status, and check-ins.",
    href: "/portal/admin/conference/registrations",
    icon: ClipboardList,
    color: "bg-emerald-500/10 text-emerald-600",
    badge: "NEW",
  },
  {
    title: "Speaker Applications",
    description: "Review and approve public speaker applications.",
    href: "/portal/admin/conference/speaker-applications",
    icon: Mic2,
    color: "bg-lime-500/10 text-lime-600",
    badge: "NEW",
  },
  {
    title: "Venue & Rooms",
    description: "Manage conference venues, hotels, and session rooms.",
    href: "/portal/admin/conference/venue",
    icon: MapPin,
    color: "bg-violet-500/10 text-violet-600",
    badge: "NEW",
  },
  {
    title: "Payments",
    description: "Track Stripe payments, revenue, and refunds.",
    href: "/portal/admin/conference/payments",
    icon: CreditCard,
    color: "bg-amber-500/10 text-amber-600",
    badge: "NEW",
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
    title: "Sponsor Requests",
    description: "Review and manage inbound sponsorship inquiries.",
    href: "/portal/admin/conference/sponsor-requests",
    icon: Mail,
    color: "bg-teal-500/10 text-teal-600",
    badge: "NEW",
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!db) {
        setError("Database not initialized");
        setLoading(false);
        return;
      }

      try {
        const [
          registrationsSnap,
          speakersSnap,
          speakerApplicationsSnap,
          sessionsSnap,
          sponsorsSnap,
          sponsorRequestsSnap,
          newsSnap,
          chatLogsSnap,
          wikiEntriesSnap,
          checkInsSnap,
          ticketsSnap,
        ] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.CONFERENCE_REGISTRATIONS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_SPEAKERS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_SPEAKER_APPLICATIONS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_SESSIONS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_SPONSORS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_SPONSOR_REQUESTS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_NEWS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_CHAT_LOGS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_CHECK_INS)),
          getDocs(collection(db, COLLECTIONS.CONFERENCE_TICKETS)),
        ]);

        const registrations = registrationsSnap.docs.map((d) => d.data() as ConferenceRegistrationDoc);
        const confirmedRegistrations = registrations.filter((r) => r.status === "confirmed" || r.status === "checked-in").length;
        const pendingRegistrations = registrations.filter((r) => r.status === "pending").length;
        const revenue = registrations.reduce((sum, r) => sum + (Number(r.amountPaid) || 0), 0);

        const speakerApplications = speakerApplicationsSnap.docs.map((d) => ({ ...(d.data() as ConferenceSpeakerApplicationDoc), id: d.id }));
        const pendingSpeakerApplications = speakerApplications.filter((a) => a.status === "pending").length;

        const sponsorRequests = sponsorRequestsSnap.docs.map((d) => ({ ...(d.data() as ConferenceSponsorRequestDoc), id: d.id }));
        const pendingSponsorRequests = sponsorRequests.filter((r) => r.status === "new").length;

        const publishedNews = newsSnap.docs.filter((d) => d.data().isPublished !== false).length;
        const publicWikiEntries = wikiEntriesSnap.docs.filter((d) => d.data().isPublic !== false).length;

        setStats({
          registrations: registrations.length,
          confirmedRegistrations,
          pendingRegistrations,
          revenue,
          speakers: speakersSnap.docs.length,
          speakerApplications: speakerApplications.length,
          pendingSpeakerApplications,
          sessions: sessionsSnap.docs.length,
          sponsors: sponsorsSnap.docs.length,
          sponsorRequests: sponsorRequests.length,
          pendingSponsorRequests,
          publishedNews,
          chatQuestions: chatLogsSnap.docs.length,
          wikiEntries: wikiEntriesSnap.docs.length,
          publicWikiEntries,
          checkIns: checkInsSnap.docs.length,
        });

        // Build action items
        const actionItems: ActionItem[] = [];

        if (pendingSpeakerApplications > 0) {
          actionItems.push({
            id: "pending-speakers",
            type: "speaker",
            title: `${pendingSpeakerApplications} speaker application${pendingSpeakerApplications === 1 ? "" : "s"} pending review`,
            description: "Approve, reject, or waitlist applicants to build the agenda.",
            href: "/portal/admin/conference/speaker-applications",
            priority: "high",
          });
        }

        if (pendingSponsorRequests > 0) {
          actionItems.push({
            id: "pending-sponsors",
            type: "sponsor",
            title: `${pendingSponsorRequests} new sponsor request${pendingSponsorRequests === 1 ? "" : "s"}`,
            description: "Follow up with sponsors and convert inquiries into commitments.",
            href: "/portal/admin/conference/sponsor-requests",
            priority: "high",
          });
        }

        if (pendingRegistrations > 0) {
          actionItems.push({
            id: "pending-registrations",
            type: "registration",
            title: `${pendingRegistrations} registration${pendingRegistrations === 1 ? "" : "s"} pending payment`,
            description: "Review pending registrations and confirm payment status.",
            href: "/portal/admin/conference/registrations",
            priority: "medium",
          });
        }

        if (speakersSnap.docs.length === 0) {
          actionItems.push({
            id: "no-speakers",
            type: "speaker",
            title: "No speakers added yet",
            description: "Add keynote speakers and panelists to promote the event.",
            href: "/portal/admin/conference/speakers",
            priority: "high",
          });
        }

        if (sessionsSnap.docs.length === 0) {
          actionItems.push({
            id: "no-sessions",
            type: "session",
            title: "Event schedule is empty",
            description: "Create sessions, tracks, and time slots for the agenda.",
            href: "/portal/admin/conference/sessions",
            priority: "high",
          });
        }

        if (sponsorsSnap.docs.length === 0) {
          actionItems.push({
            id: "no-sponsors",
            type: "sponsor",
            title: "No sponsors confirmed",
            description: "Add sponsor records and track contract / payment status.",
            href: "/portal/admin/conference/sponsors",
            priority: "medium",
          });
        }

        if (ticketsSnap.docs.length === 0) {
          actionItems.push({
            id: "no-tickets",
            type: "registration",
            title: "Ticket tiers not configured",
            description: "Set up pricing and availability so visitors can register.",
            href: "/portal/admin/conference/tickets",
            priority: "high",
          });
        }

        if (publishedNews === 0) {
          actionItems.push({
            id: "no-news",
            type: "news",
            title: "No event announcements published",
            description: "Publish news to drive awareness and engagement.",
            href: "/portal/admin/conference/news",
            priority: "low",
          });
        }

        if (publicWikiEntries === 0) {
          actionItems.push({
            id: "no-wiki",
            type: "chat",
            title: "Conference wiki is empty",
            description: "Add wiki entries so the home-page AI assistant can answer questions.",
            href: "/portal/admin/conference/wiki",
            priority: "medium",
          });
        }

        setActions(actionItems);

        // Build recent activity
        const recentActivity: RecentActivity[] = [];

        const recentRegistrations = registrations
          .filter((r) => r.createdAt)
          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
          .slice(0, 3);
        recentRegistrations.forEach((r) => {
          recentActivity.push({
            id: `reg-${r.email}`,
            type: "Registration",
            title: `${r.firstName} ${r.lastName} registered for ${r.ticketName}`,
            timestamp: r.createdAt,
            href: "/portal/admin/conference/registrations",
          });
        });

        const recentSponsors = sponsorRequests
          .filter((r) => r.createdAt)
          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
          .slice(0, 2);
        recentSponsors.forEach((r) => {
          recentActivity.push({
            id: `sponsor-${r.id}`,
            type: "Sponsor Request",
            title: `${r.organizationName} inquired about ${r.tier} sponsorship`,
            timestamp: r.createdAt,
            href: "/portal/admin/conference/sponsor-requests",
          });
        });

        const recentSpeakers = speakerApplications
          .filter((a) => a.createdAt)
          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
          .slice(0, 2);
        recentSpeakers.forEach((a) => {
          recentActivity.push({
            id: `speaker-${a.id}`,
            type: "Speaker Application",
            title: `${a.firstName} ${a.lastName} applied to speak: ${a.proposedSessionTitle}`,
            timestamp: a.createdAt,
            href: "/portal/admin/conference/speaker-applications",
          });
        });

        const recentChat = chatLogsSnap.docs
          .map((d) => d.data())
          .filter((d) => d.createdAt)
          .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
          .slice(0, 2);
        recentChat.forEach((c) => {
          recentActivity.push({
            id: `chat-${c.question}`,
            type: "Chat Question",
            title: `Visitor asked: "${c.question}"`,
            timestamp: c.createdAt,
            href: "/portal/admin/conference/wiki",
          });
        });

        recentActivity.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setActivity(recentActivity.slice(0, 6));
      } catch (err) {
        console.error("Error loading conference dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "speaker":
        return <Mic2 className="h-4 w-4" />;
      case "sponsor":
        return <Building2 className="h-4 w-4" />;
      case "registration":
        return <ClipboardList className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "chat":
        return <MessageSquare className="h-4 w-4" />;
      case "session":
        return <CalendarDays className="h-4 w-4" />;
      case "news":
        return <Newspaper className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HUBZone on the Rise — Conference Management</h1>
          <p className="text-muted-foreground mt-1">
            Track registrations, speakers, sponsors, and action items for the 2026 National HUBZone Conference.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/conference">View Public Site</Link>
        </Button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </>
        ) : stats ? (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Registrations</p>
                    <p className="text-3xl font-bold">{stats.registrations}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.confirmedRegistrations} confirmed · {stats.pendingRegistrations} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(stats.revenue)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">From confirmed registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Speakers</p>
                    <p className="text-3xl font-bold">{stats.speakers}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <Mic2 className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.pendingSpeakerApplications} application{stats.pendingSpeakerApplications === 1 ? "" : "s"} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="text-3xl font-bold">{stats.sessions}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Agenda items</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sponsors</p>
                    <p className="text-3xl font-bold">{stats.sponsors}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.pendingSponsorRequests} new request{stats.pendingSponsorRequests === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-ins</p>
                    <p className="text-3xl font-bold">{stats.checkIns}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Attendees checked in</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Chat Questions</p>
                    <p className="text-3xl font-bold">{stats.chatQuestions}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Visitor AI interactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wiki Entries</p>
                    <p className="text-3xl font-bold">{stats.publicWikiEntries}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.wikiEntries} total · {stats.publicWikiEntries} public
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {error || "No data available"}
          </div>
        )}
      </div>

      {/* Action Items & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>Action Items</CardTitle>
            </div>
            <CardDescription>Items that need attention to keep the conference moving.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : actions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 text-green-500" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No urgent action items right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <Link key={action.id} href={action.href}>
                    <div className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className={`p-2 rounded-lg ${getPriorityColor(action.priority)}`}>
                        {getTypeIcon(action.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{action.title}</h3>
                          <Badge variant={action.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Latest conference activity across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">No recent activity to display.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{item.type}</span>
                        <span>·</span>
                        <span>{formatDateTime(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Management Modules */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Management Modules</h2>
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
    </div>
  );
}
