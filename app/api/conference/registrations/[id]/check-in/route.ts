import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const regRef = adminDb.collection(COLLECTIONS.CONFERENCE_REGISTRATIONS).doc(id);
    const regSnap = await regRef.get();
    if (!regSnap.exists) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    const reg = regSnap.data();
    const now = Timestamp.now();
    await regRef.update({
      status: "checked-in",
      checkedInAt: now,
      updatedAt: now,
    });
    const checkInRef = adminDb.collection(COLLECTIONS.CONFERENCE_CHECK_INS).doc();
    await checkInRef.set({
      conferenceId: reg?.conferenceId,
      registrationId: id,
      attendeeEmail: reg?.email,
      attendeeName: `${reg?.firstName} ${reg?.lastName}`,
      ticketName: reg?.ticketName,
      checkedInAt: now,
      createdAt: now,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/conference/registrations/[id]/check-in:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
