import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const registrationSchema = z.object({
  conferenceId: z.string().min(1),
  ticketId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  isMember: z.boolean().optional(),
  couponCode: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, { apiVersion: "2026-01-28.clover" });
}

function getDiscountedPrice(basePrice: number, couponCode?: string): number {
  if (!couponCode) return basePrice;
  const normalized = couponCode.trim().toUpperCase();
  if (normalized === "EARLYBIRD") return Math.max(0, basePrice - 50);
  if (normalized === "GROUP10") return Math.max(0, basePrice * 0.9);
  return basePrice;
}

const eventDetails = {
  name: "HUBZone on the Rise 2026",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const stripe = getStripe();

    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const ticketRef = adminDb.collection(COLLECTIONS.CONFERENCE_TICKETS).doc(data.ticketId);
    const ticketSnap = await ticketRef.get();
    if (!ticketSnap.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    const ticket = ticketSnap.data();
    if (!ticket) {
      return NextResponse.json({ error: "Ticket data missing" }, { status: 404 });
    }

    const basePrice = typeof ticket.price === "number" ? ticket.price : 0;
    const amountPaid = getDiscountedPrice(basePrice, data.couponCode);
    const currency = (ticket.currency as string) || "usd";
    const ticketName = (ticket.name as string) || "Conference Registration";

    const now = Timestamp.now();
    const registrationRef = adminDb.collection(COLLECTIONS.CONFERENCE_REGISTRATIONS).doc();
    const registrationData = {
      conferenceId: data.conferenceId,
      ticketId: data.ticketId,
      ticketName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      organization: data.organization || null,
      title: data.title || null,
      dietaryRestrictions: data.dietaryRestrictions || null,
      accessibilityNeeds: data.accessibilityNeeds || null,
      isMember: data.isMember ?? false,
      couponCode: data.couponCode || null,
      discountAmount: basePrice - amountPaid,
      amountPaid,
      currency,
      status: "pending",
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      stripeCustomerId: null,
      createdAt: now,
      updatedAt: now,
    };
    await registrationRef.set(registrationData);

    if (amountPaid === 0) {
      await registrationRef.update({ status: "confirmed", updatedAt: Timestamp.now() });
      return NextResponse.json({
        success: true,
        registrationId: registrationRef.id,
        amountPaid: 0,
        status: "confirmed",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: ticketName,
              description: `${eventDetails.name} - ${ticketName}`,
            },
            unit_amount: Math.round(amountPaid * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}&registration=${registrationRef.id}`,
      cancel_url: `${data.cancelUrl}?registration=${registrationRef.id}`,
      metadata: {
        registrationId: registrationRef.id,
        conferenceId: data.conferenceId,
        ticketId: data.ticketId,
        email: data.email,
      },
    });

    await registrationRef.update({
      stripeCheckoutSessionId: session.id,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      registrationId: registrationRef.id,
      amountPaid,
      status: "pending",
    });
  } catch (error) {
    console.error("POST /api/conference/register:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create registration", details: message }, { status: 500 });
  }
}
