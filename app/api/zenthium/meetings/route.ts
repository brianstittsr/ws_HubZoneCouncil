import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { createZoomMeeting } from "@/lib/zenthium/zoom";
import { sendMeetingScheduledEmail } from "@/lib/zenthium/sendEmail";
import type { ZenthiumReferral, ZenthiumMeeting } from "@/types/zenthium";
import type { Timestamp as ClientTimestamp } from "firebase/firestore";
import { z } from "zod";

const meetingSchema = z.object({
  referralId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  agenda: z.string().optional(),
  createdBy: z.string().min(1),
});

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = meetingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const referralSnap = await adminDb
      .collection(COLLECTIONS.ZENTHIUM_REFERRALS)
      .doc(parsed.data.referralId)
      .get();

    if (!referralSnap.exists) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const startTime = `${parsed.data.date}T${parsed.data.time}:00`;
    const zoomResult = await createZoomMeeting({
      topic: parsed.data.title,
      startTime,
      agenda: parsed.data.agenda,
    });

    const now = Timestamp.now();
    const meetingRef = adminDb.collection(COLLECTIONS.ZENTHIUM_MEETINGS).doc();

    const meetingData: Omit<ZenthiumMeeting, "id"> = {
      referralId: parsed.data.referralId,
      title: parsed.data.title,
      date: parsed.data.date,
      time: parsed.data.time,
      agenda: parsed.data.agenda,
      zoomMeetingId: zoomResult.meetingId,
      zoomJoinUrl: zoomResult.joinUrl,
      zoomStartUrl: zoomResult.startUrl,
      createdBy: parsed.data.createdBy,
      createdAt: now as unknown as ClientTimestamp,
    };

    await meetingRef.set(meetingData);

    await adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRALS).doc(parsed.data.referralId).update({
      status: "Meeting Scheduled",
      updatedAt: now,
    });

    const historyRef = adminDb.collection(COLLECTIONS.ZENTHIUM_REFERRAL_STATUS_HISTORY).doc();
    await historyRef.set({
      referralId: parsed.data.referralId,
      previousStatus: referralSnap.data()?.status,
      newStatus: "Meeting Scheduled",
      changedBy: parsed.data.createdBy,
      note: `Meeting scheduled: ${parsed.data.title}`,
      createdAt: now,
    });

    const referralData = referralSnap.data() as Omit<ZenthiumReferral, "id">;
    const fullReferral: ZenthiumReferral = {
      ...referralData,
      id: parsed.data.referralId,
      createdAt: referralData.createdAt as unknown as ClientTimestamp,
      updatedAt: now as unknown as ClientTimestamp,
    };
    const fullMeeting: ZenthiumMeeting = { id: meetingRef.id, ...meetingData };

    const recipients = [referralData.poc?.email, referralData.directContact?.email].filter(Boolean);
    recipients.forEach((email) => {
      sendMeetingScheduledEmail(fullReferral, fullMeeting, email).catch(console.error);
    });

    return NextResponse.json({ id: meetingRef.id, zoomJoinUrl: zoomResult.joinUrl }, { status: 201 });
  } catch (error) {
    console.error("[Zenthium] POST meeting error:", error);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
