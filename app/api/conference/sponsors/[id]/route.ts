import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const snap = await getDoc(doc(db, COLLECTIONS.CONFERENCE_SPONSORS, id));
    if (!snap.exists()) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: { id: snap.id, ...snap.data() } });
  } catch (error) {
    console.error("GET /api/conference/sponsors/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const updates: Record<string, unknown> = { ...body, updatedAt: Timestamp.now() };
    if (body.contractSignedAt) updates.contractSignedAt = Timestamp.fromDate(new Date(body.contractSignedAt));
    if (body.paymentReceivedAt) updates.paymentReceivedAt = Timestamp.fromDate(new Date(body.paymentReceivedAt));
    await updateDoc(doc(db, COLLECTIONS.CONFERENCE_SPONSORS, id), updates);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("PATCH /api/conference/sponsors/[id]:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    await deleteDoc(doc(db, COLLECTIONS.CONFERENCE_SPONSORS, id));
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("DELETE /api/conference/sponsors/[id]:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
