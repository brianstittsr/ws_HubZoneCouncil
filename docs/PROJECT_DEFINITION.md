# Strategic Value+ Platform - Project Definition

> **Purpose**: This document serves as a comprehensive reference for LLMs to understand the SVP Platform architecture, enabling accurate integration of client requirements.

---

## 1. Project Overview

**Strategic Value+ Platform** is a Next.js 14+ application serving as both a **marketing website** and an **intelligent business orchestration platform** for Strategic Value Plus.

### Business Context
Strategic Value+ helps small- and mid-sized U.S. manufacturers (25-500 employees) win OEM contracts through:
- Supplier qualification
- ISO certification
- Operational readiness

### Platform Pillars
1. **Marketing Website** - Lead capture, service showcase, event promotion
2. **Business Portal** - Command center, pipeline management, affiliate coordination
3. **AI Intelligence** - Natural language queries across business data

---

## 2. Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | App Router framework |
| React | 19.2.0 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling |

### UI Components
| Library | Purpose |
|---------|---------|
| shadcn/ui | Component library (Radix UI primitives) |
| Lucide React | Icon system |
| class-variance-authority | Component variants |
| tailwind-merge + clsx | Class merging utilities |

### State Management
| Library | Purpose |
|---------|---------|
| Zustand | Global client state |
| TanStack React Query | Server state & caching |
| react-hook-form | Form state management |
| Zod | Schema validation |

### Backend & Database
| Service | Purpose |
|---------|---------|
| Firebase/Firestore | Database & authentication |
| Firebase Admin | Server-side operations |
| Firebase Storage | File storage |

### Integrations
| Service | Purpose |
|---------|---------|
| OpenAI | AI-powered features |
| GoHighLevel | CRM integration |
| Fireflies.ai | Meeting transcription |
| Fathom | Meeting intelligence |
| Mattermost | Team communication |
| Google APIs | Calendar, Drive integration |
| Microsoft Graph | Office 365 integration |
| Resend | Email service |

### Additional Libraries
- **recharts** - Data visualization
- **date-fns** - Date manipulation
- **@hello-pangea/dnd** - Drag and drop
- **qrcode.react** - QR code generation
- **puppeteer-core** - PDF generation

---

## 3. Project Structure

```
svp-platform/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing pages (route group)
│   ├── (portal)/                 # Authenticated portal (route group)
│   ├── api/                      # API route handlers
│   ├── auth/                     # Authentication pages
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui primitives (36 components)
│   ├── marketing/                # Marketing page components
│   ├── portal/                   # Portal-specific components
│   ├── admin/                    # Admin dashboard components
│   ├── shared/                   # Cross-cutting components
│   └── seo/                      # SEO components
├── lib/
│   ├── schema.ts                 # Firestore document types & collections
│   ├── firebase.ts               # Firebase client config
│   ├── firebase-admin.ts         # Firebase Admin config
│   ├── utils.ts                  # Utility functions (cn helper)
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Business logic services
│   └── [integration].ts          # Integration-specific modules
├── types/
│   └── index.ts                  # Core TypeScript interfaces
├── contexts/                     # React context providers
├── hooks/                        # Global custom hooks
├── public/                       # Static assets
├── docs/                         # Documentation
└── scripts/                      # Build/utility scripts
```

---

## 4. Route Architecture

### Marketing Routes `app/(marketing)/`
Public-facing pages with shared marketing layout.

| Route | Purpose |
|-------|---------|
| `/` | Homepage with hero, services, testimonials |
| `/about` | Company information |
| `/contact` | Contact form with lead capture |
| `/v-edge` | V+ EDGE service page |
| `/affiliates` | Affiliate program information |
| `/cmmc-training` | CMMC training registration |
| `/leadership` | Leadership team profiles |
| `/company` | Company overview |
| `/oem` | OEM services |
| `/accessibility` | Accessibility statement |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Portal Routes `app/(portal)/portal/`
Authenticated business portal with sidebar navigation.

| Route | Purpose |
|-------|---------|
| `/portal` | Portal home/redirect |
| `/portal/command-center` | Real-time dashboard |
| `/portal/opportunities` | Sales pipeline management |
| `/portal/projects` | Active engagement tracking |
| `/portal/customers` | CRM functionality |
| `/portal/affiliates` | Network capability directory |
| `/portal/team-members` | Team management |
| `/portal/meetings` | Meeting schedule & insights |
| `/portal/rocks` | 90-day goal tracking (EOS) |
| `/portal/tasks` | Task management |
| `/portal/documents` | File management |
| `/portal/calendar` | Calendar integration |
| `/portal/ask` | AI-powered queries (IntellEDGE) |
| `/portal/eos2` | EOS/Traction system |
| `/portal/networking/*` | Affiliate networking features |
| `/portal/proposals` | Proposal management |
| `/portal/deals` | Deal tracking |
| `/portal/referrals` | Referral tracking |
| `/portal/admin/*` | Admin-only features |

### API Routes `app/api/`
RESTful API endpoints organized by domain.

| Endpoint Group | Purpose |
|----------------|---------|
| `/api/admin/*` | Admin operations |
| `/api/ai/*` | AI/OpenAI integrations |
| `/api/auth/*` | Authentication |
| `/api/customers/*` | Customer CRUD |
| `/api/gohighlevel/*` | GoHighLevel CRM sync |
| `/api/fireflies/*` | Meeting transcription |
| `/api/fathom/*` | Meeting intelligence |
| `/api/mattermost/*` | Team chat integration |
| `/api/eos2/*` | EOS system webhooks |
| `/api/tools/*` | Internal tools |
| `/api/nda/*` | NDA management |
| `/api/bookings/*` | Booking system |

---

## 5. Data Models (Firestore Schema)

### Core Entities

#### User/Team Member
```typescript
interface UserDoc {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'team' | 'affiliate' | 'customer' | 'partner';
  avatar?: string;
  organizationId?: string;
  capabilities?: string[];
  createdAt: Timestamp;
  lastActive: Timestamp;
}
```

#### Organization
```typescript
interface OrganizationDoc {
  id: string;
  name: string;
  type: 'customer' | 'affiliate' | 'partner' | 'oem' | 'internal';
  industry?: string;
  size?: '1-25' | '25-100' | '100-250' | '250-500' | '500+';
  location?: Address;
  website?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Customer
```typescript
interface CustomerDoc {
  id: string;
  name: string;
  industry: string;
  size: "1-10" | "10-25" | "25-100" | "100-250" | "250-500" | "500-1000" | "1000+";
  city: string;
  state: string;
  contacts: CustomerContact[];
  status: "prospect" | "active" | "inactive" | "completed";
  projectCount: number;
  totalRevenue?: number;
  source?: "referral" | "website" | "cold-outreach" | "event" | "partner" | "other";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Opportunity (Sales Pipeline)
```typescript
interface OpportunityDoc {
  id: string;
  name: string;
  organizationId: string;
  stage: 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  expectedCloseDate: Timestamp;
  ownerId: string;
  serviceIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Project
```typescript
interface ProjectDoc {
  id: string;
  name: string;
  opportunityId?: string;
  organizationId: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: Timestamp;
  endDate?: Timestamp;
  teamIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### EOS/Traction System

#### Rock (90-Day Goal)
```typescript
interface TractionRockDoc {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  ownerName: string;
  dueDate: Timestamp;
  status: "on-track" | "at-risk" | "off-track" | "complete";
  progress: number; // 0-100
  quarter: string; // e.g., "Q1 2025"
  milestones?: Array<{ id: string; title: string; completed: boolean; }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Scorecard Metric
```typescript
interface TractionScorecardMetricDoc {
  id: string;
  name: string;
  goal: number;
  actual: number;
  ownerId: string;
  ownerName: string;
  trend: "up" | "down" | "flat";
  unit?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Issue (IDS)
```typescript
interface TractionIssueDoc {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  ownerId: string;
  status: "open" | "in-progress" | "solved";
  linkedRockId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### To-Do
```typescript
interface TractionTodoDoc {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  dueDate: Timestamp;
  status: "not-started" | "in-progress" | "complete";
  linkedRockId?: string;
  linkedIssueId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Affiliate Networking System

#### Affiliate Biography
```typescript
interface AffiliateBiographyDoc {
  id: string;
  affiliateId: string;
  businessName: string;
  profession: string;
  location: string;
  yearsInBusiness: number;
  hobbies: string[];
  activitiesOfInterest: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### GAINS Profile
```typescript
interface GainsProfileDoc {
  id: string;
  affiliateId: string;
  goals: string;
  accomplishments: string;
  interests: string;
  networks: string;
  skills: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### One-to-One Meeting
```typescript
interface OneToOneMeetingDoc {
  id: string;
  initiatorId: string;
  partnerId: string;
  scheduledDate: Timestamp;
  meetingType: "virtual" | "in-person";
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  meetingNotes?: string;
  svpReferralDiscussed: boolean;
  matchScore?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Referral
```typescript
interface ReferralDoc {
  id: string;
  referrerId: string;
  recipientId: string;
  referralType: "short-term" | "long-term";
  prospectName: string;
  isSvpReferral: boolean;
  status: "submitted" | "contacted" | "meeting-scheduled" | "proposal" | "negotiation" | "won" | "lost";
  dealValue?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Meeting Intelligence

#### Fathom Meeting
```typescript
interface FathomMeetingDoc {
  id: string;
  fathomMeetingId: string;
  title: string;
  meetingDate: Timestamp;
  duration: number;
  participants: string[];
  summary?: string;
  actionItems: FathomActionItem[];
  linkedCustomerId?: string;
  linkedProjectId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Fireflies Meeting
```typescript
interface FirefliesMeetingDoc {
  id: string;
  firefliesMeetingId: string;
  title: string;
  meetingDate: Timestamp;
  duration: number;
  participants: string[];
  summary?: object;
  transcript?: FirefliesSentence[];
  actionItems: FirefliesActionItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 6. Component Architecture

### UI Components (`components/ui/`)
shadcn/ui primitives - **36 components** including:
- **Layout**: Card, Separator, ScrollArea, Sheet, Sidebar
- **Forms**: Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Form, Label
- **Feedback**: Alert, AlertDialog, Dialog, ConfirmDialog, Tooltip, Popover, Sonner (toast)
- **Navigation**: NavigationMenu, Tabs, Accordion, Collapsible, Breadcrumb, DropdownMenu
- **Data Display**: Table, Avatar, Badge, Progress, Skeleton, Calendar
- **Utility**: Command (cmdk), ImagePicker

### Marketing Components (`components/marketing/`)
- **HeroCarousel** - Dynamic hero with slides from Firestore
- **ServicesOverview** - Service cards grid
- **HowItWorks** - Process steps
- **Testimonials** - Customer testimonials
- **LeadershipTeam** - Team member cards
- **CTASection** - Call-to-action blocks
- **ContactPopup** - Lead capture modal
- **StatsSection** - Metrics display

### Portal Components (`components/portal/`)
- **PortalSidebar** - Main navigation
- **PortalHeader** - Top bar with user menu
- **AuthGuard** - Route protection
- **AffiliateOnboardingWizard** - Multi-step onboarding
- **NetworkingWizard** - Networking profile setup
- **MeetingRecommendations** - AI-powered meeting suggestions
- **NetworkingLeaderboard** - Engagement rankings
- **PostMeetingForm** - Meeting outcome capture
- **ProfileCompletionWizard** - Profile setup flow

### Admin Components (`components/admin/`)
- Dashboard widgets
- User management
- System configuration

---

## 7. Key Patterns & Conventions

### File Naming
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx`
- **Components**: PascalCase (e.g., `HeroCarousel.tsx`)
- **Utilities**: kebab-case (e.g., `activity-logger.ts`)

### Import Aliases
```typescript
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { CustomerDoc } from "@/lib/schema";
import { cn } from "@/lib/utils";
```

### Component Pattern
```typescript
"use client"; // For client components

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div className={cn("base-classes", className)}>
      {/* content */}
    </div>
  );
}
```

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    // Firestore operation
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    
    // ... operation
    
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
```

### Form Pattern
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });
  
  const onSubmit = async (data: FormData) => {
    // Handle submission
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

---

## 8. Integration Points

### Firebase Configuration
- **Client**: `lib/firebase.ts` - Firestore, Auth
- **Admin**: `lib/firebase-admin.ts` - Server-side operations
- **Rules**: `firestore.rules`, `storage.rules`

### External Services
| Service | Config Location | Purpose |
|---------|-----------------|---------|
| GoHighLevel | `lib/gohighlevel.ts`, `lib/gohighlevel-service.ts` | CRM sync |
| Fireflies | `lib/` + `app/api/fireflies/` | Meeting transcription |
| Fathom | `app/api/fathom/` | Meeting intelligence |
| Mattermost | `lib/mattermost.ts` | Team communication |
| OpenAI | `lib/openai-config.ts` | AI features |
| Microsoft Graph | `lib/microsoft-graph.ts` | Office 365 |
| Google APIs | `lib/google-drive.ts`, `lib/calendar-integration.ts` | Drive, Calendar |

### Environment Variables
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=

# AI
OPENAI_API_KEY=

# Integrations
GHL_API_KEY=
FIREFLIES_API_KEY=
FATHOM_API_KEY=
MATTERMOST_URL=
MATTERMOST_TOKEN=

# Email
RESEND_API_KEY=

# Accessibility
NEXT_PUBLIC_USERWAY_ACCOUNT_ID=
```

---

## 9. Adding New Features

### Adding a New Portal Page
1. Create route: `app/(portal)/portal/[feature]/page.tsx`
2. Add to sidebar: `components/portal/portal-sidebar.tsx`
3. Create components: `components/portal/[feature]/`
4. Add API routes if needed: `app/api/[feature]/`
5. Define Firestore types: `lib/schema.ts`

### Adding a New Marketing Page
1. Create route: `app/(marketing)/[page]/page.tsx`
2. Add navigation link if needed
3. Create components: `components/marketing/[feature].tsx`
4. Add SEO metadata in page

### Adding a New API Endpoint
1. Create route handler: `app/api/[domain]/route.ts`
2. Define Zod schema for validation
3. Implement CRUD operations with Firestore
4. Add proper error handling
5. Document in this file

### Adding a New Data Model
1. Define TypeScript interface in `types/index.ts`
2. Create Firestore document type in `lib/schema.ts`
3. Add collection reference helper
4. Create API routes for CRUD
5. Build UI components

---

## 10. Deployment

### Vercel Configuration
- **Framework**: Next.js (auto-detected)
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Config**: `vercel.json`

### Firebase Deployment
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## 11. Quick Reference

### Common Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

### Key Files to Modify
| Task | Files |
|------|-------|
| Add UI component | `components/ui/` |
| Add portal feature | `app/(portal)/portal/`, `components/portal/` |
| Add marketing page | `app/(marketing)/`, `components/marketing/` |
| Add API endpoint | `app/api/` |
| Add data model | `lib/schema.ts`, `types/index.ts` |
| Modify navigation | `components/portal/portal-sidebar.tsx` |
| Add integration | `lib/[service].ts`, `app/api/[service]/` |

### Styling Classes
```typescript
// Use cn() for conditional classes
import { cn } from "@/lib/utils";

className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-variant"
)}
```

---

## 12. Business Domain Glossary

| Term | Definition |
|------|------------|
| **V+ EDGE** | Core consulting service for supplier qualification |
| **TwinEDGE** | Digital twin implementation service |
| **IntellEDGE** | AI-powered business intelligence |
| **Rock** | 90-day goal (EOS/Traction methodology) |
| **Scorecard** | Weekly metrics tracking (EOS) |
| **IDS** | Identify, Discuss, Solve - issue resolution process |
| **Level 10 Meeting** | Weekly team meeting format (EOS) |
| **GAINS** | Goals, Accomplishments, Interests, Networks, Skills |
| **One-to-One** | Structured networking meeting between affiliates |
| **Affiliate** | Partner in the SVP network |
| **OEM** | Original Equipment Manufacturer (target customer type) |

---

*Last Updated: January 2026*
*Version: 1.0*
