import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

const applicationSchema = z.object({
  conferenceId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().min(1),
  organization: z.string().min(1),
  bio: z.string().min(1),
  photoUrl: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  proposedSessionTitle: z.string().min(1),
  proposedSessionDescription: z.string().min(1),
  preferredTrack: z.string().optional(),
  sessionFormat: z.enum(["keynote", "panel", "workshop", "breakout", "lightning"]).optional(),
  coSpeakerNames: z.string().optional(),
  travelNeeds: z.string().optional(),
  avNeeds: z.string().optional(),
  availability: z.string().optional(),
});

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const snapshot = await adminDb
      .collection(COLLECTIONS.CONFERENCE_SPEAKER_APPLICATIONS)
      .orderBy("createdAt", "desc")
      .get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/speaker-applications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const now = Timestamp.now();
    const docRef = adminDb.collection(COLLECTIONS.CONFERENCE_SPEAKER_APPLICATIONS).doc();
    await docRef.set({
      ...data,
      email: data.email.toLowerCase(),
      status: "pending",
      adminNotes: "",
      speakerId: null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      applicationId: docRef.id,
      status: "pending",
    });
  } catch (error) {
    console.error("POST /api/conference/speaker-applications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
