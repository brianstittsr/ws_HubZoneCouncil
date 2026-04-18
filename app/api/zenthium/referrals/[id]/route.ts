import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { sendStatusUpdateEmail } from "@/lib/zenthium/sendEmail";
import type { ZenthiumReferral, ZenthiumReferralStatus } from "@/types/zenthium";
import type { Timestamp as ClientTimestamp } from "firebase/firestore";
import { z } from "zod";

const VALID_STATUSES: ZenthiumReferralStatus[] = [
  "Submitted",
  "Under Review",
  "Screening Complete",
  "Follow-Up Requested",
  "Meeting Scheduled",
  "Accepted",
  "Declined",
  "Closed",
];

const patchSchema = z.object({
  status: z.enum(VALID_STATUSES as [ZenthiumReferralStatus, ...ZenthiumReferralStatus[]]).optional(),
  adminNotes: z.string().optional(),
  changedBy: z.string().optional(),
  note: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const { id } = await params;

  try {
    const docRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const data = snap.data()!;
    const referral = {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };

    const historySnap = await adminDb
      .collection(COLLECTIONS.ZENTHIUM_REFERRAL_STATUS_HISTORY)
      .where("referralId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const statusHistory = historySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    const meetingsSnap = await adminDb
      .collection(COLLECTIONS.ZENTHIUM_MEETINGS)
      .where("referralId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const meetings = meetingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ referral, statusHistory, meetings });
  } catch (error) {
    console.error("[Zenthium] GET referral error:", error);
    return NextResponse.json({ error: "Failed to fetch referral" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const { id } = await params;

  try {
    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const docRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const currentData = snap.data() as Omit<ZenthiumReferral, "id">;
    const now = Timestamp.now();
    const updates: Record<string, unknown> = { updatedAt: now };

    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.adminNotes !== undefined) updates.adminNotes = parsed.data.adminNotes;

    await docRef.update(updates);

    if (parsed.data.status && parsed.data.status !== currentData.status) {
      const historyRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRAL_STATUS_HISTORY).doc();
      await historyRef.set({
        referralId: id,
        previousStatus: currentData.status,
        newStatus: parsed.data.status,
        changedBy: parsed.data.changedBy ?? "system",
        note: parsed.data.note ?? "",
        createdAt: now,
      });

      const emailTarget = currentData.poc?.email;
      if (emailTarget) {
        const updatedReferral: ZenthiumReferral = {
          ...currentData,
          id,
          createdAt: currentData.createdAt as unknown as ClientTimestamp,
          updatedAt: now as unknown as ClientTimestamp,
        };
        sendStatusUpdateEmail(updatedReferral, parsed.data.status, emailTarget).catch(console.error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Zenthium] PATCH referral error:", error);
    return NextResponse.json({ error: "Failed to update referral" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  const { id } = await params;

  try {
    await adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Zenthium] DELETE referral error:", error);
    return NextResponse.json({ error: "Failed to delete referral" }, { status: 500 });
  }
}
