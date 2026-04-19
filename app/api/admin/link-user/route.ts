import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

/**
 * POST /api/admin/link-user
 * Links a Firebase Auth user to a team member profile and sets their role
 */
export async function POST(request: NextRequest) {
  try {
    const { email, firebaseUid, role } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);

    // Find team member by email
    const primaryQuery = query(
      teamMembersRef,
      where("emailPrimary", "==", normalizedEmail)
    );
    const primarySnapshot = await getDocs(primaryQuery);

    let teamMemberDoc = null;
    let teamMemberId = null;

    if (!primarySnapshot.empty) {
      teamMemberDoc = primarySnapshot.docs[0];
      teamMemberId = teamMemberDoc.id;
    } else {
      // Check secondary email
      const secondaryQuery = query(
        teamMembersRef,
        where("emailSecondary", "==", normalizedEmail)
      );
      const secondarySnapshot = await getDocs(secondaryQuery);

      if (!secondarySnapshot.empty) {
        teamMemberDoc = secondarySnapshot.docs[0];
        teamMemberId = teamMemberDoc.id;
      }
    }

    if (!teamMemberId) {
      return NextResponse.json(
        { error: `No team member found with email: ${email}` },
        { status: 404 }
      );
    }

    const teamMemberData = teamMemberDoc!.data();
    const memberName = `${teamMemberData.firstName || ""} ${teamMemberData.lastName || ""}`.trim();

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (firebaseUid) {
      updateData.firebaseUid = firebaseUid;
    }

    if (role) {
      updateData.role = role;
    }

    // Update the team member
    const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
    await updateDoc(teamMemberRef, updateData);

    return NextResponse.json({
      success: true,
      message: `Updated team member: ${memberName}`,
      teamMemberId,
      updates: {
        firebaseUid: firebaseUid || "not changed",
        role: role || "not changed",
      },
    });
  } catch (error: any) {
    console.error("Error linking user:", error);
    return NextResponse.json(
      {
        error: "Failed to link user",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
