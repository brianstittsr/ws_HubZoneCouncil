"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { COLLECTIONS, type PlatformSettingsDoc } from "@/lib/schema";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Factory,
  LayoutDashboard,
  Target,
  FolderKanban,
  Users,
  Building,
  FileText,
  Calendar,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Handshake,
  DollarSign,
  User,
  ImageIcon,
  Shield,
  Rocket,
  Battery,
  UserCog,
  Building2,
  Search,
  Linkedin,
  FileSignature,
  Bot,
  Plug,
  Bug,
  Heart,
  Phone,
  CalendarClock,
  Eye,
  EyeOff,
  UserCheck,
  Megaphone,
  CreditCard,
  Database,
  Video,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GraduationCap, Paintbrush, BookOpen, Network, Briefcase, Ticket, LayoutGrid } from "lucide-react";

// ============================================================================
// SECTION DEFINITIONS - Organized by Role Access
// ============================================================================
export const SECTIONS = {
  // Everyone sees these
  dashboard: { label: "Dashboard", roles: ["admin", "team", "affiliate", "consultant"] },
  myWork: { label: "My Work", roles: ["admin", "team", "affiliate", "consultant"] },
  
  // Networking & Collaboration (Affiliates, Team, Consultants)
  networking: { label: "Networking", roles: ["admin", "team", "affiliate", "consultant"] },
  
  // Business Development (Team, Admin)
  salesCrm: { label: "Sales & CRM", roles: ["admin", "team"] },
  
  // Content & Resources (Everyone)
  resources: { label: "Resources", roles: ["admin", "team", "affiliate", "consultant"] },
  
  // AI Tools (Everyone)
  aiTools: { label: "AI Tools", roles: ["admin", "team", "affiliate", "consultant"] },
  
  // Admin Only
  adminTools: { label: "Admin Tools", roles: ["admin"] },
  systemSettings: { label: "System Settings", roles: ["admin"] },
} as const;

// ============================================================================
// DASHBOARD - Everyone sees this
// ============================================================================
const dashboardItems = [
  {
    title: "Command Center",
    href: "/portal/command-center",
    icon: LayoutDashboard,
  },
];

// ============================================================================
// MY WORK - Personal productivity (Everyone)
// ============================================================================
const myWorkItems = [
  {
    title: "Calendar",
    href: "/portal/calendar",
    icon: Calendar,
  },
  {
    title: "Availability",
    href: "/portal/availability",
    icon: CalendarDays,
  },
  {
    title: "Rocks",
    href: "/portal/rocks",
    icon: CheckSquare,
  },
  {
    title: "Events",
    href: "/portal/admin/events",
    icon: Ticket,
  },
];

// ============================================================================
// NETWORKING - Affiliate-focused collaboration (Everyone)
// ============================================================================
const networkingItems = [
  {
    title: "Networking Hub",
    href: "/portal/networking",
    icon: Handshake,
  },
  {
    title: "Affiliates",
    href: "/portal/affiliates",
    icon: Network,
  },
  {
    title: "Referrals",
    href: "/portal/referrals",
    icon: Heart,
  },
];

// ============================================================================
// SALES & CRM - Business development (Team, Admin)
// ============================================================================
const salesCrmItems = [
  {
    title: "Opportunities",
    href: "/portal/opportunities",
    icon: Target,
  },
  {
    title: "Projects",
    href: "/portal/projects",
    icon: FolderKanban,
  },
  {
    title: "Customers",
    href: "/portal/customers",
    icon: Building,
  },
  {
    title: "Deals",
    href: "/portal/deals",
    icon: DollarSign,
  },
  {
    title: "Strategic Partners",
    href: "/portal/admin/strategic-partners",
    icon: Building2,
  },
  {
    title: "GoHighLevel",
    href: "/portal/gohighlevel",
    icon: Plug,
    badge: "CRM",
  },
];

// ============================================================================
// RESOURCES - Content & Documents (Everyone)
// ============================================================================
const resourcesItems = [
  {
    title: "Documents",
    href: "/portal/documents",
    icon: FileText,
  },
  {
    title: "Proposals",
    href: "/portal/proposals",
    icon: FileSignature,
  },
];

// ============================================================================
// AI TOOLS - AI-powered features (Everyone)
// ============================================================================
const aiToolsItems = [
  {
    title: "Ask IntellEDGE",
    href: "/portal/ask",
    icon: Sparkles,
  },
  {
    title: "CMMC Analyzer",
    href: "/portal/cmmc/analyzer",
    icon: Shield,
    badge: "NEW",
  },
  {
    title: "AI Workforce",
    href: "/portal/ai-workforce",
    icon: Bot,
    badge: "AI",
  },
  {
    title: "Proposal Creator",
    href: "/portal/proposals",
    icon: FileText,
    badge: "AI",
  },
  {
    title: "LinkedIn Content",
    href: "/portal/linkedin-content",
    icon: Linkedin,
    badge: "AI",
  },
  {
    title: "Apollo Search",
    href: "/portal/apollo-search",
    icon: Search,
    badge: "AI",
  },
  {
    title: "Supplier Search",
    href: "/portal/supplier-search",
    icon: Factory,
    badge: "AI",
  },
  {
    title: "SVP Tools",
    href: "/portal/svp-tools",
    icon: Sparkles,
    badge: "AI",
  },
  {
    title: "Webinar Creator",
    href: "/portal/admin/webinar-creator",
    icon: Video,
    badge: "NEW",
  },
];

// ============================================================================
// ADMIN TOOLS - Platform management (Admin only)
// ============================================================================
const adminToolsItems = [
  {
    title: "Team Members",
    href: "/portal/admin/team-members",
    icon: UserCog,
  },
  {
    title: "EOS2 Dashboard",
    href: "/portal/eos2",
    icon: Target,
    badge: "EOS",
  },
  {
    title: "Initiatives",
    href: "/portal/admin/initiatives",
    icon: Rocket,
  },
  {
    title: "TBMNC Suppliers",
    href: "/portal/admin/initiatives/tbmnc",
    icon: Battery,
  },
  {
    title: "SAM.gov Search",
    href: "/portal/admin/sam-gov",
    icon: Building,
    badge: "NEW",
  },
  {
    title: "USASpending Search",
    href: "/portal/admin/usaspending",
    icon: DollarSign,
    badge: "AI",
  },
  {
    title: "Marketing Hub",
    href: "/portal/admin/marketing-hub",
    icon: Megaphone,
    badge: "NEW",
  },
  {
    title: "Academy Admin",
    href: "/portal/admin/academy",
    icon: GraduationCap,
  },
  {
    title: "Zenthium DC Referrals",
    href: "/portal/admin/zenthium-referrals",
    icon: Database,
    badge: "NEW",
  },
  {
    title: "Fathom Meetings",
    href: "/portal/admin/fathom",
    icon: Video,
  },
  {
    title: "Fireflies.ai",
    href: "/portal/admin/fireflies",
    icon: Flame,
  },
];

// ============================================================================
// SYSTEM SETTINGS - System configuration (Admin only)
// ============================================================================
const systemSettingsItems = [
  {
    title: "Site Settings",
    href: "/portal/admin/site-settings",
    icon: Settings,
    badge: "NEW",
  },
  {
    title: "Stripe Integration",
    href: "/portal/admin/stripe-test",
    icon: CreditCard,
    badge: "PAY",
  },
  {
    title: "AI Page Designer",
    href: "/portal/admin/page-designer",
    icon: Paintbrush,
  },
  {
    title: "Header & Footer Manager",
    href: "/portal/admin/navigation-manager",
    icon: LayoutGrid,
  },
  {
    title: "Hero Management",
    href: "/portal/admin/hero",
    icon: ImageIcon,
  },
  {
    title: "Image Manager",
    href: "/portal/admin/images",
    icon: ImageIcon,
  },
  {
    title: "Contact Popup",
    href: "/portal/admin/popup",
    icon: MessageSquare,
  },
  {
    title: "Growth IQ Quiz",
    href: "/portal/admin/quiz",
    icon: Battery,
  },
  {
    title: "Backup & Restore",
    href: "/portal/admin/backups",
    icon: Database,
  },
  {
    title: "Bug Tracker",
    href: "/portal/bug-tracker",
    icon: Bug,
  },
];

// All available roles for the role switcher
const AVAILABLE_ROLES = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "team", label: "Team Member" },
  { value: "affiliate", label: "Affiliate" },
  { value: "consultant", label: "Consultant" },
];

// Export all nav items for use in settings
export const ALL_NAV_ITEMS = [
  ...dashboardItems.map(item => ({ ...item, section: "Dashboard" })),
  ...myWorkItems.map(item => ({ ...item, section: "My Work" })),
  ...networkingItems.map(item => ({ ...item, section: "Networking" })),
  ...salesCrmItems.map(item => ({ ...item, section: "Sales & CRM" })),
  ...resourcesItems.map(item => ({ ...item, section: "Resources" })),
  ...aiToolsItems.map(item => ({ ...item, section: "AI Tools" })),
  ...adminToolsItems.map(item => ({ ...item, section: "Admin Tools" })),
  ...systemSettingsItems.map(item => ({ ...item, section: "System Settings" })),
];

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getDisplayName, getInitials, profile } = useUserProfile();

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase Auth
      if (auth) {
        await signOut(auth);
      }
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear specific localStorage items if needed
      localStorage.removeItem("svp_remembered_email");
      localStorage.removeItem("svp_remember_me");
      
      // Hard redirect to home page to ensure full page reload and clear all state
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, try to redirect
      window.location.href = "/";
    }
  };
  const [hiddenNavItems, setHiddenNavItems] = useState<string[]>([]);
  const [roleVisibility, setRoleVisibility] = useState<Record<string, string[]>>({});
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  const isAdmin = profile.role === "admin" || profile.role === "superadmin";
  
  // The effective role for filtering (either preview role or actual role)
  const effectiveRole = previewRole || profile.role;

  // Load navigation settings from Firebase with real-time listener
  useEffect(() => {
    if (!db) return;
    
    const docRef = doc(db, COLLECTIONS.PLATFORM_SETTINGS, "global");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlatformSettingsDoc;
        if (data.navigationSettings?.hiddenItems) {
          setHiddenNavItems(data.navigationSettings.hiddenItems);
        } else {
          setHiddenNavItems([]);
        }
        if (data.navigationSettings?.roleVisibility) {
          setRoleVisibility(data.navigationSettings.roleVisibility);
        } else {
          setRoleVisibility({});
        }
      }
    }, (error) => {
      console.error("Error loading navigation settings:", error);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Define nav item type
  type NavItem = {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  };

  // Filter nav items based on role-based visibility
  const filterNavItems = (items: NavItem[]) => {
    return items.filter((item: NavItem) => {
      // If admin is not previewing, show all items
      if (isAdmin && !previewRole) return true;
      
      // Check role-based visibility
      const roleHiddenItems = roleVisibility[effectiveRole] || [];
      const isHiddenForRole = roleHiddenItems.includes(item.href);
      
      // Also check legacy hiddenItems for backwards compatibility
      const isGloballyHidden = hiddenNavItems.includes(item.href);
      
      return !isHiddenForRole && !isGloballyHidden;
    });
  };
  
  // Check if item should show as hidden (for admin preview)
  const isItemHidden = (href: string) => {
    const roleHiddenItems = roleVisibility[effectiveRole] || [];
    return roleHiddenItems.includes(href) || hiddenNavItems.includes(href);
  };
  
  // Collapsible state for each section
  const [openSections, setOpenSections] = useState({
    dashboard: true,
    myWork: true,
    networking: true,
    salesCrm: true,
    resources: true,
    aiTools: true,
    adminTools: false,
    systemSettings: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/portal" className="flex items-center gap-2 px-2 py-4">
          <NextImage
            src="/logo.jpg"
            alt="HubZone Council Logo"
            width={40}
            height={40}
            style={{ width: 'auto', height: 'auto' }}
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">HubZone Council</span>
            <span className="text-xs text-sidebar-foreground/60">Member Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* ── CONFERENCE MANAGEMENT – Pinned Feature ── */}
        {isAdmin && (
          <div className="px-3 pt-3 pb-1">
            <Link
              href="/portal/admin/conference"
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 font-semibold text-sm transition-all",
                pathname.startsWith("/portal/admin/conference")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              )}
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span className="flex-1">Conference Mgmt</span>
              <Badge className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary border-0 font-semibold">NEW</Badge>
            </Link>
          </div>
        )}

        {/* Reusable Section Renderer - Organized by Role */}
        {([
          { key: "dashboard" as const, label: "Dashboard", items: dashboardItems, roles: ["admin", "team", "team_member", "affiliate", "consultant", "superadmin"] },
          { key: "myWork" as const, label: "My Work", items: myWorkItems, roles: ["admin", "team", "team_member", "affiliate", "consultant", "superadmin"] },
          { key: "networking" as const, label: "Networking", items: networkingItems, roles: ["admin", "team", "team_member", "affiliate", "consultant", "superadmin"] },
          { key: "salesCrm" as const, label: "Sales & CRM", items: salesCrmItems, roles: ["admin", "team", "team_member", "superadmin"] },
          { key: "resources" as const, label: "Resources", items: resourcesItems, roles: ["admin", "team", "team_member", "affiliate", "consultant", "superadmin"] },
          { key: "aiTools" as const, label: "AI Tools", items: aiToolsItems, roles: ["admin", "team", "team_member", "affiliate", "consultant", "superadmin"] },
          { key: "adminTools" as const, label: "Admin Tools", items: adminToolsItems, roles: ["admin", "superadmin"] },
          { key: "systemSettings" as const, label: "System Settings", items: systemSettingsItems, roles: ["admin", "superadmin"] },
        ]).map(({ key, label, items, roles }) => {
          // Skip sections that the user's role doesn't have access to
          if (!roles.includes(effectiveRole) && !isAdmin) return null;
          
          const filteredItems = filterNavItems(items as NavItem[]);
          if (filteredItems.length === 0) return null;
          
          return (
            <Collapsible 
              key={key} 
              open={openSections[key]} 
              onOpenChange={() => toggleSection(key)}
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 rounded-md flex items-center justify-between pr-2">
                    <span>{label}</span>
                    {openSections[key] ? (
                      <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {filteredItems.map((item) => {
                        const hidden = isItemHidden(item.href);
                        return (
                          <SidebarMenuItem key={item.href} className={cn(hidden && isAdmin && !previewRole && "opacity-50")}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                              tooltip={item.title}
                            >
                              <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                                {hidden && isAdmin && !previewRole && (
                                  <EyeOff className="h-3 w-3 ml-auto text-muted-foreground" />
                                )}
                              </Link>
                            </SidebarMenuButton>
                            {item.badge && !hidden && (
                              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                            )}
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* Admin Role Switcher */}
        {isAdmin && (
          <div className="px-3 py-2 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-sidebar-foreground/60" />
              <span className="text-xs font-medium text-sidebar-foreground/60">Preview as Role</span>
            </div>
            <Select
              value={previewRole || "admin"}
              onValueChange={(value) => setPreviewRole(value === "admin" ? null : value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select role to preview" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="text-xs">
                    <div className="flex items-center gap-2">
                      {role.label}
                      {role.value === "admin" && (
                        <Badge variant="outline" className="text-[10px] h-4">Your Role</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {previewRole && (
              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Previewing as {AVAILABLE_ROLES.find(r => r.value === previewRole)?.label}
              </p>
            )}
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-sidebar-foreground/60 capitalize">
                      {previewRole ? `${profile.role.replace("_", " ")} (viewing as ${previewRole.replace("_", " ")})` : profile.role.replace("_", " ")}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/portal/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings?tab=notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
