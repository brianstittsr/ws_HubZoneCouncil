"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, CheckCircle, AlertCircle, Shield, Lock, User, Mail, Calendar } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Initialize Stripe only when a publishable key is available
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

function PaymentForm({
  clientSecret,
  customerEmail,
  customerName,
  monthlyAmount,
  agreementName,
  signatureId,
}: {
  clientSecret: string;
  customerEmail: string;
  customerName: string;
  monthlyAmount: number;
  agreementName: string;
  signatureId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment setup
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment setup failed");
        toast.error(error.message || "Payment setup failed");
        setIsProcessing(false);
        return;
      }

      if (setupIntent.status === "succeeded") {
        // Payment method saved successfully
        // Create the subscription
        const response = await fetch("/api/stripe/confirm-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: setupIntent.payment_method,
            customerEmail,
            customerName,
            monthlyAmount,
            agreementName,
            signatureId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Payment method saved and subscription created!");
          // Redirect to success page
          router.push(`/payment/success?signatureId=${signatureId}`);
        } else {
          setErrorMessage(result.error || "Failed to create subscription");
          toast.error(result.error || "Failed to create subscription");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-[#C8A951]" />
          Card Information
        </Label>
        <div className="p-4 border border-slate-300 rounded-md bg-white focus-within:border-[#C8A951] focus-within:ring-1 focus-within:ring-[#C8A951] transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "15px",
                  color: "#1e293b",
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  "::placeholder": { color: "#94a3b8" },
                },
                invalid: { color: "#dc2626" },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-md p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Monthly charge</span>
          <span className="text-xl font-bold text-[#1e3a5f]">${monthlyAmount.toFixed(2)}<span className="text-sm font-normal text-slate-500">/mo</span></span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">Billed automatically each month. Cancel anytime.</p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f] font-bold"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Authorize Monthly Payment
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Shield className="h-3.5 w-3.5 text-[#1e3a5f]" />
        <span>Secured by Stripe &bull; 256-bit SSL encryption</span>
      </div>
    </form>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-5 px-6 shadow-lg border-b-4 border-[#C8A951]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="HubZone Council" width={44} height={44} className="rounded" />
            <div>
              <p className="font-bold text-base leading-tight">HubZone Council</p>
              <p className="text-xs text-slate-300">Secure Payment Setup</p>
            </div>
          </div>
          <Badge className="bg-[#C8A951] text-[#1e3a5f] border-[#C8A951] font-semibold text-xs">
            <Lock className="h-3 w-3 mr-1" />
            SSL Secured
          </Badge>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-5">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1e3a5f] text-white py-5 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/logo.jpg" alt="HubZone Council" width={24} height={24} className="rounded" />
            <p className="font-bold text-sm">HubZone Council</p>
          </div>
          <p className="text-xs text-slate-400">Washington, DC &bull; hubzonecouncil.org</p>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#C8A951]" />
          <p className="text-slate-500 text-sm">Loading payment system...</p>
        </div>
      </PageShell>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signatureId = searchParams.get("signatureId");
  const customerEmail = searchParams.get("email");
  const customerName = searchParams.get("name");
  const monthlyAmount = parseFloat(searchParams.get("amount") || "0");
  const agreementName = searchParams.get("agreement") || "Agreement";

  useEffect(() => {
    if (!signatureId || !customerEmail || !monthlyAmount) {
      setError("Missing required payment information");
      setIsLoading(false);
      return;
    }

    // Create setup intent
    async function createSetupIntent() {
      try {
        const response = await fetch("/api/stripe/create-setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerEmail,
            customerName,
            signatureId,
          }),
        });

        const result = await response.json();

        if (result.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          setError(result.error || "Failed to initialize payment");
        }
      } catch (err) {
        console.error("Error creating setup intent:", err);
        setError("Failed to initialize payment system");
      } finally {
        setIsLoading(false);
      }
    }

    createSetupIntent();
  }, [signatureId, customerEmail, customerName, monthlyAmount]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#C8A951]" />
          <p className="text-slate-500 text-sm">Initializing secure payment...</p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <Card className="border border-slate-200 shadow-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Unable to Load Payment</h2>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Agreement summary card */}
      <Card className="border border-slate-200 shadow-md border-t-4 border-t-[#C8A951]">
        <CardHeader className="pb-4 px-6 pt-6">
          <CardTitle className="text-xl font-bold text-[#1e3a5f]">Setup Monthly Payment</CardTitle>
          <CardDescription className="text-sm">
            Complete your <strong className="text-slate-700">{agreementName}</strong> by authorizing your monthly subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="rounded-md border border-slate-200 bg-slate-50 divide-y divide-slate-200">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <User className="h-3.5 w-3.5" />
                Customer
              </span>
              <span className="text-sm font-medium text-slate-800">{customerName || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                Email
              </span>
              <span className="text-sm font-medium text-slate-800">{customerEmail}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-b-md">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                Billing
              </span>
              <span className="text-base font-bold text-[#1e3a5f]">${monthlyAmount.toFixed(2)}<span className="text-xs font-normal text-slate-500">/month</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment form card */}
      <Card className="border border-[#C8A951]/40 shadow-md">
        <CardHeader className="pb-4 px-6 pt-5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C8A951] flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5 text-[#1e3a5f]" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-[#1e3a5f]">Payment Details</CardTitle>
              <CardDescription className="text-xs">Your card is encrypted and never stored on our servers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-5">
          {clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                customerEmail={customerEmail!}
                customerName={customerName || customerEmail!}
                monthlyAmount={monthlyAmount}
                agreementName={agreementName}
                signatureId={signatureId!}
              />
            </Elements>
          ) : clientSecret && !stripePromise ? (
            <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 p-4 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Payment processing is not configured. Please contact Strategic Value+ to complete your payment setup.
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
              <p className="text-sm text-slate-500">Preparing secure payment form...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
