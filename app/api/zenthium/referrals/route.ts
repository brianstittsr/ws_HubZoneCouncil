import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { sendNewReferralEmail } from "@/lib/zenthium/sendEmail";
import type { ZenthiumReferral, ZenthiumReferralStatus } from "@/types/zenthium";
import type { Timestamp as ClientTimestamp } from "firebase/firestore";
import { z } from "zod";

const addressSchema = z.object({
  street: z.string().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().default(""),
  country: z.string().default("US"),
});

const contactSchema = z.object({
  name: z.string().default(""),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().default(""),
  company: z.string().default(""),
});

const referralSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  propertyName: z.string().min(1, "Property name is required"),
  address: addressSchema,
  coordinates: z.string().optional(),
  parcelNumber: z.string().optional(),
  acreage: z.number().optional(),
  squareFootage: z.number().optional(),
  powerCapacityMW: z.number().optional(),
  utilities: z.string().optional(),
  fiberAvailability: z.string().optional(),
  waterAvailability: z.string().optional(),
  zoning: z.string().optional(),
  ownership: z.string().optional(),
  pricing: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  environmentalNotes: z.string().optional(),
  timeline: z.string().optional(),
  poc: contactSchema,
  directContact: contactSchema,
});

export async function GET(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let query = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).orderBy("createdAt", "desc") as FirebaseFirestore.Query;

    if (userId) {
      query = query.where("userId", "==", userId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const referrals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error("[Zenthium] GET referrals error:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = referralSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const now = Timestamp.now();
    const docRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).doc();

    const referralData: Omit<ZenthiumReferral, "id"> = {
      ...parsed.data,
      status: "Submitted",
      createdAt: now as unknown as ClientTimestamp,
      updatedAt: now as unknown as ClientTimestamp,
    };

    await docRef.set(referralData);

    const historyRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRAL_STATUS_HISTORY).doc();
    await historyRef.set({
      referralId: docRef.id,
      previousStatus: null,
      newStatus: "Submitted" as ZenthiumReferralStatus,
      changedBy: parsed.data.userId,
      note: "Referral submitted",
      createdAt: now,
    });

    const fullReferral = { id: docRef.id, ...referralData } as ZenthiumReferral;
    sendNewReferralEmail(fullReferral).catch(console.error);

    return NextResponse.json({ id: docRef.id, success: true }, { status: 201 });
  } catch (error) {
    console.error("[Zenthium] POST referral error:", error);
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });
  }
}
