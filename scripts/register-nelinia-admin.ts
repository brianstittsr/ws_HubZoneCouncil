/**
 * Register Nelinia as Admin
 * 
 * This script:
 * 1. Creates Firebase Auth account with email/password
 * 2. Creates Team Member record with admin role
 * 3. Creates User Profile record
 * 
 * Email: admin@hubzonecouncil.org
 * Password: SVP2026!!
 * Role: admin
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc, Timestamp } from "firebase/firestore";

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
const db = getFirestore(app);

async function registerNeliniaAdmin() {
  const email = "admin@hubzonecouncil.org";
  const password = "HZC2026!!";
  const firstName = "Nelinia";
  const lastName = "Varenas";
  
  try {
    console.log("🔐 Creating Firebase Auth account...");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUid = userCredential.user.uid;
    
    console.log(`✅ Firebase Auth account created!`);
    console.log(`   UID: ${firebaseUid}`);
    
    // Update display name
    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`,
    });
    console.log(`✅ Display name set to: ${firstName} ${lastName}`);
    
    // Create Team Member record
    console.log("\n📝 Creating Team Member record...");
    const teamMemberData = {
      firebaseUid: firebaseUid,
      firstName: firstName,
      lastName: lastName,
      emailPrimary: email,
      emailSecondary: "neliniav@gmail.com",
      mobile: "(310) 650-0725",
      company: "Strategic Value Plus",
      title: "CEO",
      expertise: "CEO, Business Strategy, Operations",
      role: "admin",
      status: "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const teamMemberRef = await addDoc(collection(db, "teamMembers"), teamMemberData);
    console.log(`✅ Team Member created with ID: ${teamMemberRef.id}`);

    // Create User Profile record
    console.log("\n📝 Creating User Profile record...");
    const userProfileData = {
      id: firebaseUid,
      firebaseUid: firebaseUid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: "(310) 650-0725",
      company: "Strategic Value Plus",
      jobTitle: "CEO",
      location: "Los Angeles, CA",
      bio: "CEO of HubZone Council with expertise in business strategy and operations.",
      avatarUrl: "",
      role: "admin",
      isAffiliate: false,
      affiliateOnboardingComplete: false,
      affiliateAgreementSigned: false,
      affiliateAgreementDate: Timestamp.now(),
      networkingProfile: {
        expertise: ["CEO", "Business Strategy", "Operations"],
        categories: ["Leadership", "Strategy"],
        idealReferralPartner: "",
        topReferralSources: "",
        goalsThisQuarter: "",
        uniqueValueProposition: "",
        targetClientProfile: "",
        problemsYouSolve: "",
        successStory: "",
        businessType: "Consulting",
        industry: ["Business Consulting", "Strategic Planning"],
        targetCustomers: "",
        servicesOffered: "",
        geographicFocus: ["California", "United States"],
        networkingGoals: [],
        meetingFrequency: "",
        availableDays: [],
        timePreference: "",
        communicationPreference: "email",
        lookingFor: [],
        canProvide: [],
        additionalNotes: "",
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", firebaseUid), userProfileData);
    console.log(`✅ User Profile created with ID: ${firebaseUid}`);

    console.log("\n🎉 SUCCESS! Nelinia's admin account has been created:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`🎭 Role: admin`);
    console.log(`🆔 Firebase UID: ${firebaseUid}`);
    console.log(`📋 Team Member ID: ${teamMemberRef.id}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✨ Nelinia can now log in at /sign-in");

  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.error("\n❌ ERROR: Email already in use!");
      console.error("Please run the cleanup script first to remove existing account:");
      console.error("npx tsx scripts/cleanup-nelinia-account.ts");
    } else {
      console.error("\n❌ Error creating account:", error);
    }
  }
}

registerNeliniaAdmin().then(() => process.exit(0));
