"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building2,
  User,
  PenTool,
  Clock,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock NDA data - in production, this would be fetched from the database
const MOCK_NDA_DATA = {
  id: "2",
  name: "NDA - TechStart Inc",
  selfServeMode: true, // If true, recipient needs to fill in their info
  disclosingParty: {
    name: "Nelinia Varenas",
    title: "Co-Founder & CEO",
    company: "Strategic Value Plus",
    email: "nel@strategicvalueplus.com",
  },
  receivingParty: {
    name: "", // Empty in self-serve mode
    title: "",
    company: "",
    email: "sjohnson@techstart.com",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  },
  effectiveDate: "2024-12-15",
  sections: [
    {
      id: "1",
      title: "Parties",
      content: `This Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} by and between:

**Disclosing Party:** {{disclosing_party_name}}, {{disclosing_party_title}} of {{disclosing_party_company}}
**Receiving Party:** {{receiving_party_name}}, {{receiving_party_title}} of {{receiving_party_company}}

**Contact Information:**
- Address: {{receiving_party_address}}, {{receiving_party_city}}, {{receiving_party_state}} {{receiving_party_zip}}
- Phone: {{receiving_party_phone}}
- Email: {{receiving_party_email}}`,
    },
    {
      id: "2",
      title: "Definition of Confidential Information",
      content: `"Confidential Information" means any and all information or data that has or could have commercial value or other utility in the business in which the Disclosing Party is engaged. This includes, but is not limited to:

- Technical data, trade secrets, know-how
- Research, product plans, products, services
- Customer lists and customer information
- Markets, software, developments, inventions
- Processes, designs, drawings, engineering
- Hardware configuration information, marketing
- Finances, or other business information

Confidential Information does not include information that:
(a) Is or becomes publicly available through no fault of the Receiving Party
(b) Was rightfully in the Receiving Party's possession prior to disclosure
(c) Is independently developed by the Receiving Party without use of Confidential Information
(d) Is rightfully obtained from a third party without restriction`,
    },
    {
      id: "3",
      title: "Obligations of Receiving Party",
      content: `The Receiving Party agrees to:

1. Hold and maintain the Confidential Information in strict confidence
2. Not disclose the Confidential Information to any third parties without prior written consent
3. Not use the Confidential Information for any purpose except as authorized by this Agreement
4. Protect the Confidential Information using the same degree of care used to protect its own confidential information, but in no event less than reasonable care
5. Limit access to Confidential Information to employees, agents, or representatives who have a need to know
6. Ensure that all persons with access to Confidential Information are bound by confidentiality obligations at least as restrictive as those contained herein`,
    },
    {
      id: "4",
      title: "Term and Termination",
      content: `This Agreement shall remain in effect for a period of {{term_years}} years from the Effective Date, unless earlier terminated by either party upon thirty (30) days written notice.

The obligations of confidentiality shall survive termination of this Agreement for a period of {{survival_years}} years.

Upon termination or expiration of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.`,
    },
    {
      id: "5",
      title: "Remedies",
      content: `The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.`,
    },
    {
      id: "6",
      title: "General Provisions",
      content: `**Governing Law:** This Agreement shall be governed by and construed in accordance with the laws of the State of {{governing_state}}.

**Entire Agreement:** This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof.

**Amendment:** This Agreement may not be amended except by a written instrument signed by both parties.

**Waiver:** No waiver of any provision of this Agreement shall be effective unless in writing and signed by the waiving party.

**Severability:** If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
    },
    {
      id: "7",
      title: "Signatures",
      content: `IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

**DISCLOSING PARTY:**

Signature: _________________________
Name: {{disclosing_party_name}}
Title: {{disclosing_party_title}}
Company: {{disclosing_party_company}}
Date: {{disclosing_signature_date}}

**RECEIVING PARTY:**

Signature: _________________________
Name: {{receiving_party_name}}
Title: {{receiving_party_title}}
Company: {{receiving_party_company}}
Date: {{receiving_signature_date}}`,
    },
  ],
  placeholders: {
    effective_date: "December 15, 2024",
    term_years: "2",
    survival_years: "5",
    governing_state: "North Carolina",
    disclosing_party_name: "Nelinia Varenas",
    disclosing_party_title: "Co-Founder & CEO",
    disclosing_party_company: "Strategic Value Plus",
    disclosing_signature_date: new Date().toLocaleDateString(),
  },
};

export default function NDASigningPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ndaData, setNdaData] = useState<typeof MOCK_NDA_DATA | null>(null);
  
  // Self-serve form state
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [signerCompany, setSignerCompany] = useState("");
  const [signerPhone, setSignerPhone] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [signerCity, setSignerCity] = useState("");
  const [signerState, setSignerState] = useState("");
  const [signerZip, setSignerZip] = useState("");
  
  // Signature form state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Load NDA data
  useEffect(() => {
    const loadNDA = async () => {
      setIsLoading(true);
      try {
        // In production, fetch from API using token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate token
        if (token === "abc123xyz" || token) {
          setNdaData(MOCK_NDA_DATA);
          // Pre-fill if data exists
          if (MOCK_NDA_DATA.receivingParty.name) {
            setSignerName(MOCK_NDA_DATA.receivingParty.name);
            setSignerTitle(MOCK_NDA_DATA.receivingParty.title || "");
            setSignerCompany(MOCK_NDA_DATA.receivingParty.company || "");
            setSignerPhone(MOCK_NDA_DATA.receivingParty.phone || "");
            setSignerAddress(MOCK_NDA_DATA.receivingParty.address || "");
            setSignerCity(MOCK_NDA_DATA.receivingParty.city || "");
            setSignerState(MOCK_NDA_DATA.receivingParty.state || "");
            setSignerZip(MOCK_NDA_DATA.receivingParty.zip || "");
          }
        } else {
          setError("Invalid or expired signing link. Please contact the sender for a new link.");
        }
      } catch (err) {
        setError("Failed to load document. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNDA();
  }, [token]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureData(null);
  };

  // Replace placeholders in content
  const renderContent = (content: string) => {
    if (!ndaData) return content;
    
    let rendered = content;
    
    // Replace disclosing party placeholders
    rendered = rendered.replace(/{{disclosing_party_name}}/g, ndaData.disclosingParty.name);
    rendered = rendered.replace(/{{disclosing_party_title}}/g, ndaData.disclosingParty.title);
    rendered = rendered.replace(/{{disclosing_party_company}}/g, ndaData.disclosingParty.company);
    rendered = rendered.replace(/{{disclosing_signature_date}}/g, new Date().toLocaleDateString());
    
    // Replace receiving party placeholders
    rendered = rendered.replace(/{{receiving_party_name}}/g, signerName || "[Your Name]");
    rendered = rendered.replace(/{{receiving_party_title}}/g, signerTitle || "[Your Title]");
    rendered = rendered.replace(/{{receiving_party_company}}/g, signerCompany || "[Your Company]");
    rendered = rendered.replace(/{{receiving_party_phone}}/g, signerPhone || "[Your Phone]");
    rendered = rendered.replace(/{{receiving_party_address}}/g, signerAddress || "[Your Address]");
    rendered = rendered.replace(/{{receiving_party_city}}/g, signerCity || "[City]");
    rendered = rendered.replace(/{{receiving_party_state}}/g, signerState || "[State]");
    rendered = rendered.replace(/{{receiving_party_zip}}/g, signerZip || "[ZIP]");
    rendered = rendered.replace(/{{receiving_party_email}}/g, ndaData.receivingParty.email);
    rendered = rendered.replace(/{{receiving_signature_date}}/g, new Date().toLocaleDateString());
    
    // Replace other placeholders
    rendered = rendered.replace(/{{effective_date}}/g, ndaData.placeholders.effective_date);
    rendered = rendered.replace(/{{term_years}}/g, ndaData.placeholders.term_years);
    rendered = rendered.replace(/{{survival_years}}/g, ndaData.placeholders.survival_years);
    rendered = rendered.replace(/{{governing_state}}/g, ndaData.placeholders.governing_state);
    
    return rendered;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!signerName || !signerCompany) {
      alert("Please fill in your name and company");
      return;
    }
    
    if (!hasSignature || !agreedToTerms) {
      alert("Please sign and agree to the terms");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In production, submit to API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsComplete(true);
    } catch (err) {
      setError("Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Document</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion state
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">NDA Signed Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for signing the Non-Disclosure Agreement. The document has been submitted for countersignature.
              </p>
              <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-2">
                <p><strong>What happens next:</strong></p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {ndaData?.disclosingParty.name} will review and countersign</li>
                  <li>• You will receive a copy of the fully executed NDA via email</li>
                  <li>• A PDF copy will be sent to {ndaData?.receivingParty.email}</li>
                </ul>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Document Summary:</p>
                <div className="text-sm text-left bg-muted/50 p-3 rounded-lg">
                  <p><strong>Signed by:</strong> {signerName}, {signerTitle}</p>
                  <p><strong>Company:</strong> {signerCompany}</p>
                  <p><strong>Email:</strong> {ndaData?.receivingParty.email}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Signed on {new Date().toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSelfServe = ndaData?.selfServeMode && !ndaData?.receivingParty.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-semibold">Strategic Value Plus</h1>
              <p className="text-sm text-muted-foreground">Document Signing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Non-Disclosure Agreement
                </CardTitle>
                <CardDescription>
                  Please review the agreement carefully before signing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Parties Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Disclosing Party</p>
                    <p className="font-medium">{ndaData?.disclosingParty.name}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.disclosingParty.title}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.disclosingParty.company}</p>
                    <p className="text-sm text-muted-foreground">{ndaData?.disclosingParty.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Receiving Party</p>
                    <p className="font-medium">{signerName || "[To be completed]"}</p>
                    <p className="text-sm text-muted-foreground">{signerTitle || ""}</p>
                    <p className="text-sm text-muted-foreground">{signerCompany || ""}</p>
                    {signerPhone && <p className="text-sm text-muted-foreground">{signerPhone}</p>}
                  </div>
                </div>

                {/* Document Sections */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {ndaData?.sections.map((section, index) => (
                      <div key={section.id}>
                        <h3 className="font-semibold text-lg mb-2">
                          {index + 1}. {section.title}
                        </h3>
                        <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                          {renderContent(section.content)}
                        </div>
                        {index < (ndaData?.sections.length || 0) - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Signature Panel */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  {isSelfServe ? "Complete & Sign" : "Sign Document"}
                </CardTitle>
                <CardDescription>
                  {isSelfServe 
                    ? "Fill in your information and sign to complete the NDA"
                    : "Complete the fields below to sign"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Self-serve info collection */}
                {isSelfServe && (
                  <div className="space-y-4 border-b pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">Step 1</Badge>
                      <span className="font-medium">Your Information</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Smith"
                          value={signerName}
                          onChange={(e) => setSignerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="title">Title / Position</Label>
                        <Input
                          id="title"
                          placeholder="CEO, Director"
                          value={signerTitle}
                          onChange={(e) => setSignerTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="company">Company / Organization *</Label>
                      <Input
                        id="company"
                        placeholder="ABC Manufacturing Inc."
                        value={signerCompany}
                        onChange={(e) => setSignerCompany(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={signerPhone}
                        onChange={(e) => setSignerPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street, Suite 100"
                        value={signerAddress}
                        onChange={(e) => setSignerAddress(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Raleigh"
                          value={signerCity}
                          onChange={(e) => setSignerCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="NC"
                          value={signerState}
                          onChange={(e) => setSignerState(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="zip">ZIP</Label>
                        <Input
                          id="zip"
                          placeholder="27601"
                          value={signerZip}
                          onChange={(e) => setSignerZip(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Signature */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{isSelfServe ? "Step 2" : "Step 1"}</Badge>
                    <span className="font-medium">Electronic Signature</span>
                  </div>

                  {/* Signer Name (for non-self-serve) */}
                  {!isSelfServe && (
                    <div className="space-y-2">
                      <Label htmlFor="signerName">Full Legal Name *</Label>
                      <Input
                        id="signerName"
                        placeholder="Enter your full name"
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Signature Canvas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Signature *</Label>
                      {hasSignature && (
                        <Button variant="ghost" size="sm" onClick={clearSignature}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-1 bg-white">
                      <canvas
                        ref={canvasRef}
                        width={280}
                        height={120}
                        className="w-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Draw your signature above using mouse or touch
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Timestamp: {new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agree"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
                      I have read and agree to the terms of this Non-Disclosure Agreement. I understand that my electronic signature is legally binding and has the same legal effect as my handwritten signature.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!signerName || !hasSignature || !agreedToTerms || isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Sign & Submit NDA
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing, you agree that your electronic signature is the legal equivalent of your manual signature. 
                    This document will be countersigned by {ndaData?.disclosingParty.name}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by Strategic Value Plus Document Management</p>
          <p className="mt-1">This document is confidential and intended only for the named recipient.</p>
        </div>
      </footer>
    </div>
  );
}
