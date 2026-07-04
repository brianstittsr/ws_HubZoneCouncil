import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const snapshot = await adminDb
      .collection(COLLECTIONS.CONFERENCE_REGISTRATIONS)
      .orderBy("createdAt", "desc")
      .get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/registrations:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
