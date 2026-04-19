import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SectionType =
  | "hero"
  | "features"
  | "testimonials"
  | "cta"
  | "pricing"
  | "team"
  | "faq"
  | "contact"
  | "gallery"
  | "stats"
  | "content"
  | "cards"
  | "timeline"
  | "comparison"
  | "video"
  | "newsletter"
  | "footer";

export type TemplateCategory =
  | "minimal"
  | "modern"
  | "classic"
  | "bold"
  | "elegant"
  | "playful"
  | "corporate"
  | "startup";

export interface PageSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  isEditable: boolean;
}

export interface PublicPage {
  id: string;
  path: string;
  name: string;
  description: string;
  sections: PageSection[];
}

export interface SectionDesign {
  sectionId: string;
  sectionType: SectionType;
  headline?: string;
  subheadline?: string;
  content?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  layout?: string;
  customStyles?: Record<string, string>;
  components?: TemplateComponent[];
}

export interface DesignContent {
  sections: SectionDesign[];
  globalStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface PageDesignDoc {
  id: string;
  pageId: string;
  pagePath: string;
  pageName: string;
  currentDesign: DesignContent;
  isPublished: boolean;
  publishedAt: Timestamp | null;
  lastModifiedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DesignHistoryDoc {
  id: string;
  pageId: string;
  designSnapshot: DesignContent;
  changeDescription: string;
  changedBy: string;
  aiPrompt?: string;
  createdAt: Timestamp;
}

export interface TemplateComponent {
  type: string;
  props: Record<string, unknown>;
  children?: TemplateComponent[];
}

export interface TemplateStructure {
  layout: string;
  components: TemplateComponent[];
  defaultStyles: Record<string, string>;
}

export interface LayoutTemplateDoc {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  sectionType: SectionType;
  thumbnail?: string;
  previewHtml?: string;
  structure: TemplateStructure;
  bestPractices: string[];
  tags: string[];
  popularity: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Timestamp;
  appliedChanges?: string[];
}

export interface AIConversationDoc {
  id: string;
  pageId: string;
  messages: AIMessage[];
  status: "active" | "completed" | "archived";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UXReviewCategory {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
  suggestions: string[];
}

export interface UXRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  estimatedImpact: string;
  suggestedFix: string;
  isImplemented: boolean;
}

export interface BrandConsistencyCheck {
  colorConsistency: number;
  typographyConsistency: number;
  imageryConsistency: number;
  toneConsistency: number;
  issues: string[];
}

export interface AccessibilityIssue {
  id: string;
  wcagCriteria: string;
  severity: "error" | "warning" | "info";
  element: string;
  description: string;
  suggestedFix: string;
}

export interface UXReviewDoc {
  id: string;
  pageId: string;
  pagePath: string;
  reviewDate: Timestamp;
  overallScore: number;
  categories: UXReviewCategory[];
  recommendations: UXRecommendation[];
  brandConsistency: BrandConsistencyCheck;
  accessibilityIssues: AccessibilityIssue[];
  status: "pending" | "reviewed" | "implemented" | "dismissed";
  reviewedBy: string;
  createdAt: Timestamp;
}

// ============================================================================
// PUBLIC PAGES REGISTRY - CUSTOMIZE FOR YOUR SITE
// ============================================================================

export const PUBLIC_PAGES: PublicPage[] = [
  {
    id: "home",
    path: "/",
    name: "Home",
    description: "Main landing page with hero, services overview, and CTAs",
    sections: [
      { id: "hero", name: "Hero Section", type: "hero", order: 1, isEditable: true },
      { id: "services", name: "Services Overview", type: "features", order: 2, isEditable: true },
      { id: "about", name: "About Us", type: "content", order: 3, isEditable: true },
      { id: "testimonials", name: "Testimonials", type: "testimonials", order: 4, isEditable: true },
      { id: "cta", name: "Call to Action", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "services",
    path: "/services",
    name: "Services",
    description: "Detailed services and offerings page",
    sections: [
      { id: "hero", name: "Services Hero", type: "hero", order: 1, isEditable: true },
      { id: "service-grid", name: "Service Grid", type: "cards", order: 2, isEditable: true },
      { id: "pricing", name: "Pricing", type: "pricing", order: 3, isEditable: true },
      { id: "faq", name: "FAQ", type: "faq", order: 4, isEditable: true },
      { id: "cta", name: "Get Started", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "about",
    path: "/about",
    name: "About",
    description: "Company information and team page",
    sections: [
      { id: "hero", name: "About Hero", type: "hero", order: 1, isEditable: true },
      { id: "story", name: "Our Story", type: "content", order: 2, isEditable: true },
      { id: "team", name: "Our Team", type: "team", order: 3, isEditable: true },
      { id: "stats", name: "Company Stats", type: "stats", order: 4, isEditable: true },
      { id: "cta", name: "Join Us", type: "cta", order: 5, isEditable: true },
    ],
  },
  {
    id: "contact",
    path: "/contact",
    name: "Contact",
    description: "Contact information and form",
    sections: [
      { id: "hero", name: "Contact Hero", type: "hero", order: 1, isEditable: true },
      { id: "contact-form", name: "Contact Form", type: "contact", order: 2, isEditable: true },
      { id: "faq", name: "FAQ", type: "faq", order: 3, isEditable: true },
    ],
  },
];

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

export const DEFAULT_TEMPLATES: Omit<LayoutTemplateDoc, "id" | "createdAt">[] = [
  {
    name: "Centered Hero",
    description: "Clean, centered hero with headline, subheadline, and CTA button",
    category: "modern",
    sectionType: "hero",
    structure: {
      layout: "centered",
      components: [
        { type: "headline", props: { align: "center", size: "xl" } },
        { type: "subheadline", props: { align: "center", size: "lg" } },
        { type: "cta-button", props: { variant: "primary", size: "lg" } },
      ],
      defaultStyles: {
        padding: "py-24",
        background: "bg-gradient-to-b from-primary/10 to-background",
      },
    },
    bestPractices: [
      "Keep headline under 10 words for maximum impact",
      "Use action-oriented CTA text",
      "Ensure sufficient contrast for readability",
      "Include social proof near the CTA",
    ],
    tags: ["hero", "centered", "clean", "modern"],
    popularity: 95,
    isActive: true,
  },
  {
    name: "Split Hero",
    description: "Two-column hero with content on left and image on right",
    category: "modern",
    sectionType: "hero",
    structure: {
      layout: "split",
      components: [
        { type: "content-column", props: { width: "50%" }, children: [
          { type: "headline", props: { align: "left", size: "xl" } },
          { type: "subheadline", props: { align: "left", size: "md" } },
          { type: "cta-button", props: { variant: "primary" } },
        ]},
        { type: "image-column", props: { width: "50%" } },
      ],
      defaultStyles: {
        padding: "py-16",
        gap: "gap-12",
      },
    },
    bestPractices: [
      "Use high-quality, relevant imagery",
      "Maintain visual hierarchy with typography",
      "Ensure mobile responsiveness",
      "Keep content scannable",
    ],
    tags: ["hero", "split", "image", "two-column"],
    popularity: 88,
    isActive: true,
  },
  {
    name: "Icon Grid Features",
    description: "Grid of features with icons, titles, and descriptions",
    category: "minimal",
    sectionType: "features",
    structure: {
      layout: "grid",
      components: [
        { type: "section-header", props: { align: "center" } },
        { type: "feature-grid", props: { columns: 3, gap: "lg" }, children: [
          { type: "feature-card", props: { hasIcon: true } },
        ]},
      ],
      defaultStyles: {
        padding: "py-20",
        background: "bg-muted/30",
      },
    },
    bestPractices: [
      "Use consistent icon style throughout",
      "Keep descriptions concise (2-3 sentences)",
      "Highlight key benefits, not just features",
      "Use 3-6 features for optimal scanning",
    ],
    tags: ["features", "grid", "icons", "benefits"],
    popularity: 92,
    isActive: true,
  },
  {
    name: "Testimonial Carousel",
    description: "Rotating testimonials with photos and quotes",
    category: "elegant",
    sectionType: "testimonials",
    structure: {
      layout: "carousel",
      components: [
        { type: "section-header", props: { align: "center" } },
        { type: "testimonial-carousel", props: { autoPlay: true, interval: 5000 } },
      ],
      defaultStyles: {
        padding: "py-16",
        background: "bg-primary/5",
      },
    },
    bestPractices: [
      "Include real photos of customers",
      "Add company names and titles for credibility",
      "Keep quotes specific and results-focused",
      "Include star ratings if applicable",
    ],
    tags: ["testimonials", "carousel", "social-proof", "quotes"],
    popularity: 85,
    isActive: true,
  },
  {
    name: "Full-Width CTA Banner",
    description: "Bold call-to-action section with contrasting background",
    category: "bold",
    sectionType: "cta",
    structure: {
      layout: "full-width",
      components: [
        { type: "headline", props: { align: "center", size: "lg" } },
        { type: "subheadline", props: { align: "center", size: "md" } },
        { type: "cta-button-group", props: { align: "center" } },
      ],
      defaultStyles: {
        padding: "py-16",
        background: "bg-primary text-primary-foreground",
      },
    },
    bestPractices: [
      "Use contrasting colors for visibility",
      "Create urgency with time-sensitive language",
      "Offer a secondary CTA for hesitant visitors",
      "Keep the message focused on one action",
    ],
    tags: ["cta", "banner", "conversion", "full-width"],
    popularity: 90,
    isActive: true,
  },
  {
    name: "Three-Tier Pricing",
    description: "Classic pricing table with three plan options",
    category: "corporate",
    sectionType: "pricing",
    structure: {
      layout: "three-column",
      components: [
        { type: "section-header", props: { align: "center" } },
        { type: "pricing-grid", props: { columns: 3, highlightMiddle: true } },
      ],
      defaultStyles: {
        padding: "py-20",
        background: "bg-background",
      },
    },
    bestPractices: [
      "Highlight the recommended plan",
      "Use clear feature comparisons",
      "Include money-back guarantee",
      "Show annual savings if applicable",
    ],
    tags: ["pricing", "plans", "comparison", "tiers"],
    popularity: 87,
    isActive: true,
  },
  {
    name: "Accordion FAQ",
    description: "Expandable FAQ section with smooth animations",
    category: "minimal",
    sectionType: "faq",
    structure: {
      layout: "single-column",
      components: [
        { type: "section-header", props: { align: "center" } },
        { type: "faq-accordion", props: { allowMultiple: false } },
      ],
      defaultStyles: {
        padding: "py-16",
        maxWidth: "max-w-3xl mx-auto",
      },
    },
    bestPractices: [
      "Order questions by frequency asked",
      "Keep answers concise but complete",
      "Link to detailed resources when needed",
      "Include contact option for unanswered questions",
    ],
    tags: ["faq", "accordion", "questions", "support"],
    popularity: 82,
    isActive: true,
  },
  {
    name: "Team Grid",
    description: "Team member cards with photos and social links",
    category: "modern",
    sectionType: "team",
    structure: {
      layout: "grid",
      components: [
        { type: "section-header", props: { align: "center" } },
        { type: "team-grid", props: { columns: 4, showSocial: true } },
      ],
      defaultStyles: {
        padding: "py-20",
        background: "bg-muted/20",
      },
    },
    bestPractices: [
      "Use professional, consistent photos",
      "Include relevant social links",
      "Keep bios brief and personality-driven",
      "Show diversity and expertise",
    ],
    tags: ["team", "people", "about", "grid"],
    popularity: 78,
    isActive: true,
  },
  {
    name: "Stats Counter",
    description: "Animated statistics with large numbers and labels",
    category: "bold",
    sectionType: "stats",
    structure: {
      layout: "four-column",
      components: [
        { type: "stat-counter", props: { animated: true, duration: 2000 } },
      ],
      defaultStyles: {
        padding: "py-12",
        background: "bg-primary text-primary-foreground",
      },
    },
    bestPractices: [
      "Use impressive but honest numbers",
      "Include context for the statistics",
      "Animate on scroll for engagement",
      "Limit to 3-5 key metrics",
    ],
    tags: ["stats", "numbers", "metrics", "animated"],
    popularity: 80,
    isActive: true,
  },
  {
    name: "Contact Form",
    description: "Clean contact form with validation and success states",
    category: "minimal",
    sectionType: "contact",
    structure: {
      layout: "split",
      components: [
        { type: "contact-info", props: { showMap: false } },
        { type: "contact-form", props: { fields: ["name", "email", "message"] } },
      ],
      defaultStyles: {
        padding: "py-16",
        background: "bg-background",
      },
    },
    bestPractices: [
      "Keep form fields to a minimum",
      "Show clear validation messages",
      "Include alternative contact methods",
      "Set expectations for response time",
    ],
    tags: ["contact", "form", "support", "communication"],
    popularity: 84,
    isActive: true,
  },
];

// ============================================================================
// FIREBASE OPERATIONS
// ============================================================================

const COLLECTIONS = {
  PAGE_DESIGNS: "page_designs",
  DESIGN_HISTORY: "page_design_history",
  LAYOUT_TEMPLATES: "page_layout_templates",
  AI_CONVERSATIONS: "page_ai_conversations",
  UX_REVIEWS: "page_ux_reviews",
};

// Page Design Operations
export async function getPageDesign(pageId: string): Promise<PageDesignDoc | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, COLLECTIONS.PAGE_DESIGNS, pageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PageDesignDoc;
    }
    return null;
  } catch (error) {
    console.error("Error fetching page design:", error);
    return null;
  }
}

export async function savePageDesign(
  pageId: string,
  design: DesignContent,
  userId: string,
  description: string,
  aiPrompt?: string
): Promise<boolean> {
  if (!db) return false;
  try {
    const page = PUBLIC_PAGES.find((p) => p.id === pageId);
    if (!page) return false;

    const now = Timestamp.now();
    const designDoc: Omit<PageDesignDoc, "id"> = {
      pageId,
      pagePath: page.path,
      pageName: page.name,
      currentDesign: design,
      isPublished: false,
      publishedAt: null,
      lastModifiedBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    // Save current design
    await setDoc(doc(db, COLLECTIONS.PAGE_DESIGNS, pageId), designDoc);

    // Save to history
    const historyDoc: Omit<DesignHistoryDoc, "id"> = {
      pageId,
      designSnapshot: design,
      changeDescription: description,
      changedBy: userId,
      aiPrompt,
      createdAt: now,
    };
    await addDoc(collection(db, COLLECTIONS.DESIGN_HISTORY), historyDoc);

    return true;
  } catch (error) {
    console.error("Error saving page design:", error);
    return false;
  }
}

export async function publishPageDesign(pageId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.PAGE_DESIGNS, pageId);
    await updateDoc(docRef, {
      isPublished: true,
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error publishing page design:", error);
    return false;
  }
}

export async function getDesignHistory(
  pageId: string,
  limitCount: number = 10
): Promise<DesignHistoryDoc[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.DESIGN_HISTORY),
      where("pageId", "==", pageId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DesignHistoryDoc));
  } catch (error) {
    console.error("Error fetching design history:", error);
    return [];
  }
}

// Template Operations
export async function getLayoutTemplates(
  sectionType?: SectionType
): Promise<LayoutTemplateDoc[]> {
  if (!db) return [];
  try {
    let q;
    if (sectionType) {
      q = query(
        collection(db, COLLECTIONS.LAYOUT_TEMPLATES),
        where("sectionType", "==", sectionType),
        where("isActive", "==", true)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.LAYOUT_TEMPLATES),
        where("isActive", "==", true)
      );
    }
    const snapshot = await getDocs(q);
    const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LayoutTemplateDoc));
    // Sort by popularity in JS to avoid composite index
    return templates.sort((a, b) => b.popularity - a.popularity);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [];
  }
}

export async function seedDefaultTemplates(): Promise<boolean> {
  if (!db) return false;
  try {
    const now = Timestamp.now();
    for (const template of DEFAULT_TEMPLATES) {
      const templateDoc = {
        ...template,
        createdAt: now,
      };
      await addDoc(collection(db, COLLECTIONS.LAYOUT_TEMPLATES), templateDoc);
    }
    return true;
  } catch (error) {
    console.error("Error seeding templates:", error);
    return false;
  }
}

// AI Conversation Operations
export async function getAIConversation(pageId: string): Promise<AIConversationDoc | null> {
  if (!db) return null;
  try {
    const q = query(
      collection(db, COLLECTIONS.AI_CONVERSATIONS),
      where("pageId", "==", pageId),
      where("status", "==", "active"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AIConversationDoc;
    }
    return null;
  } catch (error) {
    console.error("Error fetching AI conversation:", error);
    return null;
  }
}

export async function createAIConversation(pageId: string): Promise<string | null> {
  if (!db) return null;
  try {
    const now = Timestamp.now();
    const conversationDoc: Omit<AIConversationDoc, "id"> = {
      pageId,
      messages: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.AI_CONVERSATIONS), conversationDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error creating AI conversation:", error);
    return null;
  }
}

export async function addAIMessage(
  conversationId: string,
  message: Omit<AIMessage, "id" | "timestamp">
): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.AI_CONVERSATIONS, conversationId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;

    const conversation = docSnap.data() as AIConversationDoc;
    const newMessage: AIMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: Timestamp.now(),
    };

    await updateDoc(docRef, {
      messages: [...conversation.messages, newMessage],
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error adding AI message:", error);
    return false;
  }
}

// UX Review Operations
export async function createUXReview(
  pageId: string,
  pagePath: string,
  reviewData: Omit<UXReviewDoc, "id" | "pageId" | "pagePath" | "createdAt">
): Promise<string | null> {
  if (!db) return null;
  try {
    const reviewDoc = {
      ...reviewData,
      pageId,
      pagePath,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.UX_REVIEWS), reviewDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error creating UX review:", error);
    return null;
  }
}

export async function getLatestUXReview(pageId: string): Promise<UXReviewDoc | null> {
  if (!db) return null;
  try {
    const q = query(
      collection(db, COLLECTIONS.UX_REVIEWS),
      where("pageId", "==", pageId),
      limit(10)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    // Sort by createdAt in JS to avoid composite index requirement
    const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UXReviewDoc));
    reviews.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    return reviews[0];
  } catch (error) {
    console.error("Error fetching UX review:", error);
    return null;
  }
}

export async function updateRecommendationStatus(
  reviewId: string,
  recommendationId: string,
  isImplemented: boolean
): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, COLLECTIONS.UX_REVIEWS, reviewId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;

    const review = docSnap.data() as UXReviewDoc;
    const updatedRecommendations = review.recommendations.map((rec) =>
      rec.id === recommendationId ? { ...rec, isImplemented } : rec
    );

    await updateDoc(docRef, { recommendations: updatedRecommendations });
    return true;
  } catch (error) {
    console.error("Error updating recommendation status:", error);
    return false;
  }
}
