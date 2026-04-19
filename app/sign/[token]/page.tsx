"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FileSignature,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Download,
  Eraser,
  Shield,
  CreditCard,
  Pen,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface SigningData {
  id: string;
  proposalName: string;
  proposalType: string;
  proposalHtml: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  status: string;
  createdAt: string;
  // Hosting/payment info
  hostingEnabled?: boolean;
  monthlyFee?: number;
  clientName?: string;
}

export default function SigningPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [signingData, setSigningData] = useState<SigningData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);

  // Signer info
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [signerCompany, setSignerCompany] = useState("");

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [signatureData, setSignatureData] = useState<{
    hostingEnabled?: boolean;
    monthlyFee?: number;
    clientName?: string;
    signatureId?: string;
  }>({});

  // Fetch signing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/proposals/sign?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          if (data.alreadySigned) {
            setAlreadySigned(true);
          }
          setError(data.error || "Failed to load document");
          return;
        }

        setSigningData(data);
        if (data.recipientName) {
          setSignerName(data.recipientName);
        }
      } catch (err) {
        setError("Failed to connect to signing service");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Canvas drawing handlers
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [getCanvasCoords]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  }, [isDrawing, getCanvasCoords]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    setTypedSignature("");
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }
  }, [signatureMode, signingData]);

  const getSignatureData = (): string | null => {
    if (signatureMode === "type") {
      if (!typedSignature.trim()) return null;
      // Generate signature image from typed text
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 100);
      ctx.font = "italic 36px 'Georgia', 'Times New Roman', serif";
      ctx.fillStyle = "#1e293b";
      ctx.textBaseline = "middle";
      ctx.fillText(typedSignature, 20, 50);
      return canvas.toDataURL("image/png");
    } else {
      if (!hasSignature) return null;
      return canvasRef.current?.toDataURL("image/png") || null;
    }
  };

  const handleSubmit = async () => {
    if (!signerName.trim()) {
      alert("Please enter your full name");
      return;
    }

    const signatureData = getSignatureData();
    if (!signatureData) {
      alert("Please provide your signature");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/proposals/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          signerName: signerName.trim(),
          signerTitle: signerTitle.trim(),
          signerCompany: signerCompany.trim(),
          signatureData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to submit signature");
        return;
      }

      // Store signature data for potential payment redirect
      setSignatureData({
        hostingEnabled: data.hostingEnabled,
        monthlyFee: data.monthlyFee,
        clientName: data.clientName,
        signatureId: data.signatureId,
      });

      setIsComplete(true);
      setDownloadUrl(data.downloadUrl || "");
    } catch (err) {
      alert("Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#C8A951] mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            {alreadySigned ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Already Signed</h2>
                <p className="text-muted-foreground">This document has already been signed. Check your email for the signed copy.</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Unable to Load Document</h2>
                <p className="text-muted-foreground">{error}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isComplete) {
    // If hosting is enabled, show payment setup option
    if (signatureData.hostingEnabled && signatureData.monthlyFee && signatureData.monthlyFee > 0) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Document Signed Successfully!</h2>
              <p className="text-green-700 mb-4">
                Thank you, <strong>{signerName}</strong>. Your signature has been recorded.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-amber-800 mb-2">Monthly Payment Required</h3>
                <p className="text-sm text-amber-700 mb-2">
                  To complete your agreement setup, please setup your monthly recurring payment of:
                </p>
                <p className="text-2xl font-bold text-amber-900">${signatureData.monthlyFee.toFixed(2)}/month</p>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-[#C8A951] text-[#1e3a5f] hover:bg-[#b89a42] font-semibold"
                  onClick={() => {
                    // Redirect to payment setup
                    const params = new URLSearchParams({
                      signatureId: signatureData.signatureId || "",
                      email: signingData?.recipientEmail || "",
                      name: signerName,
                      amount: signatureData.monthlyFee?.toString() || "0",
                      agreement: signingData?.proposalName || "Agreement",
                    });
                    window.location.href = `/payment/setup?${params.toString()}`;
                  }}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Setup Monthly Payment
                </Button>
                
                {downloadUrl && (
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-5 w-5" />
                      Download Signed Document
                    </a>
                  </Button>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <Shield className="h-4 w-4 inline mr-1" />
                Your document is signed. Complete the payment setup to activate your services.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Standard success (no payment required)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Document Signed Successfully!</h2>
            <p className="text-green-700 mb-6">
              Thank you, <strong>{signerName}</strong>. Your signature has been recorded. A signed copy has been sent to your email.
            </p>
            {downloadUrl && (
              <Button asChild size="lg" className="bg-[#C8A951] text-[#1e3a5f] hover:bg-[#b89a42] font-semibold">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-5 w-5" />
                  Download Signed Document
                </a>
              </Button>
            )}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <Shield className="h-4 w-4 inline mr-1" />
              This electronic signature is legally binding under the ESIGN Act and UETA.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main signing view
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-6 px-6 shadow-lg border-b-4 border-[#C8A951]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="HubZone Council" width={50} height={50} className="rounded" />
            <div>
              <p className="font-bold text-lg">HubZone Council</p>
              <p className="text-xs text-gray-300">Secure Document Signing</p>
            </div>
          </div>
          <Badge className="bg-[#C8A951] text-[#1e3a5f] border-[#C8A951] font-semibold">
            <FileSignature className="h-4 w-4 mr-1" />
            Signature Required
          </Badge>
        </div>
      </header>

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 py-8 space-y-5">
        {/* Document Info */}
        <Card className="border border-slate-200 shadow-md border-t-4 border-t-[#C8A951]">
          <CardHeader className="pb-4 px-6 pt-6">
            <CardTitle className="text-2xl font-bold text-[#1e3a5f]">{signingData?.proposalName}</CardTitle>
            <CardDescription className="text-base flex items-center gap-2 flex-wrap">
              Sent by <strong className="text-slate-700">{signingData?.senderName}</strong>
              <span className="text-slate-400">&bull;</span>
              <Badge variant="outline" className="border-[#C8A951] text-[#1e3a5f] font-medium">{signingData?.proposalType}</Badge>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Document Preview */}
        <Card className="border border-slate-200 shadow-md">
          <CardHeader className="pb-3 px-6 pt-5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-[#C8A951]" />
              Document Preview
            </CardTitle>
            <CardDescription className="text-xs">Review the full document before signing</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[520px] rounded-lg border border-slate-200 bg-white shadow-inner">
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: signingData?.proposalHtml || "" }}
              />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Signer Information */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-4 px-6 pt-6 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[#1e3a5f]">Your Information</CardTitle>
                <CardDescription className="text-sm text-slate-500">Please confirm your details before signing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="John Smith"
                  className="h-10 border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951] bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Title</Label>
                <Input
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  placeholder="e.g., CEO, Director"
                  className="h-10 border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951] bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Company</Label>
                <Input
                  value={signerCompany}
                  onChange={(e) => setSignerCompany(e.target.value)}
                  placeholder="Company name"
                  className="h-10 border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951] bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Pad */}
        <Card className="border border-[#C8A951]/40 shadow-sm">
          <CardHeader className="pb-4 px-6 pt-6 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C8A951] flex items-center justify-center">
                  <span className="text-[#1e3a5f] text-xs font-bold">2</span>
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-[#1e3a5f]">Electronic Signature</CardTitle>
                  <CardDescription className="text-sm text-slate-500">Sign using your mouse, touchscreen, or type your name</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSignature}
                  className="border-slate-300 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Reset
                </Button>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                  <Button
                    size="sm"
                    variant={signatureMode === "draw" ? "default" : "ghost"}
                    onClick={() => { setSignatureMode("draw"); clearSignature(); }}
                    className={cn(
                      signatureMode === "draw"
                        ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    )}
                  >
                    <Pen className="h-3.5 w-3.5" />
                    Draw
                  </Button>
                  <Button
                    size="sm"
                    variant={signatureMode === "type" ? "default" : "ghost"}
                    onClick={() => { setSignatureMode("type"); clearSignature(); }}
                    className={cn(
                      signatureMode === "type"
                        ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Type
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-5">
            {signatureMode === "draw" ? (
              <div className="space-y-3">
                <div
                  className="relative border-2 border-dashed border-[#C8A951]/50 rounded-xl bg-white overflow-hidden hover:border-[#C8A951] transition-colors"
                  style={{ touchAction: "none" }}
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair"
                    style={{ height: "160px", display: "block" }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
                      <Pen className="h-6 w-6 text-slate-300" />
                      <p className="text-slate-400 text-sm font-medium">Click or touch to sign here</p>
                    </div>
                  )}
                  {/* Baseline */}
                  <div className="absolute bottom-10 left-6 right-6 border-b border-slate-200 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Type your full legal name</Label>
                  <Input
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="e.g., Jane Smith"
                    className="h-11 text-base border-slate-300 focus-visible:ring-[#C8A951] focus-visible:border-[#C8A951] bg-white"
                  />
                </div>
                {typedSignature && (
                  <div className="p-4 bg-white border border-[#C8A951]/40 rounded-md">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Signature Preview</p>
                    <p className="text-4xl italic font-serif text-[#1e3a5f] leading-tight">{typedSignature}</p>
                    <div className="mt-3 border-t border-slate-200" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="px-6 py-6 flex flex-col items-center gap-5">
            <div className="text-center max-w-md">
              <p className="text-sm text-slate-500 leading-relaxed">
                By clicking <strong className="text-slate-700">&quot;Sign Document&quot;</strong>, you agree that your electronic signature is the legal equivalent of your manual signature on this document.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full max-w-sm bg-[#C8A951] text-[#1e3a5f] hover:bg-[#b89a42] font-bold"
              onClick={handleSubmit}
              disabled={isSubmitting || !signerName.trim() || (signatureMode === "draw" ? !hasSignature : !typedSignature.trim())}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Signature...
                </>
              ) : (
                <>
                  <FileSignature className="mr-2 h-5 w-5" />
                  Sign Document
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
              <Shield className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span>Secured by Strategic Value+ &bull; ESIGN Act &amp; UETA Compliant</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white py-6 px-6 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Image src="/logo.jpg" alt="HubZone Council" width={30} height={30} className="rounded" />
            <p className="font-bold text-lg">HubZone Council</p>
          </div>
          <p className="text-sm text-gray-300 mb-1">Works for America</p>
          <p className="text-xs text-gray-400">Washington, DC</p>
          <p className="text-xs text-gray-400 mt-1">hubzonecouncil.org</p>
        </div>
      </footer>
    </div>
  );
}
