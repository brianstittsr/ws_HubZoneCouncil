import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } else {
      event = JSON.parse(payload) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const registrationId = session.metadata?.registrationId;
      if (!registrationId || !adminDb) return NextResponse.json({ received: true });

      const ref = adminDb.collection(COLLECTIONS.CONFERENCE_REGISTRATIONS).doc(registrationId);
      const snap = await ref.get();
      if (!snap.exists) return NextResponse.json({ received: true });

      await ref.update({
        status: "confirmed",
        stripePaymentIntentId: session.payment_intent as string,
        stripeCustomerId: session.customer as string,
        updatedAt: Timestamp.now(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("POST /api/conference/register/confirm:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");
    const registrationId = searchParams.get("registration");

    if (!sessionId || !registrationId || !adminDb) {
      return NextResponse.json({ error: "Missing session or registration" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const ref = adminDb.collection(COLLECTIONS.CONFERENCE_REGISTRATIONS).doc(registrationId);
      await ref.update({
        status: "confirmed",
        stripePaymentIntentId: session.payment_intent as string,
        stripeCustomerId: session.customer as string,
        updatedAt: Timestamp.now(),
      });
      return NextResponse.json({ success: true, status: "confirmed" });
    }

    return NextResponse.json({ success: true, status: "pending", paymentStatus: session.payment_status });
  } catch (error) {
    console.error("GET /api/conference/register/confirm:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
