import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const submissionSchema = z.object({
  submitterName: z.string().min(1, "Name is required"),
  submitterEmail: z.string().email("Valid email is required"),
  submitterPhone: z.string().optional(),
  submitterCompany: z.string().optional(),

  propertyName: z.string().min(1, "Property name is required"),
  propertyType: z.enum(["vacant_land", "warehouse", "industrial", "office", "data_center", "power_plant", "other"]),
  propertyTypeOther: z.string().optional(),

  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().optional(),
  country: z.string().default("US"),

  squareFootage: z.number().min(10000, "Minimum 10,000 sq ft required"),
  acreage: z.number().optional(),

  powerAvailableMW: z.number().min(20, "Minimum 20 MW required"),
  powerType: z.enum(["grid", "behind_meter", "renewable", "combined", "unknown"]).optional(),
  hasBackupPower: z.boolean().optional(),

  ceilingHeightFt: z.number().optional(),
  isSingleStory: z.boolean(),
  isFloor: z.boolean(),

  fiberAvailable: z.boolean().optional(),
  fiberProviders: z.string().optional(),

  waterAvailable: z.boolean().optional(),
  waterSource: z.string().optional(),

  coolingCapacity: z.string().optional(),
  hvacInstalled: z.boolean().optional(),

  zoningClassification: z.string().optional(),
  isZonedIndustrial: z.boolean().optional(),

  ownershipType: z.enum(["own", "lease", "option", "other"]).optional(),
  askingPrice: z.string().optional(),
  leaseRate: z.string().optional(),
  timeline: z.string().optional(),

  environmentalClearance: z.enum(["clean", "phase1_done", "phase2_done", "unknown", "issues"]).optional(),
  floodZone: z.boolean().optional(),

  coordinates: z.string().optional(),
  additionalNotes: z.string().optional(),
});

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

    const now = Timestamp.now();
    const ref = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).doc();

    await ref.set({
      ...parsed.data,
      source: "public_location_form",
      status: "Submitted",
      createdAt: now,
      updatedAt: now,
      userId: "public",
      title: `${parsed.data.propertyName} — ${parsed.data.city}, ${parsed.data.state}`,
      description: parsed.data.additionalNotes ?? "",
      poc: {
        name: parsed.data.submitterName,
        email: parsed.data.submitterEmail,
        phone: parsed.data.submitterPhone ?? "",
        company: parsed.data.submitterCompany ?? "",
      },
      directContact: { name: "", email: "", phone: "", company: "" },
    });

    const historyRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRAL_STATUS_HISTORY).doc();
    await historyRef.set({
      referralId: ref.id,
      previousStatus: null,
      newStatus: "Submitted",
      changedBy: parsed.data.submitterEmail,
      note: "Submitted via public location form",
      createdAt: now,
    });

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error) {
    console.error("[Zenthium] POST location submission error:", error);
    return NextResponse.json({ error: "Failed to submit location" }, { status: 500 });
  }
}
