/**
 * Fix Nelinia's Account
 * 
 * This script:
 * 1. Finds Nelinia's Team Member record with the typo email
 * 2. Updates the email to the correct one
 * 3. Links it to the existing Firebase Auth account
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

async function fixNeliniaAccount() {
  try {
    console.log("🔍 Searching for Nelinia's Team Member record with typo email...");
    
    // Find the record with the typo email
    const teamMembersRef = collection(db, "team_members");
    const typoQuery = query(
      teamMembersRef,
      where("emailPrimary", "==", "nelinia@stategicvalueplus.com")
    );
    const typoSnapshot = await getDocs(typoQuery);
    
    if (typoSnapshot.empty) {
      console.log("❌ No Team Member found with typo email nelinia@stategicvalueplus.com");
      console.log("Checking if correct email already exists...");
      
      const correctQuery = query(
        teamMembersRef,
        where("emailPrimary", "==", "nelinia@strategicvalueplus.com")
      );
      const correctSnapshot = await getDocs(correctQuery);
      
      if (!correctSnapshot.empty) {
        const teamMember = correctSnapshot.docs[0];
        const data = teamMember.data();
        console.log("✅ Found Team Member with correct email:", data);
        
        if (data.firebaseUid) {
          console.log("✅ Already linked to Firebase Auth UID:", data.firebaseUid);
        } else {
          console.log("⚠️  Not linked to Firebase Auth yet");
          console.log("You'll need to provide the Firebase Auth UID to link it");
        }
      } else {
        console.log("❌ No Team Member found with either email");
      }
      return;
    }
    
    const teamMemberDoc = typoSnapshot.docs[0];
    const teamMemberId = teamMemberDoc.id;
    const currentData = teamMemberDoc.data();
    
    console.log("✅ Found Team Member:", {
      id: teamMemberId,
      name: `${currentData.firstName} ${currentData.lastName}`,
      currentEmail: currentData.emailPrimary,
      firebaseUid: currentData.firebaseUid || "Not linked"
    });
    
    // Update the email to the correct one
    console.log("\n📝 Updating email to admin@hubzonecouncil.org...");
    const teamMemberRef = doc(db, "team_members", teamMemberId);
    await updateDoc(teamMemberRef, {
      emailPrimary: "admin@hubzonecouncil.org",
      updatedAt: Timestamp.now(),
    });
    
    console.log("✅ Email updated successfully!");
    
    // Now check if there's a Firebase Auth account with the correct email
    console.log("\n🔍 Checking for Firebase Auth account with admin@hubzonecouncil.org...");
    console.log("⚠️  Note: We cannot query Firebase Auth by email from client SDK");
    console.log("You'll need to:");
    console.log("1. Go to Firebase Console > Authentication");
    console.log("2. Find the user with email admin@hubzonecouncil.org");
    console.log("3. Copy their UID");
    console.log("4. Run this script again with the UID to link the accounts");
    
    console.log("\n✅ Email fix complete!");
    console.log("Next steps:");
    console.log("1. Get Firebase Auth UID from Firebase Console");
    console.log("2. Link it to the Team Member record using the linkAuthToTeamMember function");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// If Firebase UID is provided as argument, link it
async function linkFirebaseUid(firebaseUid: string) {
  try {
    console.log(`🔗 Linking Firebase UID ${firebaseUid} to Nelinia's Team Member record...`);
    
    const teamMembersRef = collection(db, "team_members");
    const emailQuery = query(
      teamMembersRef,
      where("emailPrimary", "==", "nelinia@strategicvalueplus.com")
    );
    const snapshot = await getDocs(emailQuery);
    
    if (snapshot.empty) {
      console.log("❌ No Team Member found with email admin@hubzonecouncil.org");
      return;
    }
    
    const teamMemberDoc = snapshot.docs[0];
    const teamMemberId = teamMemberDoc.id;
    
    const teamMemberRef = doc(db, "team_members", teamMemberId);
    await updateDoc(teamMemberRef, {
      firebaseUid: firebaseUid,
      updatedAt: Timestamp.now(),
    });
    
    console.log("✅ Successfully linked Firebase Auth UID to Team Member!");
    console.log(`Team Member ID: ${teamMemberId}`);
    console.log(`Firebase UID: ${firebaseUid}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Main execution
const firebaseUid = process.argv[2];

if (firebaseUid) {
  console.log("Running with Firebase UID:", firebaseUid);
  linkFirebaseUid(firebaseUid).then(() => process.exit(0));
} else {
  console.log("Running email fix...");
  fixNeliniaAccount().then(() => process.exit(0));
}
