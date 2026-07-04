import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const snap = await adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKERS).doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error("GET /api/conference/speakers/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const update: Record<string, unknown> = { ...body, updatedAt: Timestamp.now() };
    delete update.id;
    await adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKERS).doc(id).update(update);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("PATCH /api/conference/speakers/[id]:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    await adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKERS).doc(id).delete();
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("DELETE /api/conference/speakers/[id]:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
