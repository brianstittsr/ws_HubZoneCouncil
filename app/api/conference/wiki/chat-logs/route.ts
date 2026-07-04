import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(_req: NextRequest) {
  try {
    if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const snap = await adminDb
      .collection(COLLECTIONS.CONFERENCE_CHAT_LOGS)
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/wiki/chat-logs:", error);
    return NextResponse.json({ error: "Failed to fetch chat logs" }, { status: 500 });
  }
}
