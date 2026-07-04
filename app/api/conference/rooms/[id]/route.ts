import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const updateSchema = z.object({
  venueId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  floor: z.string().optional(),
  capacity: z.number().optional(),
  roomType: z.enum(["ballroom", "breakout", "boardroom", "exhibit", "networking", "other"]).optional(),
  photoUrl: z.string().optional(),
  isPublic: z.boolean().optional(),
  displayOrder: z.number().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const snap = await adminDb.collection(COLLECTIONS.CONFERENCE_ROOMS).doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error("GET /api/conference/rooms/[id]:", error);
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
    await adminDb.collection(COLLECTIONS.CONFERENCE_ROOMS).doc(id).update({
      ...parsed.data,
      updatedAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/conference/rooms/[id]:", error);
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
    await adminDb.collection(COLLECTIONS.CONFERENCE_ROOMS).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conference/rooms/[id]:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
