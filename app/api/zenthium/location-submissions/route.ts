import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  company: z.string().optional().default(""),
});

const submissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  propertyName: z.string().min(1, "Property name is required"),

  address: z.object({
    street: z.string().optional().default(""),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().optional().default(""),
    country: z.string().optional().default("US"),
  }),

  coordinates: z.string().optional().default(""),
  parcelNumber: z.string().optional().default(""),
  acreage: z.number().optional(),
  squareFootage: z.number().optional(),
  powerCapacityMW: z.number().optional(),

  utilities: z.string().optional().default(""),
  fiberAvailability: z.string().optional().default(""),
  waterAvailability: z.string().optional().default(""),
  zoning: z.string().optional().default(""),

  ownership: z.string().optional().default(""),
  pricing: z.string().optional().default(""),
  timeline: z.string().optional().default(""),

  description: z.string().min(1, "Description is required"),
  environmentalNotes: z.string().optional().default(""),

  poc: contactSchema.optional().default({ name: "", email: "", phone: "", company: "" }),
  directContact: contactSchema.optional().default({ name: "", email: "", phone: "", company: "" }),
});

export async function GET() {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }
  try {
    const snap = await adminDb
      .collection(COLLECTIONS.ZENTHIUM_LOCATION_SUBMISSIONS)
      .orderBy("createdAt", "desc")
      .get();
    const submissions = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("[Zenthium] GET location-submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const d = parsed.data;
    const now = Timestamp.now();

    const docData = {
      ...d,
      status: "Submitted",
      adminNotes: "",
      source: "public_location_form",
      createdAt: now,
      updatedAt: now,
    };

    const ref = adminDb.collection(COLLECTIONS.ZENTHIUM_LOCATION_SUBMISSIONS).doc();
    await ref.set(docData);

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error) {
    console.error("[Zenthium] POST location submission error:", error);
    return NextResponse.json({ error: "Failed to submit location" }, { status: 500 });
  }
}
