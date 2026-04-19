import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const { email, newRole } = await request.json();

    if (!email || !newRole) {
      return NextResponse.json(
        { error: "Email and newRole are required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Update team_members collection
    const teamSnapshot = await adminDb
      .collection(COLLECTIONS.TEAM_MEMBERS)
      .where("emailPrimary", "==", email)
      .get();

    let teamMemberUpdated = false;
    for (const docSnap of teamSnapshot.docs) {
      await docSnap.ref.update({ role: newRole });
      teamMemberUpdated = true;
      console.log(`Updated team member ${docSnap.id} role to ${newRole}`);
    }

    // Also update users collection if exists
    const usersSnapshot = await adminDb
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email)
      .get();

    let userUpdated = false;
    for (const docSnap of usersSnapshot.docs) {
      await docSnap.ref.update({ role: newRole });
      userUpdated = true;
      console.log(`Updated user ${docSnap.id} role to ${newRole}`);
    }

    if (!teamMemberUpdated && !userUpdated) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role updated to ${newRole} for ${email}`,
      teamMemberUpdated,
      userUpdated,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
