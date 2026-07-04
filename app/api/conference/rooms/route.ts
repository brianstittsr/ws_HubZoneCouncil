import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const roomSchema = z.object({
  conferenceId: z.string().min(1),
  venueId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  floor: z.string().optional(),
  capacity: z.number().optional(),
  roomType: z.enum(["ballroom", "breakout", "boardroom", "exhibit", "networking", "other"]).optional(),
  photoUrl: z.string().optional(),
  isPublic: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const snapshot = await adminDb.collection(COLLECTIONS.CONFERENCE_ROOMS).orderBy("displayOrder", "asc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/rooms:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = roomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid room data", details: parsed.error.format() }, { status: 400 });
    }
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const now = Timestamp.now();
    const ref = adminDb.collection(COLLECTIONS.CONFERENCE_ROOMS).doc();
    await ref.set({ ...parsed.data, createdAt: now, updatedAt: now });
    return NextResponse.json({ success: true, id: ref.id });
  } catch (error) {
    console.error("POST /api/conference/rooms:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
