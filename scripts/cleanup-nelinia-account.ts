/**
 * Cleanup Nelinia's Account
 * 
 * This script removes all existing records for Nelinia:
 * 1. Deletes Firebase Auth account (requires Admin SDK - manual step)
 * 2. Deletes Team Member records
 * 3. Deletes User Profile record
 * 
 * Note: Firebase Auth deletion requires Admin SDK or Firebase Console
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function cleanupNeliniaAccount() {
  const email = "admin@hubzonecouncil.org";
  let deletedCount = 0;
  
  try {
    console.log("🧹 Cleaning up Nelinia's account...");
    console.log(`   Email: ${email}\n`);
    
    // Delete Team Member records
    console.log("📋 Searching for Team Member records...");
    const teamMembersRef = collection(db, "teamMembers");
    const tmQuery = query(teamMembersRef, where("emailPrimary", "==", email));
    const tmSnapshot = await getDocs(tmQuery);
    
    if (!tmSnapshot.empty) {
      for (const docSnapshot of tmSnapshot.docs) {
        await deleteDoc(doc(db, "teamMembers", docSnapshot.id));
        console.log(`✅ Deleted Team Member: ${docSnapshot.id}`);
        deletedCount++;
      }
    } else {
      console.log("   No Team Member records found");
    }
    
    // Delete User Profile records (search by email)
    console.log("\n👤 Searching for User Profile records...");
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      for (const docSnapshot of userSnapshot.docs) {
        await deleteDoc(doc(db, "users", docSnapshot.id));
        console.log(`✅ Deleted User Profile: ${docSnapshot.id}`);
        deletedCount++;
      }
    } else {
      console.log("   No User Profile records found");
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Cleanup complete! Deleted ${deletedCount} Firestore records.`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n⚠️  MANUAL STEP REQUIRED:");
    console.log("To delete the Firebase Auth account:");
    console.log("1. Go to Firebase Console → Authentication");
    console.log("2. Find user: admin@hubzonecouncil.org");
    console.log("3. Click the three dots → Delete account");
    console.log("\nAfter deleting the Auth account, run:");
    console.log("npx tsx scripts/register-nelinia-admin.ts");

  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
  }
}

cleanupNeliniaAccount().then(() => process.exit(0));
