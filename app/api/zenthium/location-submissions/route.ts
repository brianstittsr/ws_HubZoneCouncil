import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const submissionSchema = z.object({
  submitterName: z.string().min(1, "Name is required"),
  submitterEmail: z.string().email("Valid email is required"),
  submitterPhone: z.string().optional().default(""),
  submitterCompany: z.string().optional().default(""),

  propertyName: z.string().min(1, "Property name is required"),
  propertyType: z.enum(["vacant_land", "warehouse", "industrial", "office", "data_center", "power_plant", "other"]),
  propertyTypeOther: z.string().optional().default(""),

  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().optional().default(""),
  country: z.string().default("US"),

  squareFootage: z.number().min(10000, "Minimum 10,000 sq ft required"),
  acreage: z.number().optional(),

  powerAvailableMW: z.number().min(20, "Minimum 20 MW required"),
  powerType: z.enum(["grid", "behind_meter", "renewable", "combined", "unknown"]).optional(),
  hasBackupPower: z.boolean().optional().default(false),

  ceilingHeightFt: z.number().optional(),
  isSingleStory: z.boolean().default(true),
  isFloor: z.boolean().default(true),

  fiberAvailable: z.boolean().optional().default(false),
  fiberProviders: z.string().optional().default(""),

  waterAvailable: z.boolean().optional().default(false),
  waterSource: z.string().optional().default(""),

  coolingCapacity: z.string().optional().default(""),
  hvacInstalled: z.boolean().optional().default(false),

  zoningClassification: z.string().optional().default(""),

  ownershipType: z.enum(["own", "lease", "option", "other"]).optional(),
  askingPrice: z.string().optional().default(""),
  leaseRate: z.string().optional().default(""),
  timeline: z.string().optional().default(""),

  environmentalClearance: z.enum(["clean", "phase1_done", "phase2_done", "unknown", "issues"]).optional(),
  floodZone: z.boolean().optional().default(false),

  coordinates: z.string().optional().default(""),
  additionalNotes: z.string().optional().default(""),

  directContactId: z.string().optional().default(""),
  directContactName: z.string().optional().default(""),
  directContactEmail: z.string().optional().default(""),
  directContactPhone: z.string().optional().default(""),
  directContactCompany: z.string().optional().default(""),
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
