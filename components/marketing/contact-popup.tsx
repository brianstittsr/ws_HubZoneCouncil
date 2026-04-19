"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, MessageCircle, Send, Factory, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PopupField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "url" | "select" | "radio" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  enabled: boolean;
}

export interface PopupConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  successMessage: string;
  triggerDelay: number; // seconds before auto-showing (0 = never auto-show)
  showOnPages: string[]; // which pages to show on, empty = all
  position: "bottom-right" | "bottom-left" | "center";
  fields: PopupField[];
  productOptions: string[];
  productLabel: string;
  allowCustomProduct: boolean;
}

// Default configuration
export const defaultPopupConfig: PopupConfig = {
  enabled: true,
  title: "Strategic Value+ Solutions",
  subtitle: "Request a supplier readiness assessment to identify gaps and define the fastest path to OEM qualification.",
  description: "Tell us what you're aiming to qualify for and where you're stuck. We'll follow up with next steps.",
  buttonText: "Request Assessment",
  successMessage: "Thank you! We'll be in touch within 24 hours.",
  triggerDelay: 0,
  showOnPages: [],
  position: "bottom-right",
  fields: [
    { id: "name", type: "text", label: "Name", placeholder: "Full name", required: true, enabled: true },
    { id: "email", type: "email", label: "Email", placeholder: "Email", required: true, enabled: true },
    { id: "phone", type: "phone", label: "Phone", placeholder: "Phone", required: true, enabled: true },
  ],
  productOptions: [
    "Supplier",
    "OEM",
  ],
  productLabel: "I am a:",
  allowCustomProduct: false,
};

interface ContactPopupProps {
  config?: PopupConfig;
}

// Pages where the popup should be completely hidden
const EXCLUDED_PAGES = ["/cmmc-training"];

export function ContactPopup({ config = defaultPopupConfig }: ContactPopupProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [showTriggerButton, setShowTriggerButton] = useState(true);

  // Check if current page is excluded
  const isExcludedPage = EXCLUDED_PAGES.some(page => pathname === page || pathname?.startsWith(`${page}/`));

  useEffect(() => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser || isExcludedPage) return;

    const shownKey = "svp_booking_popup_shown";
    if (sessionStorage.getItem(shownKey) === "true") {
      return;
    }

    const timer = setTimeout(
      () => {
        setIsOpen(true);
        sessionStorage.setItem(shownKey, "true");
      },
      Math.max(0, config.triggerDelay) * 1000
    );

    return () => clearTimeout(timer);
  }, [config.triggerDelay, isExcludedPage]);

  if (!config.enabled || isExcludedPage) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const persona = selectedProduct;
    if (!persona) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const name = (formData.name || "").trim();
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ").trim();

      // Call the API route instead of direct Firebase write
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType: "assessment_request",
          firstName: firstName || "",
          lastName: lastName || "",
          email: (formData.email || "").trim(),
          phone: (formData.phone || "").trim() || null,
          company: null,
          jobTitle: persona, // Store the persona (Supplier/OEM) as job title
          companySize: null,
          industry: null,
          serviceOfInterest: persona,
          message: null,
          source: "popup",
          pageUrl: pathname,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit form");
      }

      // Success!
      setSubmitSuccess(true);
      setIsSubmitted(true);

      // Close after showing success message
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setSubmitSuccess(false);
        setFormData({});
        setSelectedProduct("");
        setCustomProduct("");
      }, 3000);
    } catch (error) {
      console.error("Popup submit error:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const enabledFields = config.fields.filter((f) => f.enabled);

  return (
    <>
      {/* Floating Trigger Button */}
      {showTriggerButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform",
            config.position === "bottom-right" && "bottom-6 right-6",
            config.position === "bottom-left" && "bottom-6 left-6",
            config.position === "center" && "bottom-6 right-6"
          )}
          aria-label="Contact us"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Popup Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-primary">V</span>
              <sup className="text-primary text-xl">+</sup>
              <DialogTitle className="text-xl text-primary font-semibold">
                {config.title}
              </DialogTitle>
            </div>
            <p className="text-base font-medium text-foreground">
              {config.subtitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-green-600">
                {config.successMessage}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                We&apos;ve sent a confirmation to your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              {enabledFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      className="bg-muted/50"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type === "phone" ? "tel" : field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      className="bg-muted/50"
                    />
                  )}
                </div>
              ))}

              {/* Product Selection */}
              {config.productOptions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-primary">
                    {config.productLabel}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={selectedProduct}
                    onValueChange={(value) => {
                      setSelectedProduct(value);
                      setCustomProduct("");
                    }}
                  >
                    {config.productOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                    {config.allowCustomProduct && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Input
                          placeholder="Press enter to add custom option"
                          value={customProduct}
                          onChange={(e) => {
                            setCustomProduct(e.target.value);
                            setSelectedProduct("custom");
                          }}
                          className="flex-1 bg-muted/50"
                        />
                      </div>
                    )}
                  </RadioGroup>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={!selectedProduct || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {config.buttonText}
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
