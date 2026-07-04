import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    }
    const conferenceId = req.nextUrl.searchParams.get("conferenceId");
    let q: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.CONFERENCE_SPONSOR_REQUESTS);
    if (conferenceId) {
      q = q.where("conferenceId", "==", conferenceId);
    }
    q = q.orderBy("createdAt", "desc");
    const snap = await q.get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/sponsor-requests:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    }
    const body = await req.json();
    const now = Timestamp.now();
    const docRef = await adminDb.collection(COLLECTIONS.CONFERENCE_SPONSOR_REQUESTS).add({
      ...body,
      status: body.status || "new",
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/sponsor-requests:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
