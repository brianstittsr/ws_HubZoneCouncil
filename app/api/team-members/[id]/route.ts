import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

// DELETE - Delete a team member (Firestore only, no Auth deletion)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Get the team member document
    const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, id);
    const teamMemberDoc = await getDoc(teamMemberRef);

    if (!teamMemberDoc.exists()) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    const teamMemberData = teamMemberDoc.data();
    const memberName = `${teamMemberData?.firstName || ""} ${teamMemberData?.lastName || ""}`.trim();

    // Delete the team member document
    await deleteDoc(teamMemberRef);
    console.log(`Deleted team member document: ${id}`);

    // Also delete any associated networking profile
    try {
      const networkingProfileRef = doc(db, "networkingProfiles", id);
      const networkingProfileDoc = await getDoc(networkingProfileRef);
      if (networkingProfileDoc.exists()) {
        await deleteDoc(networkingProfileRef);
        console.log(`Deleted networking profile for: ${id}`);
      }
    } catch (npError) {
      console.error("Error deleting networking profile:", npError);
      // Non-critical, continue
    }

    return NextResponse.json({
      success: true,
      message: `Team member ${memberName} deleted successfully`,
      teamMemberId: id,
      note: "Firebase Auth account was not deleted (requires Admin SDK). User may still be able to log in until their Auth account is manually removed.",
    });
  } catch (error: any) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      {
        error: "Failed to delete team member",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
