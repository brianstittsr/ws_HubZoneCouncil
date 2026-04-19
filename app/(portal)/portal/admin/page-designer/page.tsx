"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, MessageSquare, Layout, Send, Sparkles, CheckCircle, Eye, Plus, Trash2, Link, CreditCard, ExternalLink, FileText, Globe, Smartphone, Monitor, Tablet, Save, Image, Type, Square, MousePointer, Search, Lightbulb, ImagePlus, RefreshCw, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

interface PageSection { id: string; name: string; type: string; description: string; content?: string; title?: string; }
interface Page { id: string; name: string; path: string; category: string; sections: PageSection[]; }
interface PageElement { id: string; type: string; content: string; }
interface ButtonConfig { id: string; text: string; type: string; destination: string; variant: string; size: string; }
interface PageDesign { id: string; pageId: string; sections: PageSection[]; elements: PageElement[]; buttons: ButtonConfig[]; seoTitle: string; seoDescription: string; }
interface ChatMessage { id: string; role: string; content: string; timestamp: Date; image?: string; }
interface UXRec { id: string; type: string; title: string; description: string; fixId?: string; }

const ALL_PAGES: Page[] = [
  // Marketing Pages
  { id: "home", name: "Home Page", path: "/", category: "Marketing", sections: [
    { id: "hero-carousel", name: "Hero Carousel", type: "hero", description: "Main rotating banner with headlines and CTAs" },
    { id: "services-overview", name: "Services Overview", type: "features", description: "Grid of service offerings" },
    { id: "stats-section", name: "Stats Section", type: "stats", description: "Key metrics and achievements" },
    { id: "how-it-works", name: "How It Works", type: "process", description: "Step-by-step process explanation" },
    { id: "testimonials", name: "Testimonials", type: "testimonials", description: "Client testimonials and reviews" },
    { id: "cta-section", name: "CTA Section", type: "cta", description: "Call-to-action with contact button" },
  ]},
  { id: "about", name: "About Us", path: "/about", category: "Marketing", sections: [
    { id: "about-hero", name: "Hero Section", type: "hero", description: "About Strategic Value+ headline" },
    { id: "mission-vision", name: "Mission & Vision", type: "cards", description: "Mission and vision statements" },
    { id: "values", name: "Core Values", type: "features", description: "Results-Driven, Network Empowerment, Partnership, Excellence" },
    { id: "about-cta", name: "CTA Section", type: "cta", description: "Contact call-to-action" },
  ]},
  { id: "contact", name: "Contact", path: "/contact", category: "Marketing", sections: [
    { id: "contact-hero", name: "Hero Section", type: "hero", description: "Contact page headline" },
    { id: "contact-form", name: "Contact Form", type: "form", description: "Name, email, company, service interest, message" },
    { id: "contact-info", name: "Contact Information", type: "info", description: "Email, phone, address, hours" },
    { id: "book-call", name: "Book a Call", type: "cta", description: "Calendar booking integration" },
  ]},
  { id: "v-edge", name: "V+ EDGE Platform", path: "/v-edge", category: "Marketing", sections: [
    { id: "vedge-hero", name: "Hero Section", type: "hero", description: "V+ EDGE Modular Industry 4.0 Platform" },
    { id: "vedge-modules", name: "Modules", type: "tabs", description: "Lean, Automation, Quality, Digital, Workforce, Global modules" },
    { id: "vedge-benefits", name: "Benefits", type: "features", description: "Key benefits of V+ EDGE" },
    { id: "vedge-cta", name: "CTA Section", type: "cta", description: "Get started with V+ EDGE" },
  ]},
  { id: "leadership", name: "Leadership", path: "/leadership", category: "Marketing", sections: [
    { id: "leadership-hero", name: "Hero Section", type: "hero", description: "Meet Our Leadership Team" },
    { id: "leadership-grid", name: "Team Grid", type: "grid", description: "Leadership team member cards" },
  ]},
  { id: "company", name: "Company", path: "/company", category: "Marketing", sections: [
    { id: "company-hero", name: "Hero Section", type: "hero", description: "Company overview" },
    { id: "company-story", name: "Our Story", type: "text", description: "Company history and background" },
  ]},
  { id: "affiliates", name: "Affiliates", path: "/affiliates", category: "Marketing", sections: [
    { id: "affiliates-hero", name: "Hero Section", type: "hero", description: "Affiliate program overview" },
    { id: "affiliates-benefits", name: "Benefits", type: "features", description: "Affiliate program benefits" },
    { id: "affiliates-cta", name: "Join CTA", type: "cta", description: "Join affiliate program" },
  ]},
  { id: "oem", name: "OEM Services", path: "/oem", category: "Marketing", sections: [
    { id: "oem-hero", name: "Hero Section", type: "hero", description: "OEM supplier qualification" },
    { id: "oem-services", name: "Services", type: "features", description: "OEM qualification services" },
    { id: "oem-process", name: "Process", type: "process", description: "Qualification process steps" },
  ]},
  { id: "antifragile", name: "Antifragile", path: "/antifragile", category: "Marketing", sections: [
    { id: "antifragile-hero", name: "Hero Section", type: "hero", description: "Antifragile manufacturing" },
    { id: "antifragile-content", name: "Content", type: "text", description: "Antifragile methodology" },
  ]},
  // Portal Pages
  { id: "portal-dashboard", name: "Portal Dashboard", path: "/portal", category: "Portal", sections: [
    { id: "portal-welcome", name: "Welcome Section", type: "hero", description: "Welcome message and quick stats" },
    { id: "portal-widgets", name: "Dashboard Widgets", type: "grid", description: "Activity, tasks, calendar widgets" },
  ]},
  { id: "portal-calendar", name: "Calendar", path: "/portal/calendar", category: "Portal", sections: [
    { id: "calendar-view", name: "Calendar View", type: "calendar", description: "Full calendar with events" },
  ]},
  { id: "portal-affiliates", name: "Affiliates Portal", path: "/portal/affiliates", category: "Portal", sections: [
    { id: "affiliates-dashboard", name: "Dashboard", type: "dashboard", description: "Affiliate metrics and stats" },
  ]},
  // Admin Pages
  { id: "admin-hero", name: "Hero Management", path: "/portal/admin/hero", category: "Admin", sections: [
    { id: "hero-editor", name: "Hero Editor", type: "editor", description: "Edit hero carousel slides" },
  ]},
  { id: "admin-images", name: "Image Manager", path: "/portal/admin/images", category: "Admin", sections: [
    { id: "image-library", name: "Image Library", type: "gallery", description: "Upload and manage images" },
  ]},
  { id: "admin-team", name: "Team Members", path: "/portal/admin/team-members", category: "Admin", sections: [
    { id: "team-list", name: "Team List", type: "table", description: "Manage team members" },
  ]},
  { id: "admin-partners", name: "Strategic Partners", path: "/portal/admin/strategic-partners", category: "Admin", sections: [
    { id: "partners-list", name: "Partners List", type: "table", description: "Manage strategic partners" },
  ]},
];

const CATEGORIES = ["All", "Marketing", "Portal", "Admin"];
const ELEMENTS = [{ id: "heading", name: "Heading", icon: Type }, { id: "text", name: "Text", icon: FileText }, { id: "image", name: "Image", icon: Image }, { id: "button", name: "Button", icon: MousePointer }];
const BTN_TYPES = [{ id: "link", name: "External Link", icon: ExternalLink }, { id: "page", name: "Internal Page", icon: Link }, { id: "stripe", name: "Stripe", icon: CreditCard }];

export default function AIPageDesignerPage() {
  const [selectedPage, setSelectedPage] = useState<Page>(ALL_PAGES[0]);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [activeTab, setActiveTab] = useState("design");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pageDesign, setPageDesign] = useState<PageDesign>({ id: "", pageId: "", sections: [], elements: [], buttons: [], seoTitle: "", seoDescription: "" });
  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showUXDialog, setShowUXDialog] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [buttonConfig, setButtonConfig] = useState<ButtonConfig>({ id: "", text: "Click Here", type: "link", destination: "", variant: "default", size: "default" });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: "welcome", role: "assistant", content: "Hello! I am your AI Page Designer. Paste a screenshot (Ctrl+V) to design from an image!", timestamp: new Date() }]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uxRecs, setUxRecs] = useState<UXRec[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!db) return;
      try {
        const snap = await getDoc(doc(db, "page_designs", selectedPage.id));
        if (snap.exists()) setPageDesign(snap.data() as PageDesign);
        else setPageDesign({ id: selectedPage.id, pageId: selectedPage.id, sections: selectedPage.sections.map(s => ({ ...s, content: "", title: s.name })), elements: [], buttons: [], seoTitle: selectedPage.name, seoDescription: "" });
      } catch (e) { console.error(e); }
    };
    load();
  }, [selectedPage]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = ev.target?.result as string;
            setPastedImage(img);
            if (activeTab === "chat") {
              setChatMessages(prev => [...prev, { id: `img-${Date.now()}`, role: "user", content: "Analyze this screenshot", image: img, timestamp: new Date() }]);
              setIsTyping(true);
              setTimeout(() => {
                setChatMessages(prev => [...prev, { id: `r-${Date.now()}`, role: "assistant", content: "I analyzed the screenshot!\n\n**Layout:** Header, Hero, Content\n**Style:** Clean, modern\n\n**Recommendations:**\n1. Bold headlines\n2. Clear CTAs\n3. Add testimonials", timestamp: new Date() }]);
                setIsTyping(false);
              }, 2000);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, [activeTab]);

  useEffect(() => { document.addEventListener("paste", handlePaste); return () => document.removeEventListener("paste", handlePaste); }, [handlePaste]);

  const filteredPages = ALL_PAGES.filter(p => (categoryFilter === "All" || p.category === categoryFilter) && p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const save = async () => {
    if (!db) return;
    setIsSaving(true);
    try { await setDoc(doc(db, "page_designs", selectedPage.id), { ...pageDesign, updatedAt: Timestamp.now() }); setHasChanges(false); alert("Saved!"); }
    catch { alert("Failed"); }
    finally { setIsSaving(false); }
  };

  const updateSection = (id: string, field: string, val: string) => { setPageDesign(p => ({ ...p, sections: p.sections.map(s => s.id === id ? { ...s, [field]: val } : s) })); setHasChanges(true); };
  const addElement = (type: string) => { setPageDesign(p => ({ ...p, elements: [...p.elements, { id: `el-${Date.now()}`, type, content: "" }] })); setHasChanges(true); };
  const removeElement = (id: string) => { setPageDesign(p => ({ ...p, elements: p.elements.filter(e => e.id !== id) })); setHasChanges(true); };
  const addButton = () => { if (!buttonConfig.text) return; setPageDesign(p => ({ ...p, buttons: [...p.buttons, { ...buttonConfig, id: `btn-${Date.now()}` }] })); setShowButtonDialog(false); setButtonConfig({ id: "", text: "Click Here", type: "link", destination: "", variant: "default", size: "default" }); setHasChanges(true); };
  const removeButton = (id: string) => { setPageDesign(p => ({ ...p, buttons: p.buttons.filter(b => b.id !== id) })); setHasChanges(true); };

  const sendMessage = () => {
    if (!chatInput.trim() && !pastedImage) return;
    setChatMessages(prev => [...prev, { id: `m-${Date.now()}`, role: "user", content: chatInput, image: pastedImage || undefined, timestamp: new Date() }]);
    setChatInput(""); setPastedImage(null); setIsTyping(true);
    setTimeout(() => {
      const l = chatInput.toLowerCase();
      let r = "I can help with design, UX, buttons, and more!";
      if (l.includes("ux")) r = "Click UX Recommendations for analysis!";
      if (l.includes("button")) r = "Go to Buttons tab to add links or Stripe checkout.";
      if (l.includes("screenshot")) r = "Paste a screenshot (Ctrl+V) and I will analyze it!";
      setChatMessages(prev => [...prev, { id: `r-${Date.now()}`, role: "assistant", content: r, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  const applyAutoFix = (fixId: string) => {
    if (fixId === "meta") {
      setPageDesign(p => ({ ...p, seoDescription: `${selectedPage.name} - Strategic Value Plus` }));
      setHasChanges(true);
    } else if (fixId === "cta") {
      setPageDesign(p => ({ ...p, buttons: [...p.buttons, { id: `btn-${Date.now()}`, text: "Get Started", type: "page", destination: "/contact", variant: "default", size: "default" }] }));
      setHasChanges(true);
    } else if (fixId === "heading") {
      setPageDesign(p => ({ ...p, elements: [...p.elements, { id: `el-${Date.now()}`, type: "heading", content: "Main Heading" }] }));
      setHasChanges(true);
    }
    setShowUXDialog(false);
  };

  const genUX = () => {
    setIsAnalyzing(true); setShowUXDialog(true);
    setTimeout(() => {
      setUxRecs([
        { id: "1", type: "warning", title: "Missing Meta Description", description: "Add a meta description for SEO.", fixId: "meta" },
        { id: "2", type: "suggestion", title: "Add CTA", description: "Add a call-to-action button.", fixId: "cta" },
        { id: "3", type: "improvement", title: "Heading Hierarchy", description: "Use proper H1, H2, H3 structure.", fixId: "heading" },
      ]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const deviceWidth = previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="w-72 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">Pages</h3>
          <div className="space-y-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredPages.map(p => (
              <button key={p.id} onClick={() => { setSelectedPage(p); setSelectedSection(null); }} className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedPage.id === p.id ? "bg-amber-100 text-amber-700" : "hover:bg-gray-100"}`}>
                <div className="font-medium">{p.name}</div><div className="text-xs text-gray-500">{p.path}</div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-2">
          <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => setShowWizard(true)}><Wand2 className="w-4 h-4 mr-2" />Design Wizard</Button>
          <Button className="w-full" variant="outline" onClick={genUX}><Lightbulb className="w-4 h-4 mr-2" />UX Recommendations</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-white p-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" />AI Page Designer</h1><p className="text-sm text-gray-500">{selectedPage.name}{selectedSection && ` > ${selectedSection.name}`}</p></div>
            <div className="flex items-center gap-2">
              <div className="flex border rounded-md">
                <Button variant={previewDevice === "desktop" ? "secondary" : "ghost"} size="icon" onClick={() => setPreviewDevice("desktop")}><Monitor className="w-4 h-4" /></Button>
                <Button variant={previewDevice === "tablet" ? "secondary" : "ghost"} size="icon" onClick={() => setPreviewDevice("tablet")}><Tablet className="w-4 h-4" /></Button>
                <Button variant={previewDevice === "mobile" ? "secondary" : "ghost"} size="icon" onClick={() => setPreviewDevice("mobile")}><Smartphone className="w-4 h-4" /></Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPreviewDialog(true)}><Eye className="w-4 h-4 mr-2" />Preview</Button>
              {hasChanges && <Badge variant="outline" className="text-amber-600">Unsaved</Badge>}
              <Button size="sm" onClick={save} disabled={isSaving || !hasChanges}><Save className="w-4 h-4 mr-2" />{isSaving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b bg-white px-4">
            <TabsList>
              <TabsTrigger value="design"><Layout className="w-4 h-4 mr-2" />Design</TabsTrigger>
              <TabsTrigger value="elements"><Square className="w-4 h-4 mr-2" />Elements</TabsTrigger>
              <TabsTrigger value="buttons"><MousePointer className="w-4 h-4 mr-2" />Buttons</TabsTrigger>
              <TabsTrigger value="chat"><MessageSquare className="w-4 h-4 mr-2" />AI Chat</TabsTrigger>
              <TabsTrigger value="seo"><Globe className="w-4 h-4 mr-2" />SEO</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="design" className="flex-1 overflow-auto m-0 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <Card><CardHeader><CardTitle>Page Sections</CardTitle><CardDescription>Click to edit</CardDescription></CardHeader>
                <CardContent><div className="space-y-2">
                  {(pageDesign.sections.length > 0 ? pageDesign.sections : selectedPage.sections).map(s => (
                    <div key={s.id} onClick={() => setSelectedSection(s)} className={`p-4 border rounded-lg cursor-pointer ${selectedSection?.id === s.id ? "border-amber-500 bg-amber-50" : "hover:border-gray-300"}`}>
                      <div className="flex justify-between"><div><h4 className="font-medium">{s.name}</h4><p className="text-sm text-gray-500">{s.description}</p></div><Badge variant="outline">{s.type}</Badge></div>
                    </div>
                  ))}
                </div></CardContent>
              </Card>
              {selectedSection && (
                <Card><CardHeader><CardTitle>Edit: {selectedSection.name}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Title</Label><Input value={pageDesign.sections.find(s => s.id === selectedSection.id)?.title || ""} onChange={e => updateSection(selectedSection.id, "title", e.target.value)} /></div>
                    <div><Label>Content</Label><Textarea value={pageDesign.sections.find(s => s.id === selectedSection.id)?.content || ""} onChange={e => updateSection(selectedSection.id, "content", e.target.value)} rows={6} /></div>
                    <Button variant="outline" onClick={() => setShowButtonDialog(true)}><Plus className="w-4 h-4 mr-2" />Add Button</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="elements" className="flex-1 overflow-auto m-0 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <Card><CardHeader><CardTitle>Add Elements</CardTitle></CardHeader>
                <CardContent><div className="grid grid-cols-4 gap-3">
                  {ELEMENTS.map(el => (<div key={el.id} onClick={() => addElement(el.id)} className="p-4 border rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 text-center"><el.icon className="w-6 h-6 mx-auto mb-2" /><div className="text-sm font-medium">{el.name}</div></div>))}
                </div></CardContent>
              </Card>
              {pageDesign.elements.length > 0 && (
                <Card><CardHeader><CardTitle>Elements ({pageDesign.elements.length})</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2">
                    {pageDesign.elements.map(el => (
                      <div key={el.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3"><Badge variant="outline">{el.type}</Badge><Input value={el.content} onChange={e => { setPageDesign(p => ({ ...p, elements: p.elements.map(x => x.id === el.id ? { ...x, content: e.target.value } : x) })); setHasChanges(true); }} placeholder="Content..." className="w-64" /></div>
                        <Button variant="ghost" size="icon" onClick={() => removeElement(el.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    ))}
                  </div></CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="buttons" className="flex-1 overflow-auto m-0 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              <Card><CardHeader><CardTitle>Button Types</CardTitle></CardHeader>
                <CardContent><div className="grid grid-cols-3 gap-4">
                  {BTN_TYPES.map(bt => (<div key={bt.id} onClick={() => { setButtonConfig(p => ({ ...p, type: bt.id })); setShowButtonDialog(true); }} className="p-4 border rounded-lg cursor-pointer hover:border-amber-500 hover:bg-amber-50 text-center"><bt.icon className="w-8 h-8 mx-auto mb-2" /><div className="font-medium">{bt.name}</div></div>))}
                </div></CardContent>
              </Card>
              {pageDesign.buttons.length > 0 && (
                <Card><CardHeader><CardTitle>Buttons ({pageDesign.buttons.length})</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2">
                    {pageDesign.buttons.map(btn => (
                      <div key={btn.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div><div className="font-medium">{btn.text}</div><div className="text-sm text-gray-500">{btn.destination || btn.type}</div></div>
                        <div className="flex items-center gap-2"><Badge variant="outline">{btn.type}</Badge><Button variant={btn.variant as "default" | "secondary" | "outline"} size={btn.size as "sm" | "default" | "lg"}>{btn.text}</Button><Button variant="ghost" size="icon" onClick={() => removeButton(btn.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></div>
                      </div>
                    ))}
                  </div></CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="bg-amber-50 border-b p-3 flex items-center gap-2"><ImagePlus className="w-5 h-5 text-amber-600" /><span className="text-sm text-amber-800"><strong>Tip:</strong> Paste a screenshot (Ctrl+V) to design from an image!</span></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-4 ${msg.role === "user" ? "bg-amber-500 text-white" : "bg-gray-100"}`}>
                    {msg.image && <img src={msg.image} alt="Screenshot" className="max-w-full rounded mb-2 border" />}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start"><div className="bg-gray-100 rounded-lg p-4"><div className="flex space-x-2"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div></div></div>}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t bg-white p-4">
              {pastedImage && <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center gap-2"><img src={pastedImage} alt="Pasted" className="h-16 rounded" /><span className="text-sm">Ready</span><Button variant="ghost" size="sm" onClick={() => setPastedImage(null)}>Remove</Button></div>}
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}><ImagePlus className="w-4 h-4" /></Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { const reader = new FileReader(); reader.onload = ev => setPastedImage(ev.target?.result as string); reader.readAsDataURL(f); } }} />
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask AI or paste screenshot..." className="flex-1" />
                <Button onClick={sendMessage} disabled={!chatInput.trim() && !pastedImage}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="flex-1 overflow-auto m-0 p-4">
            <div className="max-w-2xl mx-auto">
              <Card><CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Page Title</Label><Input value={pageDesign.seoTitle} onChange={e => { setPageDesign(p => ({ ...p, seoTitle: e.target.value })); setHasChanges(true); }} /><p className="text-xs text-gray-500 mt-1">{pageDesign.seoTitle.length}/60</p></div>
                  <div><Label>Meta Description</Label><Textarea value={pageDesign.seoDescription} onChange={e => { setPageDesign(p => ({ ...p, seoDescription: e.target.value })); setHasChanges(true); }} rows={3} /><p className="text-xs text-gray-500 mt-1">{pageDesign.seoDescription.length}/160</p></div>
                  <div><Label>URL</Label><div className="flex items-center gap-2"><span className="text-gray-500">strategicvalueplus.com</span><Input value={selectedPage.path} disabled className="flex-1 bg-gray-50" /></div></div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg"><Label className="text-xs text-gray-500">Search Preview</Label><div className="mt-2"><div className="text-blue-600 text-lg">{pageDesign.seoTitle || selectedPage.name}</div><div className="text-green-700 text-sm">strategicvalueplus.com{selectedPage.path}</div><div className="text-gray-600 text-sm mt-1">{pageDesign.seoDescription || "No description"}</div></div></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showButtonDialog} onOpenChange={setShowButtonDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configure Button</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Text</Label><Input value={buttonConfig.text} onChange={e => setButtonConfig(p => ({ ...p, text: e.target.value }))} /></div>
            <div><Label>Type</Label><Select value={buttonConfig.type} onValueChange={v => setButtonConfig(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="link">External Link</SelectItem><SelectItem value="page">Internal Page</SelectItem><SelectItem value="stripe">Stripe</SelectItem></SelectContent></Select></div>
            {buttonConfig.type === "link" && <div><Label>URL</Label><Input value={buttonConfig.destination} onChange={e => setButtonConfig(p => ({ ...p, destination: e.target.value }))} placeholder="https://" /></div>}
            {buttonConfig.type === "page" && <div><Label>Page</Label><Select value={buttonConfig.destination} onValueChange={v => setButtonConfig(p => ({ ...p, destination: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{ALL_PAGES.map(pg => <SelectItem key={pg.id} value={pg.path}>{pg.name}</SelectItem>)}</SelectContent></Select></div>}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Style</Label><Select value={buttonConfig.variant} onValueChange={v => setButtonConfig(p => ({ ...p, variant: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Primary</SelectItem><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="outline">Outline</SelectItem></SelectContent></Select></div>
              <div><Label>Size</Label><Select value={buttonConfig.size} onValueChange={v => setButtonConfig(p => ({ ...p, size: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sm">Small</SelectItem><SelectItem value="default">Medium</SelectItem><SelectItem value="lg">Large</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Preview</Label><div className="p-4 border rounded-lg bg-gray-50 flex justify-center"><Button variant={buttonConfig.variant as "default" | "secondary" | "outline"} size={buttonConfig.size as "sm" | "default" | "lg"}>{buttonConfig.text}</Button></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowButtonDialog(false)}>Cancel</Button><Button onClick={addButton}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader><DialogTitle>Preview - {selectedPage.name}</DialogTitle></DialogHeader>
          <div className="flex-1 flex flex-col">
            <div className="flex justify-center gap-2 mb-4">
              <Button variant={previewDevice === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("desktop")}><Monitor className="w-4 h-4 mr-2" />Desktop</Button>
              <Button variant={previewDevice === "tablet" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("tablet")}><Tablet className="w-4 h-4 mr-2" />Tablet</Button>
              <Button variant={previewDevice === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewDevice("mobile")}><Smartphone className="w-4 h-4 mr-2" />Mobile</Button>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg overflow-auto flex justify-center p-4">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: deviceWidth, minHeight: "500px" }}>
                <div className="p-8">
                  <h1 className="text-3xl font-bold mb-4">{pageDesign.seoTitle || selectedPage.name}</h1>
                  <p className="text-gray-600 mb-6">{pageDesign.seoDescription}</p>
                  {pageDesign.sections.map(s => <div key={s.id} className="mb-6 p-4 border rounded-lg"><h2 className="text-xl font-semibold mb-2">{s.title || s.name}</h2><p className="text-gray-600">{s.content || s.description}</p></div>)}
                  {pageDesign.buttons.length > 0 && <div className="flex flex-wrap gap-2 mt-6">{pageDesign.buttons.map(btn => <Button key={btn.id} variant={btn.variant as "default" | "secondary" | "outline"} size={btn.size as "sm" | "default" | "lg"}>{btn.text}</Button>)}</div>}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUXDialog} onOpenChange={setShowUXDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" />UX Recommendations</DialogTitle></DialogHeader>
          {isAnalyzing ? <div className="py-12 text-center"><RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-amber-500" /><p>Analyzing...</p></div> : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {uxRecs.map(rec => (
                <div key={rec.id} className={`p-4 rounded-lg border ${rec.type === "warning" ? "bg-red-50 border-red-200" : rec.type === "suggestion" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {rec.type === "warning" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {rec.type === "suggestion" && <Lightbulb className="w-5 h-5 text-blue-500" />}
                      {rec.type === "improvement" && <CheckCircle className="w-5 h-5 text-green-500" />}
                      <div><h4 className="font-medium">{rec.title}</h4><p className="text-sm text-gray-600 mt-1">{rec.description}</p></div>
                    </div>
                    {rec.fixId && <Button size="sm" variant="outline" onClick={() => applyAutoFix(rec.fixId!)}>Auto-Fix</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setShowUXDialog(false)}>Close</Button><Button onClick={genUX}><RefreshCw className="w-4 h-4 mr-2" />Re-analyze</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-amber-500" />Design Wizard</DialogTitle><DialogDescription>AI-powered page design assistant</DialogDescription></DialogHeader>
          <div className="py-8 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-xl font-semibold mb-2">Design Wizard</h3>
            <p className="text-gray-600 mb-6">Create beautiful pages with AI assistance.</p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Button variant="outline" className="h-24 flex-col" onClick={() => { setShowWizard(false); setActiveTab("chat"); }}><MessageSquare className="w-8 h-8 mb-2" /><span>Chat with AI</span></Button>
              <Button variant="outline" className="h-24 flex-col" onClick={() => { setShowWizard(false); genUX(); }}><Lightbulb className="w-8 h-8 mb-2" /><span>Get UX Tips</span></Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">Tip: Paste a screenshot in AI Chat to design from an image!</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowWizard(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
