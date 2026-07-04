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
    const isActive = req.nextUrl.searchParams.get("isActive");
    let q: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.CONFERENCE_TICKETS);
    if (conferenceId) {
      q = q.where("conferenceId", "==", conferenceId);
    }
    if (isActive === "true") {
      q = q.where("isActive", "==", true);
    }
    q = q.orderBy("displayOrder", "asc");
    const snap = await q.get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/tickets:", error);
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
    const docRef = await adminDb.collection(COLLECTIONS.CONFERENCE_TICKETS).add({
      ...body,
      soldQuantity: body.soldQuantity ?? 0,
      isPublic: body.isPublic ?? true,
      isActive: body.isActive ?? true,
      currency: body.currency ?? "USD",
      displayOrder: body.displayOrder ?? 0,
      saleStartDate: body.saleStartDate ? Timestamp.fromDate(new Date(body.saleStartDate)) : undefined,
      saleEndDate: body.saleEndDate ? Timestamp.fromDate(new Date(body.saleEndDate)) : undefined,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ data: { id: docRef.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/tickets:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
