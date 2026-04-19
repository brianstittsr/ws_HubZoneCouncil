import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const q = query(collection(db, COLLECTIONS.CONFERENCE_ABOUT), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/about:", error);
    return NextResponse.json({ error: "Failed to fetch conferences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.CONFERENCE_ABOUT), {
      ...body,
      startDate: body.startDate ? Timestamp.fromDate(new Date(body.startDate)) : now,
      endDate: body.endDate ? Timestamp.fromDate(new Date(body.endDate)) : now,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/about:", error);
    return NextResponse.json({ error: "Failed to create conference" }, { status: 500 });
  }
}
