import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const venueSchema = z.object({
  conferenceId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  websiteUrl: z.string().optional(),
  bookingUrl: z.string().optional(),
  isPrimary: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  photoUrl: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  displayOrder: z.number().default(0),
});

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const snapshot = await adminDb.collection(COLLECTIONS.CONFERENCE_VENUES).orderBy("displayOrder", "asc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/venues:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = venueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid venue data", details: parsed.error.format() }, { status: 400 });
    }
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const now = Timestamp.now();
    const ref = adminDb.collection(COLLECTIONS.CONFERENCE_VENUES).doc();
    await ref.set({ ...parsed.data, createdAt: now, updatedAt: now });
    return NextResponse.json({ success: true, id: ref.id });
  } catch (error) {
    console.error("POST /api/conference/venues:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
