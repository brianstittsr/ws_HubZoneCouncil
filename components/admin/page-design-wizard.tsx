"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Check, Plus, RefreshCw, Sparkles, X, Image as ImageIcon,
  ShoppingCart, Target, Users, Heart, Briefcase, GraduationCap,
  Zap, MessageSquare, BarChart, Star, HelpCircle, Phone, 
  Layout, Palette, Type, ArrowRight, ExternalLink, CreditCard
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Wizard step icons for the progress bar
const STEP_ICONS = [
  { icon: Sparkles, label: "Mode" },
  { icon: Target, label: "Goal" },
  { icon: Users, label: "Audience" },
  { icon: Palette, label: "Style" },
  { icon: Layout, label: "Sections" },
  { icon: Type, label: "Content" },
  { icon: Check, label: "Review" },
];

// Page goals/purposes
const PAGE_GOALS = [
  { id: "generate-leads", name: "Generate Leads", description: "Capture contact information from visitors", icon: ShoppingCart },
  { id: "drive-sales", name: "Drive Sales", description: "Convert visitors into customers", icon: Target },
  { id: "educate-visitors", name: "Educate Visitors", description: "Inform and build trust with content", icon: GraduationCap },
  { id: "build-brand", name: "Build Brand", description: "Establish credibility and awareness", icon: Heart },
  { id: "recruit-talent", name: "Recruit Talent", description: "Attract potential team members", icon: Briefcase },
  { id: "engage-community", name: "Engage Community", description: "Foster connection and interaction", icon: Users },
];

// Target audiences
const TARGET_AUDIENCES = [
  { id: "business-owners", name: "Business Owners", description: "Entrepreneurs and company leaders" },
  { id: "c-suite", name: "C-Suite Executives", description: "CEOs, CFOs, COOs" },
  { id: "managers", name: "Managers", description: "Team leads and department heads" },
  { id: "startup-founders", name: "Startup Founders", description: "Early-stage entrepreneurs" },
  { id: "established-businesses", name: "Established Businesses", description: "Companies 5+ years old" },
  { id: "family-businesses", name: "Family Businesses", description: "Multi-generational companies" },
];

// Tone options
const TONE_OPTIONS = [
  { id: "professional", name: "Professional", description: "Formal and authoritative" },
  { id: "friendly", name: "Friendly", description: "Warm and approachable" },
  { id: "bold", name: "Bold", description: "Confident and impactful" },
  { id: "inspiring", name: "Inspiring", description: "Motivational and uplifting" },
];

// Color schemes
const COLOR_SCHEMES = [
  { id: "brand", name: "Brand Colors", description: "Amber & Slate (default)" },
  { id: "warm", name: "Warm Tones", description: "Oranges and reds" },
  { id: "cool", name: "Cool Tones", description: "Blues and greens" },
  { id: "neutral", name: "Neutral", description: "Grays and whites" },
];

// Layout styles
const LAYOUT_STYLES = [
  { id: "modern", name: "Modern", description: "Clean lines, lots of whitespace" },
  { id: "classic", name: "Classic", description: "Traditional, structured layout" },
  { id: "dynamic", name: "Dynamic", description: "Asymmetric, engaging design" },
  { id: "minimal", name: "Minimal", description: "Simple, focused content" },
];

// Page sections
const PAGE_SECTIONS = [
  { id: "hero", name: "Hero Section", description: "Main headline and call-to-action", icon: Zap },
  { id: "features", name: "Features", description: "Key benefits or services", icon: Star },
  { id: "testimonials", name: "Testimonials", description: "Customer reviews and quotes", icon: MessageSquare },
  { id: "statistics", name: "Statistics", description: "Impressive numbers and metrics", icon: BarChart },
  { id: "cta", name: "Call to Action", description: "Conversion-focused section", icon: Target },
  { id: "faq", name: "FAQ", description: "Common questions answered", icon: HelpCircle },
  { id: "team", name: "Team", description: "Team member profiles", icon: Users },
  { id: "pricing", name: "Pricing", description: "Plans and pricing tables", icon: ShoppingCart },
  { id: "contact", name: "Contact", description: "Contact form or information", icon: Phone },
  { id: "gallery", name: "Gallery", description: "Image or video showcase", icon: ImageIcon },
];

// All application pages for "Update Existing" mode
const ALL_APP_PAGES = [
  { id: "home", name: "Home Page", path: "/" },
  { id: "about", name: "About", path: "/about" },
  { id: "leadership", name: "Leadership", path: "/leadership" },
  { id: "contact", name: "Contact", path: "/contact" },
  { id: "affiliates", name: "Affiliates", path: "/affiliates" },
  { id: "company", name: "Company", path: "/company" },
  { id: "oem", name: "OEM Services", path: "/oem" },
  { id: "v-edge", name: "V-Edge", path: "/v-edge" },
  { id: "antifragile", name: "Antifragile", path: "/antifragile" },
  { id: "portal-dashboard", name: "Portal Dashboard", path: "/portal" },
  { id: "networking", name: "Networking", path: "/portal/networking" },
  { id: "opportunities", name: "Opportunities", path: "/portal/opportunities" },
];

interface WizardData {
  mode: "create" | "update";
  targetPage: string;
  goal: string;
  audiences: string[];
  tone: string;
  colorScheme: string;
  layoutStyle: string;
  sections: string[];
  headline: string;
  subheadline: string;
  existingContent: string;
  aiRewordedContent: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  selectedImages: string[];
  buttons: { id: string; text: string; link: string; type: string; variant: string }[];
}

interface PageDesignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: WizardData) => void;
}

export function PageDesignWizard({ open, onOpenChange, onComplete }: PageDesignWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    mode: "create",
    targetPage: "",
    goal: "",
    audiences: [],
    tone: "professional",
    colorScheme: "brand",
    layoutStyle: "modern",
    sections: [],
    headline: "",
    subheadline: "",
    existingContent: "",
    aiRewordedContent: "",
    primaryCtaText: "Get Started",
    primaryCtaLink: "/contact",
    secondaryCtaText: "",
    secondaryCtaLink: "",
    selectedImages: [],
    buttons: [],
  });
  
  const [availableImages, setAvailableImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [isRewordingContent, setIsRewordingContent] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Fetch images from Firestore
  useEffect(() => {
    const fetchImages = async () => {
      if (!db) return;
      try {
        const imagesRef = collection(db, "image_assets");
        const snapshot = await getDocs(imagesRef);
        const images = snapshot.docs.map(doc => ({
          id: doc.id,
          url: doc.data().url || doc.data().base64 || "",
          name: doc.data().name || doc.id,
        }));
        setAvailableImages(images);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    if (open) fetchImages();
  }, [open]);

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleAudience = (audienceId: string) => {
    setData(prev => ({
      ...prev,
      audiences: prev.audiences.includes(audienceId)
        ? prev.audiences.filter(a => a !== audienceId)
        : [...prev.audiences, audienceId]
    }));
  };

  const toggleSection = (sectionId: string) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const toggleImage = (imageId: string) => {
    setData(prev => ({
      ...prev,
      selectedImages: prev.selectedImages.includes(imageId)
        ? prev.selectedImages.filter(i => i !== imageId)
        : [...prev.selectedImages, imageId]
    }));
  };

  const addButton = () => {
    const newButton = {
      id: `btn-${Date.now()}`,
      text: "Click Here",
      link: "/contact",
      type: "navigation",
      variant: "default",
    };
    setData(prev => ({ ...prev, buttons: [...prev.buttons, newButton] }));
  };

  const updateButton = (id: string, updates: Partial<typeof data.buttons[0]>) => {
    setData(prev => ({
      ...prev,
      buttons: prev.buttons.map(btn => btn.id === id ? { ...btn, ...updates } : btn)
    }));
  };

  const removeButton = (id: string) => {
    setData(prev => ({ ...prev, buttons: prev.buttons.filter(btn => btn.id !== id) }));
  };

  const rewordContent = async () => {
    if (!data.existingContent.trim()) return;
    setIsRewordingContent(true);
    
    // Simulate AI rewording (in production, call actual AI API)
    setTimeout(() => {
      const reworded = `[AI Enhanced Version]\n\n${data.existingContent}\n\n[Optimized for ${data.goal} targeting ${data.audiences.join(", ")} with a ${data.tone} tone]`;
      updateData({ aiRewordedContent: reworded });
      setIsRewordingContent(false);
    }, 1500);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.mode === "create" || (data.mode === "update" && data.targetPage);
      case 1: return !!data.goal;
      case 2: return data.audiences.length > 0;
      case 3: return true; // Style has defaults
      case 4: return data.sections.length >= 2;
      case 5: return !!data.headline;
      case 6: return true; // Review step
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      onComplete(data);
      resetWizard();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onOpenChange(false);
    }
  };

  const resetWizard = () => {
    setStep(0);
    setData({
      mode: "create",
      targetPage: "",
      goal: "",
      audiences: [],
      tone: "professional",
      colorScheme: "brand",
      layoutStyle: "modern",
      sections: [],
      headline: "",
      subheadline: "",
      existingContent: "",
      aiRewordedContent: "",
      primaryCtaText: "Get Started",
      primaryCtaLink: "/contact",
      secondaryCtaText: "",
      secondaryCtaLink: "",
      selectedImages: [],
      buttons: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <DialogTitle>Page Design Wizard</DialogTitle>
          </div>
          <p className="text-sm text-gray-500">Step {step + 1} of 7</p>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {STEP_ICONS.map((s, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  index < step 
                    ? "bg-amber-500 text-white" 
                    : index === step 
                      ? "bg-amber-500 text-white ring-4 ring-amber-100" 
                      : "bg-gray-200 text-gray-500"
                }`}>
                  {index < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                {index < 6 && (
                  <div className={`w-12 h-1 mx-1 rounded ${index < step ? "bg-amber-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {/* Step 0: Mode Selection */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">What would you like to do?</h2>
                <p className="text-gray-500 mt-2">Choose whether to create a new page design or update an existing one</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div
                  onClick={() => updateData({ mode: "create" })}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all text-center ${
                    data.mode === "create" 
                      ? "border-amber-500 bg-amber-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    data.mode === "create" ? "bg-amber-100" : "bg-gray-100"
                  }`}>
                    <Plus className={`w-8 h-8 ${data.mode === "create" ? "text-amber-600" : "text-gray-400"}`} />
                  </div>
                  <h3 className="font-semibold text-lg">Create New Design</h3>
                  <p className="text-sm text-gray-500 mt-2">Start fresh with a guided design process</p>
                </div>
                
                <div
                  onClick={() => updateData({ mode: "update" })}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all text-center ${
                    data.mode === "update" 
                      ? "border-amber-500 bg-amber-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    data.mode === "update" ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <RefreshCw className={`w-8 h-8 ${data.mode === "update" ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                  <h3 className="font-semibold text-lg">Update Existing Page</h3>
                  <p className="text-sm text-gray-500 mt-2">Redesign an existing public page</p>
                </div>
              </div>

              {data.mode === "update" && (
                <div className="max-w-md mx-auto mt-6">
                  <Label>Select Page to Update</Label>
                  <Select value={data.targetPage} onValueChange={(v) => updateData({ targetPage: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a page..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_APP_PAGES.map(page => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.name} ({page.path})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Page Goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">What's the primary goal of this page?</h2>
                <p className="text-gray-500 mt-2">This helps us optimize the design for your objective</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                {PAGE_GOALS.map(goal => (
                  <div
                    key={goal.id}
                    onClick={() => updateData({ goal: goal.id })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      data.goal === goal.id 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg mb-3 flex items-center justify-center ${
                      data.goal === goal.id ? "bg-amber-100" : "bg-gray-100"
                    }`}>
                      <goal.icon className={`w-6 h-6 ${data.goal === goal.id ? "text-amber-600" : "text-gray-500"}`} />
                    </div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Who is your target audience?</h2>
                <p className="text-gray-500 mt-2">Select all that apply - this shapes the messaging and tone</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                {TARGET_AUDIENCES.map(audience => (
                  <div
                    key={audience.id}
                    onClick={() => toggleAudience(audience.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      data.audiences.includes(audience.id) 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-semibold">{audience.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{audience.description}</p>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-sm text-gray-500">
                Selected: {data.audiences.length} audience{data.audiences.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Step 3: Visual Style */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Define your visual style</h2>
                <p className="text-gray-500 mt-2">Choose the look and feel that matches your brand</p>
              </div>
              
              {/* Tone & Voice */}
              <div>
                <h3 className="font-semibold mb-3">Tone & Voice</h3>
                <div className="grid grid-cols-4 gap-3">
                  {TONE_OPTIONS.map(tone => (
                    <div
                      key={tone.id}
                      onClick={() => updateData({ tone: tone.id })}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                        data.tone === tone.id 
                          ? "border-amber-500 bg-amber-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h4 className="font-medium">{tone.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{tone.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <h3 className="font-semibold mb-3">Color Scheme</h3>
                <div className="grid grid-cols-4 gap-3">
                  {COLOR_SCHEMES.map(scheme => (
                    <div
                      key={scheme.id}
                      onClick={() => updateData({ colorScheme: scheme.id })}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                        data.colorScheme === scheme.id 
                          ? "border-amber-500 bg-amber-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h4 className="font-medium">{scheme.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{scheme.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layout Style */}
              <div>
                <h3 className="font-semibold mb-3">Layout Style</h3>
                <div className="grid grid-cols-4 gap-3">
                  {LAYOUT_STYLES.map(layout => (
                    <div
                      key={layout.id}
                      onClick={() => updateData({ layoutStyle: layout.id })}
                      className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                        data.layoutStyle === layout.id 
                          ? "border-amber-500 bg-amber-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h4 className="font-medium">{layout.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{layout.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Page Sections */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Choose your page sections</h2>
                <p className="text-gray-500 mt-2">Select the sections you want to include (minimum 2)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                {PAGE_SECTIONS.map(section => (
                  <div
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${
                      data.sections.includes(section.id) 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      data.sections.includes(section.id) ? "bg-amber-100" : "bg-gray-100"
                    }`}>
                      <section.icon className={`w-6 h-6 ${
                        data.sections.includes(section.id) ? "text-amber-600" : "text-gray-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{section.name}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      data.sections.includes(section.id) 
                        ? "border-amber-500 bg-amber-500" 
                        : "border-gray-300"
                    }`}>
                      {data.sections.includes(section.id) && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-sm text-gray-500">
                Selected: {data.sections.length} section{data.sections.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Step 5: Content & Messaging */}
          {step === 5 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Define your key messaging</h2>
                <p className="text-gray-500 mt-2">AI will expand on these to create compelling content</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Main Headline *</Label>
                  <Input
                    value={data.headline}
                    onChange={(e) => updateData({ headline: e.target.value })}
                    placeholder="e.g., Build a Business That Thrives Beyond You"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">The primary message visitors will see</p>
                </div>
                
                <div>
                  <Label>Subheadline</Label>
                  <Textarea
                    value={data.subheadline}
                    onChange={(e) => updateData({ subheadline: e.target.value })}
                    placeholder="e.g., Join 500+ business owners who have transformed their companies with the G.R.O.W.S. framework"
                    rows={2}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">Supporting text that expands on the headline</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary CTA Text</Label>
                    <Input
                      value={data.primaryCtaText}
                      onChange={(e) => updateData({ primaryCtaText: e.target.value })}
                      placeholder="Get Started"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>CTA Link</Label>
                    <Input
                      value={data.primaryCtaLink}
                      onChange={(e) => updateData({ primaryCtaLink: e.target.value })}
                      placeholder="/contact"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-6">
                  <Label>Paste Existing Content (Optional)</Label>
                  <p className="text-xs text-gray-400 mb-2">Paste content you want AI to reword based on your selections</p>
                  <Textarea
                    value={data.existingContent}
                    onChange={(e) => updateData({ existingContent: e.target.value })}
                    placeholder="Paste your existing content here..."
                    rows={4}
                    className="mt-2"
                  />
                  {data.existingContent && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={rewordContent}
                      disabled={isRewordingContent}
                    >
                      {isRewordingContent ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Rewording...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Reword with AI
                        </>
                      )}
                    </Button>
                  )}
                  {data.aiRewordedContent && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">AI Reworded Content:</h4>
                      <p className="text-sm text-blue-700 whitespace-pre-wrap">{data.aiRewordedContent}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Review Your Design</h2>
                <p className="text-gray-500 mt-2">Confirm your choices before generating the page</p>
              </div>
              
              <div className="border rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Mode</p>
                    <p className="font-semibold">{data.mode === "create" ? "Create New Design" : "Update Existing Page"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Goal</p>
                    <p className="font-semibold">{PAGE_GOALS.find(g => g.id === data.goal)?.name || "-"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Target Audience</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.audiences.map(a => (
                        <Badge key={a} className="bg-blue-100 text-blue-700">
                          {TARGET_AUDIENCES.find(t => t.id === a)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Style</p>
                    <p className="font-semibold">
                      {TONE_OPTIONS.find(t => t.id === data.tone)?.name} • {LAYOUT_STYLES.find(l => l.id === data.layoutStyle)?.name}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Sections ({data.sections.length})</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.sections.map(s => (
                      <Badge key={s} variant="outline">
                        {PAGE_SECTIONS.find(sec => sec.id === s)?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Content Preview</p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold">{data.headline || "Your Headline"}</h3>
                    <p className="text-gray-600 mt-2">{data.subheadline || "Your subheadline"}</p>
                    <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                      {data.primaryCtaText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Image Selection */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">Selected Images ({data.selectedImages.length})</p>
                    <Button variant="outline" size="sm" onClick={() => setShowImagePicker(!showImagePicker)}>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {showImagePicker ? "Hide" : "Select"} Images
                    </Button>
                  </div>
                  
                  {showImagePicker && (
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                      {availableImages.map(img => (
                        <div
                          key={img.id}
                          onClick={() => toggleImage(img.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                            data.selectedImages.includes(img.id) ? "border-amber-500" : "border-transparent"
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          {data.selectedImages.includes(img.id) && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                              <Check className="w-6 h-6 text-amber-600" />
                            </div>
                          )}
                        </div>
                      ))}
                      {availableImages.length === 0 && (
                        <p className="col-span-4 text-center text-gray-500 py-4">No images available. Upload images in Image Manager.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Button Configuration */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">Additional Buttons ({data.buttons.length})</p>
                    <Button variant="outline" size="sm" onClick={addButton}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Button
                    </Button>
                  </div>
                  
                  {data.buttons.length > 0 && (
                    <div className="space-y-3">
                      {data.buttons.map(btn => (
                        <div key={btn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Input
                            value={btn.text}
                            onChange={(e) => updateButton(btn.id, { text: e.target.value })}
                            placeholder="Button text"
                            className="flex-1"
                          />
                          <Input
                            value={btn.link}
                            onChange={(e) => updateButton(btn.id, { link: e.target.value })}
                            placeholder="Link"
                            className="flex-1"
                          />
                          <Select value={btn.type} onValueChange={(v) => updateButton(btn.id, { type: v })}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="navigation">Navigation</SelectItem>
                              <SelectItem value="checkout">Checkout</SelectItem>
                              <SelectItem value="external">External</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => removeButton(btn.id)}>
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={handleBack}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!canProceed()}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {step === 6 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Design
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
