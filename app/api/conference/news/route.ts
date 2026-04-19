import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, where, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const conferenceId = req.nextUrl.searchParams.get("conferenceId");
    const col = collection(db, COLLECTIONS.CONFERENCE_NEWS);
    const q = conferenceId
      ? query(col, where("conferenceId", "==", conferenceId), orderBy("createdAt", "desc"))
      : query(col, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/news:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.CONFERENCE_NEWS), {
      ...body,
      isPublished: body.isPublished ?? false,
      isFeatured: body.isFeatured ?? false,
      publishedAt: body.isPublished ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/news:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
