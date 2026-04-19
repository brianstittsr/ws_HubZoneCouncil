/**
 * Create Firebase Auth User
 * 
 * This script creates a Firebase Authentication account for an existing Team Member
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

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
const auth = getAuth(app);

async function createAuthUser(email: string, password: string, displayName: string) {
  try {
    console.log(`🔐 Creating Firebase Auth account for ${email}...`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("✅ Firebase Auth account created!");
    console.log(`User ID: ${user.uid}`);
    console.log(`Email: ${user.email}`);
    
    // Update display name
    await updateProfile(user, {
      displayName: displayName,
    });
    
    console.log(`✅ Display name set to: ${displayName}`);
    console.log("\n📋 Next steps:");
    console.log("1. Update the Team Member record in Firestore");
    console.log(`2. Set firebaseUid field to: ${user.uid}`);
    console.log("3. User can now sign in with this email and password");
    
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("⚠️  Firebase Auth account already exists for this email");
      console.log("The user should use the 'Forgot Password' feature to reset their password");
    } else {
      console.error("❌ Error:", error);
    }
  }
}

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];
const displayName = process.argv[4];

if (!email || !password || !displayName) {
  console.log("Usage: npx tsx scripts/create-firebase-auth-user.ts <email> <password> <displayName>");
  console.log('Example: npx tsx scripts/create-firebase-auth-user.ts admin@hubzonecouncil.org "TempPass123!" "Admin User"');
  process.exit(1);
}

createAuthUser(email, password, displayName).then(() => process.exit(0));
