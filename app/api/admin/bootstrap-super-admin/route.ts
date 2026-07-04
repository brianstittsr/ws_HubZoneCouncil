import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;

    if (!email || !secret) {
      return NextResponse.json(
        { error: "email and secret are required" },
        { status: 400 }
      );
    }

    const setupSecret = process.env.SUPER_ADMIN_SETUP_SECRET;
    if (!setupSecret) {
      return NextResponse.json(
        { error: "SUPER_ADMIN_SETUP_SECRET is not configured" },
        { status: 500 }
      );
    }

    if (secret !== setupSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let teamMemberUpdated = false;
    let userProfileUpdated = false;
    let teamMemberId: string | null = null;
    let firebaseUid: string | null = null;

    // Find team member by email
    let snapshot = await adminDb
      .collection(COLLECTIONS.TEAM_MEMBERS)
      .where("emailPrimary", "==", normalizedEmail)
      .get();

    if (snapshot.empty) {
      snapshot = await adminDb
        .collection(COLLECTIONS.TEAM_MEMBERS)
        .where("email", "==", normalizedEmail)
        .get();
    }

    if (!snapshot.empty) {
      const teamMemberDoc = snapshot.docs[0];
      teamMemberId = teamMemberDoc.id;
      const teamMemberData = teamMemberDoc.data();
      firebaseUid = teamMemberData.firebaseUid;

      await teamMemberDoc.ref.update({
        role: "superadmin",
        isAffiliate: false,
        updatedAt: Timestamp.now(),
      });
      teamMemberUpdated = true;
    }

    // Update user profile
    if (firebaseUid) {
      await adminDb.collection(COLLECTIONS.USERS).doc(firebaseUid).update({
        role: "superadmin",
        isAffiliate: false,
        updatedAt: Timestamp.now(),
      });
      userProfileUpdated = true;
    } else {
      const userSnapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .where("email", "==", normalizedEmail)
        .get();
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({
          role: "superadmin",
          isAffiliate: false,
          updatedAt: Timestamp.now(),
        });
        userProfileUpdated = true;
      }
    }

    if (!teamMemberUpdated && !userProfileUpdated) {
      return NextResponse.json(
        { error: `No team member or user found with email: ${email}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Upgraded ${email} to superadmin`,
      teamMemberId,
      teamMemberUpdated,
      userProfileUpdated,
    });
  } catch (error) {
    console.error("Bootstrap superadmin error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade account" },
      { status: 500 }
    );
  }
}
