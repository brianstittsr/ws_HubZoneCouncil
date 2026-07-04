import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    }
    const { id } = await params;
    const doc = await adminDb.collection(COLLECTIONS.CONFERENCE_SPONSOR_REQUESTS).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("GET /api/conference/sponsor-requests/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    }
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = { ...body, updatedAt: Timestamp.now() };
    delete update.id;
    await adminDb.collection(COLLECTIONS.CONFERENCE_SPONSOR_REQUESTS).doc(id).update(update);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("PATCH /api/conference/sponsor-requests/[id]:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    }
    const { id } = await params;
    await adminDb.collection(COLLECTIONS.CONFERENCE_SPONSOR_REQUESTS).doc(id).delete();
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("DELETE /api/conference/sponsor-requests/[id]:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
