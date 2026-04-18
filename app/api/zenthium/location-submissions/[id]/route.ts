import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const patchSchema = z.object({
  submitterName: z.string().optional(),
  submitterEmail: z.string().email().optional(),
  submitterPhone: z.string().optional(),
  submitterCompany: z.string().optional(),
  propertyName: z.string().optional(),
  propertyType: z.enum(["vacant_land", "warehouse", "industrial", "office", "data_center", "power_plant", "other"]).optional(),
  propertyTypeOther: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  squareFootage: z.number().optional(),
  acreage: z.number().optional(),
  powerAvailableMW: z.number().optional(),
  powerType: z.enum(["grid", "behind_meter", "renewable", "combined", "unknown"]).optional(),
  hasBackupPower: z.boolean().optional(),
  ceilingHeightFt: z.number().optional(),
  isSingleStory: z.boolean().optional(),
  isFloor: z.boolean().optional(),
  fiberAvailable: z.boolean().optional(),
  fiberProviders: z.string().optional(),
  waterAvailable: z.boolean().optional(),
  waterSource: z.string().optional(),
  coolingCapacity: z.string().optional(),
  hvacInstalled: z.boolean().optional(),
  zoningClassification: z.string().optional(),
  ownershipType: z.enum(["own", "lease", "option", "other"]).optional(),
  askingPrice: z.string().optional(),
  leaseRate: z.string().optional(),
  timeline: z.string().optional(),
  environmentalClearance: z.enum(["clean", "phase1_done", "phase2_done", "unknown", "issues"]).optional(),
  floodZone: z.boolean().optional(),
  coordinates: z.string().optional(),
  additionalNotes: z.string().optional(),
  directContactId: z.string().optional(),
  directContactName: z.string().optional(),
  directContactEmail: z.string().optional(),
  directContactPhone: z.string().optional(),
  directContactCompany: z.string().optional(),
  status: z.string().optional(),
  adminNotes: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDb) return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  const { id } = await params;
  try {
    const doc = await adminDb.collection(COLLECTIONS.ZENTHIUM_LOCATION_SUBMISSIONS).doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      submission: {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate().toISOString(),
        updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Zenthium] GET location-submission by id error:", error);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDb) return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  const { id } = await params;
  try {
    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    await adminDb
      .collection(COLLECTIONS.ZENTHIUM_LOCATION_SUBMISSIONS)
      .doc(id)
      .update({ ...parsed.data, updatedAt: Timestamp.now() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Zenthium] PATCH location-submission error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDb) return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  const { id } = await params;
  try {
    await adminDb.collection(COLLECTIONS.ZENTHIUM_LOCATION_SUBMISSIONS).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Zenthium] DELETE location-submission error:", error);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}
