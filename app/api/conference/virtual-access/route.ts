import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, where, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const conferenceId = req.nextUrl.searchParams.get("conferenceId");
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const attendeeEmail = req.nextUrl.searchParams.get("attendeeEmail");
    const col = collection(db, COLLECTIONS.CONFERENCE_VIRTUAL_ACCESS);

    let q = query(col, orderBy("createdAt", "desc"));
    if (conferenceId && sessionId) {
      q = query(col, where("conferenceId", "==", conferenceId), where("sessionId", "==", sessionId), orderBy("createdAt", "desc"));
    } else if (conferenceId) {
      q = query(col, where("conferenceId", "==", conferenceId), orderBy("createdAt", "desc"));
    } else if (attendeeEmail) {
      q = query(col, where("attendeeEmail", "==", attendeeEmail), orderBy("createdAt", "desc"));
    }

    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/virtual-access:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.CONFERENCE_VIRTUAL_ACCESS), {
      ...body,
      status: body.status ?? "active",
      sentAt: body.sentAt ? Timestamp.fromDate(new Date(body.sentAt)) : null,
      expiresAt: body.expiresAt ? Timestamp.fromDate(new Date(body.expiresAt)) : null,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/virtual-access:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
