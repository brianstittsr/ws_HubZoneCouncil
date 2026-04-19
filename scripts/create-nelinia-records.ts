/**
 * Create Team Member and User Profile records for Nelinia
 * 
 * Firebase Auth UID: fesjhO4peyRYLOU5muIEnrQQMKz2
 * Email: admin@hubzonecouncil.org
 */

import { initializeApp, getApps } from "firebase/app";
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
const db = getFirestore(app);

async function createNeliniaRecords() {
  const firebaseUid = "fesjhO4peyRYLOU5muIEnrQQMKz2";
  const email = "admin@hubzonecouncil.org";
  
  try {
    console.log("🔧 Creating Team Member and User Profile for Nelinia...");
    
    // Create Team Member record
    const teamMemberData = {
      firebaseUid: firebaseUid,
      firstName: "Nelinia",
      lastName: "Varenas",
      emailPrimary: email,
      emailSecondary: "neliniav@gmail.com",
      mobile: "(310) 650-0725",
      company: "Strategic Value Plus",
      title: "CEO",
      expertise: "CEO, Business Strategy",
      role: "admin" as const,
      status: "active" as const,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("📝 Creating Team Member record...");
    const teamMemberRef = await addDoc(collection(db, "teamMembers"), teamMemberData);
    console.log(`✅ Team Member created with ID: ${teamMemberRef.id}`);

    // Create User Profile record (omit null fields - Firestore doesn't accept null)
    const userProfileData = {
      id: firebaseUid,
      firebaseUid: firebaseUid,
      email: email,
      firstName: "Nelinia",
      lastName: "Varenas",
      phone: "(310) 650-0725",
      company: "Strategic Value Plus",
      jobTitle: "CEO",
      location: "",
      bio: "",
      avatarUrl: "",
      role: "admin" as const,
      isAffiliate: false,
      affiliateOnboardingComplete: false,
      affiliateAgreementSigned: false,
      affiliateAgreementDate: Timestamp.now(),
      networkingProfile: {
        expertise: ["CEO", "Business Strategy"],
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("📝 Creating User Profile record...");
    await setDoc(doc(db, "users", firebaseUid), userProfileData);
    console.log(`✅ User Profile created with ID: ${firebaseUid}`);

    console.log("\n🎉 Success! Nelinia's records have been created:");
    console.log(`   - Team Member ID: ${teamMemberRef.id}`);
    console.log(`   - User Profile ID: ${firebaseUid}`);
    console.log(`   - Email: ${email}`);
    console.log(`   - Role: admin`);
    console.log("\nNelinia can now log in successfully!");

  } catch (error) {
    console.error("❌ Error creating records:", error);
  }
}

createNeliniaRecords().then(() => process.exit(0));
