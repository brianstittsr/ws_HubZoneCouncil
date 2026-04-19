/**
 * User-Team Member Sync Utilities
 * 
 * This module provides bidirectional sync between Users and Team Members collections.
 * Ensures data consistency across both collections when updates occur.
 */

import { 
  doc, 
  getDoc,
  setDoc,
  addDoc,
  updateDoc, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./schema";
import type { TeamMemberDoc } from "./schema";

/**
 * Field mapping between User Profile and Team Member
 */
interface UserToTeamMemberMapping {
  // User Profile field -> Team Member field
  firstName: "firstName";
  lastName: "lastName";
  email: "emailPrimary";
  phone: "mobile";
  company: "company";
  jobTitle: "title";
  location: "location";
  bio: "bio";
  avatarUrl: "avatar";
}

interface TeamMemberToUserMapping {
  // Team Member field -> User Profile field
  firstName: "firstName";
  lastName: "lastName";
  emailPrimary: "email";
  mobile: "phone";
  company: "company";
  title: "jobTitle";
  location: "location";
  bio: "bio";
  avatar: "avatarUrl";
}

/**
 * Sync User Profile changes to Team Member record
 * @param firebaseUid - Firebase Auth UID
 * @param userUpdates - Partial user profile updates
 * @returns Success status
 */
export async function syncUserToTeamMember(
  firebaseUid: string,
  userUpdates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Database not initialized" };
  }

  try {
    // Find Team Member by firebaseUid
    const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
    const q = query(teamMembersRef, where("firebaseUid", "==", firebaseUid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`No Team Member found for firebaseUid: ${firebaseUid}`);
      return { success: false, error: "Team Member not found" };
    }

    const teamMemberDoc = snapshot.docs[0];
    const teamMemberId = teamMemberDoc.id;

    // Map User Profile fields to Team Member fields
    const teamMemberUpdates: Record<string, any> = {};
    
    if (userUpdates.firstName !== undefined) teamMemberUpdates.firstName = userUpdates.firstName;
    if (userUpdates.lastName !== undefined) teamMemberUpdates.lastName = userUpdates.lastName;
    if (userUpdates.email !== undefined) teamMemberUpdates.emailPrimary = userUpdates.email;
    if (userUpdates.phone !== undefined) teamMemberUpdates.mobile = userUpdates.phone;
    if (userUpdates.company !== undefined) teamMemberUpdates.company = userUpdates.company;
    if (userUpdates.jobTitle !== undefined) teamMemberUpdates.title = userUpdates.jobTitle;
    if (userUpdates.location !== undefined) teamMemberUpdates.location = userUpdates.location;
    if (userUpdates.bio !== undefined) teamMemberUpdates.bio = userUpdates.bio;
    if (userUpdates.avatarUrl !== undefined) teamMemberUpdates.avatar = userUpdates.avatarUrl;
    
    // Map expertise from networking profile
    if (userUpdates.networkingProfile?.expertise) {
      teamMemberUpdates.expertise = Array.isArray(userUpdates.networkingProfile.expertise)
        ? userUpdates.networkingProfile.expertise.join(", ")
        : userUpdates.networkingProfile.expertise;
    }

    // Map role
    if (userUpdates.role !== undefined) {
      teamMemberUpdates.role = userUpdates.role === "team_member" ? "team" : userUpdates.role;
    }

    // Only update if there are changes
    if (Object.keys(teamMemberUpdates).length > 0) {
      teamMemberUpdates.updatedAt = Timestamp.now();
      
      const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
      await updateDoc(teamMemberRef, teamMemberUpdates);
      
      console.log(`Synced User Profile to Team Member ${teamMemberId}:`, teamMemberUpdates);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error syncing User to Team Member:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync Team Member changes to User Profile record
 * @param teamMemberId - Team Member document ID
 * @param teamMemberUpdates - Partial team member updates
 * @returns Success status
 */
export async function syncTeamMemberToUser(
  teamMemberId: string,
  teamMemberUpdates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "Database not initialized" };
  }

  try {
    // Get Team Member to find firebaseUid
    const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
    const teamMemberDoc = await getDoc(teamMemberRef);

    if (!teamMemberDoc.exists()) {
      return { success: false, error: "Team Member not found" };
    }

    const teamMemberData = teamMemberDoc.data();
    const firebaseUid = teamMemberData.firebaseUid;

    if (!firebaseUid) {
      console.warn(`Team Member ${teamMemberId} has no firebaseUid - cannot sync to User Profile`);
      return { success: false, error: "No firebaseUid linked" };
    }

    // Check if User Profile exists
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn(`No User Profile found for firebaseUid: ${firebaseUid}`);
      return { success: false, error: "User Profile not found" };
    }

    // Map Team Member fields to User Profile fields
    const userUpdates: Record<string, any> = {};
    
    if (teamMemberUpdates.firstName !== undefined) userUpdates.firstName = teamMemberUpdates.firstName;
    if (teamMemberUpdates.lastName !== undefined) userUpdates.lastName = teamMemberUpdates.lastName;
    if (teamMemberUpdates.emailPrimary !== undefined) userUpdates.email = teamMemberUpdates.emailPrimary;
    if (teamMemberUpdates.mobile !== undefined) userUpdates.phone = teamMemberUpdates.mobile;
    if (teamMemberUpdates.company !== undefined) userUpdates.company = teamMemberUpdates.company;
    if (teamMemberUpdates.title !== undefined) userUpdates.jobTitle = teamMemberUpdates.title;
    if (teamMemberUpdates.location !== undefined) userUpdates.location = teamMemberUpdates.location;
    if (teamMemberUpdates.bio !== undefined) userUpdates.bio = teamMemberUpdates.bio;
    if (teamMemberUpdates.avatar !== undefined) userUpdates.avatarUrl = teamMemberUpdates.avatar;
    
    // Map expertise to networking profile
    if (teamMemberUpdates.expertise !== undefined) {
      const currentUser = userDoc.data();
      userUpdates.networkingProfile = {
        ...(currentUser.networkingProfile || {}),
        expertise: teamMemberUpdates.expertise.split(",").map((e: string) => e.trim()).filter(Boolean),
      };
    }

    // Map role
    if (teamMemberUpdates.role !== undefined) {
      userUpdates.role = teamMemberUpdates.role === "team" ? "team_member" : teamMemberUpdates.role;
      userUpdates.isAffiliate = teamMemberUpdates.role === "affiliate" || teamMemberUpdates.role === "consultant";
    }

    // Only update if there are changes
    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updatedAt = Timestamp.now();
      
      await updateDoc(userRef, userUpdates);
      
      console.log(`Synced Team Member ${teamMemberId} to User Profile:`, userUpdates);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error syncing Team Member to User:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create both User Profile and Team Member records in sync
 * Used during initial registration
 */
export async function createSyncedUserAndTeamMember(data: {
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  expertise?: string;
  location?: string;
  bio?: string;
  linkedIn?: string;
  website?: string;
  role: "admin" | "team" | "affiliate" | "consultant";
  status?: "active" | "inactive" | "pending";
}): Promise<{ success: boolean; teamMemberId?: string; error?: string }> {
  if (!db) {
    return { success: false, error: "Database not initialized" };
  }

  try {
    // Create Team Member record
    const teamMemberData = {
      firebaseUid: data.firebaseUid,
      firstName: data.firstName,
      lastName: data.lastName,
      emailPrimary: data.email.toLowerCase(),
      mobile: data.phone || null,
      company: data.company || null,
      title: data.jobTitle || null,
      expertise: data.expertise || "",
      linkedIn: data.linkedIn || null,
      website: data.website || null,
      location: data.location || null,
      bio: data.bio || null,
      role: data.role,
      status: data.status || "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
    const teamMemberDocRef = await addDoc(teamMembersRef, teamMemberData);
    
    // Get the created document ID
    const teamMemberId = teamMemberDocRef.id;

    // Create User Profile record
    const userProfileData = {
      id: data.firebaseUid,
      firebaseUid: data.firebaseUid,
      email: data.email.toLowerCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || "",
      company: data.company || "",
      jobTitle: data.jobTitle || "",
      location: data.location || "",
      bio: data.bio || "",
      avatarUrl: "",
      role: data.role === "affiliate" || data.role === "consultant" ? "affiliate" : "team_member",
      isAffiliate: data.role === "affiliate" || data.role === "consultant",
      affiliateOnboardingComplete: false,
      affiliateAgreementSigned: false,
      affiliateAgreementDate: null,
      networkingProfile: {
        expertise: data.expertise ? [data.expertise] : [],
        categories: [],
        idealReferralPartner: "",
        topReferralSources: "",
        goalsThisQuarter: "",
        uniqueValueProposition: "",
        targetClientProfile: "",
        problemsYouSolve: "",
        successStory: "",
        businessType: "",
        industry: [],
        targetCustomers: "",
        servicesOffered: "",
        geographicFocus: [],
        networkingGoals: [],
        meetingFrequency: "",
        availableDays: [],
        timePreference: "",
        communicationPreference: "",
        lookingFor: [],
        canProvide: [],
        additionalNotes: "",
      },
      profileCompletedAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS, data.firebaseUid), userProfileData);

    console.log(`Created synced records - Team Member: ${teamMemberId}, User: ${data.firebaseUid}`);

    return { success: true, teamMemberId };
  } catch (error: any) {
    console.error("Error creating synced records:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Team Member ID from firebaseUid
 */
export async function getTeamMemberIdByFirebaseUid(
  firebaseUid: string
): Promise<string | null> {
  if (!db) return null;

  try {
    const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
    const q = query(teamMembersRef, where("firebaseUid", "==", firebaseUid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return snapshot.docs[0].id;
  } catch (error) {
    console.error("Error getting Team Member ID:", error);
    return null;
  }
}
