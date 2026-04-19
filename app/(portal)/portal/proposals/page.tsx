"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Sparkles,
  Building,
  Calendar,
  DollarSign,
  Users,
  Target,
  ClipboardList,
  BarChart3,
  FileSignature,
  Download,
  Eye,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Search,
  Presentation,
  Globe,
  Link as LinkIcon,
  FileUp,
  Lightbulb,
  FolderOpen,
  Settings,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  type Proposal,
  type CollaboratingEntity,
  type DataCollectionMethod,
  type ProjectMilestone,
  type FormTemplate,
  type DashboardMetric,
  type DocumentAnalysisResult,
  type ProposalDeliverable,
  type ReportingRequirement,
  type ProposalSection,
  type ResearchWebsite,
  type ResearchDocument,
  type Slide,
  type AffiliateRecommendation,
  type DocumentTemplate,
  type TemplateType,
  PROPOSAL_TYPES,
  ENTITY_ROLES,
  COLLECTION_FREQUENCIES,
  MILESTONE_STATUSES,
  FORM_PURPOSES,
  FUNDING_SOURCES,
  FIELD_TYPES,
} from "@/lib/types/proposal";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, setDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { toast } from "sonner";

const WIZARD_STEPS = [
  { id: 1, title: "Basic Info", icon: FileText, description: "Document upload & basic details" },
  { id: 2, title: "Entities", icon: Building, description: "Collaborating organizations" },
  { id: 3, title: "Data Collection", icon: ClipboardList, description: "Data collection methods" },
  { id: 4, title: "Milestones", icon: Target, description: "Project timeline" },
  { id: 5, title: "Review", icon: Eye, description: "Review & analysis" },
  { id: 6, title: "Forms", icon: FileText, description: "Form generator" },
  { id: 7, title: "Dashboard", icon: BarChart3, description: "AI dashboard config" },
  { id: 8, title: "Export", icon: FileSignature, description: "Export & signature" },
];

// OEM Supplier Readiness specific wizard steps
const OEM_WIZARD_STEPS = [
  { id: 1, title: "Basic Info", icon: FileText, description: "Supplier & OEM selection" },
  { id: 2, title: "Deep Research", icon: Search, description: "Company research & analysis" },
  { id: 3, title: "Entities", icon: Building, description: "Collaborating organizations" },
  { id: 4, title: "Milestones", icon: Target, description: "Project timeline" },
  { id: 5, title: "Review", icon: Eye, description: "Review & analysis" },
  { id: 6, title: "Affiliates", icon: Users, description: "Affiliate recommendations" },
  { id: 7, title: "Presentation", icon: Presentation, description: "Slide deck generator" },
  { id: 8, title: "Export", icon: FileSignature, description: "Export & project creation" },
];

// NDA specific wizard steps (simplified - no funding, milestones, forms, dashboard)
const NDA_WIZARD_STEPS = [
  { id: 1, title: "NDA Details", icon: Shield, description: "Agreement information" },
  { id: 2, title: "Parties", icon: Users, description: "Signing parties" },
  { id: 3, title: "Sign & Send", icon: FileSignature, description: "Send for signature" },
];

// RFI/RFP Response wizard steps (no Forms, Dashboard, Export)
const RFI_RFP_WIZARD_STEPS = [
  { id: 1, title: "Basic Info", icon: FileText, description: "Document upload & basic details" },
  { id: 2, title: "Entities", icon: Building, description: "Collaborating organizations" },
  { id: 3, title: "Data Collection", icon: ClipboardList, description: "Data collection methods" },
  { id: 4, title: "Milestones", icon: Target, description: "Project timeline" },
  { id: 5, title: "Review", icon: Eye, description: "Review & finalize" },
];

// Contract wizard steps (no Forms, Dashboard, Export)
const CONTRACT_WIZARD_STEPS = [
  { id: 1, title: "Contract Details", icon: FileText, description: "Contract information & template" },
  { id: 2, title: "Parties", icon: Users, description: "Contract parties" },
  { id: 3, title: "Terms", icon: ClipboardList, description: "Contract terms & conditions" },
  { id: 4, title: "Review", icon: Eye, description: "Review & finalize" },
  { id: 5, title: "Sign & Send", icon: FileSignature, description: "Send for signature" },
];

// Agreement wizard steps (White Label Agreement specific - streamlined)
const AGREEMENT_WIZARD_STEPS = [
  { id: 1, title: "Client Details", icon: Building, description: "Client company information" },
  { id: 2, title: "Service Terms", icon: ClipboardList, description: "Service description & hosting fee" },
  { id: 3, title: "Payment Setup", icon: DollarSign, description: "Stripe recurring billing setup" },
  { id: 4, title: "Review & Send", icon: FileSignature, description: "Review and send for signature" },
];

// MOU wizard steps (no Forms, Dashboard, Export)
const MOU_WIZARD_STEPS = [
  { id: 1, title: "MOU Details", icon: FileText, description: "MOU information & template" },
  { id: 2, title: "Parties", icon: Users, description: "MOU parties" },
  { id: 3, title: "Understanding", icon: ClipboardList, description: "Terms of understanding" },
  { id: 4, title: "Review", icon: Eye, description: "Review & finalize" },
  { id: 5, title: "Sign & Send", icon: FileSignature, description: "Send for signature" },
];

// Mock list of OEMs with agreements
const OEM_AGREEMENTS = [
  { id: "oem-1", name: "Toyota Battery Manufacturing NC (TBMNC)", location: "Liberty, NC" },
  { id: "oem-2", name: "BMW Manufacturing", location: "Spartanburg, SC" },
  { id: "oem-3", name: "Mercedes-Benz Vans", location: "Charleston, SC" },
  { id: "oem-4", name: "Volvo Cars", location: "Ridgeville, SC" },
  { id: "oem-5", name: "Honda Manufacturing", location: "Lincoln, AL" },
];

const emptyProposal: Partial<Proposal> = {
  name: "",
  description: "",
  type: "grant",
  startDate: "",
  endDate: "",
  fundingSource: "",
  referenceNumber: "",
  totalBudget: 0,
  status: "draft",
  collaboratingEntities: [],
  dataCollectionMethods: [],
  projectMilestones: [],
  analysisRecommendations: [],
  formTemplates: [],
  datasets: [],
  dashboardMetrics: [],
  documents: [],
  entityRelationshipNotes: "",
};

export default function ProposalsPage() {
  const { profile, getDisplayName } = useUserProfile();
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalData, setProposalData] = useState<Partial<Proposal>>(emptyProposal);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [enhancingFieldId, setEnhancingFieldId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // OEM Supplier Readiness specific state
  const [researchWebsites, setResearchWebsites] = useState<ResearchWebsite[]>([]);
  const [researchDocuments, setResearchDocuments] = useState<ResearchDocument[]>([]);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [isRunningDeepResearch, setIsRunningDeepResearch] = useState(false);
  const [deepResearchProgress, setDeepResearchProgress] = useState(0);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [affiliateRecommendations, setAffiliateRecommendations] = useState<AffiliateRecommendation[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // NDA specific state
  const [ndaSignerEmail, setNdaSignerEmail] = useState("");
  const [ndaSignerName, setNdaSignerName] = useState("");
  const [ndaSignerCompany, setNdaSignerCompany] = useState("");
  const [ndaSignerPhone, setNdaSignerPhone] = useState("");
  const [ndaSignerAddress, setNdaSignerAddress] = useState("");
  const [ndaSignerCity, setNdaSignerCity] = useState("");
  const [ndaSignerState, setNdaSignerState] = useState("");
  const [ndaSignerZip, setNdaSignerZip] = useState("");
  const [ndaSignerTitle, setNdaSignerTitle] = useState("");
  const [isSendingNda, setIsSendingNda] = useState(false);
  const [ndaStatus, setNdaStatus] = useState<"draft" | "sent" | "signed" | "countersigned" | "completed">("draft");
  const [ndaTemplateFields, setNdaTemplateFields] = useState<Record<string, string>>({});
  const [ndaSignatureMode, setNdaSignatureMode] = useState<"type" | "draw">("type");
  const [ndaTypedSignature, setNdaTypedSignature] = useState("");
  const [selfServeMode, setSelfServeMode] = useState(false);
  
  // Proposal action state
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null);
  const [isDeletingProposal, setIsDeletingProposal] = useState(false);

  const deleteProposal = async (proposal: Proposal) => {
    if (!db) return;
    setIsDeletingProposal(true);
    try {
      await deleteDoc(doc(db, COLLECTIONS.PROPOSALS, proposal.id));
      setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
      toast.success(`"${proposal.name}" deleted successfully`);
    } catch (error) {
      console.error("Failed to delete proposal:", error);
      toast.error("Failed to delete proposal");
    } finally {
      setIsDeletingProposal(false);
      setDeletingProposalId(null);
    }
  };

  // Template management state
  const [activeTab, setActiveTab] = useState<"proposals" | "templates">("proposals");
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType>("nda");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  
  // Document metadata state (aligned with Documents page)
  const [documentMetadata, setDocumentMetadata] = useState({
    category: "Proposal",
    description: "",
    version: "1.0",
    folder: "Proposals",
  });

  // Document categories and folders (aligned with Documents page)
  const DOCUMENT_CATEGORIES = [
    "Proposal",
    "Contract",
    "Agreement",
    "Template",
    "Report",
    "Presentation",
    "Training Material",
    "Policy",
    "Procedure",
    "RFI Response",
    "RFP Response",
    "MOU",
    "NDA",
    "Other",
  ];

  const DOCUMENT_FOLDERS = [
    "Proposals",
    "Contracts",
    "Templates",
    "Reports",
    "Training",
    "Policies",
    "Marketing",
    "Projects",
    "RFI-RFP",
    "Agreements",
    "Uncategorized",
  ];

  // Get the appropriate wizard steps based on proposal type
  const getWizardStepsForType = (type: string) => {
    switch (type) {
      case "oem_supplier_readiness":
        return OEM_WIZARD_STEPS;
      case "nda":
        return NDA_WIZARD_STEPS;
      case "rfi_response":
      case "rfp_response":
        return RFI_RFP_WIZARD_STEPS;
      case "contract":
        return CONTRACT_WIZARD_STEPS;
      case "agreement":
        return AGREEMENT_WIZARD_STEPS;
      case "mou":
        return MOU_WIZARD_STEPS;
      default:
        return WIZARD_STEPS;
    }
  };
  const activeWizardSteps = getWizardStepsForType(proposalData.type || "grant");

  // Load proposals from Firestore on mount
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      if (!db) {
        setIsLoadingProposals(false);
        return;
      }
      try {
        const proposalsRef = collection(db, COLLECTIONS.PROPOSALS);
        const proposalsQuery = query(proposalsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(proposalsQuery);
        const loaded: Proposal[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
            submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : data.submittedAt ? new Date(data.submittedAt) : undefined,
            signedAt: data.signedAt instanceof Timestamp ? data.signedAt.toDate() : data.signedAt ? new Date(data.signedAt) : undefined,
          } as Proposal;
        });
        setProposals(loaded);
      } catch (error) {
        console.error("Failed to load proposals:", error);
        toast.error("Failed to load proposals from database");
      } finally {
        setIsLoadingProposals(false);
      }
    }
    fetchProposals();
  }, []);

  // Initialize default templates on mount
  useEffect(() => {
    const whiteLabelTemplate: DocumentTemplate = {
      id: "template-white-label-agreement",
      name: "White Label Platform Service Agreement",
      type: "agreement",
      description: "Standard SVP White Label Agreement template with dynamic fields for client info, service terms, and payment",
      fileName: "white-label-agreement.md",
      fileSize: 8500,
      fileType: "text/markdown",
      uploadedAt: new Date().toISOString(),
      uploadedBy: "system",
      version: "1.0",
      isActive: true,
      tags: ["white-label", "service-agreement", "svp-standard"],
      content: `# White Label Platform Service Agreement

This Service Agreement is made between:

**Strategic Value Plus (SVP) (Service Provider)**: a LLC, a company registered in Dover, DE, with its principal place of business at 8 The Green #13351 Dover, DE 19901.

**Client**: {{client_name}}, a company registered in {{client_state}}, with its principal place of business at {{client_address}}, {{client_city}}, {{client_state}}, {{client_zip}}.

("SVP" and "Client" are hereinafter referred to individually as "Party" and collectively as "Parties").

## 2. BACKGROUND

SVP provides specialized {{service_description}} expertise. Client requires dedicated development and maintenance for its {{application_description}}. The Parties wish to formalize their exclusive partnership for this purpose.

## 3. SCOPE OF WORK & EXCLUSIVITY

**Exclusive Engagement**: Client engages SVP exclusively for the development, maintenance, modification, and operation of the application/technology described herein ("Application").

**No Third Parties**: During the term of this Agreement, Client shall not engage any other third party for work related to the Application, except as otherwise agreed in writing by SVP. Client acknowledges that SVP is the sole source developer for the Application.

**Client Responsibility**: Client shall not attempt to circumvent, modify, or bypass SVP's development or maintenance processes for the Application. Client shall only request development work through the agreed channels with SVP.

## 4. DURATION

This Agreement shall commence on {{start_date}} and continue on a {{billing_period}} basis, renewable by mutual written agreement unless either party provides notice of termination as per Section 7.

## 5. FEES & PAYMENT

**Monthly Fee**: Client agrees to pay SVP a monthly fee of {{monthly_fee}} USD (or equivalent currency) ("Monthly Fee").

**Payment Method**: The Monthly Fee shall be paid automatically via credit card on the first (1st) day of each month commencing from {{start_date}}.

**Client Responsibility**: Client is solely responsible for providing a valid and active credit card designated for recurring billing to SVP. {{client_name}} warrants that the card details provided are accurate and remain valid. Client is responsible for monitoring and managing its credit card account to ensure uninterrupted payment processing.

**Fee Adjustments**: SVP reserves the right to provide Client with {{fee_adjustment_notice_days}} days prior written notice of any potential adjustments to the Monthly Fee, based on changes to the agreed Scope of Work or other mutual agreements. Any adjustment shall be subject to Client's written approval.

**Late Payments**: Any payment not received within {{late_payment_grace_days}} business days of the due date may result in service suspension and may be subject to late fees, as determined by SVP.

## 6. IP OWNERSHIP

Upon full payment (or partial payment where specific deliverables are agreed upon separately), SVP shall transfer exclusive ownership of all work product, code, modifications, configurations, and documentation created by SVP specifically for Client under this Agreement to Client. Client shall own all rights, title, and interest in and to these deliverables. SVP retains the right to use its own name and logo for marketing purposes related to this engagement.

## 7. TERM AND TERMINATION

**Term**: This Agreement shall commence on the Effective Date and continue on a {{billing_period}} basis, renewable by mutual written agreement.

**Termination for Cause**: Either Party may terminate this Agreement immediately upon written notice if the other Party materially breaches any provision and fails to cure such breach within {{termination_cure_days}} days of receiving notice of the breach.

**Termination by Client**: Client may terminate this Agreement for any reason by providing {{client_termination_notice_days}} days prior written notice to SVP.

**Termination by SVP**: SVP may terminate this Agreement for any reason by providing {{svp_termination_notice_days}} days prior written notice to Client.

**Effect of Termination**: Upon termination, Client shall cease using the Application developed by SVP and shall not circumvent SVP's maintenance or access. Any outstanding fees shall be paid immediately. SVP shall provide Client with a final deliverable or access to all IP transferred under this Agreement within {{termination_deliverable_days}} business days of termination. SVP shall continue to provide support for any pre-existing bugs or issues discovered within {{post_termination_support_days}} days after termination, unless otherwise agreed.

## 8. CONFIDENTIALITY

Both Parties agree to keep confidential all non-public information received from the other Party related to this Agreement or the Application. This obligation survives the termination of this Agreement for a period of {{confidentiality_duration_years}} years.

## 9. WARRANTIES

**SVP Warranties**: SVP warrants that it has the right and authority to perform the services under this Agreement and that it will not infringe upon the intellectual property rights of any third party in providing such services.

**Client Warranties**: Client warrants that it has the right to engage SVP and that it will not use the Application for illegal purposes.

## 10. LIMITATION OF LIABILITY

IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR RELATED TO THIS AGREEMENT, EVEN IF ADVISED OF THE POSSIBILITY THEREOF.

## 11. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State/Jurisdiction of Delaware, without regard to its conflict of laws principles.

## 12. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between the Parties concerning the subject matter hereof and supersedes all prior discussions, negotiations, and agreements, whether oral or written.

## 13. AMENDMENTS

This Agreement may only be amended or modified by a written document signed by both Parties.

## 14. SEVERABILITY

If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

## 15. MISCELLANEOUS

**Notices**: All notices required or permitted under this Agreement shall be in writing and shall be deemed given when delivered or sent by registered mail or email to the addresses provided at the beginning of this Agreement.

**Assignment**: Neither Party may assign its rights or obligations under this Agreement without the prior written consent of the other Party.

**Relationship of the Parties**: The Parties are independent contractors. Nothing in this Agreement shall be construed as creating a partnership, joint venture, agency, or employment relationship between the Parties.

**Force Majeure**: Neither Party shall be liable for any failure or delay in performance under this Agreement due to causes beyond its reasonable control, including acts of God, war, terrorism, riots, accidents, pandemics, government actions, or strikes.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.`,
      placeholders: [
        "client_name",
        "client_state",
        "client_address",
        "client_city",
        "client_zip",
        "service_description",
        "application_description",
        "start_date",
        "billing_period",
        "monthly_fee",
        "fee_adjustment_notice_days",
        "late_payment_grace_days",
        "termination_cure_days",
        "client_termination_notice_days",
        "svp_termination_notice_days",
        "termination_deliverable_days",
        "post_termination_support_days",
        "confidentiality_duration_years",
      ],
    };

    setDocumentTemplates((prev) => {
      // Only add if not already present
      const exists = prev.find((t) => t.id === whiteLabelTemplate.id);
      if (exists) return prev;
      return [...prev, whiteLabelTemplate];
    });
  }, []);

  /** Persist a proposal object to Firestore */
  const persistProposalToFirestore = async (proposal: Proposal): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    const proposalRef = doc(db, COLLECTIONS.PROPOSALS, proposal.id);
    // Convert Date objects to Timestamps for Firestore
    const firestoreData: Record<string, unknown> = {
      ...proposal,
      createdAt: proposal.createdAt instanceof Date ? Timestamp.fromDate(proposal.createdAt) : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    if (proposal.submittedAt instanceof Date) {
      firestoreData.submittedAt = Timestamp.fromDate(proposal.submittedAt);
    }
    if (proposal.signedAt instanceof Date) {
      firestoreData.signedAt = Timestamp.fromDate(proposal.signedAt);
    }
    // Remove undefined fields (Firestore doesn't allow undefined values)
    Object.keys(firestoreData).forEach(key => {
      if (firestoreData[key] === undefined) {
        delete firestoreData[key];
      }
    });
    await setDoc(proposalRef, firestoreData, { merge: true });
  };

  // Extract placeholders from template content (finds {{placeholder_name}} patterns)
  const extractPlaceholders = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  // Get all placeholders from selected template
  const getTemplatePlaceholders = (): string[] => {
    if (!selectedTemplate) return [];
    
    // If template has pre-extracted placeholders, use them
    if (selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0) {
      return selectedTemplate.placeholders;
    }
    
    // If template has content, scan for placeholders
    if (selectedTemplate.content) {
      return extractPlaceholders(selectedTemplate.content);
    }
    
    // Default common NDA placeholders if no content available
    return [
      "effective_date",
      "disclosing_party_name",
      "disclosing_party_company",
      "receiving_party_name",
      "receiving_party_company",
      "term_years",
      "survival_years",
      "governing_state",
    ];
  };

  // Format placeholder key to label
  const formatPlaceholderLabel = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Update template field value
  const updateTemplateField = (key: string, value: string) => {
    setNdaTemplateFields((prev) => ({ ...prev, [key]: value }));
  };

  // AI Enhance Description
  const enhanceDescription = async () => {
    if (!proposalData.name && !proposalData.description) {
      alert("Please enter a proposal name or description first");
      return;
    }
    setIsEnhancingDescription(true);
    try {
      const response = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: proposalData.description || "",
          context: {
            type: "proposal_description",
            proposalName: proposalData.name,
            proposalType: proposalData.type,
            fundingSource: proposalData.fundingSource,
            budget: proposalData.totalBudget,
          },
          prompt: `Create a professional, compelling proposal description for "${proposalData.name || 'this proposal'}". 
The proposal type is ${proposalData.type || 'grant'}${proposalData.fundingSource ? ` with funding from ${proposalData.fundingSource}` : ''}.
${proposalData.description ? `Current description to enhance: ${proposalData.description}` : 'Generate a new description from scratch.'}
Make it clear, professional, and highlight the value proposition and expected outcomes.`,
        }),
      });
      const result = await response.json();
      if (result.success && result.enhancedText) {
        setProposalData({ ...proposalData, description: result.enhancedText });
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
    } finally {
      setIsEnhancingDescription(false);
    }
  };

  // AI Generate Milestones
  const generateMilestones = async () => {
    if (!proposalData.name) {
      alert("Please enter a proposal name first");
      return;
    }
    setIsGeneratingMilestones(true);
    try {
      const response = await fetch("/api/ai/generate-milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalName: proposalData.name,
          proposalType: proposalData.type,
          description: proposalData.description,
          startDate: proposalData.startDate,
          endDate: proposalData.endDate,
          existingMilestones: proposalData.projectMilestones,
        }),
      });
      const result = await response.json();
      if (result.success && result.milestones) {
        const newMilestones = result.milestones.map((m: any, i: number) => ({
          id: `milestone-ai-${Date.now()}-${i}`,
          name: m.name,
          description: m.description,
          dueDate: m.dueDate || "",
          status: "not_started",
          responsibleParties: m.responsibleParties || [],
          dependencies: m.dependencies || [],
        }));
        setProposalData({
          ...proposalData,
          projectMilestones: [...(proposalData.projectMilestones || []), ...newMilestones],
        });
      }
    } catch (error) {
      console.error("Error generating milestones:", error);
    } finally {
      setIsGeneratingMilestones(false);
    }
  };

  // AI Enhance Field Description (generic for any description field)
  const enhanceFieldDescription = async (
    fieldId: string,
    currentText: string,
    fieldType: 'entity' | 'method' | 'milestone',
    context: { name?: string; role?: string; frequency?: string }
  ) => {
    if (!currentText && !context.name) {
      alert("Please enter some text or a name first");
      return;
    }
    setEnhancingFieldId(fieldId);
    try {
      const prompts = {
        entity: `Enhance this organization description/responsibilities for a proposal. Organization: "${context.name || 'Unknown'}", Role: "${context.role || 'partner'}". Current text: "${currentText || 'No description yet'}". Create a professional, clear description of their responsibilities and contributions.`,
        method: `Enhance this data collection method description. Method: "${context.name || 'Unknown'}", Frequency: "${context.frequency || 'monthly'}". Current text: "${currentText || 'No description yet'}". Create a clear, professional description of how data will be collected.`,
        milestone: `Enhance this project milestone description. Milestone: "${context.name || 'Unknown'}". Current text: "${currentText || 'No description yet'}". Create a clear, actionable milestone description with expected deliverables.`,
      };
      const response = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentText || "",
          context: { type: `${fieldType}_description`, ...context },
          prompt: prompts[fieldType],
        }),
      });
      const result = await response.json();
      if (result.success && result.enhancedText) {
        return result.enhancedText;
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
    } finally {
      setEnhancingFieldId(null);
    }
    return null;
  };

  // AI Generate Budget
  const generateBudget = async () => {
    if (!proposalData.name) {
      alert("Please enter a proposal name first");
      return;
    }
    setIsGeneratingBudget(true);
    try {
      const response = await fetch("/api/ai/generate-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalName: proposalData.name,
          proposalType: proposalData.type,
          description: proposalData.description,
          startDate: proposalData.startDate,
          endDate: proposalData.endDate,
          milestones: proposalData.projectMilestones,
          entities: proposalData.collaboratingEntities,
        }),
      });
      const result = await response.json();
      if (result.success && result.totalBudget) {
        setProposalData({ ...proposalData, totalBudget: result.totalBudget });
      }
    } catch (error) {
      console.error("Error generating budget:", error);
    } finally {
      setIsGeneratingBudget(false);
    }
  };

  // File upload handler
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "auto");

      const response = await fetch("/api/ai/analyze-document", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result);
        // Auto-populate proposal data from analysis
        setProposalData((prev) => ({
          ...prev,
          name: result.data.title || prev.name,
          description: result.data.description || prev.description,
          type: result.detectedType || prev.type,
          startDate: result.data.startDate || prev.startDate,
          endDate: result.data.endDate || prev.endDate,
          fundingSource: result.data.fundingSource || prev.fundingSource,
          referenceNumber: result.data.referenceNumber || prev.referenceNumber,
          totalBudget: result.data.totalBudget || prev.totalBudget,
          collaboratingEntities: result.data.entities?.map((e: any, i: number) => ({
            id: `entity-${i}`,
            name: e.name,
            role: e.role,
            description: e.responsibilities,
            contactName: e.contactInfo?.split(",")[0] || "",
            contactEmail: e.contactInfo?.split(",")[1]?.trim() || "",
            responsibilities: [e.responsibilities],
          })) || prev.collaboratingEntities,
          dataCollectionMethods: result.data.dataCollectionMethods?.map((m: any, i: number) => ({
            id: `method-${i}`,
            name: m.name,
            description: m.description,
            frequency: m.frequency,
            responsibleEntity: m.responsibleEntity,
            dataPoints: m.dataPoints || [],
            tools: m.tools ? [m.tools] : [],
          })) || prev.dataCollectionMethods,
          projectMilestones: result.data.milestones?.map((m: any, i: number) => ({
            id: `milestone-${i}`,
            name: m.name,
            description: m.description,
            dueDate: m.dueDate,
            status: "not_started",
            responsibleParties: m.responsibleParties || [],
            dependencies: m.dependencies || [],
          })) || prev.projectMilestones,
          formTemplates: result.data.forms?.map((f: any, i: number) => ({
            id: `form-${i}`,
            name: f.name,
            description: f.description,
            purpose: f.category,
            sections: [{ id: `section-${i}`, title: "Main", fields: f.fields || [] }],
            entityResponsible: f.linkedDataCollectionMethod,
          })) || prev.formTemplates,
          dashboardMetrics: result.data.dashboard?.metrics || prev.dashboardMetrics,
        }));
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const nextStep = () => {
    const maxStep = activeWizardSteps.length;
    setCurrentStep((prev) => Math.min(prev + 1, maxStep));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const saveProposal = async () => {
    try {
      if (editingProposalId) {
        // Update existing proposal
        const updatedProposal = {
          ...proposalData,
          id: editingProposalId,
          updatedAt: new Date(),
        } as Proposal;
        // Find existing to preserve createdAt
        const existing = proposals.find((p) => p.id === editingProposalId);
        if (existing) {
          updatedProposal.createdAt = existing.createdAt;
        }
        await persistProposalToFirestore(updatedProposal);
        setProposals((prev) =>
          prev.map((p) =>
            p.id === editingProposalId
              ? { ...p, ...proposalData, createdAt: existing?.createdAt || p.createdAt, updatedAt: new Date() } as Proposal
              : p
          )
        );
        toast.success("Proposal updated successfully");
      } else {
        // Create new proposal
        const newProposal: Proposal = {
          ...emptyProposal,
          ...proposalData,
          id: `proposal-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Proposal;
        await persistProposalToFirestore(newProposal);
        setProposals((prev) => [newProposal, ...prev]);
        toast.success("Proposal saved to database");
      }
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Failed to save proposal to database");
    }
    setShowWizard(false);
    setCurrentStep(1);
    setProposalData(emptyProposal);
    setAnalysisResult(null);
    setUploadedFile(null);
    setEditingProposalId(null);
  };

  // Submit proposal for consideration (marks as submitted with timestamp)
  const submitProposal = async () => {
    if (!proposalData.name) {
      alert("Please enter a proposal name first");
      return;
    }
    setIsSubmitting(true);
    try {
      const submittedProposal: Proposal = {
        ...emptyProposal,
        ...proposalData,
        id: editingProposalId || `proposal-${Date.now()}`,
        status: "pending_signature",
        submittedAt: new Date(),
        submittedBy: profile.id,
        submittedByName: getDisplayName(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Proposal;
      
      await persistProposalToFirestore(submittedProposal);

      if (editingProposalId) {
        setProposals((prev) =>
          prev.map((p) => (p.id === editingProposalId ? submittedProposal : p))
        );
      } else {
        setProposals((prev) => [submittedProposal, ...prev]);
      }
      toast.success(`Proposal "${proposalData.name}" submitted successfully`);
      
      setShowWizard(false);
      setCurrentStep(1);
      setProposalData(emptyProposal);
      setAnalysisResult(null);
      setUploadedFile(null);
      setEditingProposalId(null);
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Failed to submit proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create project from proposal
  const createProjectFromProposal = async () => {
    if (!proposalData.name) {
      alert("Please enter a proposal name first");
      return;
    }
    setIsCreatingProject(true);
    try {
      const projectId = `project-${Date.now()}`;
      
      const submittedProposal: Proposal = {
        ...emptyProposal,
        ...proposalData,
        id: editingProposalId || `proposal-${Date.now()}`,
        status: "active",
        linkedProjectId: projectId,
        submittedAt: new Date(),
        submittedBy: profile.id,
        submittedByName: getDisplayName(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Proposal;
      
      await persistProposalToFirestore(submittedProposal);

      if (editingProposalId) {
        setProposals((prev) =>
          prev.map((p) => (p.id === editingProposalId ? submittedProposal : p))
        );
      } else {
        setProposals((prev) => [submittedProposal, ...prev]);
      }
      
      toast.success(`Project created from proposal "${proposalData.name}"`);
      
      setShowWizard(false);
      setCurrentStep(1);
      setProposalData(emptyProposal);
      setAnalysisResult(null);
      setUploadedFile(null);
      setEditingProposalId(null);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const startNewProposal = () => {
    setProposalData(emptyProposal);
    setAnalysisResult(null);
    setUploadedFile(null);
    setCurrentStep(1);
    setShowWizard(true);
    // Reset OEM-specific state
    setResearchWebsites([]);
    setResearchDocuments([]);
    setSlides([]);
    setAffiliateRecommendations([]);
    // Reset NDA-specific state
    setNdaSignerEmail("");
    setNdaSignerName("");
    setNdaSignerCompany("");
    setNdaSignerPhone("");
    setNdaSignerAddress("");
    setNdaSignerCity("");
    setNdaSignerState("");
    setNdaSignerZip("");
    setNdaSignerTitle("");
    setNdaStatus("draft");
    setNdaTemplateFields({});
    setNdaSignatureMode("type");
    setNdaTypedSignature("");
    setSelfServeMode(false);
    setSelectedTemplate(null);
  };

  // Generate professional SVP-branded PDF HTML
  const generateProposalHTML = (proposal: Partial<Proposal>): string => {
    const typeLabel = PROPOSAL_TYPES.find(t => t.value === proposal.type)?.label || proposal.type;
    const dateStr = proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const logoUrl = `${window.location.origin}/logo.jpg`;

    // Build body sections
    const sections: string[] = [];

    // Description / Scope of Work
    if (proposal.description) {
      sections.push(`
        <div class="section">
          <h2>Scope of Work</h2>
          <div class="body-text">${proposal.description.replace(/\n/g, "<br/>")}</div>
        </div>
      `);
    }

    // Grant details
    if (proposal.type === "grant" && (proposal.grantAmount || proposal.grantingOrganization)) {
      sections.push(`
        <div class="section">
          <h2>Grant Details</h2>
          <table class="info-table">
            <tbody>
              ${proposal.grantAmount ? `<tr><td class="label-cell">Amount Requested</td><td>$${proposal.grantAmount.toLocaleString()}</td></tr>` : ""}
              ${proposal.grantingOrganization ? `<tr><td class="label-cell">Granting Organization</td><td>${proposal.grantingOrganization}</td></tr>` : ""}
              ${proposal.grantProgramName ? `<tr><td class="label-cell">Grant Program</td><td>${proposal.grantProgramName}</td></tr>` : ""}
              ${proposal.matchingFundsRequired ? `<tr><td class="label-cell">Matching Funds</td><td>$${(proposal.matchingFundsAmount || 0).toLocaleString()}</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      `);
    }

    // Collaborating Entities / Parties
    if (proposal.collaboratingEntities?.length) {
      const entityRows = proposal.collaboratingEntities.map((e) => `
        <div class="entity-card">
          <div class="entity-name">${e.name}</div>
          <div class="entity-role">${ENTITY_ROLES.find(r => r.value === e.role)?.label || e.role}</div>
          ${e.description ? `<div class="entity-desc">${e.description.replace(/\n/g, "<br/>")}</div>` : ""}
          ${e.contactName ? `<div class="entity-contact">Contact: ${e.contactName}${(e as any).contactEmail ? ` — ${(e as any).contactEmail}` : ""}</div>` : ""}
        </div>
      `).join("");
      sections.push(`
        <div class="section">
          <h2>Parties &amp; Collaborating Entities</h2>
          ${entityRows}
        </div>
      `);
    }

    // Milestones
    if (proposal.projectMilestones?.length) {
      const milestoneRows = proposal.projectMilestones.map((m) => `
        <tr>
          <td>${m.name}</td>
          <td>${m.dueDate || "TBD"}</td>
          <td><span class="status-badge">${m.status}</span></td>
        </tr>
      `).join("");
      sections.push(`
        <div class="section">
          <h2>Project Milestones</h2>
          <table class="data-table">
            <thead><tr><th>Milestone</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>${milestoneRows}</tbody>
          </table>
        </div>
      `);
    }

    // Data Collection Methods
    if (proposal.dataCollectionMethods?.length) {
      const methodRows = proposal.dataCollectionMethods.map((m) => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.frequency}</td>
          <td>${m.description}</td>
        </tr>
      `).join("");
      sections.push(`
        <div class="section">
          <h2>Data Collection Methods</h2>
          <table class="data-table">
            <thead><tr><th>Method</th><th>Frequency</th><th>Description</th></tr></thead>
            <tbody>${methodRows}</tbody>
          </table>
        </div>
      `);
    }

    // Deliverables
    if (proposal.deliverables?.length) {
      const deliverableRows = proposal.deliverables.map((d) => `
        <tr>
          <td><strong>${d.name}</strong></td>
          <td>${d.description}</td>
          <td>${d.dueDate || "TBD"}</td>
          <td><span class="status-badge">${d.status}</span></td>
        </tr>
      `).join("");
      sections.push(`
        <div class="section">
          <h2>Deliverables</h2>
          <table class="data-table">
            <thead><tr><th>Deliverable</th><th>Description</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>${deliverableRows}</tbody>
          </table>
        </div>
      `);
    }

    // Proposal Sections (RFI/RFP content)
    if (proposal.sections?.length) {
      const sectionContent = proposal.sections.map((s) => `
        <div class="subsection">
          <h3>${s.title}</h3>
          <div class="body-text">${(s.content || s.responseText || "").replace(/\n/g, "<br/>")}</div>
        </div>
      `).join("");
      sections.push(`
        <div class="section">
          <h2>Proposal Content</h2>
          ${sectionContent}
        </div>
      `);
    }

    // Entity Relationship Notes
    if (proposal.entityRelationshipNotes) {
      sections.push(`
        <div class="section">
          <h2>Entity Relationship Notes</h2>
          <div class="body-text">${proposal.entityRelationshipNotes.replace(/\n/g, "<br/>")}</div>
        </div>
      `);
    }

    // Budget
    if (proposal.totalBudget) {
      sections.push(`
        <div class="section">
          <h2>Budget Summary</h2>
          <table class="info-table">
            <tbody>
              <tr><td class="label-cell">Total Budget</td><td class="budget-amount">$${proposal.totalBudget.toLocaleString()}</td></tr>
              ${proposal.fundingSource ? `<tr><td class="label-cell">Funding Source</td><td>${proposal.fundingSource}</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      `);
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${proposal.name} — Strategic Value+</title>
  <style>
    @page {
      size: letter;
      margin: 0.75in 0.85in 1in 0.85in;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
      .no-break { page-break-inside: avoid; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      line-height: 1.65;
      font-size: 11pt;
      background: #f5f5f5;
    }
    
    /* ── Document Wrapper ── */
    .document-wrapper {
      max-width: 8.5in;
      margin: 40px auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .document-content {
      padding: 48px 56px;
    }
    
    @media print {
      body { background: white; }
      .document-wrapper { 
        max-width: none; 
        margin: 0; 
        box-shadow: none; 
        border-radius: 0;
      }
      .document-content { padding: 0; }
    }

    /* ── Header / Cover ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 18px;
      border-bottom: 3px solid #C8A951;
      margin-bottom: 28px;
    }
    .header-logo { height: 52px; width: auto; }
    .header-brand {
      text-align: right;
      color: #64748b;
      font-size: 9pt;
      line-height: 1.4;
    }
    .header-brand strong {
      display: block;
      font-size: 11pt;
      color: #1e293b;
      letter-spacing: 0.5px;
    }

    .doc-title {
      font-size: 22pt;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .doc-type {
      display: inline-block;
      background: #C8A951;
      color: #000;
      font-size: 8.5pt;
      font-weight: 600;
      padding: 3px 12px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 16px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 32px;
      padding: 14px 18px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 32px;
      font-size: 9.5pt;
    }
    .meta-grid .meta-label { color: #64748b; font-weight: 500; }
    .meta-grid .meta-value { color: #1e293b; font-weight: 600; }

    /* ── Sections ── */
    .section { margin-bottom: 28px; }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e293b;
      padding-bottom: 6px;
      border-bottom: 2px solid #C8A951;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
      margin-top: 14px;
    }
    .body-text {
      color: #334155;
      font-size: 10.5pt;
      line-height: 1.7;
      text-align: justify;
    }
    .subsection { margin-bottom: 16px; }

    /* ── Tables ── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 9.5pt;
    }
    .data-table th {
      background: #1e293b;
      color: #fff;
      font-weight: 600;
      padding: 8px 12px;
      text-align: left;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .data-table tbody tr:nth-child(even) { background: #f8fafc; }
    .data-table tbody tr:hover { background: #f1f5f9; }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    .info-table td {
      padding: 8px 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-table .label-cell {
      font-weight: 600;
      color: #64748b;
      width: 200px;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.4px;
    }
    .budget-amount {
      font-size: 14pt;
      font-weight: 700;
      color: #1e293b;
    }

    /* ── Entity Cards ── */
    .entity-card {
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #C8A951;
      border-radius: 4px;
      margin-bottom: 10px;
      background: #fefefe;
    }
    .entity-name { font-weight: 700; font-size: 11pt; color: #1e293b; }
    .entity-role {
      display: inline-block;
      background: #f1f5f9;
      color: #475569;
      font-size: 8pt;
      padding: 2px 8px;
      border-radius: 3px;
      margin-top: 2px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.4px;
    }
    .entity-desc { margin-top: 8px; font-size: 10pt; color: #334155; line-height: 1.6; }
    .entity-contact { margin-top: 6px; font-size: 9pt; color: #64748b; }

    .status-badge {
      display: inline-block;
      background: #f1f5f9;
      color: #475569;
      font-size: 8pt;
      padding: 2px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      font-weight: 600;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 2px solid #C8A951;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #94a3b8;
    }
    .footer-left { }
    .footer-right { text-align: right; }

    /* ── Signature Block ── */
    .signature-block {
      margin-top: 48px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .sig-party { }
    .sig-line {
      border-bottom: 1px solid #1e293b;
      margin-bottom: 4px;
      height: 40px;
    }
    .sig-label { font-size: 9pt; color: #64748b; margin-bottom: 2px; }
    .sig-name { font-size: 9pt; color: #1e293b; font-weight: 600; }
  </style>
</head>
<body>

  <div class="document-wrapper">
    <div class="document-content">

  <!-- Header -->
  <div class="header">
    <img src="${logoUrl}" alt="Strategic Value+" class="header-logo" />
    <div class="header-brand">
      <strong>Strategic Value+</strong>
      Transforming U.S. Manufacturing<br/>
      8 The Green #13351, Dover, DE 19901<br/>
      strategicvalueplus.com
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">${proposal.name || "Untitled Proposal"}</div>
  <div class="doc-type">${typeLabel}</div>

  <!-- Meta Grid -->
  <div class="meta-grid">
    ${proposal.referenceNumber ? `<div><span class="meta-label">Reference No.</span></div><div><span class="meta-value">${proposal.referenceNumber}</span></div>` : ""}
    <div><span class="meta-label">Date</span></div><div><span class="meta-value">${dateStr}</span></div>
    ${proposal.startDate ? `<div><span class="meta-label">Start Date</span></div><div><span class="meta-value">${proposal.startDate}</span></div>` : ""}
    ${proposal.endDate ? `<div><span class="meta-label">End Date</span></div><div><span class="meta-value">${proposal.endDate}</span></div>` : ""}
    ${proposal.fundingSource ? `<div><span class="meta-label">Funding Source</span></div><div><span class="meta-value">${proposal.fundingSource}</span></div>` : ""}
    ${proposal.totalBudget ? `<div><span class="meta-label">Total Budget</span></div><div><span class="meta-value">$${proposal.totalBudget.toLocaleString()}</span></div>` : ""}
    <div><span class="meta-label">Status</span></div><div><span class="meta-value">${proposal.status === "signed_countersigned" ? "Signed and Electronically Counter Signed" : (proposal.status || "draft").charAt(0).toUpperCase() + (proposal.status || "draft").slice(1)}</span></div>
    ${proposal.submittedByName ? `<div><span class="meta-label">Prepared By</span></div><div><span class="meta-value">${proposal.submittedByName}</span></div>` : `<div><span class="meta-label">Prepared By</span></div><div><span class="meta-value">${getDisplayName()}</span></div>`}
  </div>

  <!-- Content Sections -->
  ${sections.join("\n")}

  <!-- Signature Block -->
  ${(proposal.status === "signed" || proposal.status === "signed_countersigned") && proposal.signedAt ? `
  <div style="margin-top:48px;padding-top:24px;border-top:2px solid #C8A951;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
      <div>
        <div style="font-size:9pt;color:#64748b;margin-bottom:2px;">For Strategic Value+</div>
        <div style="margin-bottom:4px;height:50px;">
          <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="35" font-family="Georgia, Times New Roman, serif" font-size="24" font-style="italic" fill="#1e293b">Nelinia Varenas</text>
          </svg>
        </div>
        <div style="font-size:9pt;color:#1e293b;font-weight:600;">Nelinia Varenas, CEO</div>
        <div style="font-size:9pt;color:#64748b;">Date: ${new Date(proposal.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        <div style="font-size:8pt;color:#94a3b8;">Signed: ${new Date(proposal.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date(proposal.signedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} EST</div>
      </div>
      <div>
        <div style="font-size:9pt;color:#64748b;margin-bottom:2px;">For ${proposal.signerCompany || proposal.collaboratingEntities?.[0]?.name || "Client"}</div>
        <div style="margin-bottom:4px;height:50px;display:flex;align-items:center;">
          ${proposal.signatureData ? `<img src="${proposal.signatureData}" alt="Signature" style="max-height:50px;max-width:200px;" />` : '<div style="border-bottom:1px solid #1e293b;width:200px;height:40px;"></div>'}
        </div>
        <div style="font-size:9pt;color:#1e293b;font-weight:600;">${proposal.signerName || proposal.collaboratingEntities?.[0]?.contactName || "Authorized Representative"}${proposal.signerTitle ? `, ${proposal.signerTitle}` : ""}</div>
        <div style="font-size:9pt;color:#64748b;">Date: ${new Date(proposal.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        <div style="font-size:8pt;color:#94a3b8;">Signed: ${new Date(proposal.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date(proposal.signedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} EST</div>
      </div>
    </div>
    <div style="margin-top:24px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:8pt;color:#166534;">
      <strong>Electronically Signed</strong> — This document was signed electronically on ${new Date(proposal.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date(proposal.signedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} EST via Strategic Value+ secure signing platform. This electronic signature is legally binding under the ESIGN Act and UETA.
    </div>
  </div>
  ` : `
  <div class="signature-block no-break">
    <div class="sig-party">
      <div class="sig-label">For Strategic Value+</div>
      <div class="sig-line"></div>
      <div class="sig-name">Nelinia Varenas, CEO</div>
      <div class="sig-label">Date: _______________</div>
    </div>
    <div class="sig-party">
      <div class="sig-label">For ${proposal.collaboratingEntities?.[0]?.name || "Client"}</div>
      <div class="sig-line"></div>
      <div class="sig-name">${proposal.collaboratingEntities?.[0]?.contactName || "Authorized Representative"}</div>
      <div class="sig-label">Date: _______________</div>
    </div>
  </div>
  `}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      Strategic Value+ &mdash; Confidential
    </div>
    <div class="footer-right">
      Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    </div>
  </div>

    </div>
  </div>

</body>
</html>`;
  };

  // Edit proposal - load into wizard
  const editProposal = (proposal: Proposal) => {
    setEditingProposalId(proposal.id);
    setProposalData(proposal);
    setAnalysisResult(null);
    setUploadedFile(null);
    setCurrentStep(1);
    setShowWizard(true);
  };

  // Download proposal as professional branded PDF (via print dialog)
  const downloadProposal = (proposal: Proposal) => {
    const html = generateProposalHTML(proposal);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Wait for logo image to load before triggering print
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 300);
      };
    }
  };

  // Preview proposal
  const openPreview = (proposal: Proposal) => {
    setPreviewProposal(proposal);
    setShowPreviewDialog(true);
  };

  // Reset signature back to draft
  const resetSignature = async (proposal: Proposal) => {
    if (!confirm(`Reset the signature on "${proposal.name}"? This will delete the signed document and revert the proposal to Draft status.`)) return;
    try {
      const response = await fetch("/api/proposals/reset-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: proposal.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to reset signature");
        return;
      }
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id
            ? { ...p, status: "draft" as const, signatureId: undefined, signedAt: undefined, signerName: undefined, signatureData: undefined }
            : p
        )
      );
      toast.success("Signature reset. Proposal is now a draft.");
    } catch (err) {
      toast.error("Failed to reset signature");
    }
  };

  // Email proposal for signature
  const openEmailDialog = (proposal: Proposal) => {
    setPreviewProposal(proposal);
    setEmailSubject(`Proposal: ${proposal.name}`);
    setEmailMessage(`Please review and sign this ${PROPOSAL_TYPES.find(t => t.value === proposal.type)?.label || proposal.type}.\n\nOnce signed, you will receive a PDF copy of the fully executed document for your records.`);
    setEmailRecipient("");
    setShowEmailDialog(true);
  };

  const sendProposalEmail = async () => {
    if (!emailRecipient || !previewProposal) return;
    setIsSendingEmail(true);
    try {
      // Generate the branded proposal HTML for the signing page
      const proposalHtml = generateProposalHTML(previewProposal);
      const typeLabel = PROPOSAL_TYPES.find(t => t.value === previewProposal.type)?.label || previewProposal.type;

      const response = await fetch("/api/proposals/send-for-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: previewProposal.id,
          proposalName: previewProposal.name,
          proposalType: typeLabel,
          recipientEmail: emailRecipient,
          recipientName: emailRecipient.split("@")[0],
          senderName: getDisplayName(),
          senderEmail: profile?.email || "nel@strategicvalueplus.com",
          message: emailMessage,
          proposalHtml,
        }),
      });

      const data = await response.json();

      // Hard failure (4xx/5xx that isn't 207)
      if (!response.ok && response.status !== 207) {
        toast.error(data.error || "Failed to send signing request");
        return;
      }

      // Update proposal status in Firestore and local state
      const updatedProposal = {
        ...previewProposal,
        status: "pending_signature" as const,
        signatureStatus: "pending" as const,
        updatedAt: new Date(),
      };
      try {
        await persistProposalToFirestore(updatedProposal);
      } catch (err) {
        console.error("Failed to update proposal status in Firestore:", err);
      }
      setProposals((prev) =>
        prev.map((p) =>
          p.id === previewProposal.id ? updatedProposal : p
        )
      );

      setShowEmailDialog(false);
      setEmailRecipient("");
      setEmailSubject("");
      setEmailMessage("");

      // 207 = signing record saved but email NOT sent
      if (response.status === 207 || data.emailSent === false) {
        const reason = data.emailError ? `\n\nReason: ${data.emailError}` : "";
        toast.warning(
          `Signing record saved, but email could NOT be sent.${reason}\n\nSigning link (also copied to clipboard): ${data.signingUrl}`,
          { duration: 20000 }
        );
        if (data.signingUrl) {
          navigator.clipboard.writeText(data.signingUrl).catch(() => {});
        }
        console.error("[proposals] Email send failed:", data.emailError);
        return;
      }

      toast.success(`Signing request sent to ${emailRecipient}`);
    } catch (error) {
      console.error("Error sending signing request:", error);
      alert("Failed to send signing request. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Export proposal as branded PDF (from wizard step 8)
  const exportAsMarkdown = () => {
    const proposal = {
      ...emptyProposal,
      ...proposalData,
      id: editingProposalId || `proposal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Proposal;
    downloadProposal(proposal);
  };

  // Export proposal as branded PDF (from wizard step 8)
  const exportAsPDF = () => {
    const proposal = {
      ...emptyProposal,
      ...proposalData,
      id: editingProposalId || `proposal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Proposal;
    downloadProposal(proposal);
  };

  // OEM Supplier Readiness Functions
  const addResearchWebsite = () => {
    if (!newWebsiteUrl.trim()) return;
    const newSite: ResearchWebsite = {
      id: `website-${Date.now()}`,
      url: newWebsiteUrl.trim(),
      status: "pending",
    };
    setResearchWebsites((prev) => [...prev, newSite]);
    setNewWebsiteUrl("");
  };

  const removeResearchWebsite = (id: string) => {
    setResearchWebsites((prev) => prev.filter((site) => site.id !== id));
  };

  const handleResearchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newDocs: ResearchDocument[] = Array.from(files).map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      analyzed: false,
    }));
    
    setResearchDocuments((prev) => [...prev, ...newDocs]);
  };

  const removeResearchDocument = (id: string) => {
    setResearchDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const runDeepResearch = async () => {
    if (researchWebsites.length === 0 && researchDocuments.length === 0) {
      alert("Please add at least one website or document to analyze");
      return;
    }
    
    setIsRunningDeepResearch(true);
    setDeepResearchProgress(0);
    
    try {
      // Simulate deep research progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDeepResearchProgress(i);
      }
      
      // Mock deep research results
      const mockResult = {
        companyProfile: {
          name: proposalData.supplierName || "Supplier Company",
          headquarters: "Charlotte, NC",
          description: "Manufacturing company specializing in automotive components",
          certifications: ["ISO 9001", "IATF 16949"],
          industries: ["Automotive", "Manufacturing"],
          locations: [],
          keyContacts: [],
        },
        capabilities: {
          primaryCapabilities: [
            { name: "Precision Manufacturing", description: "High-tolerance component manufacturing", relevanceScore: 5, evidence: [] },
            { name: "Quality Control", description: "Advanced QC processes", relevanceScore: 4, evidence: [] },
          ],
          secondaryCapabilities: [],
          equipmentAndFacilities: ["CNC Machines", "Quality Lab"],
          technologyStack: ["ERP System", "MES"],
          qualityMetrics: [],
        },
        certifications: [],
        opportunities: [],
        gaps: { certificationGaps: [], capabilityGaps: [], documentationGaps: [], systemGaps: [] },
        recommendations: [
          "Pursue IATF 16949 certification for automotive supply chain",
          "Implement Toyota Production System training",
          "Establish EDI connectivity for order management",
        ],
        sources: researchWebsites.map((w) => ({ type: "website" as const, name: w.url, url: w.url })),
      };
      
      setProposalData((prev) => ({
        ...prev,
        deepResearchResult: mockResult,
      }));
      
      // Generate affiliate recommendations
      const mockAffiliates: AffiliateRecommendation[] = [
        {
          id: "aff-1",
          affiliateName: "Quality Systems Consulting",
          deliverable: "IATF 16949 Certification",
          capability: "Automotive Quality Management",
          rationale: "Specialized in automotive certification with 95% first-time pass rate",
          estimatedCost: "$25,000 - $40,000",
        },
        {
          id: "aff-2",
          affiliateName: "Lean Manufacturing Partners",
          deliverable: "Toyota Production System Training",
          capability: "Lean Manufacturing Implementation",
          rationale: "Certified TPS trainers with OEM experience",
          estimatedCost: "$15,000 - $25,000",
        },
      ];
      setAffiliateRecommendations(mockAffiliates);
      
      alert("Deep research completed! Review the results in the Review step.");
    } catch (error) {
      console.error("Error running deep research:", error);
      alert("Failed to complete deep research. Please try again.");
    } finally {
      setIsRunningDeepResearch(false);
    }
  };

  // Generate McKinsey-style slide deck
  const generateSlideDeck = async () => {
    if (!proposalData.name || !proposalData.supplierName) {
      alert("Please enter proposal and supplier information first");
      return;
    }
    
    setIsGeneratingSlides(true);
    
    try {
      // McKinsey MOVIE Framework slides
      // M - Message (title with key insight)
      // O - Organize (supporting data in 2-3 groups)
      // V - Visualize (charts/visuals)
      // I - Insight (call out the key insight)
      // E - Extras (alignment, polish)
      
      const generatedSlides: Slide[] = [
        {
          id: "slide-1",
          type: "title",
          title: `${proposalData.supplierName} - OEM Supplier Readiness Assessment`,
          content: `Prepared for ${proposalData.targetOEM || "Target OEM"}`,
          order: 1,
          notes: "Title slide - set the stage for the presentation",
        },
        {
          id: "slide-2",
          type: "insight",
          title: `${proposalData.supplierName} is 75% Ready for OEM Supplier Status`,
          insight: "Key certification gaps can be addressed within 6 months",
          insightHighlight: "75% Ready",
          bullets: [
            "Strong manufacturing capabilities aligned with OEM requirements",
            "Quality management systems in place",
            "Gap: IATF 16949 certification needed",
            "Gap: EDI integration required",
          ],
          order: 2,
          notes: "Lead with the key message - readiness score and timeline",
        },
        {
          id: "slide-3",
          type: "two-column",
          title: "Current Capabilities vs. OEM Requirements",
          content: "Capabilities Assessment",
          bullets: [
            "✓ ISO 9001 Certified",
            "✓ Precision Manufacturing",
            "✓ Quality Control Systems",
            "○ IATF 16949 (In Progress)",
            "○ EDI Connectivity",
          ],
          order: 3,
          notes: "Organize into current state vs. requirements",
        },
        {
          id: "slide-4",
          type: "content",
          title: "Certification Gap Analysis",
          bullets: [
            "IATF 16949 - Critical for automotive supply chain (Est. 4-6 months)",
            "ISO 14001 - Environmental management (Recommended)",
            "Cybersecurity Assessment - Required for connected systems",
          ],
          insight: "Total investment: $50,000 - $75,000",
          insightHighlight: "$50K-$75K Investment",
          order: 4,
          notes: "Call out the investment required",
        },
        {
          id: "slide-5",
          type: "content",
          title: "Implementation Roadmap",
          bullets: [
            "Phase 1 (Months 1-2): Gap assessment and planning",
            "Phase 2 (Months 3-4): IATF 16949 implementation",
            "Phase 3 (Months 5-6): Certification audit and EDI setup",
            "Phase 4 (Month 7+): Supplier qualification process",
          ],
          insight: "Target: Qualified Supplier Status by Q3",
          order: 5,
          notes: "Clear timeline with milestones",
        },
        {
          id: "slide-6",
          type: "insight",
          title: "Recommended Next Steps",
          bullets: [
            "1. Engage IATF 16949 certification consultant",
            "2. Begin EDI integration planning with OEM",
            "3. Schedule facility audit with OEM quality team",
            "4. Establish project tracking dashboard",
          ],
          insight: "Strategic Value Plus can facilitate all steps",
          insightHighlight: "Full-Service Support Available",
          order: 6,
          notes: "Clear call to action",
        },
      ];
      
      setSlides(generatedSlides);
      setProposalData((prev) => ({
        ...prev,
        slideDeck: {
          id: `deck-${Date.now()}`,
          title: `${proposalData.supplierName} - OEM Supplier Readiness`,
          subtitle: `Assessment for ${proposalData.targetOEM}`,
          slides: generatedSlides,
          branding: {
            primaryColor: "#1a365d",
            accentColor: "#c8a951",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }));
      
      alert("Slide deck generated using McKinsey MOVIE framework!");
    } catch (error) {
      console.error("Error generating slides:", error);
      alert("Failed to generate slide deck. Please try again.");
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // NDA Signing Workflow
  const sendNdaForSignature = async () => {
    if (!ndaSignerEmail) {
      alert("Please enter the signer's email address");
      return;
    }
    
    // In direct send mode, require name and company
    if (!selfServeMode && (!ndaSignerName || !ndaSignerCompany)) {
      alert("Please enter the signer's name and company");
      return;
    }
    
    setIsSendingNda(true);
    
    try {
      // Prepare NDA data with all fields
      const ndaData = {
        name: proposalData.name,
        description: proposalData.description,
        effectiveDate: proposalData.startDate || new Date().toISOString().split('T')[0],
        disclosingParty: {
          name: "Nelinia Varenas",
          title: "Co-Founder & CEO",
          company: "Strategic Value Plus",
          email: "nel@strategicvalueplus.com",
        },
        receivingParty: {
          name: ndaSignerName,
          title: ndaSignerTitle,
          company: ndaSignerCompany,
          email: ndaSignerEmail,
          phone: ndaSignerPhone,
          address: ndaSignerAddress,
          city: ndaSignerCity,
          state: ndaSignerState,
          zip: ndaSignerZip,
        },
        templateFields: ndaTemplateFields,
        signatureMode: ndaSignatureMode,
        selfServeMode: selfServeMode,
      };
      
      // In production, this would:
      // 1. Generate the NDA PDF
      // 2. Send email with signing link to the signer (or self-serve link)
      // 3. After signing, send to Nelinia for countersignature
      // 4. After countersigning, store in system and email PDF to signer
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setNdaStatus("sent");
      
      if (selfServeMode) {
        alert(`Self-serve NDA link sent to ${ndaSignerEmail}.

The recipient will receive an email with a secure link to:
1. Fill in their information
2. Review the NDA
3. Sign electronically
4. Receive the countersigned NDA automatically

You will be notified when the NDA is completed.`);
      } else {
        alert(`NDA sent to ${ndaSignerName} (${ndaSignerEmail}) for signature.

Workflow:
1. ${ndaSignerName} will receive an email with a signing link
2. After signing, Nelinia Varenas (nel@strategicvalueplus.com) will receive the NDA for countersignature
3. Once countersigned, the NDA will be stored in the system
4. A PDF copy will be emailed to ${ndaSignerEmail} for their records`);
      }
      
      // Update proposal with NDA details
      setProposalData((prev) => ({
        ...prev,
        signatureStatus: "pending",
      }));
      
    } catch (error) {
      console.error("Error sending NDA:", error);
      alert("Failed to send NDA. Please try again.");
    } finally {
      setIsSendingNda(false);
    }
  };

  // Agreement Signing Workflow
  const sendAgreementForSignature = async () => {
    if (!ndaSignerEmail || !ndaSignerName) {
      alert("Please enter the signer's email address and name");
      return;
    }

    if (!proposalData.clientName || !proposalData.startDate) {
      alert("Please fill in all required client information and start date");
      return;
    }

    setIsSendingNda(true);

    try {
      // Generate the proposal HTML for the signing page
      const proposalHtml = generateProposalHTML(proposalData);

      // Get sender info
      const senderName = getDisplayName();
      const senderEmail = profile?.email || "nel@strategicvalueplus.com";

      // Prepare agreement data for API
      const agreementData = {
        proposalName: proposalData.name || "White Label Agreement",
        proposalType: "White Label Agreement",
        proposalId: editingProposalId || proposalData.id,
        recipientEmail: ndaSignerEmail,
        recipientName: ndaSignerName,
        senderName: senderName,
        senderEmail: senderEmail,
        message: `Please review and sign this White Label Agreement for ${proposalData.clientName}.\n\nOnce signed, you will receive a PDF copy of the fully executed document for your records.`,
        proposalHtml,
        // Additional agreement-specific data
        clientName: proposalData.clientName,
        clientAddress: proposalData.clientAddress,
        clientCity: proposalData.clientCity,
        clientState: proposalData.clientState,
        clientZip: proposalData.clientZip,
        hostingEnabled: proposalData.hostingEnabled,
        monthlyFee: proposalData.monthlyFee,
      };

      // Call API to send agreement for signature
      const response = await fetch("/api/proposals/send-for-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agreementData),
      });

      const result = await response.json();

      // 207 = record saved but email NOT sent (agreement call site)
      if (response.status === 207 || result.emailSent === false) {
        const reason = result.emailError ? `\n\nReason: ${result.emailError}` : "";
        toast.warning(
          `Agreement record saved, but email could NOT be sent.${reason}\n\nSigning link (also copied to clipboard): ${result.signingUrl}`,
          { duration: 20000 }
        );
        if (result.signingUrl) {
          navigator.clipboard.writeText(result.signingUrl).catch(() => {});
        }
        console.error("[proposals] Agreement email send failed:", result.emailError);
        setProposalData((prev) => ({ ...prev, signatureStatus: "pending", status: "pending_signature" }));
        return;
      }

      if (result.success) {
        // Create styled success dialog
        const dialogContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%); border-radius: 12px; color: white; max-width: 500px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 60px; height: 60px; background: #C8A951; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: white;">Agreement Sent Successfully</h2>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">White Label Agreement sent to ${ndaSignerName} (${ndaSignerEmail})</p>
            </div>
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #C8A951;">Workflow:</h3>
              <ol style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
                <li>${ndaSignerName} will receive an email with a signing link</li>
                <li>After signing, Nelinia Varenas will <strong>automatically countersign</strong></li>
                <li>Once countersigned, the agreement will be stored</li>
                <li>A PDF copy will be emailed to ${ndaSignerEmail}</li>
              </ol>
            </div>
            ${proposalData.hostingEnabled ? `
            <div style="background: rgba(200, 169, 81, 0.2); border: 1px solid #C8A951; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; color: white;">
                <strong>✓ Stripe Subscription Created</strong><br/>
                Monthly hosting fee: <strong>$${proposalData.monthlyFee}</strong>
              </p>
            </div>
            ` : ''}
            <div style="text-align: center;">
              <button onclick="this.closest('div').parentElement.remove()" style="background: #C8A951; color: #1e3a5f; border: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#b89a42'" onmouseout="this.style.background='#C8A951'">OK</button>
            </div>
          </div>
        `;
        
        // Create and show the styled dialog
        const dialogOverlay = document.createElement('div');
        dialogOverlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px;';
        dialogOverlay.innerHTML = dialogContent;
        dialogOverlay.onclick = (e) => { if (e.target === dialogOverlay) dialogOverlay.remove(); };
        document.body.appendChild(dialogOverlay);

        // Update proposal status
        setProposalData((prev) => ({
          ...prev,
          signatureStatus: "pending",
          status: "pending_signature",
        }));
      } else {
        alert(result.error || "Failed to send agreement. Please try again.");
      }
    } catch (error) {
      console.error("Error sending agreement:", error);
      alert("Failed to send agreement. Please try again.");
    } finally {
      setIsSendingNda(false);
    }
  };

  // Template Management Functions
  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read file content to scan for placeholders
    let content = "";
    let placeholders: string[] = [];
    
    // For text-based files, read content and extract placeholders
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      try {
        content = await file.text();
        placeholders = extractPlaceholders(content);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
    
    const newTemplate: DocumentTemplate = {
      id: `template-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: selectedTemplateType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      version: "1.0",
      isActive: true,
      content: content || undefined,
      placeholders: placeholders.length > 0 ? placeholders : undefined,
    };
    
    setDocumentTemplates((prev) => [...prev, newTemplate]);
    e.target.value = "";
  };

  const deleteTemplate = (id: string) => {
    setDocumentTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTemplateActive = (id: string) => {
    setDocumentTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  // Check if proposal type uses templates
  const usesTemplates = (type: string) => {
    return ["nda", "mou", "contract", "agreement"].includes(type);
  };

  // Get templates for current proposal type
  const getTemplatesForType = (type: string): DocumentTemplate[] => {
    const templateType = type as TemplateType;
    return documentTemplates.filter((t) => t.type === templateType && t.isActive);
  };

  // Add entity
  const addEntity = () => {
    const newEntity: CollaboratingEntity = {
      id: `entity-${Date.now()}`,
      name: "",
      role: "partner",
      description: "",
      contactName: "",
      contactEmail: "",
      responsibilities: [],
    };
    setProposalData((prev) => ({
      ...prev,
      collaboratingEntities: [...(prev.collaboratingEntities || []), newEntity],
    }));
  };

  // Add data collection method
  const addDataMethod = () => {
    const newMethod: DataCollectionMethod = {
      id: `method-${Date.now()}`,
      name: "",
      description: "",
      frequency: "monthly",
      responsibleEntity: "",
      dataPoints: [],
      tools: [],
    };
    setProposalData((prev) => ({
      ...prev,
      dataCollectionMethods: [...(prev.dataCollectionMethods || []), newMethod],
    }));
  };

  // Add milestone
  const addMilestone = () => {
    const newMilestone: ProjectMilestone = {
      id: `milestone-${Date.now()}`,
      name: "",
      description: "",
      dueDate: "",
      status: "not_started",
      responsibleParties: [],
      dependencies: [],
    };
    setProposalData((prev) => ({
      ...prev,
      projectMilestones: [...(prev.projectMilestones || []), newMilestone],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      case "pending_signature":
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700"><Check className="h-3 w-3 mr-1" />Completed</Badge>;
      case "signed":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Signed</Badge>;
      case "signed_countersigned":
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Fully Signed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Proposal Creator
          </h1>
          <p className="text-muted-foreground">
            AI-powered document analysis and proposal management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/proposals/nda">
              <Shield className="mr-2 h-4 w-4" />
              NDA Management
            </Link>
          </Button>
          <Button onClick={startNewProposal}>
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "proposals" ? "default" : "ghost"}
          className="rounded-b-none"
          onClick={() => setActiveTab("proposals")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Proposals
        </Button>
        <Button
          variant={activeTab === "templates" ? "default" : "ghost"}
          className="rounded-b-none"
          onClick={() => setActiveTab("templates")}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Document Templates
        </Button>
      </div>

      {/* Templates Tab Content */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document Template
              </CardTitle>
              <CardDescription>
                Upload templates for NDAs, MOUs, Contracts, and Agreements. These templates will be available when creating new documents of the corresponding type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Type</Label>
                  <Select
                    value={selectedTemplateType}
                    onValueChange={(v) => setSelectedTemplateType(v as TemplateType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
                      <SelectItem value="mou">Memorandum of Understanding (MOU)</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Upload Template File</Label>
                  <label className="cursor-pointer">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="hidden"
                      onChange={handleTemplateUpload}
                    />
                    <Button asChild variant="outline" className="w-full">
                      <span><Upload className="mr-2 h-4 w-4" />Select File</span>
                    </Button>
                  </label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, Word (.doc, .docx), Text, Markdown
              </p>
            </CardContent>
          </Card>

          {/* Template List */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
              <CardDescription>
                Manage your document templates. Active templates will be available in the wizard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No templates uploaded yet</p>
                  <p className="text-sm text-muted-foreground">Upload a template above to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {["nda", "mou", "contract", "agreement"].map((type) => {
                    const templatesOfType = documentTemplates.filter((t) => t.type === type);
                    if (templatesOfType.length === 0) return null;
                    return (
                      <div key={type} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {type === "nda" ? "NDAs" : type === "mou" ? "MOUs" : type === "contract" ? "Contracts" : "Agreements"}
                        </h4>
                        {templatesOfType.map((template) => (
                          <div
                            key={template.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              template.isActive ? "bg-background" : "bg-muted/50 opacity-60"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{template.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {template.fileName} • {(template.fileSize / 1024).toFixed(1)} KB • v{template.version}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={template.isActive ? "default" : "secondary"}>
                                  {template.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTemplateActive(template.id)}
                                >
                                  {template.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteTemplate(template.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {/* Show detected placeholders */}
                            {template.placeholders && template.placeholders.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Detected {template.placeholders.length} placeholder fields:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {template.placeholders.map((placeholder) => (
                                    <Badge key={placeholder} variant="outline" className="text-xs">
                                      {`{{${placeholder}}}`}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Template Usage</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Templates are used for <strong>NDAs, MOUs, Contracts, and Agreements</strong> only. 
                    RFIs, RFPs, Grants, and OEM Supplier Readiness documents do not use templates as they 
                    are generated from uploaded source documents or created from scratch.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Proposals Tab Content */}
      {activeTab === "proposals" && (
        <>
          {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {proposals.filter((p) => p.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Signature</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {proposals.filter((p) => p.status === "pending_signature").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  ${proposals.reduce((sum, p) => sum + (p.totalBudget || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      {proposals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Funding Source</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">{proposal.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PROPOSAL_TYPES.find((t) => t.value === proposal.type)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{proposal.fundingSource}</TableCell>
                    <TableCell>${proposal.totalBudget?.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                    <TableCell>{new Date(proposal.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Preview" onClick={() => openPreview(proposal)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => editProposal(proposal)}><Edit className="h-4 w-4" /></Button>
                        {(proposal.status === "signed" || proposal.status === "signed_countersigned") && proposal.signatureId ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download Signed Copy"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => window.open(`/api/proposals/download-signed?id=${proposal.signatureId}`, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Download Draft" onClick={() => downloadProposal(proposal)}><Download className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" title="Send for Signature" onClick={() => openEmailDialog(proposal)}><Send className="h-4 w-4" /></Button>
                        {deletingProposalId === proposal.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Confirm Delete"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeletingProposal}
                              onClick={() => deleteProposal(proposal)}
                            >
                              {isDeletingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cancel"
                              className="text-slate-500 hover:text-slate-700"
                              disabled={isDeletingProposal}
                              onClick={() => setDeletingProposalId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Proposal"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingProposalId(proposal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {(proposal.status === "signed" || proposal.status === "signed_countersigned" || proposal.status === "pending_signature") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reset Signature"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => resetSignature(proposal)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : isLoadingProposals ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading proposals...</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Create your first proposal by uploading a document for AI analysis or start from scratch.
            </p>
            <Button onClick={startNewProposal}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Proposal
            </Button>
          </CardContent>
        </Card>
      )}
      </>
      )}

      {/* Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent 
          className="!max-w-[90vw] !w-[1200px] !h-[85vh] overflow-hidden flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Proposal Creator Wizard
            </DialogTitle>
            <DialogDescription>
              Step {currentStep} of {activeWizardSteps.length}: {activeWizardSteps[currentStep - 1]?.description}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-2 py-4 border-b">
            {activeWizardSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-1 cursor-pointer transition-colors",
                    isActive && "text-primary",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2",
                      isActive && "border-primary bg-primary/10",
                      isCompleted && "border-green-600 bg-green-100",
                      !isActive && !isCompleted && "border-muted-foreground/30"
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-xs font-medium hidden md:block">{step.title}</span>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <ScrollArea className="flex-1 min-h-0 px-1">
            <div className="py-4 space-y-4 pr-4">
              {/* Step 1: NDA Details (NDA workflow) */}
              {currentStep === 1 && proposalData.type === "nda" && (
                <div className="space-y-6">
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-purple-800">Non-Disclosure Agreement (NDA)</p>
                          <p className="text-sm text-purple-700 mt-1">
                            Create an NDA that will be sent for electronic signature. After the associate signs, 
                            Nelinia Varenas will countersign, and the completed PDF will be stored and emailed to all parties.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Template Selection */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Select NDA Template
                      </CardTitle>
                      <CardDescription>
                        Choose a template to use for this NDA. The template will be scanned for placeholder fields.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {getTemplatesForType("nda").length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed rounded-lg">
                          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No NDA templates available</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload templates in the Templates tab to use them here
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            {getTemplatesForType("nda").map((template) => (
                              <div
                                key={template.id}
                                className={cn(
                                  "p-4 rounded-lg border-2 cursor-pointer transition-colors",
                                  selectedTemplate?.id === template.id ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                                )}
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  // Reset template fields when changing template
                                  setNdaTemplateFields({});
                                }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{template.name}</span>
                                </div>
                                {template.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">v{template.version}</Badge>
                                  {template.placeholders && template.placeholders.length > 0 && (
                                    <span>{template.placeholders.length} fields</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Show detected placeholders when template is selected */}
                          {selectedTemplate && getTemplatePlaceholders().length > 0 && (
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                Template Selected: {selectedTemplate.name}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">
                                Detected {getTemplatePlaceholders().length} placeholder fields:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {getTemplatePlaceholders().map((placeholder) => (
                                  <Badge key={placeholder} variant="secondary" className="text-xs">
                                    {`{{${placeholder}}}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>NDA Title *</Label>
                      <Input
                        placeholder="e.g., Mutual Non-Disclosure Agreement"
                        value={proposalData.name || ""}
                        onChange={(e) => setProposalData({ ...proposalData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select
                        value={proposalData.type}
                        onValueChange={(v) => setProposalData({ ...proposalData, type: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPOSAL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Purpose / Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={enhanceDescription}
                        disabled={isEnhancingDescription}
                      >
                        {isEnhancingDescription ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-3 w-3" />
                        )}
                        Enhance with AI
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Describe the purpose of this NDA and the confidential information being protected"
                      className="min-h-[100px]"
                      value={proposalData.description || ""}
                      onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Effective Date</Label>
                      <Input
                        type="date"
                        value={proposalData.startDate || ""}
                        onChange={(e) => setProposalData({ ...proposalData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date (Optional)</Label>
                      <Input
                        type="date"
                        value={proposalData.endDate || ""}
                        onChange={(e) => setProposalData({ ...proposalData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Basic Info & Document Upload (Non-NDA) */}
              {currentStep === 1 && proposalData.type !== "nda" && (
                <div className="space-y-6">
                  {/* File Upload */}
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-8">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                            <p className="text-lg font-medium">Analyzing document...</p>
                            <p className="text-sm text-muted-foreground">AI is extracting information</p>
                          </>
                        ) : uploadedFile ? (
                          <>
                            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                            <p className="text-lg font-medium">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {analysisResult ? "Analysis complete - data populated below" : "File uploaded"}
                            </p>
                            <Button variant="outline" onClick={() => { setUploadedFile(null); setAnalysisResult(null); }}>
                              Upload Different File
                            </Button>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">Upload Document for AI Analysis</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              PDF, Word, or text files supported
                            </p>
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                              <Button asChild>
                                <span><Upload className="mr-2 h-4 w-4" />Select File</span>
                              </Button>
                            </label>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document Metadata Fields (aligned with Documents page) */}
                  {uploadedFile && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          Document Metadata
                        </CardTitle>
                        <CardDescription>
                          Categorize this document for easy retrieval
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Document Category</Label>
                            <Select
                              value={documentMetadata.category}
                              onValueChange={(v) => setDocumentMetadata({ ...documentMetadata, category: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOCUMENT_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Folder</Label>
                            <Select
                              value={documentMetadata.folder}
                              onValueChange={(v) => setDocumentMetadata({ ...documentMetadata, folder: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOCUMENT_FOLDERS.map((folder) => (
                                  <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Version</Label>
                            <Input
                              placeholder="e.g., 1.0"
                              value={documentMetadata.version}
                              onChange={(e) => setDocumentMetadata({ ...documentMetadata, version: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Document Description</Label>
                          <Textarea
                            placeholder="Brief description of this document"
                            value={documentMetadata.description}
                            onChange={(e) => setDocumentMetadata({ ...documentMetadata, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Template Selection for Contract/Agreement/MOU types */}
                  {(proposalData.type === "contract" || proposalData.type === "agreement" || proposalData.type === "mou") && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Select Template
                        </CardTitle>
                        <CardDescription>
                          Choose a template to start from or upload a new document
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {documentTemplates.filter(t => t.type === proposalData.type).length > 0 ? (
                          <div className="space-y-2">
                            {documentTemplates.filter(t => t.type === proposalData.type).map((template) => (
                              <div
                                key={template.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                                  selectedTemplate?.id === template.id
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-muted/50"
                                )}
                                onClick={() => setSelectedTemplate(template)}
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{template.name}</p>
                                    {template.description && (
                                      <p className="text-sm text-muted-foreground">{template.description}</p>
                                    )}
                                  </div>
                                </div>
                                {selectedTemplate?.id === template.id && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No templates available for this document type.</p>
                            <p className="text-sm">Upload a document above or add templates in the Templates tab.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Basic Info Fields - hidden for Agreements when template is selected */}
                  {!(proposalData.type === "agreement" && selectedTemplate) && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Proposal Name *</Label>
                          <Input
                            placeholder="Enter proposal name"
                            value={proposalData.name || ""}
                            onChange={(e) => setProposalData({ ...proposalData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Document Type *</Label>
                          <Select
                            value={proposalData.type}
                            onValueChange={(v) => setProposalData({ ...proposalData, type: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROPOSAL_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Description</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={enhanceDescription}
                            disabled={isEnhancingDescription}
                          >
                            {isEnhancingDescription ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-3 w-3" />
                            )}
                            Enhance with AI
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Brief description of the proposal"
                          value={proposalData.description || ""}
                          onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {/* Proposal-specific fields - hidden for Agreements */}
                  {proposalData.type !== "agreement" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Funding Source</Label>
                          <Select
                            value={proposalData.fundingSource}
                            onValueChange={(v) => setProposalData({ ...proposalData, fundingSource: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding source" />
                            </SelectTrigger>
                            <SelectContent>
                              {FUNDING_SOURCES.map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Reference Number</Label>
                          <Input
                            placeholder="Grant/Contract number"
                            value={proposalData.referenceNumber || ""}
                            onChange={(e) => setProposalData({ ...proposalData, referenceNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={proposalData.startDate || ""}
                            onChange={(e) => setProposalData({ ...proposalData, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={proposalData.endDate || ""}
                            onChange={(e) => setProposalData({ ...proposalData, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Response Deadline</Label>
                          <Input
                            type="date"
                            value={proposalData.responseDeadline || ""}
                            onChange={(e) => setProposalData({ ...proposalData, responseDeadline: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Total Budget ($)</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateBudget}
                              disabled={isGeneratingBudget}
                            >
                              {isGeneratingBudget ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="mr-2 h-3 w-3" />
                              )}
                              AI Budget
                            </Button>
                          </div>
                          <Input
                            type="number"
                            placeholder="0"
                            value={proposalData.totalBudget || ""}
                            onChange={(e) => setProposalData({ ...proposalData, totalBudget: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Start Date - shown for Agreements only when no template selected */}
                  {proposalData.type === "agreement" && !selectedTemplate && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Agreement Start Date *</Label>
                        <Input
                          type="date"
                          value={proposalData.startDate || ""}
                          onChange={(e) => setProposalData({ ...proposalData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* RFI/RFP Notice */}
                  {(proposalData.type === "rfi_response" || proposalData.type === "rfp_response") && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800">
                              {proposalData.type === "rfi_response" ? "Request for Information (RFI)" : "Request for Proposal (RFP)"} Response
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                              AI will analyze this document to extract entities, deliverables, milestones, and reporting requirements. 
                              Use the &quot;Enhance with AI&quot; buttons to improve your responses.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Grant Application Fields */}
                  {proposalData.type === "grant" && (
                    <>
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-800">Grant Application</p>
                              <p className="text-sm text-green-700 mt-1">
                                AI will analyze this grant document to extract entities, deliverables, milestones, and reporting requirements.
                                The grant amount will be tracked for funding purposes.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Granting Organization</Label>
                          <Input
                            placeholder="e.g., National Science Foundation"
                            value={proposalData.grantingOrganization || ""}
                            onChange={(e) => setProposalData({ ...proposalData, grantingOrganization: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Grant Program Name</Label>
                          <Input
                            placeholder="e.g., Small Business Innovation Research"
                            value={proposalData.grantProgramName || ""}
                            onChange={(e) => setProposalData({ ...proposalData, grantProgramName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Grant Amount Requested ($)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={proposalData.grantAmount || ""}
                            onChange={(e) => setProposalData({ ...proposalData, grantAmount: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Matching Funds Required?</Label>
                          <Select
                            value={proposalData.matchingFundsRequired ? "yes" : "no"}
                            onValueChange={(v) => setProposalData({ ...proposalData, matchingFundsRequired: v === "yes" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No</SelectItem>
                              <SelectItem value="yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {proposalData.matchingFundsRequired && (
                          <div className="space-y-2">
                            <Label>Matching Funds Amount ($)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={proposalData.matchingFundsAmount || ""}
                              onChange={(e) => setProposalData({ ...proposalData, matchingFundsAmount: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* OEM Supplier Readiness Fields */}
                  {proposalData.type === "oem_supplier_readiness" && (
                    <>
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-800">OEM Supplier Readiness Assessment</p>
                              <p className="text-sm text-blue-700 mt-1">
                                This workflow will perform deep research on the supplier, analyze OEM requirements, 
                                generate a dossier, and create a McKinsey-style presentation.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Supplier Name *</Label>
                          <Input
                            placeholder="Enter supplier company name"
                            value={proposalData.supplierName || ""}
                            onChange={(e) => setProposalData({ ...proposalData, supplierName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target OEM *</Label>
                          <Select
                            value={proposalData.oemAgreementId || ""}
                            onValueChange={(v) => {
                              const oem = OEM_AGREEMENTS.find((o) => o.id === v);
                              setProposalData({ 
                                ...proposalData, 
                                oemAgreementId: v,
                                targetOEM: oem?.name || "",
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select OEM with agreement" />
                            </SelectTrigger>
                            <SelectContent>
                              {OEM_AGREEMENTS.map((oem) => (
                                <SelectItem key={oem.id} value={oem.id}>
                                  {oem.name} - {oem.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Parties (NDA workflow) */}
              {currentStep === 2 && proposalData.type === "nda" && (
                <div className="space-y-6">
                  {/* Self-Serve Mode Toggle */}
                  <Card className={selfServeMode ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        NDA Delivery Mode
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to send the NDA for signature
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            "flex-1 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            !selfServeMode ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() => setSelfServeMode(false)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Send className="h-5 w-5" />
                            <span className="font-medium">Direct Send</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enter recipient details and send NDA immediately
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex-1 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            selfServeMode ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() => setSelfServeMode(true)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <LinkIcon className="h-5 w-5" />
                            <span className="font-medium">Self-Serve Link</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Send a link for recipient to fill their own information
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {selfServeMode ? "Recipient Contact" : "Signing Parties"}
                      </CardTitle>
                      <CardDescription>
                        {selfServeMode 
                          ? "Enter the email address where the self-serve link will be sent"
                          : "Enter the details of the person who will sign this NDA"
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Email is always required */}
                      <div className="space-y-2">
                        <Label>Signer Email *</Label>
                        <Input
                          type="email"
                          placeholder="e.g., john.smith@company.com"
                          value={ndaSignerEmail}
                          onChange={(e) => setNdaSignerEmail(e.target.value)}
                        />
                      </div>

                      {/* Additional fields for Direct Send mode */}
                      {!selfServeMode && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Signer Full Name *</Label>
                              <Input
                                placeholder="e.g., John Smith"
                                value={ndaSignerName}
                                onChange={(e) => setNdaSignerName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Title / Position</Label>
                              <Input
                                placeholder="e.g., CEO, Director"
                                value={ndaSignerTitle}
                                onChange={(e) => setNdaSignerTitle(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Phone Number</Label>
                              <Input
                                type="tel"
                                placeholder="(555) 123-4567"
                                value={ndaSignerPhone}
                                onChange={(e) => setNdaSignerPhone(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Company / Organization *</Label>
                              <Input
                                placeholder="e.g., ABC Manufacturing Inc."
                                value={ndaSignerCompany}
                                onChange={(e) => setNdaSignerCompany(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Street Address</Label>
                            <Input
                              placeholder="123 Main Street, Suite 100"
                              value={ndaSignerAddress}
                              onChange={(e) => setNdaSignerAddress(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>City</Label>
                              <Input
                                placeholder="Raleigh"
                                value={ndaSignerCity}
                                onChange={(e) => setNdaSignerCity(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>State</Label>
                              <Input
                                placeholder="NC"
                                value={ndaSignerState}
                                onChange={(e) => setNdaSignerState(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>ZIP Code</Label>
                              <Input
                                placeholder="27601"
                                value={ndaSignerZip}
                                onChange={(e) => setNdaSignerZip(e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {selfServeMode && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            <strong>Self-Serve Mode:</strong> The recipient will receive an email with a secure link. 
                            They will fill in their own information and sign the NDA. You will be notified when completed.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Dynamic Template Fields */}
                  {selectedTemplate && getTemplatePlaceholders().length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5" />
                          Template Fields
                        </CardTitle>
                        <CardDescription>
                          Fill in the dynamic fields from the template. Fields marked with * are required.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {getTemplatePlaceholders().map((placeholder) => (
                            <div key={placeholder} className="space-y-2">
                              <Label className="flex items-center gap-1">
                                {formatPlaceholderLabel(placeholder)}
                                {["effective_date", "disclosing_party_name", "receiving_party_name"].includes(placeholder) && (
                                  <span className="text-destructive">*</span>
                                )}
                              </Label>
                              {placeholder.includes("date") ? (
                                <Input
                                  type="date"
                                  value={ndaTemplateFields[placeholder] || ""}
                                  onChange={(e) => updateTemplateField(placeholder, e.target.value)}
                                />
                              ) : placeholder.includes("years") ? (
                                <Input
                                  type="number"
                                  min="1"
                                  max="99"
                                  placeholder={placeholder === "term_years" ? "2" : "5"}
                                  value={ndaTemplateFields[placeholder] || ""}
                                  onChange={(e) => updateTemplateField(placeholder, e.target.value)}
                                />
                              ) : (
                                <Input
                                  placeholder={`Enter ${formatPlaceholderLabel(placeholder).toLowerCase()}`}
                                  value={ndaTemplateFields[placeholder] || ""}
                                  onChange={(e) => updateTemplateField(placeholder, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Countersigner</p>
                          <p className="text-sm text-amber-700 mt-1">
                            After the signer completes their signature, the NDA will automatically be sent to 
                            <strong> Nelinia Varenas (nelinia@strategicvalueplus.com)</strong> for countersignature.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Sign & Send (NDA workflow) */}
              {currentStep === 3 && proposalData.type === "nda" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Review & Send for Signature
                      </CardTitle>
                      <CardDescription>
                        Review the NDA details and send for electronic signature
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">NDA Title</p>
                            <p className="font-medium">{proposalData.name || "Untitled"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Effective Date</p>
                            <p className="font-medium">{proposalData.startDate || "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Signer</p>
                            <p className="font-medium">{ndaSignerName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Signer Email</p>
                            <p className="font-medium">{ndaSignerEmail || "Not specified"}</p>
                          </div>
                          {ndaSignerCompany && (
                            <div>
                              <p className="text-muted-foreground">Company</p>
                              <p className="font-medium">{ndaSignerCompany}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Countersigner</p>
                            <p className="font-medium">Nelinia Varenas</p>
                          </div>
                        </div>
                      </div>

                      {proposalData.description && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                          <p className="text-sm">{proposalData.description}</p>
                        </div>
                      )}

                      {/* Template Fields Summary */}
                      {selectedTemplate && Object.keys(ndaTemplateFields).length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Template Fields</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(ndaTemplateFields).map(([key, value]) => (
                              value && (
                                <div key={key}>
                                  <p className="text-muted-foreground">{formatPlaceholderLabel(key)}</p>
                                  <p className="font-medium">{value}</p>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Signature Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Signature Method
                      </CardTitle>
                      <CardDescription>
                        Choose how the signer will apply their signature
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            "flex-1 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            ndaSignatureMode === "type" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() => setNdaSignatureMode("type")}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5" />
                            <span className="font-medium">Type Signature</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Signer types their name which is rendered in a signature font
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex-1 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                            ndaSignatureMode === "draw" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() => setNdaSignatureMode("draw")}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Edit className="h-5 w-5" />
                            <span className="font-medium">Draw Signature</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Signer draws their signature using mouse or touch
                          </p>
                        </div>
                      </div>

                      {ndaSignatureMode === "type" && (
                        <div className="space-y-2">
                          <Label>Preview Typed Signature</Label>
                          <Input
                            placeholder="Type name to preview signature"
                            value={ndaTypedSignature}
                            onChange={(e) => setNdaTypedSignature(e.target.value)}
                          />
                          {ndaTypedSignature && (
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-2xl font-signature italic text-primary">
                                {ndaTypedSignature}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {ndaSignatureMode === "draw" && (
                        <div className="space-y-2">
                          <Label>Signature Pad Preview</Label>
                          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
                            <Edit className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Signature pad will be available when the signer opens the signing link
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Signature Workflow
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            ndaStatus === "draft" ? "bg-primary text-white" : "bg-green-100 text-green-700"
                          )}>
                            {ndaStatus !== "draft" ? <Check className="h-4 w-4" /> : "1"}
                          </div>
                          <div>
                            <p className="font-medium">Send to Signer</p>
                            <p className="text-sm text-muted-foreground">
                              {ndaSignerName || "Signer"} receives email with signing link
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            ndaStatus === "signed" || ndaStatus === "countersigned" || ndaStatus === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {ndaStatus === "signed" || ndaStatus === "countersigned" || ndaStatus === "completed" ? <Check className="h-4 w-4" /> : "2"}
                          </div>
                          <div>
                            <p className="font-medium">Signer Signs</p>
                            <p className="text-sm text-muted-foreground">
                              Signer completes electronic signature
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            ndaStatus === "countersigned" || ndaStatus === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {ndaStatus === "countersigned" || ndaStatus === "completed" ? <Check className="h-4 w-4" /> : "3"}
                          </div>
                          <div>
                            <p className="font-medium">Countersignature</p>
                            <p className="text-sm text-muted-foreground">
                              Nelinia Varenas (nelinia@strategicvalueplus.com) countersigns
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            ndaStatus === "completed" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {ndaStatus === "completed" ? <Check className="h-4 w-4" /> : "4"}
                          </div>
                          <div>
                            <p className="font-medium">Complete & Deliver</p>
                            <p className="text-sm text-muted-foreground">
                              Signed PDF stored in system and emailed to {ndaSignerEmail || "signer"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={sendNdaForSignature}
                          disabled={isSendingNda || !ndaSignerEmail || !ndaSignerName || !proposalData.name || ndaStatus !== "draft"}
                        >
                          {isSendingNda ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending...
                            </>
                          ) : ndaStatus !== "draft" ? (
                            <>
                              <CheckCircle className="mr-2 h-5 w-5" />
                              NDA Sent for Signature
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Send NDA for Signature
                            </>
                          )}
                        </Button>
                        {ndaStatus !== "draft" && (
                          <p className="text-sm text-center text-muted-foreground mt-2">
                            NDA has been sent. You will be notified when signatures are complete.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ==================== AGREEMENT WORKFLOW STEPS ==================== */}

              {/* Step 1: Client Details (Agreement workflow) */}
              {currentStep === 1 && proposalData.type === "agreement" && (
                <div className="space-y-6">
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        White Label Agreement - Client Information
                      </CardTitle>
                      <CardDescription>
                        Enter the client company details for the White Label Platform Service Agreement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Agreement Name *</Label>
                          <Input
                            placeholder="e.g., White Label Platform Service Agreement"
                            value={proposalData.name || ""}
                            onChange={(e) => setProposalData({ ...proposalData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Client Company Name *</Label>
                          <Input
                            placeholder="e.g., ABC Technologies Inc."
                            value={proposalData.clientName || ""}
                            onChange={(e) => setProposalData({ ...proposalData, clientName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Street Address *</Label>
                        <Input
                          placeholder="123 Main Street, Suite 100"
                          value={proposalData.clientAddress || ""}
                          onChange={(e) => setProposalData({ ...proposalData, clientAddress: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>City *</Label>
                          <Input
                            placeholder="Raleigh"
                            value={proposalData.clientCity || ""}
                            onChange={(e) => setProposalData({ ...proposalData, clientCity: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State *</Label>
                          <Input
                            placeholder="NC"
                            value={proposalData.clientState || ""}
                            onChange={(e) => setProposalData({ ...proposalData, clientState: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP Code *</Label>
                          <Input
                            placeholder="27601"
                            value={proposalData.clientZip || ""}
                            onChange={(e) => setProposalData({ ...proposalData, clientZip: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Service Description *</Label>
                        <Textarea
                          placeholder="Describe the specialized services SVP will provide (e.g., AI-powered platform development, cloud infrastructure management)"
                          value={proposalData.serviceDescription || ""}
                          onChange={(e) => setProposalData({ ...proposalData, serviceDescription: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Application Description *</Label>
                        <Textarea
                          placeholder="Describe the application/technology that will be developed and maintained"
                          value={proposalData.applicationDescription || ""}
                          onChange={(e) => setProposalData({ ...proposalData, applicationDescription: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Feature List Description */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Platform Features & Deliverables</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!proposalData.description) {
                                alert("Please enter some bullet points first");
                                return;
                              }
                              setIsEnhancingDescription(true);
                              try {
                                // Format bullet points into agreement-style clause
                                const features = proposalData.description
                                  .split('\n')
                                  .filter(line => line.trim())
                                  .map(line => line.replace(/^[-•*]\s*/, '').trim());
                                
                                const formattedDescription = `Strategic Value Plus agrees to provide the following platform features and deliverables to Client:\n\n${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nThese features shall be developed and integrated into the white-labeled platform according to the timeline and specifications agreed upon by both parties.`;
                                
                                setProposalData({ ...proposalData, description: formattedDescription });
                              } catch (error) {
                                console.error("Error formatting description:", error);
                              } finally {
                                setIsEnhancingDescription(false);
                              }
                            }}
                            disabled={isEnhancingDescription}
                          >
                            {isEnhancingDescription ? (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-3 w-3" />
                            )}
                            Enhance with AI
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter bullet points (one per line) of features SVP will add to the platform. Click "Enhance with AI" to format as agreement clause.
                        </p>
                        <Textarea
                          placeholder="- AI-powered analytics dashboard\n- Custom branding and white-labeling\n- User management and authentication\n- Data integration and API connections\n- Reporting and export capabilities"
                          value={proposalData.description || ""}
                          onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                          rows={6}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Template Selection */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Select Agreement Template
                      </CardTitle>
                      <CardDescription>
                        Choose the White Label Agreement template
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {documentTemplates.filter(t => t.type === "agreement").length > 0 ? (
                        <div className="space-y-2">
                          {documentTemplates.filter(t => t.type === "agreement").map((template) => (
                            <div
                              key={template.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                                selectedTemplate?.id === template.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{template.name}</p>
                                  {template.description && (
                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                  )}
                                </div>
                              </div>
                              {selectedTemplate?.id === template.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No agreement templates available.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2: Service Terms (Agreement workflow) */}
              {currentStep === 2 && proposalData.type === "agreement" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Service Terms & Duration
                      </CardTitle>
                      <CardDescription>
                        Define the agreement term, billing period, and key dates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Agreement Start Date *</Label>
                          <Input
                            type="date"
                            value={proposalData.startDate || ""}
                            onChange={(e) => setProposalData({ ...proposalData, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Billing Period *</Label>
                          <Select
                            value={proposalData.billingPeriod || "monthly"}
                            onValueChange={(v) => setProposalData({ ...proposalData, billingPeriod: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Fee Adjustment Notice (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            value={proposalData.feeAdjustmentNoticeDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, feeAdjustmentNoticeDays: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Late Payment Grace (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="5"
                            value={proposalData.latePaymentGraceDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, latePaymentGraceDays: parseInt(e.target.value) || 5 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Termination Cure (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            value={proposalData.terminationCureDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, terminationCureDays: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Client Notice (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            value={proposalData.clientTerminationNoticeDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, clientTerminationNoticeDays: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>SVP Notice (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="60"
                            value={proposalData.svpTerminationNoticeDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, svpTerminationNoticeDays: parseInt(e.target.value) || 60 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deliverable Days</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            value={proposalData.terminationDeliverableDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, terminationDeliverableDays: parseInt(e.target.value) || 10 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Post-Term Support (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            value={proposalData.postTerminationSupportDays || ""}
                            onChange={(e) => setProposalData({ ...proposalData, postTerminationSupportDays: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Confidentiality Duration (Years)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="3"
                          value={proposalData.confidentialityDurationYears || ""}
                          onChange={(e) => setProposalData({ ...proposalData, confidentialityDurationYears: parseInt(e.target.value) || 3 })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Payment Setup (Agreement workflow) */}
              {currentStep === 3 && proposalData.type === "agreement" && (
                <div className="space-y-6">
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Monthly Hosting Fee & Stripe Setup
                      </CardTitle>
                      <CardDescription>
                        Configure the recurring monthly fee for platform hosting and management
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Hosting Enable Toggle */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Enable Monthly Hosting Fee</p>
                          <p className="text-sm text-muted-foreground">
                            Charge the client a recurring monthly fee for platform hosting and maintenance
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{proposalData.hostingEnabled ? "Enabled" : "Disabled"}</span>
                          <Button
                            variant={proposalData.hostingEnabled ? "default" : "outline"}
                            onClick={() => setProposalData({ ...proposalData, hostingEnabled: !proposalData.hostingEnabled })}
                          >
                            {proposalData.hostingEnabled ? "On" : "Off"}
                          </Button>
                        </div>
                      </div>

                      {proposalData.hostingEnabled && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Monthly Fee Amount (USD) *</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 5000"
                                value={proposalData.monthlyFee || ""}
                                onChange={(e) => setProposalData({ ...proposalData, monthlyFee: parseFloat(e.target.value) || 0 })}
                              />
                              <p className="text-xs text-muted-foreground">
                                This amount will be charged monthly via Stripe
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Calculated Annual Value</Label>
                              <div className="p-2 bg-muted rounded-lg">
                                <p className="text-lg font-semibold">
                                  ${((proposalData.monthlyFee || 0) * 12).toLocaleString()} / year
                                </p>
                              </div>
                            </div>
                          </div>

                          <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <DollarSign className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-amber-800">Stripe Recurring Billing</p>
                                  <p className="text-sm text-amber-700 mt-1">
                                    The monthly fee will be set up as a recurring subscription using the 
                                    <strong> Strategic Value Plus Stripe Account</strong>. 
                                    The client will be charged automatically on the 1st of each month.
                                  </p>
                                  <p className="text-sm text-amber-700 mt-2">
                                    A secure payment link will be included in the agreement email for the client 
                                    to enter their credit card information.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="p-4 border rounded-lg space-y-2">
                            <Label>Payment Terms Summary</Label>
                            <div className="text-sm space-y-1">
                              <p><strong>Billing Period:</strong> {proposalData.billingPeriod || "Monthly"}</p>
                              <p><strong>Monthly Amount:</strong> ${proposalData.monthlyFee?.toLocaleString() || "0"}</p>
                              <p><strong>Payment Method:</strong> Credit card via Stripe</p>
                              <p><strong>Billing Date:</strong> 1st of each month</p>
                              <p><strong>Late Payment Grace:</strong> {proposalData.latePaymentGraceDays || 5} business days</p>
                            </div>
                          </div>
                        </>
                      )}

                      {!proposalData.hostingEnabled && (
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <p className="text-muted-foreground">
                            No recurring hosting fee will be charged. The agreement will be created without Stripe integration.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Review & Send (Agreement workflow) */}
              {currentStep === 4 && proposalData.type === "agreement" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Review White Label Agreement
                      </CardTitle>
                      <CardDescription>
                        Review all details before sending for signature
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Client Information Summary */}
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <h4 className="font-medium">Client Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Client Name</p>
                            <p className="font-medium">{proposalData.clientName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Address</p>
                            <p className="font-medium">
                              {proposalData.clientAddress ? `${proposalData.clientAddress}, ${proposalData.clientCity || ""}, ${proposalData.clientState || ""} ${proposalData.clientZip || ""}` : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Service Terms Summary */}
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <h4 className="font-medium">Service Terms</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{proposalData.startDate || "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Billing Period</p>
                            <p className="font-medium capitalize">{proposalData.billingPeriod || "Monthly"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Service Description</p>
                            <p className="font-medium">{proposalData.serviceDescription || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Application</p>
                            <p className="font-medium">{proposalData.applicationDescription || "Not specified"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      {proposalData.hostingEnabled && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
                          <h4 className="font-medium text-green-800">Payment Configuration</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-green-700">Monthly Fee</p>
                              <p className="font-medium text-green-800">${proposalData.monthlyFee?.toLocaleString() || "0"}</p>
                            </div>
                            <div>
                              <p className="text-green-700">Annual Value</p>
                              <p className="font-medium text-green-800">${((proposalData.monthlyFee || 0) * 12).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-green-700">Payment Method</p>
                              <p className="font-medium text-green-800">Stripe Recurring</p>
                            </div>
                            <div>
                              <p className="text-green-700">Billing Date</p>
                              <p className="font-medium text-green-800">1st of each month</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Template Info */}
                      {selectedTemplate && (
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Template</p>
                          <p className="font-medium">{selectedTemplate.name}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Signer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Signer Information
                      </CardTitle>
                      <CardDescription>
                        Enter the email address of the person who will sign this agreement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Signer Email *</Label>
                        <Input
                          type="email"
                          placeholder="e.g., john.smith@company.com"
                          value={ndaSignerEmail}
                          onChange={(e) => setNdaSignerEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Signer Name *</Label>
                        <Input
                          placeholder="e.g., John Smith"
                          value={ndaSignerName}
                          onChange={(e) => setNdaSignerName(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Send Button */}
                  <Card className="border-primary">
                    <CardContent className="pt-6">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={sendAgreementForSignature}
                        disabled={isSendingNda || !ndaSignerEmail || !ndaSignerName || !proposalData.name || !proposalData.clientName}
                      >
                        {isSendingNda ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Agreement for Signature
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground mt-2">
                        The agreement will be sent for electronic signature. Once signed by the client, 
                        it will be countersigned by Nelinia Varenas.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ==================== END AGREEMENT WORKFLOW ==================== */}

              {/* Step 2: Deep Research (OEM) or Entities (Standard) */}
              {currentStep === 2 && proposalData.type === "oem_supplier_readiness" && (
                <div className="space-y-6">
                  {/* Website Research */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Website Research
                      </CardTitle>
                      <CardDescription>
                        Add supplier and OEM websites to crawl for capabilities, certifications, and business information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://company-website.com"
                          value={newWebsiteUrl}
                          onChange={(e) => setNewWebsiteUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addResearchWebsite()}
                        />
                        <Button onClick={addResearchWebsite}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Website
                        </Button>
                      </div>
                      
                      {researchWebsites.length > 0 && (
                        <div className="space-y-2">
                          {researchWebsites.map((site) => (
                            <div key={site.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{site.url}</span>
                                <Badge variant={site.status === "crawled" ? "default" : "secondary"}>
                                  {site.status}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeResearchWebsite(site.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Document Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileUp className="h-5 w-5" />
                        Research Documents
                      </CardTitle>
                      <CardDescription>
                        Upload meeting notes, company documents, RFPs, or any relevant files for analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">
                          PDF, Word, Excel, Text, Markdown, PowerPoint files supported
                        </p>
                        <label className="cursor-pointer">
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.csv,.ppt,.pptx"
                            className="hidden"
                            onChange={handleResearchFileUpload}
                          />
                          <Button asChild variant="outline">
                            <span><Upload className="mr-2 h-4 w-4" />Select Files</span>
                          </Button>
                        </label>
                      </div>
                      
                      {researchDocuments.length > 0 && (
                        <div className="space-y-2">
                          {researchDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(doc.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Badge variant={doc.analyzed ? "default" : "secondary"}>
                                  {doc.analyzed ? "Analyzed" : "Pending"}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeResearchDocument(doc.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Deep Research */}
                  <Card className="border-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI Deep Research Analysis
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Analyze all websites and documents to extract company capabilities, 
                            certifications, and OEM readiness assessment
                          </p>
                        </div>
                        <Button
                          size="lg"
                          onClick={runDeepResearch}
                          disabled={isRunningDeepResearch || (researchWebsites.length === 0 && researchDocuments.length === 0)}
                        >
                          {isRunningDeepResearch ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-5 w-5" />
                              Run Deep Research
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {isRunningDeepResearch && (
                        <div className="mt-4">
                          <Progress value={deepResearchProgress} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {deepResearchProgress < 30 && "Crawling websites..."}
                            {deepResearchProgress >= 30 && deepResearchProgress < 60 && "Analyzing documents..."}
                            {deepResearchProgress >= 60 && deepResearchProgress < 90 && "Generating insights..."}
                            {deepResearchProgress >= 90 && "Finalizing research..."}
                          </p>
                        </div>
                      )}
                      
                      {proposalData.deepResearchResult && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Deep research completed!</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            Found {proposalData.deepResearchResult.recommendations?.length || 0} recommendations. 
                            Review results in the Review step.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 2: Entities (Standard workflow) */}
              {currentStep === 2 && proposalData.type !== "oem_supplier_readiness" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Collaborating Organizations</h3>
                      <p className="text-sm text-muted-foreground">Add organizations involved in this proposal</p>
                    </div>
                    <Button onClick={addEntity}>
                      <Plus className="mr-2 h-4 w-4" />Add Organization
                    </Button>
                  </div>

                  {proposalData.collaboratingEntities?.map((entity, index) => (
                    <Card key={entity.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="outline">Organization {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProposalData({
                                ...proposalData,
                                collaboratingEntities: proposalData.collaboratingEntities?.filter((e) => e.id !== entity.id),
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input
                              value={entity.name}
                              onChange={(e) => {
                                const updated = proposalData.collaboratingEntities?.map((ent) =>
                                  ent.id === entity.id ? { ...ent, name: e.target.value } : ent
                                );
                                setProposalData({ ...proposalData, collaboratingEntities: updated });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                              value={entity.role}
                              onValueChange={(v) => {
                                const updated = proposalData.collaboratingEntities?.map((ent) =>
                                  ent.id === entity.id ? { ...ent, role: v as any } : ent
                                );
                                setProposalData({ ...proposalData, collaboratingEntities: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ENTITY_ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Name</Label>
                            <Input
                              value={entity.contactName}
                              onChange={(e) => {
                                const updated = proposalData.collaboratingEntities?.map((ent) =>
                                  ent.id === entity.id ? { ...ent, contactName: e.target.value } : ent
                                );
                                setProposalData({ ...proposalData, collaboratingEntities: updated });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Email</Label>
                            <Input
                              type="email"
                              value={entity.contactEmail}
                              onChange={(e) => {
                                const updated = proposalData.collaboratingEntities?.map((ent) =>
                                  ent.id === entity.id ? { ...ent, contactEmail: e.target.value } : ent
                                );
                                setProposalData({ ...proposalData, collaboratingEntities: updated });
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Description / Responsibilities</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const enhanced = await enhanceFieldDescription(
                                  entity.id,
                                  entity.description,
                                  'entity',
                                  { name: entity.name, role: entity.role }
                                );
                                if (enhanced) {
                                  const updated = proposalData.collaboratingEntities?.map((ent) =>
                                    ent.id === entity.id ? { ...ent, description: enhanced } : ent
                                  );
                                  setProposalData({ ...proposalData, collaboratingEntities: updated });
                                }
                              }}
                              disabled={enhancingFieldId === entity.id}
                            >
                              {enhancingFieldId === entity.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="mr-2 h-3 w-3" />
                              )}
                              Enhance with AI
                            </Button>
                          </div>
                          <Textarea
                            value={entity.description}
                            onChange={(e) => {
                              const updated = proposalData.collaboratingEntities?.map((ent) =>
                                ent.id === entity.id ? { ...ent, description: e.target.value } : ent
                              );
                              setProposalData({ ...proposalData, collaboratingEntities: updated });
                            }}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!proposalData.collaboratingEntities || proposalData.collaboratingEntities.length === 0) && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Building className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No organizations added yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 3: Data Collection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Data Collection Methods</h3>
                      <p className="text-sm text-muted-foreground">Define how data will be collected</p>
                    </div>
                    <Button onClick={addDataMethod}>
                      <Plus className="mr-2 h-4 w-4" />Add Method
                    </Button>
                  </div>

                  {proposalData.dataCollectionMethods?.map((method, index) => (
                    <Card key={method.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="outline">Method {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProposalData({
                                ...proposalData,
                                dataCollectionMethods: proposalData.dataCollectionMethods?.filter((m) => m.id !== method.id),
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Method Name</Label>
                            <Input
                              value={method.name}
                              onChange={(e) => {
                                const updated = proposalData.dataCollectionMethods?.map((m) =>
                                  m.id === method.id ? { ...m, name: e.target.value } : m
                                );
                                setProposalData({ ...proposalData, dataCollectionMethods: updated });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select
                              value={method.frequency}
                              onValueChange={(v) => {
                                const updated = proposalData.dataCollectionMethods?.map((m) =>
                                  m.id === method.id ? { ...m, frequency: v as any } : m
                                );
                                setProposalData({ ...proposalData, dataCollectionMethods: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COLLECTION_FREQUENCIES.map((freq) => (
                                  <SelectItem key={freq.value} value={freq.value}>
                                    {freq.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Description</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const enhanced = await enhanceFieldDescription(
                                  method.id,
                                  method.description,
                                  'method',
                                  { name: method.name, frequency: method.frequency }
                                );
                                if (enhanced) {
                                  const updated = proposalData.dataCollectionMethods?.map((m) =>
                                    m.id === method.id ? { ...m, description: enhanced } : m
                                  );
                                  setProposalData({ ...proposalData, dataCollectionMethods: updated });
                                }
                              }}
                              disabled={enhancingFieldId === method.id}
                            >
                              {enhancingFieldId === method.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="mr-2 h-3 w-3" />
                              )}
                              Enhance with AI
                            </Button>
                          </div>
                          <Textarea
                            value={method.description}
                            onChange={(e) => {
                              const updated = proposalData.dataCollectionMethods?.map((m) =>
                                m.id === method.id ? { ...m, description: e.target.value } : m
                              );
                              setProposalData({ ...proposalData, dataCollectionMethods: updated });
                            }}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!proposalData.dataCollectionMethods || proposalData.dataCollectionMethods.length === 0) && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No data collection methods added yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 4: Milestones */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Project Milestones</h3>
                      <p className="text-sm text-muted-foreground">Define key project milestones and timeline</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={generateMilestones}
                        disabled={isGeneratingMilestones}
                      >
                        {isGeneratingMilestones ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        AI Generate Milestones
                      </Button>
                      <Button onClick={addMilestone}>
                        <Plus className="mr-2 h-4 w-4" />Add Milestone
                      </Button>
                    </div>
                  </div>

                  {proposalData.projectMilestones?.map((milestone, index) => (
                    <Card key={milestone.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="outline">Milestone {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProposalData({
                                ...proposalData,
                                projectMilestones: proposalData.projectMilestones?.filter((m) => m.id !== milestone.id),
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Milestone Name</Label>
                            <Input
                              value={milestone.name}
                              onChange={(e) => {
                                const updated = proposalData.projectMilestones?.map((m) =>
                                  m.id === milestone.id ? { ...m, name: e.target.value } : m
                                );
                                setProposalData({ ...proposalData, projectMilestones: updated });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => {
                                const updated = proposalData.projectMilestones?.map((m) =>
                                  m.id === milestone.id ? { ...m, dueDate: e.target.value } : m
                                );
                                setProposalData({ ...proposalData, projectMilestones: updated });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={milestone.status}
                              onValueChange={(v) => {
                                const updated = proposalData.projectMilestones?.map((m) =>
                                  m.id === milestone.id ? { ...m, status: v as any } : m
                                );
                                setProposalData({ ...proposalData, projectMilestones: updated });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MILESTONE_STATUSES.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Description</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const enhanced = await enhanceFieldDescription(
                                  milestone.id,
                                  milestone.description,
                                  'milestone',
                                  { name: milestone.name }
                                );
                                if (enhanced) {
                                  const updated = proposalData.projectMilestones?.map((m) =>
                                    m.id === milestone.id ? { ...m, description: enhanced } : m
                                  );
                                  setProposalData({ ...proposalData, projectMilestones: updated });
                                }
                              }}
                              disabled={enhancingFieldId === milestone.id}
                            >
                              {enhancingFieldId === milestone.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="mr-2 h-3 w-3" />
                              )}
                              Enhance with AI
                            </Button>
                          </div>
                          <Textarea
                            value={milestone.description}
                            onChange={(e) => {
                              const updated = proposalData.projectMilestones?.map((m) =>
                                m.id === milestone.id ? { ...m, description: e.target.value } : m
                              );
                              setProposalData({ ...proposalData, projectMilestones: updated });
                            }}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!proposalData.projectMilestones || proposalData.projectMilestones.length === 0) && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Target className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No milestones added yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Proposal Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Name</Label>
                          <p className="font-medium">{proposalData.name || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Type</Label>
                          <p className="font-medium">
                            {PROPOSAL_TYPES.find((t) => t.value === proposalData.type)?.label}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Funding Source</Label>
                          <p className="font-medium">{proposalData.fundingSource || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Total Budget</Label>
                          <p className="font-medium">${proposalData.totalBudget?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Start Date</Label>
                          <p className="font-medium">{proposalData.startDate || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">End Date</Label>
                          <p className="font-medium">{proposalData.endDate || "Not specified"}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="font-medium">{proposalData.description || "Not specified"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-5 w-5 text-primary" />
                          <span className="font-medium">Organizations</span>
                        </div>
                        <p className="text-2xl font-bold">{proposalData.collaboratingEntities?.length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          <span className="font-medium">Data Methods</span>
                        </div>
                        <p className="text-2xl font-bold">{proposalData.dataCollectionMethods?.length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-primary" />
                          <span className="font-medium">Milestones</span>
                        </div>
                        <p className="text-2xl font-bold">{proposalData.projectMilestones?.length || 0}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {analysisResult && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">AI Analysis Complete</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Document analyzed and data auto-populated. Review and adjust as needed.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 6: Affiliates (OEM) or Forms (Standard) */}
              {currentStep === 6 && proposalData.type === "oem_supplier_readiness" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Affiliate Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        AI-recommended affiliates to assist with OEM Supplier Readiness deliverables
                      </p>
                    </div>
                  </div>

                  {affiliateRecommendations.length > 0 ? (
                    <div className="space-y-4">
                      {affiliateRecommendations.map((affiliate) => (
                        <Card key={affiliate.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Users className="h-5 w-5 text-primary" />
                                  <h4 className="font-semibold">{affiliate.affiliateName}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Deliverable</p>
                                    <p className="font-medium">{affiliate.deliverable}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Capability</p>
                                    <p className="font-medium">{affiliate.capability}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-sm">Rationale</p>
                                  <p className="text-sm">{affiliate.rationale}</p>
                                </div>
                                {affiliate.estimatedCost && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      Est. Cost: {affiliate.estimatedCost}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Contact
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No affiliate recommendations yet</p>
                        <p className="text-sm text-muted-foreground">
                          Run Deep Research in Step 2 to generate recommendations
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 6: Forms (Standard workflow) - Skip for Agreement */}
              {currentStep === 6 && proposalData.type !== "oem_supplier_readiness" && proposalData.type !== "agreement" && proposalData.type !== "mou" && proposalData.type !== "contract" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Generated Forms</h3>
                      <p className="text-sm text-muted-foreground">Forms auto-generated from data collection methods</p>
                    </div>
                  </div>

                  {proposalData.formTemplates?.map((form, index) => (
                    <Card key={form.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{form.name}</CardTitle>
                          <Badge>{FORM_PURPOSES.find((p) => p.value === form.purpose)?.label}</Badge>
                        </div>
                        <CardDescription>{form.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Fields ({form.sections?.[0]?.fields?.length || 0})</Label>
                          <div className="flex flex-wrap gap-2">
                            {form.sections?.[0]?.fields?.map((field) => (
                              <Badge key={field.id} variant="outline">
                                {field.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!proposalData.formTemplates || proposalData.formTemplates.length === 0) && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No forms generated yet</p>
                        <p className="text-sm text-muted-foreground">Add data collection methods to auto-generate forms</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 7: Presentation (OEM) or Dashboard (Standard) */}
              {currentStep === 7 && proposalData.type === "oem_supplier_readiness" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">McKinsey-Style Slide Deck</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate a professional presentation using the MOVIE framework
                      </p>
                    </div>
                    <Button onClick={generateSlideDeck} disabled={isGeneratingSlides}>
                      {isGeneratingSlides ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Presentation className="mr-2 h-4 w-4" />
                          Generate Slides
                        </>
                      )}
                    </Button>
                  </div>

                  {/* MOVIE Framework Info */}
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">McKinsey MOVIE Framework</p>
                          <ul className="text-sm text-amber-700 mt-2 space-y-1">
                            <li><strong>M</strong>essage - Lead with the key insight in the title</li>
                            <li><strong>O</strong>rganize - Group supporting data into 2-3 categories</li>
                            <li><strong>V</strong>isualize - Turn data into charts and visuals</li>
                            <li><strong>I</strong>nsight - Call out the key takeaway with highlights</li>
                            <li><strong>E</strong>xtras - Align text, polish formatting</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Slide Preview */}
                  {slides.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Slide Preview</CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                              disabled={currentSlideIndex === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                              {currentSlideIndex + 1} / {slides.length}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                              disabled={currentSlideIndex === slides.length - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-[300px]">
                          <div className="space-y-4">
                            <h2 className="text-2xl font-bold">{slides[currentSlideIndex]?.title}</h2>
                            {slides[currentSlideIndex]?.insight && (
                              <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                                <p className="text-amber-300 font-medium">
                                  {slides[currentSlideIndex]?.insightHighlight && (
                                    <span className="text-amber-400 font-bold mr-2">
                                      {slides[currentSlideIndex].insightHighlight}
                                    </span>
                                  )}
                                  {slides[currentSlideIndex]?.insight}
                                </p>
                              </div>
                            )}
                            {slides[currentSlideIndex]?.content && (
                              <p className="text-slate-300">{slides[currentSlideIndex].content}</p>
                            )}
                            {slides[currentSlideIndex]?.bullets && (
                              <ul className="space-y-2">
                                {slides[currentSlideIndex].bullets?.map((bullet, i) => (
                                  <li key={i} className="flex items-start gap-2 text-slate-300">
                                    <span className="text-amber-400">•</span>
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                        {slides[currentSlideIndex]?.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            Speaker notes: {slides[currentSlideIndex].notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Presentation className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No slides generated yet</p>
                        <p className="text-sm text-muted-foreground">
                          Click &quot;Generate Slides&quot; to create a McKinsey-style presentation
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Export Options */}
                  {slides.length > 0 && (
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={exportAsPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                      </Button>
                      <Button variant="outline" onClick={exportAsMarkdown}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export as Markdown
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 7: Dashboard (Standard workflow) - Skip for Agreement */}
              {currentStep === 7 && proposalData.type !== "oem_supplier_readiness" && proposalData.type !== "agreement" && proposalData.type !== "mou" && proposalData.type !== "contract" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Dashboard Configuration</h3>
                      <p className="text-sm text-muted-foreground">AI-generated metrics and visualizations</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {proposalData.dashboardMetrics?.map((metric) => (
                      <Card key={metric.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{metric.name}</span>
                            <Badge variant="outline">{metric.visualization}</Badge>
                          </div>
                          <p className="text-2xl font-bold">
                            {metric.unit === "$" && "$"}
                            {metric.value}
                            {metric.unit === "%" && "%"}
                          </p>
                          {metric.target && (
                            <p className="text-sm text-muted-foreground">
                              Target: {metric.target}{metric.unit}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {(!proposalData.dashboardMetrics || proposalData.dashboardMetrics.length === 0) && (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No dashboard metrics configured</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 8: Export & Submission */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  {/* Export Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Options</CardTitle>
                      <CardDescription>Generate and export your proposal documents</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex-col" onClick={exportAsMarkdown}>
                          <FileText className="h-8 w-8 mb-2" />
                          <span>Export as Markdown</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col" onClick={exportAsPDF}>
                          <Download className="h-8 w-8 mb-2" />
                          <span>Export as PDF</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit for Consideration */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-600" />
                        Submit for Consideration
                      </CardTitle>
                      <CardDescription>
                        Submit this proposal for review. This will record the submission timestamp and submitter.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Proposal Name</p>
                            <p className="font-medium">{proposalData.name || "Untitled"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium">{PROPOSAL_TYPES.find(t => t.value === proposalData.type)?.label || proposalData.type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submitter</p>
                            <p className="font-medium">{getDisplayName()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submission Time</p>
                            <p className="font-medium">{new Date().toLocaleString()}</p>
                          </div>
                          {proposalData.type === "grant" && proposalData.grantAmount && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Grant Amount Requested</p>
                                <p className="font-medium text-green-700">${proposalData.grantAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Granting Organization</p>
                                <p className="font-medium">{proposalData.grantingOrganization || "Not specified"}</p>
                              </div>
                            </>
                          )}
                          {proposalData.type === "oem_supplier_readiness" && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Supplier</p>
                                <p className="font-medium">{proposalData.supplierName || "Not specified"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Target OEM</p>
                                <p className="font-medium">{proposalData.targetOEM || "Not specified"}</p>
                              </div>
                              {slides.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Slide Deck</p>
                                  <p className="font-medium text-blue-700">{slides.length} slides generated</p>
                                </div>
                              )}
                              {affiliateRecommendations.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Affiliate Partners</p>
                                  <p className="font-medium">{affiliateRecommendations.length} recommended</p>
                                </div>
                              )}
                            </>
                          )}
                          {(proposalData.totalBudget ?? 0) > 0 && (
                            <div>
                              <p className="text-muted-foreground">Total Budget</p>
                              <p className="font-medium">${(proposalData.totalBudget ?? 0).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={submitProposal} 
                        disabled={isSubmitting || !proposalData.name}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Proposal
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Create Project */}
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Create Project
                      </CardTitle>
                      <CardDescription>
                        Convert this proposal to a project for tracking. This will create a new project with milestones and deliverables.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-sm">
                        <p className="text-purple-700">
                          Creating a project will:
                        </p>
                        <ul className="mt-2 space-y-1 text-purple-600 list-disc list-inside">
                          <li>Create a new project in the Projects section</li>
                          <li>Import milestones from this proposal</li>
                          <li>Link the proposal to the project for reference</li>
                          <li>Enable tracking and reporting on deliverables</li>
                        </ul>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={createProjectFromProposal} 
                        disabled={isCreatingProject || !proposalData.name}
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        {isCreatingProject ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Project...
                          </>
                        ) : (
                          <>
                            <Target className="mr-2 h-4 w-4" />
                            Create Project from Proposal
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Ready to Save */}
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-green-700">Ready to Save</h3>
                          <p className="text-sm text-green-600">
                            Your proposal is complete. Save as draft, submit for consideration, or create a project.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer Navigation */}
          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowWizard(false)}>
                  Cancel
                </Button>
                {currentStep === activeWizardSteps.length ? (
                  <Button onClick={saveProposal}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Proposal
                  </Button>
                ) : (
                  <Button onClick={nextStep}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Proposal Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="!max-w-[800px] !w-[800px] !h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Proposal Preview
            </DialogTitle>
            <DialogDescription>
              {previewProposal?.name || "Proposal"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {previewProposal && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{previewProposal.name}</h2>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">
                      {PROPOSAL_TYPES.find(t => t.value === previewProposal.type)?.label}
                    </Badge>
                    {getStatusBadge(previewProposal.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Funding Source</p>
                    <p className="font-medium">{previewProposal.fundingSource || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference Number</p>
                    <p className="font-medium">{previewProposal.referenceNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="font-medium">${(previewProposal.totalBudget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(previewProposal.createdAt).toLocaleDateString()}</p>
                  </div>
                  {previewProposal.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{previewProposal.startDate}</p>
                    </div>
                  )}
                  {previewProposal.endDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">{previewProposal.endDate}</p>
                    </div>
                  )}
                </div>

                {previewProposal.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{previewProposal.description}</p>
                  </div>
                )}

                {previewProposal.type === "grant" && (previewProposal.grantAmount || previewProposal.grantingOrganization) && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Grant Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {previewProposal.grantAmount && (
                        <div>
                          <p className="text-green-600">Amount Requested</p>
                          <p className="font-medium text-green-800">${previewProposal.grantAmount.toLocaleString()}</p>
                        </div>
                      )}
                      {previewProposal.grantingOrganization && (
                        <div>
                          <p className="text-green-600">Granting Organization</p>
                          <p className="font-medium text-green-800">{previewProposal.grantingOrganization}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {previewProposal.collaboratingEntities?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Collaborating Entities</h3>
                    <div className="space-y-2">
                      {previewProposal.collaboratingEntities.map((entity, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium">{entity.name}</p>
                          <p className="text-sm text-muted-foreground">Role: {entity.role}</p>
                          {entity.description && <p className="text-sm mt-1">{entity.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewProposal.projectMilestones?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Project Milestones</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Milestone</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewProposal.projectMilestones.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell>{m.dueDate || "TBD"}</TableCell>
                            <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {previewProposal.dataCollectionMethods?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Data Collection Methods</h3>
                    <div className="space-y-2">
                      {previewProposal.dataCollectionMethods.map((m, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium">{m.name} <span className="text-sm text-muted-foreground">({m.frequency})</span></p>
                          <p className="text-sm text-muted-foreground">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewProposal.entityRelationshipNotes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Entity Relationship Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{previewProposal.entityRelationshipNotes}</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="border-t pt-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => previewProposal && downloadProposal(previewProposal)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={() => { if (previewProposal) { openEmailDialog(previewProposal); setShowPreviewDialog(false); } }}>
                <Send className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" onClick={() => { if (previewProposal) { editProposal(previewProposal); setShowPreviewDialog(false); } }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => setShowPreviewDialog(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send for Signature Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="!max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Send for Electronic Signature
            </DialogTitle>
            <DialogDescription>
              Send &quot;{previewProposal?.name}&quot; for review and e-signature
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-700">
                <li>Recipient receives an email with a secure signing link</li>
                <li>They review the full document and sign electronically</li>
                <li>Both parties receive a signed PDF copy via email</li>
                <li>The signed document is stored in the system</li>
              </ol>
            </div>
            <div className="space-y-2">
              <Label>Recipient Email *</Label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Personal Message (optional)</Label>
              <Textarea
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a personal note to the recipient..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={sendProposalEmail}
              disabled={isSendingEmail || !emailRecipient}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Send for Signature
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
