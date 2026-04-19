import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "email and role are required" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let teamMemberUpdated = false;
    let userProfileUpdated = false;
    let teamMemberId = null;
    let firebaseUid = null;

    // Find the team member by emailPrimary
    let snapshot = await adminDb
      .collection(COLLECTIONS.TEAM_MEMBERS)
      .where("emailPrimary", "==", normalizedEmail)
      .get();

    // If not found, try email field
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

      // Update the Team Member role
      await teamMemberDoc.ref.update({
        role: role,
        isAffiliate: role === "affiliate",
        updatedAt: Timestamp.now(),
      });
      teamMemberUpdated = true;
      console.log(`Updated Team Member ${teamMemberId} role to: ${role}`);
    }

    // Also update the User Profile if we have a firebaseUid
    if (firebaseUid) {
      await adminDb.collection(COLLECTIONS.USERS).doc(firebaseUid).update({
        role: role,
        isAffiliate: role === "affiliate",
        updatedAt: Timestamp.now(),
      });
      userProfileUpdated = true;
      console.log(`Updated User Profile ${firebaseUid} role to: ${role}`);
    } else {
      // Try to find User Profile by email
      const userSnapshot = await adminDb
        .collection(COLLECTIONS.USERS)
        .where("email", "==", normalizedEmail)
        .get();
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({
          role: role,
          isAffiliate: role === "affiliate",
          updatedAt: Timestamp.now(),
        });
        userProfileUpdated = true;
        console.log(`Updated User Profile ${userDoc.id} role to: ${role}`);
      }
    }

    if (!teamMemberUpdated && !userProfileUpdated) {
      return NextResponse.json({ error: `No team member or user found with email: ${email}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${email} to role: ${role}`,
      teamMemberId,
      teamMemberUpdated,
      userProfileUpdated,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
