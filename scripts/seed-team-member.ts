import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

/**
 * One-time script to create a team member record for the logged-in admin user.
 *
 * Usage:
 *   npx tsx scripts/seed-team-member.ts
 *
 * Edit the values below before running.
 */

const TEAM_MEMBER = {
  firebaseUid: "LLbWgG0cxuQ3IuJe3vB7OMWEzfr1",
  firstName: "Brian",
  lastName: "Stitt",
  emailPrimary: "bstitt@strategicvalueplus.com",
  title: "Administrator",
  company: "Strategic Value Plus",
  expertise: "",
  role: "admin" as const,
  status: "active" as const,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

async function main() {
  if (!adminDb) {
    console.error("Firebase Admin SDK not initialized. Check your environment variables.");
    process.exit(1);
  }

  const existing = await adminDb
    .collection(COLLECTIONS.TEAM_MEMBERS)
    .where("emailPrimary", "==", TEAM_MEMBER.emailPrimary)
    .limit(1)
    .get();

  if (!existing.empty) {
    const docId = existing.docs[0].id;
    await adminDb.collection(COLLECTIONS.TEAM_MEMBERS).doc(docId).update({
      ...TEAM_MEMBER,
      updatedAt: Timestamp.now(),
    });
    console.log(`Updated existing team member: ${docId}`);
  } else {
    const docRef = await adminDb.collection(COLLECTIONS.TEAM_MEMBERS).add(TEAM_MEMBER);
    console.log(`Created team member: ${docRef.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
