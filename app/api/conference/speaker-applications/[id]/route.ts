import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const updateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "waitlisted"]).optional(),
  adminNotes: z.string().optional(),
  speakerId: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const snap = await adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKER_APPLICATIONS).doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error("GET /api/conference/speaker-applications/[id]:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const ref = adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKER_APPLICATIONS).doc(id);
    await ref.update({
      ...parsed.data,
      updatedAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/conference/speaker-applications/[id]:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    await adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKER_APPLICATIONS).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conference/speaker-applications/[id]:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
