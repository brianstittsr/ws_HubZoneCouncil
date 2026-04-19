"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Trash2, Edit, ChevronRight, EyeOff,
  Menu, LayoutGrid, Settings, Save, Undo, ExternalLink,
  Home, Info, Users, Phone, FileText, Zap, Factory, Globe, Wrench,
  ArrowUp, ArrowDown, Link as LinkIcon
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

// Types
interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
  description?: string;
  enabled: boolean;
  openInNewTab: boolean;
  children?: MenuItem[];
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  enabled: boolean;
}

interface NavigationConfig {
  header: {
    sections: MenuSection[];
    ctaButtons: MenuItem[];
    animation: AnimationConfig;
  };
  footer: {
    sections: MenuSection[];
    socialLinks: MenuItem[];
    legalLinks: MenuItem[];
    animation: AnimationConfig;
  };
  updatedAt?: any;
}

interface AnimationConfig {
  type: "none" | "fade" | "slide" | "scale" | "blur";
  duration: number;
  easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  stagger: number;
}

// Icon options
const ICON_OPTIONS = [
  { value: "home", label: "Home", icon: Home },
  { value: "info", label: "Info", icon: Info },
  { value: "users", label: "Users", icon: Users },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "file", label: "File", icon: FileText },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "factory", label: "Factory", icon: Factory },
  { value: "globe", label: "Globe", icon: Globe },
  { value: "wrench", label: "Wrench", icon: Wrench },
  { value: "link", label: "Link", icon: LinkIcon },
  { value: "external", label: "External", icon: ExternalLink },
];

const ANIMATION_TYPES = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "scale", label: "Scale" },
  { value: "blur", label: "Blur" },
];

const EASING_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
];

// Default configuration
const defaultConfig: NavigationConfig = {
  header: {
    sections: [
      {
        id: "services",
        title: "Services",
        enabled: true,
        items: [
          {
            id: "supplier-readiness",
            title: "Supplier Readiness",
            href: "/",
            icon: "factory",
            description: "OEM qualification and supplier readiness assessments",
            enabled: true,
            openInNewTab: false,
            children: [
              { id: "assessment", title: "Request Readiness Assessment", href: "/contact", enabled: true, openInNewTab: false },
              { id: "oem-buyers", title: "For OEM Buyers", href: "/oem", enabled: true, openInNewTab: false },
              { id: "affiliates", title: "Join Affiliate Network", href: "/affiliates", enabled: true, openInNewTab: false },
            ],
          },
          {
            id: "v-edge",
            title: "V+ EDGE™",
            href: "/v-edge",
            icon: "wrench",
            description: "Modular platform that accelerates readiness execution",
            enabled: true,
            openInNewTab: false,
            children: [
              { id: "explore", title: "Explore V+ EDGE", href: "/v-edge", enabled: true, openInNewTab: false },
              { id: "quality", title: "Quality & ISO", href: "/v-edge", enabled: true, openInNewTab: false },
            ],
          },
        ],
      },
      {
        id: "company",
        title: "Company",
        enabled: true,
        items: [
          { id: "about", title: "About Us", href: "/about", icon: "globe", enabled: true, openInNewTab: false },
          { id: "leadership", title: "Leadership Team", href: "/leadership", icon: "users", enabled: true, openInNewTab: false },
          { id: "core-team", title: "Core Team", href: "/company", icon: "users", enabled: true, openInNewTab: false },
        ],
      },
      {
        id: "resources",
        title: "Resources",
        enabled: true,
        items: [
          { id: "antifragile", title: "AntiFragile", href: "/antifragile", icon: "zap", enabled: true, openInNewTab: false },
          { id: "accessibility", title: "Accessibility", href: "/accessibility", icon: "file", enabled: true, openInNewTab: false },
        ],
      },
    ],
    ctaButtons: [
      { id: "sign-in", title: "Sign In", href: "/sign-in", enabled: true, openInNewTab: false },
      { id: "sign-up", title: "Sign Up", href: "/sign-up", enabled: true, openInNewTab: false },
      { id: "get-assessment", title: "Get Assessment", href: "/contact", enabled: true, openInNewTab: false },
    ],
    animation: { type: "fade", duration: 200, easing: "ease-out", stagger: 50 },
  },
  footer: {
    sections: [
      {
        id: "services-footer",
        title: "Services",
        enabled: true,
        items: [
          { id: "v-edge-f", title: "V+ EDGE™", href: "/v-edge", enabled: true, openInNewTab: false },
          { id: "supplier-f", title: "Supplier Readiness", href: "/", enabled: true, openInNewTab: false },
          { id: "oem-f", title: "For OEM Buyers", href: "/oem", enabled: true, openInNewTab: false },
          { id: "contact-f", title: "Contact", href: "/contact", enabled: true, openInNewTab: false },
        ],
      },
      {
        id: "company-footer",
        title: "Company",
        enabled: true,
        items: [
          { id: "about-f", title: "About Us", href: "/about", enabled: true, openInNewTab: false },
          { id: "leadership-f", title: "Leadership", href: "/leadership", enabled: true, openInNewTab: false },
          { id: "core-f", title: "Core Team", href: "/company", enabled: true, openInNewTab: false },
        ],
      },
    ],
    socialLinks: [
      { id: "linkedin", title: "LinkedIn", href: "https://linkedin.com", enabled: true, openInNewTab: true },
      { id: "twitter", title: "Twitter", href: "https://twitter.com", enabled: true, openInNewTab: true },
      { id: "youtube", title: "YouTube", href: "https://youtube.com", enabled: true, openInNewTab: true },
    ],
    legalLinks: [
      { id: "privacy", title: "Privacy Policy", href: "/privacy", enabled: true, openInNewTab: false },
      { id: "terms", title: "Terms of Service", href: "/terms", enabled: true, openInNewTab: false },
      { id: "accessibility-l", title: "Accessibility", href: "/accessibility", enabled: true, openInNewTab: false },
    ],
    animation: { type: "fade", duration: 300, easing: "ease-out", stagger: 30 },
  },
};

export default function NavigationManagerPage() {
  const [config, setConfig] = useState<NavigationConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState("header");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showAnimationDialog, setShowAnimationDialog] = useState(false);
  const [showSubItemDialog, setShowSubItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingContext, setEditingContext] = useState<{ type: "header" | "footer"; sectionId?: string; parentId?: string }>({ type: "header" });
  
  const [itemForm, setItemForm] = useState({ title: "", href: "", icon: "", description: "", enabled: true, openInNewTab: false });
  const [sectionForm, setSectionForm] = useState({ title: "", enabled: true });

  useEffect(() => {
    const loadConfig = async () => {
      if (!db) return;
      try {
        const docRef = doc(db, "platform_settings", "navigation");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setConfig(docSnap.data() as NavigationConfig);
      } catch (error) {
        console.error("Error loading navigation config:", error);
      }
    };
    loadConfig();
  }, []);

  const saveConfig = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "platform_settings", "navigation"), { ...config, updatedAt: Timestamp.now() });
      setHasChanges(false);
      alert("Navigation configuration saved!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (updates: Partial<NavigationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const addSection = () => {
    if (!sectionForm.title) return;
    const newSection: MenuSection = { id: `section-${Date.now()}`, title: sectionForm.title, enabled: sectionForm.enabled, items: [] };
    if (activeTab === "header") {
      updateConfig({ header: { ...config.header, sections: [...config.header.sections, newSection] } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: [...config.footer.sections, newSection] } });
    }
    setShowSectionDialog(false);
    setSectionForm({ title: "", enabled: true });
  };

  const saveMenuItem = () => {
    if (!itemForm.title || !itemForm.href) return;
    const newItem: MenuItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      title: itemForm.title,
      href: itemForm.href,
      icon: itemForm.icon,
      description: itemForm.description,
      enabled: itemForm.enabled,
      openInNewTab: itemForm.openInNewTab,
      children: editingItem?.children || [],
    };
    
    const { type, sectionId } = editingContext;
    const sections = type === "header" ? config.header.sections : config.footer.sections;
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        if (editingItem) {
          return { ...section, items: section.items.map(item => item.id === editingItem.id ? newItem : item) };
        }
        return { ...section, items: [...section.items, newItem] };
      }
      return section;
    });
    
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: updatedSections } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: updatedSections } });
    }
    
    setShowItemDialog(false);
    setEditingItem(null);
    setItemForm({ title: "", href: "", icon: "", description: "", enabled: true, openInNewTab: false });
  };

  const saveSubItem = () => {
    if (!itemForm.title || !itemForm.href) return;
    const newSubItem: MenuItem = {
      id: editingItem?.id || `subitem-${Date.now()}`,
      title: itemForm.title,
      href: itemForm.href,
      enabled: itemForm.enabled,
      openInNewTab: itemForm.openInNewTab,
    };
    
    const { type, sectionId, parentId } = editingContext;
    const sections = type === "header" ? config.header.sections : config.footer.sections;
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === parentId) {
              const children = item.children || [];
              if (editingItem) {
                return { ...item, children: children.map(c => c.id === editingItem.id ? newSubItem : c) };
              }
              return { ...item, children: [...children, newSubItem] };
            }
            return item;
          }),
        };
      }
      return section;
    });
    
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: updatedSections } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: updatedSections } });
    }
    
    setShowSubItemDialog(false);
    setEditingItem(null);
    setItemForm({ title: "", href: "", icon: "", description: "", enabled: true, openInNewTab: false });
  };

  const deleteMenuItem = (sectionId: string, itemId: string, type: "header" | "footer") => {
    if (!confirm("Delete this item?")) return;
    const sections = type === "header" ? config.header.sections : config.footer.sections;
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, items: section.items.filter(item => item.id !== itemId) } : section
    );
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: updatedSections } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: updatedSections } });
    }
  };

  const deleteSubItem = (sectionId: string, parentId: string, subItemId: string, type: "header" | "footer") => {
    if (!confirm("Delete this sub-item?")) return;
    const sections = type === "header" ? config.header.sections : config.footer.sections;
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === parentId) {
              return { ...item, children: (item.children || []).filter(c => c.id !== subItemId) };
            }
            return item;
          }),
        };
      }
      return section;
    });
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: updatedSections } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: updatedSections } });
    }
  };

  const toggleItemEnabled = (sectionId: string, itemId: string, type: "header" | "footer") => {
    const sections = type === "header" ? config.header.sections : config.footer.sections;
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, items: section.items.map(item => item.id === itemId ? { ...item, enabled: !item.enabled } : item) }
        : section
    );
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: updatedSections } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: updatedSections } });
    }
  };

  const moveItem = (sectionId: string, itemId: string, direction: "up" | "down", type: "header" | "footer") => {
    const sections = type === "header" ? config.header.sections : config.footer.sections;
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const items = [...section.items];
        const index = items.findIndex(i => i.id === itemId);
        if (direction === "up" && index > 0) {
          [items[index - 1], items[index]] = [items[index], items[index - 1]];
        } else if (direction === "down" && index < items.length - 1) {
          [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        return { ...section, items };
      }
      return section;
    });
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: updatedSections } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: updatedSections } });
    }
  };

  const deleteSection = (sectionId: string, type: "header" | "footer") => {
    if (!confirm("Delete this section and all its items?")) return;
    if (type === "header") {
      updateConfig({ header: { ...config.header, sections: config.header.sections.filter(s => s.id !== sectionId) } });
    } else {
      updateConfig({ footer: { ...config.footer, sections: config.footer.sections.filter(s => s.id !== sectionId) } });
    }
  };

  const updateAnimation = (type: "header" | "footer", updates: Partial<AnimationConfig>) => {
    if (type === "header") {
      updateConfig({ header: { ...config.header, animation: { ...config.header.animation, ...updates } } });
    } else {
      updateConfig({ footer: { ...config.footer, animation: { ...config.footer.animation, ...updates } } });
    }
  };

  const renderSection = (section: MenuSection, type: "header" | "footer") => (
    <Card key={section.id} className={!section.enabled ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{section.title}</CardTitle>
            {!section.enabled && <Badge variant="secondary">Disabled</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={section.enabled}
              onCheckedChange={(checked) => {
                const sections = type === "header" ? config.header.sections : config.footer.sections;
                const updated = sections.map(s => s.id === section.id ? { ...s, enabled: checked } : s);
                if (type === "header") updateConfig({ header: { ...config.header, sections: updated } });
                else updateConfig({ footer: { ...config.footer, sections: updated } });
              }}
            />
            <Button variant="outline" size="sm" onClick={() => {
              setEditingContext({ type, sectionId: section.id });
              setItemForm({ title: "", href: "", icon: "", description: "", enabled: true, openInNewTab: false });
              setEditingItem(null);
              setShowItemDialog(true);
            }}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteSection(section.id, type)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {section.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Menu className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No items in this section</p>
          </div>
        ) : (
          <div className="space-y-2">
            {section.items.map((item, index) => {
              const IconComponent = ICON_OPTIONS.find(i => i.value === item.icon)?.icon;
              return (
                <div key={item.id}>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${item.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveItem(section.id, item.id, "up", type)} disabled={index === 0}>
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveItem(section.id, item.id, "down", type)} disabled={index === section.items.length - 1}>
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    {IconComponent && <IconComponent className="w-4 h-4 text-gray-500" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate">{item.href}</div>
                    </div>
                    {item.children && item.children.length > 0 && (
                      <Badge variant="outline" className="text-xs">{item.children.length} sub-items</Badge>
                    )}
                    {item.openInNewTab && <ExternalLink className="w-3 h-3 text-gray-400" />}
                    <Switch checked={item.enabled} onCheckedChange={() => toggleItemEnabled(section.id, item.id, type)} />
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingContext({ type, sectionId: section.id, parentId: item.id });
                      setItemForm({ title: "", href: "", icon: "", description: "", enabled: true, openInNewTab: false });
                      setEditingItem(null);
                      setShowSubItemDialog(true);
                    }}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingContext({ type, sectionId: section.id });
                      setEditingItem(item);
                      setItemForm({ title: item.title, href: item.href, icon: item.icon || "", description: item.description || "", enabled: item.enabled, openInNewTab: item.openInNewTab });
                      setShowItemDialog(true);
                    }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMenuItem(section.id, item.id, type)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  {item.children && item.children.length > 0 && (
                    <div className="ml-12 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                      {item.children.map(child => (
                        <div key={child.id} className={`flex items-center gap-2 p-2 rounded border ${child.enabled ? 'bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{child.title}</div>
                            <div className="text-xs text-gray-400 truncate">{child.href}</div>
                          </div>
                          {!child.enabled && <EyeOff className="w-3 h-3 text-gray-400" />}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                            setEditingContext({ type, sectionId: section.id, parentId: item.id });
                            setEditingItem(child);
                            setItemForm({ title: child.title, href: child.href, icon: "", description: "", enabled: child.enabled, openInNewTab: child.openInNewTab });
                            setShowSubItemDialog(true);
                          }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteSubItem(section.id, item.id, child.id, type)}>
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-amber-500" />
            Header & Footer Manager
          </h1>
          <p className="text-gray-500">Manage navigation menus, links, and animations</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && <Badge variant="outline" className="text-amber-600 border-amber-300">Unsaved changes</Badge>}
          <Button variant="outline" onClick={() => setConfig(defaultConfig)}>
            <Undo className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={saveConfig} disabled={isSaving || !hasChanges}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="header"><Menu className="w-4 h-4 mr-2" /> Header</TabsTrigger>
          <TabsTrigger value="footer"><LayoutGrid className="w-4 h-4 mr-2" /> Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Animation Settings</CardTitle>
                  <CardDescription>Configure menu transition animations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAnimationDialog(true)}>
                  <Settings className="w-4 h-4 mr-2" /> Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-gray-500">Type:</span> <Badge variant="outline">{config.header.animation.type}</Badge></div>
                <div><span className="text-gray-500">Duration:</span> <Badge variant="outline">{config.header.animation.duration}ms</Badge></div>
                <div><span className="text-gray-500">Easing:</span> <Badge variant="outline">{config.header.animation.easing}</Badge></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu Sections</h2>
            <Button onClick={() => { setSectionForm({ title: "", enabled: true }); setShowSectionDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>
          <div className="space-y-4">{config.header.sections.map(section => renderSection(section, "header"))}</div>

          <Card>
            <CardHeader><CardTitle className="text-lg">CTA Buttons</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.header.ctaButtons.map(btn => (
                  <div key={btn.id} className={`flex items-center gap-3 p-3 rounded-lg border ${btn.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                    <div className="flex-1">
                      <div className="font-medium">{btn.title}</div>
                      <div className="text-sm text-gray-500">{btn.href}</div>
                    </div>
                    <Switch checked={btn.enabled} onCheckedChange={(checked) => {
                      updateConfig({ header: { ...config.header, ctaButtons: config.header.ctaButtons.map(b => b.id === btn.id ? { ...b, enabled: checked } : b) } });
                    }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Animation Settings</CardTitle>
                  <CardDescription>Configure footer link animations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAnimationDialog(true)}>
                  <Settings className="w-4 h-4 mr-2" /> Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-gray-500">Type:</span> <Badge variant="outline">{config.footer.animation.type}</Badge></div>
                <div><span className="text-gray-500">Duration:</span> <Badge variant="outline">{config.footer.animation.duration}ms</Badge></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Footer Sections</h2>
            <Button onClick={() => { setSectionForm({ title: "", enabled: true }); setShowSectionDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>
          <div className="space-y-4">{config.footer.sections.map(section => renderSection(section, "footer"))}</div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Legal Links</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.footer.legalLinks.map(link => (
                  <div key={link.id} className={`flex items-center gap-3 p-3 rounded-lg border ${link.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                    <div className="flex-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-sm text-gray-500">{link.href}</div>
                    </div>
                    <Switch checked={link.enabled} onCheckedChange={(checked) => {
                      updateConfig({ footer: { ...config.footer, legalLinks: config.footer.legalLinks.map(l => l.id === link.id ? { ...l, enabled: checked } : l) } });
                    }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Social Links</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.footer.socialLinks.map(link => (
                  <div key={link.id} className={`flex items-center gap-3 p-3 rounded-lg border ${link.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                    <div className="flex-1">
                      <div className="font-medium">{link.title}</div>
                      <div className="text-sm text-gray-500">{link.href}</div>
                    </div>
                    <Switch checked={link.enabled} onCheckedChange={(checked) => {
                      updateConfig({ footer: { ...config.footer, socialLinks: config.footer.socialLinks.map(l => l.id === link.id ? { ...l, enabled: checked } : l) } });
                    }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={itemForm.title} onChange={(e) => setItemForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., About Us" />
            </div>
            <div>
              <Label>Link URL *</Label>
              <Input value={itemForm.href} onChange={(e) => setItemForm(p => ({ ...p, href: e.target.value }))} placeholder="/about" />
            </div>
            <div>
              <Label>Icon</Label>
              <Select value={itemForm.icon} onValueChange={(v) => setItemForm(p => ({ ...p, icon: v }))}>
                <SelectTrigger><SelectValue placeholder="Select icon" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {ICON_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={itemForm.description} onChange={(e) => setItemForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={itemForm.enabled} onCheckedChange={(c) => setItemForm(p => ({ ...p, enabled: c }))} />
                <Label>Enabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={itemForm.openInNewTab} onCheckedChange={(c) => setItemForm(p => ({ ...p, openInNewTab: c }))} />
                <Label>New tab</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Cancel</Button>
            <Button onClick={saveMenuItem} disabled={!itemForm.title || !itemForm.href}>{editingItem ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Sub-Item Dialog */}
      <Dialog open={showSubItemDialog} onOpenChange={setShowSubItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Sub-Item" : "Add Sub-Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={itemForm.title} onChange={(e) => setItemForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Link URL *</Label>
              <Input value={itemForm.href} onChange={(e) => setItemForm(p => ({ ...p, href: e.target.value }))} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={itemForm.enabled} onCheckedChange={(c) => setItemForm(p => ({ ...p, enabled: c }))} />
                <Label>Enabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={itemForm.openInNewTab} onCheckedChange={(c) => setItemForm(p => ({ ...p, openInNewTab: c }))} />
                <Label>New tab</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubItemDialog(false)}>Cancel</Button>
            <Button onClick={saveSubItem} disabled={!itemForm.title || !itemForm.href}>{editingItem ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Title *</Label>
              <Input value={sectionForm.title} onChange={(e) => setSectionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Services" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={sectionForm.enabled} onCheckedChange={(c) => setSectionForm(p => ({ ...p, enabled: c }))} />
              <Label>Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>Cancel</Button>
            <Button onClick={addSection} disabled={!sectionForm.title}>Add Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animation Dialog */}
      <Dialog open={showAnimationDialog} onOpenChange={setShowAnimationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Animation Settings</DialogTitle>
            <DialogDescription>Configure menu animations for {activeTab}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Animation Type</Label>
              <Select
                value={activeTab === "header" ? config.header.animation.type : config.footer.animation.type}
                onValueChange={(v: any) => updateAnimation(activeTab as "header" | "footer", { type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANIMATION_TYPES.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={activeTab === "header" ? config.header.animation.duration : config.footer.animation.duration}
                onChange={(e) => updateAnimation(activeTab as "header" | "footer", { duration: parseInt(e.target.value) || 200 })}
                min={0} max={2000} step={50}
              />
            </div>
            <div>
              <Label>Easing</Label>
              <Select
                value={activeTab === "header" ? config.header.animation.easing : config.footer.animation.easing}
                onValueChange={(v: any) => updateAnimation(activeTab as "header" | "footer", { easing: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EASING_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stagger Delay (ms)</Label>
              <Input
                type="number"
                value={activeTab === "header" ? config.header.animation.stagger : config.footer.animation.stagger}
                onChange={(e) => updateAnimation(activeTab as "header" | "footer", { stagger: parseInt(e.target.value) || 0 })}
                min={0} max={500} step={10}
              />
              <p className="text-xs text-gray-500 mt-1">Delay between each item</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAnimationDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
